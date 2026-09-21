import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { createInterface } from 'node:readline/promises';
import { Writable } from 'node:stream';
import { initAuth, createAccount } from './auth.mjs';
const path=resolve(process.env.DB_PATH||'data/univfolio.sqlite');
mkdirSync(dirname(path),{recursive:true});
const db=new DatabaseSync(path); initAuth(db);
let hidden=false;
const output=new Writable({write(chunk,encoding,done){if(!hidden) process.stdout.write(chunk,encoding);done();}});
const rl=createInterface({input:process.stdin,output,terminal:true});
try {
  if(!process.stdin.isTTY) throw new Error('대화형 터미널에서 실행해 주세요.');
  if(db.prepare("SELECT 1 FROM accounts WHERE role='admin'").get()) throw new Error('관리자 계정이 이미 있습니다.');
  const email=await rl.question('관리자 이메일: '),realName=await rl.question('관리자 이름: ');
  process.stdout.write('비밀번호 (12자 이상, 입력 숨김): '); hidden=true;
  const password=await rl.question(''); hidden=false; process.stdout.write('\n비밀번호 확인: '); hidden=true;
  const confirmation=await rl.question(''); hidden=false; process.stdout.write('\n');
  if(password!==confirmation) throw new Error('비밀번호가 일치하지 않습니다.');
  await createAccount(db,{email,password,realName,studentId:'admin',department:'운영',status:'졸업생'},true);
  console.log('관리자 생성 완료. 웹사이트에서 로그인해 주세요.');
} catch(e) {hidden=false;console.error(e.message);process.exitCode=1;} finally {rl.close();db.close();}
