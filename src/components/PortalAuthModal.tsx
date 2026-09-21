import React, { useEffect, useState } from 'react';
import { UserProfile } from '../types';
import { Avatar } from './Avatar';
import { readProfileImage } from '../utils/editor';

export function PortalAuthModal({isOpen,onClose,currentUser,onUpdateUser}:{isOpen:boolean;onClose:()=>void;currentUser:UserProfile;onUpdateUser:(user:UserProfile)=>Promise<void>}) {
  const [bio,setBio]=useState(currentUser.bio),[avatarUrl,setAvatarUrl]=useState(currentUser.avatarUrl);
  const [busy,setBusy]=useState(false),[reading,setReading]=useState(false),[error,setError]=useState('');
  useEffect(()=>{ if(isOpen){setBio(currentUser.bio);setAvatarUrl(currentUser.avatarUrl);setError('');} },[isOpen,currentUser]);
  if(!isOpen)return null;
  return <div className="fixed inset-0 z-50 bg-black/40 grid place-items-center p-5"><section role="dialog" aria-modal="true" aria-label="내 프로필" className="bg-white rounded-3xl p-7 w-full max-w-md max-h-[90vh] overflow-y-auto">
    <h2 className="text-xl font-semibold">내 프로필</h2>
    <form onSubmit={async e=>{e.preventDefault();if(reading)return;setBusy(true);setError('');try{await onUpdateUser({...currentUser,bio,avatarUrl});onClose();}catch(e){setError((e as Error).message);}finally{setBusy(false);}}}>
      <div className="flex flex-col items-center gap-3 my-6">
        <div className="w-24 h-24 rounded-full bg-[#E6002D]/10 text-[#E6002D] text-2xl font-semibold flex items-center justify-center overflow-hidden"><Avatar user={{...currentUser,avatarUrl}} /></div>
        <label className="text-sm font-semibold">프로필 이미지
          <input aria-label="프로필 이미지 선택" type="file" accept="image/jpeg,image/png,image/webp" disabled={busy||reading} className="block w-full mt-2 text-xs file:mr-3 file:rounded-full file:border-0 file:bg-neutral-100 file:px-4 file:py-2" onChange={async e=>{const file=e.target.files?.[0];e.target.value='';if(!file)return;setReading(true);setError('');try{setAvatarUrl(await readProfileImage(file));}catch(e){setError((e as Error).message);}finally{setReading(false);}}}/>
        </label>
        <p className="text-xs text-neutral-500">{reading?'이미지 처리 중…':'JPG · PNG · WebP / 최대 15MB'}</p>
        {avatarUrl&&<button type="button" disabled={busy||reading} onClick={()=>setAvatarUrl('')} className="text-xs text-neutral-500 underline">이미지 삭제</button>}
      </div>
      <p>{currentUser.realName} · {currentUser.links.email}</p>
      <p className="text-sm text-neutral-500 mt-2">{currentUser.department} · {currentUser.studentId} · {currentUser.status}</p>
      <label className="block text-sm mt-5">자기소개<textarea value={bio} maxLength={100000} disabled={busy} onChange={e=>setBio(e.target.value)} className="w-full mt-2 border rounded-xl p-3"/></label>
      {error&&<p role="alert" className="text-red-700 text-sm">{error}</p>}
      <div className="flex justify-end gap-4 mt-4"><button type="button" disabled={busy||reading} onClick={onClose}>취소</button><button disabled={busy||reading} className="bg-[#E6002D] text-white px-5 py-2 rounded-xl disabled:opacity-50">{busy?'저장 중…':'저장'}</button></div>
    </form>
  </section></div>;
}
