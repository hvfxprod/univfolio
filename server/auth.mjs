import { randomBytes, randomUUID, scrypt as scryptCallback, timingSafeEqual, createHash } from 'node:crypto';
import { promisify } from 'node:util';
import { z } from 'zod';
import { identityProvider, initIdentityStore } from './identity-provider.mjs';
export { identityProvider };
const scrypt = promisify(scryptCallback);
const fail = (message, status=400) => { throw Object.assign(new Error(message), {status}); };
const digest = value => createHash('sha256').update(value).digest('hex');
// Future school adapters must resolve a verified external subject to an account ID.
// Never grant approval from client-supplied academic information or an email domain.
const signup = z.object({email:z.string().trim().email().max(254).transform(v=>v.toLowerCase()),password:z.string().min(12).max(128),realName:z.string().trim().min(1).max(80),studentId:z.string().trim().min(1).max(40),department:z.string().trim().min(1).max(100),matriculationYear:z.string().max(20).default(''),status:z.enum(['재학생','졸업생','수료생','휴학생']).default('재학생')});
export function initAuth(db) {
  initIdentityStore(db);
  db.exec(`CREATE TABLE IF NOT EXISTS accounts (id TEXT PRIMARY KEY,email TEXT UNIQUE NOT NULL,password TEXT NOT NULL,role TEXT NOT NULL,status TEXT NOT NULL,created TEXT NOT NULL,reviewed TEXT,reviewer TEXT,reason TEXT NOT NULL DEFAULT '');
    CREATE TABLE IF NOT EXISTS sessions (token TEXT PRIMARY KEY,account TEXT NOT NULL,csrf TEXT NOT NULL,expires INTEGER NOT NULL);
    CREATE TABLE IF NOT EXISTS auth_limits (key TEXT PRIMARY KEY,count INTEGER NOT NULL,expires INTEGER NOT NULL);
    CREATE TABLE IF NOT EXISTS auth_audit (id TEXT PRIMARY KEY,actor TEXT NOT NULL,target TEXT NOT NULL,action TEXT NOT NULL,reason TEXT NOT NULL,created TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS records (kind TEXT NOT NULL,id TEXT NOT NULL,data TEXT NOT NULL,PRIMARY KEY(kind,id));`);
}
async function hash(password) { const salt=randomBytes(16).toString('hex'); return `${salt}:${Buffer.from(await scrypt(password,salt,64,{N:32768,r:8,p:3,maxmem:64*1024*1024})).toString('hex')}`; }
async function check(password, stored) { const [salt,key]=stored.split(':'); const actual=await scrypt(password,salt,64,{N:32768,r:8,p:3,maxmem:64*1024*1024}); return timingSafeEqual(Buffer.from(key,'hex'),actual); }
export async function createAccount(db,input,admin=false) {
  const data=signup.parse(input);
  if(db.prepare('SELECT id FROM accounts WHERE email=?').get(data.email)) fail('이미 가입 신청한 이메일입니다.',409);
  const password=await hash(data.password), id=randomUUID();
  const profile={id,realName:data.realName,studentId:data.studentId,university:'서울예술대학교',department:data.department,matriculationYear:data.matriculationYear,status:data.status,isVerified:false,avatarUrl:'',bio:'',links:{email:data.email}};
  db.exec('BEGIN IMMEDIATE');
  try {
    if(admin && db.prepare("SELECT 1 FROM accounts WHERE role='admin'").get()) fail('관리자 계정이 이미 있습니다.');
    if(db.prepare('SELECT id FROM accounts WHERE email=?').get(data.email)) fail('이미 가입 신청한 이메일입니다.',409);
    db.prepare('INSERT INTO accounts (id,email,password,role,status,created) VALUES (?,?,?,?,?,?)').run(id,data.email,password,admin?'admin':'member',admin?'approved':'pending',new Date().toISOString());
    db.prepare('INSERT INTO records VALUES (?,?,?)').run('profiles',id,JSON.stringify(profile));
    db.exec('COMMIT');
  } catch(e) { db.exec('ROLLBACK'); throw e; }
  return id;
}
export function authService(db) {
  initAuth(db);
  const profile = id => JSON.parse(db.prepare("SELECT data FROM records WHERE kind='profiles' AND id=?").get(id).data);
  const cookie=(res,token,maxAge)=>res.setHeader('Set-Cookie',`univfolio_session=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${process.env.COOKIE_SECURE==='true'?'; Secure':''}`);
  const session=req=>{
    const token=(req.headers.cookie||'').split(';').map(s=>s.trim()).find(s=>s.startsWith('univfolio_session='))?.slice(18);
    if(!token) return null;
    return db.prepare("SELECT a.id,a.email,a.role,a.status,s.csrf,s.token FROM sessions s JOIN accounts a ON a.id=s.account WHERE s.token=? AND s.expires>? AND a.status='approved'").get(digest(token),Date.now())||null;
  };
  function origin(req) {
    if(req.headers['sec-fetch-site']==='cross-site') fail('허용되지 않은 요청 출처입니다.',403);
    const value=req.headers.origin;
    if(!value) fail('요청 출처가 필요합니다.',403);
    let parsed; try { parsed=new URL(value); } catch { fail('잘못된 요청 출처입니다.',403); }
    const valid=process.env.PUBLIC_ORIGIN ? value===new URL(process.env.PUBLIC_ORIGIN).origin : ['http:','https:'].includes(parsed.protocol) && parsed.host===req.headers.host;
    if(!valid) fail('허용되지 않은 요청 출처입니다.',403);
  }
  function guard(req,account) { origin(req); if(!account || req.headers['x-csrf-token']!==account.csrf) fail('세션을 새로고침한 뒤 다시 시도해 주세요.',403); }
  function limit(key,max) {
    const now=Date.now(); db.prepare('DELETE FROM auth_limits WHERE expires<?').run(now);
    db.prepare('INSERT INTO auth_limits VALUES (?,1,?) ON CONFLICT(key) DO UPDATE SET count=count+1').run(digest(key),now+15*60*1000);
    if(db.prepare('SELECT count FROM auth_limits WHERE key=?').get(digest(key)).count>max) fail('시도 횟수를 초과했습니다. 15분 후 다시 시도해 주세요.',429);
  }
  async function route(req,res,path,input,account) {
    if(path==='/api/auth/signup') { limit(`signup:${req.socket.remoteAddress}`,10); await createAccount(db,input); return {message:'가입 신청이 접수되었습니다. 관리자 승인 후 로그인할 수 있습니다.'}; }
    if(path==='/api/auth/login') {
      const data=z.object({email:z.string().trim().email().max(254).transform(v=>v.toLowerCase()),password:z.string().min(1).max(128)}).parse(input);
      limit(`login:${req.socket.remoteAddress}`,100); limit(`email:${data.email}`,15);
      const user=db.prepare('SELECT * FROM accounts WHERE email=?').get(data.email);
      const correct=await check(data.password,user?.password||`${'0'.repeat(32)}:${'0'.repeat(128)}`);
      if(!user || !correct) fail('이메일 또는 비밀번호를 확인해 주세요.',401);
      if(user.status!=='approved') fail(user.status==='pending'?'관리자 승인 대기 중입니다.':user.status==='rejected'?'가입 신청이 거절되었습니다. 관리자에게 문의해 주세요.':'이용이 정지된 계정입니다.',403);
      const token=randomBytes(32).toString('hex'),csrf=randomBytes(32).toString('hex');
      db.prepare('DELETE FROM sessions WHERE expires<?').run(Date.now());
      db.prepare('INSERT INTO sessions VALUES (?,?,?,?)').run(digest(token),user.id,csrf,Date.now()+7*86400000);
      cookie(res,token,7*86400); return {user:profile(user.id),role:user.role,csrf};
    }
    if(!account) fail('로그인이 필요합니다.',401);
    guard(req,account);
    if(path==='/api/auth/logout') { db.prepare('DELETE FROM sessions WHERE token=?').run(account.token); cookie(res,'',0); return {ok:true}; }
    if(path==='/api/admin/review') {
      if(account.role!=='admin') fail('관리자 권한이 필요합니다.',403);
      const data=z.object({id:z.string(),status:z.enum(['approved','rejected','suspended']),reason:z.string().trim().max(1000).default('')}).parse(input);
      const target=db.prepare('SELECT * FROM accounts WHERE id=?').get(data.id);
      if(!target) fail('회원이 없습니다.',404);
      if(target.role==='admin') fail('관리자 계정은 변경할 수 없습니다.',403);
      if(!({pending:['approved','rejected'],approved:['suspended'],rejected:['approved'],suspended:['approved']}[target.status]||[]).includes(data.status)) fail('이미 처리된 신청입니다. 목록을 새로고침해 주세요.',409);
      db.exec('BEGIN IMMEDIATE');
      try {
        db.prepare('UPDATE accounts SET status=?,reviewed=?,reviewer=?,reason=? WHERE id=?').run(data.status,new Date().toISOString(),account.id,data.reason,target.id);
        db.prepare('DELETE FROM sessions WHERE account=?').run(target.id);
        db.prepare('INSERT INTO auth_audit VALUES (?,?,?,?,?,?)').run(randomUUID(),account.id,target.id,data.status,data.reason,new Date().toISOString());
        db.exec('COMMIT');
      } catch(e) {db.exec('ROLLBACK');throw e;}
      return {ok:true};
    }
    fail('Not found',404);
  }
  return {session,origin,guard,route,profile,me:a=>({user:profile(a.id),role:a.role,csrf:a.csrf}),users:()=>db.prepare('SELECT id,email,role,status,created,reviewed,reason FROM accounts ORDER BY created DESC').all().map(a=>({...a,profile:profile(a.id)}))};
}
