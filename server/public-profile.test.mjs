import test from 'node:test';
import assert from 'node:assert/strict';
import { sharedProfile, sharedProjects } from './public-profile.mjs';

test('shared profiles exclude private identity, contact, and unknown fields',()=>{
  const user={id:'a',realName:'Artist',studentId:'secret',matriculationYear:'secret',password:'secret',links:{email:'secret',website:'https://example.com',github:'javascript:alert(1)'},contact:{email:'secret',phone:'secret',isPublic:false}};
  const result=sharedProfile(user);
  assert.equal(JSON.stringify(result).includes('secret'),false);
  assert.equal(result.links.github,undefined);
  assert.equal(result.links.website,'https://example.com/');
  assert.equal(sharedProfile({...user,contact:{email:'public@example.com',phone:'123',isPublic:true}}).contact.email,'public@example.com');
});
test('shared projects only expose owner published work, without comments or internal fields',()=>{
  const user={id:'a',links:{}};
  const make=(id,author,published)=>({id,author:{id:author},isPublished:published,comments:[{content:'private'}],revision:4});
  const result=sharedProjects([make('yes','a',true),make('draft','a',false),make('other','b',true)],user);
  assert.deepEqual(result.map(p=>p.id),['yes']);
  assert.equal(result[0].comments,undefined);
  assert.equal(result[0].revision,undefined);
});
