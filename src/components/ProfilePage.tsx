import { useEffect, useState } from 'react';
import { Avatar } from './Avatar';
import { PortfolioProject, UserProfile } from '../types';
import { httpUrl } from '../utils/media.mjs';
import { ArrowLeft, Eye, Heart, ExternalLink } from 'lucide-react';

export function ProfilePage({ user, projects, isOwner, onBack, onEdit, onUpload, onSelectProject, onEditProject, onDeleteProject, onTogglePublish }: {
  user: UserProfile; projects: PortfolioProject[]; isOwner: boolean;
  onBack: () => void; onEdit: (tab: 'about' | 'contact') => void; onUpload: () => void;
  onSelectProject: (project: PortfolioProject) => void; onEditProject: (project: PortfolioProject) => void;
  onDeleteProject: (id: string) => void; onTogglePublish: (id: string) => void;
}) {
  const [tab, setTab] = useState<'posts' | 'about' | 'contact'>('posts');
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' }); }, [user.id]);
  const works = projects.filter(p => p.author.id === user.id && (isOwner || p.isPublished)).sort((a,b) => b.createdAt.localeCompare(a.createdAt));
  const publicWorks = works.filter(p => p.isPublished);
  const cover = publicWorks.find(p => p.coverImageUrl)?.coverImageUrl;
  const links = Object.entries(user.links).filter(([key,value]) => key !== 'email' && value && httpUrl(value));
  const contact = (isOwner || user.contact?.isPublic) ? user.contact : undefined;
  const primary = 'rounded-full bg-[#E6002D] text-white px-5 py-2.5 text-sm font-semibold hover:bg-[#C50026] cursor-pointer';
  return <div className="bg-white min-h-screen">
    <div className="relative h-44 sm:h-64 lg:h-72 bg-gradient-to-br from-slate-900 via-slate-700 to-slate-950 overflow-hidden">
      {cover && <img src={cover} alt="" className="w-full h-full object-cover" />}
      <div className="absolute inset-0 bg-black/20" />
      <button onClick={onBack} className="absolute left-5 top-5 flex items-center gap-2 rounded-full bg-black/50 text-white px-4 py-2 text-xs"><ArrowLeft size={15}/>돌아가기</button>
    </div>
    <div className="max-w-[1600px] mx-auto px-5 sm:px-10 grid grid-cols-1 lg:grid-cols-[260px_minmax(0,1fr)] gap-8 lg:gap-12 pb-16">
      <aside className="relative min-w-0 -mt-14 space-y-5 break-words [overflow-wrap:anywhere]">
        <div className="h-28 w-28 border-4 border-white rounded-full bg-neutral-100 text-neutral-600 flex items-center justify-center text-2xl font-bold shadow-sm"><Avatar user={user}/></div>
        <div><h1 className="text-2xl font-bold">{user.realName}</h1><p className="mt-3 text-sm text-neutral-600">{user.roleOrCompany}</p><p className="mt-1 text-xs text-neutral-500">{user.university} · {user.department}</p><p className="mt-1 text-xs text-neutral-500">{user.status}</p></div>
        {isOwner && <div className="flex flex-col gap-2"><button className={primary} onClick={() => onEdit('about')}>프로필 편집</button><button className="rounded-full border border-neutral-200 py-2.5 text-sm" onClick={onUpload}>작업 업로드</button></div>}
        <dl className="space-y-2 text-sm border-y border-neutral-100 py-5">{[['공개 작품',publicWorks.length],['작품 조회',publicWorks.reduce((n,p)=>n+p.views,0)],['좋아요',publicWorks.reduce((n,p)=>n+p.likes,0)]].map(([label,value])=><div key={label} className="flex justify-between gap-3"><dt className="text-neutral-500">{label}</dt><dd className="font-semibold">{Number(value).toLocaleString()}</dd></div>)}</dl>
        <p className="text-sm leading-7 whitespace-pre-wrap text-neutral-600">{user.bio || '아직 등록된 소개가 없습니다.'}</p>
        {links.length > 0 && <div className="space-y-2">{links.map(([name,url])=><a key={name} href={url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between border border-neutral-200 rounded-lg p-3 text-xs">{name}<ExternalLink size={14}/></a>)}</div>}
        {contact?.email && <a className="block text-xs text-neutral-600" href={`mailto:${contact.email}`}>{contact.email}</a>}
      </aside>
      <section className="min-w-0 lg:pt-8">
        <div className="flex gap-7 border-b border-neutral-200 mb-6" role="tablist" aria-label="프로필 콘텐츠">{(['posts','about','contact'] as const).map(t=><button key={t} role="tab" aria-selected={tab===t} onClick={()=>setTab(t)} className={`pb-4 text-sm font-semibold border-b-2 ${tab===t?'border-black text-black':'border-transparent text-neutral-400'}`}>{t==='posts'?'POSTS':t==='about'?'ABOUT':'CONTACT'}</button>)}</div>
        {tab==='posts' && <>
          {works.length===0 && <p className="py-20 text-center text-neutral-500">아직 공개된 작품이 없습니다.</p>}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">{works.map(p=><article key={p.id} className="min-w-0">
            <button onClick={()=>onSelectProject(p)} className="block w-full text-left group"><div className="aspect-[4/3] rounded-lg bg-neutral-100 overflow-hidden"><img src={p.coverImageUrl} alt={p.title} loading="lazy" className="w-full h-full object-cover transition-transform group-hover:scale-105"/></div><h2 className="mt-3 text-sm font-semibold truncate">{p.title}</h2></button>
            <div className="flex gap-3 items-center mt-1 text-xs text-neutral-500"><span className="flex gap-1 items-center"><Heart size={12}/>{p.likes}</span><span className="flex gap-1 items-center"><Eye size={12}/>{p.views}</span>{!p.isPublished&&<span>비공개</span>}</div>
            {isOwner && <div className="flex flex-wrap gap-3 mt-3 text-xs"><button onClick={()=>onEditProject(p)}>수정</button><button onClick={()=>onTogglePublish(p.id)}>{p.isPublished?'비공개로 변경':'공개하기'}</button><button className="text-red-600" onClick={()=>onDeleteProject(p.id)}>삭제</button></div>}
          </article>)}</div>
        </>}
        {tab==='about' && <div className="max-w-2xl"><h2 className="text-xl font-semibold mb-5">소개</h2><p className="whitespace-pre-wrap leading-8 break-words">{user.bio || '아직 등록된 소개가 없습니다.'}</p>{isOwner&&<button onClick={()=>onEdit('about')} className={`${primary} mt-6`}>소개 편집</button>}</div>}
        {tab==='contact' && <div className="space-y-5 break-words [overflow-wrap:anywhere]"><h2 className="text-xl font-semibold">연락처</h2>{isOwner && <p className="text-sm text-neutral-500">{contact?.isPublic?'다른 회원에게 연락처가 공개됩니다.':'연락처는 나에게만 표시됩니다.'}</p>}{contact?.email&&<a className="block" href={`mailto:${contact.email}`}>{contact.email}</a>}{contact?.phone&&<a className="block" href={`tel:${contact.phone.replace(/[^+0-9]/g,'')}`}>{contact.phone}</a>}{!contact?.email&&!contact?.phone&&<p className="text-neutral-500">공개된 연락처가 없습니다.</p>}{links.map(([name,url])=><a key={name} href={url} target="_blank" rel="noopener noreferrer" className="block underline">{name}</a>)}{isOwner&&<button className={primary} onClick={()=>onEdit('contact')}>연락처 편집</button>}</div>}
      </section>
    </div>
  </div>;
}
