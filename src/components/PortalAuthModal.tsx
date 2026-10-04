import React, { useEffect, useRef, useState } from 'react';
import { Camera, Check, ExternalLink, Github, Globe, Linkedin, Mail, Phone, Plus, Trash2, X } from 'lucide-react';
import { PortfolioProject, UserProfile } from '../types';
import { Avatar } from './Avatar';
import { readProfileImage } from '../utils/editor';
import './ProfileCard.css';

export type ProfileTab = 'about' | 'posts' | 'contact';
interface Props {
  isOpen: boolean;
  tab: ProfileTab;
  onTabChange: (tab: ProfileTab) => void;
  onClose: () => void;
  currentUser: UserProfile;
  projects: PortfolioProject[];
  onUpdateUser: (user: UserProfile) => Promise<void>;
  onOpenProject: (project: PortfolioProject) => void;
  onEditProject: (project?: PortfolioProject) => void;
  onDeleteProject: (id: string) => Promise<void>;
  onTogglePublish: (id: string) => Promise<void>;
}
const tabs: ProfileTab[] = ['about', 'posts', 'contact'];
const linkFields = [ ['website', '웹사이트'], ['github', 'GitHub'], ['behance', 'Behance'], ['linkedin', 'LinkedIn'] ] as const;

export function PortalAuthModal({isOpen,tab,onTabChange,onClose,currentUser,projects,onUpdateUser,onOpenProject,onEditProject,onDeleteProject,onTogglePublish}: Props) {
  const [bio,setBio]=useState(''),[avatarUrl,setAvatarUrl]=useState(''),[links,setLinks]=useState(currentUser.links);
  const [contact,setContact]=useState({email:'',phone:'',isPublic:false});
  const [editing,setEditing]=useState(false),[busy,setBusy]=useState(''),[error,setError]=useState(''),[notice,setNotice]=useState('');
  const [deleting,setDeleting]=useState<string|null>(null);
  const dialogRef=useRef<HTMLElement>(null);
  const closeRef=useRef(onClose); closeRef.current=onClose;
  const busyRef=useRef(busy); busyRef.current=busy;
  useEffect(()=>{
    if(isOpen) {
      setBio(currentUser.bio);setAvatarUrl(currentUser.avatarUrl);setLinks(currentUser.links);
      setContact(currentUser.contact||{email:'',phone:'',isPublic:false});setEditing(false);setDeleting(null);setError('');setNotice('');
    }
  },[isOpen,currentUser]);
  useEffect(()=>{
    if(!isOpen)return;
    const previous=document.activeElement as HTMLElement|null;
    dialogRef.current?.focus();
    const keydown=(e:KeyboardEvent)=>{
      if(e.key==='Escape'){e.preventDefault();if(!busyRef.current)closeRef.current();}
      if(e.key!=='Tab')return;
      const elements=Array.from(dialogRef.current?.querySelectorAll<HTMLElement>('button:not(:disabled), input:not(:disabled), textarea:not(:disabled), a[href], [tabindex="0"]')||[]).filter(el=>el.getClientRects().length>0);
      const first=elements[0],last=elements[elements.length-1];
      if(e.shiftKey && (document.activeElement===first||document.activeElement===dialogRef.current)){e.preventDefault();last?.focus();}
      else if(!e.shiftKey && document.activeElement===last){e.preventDefault();first?.focus();}
    };
    document.addEventListener('keydown',keydown);return()=>{document.removeEventListener('keydown',keydown);previous?.focus();};
  },[isOpen]);
  if(!isOpen)return null;
  async function perform(key:string,operation:()=>Promise<void>,message:string) {
    setBusy(key);setError('');setNotice('');
    try {await operation();setNotice(message);setDeleting(null);}catch(e){setError((e as Error).message);}finally{setBusy('');}
  }
  async function save(e:React.FormEvent) {
    e.preventDefault();
    await perform('save',()=>onUpdateUser(tab==='about'?{...currentUser,bio,avatarUrl}:{...currentUser,contact,links}),'저장되었습니다.');
  }
  function selectTab(next:ProfileTab){setError('');setNotice('');setDeleting(null);onTabChange(next);}
  const draftUser={...currentUser,avatarUrl};
  return <div className="profile-overlay" onMouseDown={e=>{if(e.target===e.currentTarget&&!busy)onClose();}}>
    <section ref={dialogRef} tabIndex={-1} role="dialog" aria-modal="true" aria-label="내 프로필 카드" className="profile-card" data-tab={tab}>
      <button className="profile-close" aria-label="프로필 닫기" disabled={!!busy} onClick={onClose}><X size={18}/></button>
      <header className="profile-card-header">
        <div className="profile-cover">{avatarUrl&&<img src={avatarUrl} alt=""/>}</div>
        <div className="profile-card-avatar"><Avatar user={draftUser}/></div>
        <div className="profile-identity"><h2>{currentUser.realName}</h2><p>{currentUser.department} · {currentUser.status}</p></div>
      </header>
      <div className="profile-card-body">
        {error&&<p className="profile-error" role="alert">{error}</p>}
        {notice&&<p className="profile-notice" role="status"><Check size={14}/>{notice}</p>}
        <section key={tab} id={`profile-panel-${tab}`} role="tabpanel" aria-labelledby={`profile-tab-${tab}`} className="profile-panel">
          {tab==='about'&&<>
            <div className="profile-section-heading"><h3>ABOUT</h3><span>{currentUser.university}</span></div>
            {!editing?<>
              <p className="profile-bio">{currentUser.bio||'나의 관심사와 작업 이야기를 소개해 보세요.'}</p>
              <div className="profile-social">
                {linkFields.filter(([key])=>currentUser.links[key]).map(([key,label])=><a key={key} href={currentUser.links[key]} target="_blank" rel="noopener noreferrer" aria-label={label} title={label}>{key==='github'?<Github size={17}/>:key==='linkedin'?<Linkedin size={17}/>:<Globe size={17}/>}</a>)}
              </div>
              <div className="profile-summary"><div><strong>{projects.length}</strong><span>POSTS</span></div><div><strong>{projects.reduce((n,p)=>n+p.likes,0).toLocaleString()}</strong><span>LIKES</span></div><div><strong>{projects.reduce((n,p)=>n+p.views,0).toLocaleString()}</strong><span>VIEWS</span></div></div>
              <button className="profile-primary" onClick={()=>setEditing(true)}>프로필 편집</button>
            </>:<form onSubmit={save} className="profile-form">
              <label className="profile-image-picker"><Camera size={16}/> 사진 변경<input aria-label="프로필 이미지 선택" type="file" accept="image/jpeg,image/png,image/webp" disabled={!!busy} onChange={async e=>{const file=e.target.files?.[0];e.target.value='';if(file)await perform('image',async()=>setAvatarUrl(await readProfileImage(file)),'사진을 적용하려면 저장해 주세요.');}}/></label>
              <div className="profile-hint">JPG · PNG · WebP / 최대 15MB {avatarUrl&&<button type="button" disabled={!!busy} onClick={()=>setAvatarUrl('')}>사진 삭제</button>}</div>
              <label>자기소개<textarea rows={4} value={bio} disabled={!!busy} maxLength={100000} onChange={e=>setBio(e.target.value)}/></label>
              <div className="profile-actions"><button type="button" disabled={!!busy} onClick={()=>{setEditing(false);setBio(currentUser.bio);setAvatarUrl(currentUser.avatarUrl);setNotice('');}}>취소</button><button className="profile-primary" disabled={!!busy}>{busy?'처리 중…':'프로필 저장'}</button></div>
            </form>}
          </>}
          {tab==='posts'&&<>
            <div className="profile-section-heading"><h3>POSTS <span>{projects.length}</span></h3><button aria-label="새 게시물" disabled={!!busy} onClick={()=>onEditProject()}><Plus size={16}/>새 작업</button></div>
            {!projects.length?<div className="profile-empty"><p>아직 올린 게시물이 없습니다.</p><button className="profile-primary" onClick={()=>onEditProject()}>첫 작업 업로드</button></div>:<div className="profile-posts">{projects.map(project=><article key={project.id} className="profile-post">
              <span className="profile-post-dot"/>
              <p className="profile-post-date">{project.createdAt} <span>{project.isPublished?'공개':'비공개'}</span></p>
              <button className="profile-post-title" disabled={!!busy} onClick={()=>onOpenProject(project)}>{project.coverImageUrl&&<img src={project.coverImageUrl} alt=""/>}<span>{project.title}</span><ExternalLink size={13}/></button>
              <div className="profile-post-actions"><button disabled={!!busy} onClick={()=>onEditProject(project)}>수정</button><button disabled={!!busy} onClick={()=>perform(project.id,()=>onTogglePublish(project.id),'공개 설정이 변경되었습니다.')}>{project.isPublished?'비공개 전환':'공개하기'}</button><button disabled={!!busy} aria-label={`${project.title} 삭제`} onClick={()=>setDeleting(project.id)}><Trash2 size={13}/>삭제</button></div>
              {deleting===project.id&&<div className="profile-delete-confirm"><p>이 게시물을 삭제할까요?</p><button disabled={!!busy} onClick={()=>setDeleting(null)}>취소</button><button disabled={!!busy} onClick={()=>perform(project.id,()=>onDeleteProject(project.id),'게시물이 삭제되었습니다.')}>삭제 확인</button></div>}
            </article>)}</div>}
          </>}
          {tab==='contact'&&<form onSubmit={save} className="profile-form">
            <div className="profile-section-heading"><h3>CONTACT</h3><span>연락받을 주소</span></div>
            <label><span><Mail size={15}/>연락용 이메일</span><input type="email" value={contact.email} maxLength={254} disabled={!!busy} placeholder="hello@example.com" onChange={e=>setContact({...contact,email:e.target.value})}/></label>
            <label><span><Phone size={15}/>전화번호</span><input type="tel" value={contact.phone} maxLength={40} disabled={!!busy} placeholder="010-0000-0000" onChange={e=>setContact({...contact,phone:e.target.value})}/></label>
            <label className="profile-visibility"><input type="checkbox" checked={contact.isPublic} disabled={!!busy} onChange={e=>setContact({...contact,isPublic:e.target.checked})}/><span>작품을 보는 회원에게 이메일·전화번호 공개</span></label>
            <p className="profile-hint">로그인 이메일은 변경되지 않습니다. 아래 링크는 프로필에 표시됩니다.</p>
            {linkFields.map(([key,label])=><label key={key}>{label}<input type="url" value={links[key]||''} maxLength={2000} disabled={!!busy} placeholder="https://" onChange={e=>setLinks({...links,[key]:e.target.value})}/></label>)}
            <button className="profile-primary" disabled={!!busy}>{busy?'저장 중…':'연락처 저장'}</button>
          </form>}
        </section>
      </div>
      <nav role="tablist" aria-label="프로필 메뉴" className="profile-tabs">{tabs.map((value,index)=><button key={value} id={`profile-tab-${value}`} role="tab" aria-selected={tab===value} aria-controls={`profile-panel-${value}`} tabIndex={tab===value?0:-1} disabled={!!busy} onClick={()=>selectTab(value)} onKeyDown={e=>{if(['ArrowLeft','ArrowRight','Home','End'].includes(e.key)){e.preventDefault();const next=e.key==='Home'?0:e.key==='End'?2:(index+(e.key==='ArrowRight'?1:2))%3;selectTab(tabs[next]);document.getElementById(`profile-tab-${tabs[next]}`)?.focus();}}}>{value.toUpperCase()}</button>)}</nav>
    </section>
  </div>;
}
