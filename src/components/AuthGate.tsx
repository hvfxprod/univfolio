import React, { useEffect, useState } from 'react';
import App from '../App';
import { api, setCsrf } from '../auth';
import { UserProfile } from '../types';
import { AdminPage } from './AdminPage';
type Session = {user:UserProfile;role:string;csrf:string};
export default function AuthGate() {
  const [session,setSession]=useState<Session|null>(null),[loading,setLoading]=useState(true),[signup,setSignup]=useState(false),[busy,setBusy]=useState(false),[message,setMessage]=useState(''),[error,setError]=useState(''),[admin,setAdmin]=useState(location.pathname==='/admin');
  const accept=(value:Session)=>{setCsrf(value.csrf);setSession(value);};
  useEffect(()=>{api('auth/me').then(accept).catch(e=>{if(e.message!=='로그인이 필요합니다.') setError(e.message);}).finally(()=>setLoading(false));const expired=()=>{setCsrf('');setSession(null);setError('로그인이 만료되었습니다. 다시 로그인해 주세요.');};const pop=()=>setAdmin(location.pathname==='/admin');window.addEventListener('session-expired',expired);window.addEventListener('popstate',pop);return()=>{window.removeEventListener('session-expired',expired);window.removeEventListener('popstate',pop);};},[]);
  const navigate=(next:boolean)=>{history.pushState({},'',next?'/admin':'/');setAdmin(next);};
  async function submit(e:React.FormEvent<HTMLFormElement>) {
    e.preventDefault();const form=e.currentTarget;const data=Object.fromEntries(new FormData(form));setError('');setMessage('');
    if(signup && data.password!==data.confirm){setError('비밀번호가 일치하지 않습니다.');return;}
    setBusy(true);try { if(signup){const result=await api('auth/signup',data);setMessage(result.message);form.reset();setSignup(false);}else accept(await api('auth/login',data)); } catch(e){setError((e as Error).message);}finally{setBusy(false);}
  }
  if(loading) return <div className="p-12 text-center">로그인 상태를 확인하고 있습니다…</div>;
  if(session) return <><div className="bg-neutral-900 text-white px-5 py-2 flex justify-end gap-5 text-xs items-center"><span>{session.user.realName} · {session.role==='admin'?'관리자':'승인 회원'}</span>{session.role==='admin'&&<button onClick={()=>navigate(!admin)}>{admin?'아카이브로 돌아가기':'관리자 페이지'}</button>}<button disabled={busy} onClick={async()=>{setBusy(true);try{await api('auth/logout',{});setSession(null);setCsrf('');setError('');}catch(e){setError((e as Error).message);}finally{setBusy(false);}}}>로그아웃</button></div>{error&&<p role="alert" className="p-3 text-red-700">{error}</p>}{admin?(session.role==='admin'?<AdminPage/>:<div className="p-12">관리자 권한이 필요합니다. <button onClick={()=>navigate(false)}>돌아가기</button></div>):<App initialUser={session.user} isAdmin={session.role==='admin'}/>}</>;
  return <main className="min-h-screen bg-[#F5F5F7] flex items-center justify-center p-5"><div className="bg-white border border-neutral-200 rounded-3xl p-7 sm:p-10 w-full max-w-lg shadow-sm"><p className="font-bold tracking-wider text-[#E6002D] mb-5">UNIVFOLIO</p><h1 className="text-2xl font-semibold">{signup?'회원가입 신청':'로그인'}</h1><p className="text-sm text-neutral-500 mt-3 mb-7 leading-relaxed">서울예술대학교 창작 포트폴리오 아카이브<br/>관리자가 승인한 계정만 이용할 수 있습니다.</p><form onSubmit={submit} className="space-y-4">
    {signup&&<><Field label="이름" name="realName" maxLength={80}/><Field label="학번" name="studentId" maxLength={40}/><Field label="학과 / 전공" name="department" maxLength={100}/><Field label="입학 연도" name="matriculationYear" placeholder="예: 2026" maxLength={20}/><label className="block text-sm">학적 상태<select name="status" className="block w-full border border-neutral-300 rounded-xl p-3 mt-1">{['재학생','졸업생','수료생','휴학생'].map(v=><option key={v}>{v}</option>)}</select></label></>}
    <Field label="이메일" name="email" type="email" autoComplete="username" maxLength={254}/><Field label={signup?'비밀번호 (12자 이상)':'비밀번호'} name="password" type="password" minLength={signup?12:1} maxLength={128} autoComplete={signup?'new-password':'current-password'}/>{signup&&<Field label="비밀번호 확인" name="confirm" type="password" minLength={12} maxLength={128} autoComplete="new-password"/>}
    {error&&<p role="alert" className="text-sm text-red-700">{error}</p>}{message&&<p role="status" className="text-sm text-green-700 bg-green-50 rounded-xl p-3">{message}</p>}
    <button disabled={busy} className="w-full rounded-xl bg-[#E6002D] text-white p-3 font-semibold disabled:opacity-50">{busy?'처리 중…':signup?'가입 신청하기':'로그인'}</button></form><button disabled={busy} className="block mx-auto mt-5 text-sm underline" onClick={()=>{setSignup(!signup);setError('');setMessage('');}}>{signup?'로그인으로 돌아가기':'계정이 없나요? 회원가입 신청'}</button><p className="text-xs text-neutral-400 mt-7 leading-relaxed">현재 관리자 수동 승인 방식으로 운영됩니다. 학교 공식 DB는 아직 연결되어 있지 않습니다. 입력한 이메일·학적 정보는 가입 심사 및 서비스 이용을 위해 서버에 저장됩니다.</p></div></main>;
}
function Field({label,...props}:{label:string}&React.InputHTMLAttributes<HTMLInputElement>){return <label className="block text-sm">{label}<input required {...props} className="block w-full border border-neutral-300 rounded-xl p-3 mt-1"/></label>;}
