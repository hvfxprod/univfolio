import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { once } from 'node:events';

test('DB persistence, concurrent updates, revisions, validation and import', async () => {
  const folder=mkdtempSync(join(tmpdir(),'univfolio-api-'));
  const port=String(19000+Math.floor(Math.random()*10000));
  let child;
  async function start() {
    child=spawn(process.execPath,['server/index.mjs'],{env:{...process.env,API_PORT:port,DB_PATH:join(folder,'db.sqlite')},stdio:['ignore','pipe','pipe']});
    for(let i=0;i<100;i++) { if(child.exitCode!==null) throw new Error('API failed to start'); try { if((await fetch(`http://127.0.0.1:${port}/api/health`)).ok) return; } catch {} await new Promise(r=>setTimeout(r,50)); }
    throw new Error('API startup timeout');
  }
  async function stop() { const done=once(child,'exit'); child.kill(); await done; }
  async function request(payload, actor='test-user') {
    const response=await fetch(`http://127.0.0.1:${port}/api/${payload?'action':'state'}`,{method:payload?'POST':'GET',headers:{'Content-Type':'application/json','X-Demo-User':actor},...(payload?{body:JSON.stringify(payload)}:{})});
    return {status:response.status,data:await response.json()};
  }
  try {
    await start();
    const initial=(await request()).data;
    const project={...initial.projects[0],id:'test-project',title:'Persisted image project',revision:undefined,coverImageUrl:'data:image/png;base64,aGVsbG8='};
    assert.equal((await request({action:'save',kind:'projects',item:project})).status,200);
    await stop(); await start();
    let saved=(await request()).data.projects.find(p=>p.id===project.id);
    assert.equal(saved.coverImageUrl,project.coverImageUrl);
    const views=saved.views;
    await Promise.all(Array.from({length:10},()=>request({action:'view',id:project.id})));
    saved=(await request()).data.projects.find(p=>p.id===project.id);
    assert.equal(saved.views,views+10);
    assert.equal((await request({action:'save',kind:'projects',item:{...saved,title:'New title'}})).status,200);
    assert.equal((await request({action:'save',kind:'projects',item:saved})).status,409);
    const liked=(await request({action:'like',id:project.id})).data.projects.find(p=>p.id===project.id);
    assert.equal(liked.likedByMe,true);
    assert.equal((await request(undefined,'other-user')).data.projects.find(p=>p.id===project.id).likedByMe,false);
    assert.equal((await request({action:'save',kind:'projects',item:{id:'invalid'}})).status,400);
    const importItem={...project,id:'imported-project'};
    assert.equal((await request({action:'import',projects:[importItem]})).data.imported,1);
    assert.equal((await request({action:'import',projects:[importItem]})).data.imported,0);
    const badImport=await request({action:'import',projects:[{...project,id:'rollback-project'}],jobs:[{id:'bad'}]});
    assert.equal(badImport.status,400);
    assert.equal((await request()).data.projects.some(p=>p.id==='rollback-project'),false);
    const job=initial.jobs[0];
    await Promise.all([request({action:'apply',id:job.id,portfolioId:project.id}),request({action:'apply',id:job.id,portfolioId:project.id})]);
    assert.equal((await request()).data.jobs.find(j=>j.id===job.id).applicantsCount,job.applicantsCount+1);
    await request({action:'delete',id:project.id});
    await stop(); await start();
    assert.equal((await request()).data.projects.some(p=>p.id===project.id),false);
    assert.equal((await request()).data.projects.some(p=>p.id==='imported-project'),true);
  } finally { if(child && child.exitCode===null) await stop(); rmSync(folder,{recursive:true,force:true}); }
});
