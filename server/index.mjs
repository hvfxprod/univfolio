import { authService, identityProvider } from './auth.mjs';
import { httpUrl, videoEmbed, validPeriod } from '../src/utils/media.mjs';
import { createServer } from 'node:http';
import { DatabaseSync } from 'node:sqlite';
import { mkdirSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';

const dbPath = resolve(process.env.DB_PATH || 'data/univfolio.sqlite');
mkdirSync(dirname(dbPath), { recursive: true });
const db = new DatabaseSync(dbPath);
db.exec(`PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000;
 CREATE TABLE IF NOT EXISTS records (kind TEXT NOT NULL, id TEXT NOT NULL, data TEXT NOT NULL, PRIMARY KEY(kind,id));
 CREATE TABLE IF NOT EXISTS meta (key TEXT PRIMARY KEY, value TEXT);
 CREATE TABLE IF NOT EXISTS likes (project TEXT, actor TEXT, PRIMARY KEY(project,actor));
 CREATE TABLE IF NOT EXISTS applications (job TEXT, actor TEXT, portfolio TEXT, created TEXT, PRIMARY KEY(job,actor));`);
const get = (kind, id) => { const row = db.prepare('SELECT data FROM records WHERE kind=? AND id=?').get(kind,id); return row ? JSON.parse(row.data) : null; };
const all = kind => db.prepare('SELECT data FROM records WHERE kind=? ORDER BY rowid DESC').all(kind).map(row => JSON.parse(row.data));
const put = (kind, item) => db.prepare('INSERT INTO records VALUES (?,?,?) ON CONFLICT(kind,id) DO UPDATE SET data=excluded.data').run(kind,item.id,JSON.stringify(item));
const fail = (message,status=400) => { throw Object.assign(new Error(message),{ status }); };
const required = (kind,id) => get(kind,id) || fail('자료를 찾을 수 없습니다.',404);
const transaction = fn => { db.exec('BEGIN IMMEDIATE'); try { const result=fn(); db.exec('COMMIT'); return result; } catch(e) { db.exec('ROLLBACK'); throw e; } };
if (!db.prepare("SELECT 1 FROM meta WHERE key='initialized'").get()) transaction(() => {
  const seed = JSON.parse(readFileSync(new URL('./seed.json',import.meta.url),'utf8'));
  for (const [kind,items] of Object.entries(seed)) for (const item of items) put(kind,{ ...item, revision: 1 });
  db.prepare('INSERT INTO meta VALUES (?,?)').run('initialized','1');
});
const text = z.string().max(100000);
const id = z.string().min(1).max(200);
const profile = z.object({ id, realName:text, studentId:text, university:text, department:text, matriculationYear:text, status:z.enum(['재학생','졸업생','수료생','휴학생']), isVerified:z.boolean(), avatarUrl:z.string().max(1000000), bio:text, links:z.object({ email:text }).passthrough() }).passthrough();
const project = z.object({ id, title:z.string().trim().min(1).max(500), subtitle:text, category:text, projectType:text, coverImageUrl:z.string().max(8000000), author:profile, createdAt:text, views:z.number().nonnegative(), likes:z.number().nonnegative(), tags:z.array(text).max(100), toolsUsed:z.array(text).max(100), period:text, teamInfo:text, summary:text, blocks:z.array(z.object({id,type:z.enum(['text','image','quote','two_column','divider','video','link']),content:text.optional(),title:text.optional(),imageUrl:z.string().max(8000000).optional(),caption:text.optional()}).passthrough()).max(200), links:z.object({}).passthrough(),comments:z.array(z.object({id,author:profile,content:text,createdAt:text})),isPublished:z.boolean(),revision:z.number().int().optional() }).passthrough();
const job = z.object({ id,title:text,company:text,location:text,jobType:text,category:text,postedByAlumni:z.object({name:text,department:text,matriculationYear:text,currentPosition:text}),description:text,requirements:z.array(text),preferredQualifications:z.array(text),benefits:z.array(text),deadline:text,isReferralAvailable:z.boolean(),applicantsCount:z.number().nonnegative() }).passthrough();
const scout = z.object({id,sender:profile,receiverStudentId:text,targetPortfolioId:id,targetPortfolioTitle:text,company:text,offerType:text,message:text,contactEmail:text,sentAt:text,status:z.enum(['대기중','수락','조율중'])}).passthrough();
const schemas={projects:project,jobs:job,scouts:scout,profiles:profile};
const auth=authService(db);
const own=(account,p)=>account.role==='admin'||p.author.id===account.id;
const readable=(account,p)=>p.isPublished||own(account,p);
const currentProfile=p=>get('profiles',p.id)||p;
const publicProfile=p=>({...currentProfile(p),studentId:'',links:{...currentProfile(p).links,email:''},isVerified:false});
const state = account => ({projects:all('projects').filter(p=>readable(account,p)).map(p=>({...p,author:own(account,p)?currentProfile(p.author):publicProfile(p.author),comments:p.comments.map(c=>({...c,author:publicProfile(c.author)})),likedByMe:!!db.prepare('SELECT 1 FROM likes WHERE project=? AND actor=?').get(p.id,account.id)})),jobs:all('jobs'),scouts:all('scouts').filter(s=>account.role==='admin'||s.sender.id===account.id||s.receiverUserId===account.id).map(s=>({...s,sender:publicProfile(s.sender)})),profiles:[auth.profile(account.id)]});
async function body(req) {
  if (!(req.headers['content-type'] || '').startsWith('application/json')) fail('JSON 요청이 필요합니다.',415);
  let size=0; const chunks=[];
  const maxSize=req.url.startsWith('/api/auth/')||req.url.startsWith('/api/admin/')?16384:40*1024*1024;
  for await(const chunk of req) { size+=chunk.length; if(size>maxSize) fail('요청 용량이 너무 큽니다.',413); chunks.push(chunk); }
  try { return JSON.parse(Buffer.concat(chunks).toString()); } catch { fail('JSON 형식이 잘못되었습니다.'); }
}
const server = createServer(async(req,res) => {
  const send=(status,data)=>{res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});res.end(JSON.stringify(data));};
  try {
    const url=new URL(req.url,'http://localhost');
    if(req.method==='GET' && url.pathname==='/api/health') { db.prepare('SELECT 1').get(); return send(200,{ok:true}); }
    const account=auth.session(req);
    if(req.method==='GET' && url.pathname==='/api/auth/me') { if(!account) fail('로그인이 필요합니다.',401); return send(200,auth.me(account)); }
    if(req.method==='POST') auth.origin(req);
    if(req.method==='POST' && (url.pathname.startsWith('/api/auth/')||url.pathname==='/api/admin/review')) return send(200,await auth.route(req,res,url.pathname,await body(req),account));
    if(!account) fail('로그인이 필요합니다.',401);
    const actor=account.id;
    if(req.method==='GET' && url.pathname==='/api/admin/users') { if(account.role!=='admin') fail('관리자 권한이 필요합니다.',403); return send(200,{users:auth.users(),identityProvider}); }
    if(req.method==='POST') auth.guard(req,account);
    if(req.method==='GET' && url.pathname==='/api/state') return send(200,state(account));
    if(req.method!=='POST' || url.pathname!=='/api/action') return send(404,{error:'Not found'});
    const input=await body(req);
    const result=transaction(()=>{
      const {action,kind,item,id:recordId}=input;
      if(action==='save') {
        if(!schemas[kind]) fail('지원하지 않는 자료 유형입니다.');
        const valid=schemas[kind].parse(item);
        if(kind === 'projects') {
          if(valid.actionLinks !== undefined) valid.actionLinks = z.array(z.object({ id, label:z.string().trim().min(1).max(100), url:z.string().refine(value=>!!httpUrl(value)) })).max(30).parse(valid.actionLinks);
          if(valid.periodRange !== undefined) { valid.periodRange=z.object({precision:z.enum(['month','day']),start:z.string(),end:z.string()}).parse(valid.periodRange); if(!validPeriod(valid.periodRange)) fail('제작 기간이 올바르지 않습니다.'); }
          if(valid.blocks.some(b=>b.type==='link' && (typeof b.linkUrl !== 'string' || !httpUrl(b.linkUrl)))) fail('올바른 웹 주소가 필요합니다.');
          if(valid.blocks.some(b=>b.type==='video' && !videoEmbed(typeof b.videoUrl === 'string' ? b.videoUrl : ''))) fail('올바른 영상 주소가 필요합니다.');
        }
        const previous=get(kind,valid.id);
        if(kind==='profiles') {
          if(valid.id!==actor) fail('본인 프로필만 변경할 수 있습니다.',403);
          if(valid.avatarUrl && !/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/]+={0,2}$/.test(valid.avatarUrl) && !httpUrl(valid.avatarUrl)) fail('올바른 프로필 이미지가 필요합니다.');
          const canonical=auth.profile(actor);
          put(kind,{...canonical,bio:valid.bio,avatarUrl:valid.avatarUrl,links:{...valid.links,email:canonical.links.email}});
          return state(account);
        }
        if(kind==='projects') {
          if(previous && !own(account,previous)) fail('본인 작품만 변경할 수 있습니다.',403);
          valid.author=previous?previous.author:auth.profile(actor);
          if(!previous) {valid.views=0;valid.likes=0;valid.comments=[];}
        }
        if(kind==='jobs') {
          if(previous && account.role!=='admin' && previous.ownerId!==actor) fail('본인 공고만 변경할 수 있습니다.',403);
          valid.ownerId=previous?.ownerId||actor; valid.applicantsCount=previous?.applicantsCount||0;
          const me=auth.profile(actor); valid.postedByAlumni={...valid.postedByAlumni,name:me.realName,department:me.department,matriculationYear:me.matriculationYear};
        }
        if(kind==='scouts') {
          if(previous) fail('기존 제안은 덮어쓸 수 없습니다.',403);
          const target=required('projects',valid.targetPortfolioId);
          if(!readable(account,target)) fail('작품을 볼 수 없습니다.',403);
          valid.sender=auth.profile(actor);valid.receiverUserId=target.author.id;valid.receiverStudentId='';valid.targetPortfolioTitle=target.title;valid.status='대기중';
        }
        if(kind==='projects' && previous && valid.revision!==previous.revision) fail('다른 창에서 작품이 변경되었습니다. 내용을 복사한 뒤 새로고침해 다시 편집해 주세요.',409);
        put(kind,{...valid,...(kind==='projects'&&previous ? {views:previous.views,likes:previous.likes,comments:previous.comments} : {}),revision:(previous?.revision||0)+1});
      } else if(action==='import') {
        if(account.role!=='admin') fail('관리자만 이전 자료를 가져올 수 있습니다.',403);
        let imported=0;
        for(const k of ['projects','jobs','scouts']) {
          const rows=z.array(schemas[k]).max(1000).parse(input[k]||[]);
          for(const row of rows) { if(!get(k,row.id)) { put(k,{...row,revision:1}); imported++; } }
        }
        return { ...state(account), imported };
      } else if(action==='delete') {
        if(!own(account,required('projects',id.parse(recordId)))) fail('본인 작품만 삭제할 수 있습니다.',403);
        db.prepare('DELETE FROM records WHERE kind=? AND id=?').run('projects',recordId);
        db.prepare('DELETE FROM likes WHERE project=?').run(recordId);
      } else if(['view','like','publish','comment'].includes(action)) {
        const p=required('projects',id.parse(recordId));
        if(!readable(account,p) || (action==='publish' && !own(account,p))) fail('작품 접근 권한이 없습니다.',403);
        if(action==='view') p.views++;
        if(action==='publish') { p.isPublished=!p.isPublished; p.revision=(p.revision||0)+1; }
        if(action==='comment') p.comments.unshift({id:randomUUID(),author:auth.profile(actor),content:z.string().trim().min(1).max(10000).parse(input.content),createdAt:new Date().toISOString().slice(0,10)});
        if(action==='like') {
          const exists=db.prepare('SELECT 1 FROM likes WHERE project=? AND actor=?').get(recordId,actor);
          if(exists) db.prepare('DELETE FROM likes WHERE project=? AND actor=?').run(recordId,actor);
          else db.prepare('INSERT INTO likes VALUES (?,?)').run(recordId,actor);
          p.likes=Math.max(0,p.likes+(exists?-1:1));
        }
        put('projects',p);
      } else if(action==='apply') {
        const j=required('jobs',id.parse(recordId)); if(!own(account,required('projects',id.parse(input.portfolioId)))) fail('본인 작품으로 지원해 주세요.',403);
        const inserted=db.prepare('INSERT OR IGNORE INTO applications VALUES (?,?,?,?)').run(recordId,actor,input.portfolioId,new Date().toISOString());
        if(inserted.changes) { j.applicantsCount++; put('jobs',j); }
      } else if(action==='scoutStatus') {
        const s=required('scouts',id.parse(recordId)); if(account.role!=='admin' && s.receiverUserId!==actor) fail('수신자만 응답할 수 있습니다.',403); s.status=z.enum(['대기중','수락','조율중']).parse(input.status); put('scouts',s);
      } else fail('지원하지 않는 작업입니다.');
      return state(account);
    });
    send(200,result);
  } catch(e) { const status=e instanceof z.ZodError ? 400 : e.status || 500; if(status===500) console.error(e); send(status,{error:status===500?'DB 처리에 실패했습니다. 서버 상태를 확인해 주세요.':e instanceof z.ZodError?'자료 형식이 잘못되었습니다.':e.message}); }
});
server.listen(Number(process.env.API_PORT||3001),'0.0.0.0',()=>console.log(`API ready on ${process.env.API_PORT||3001}`));
for(const signal of ['SIGTERM','SIGINT']) process.on(signal,()=>server.close(()=>{db.close();process.exit(0);}));
