import { useEffect, useState } from 'react';
import { ProfilePage } from './ProfilePage';
import { PortfolioBlocks } from './PortfolioBlocks';
import { ProjectLinks } from './ProjectLinks';
import { UniversityBrand } from './UniversityBrand';
import { PortfolioProject, UserProfile } from '../types';
import { navigate, useRoute } from '../utils/navigation';

export function SharedProfilePage({ id }: { id: string }) {
  const route=useRoute();
  const [data,setData]=useState<{user:UserProfile;projects:PortfolioProject[]} | null>(null);
  const [error,setError]=useState('');
  useEffect(()=>{
    const controller=new AbortController();
    setData(null);setError('');
    fetch(`/api/public/profile?id=${encodeURIComponent(id)}`,{credentials:'omit',signal:controller.signal})
      .then(async response=>{const result=await response.json();if(!response.ok)throw new Error(result.error || '프로필을 불러오지 못했습니다.');return result;})
      .then(setData).catch(e=>{if(!controller.signal.aborted)setError(e.message);});
    return ()=>controller.abort();
  },[id]);
  const params=new URLSearchParams(route.split('?')[1] || '');
  const projectId=params.get('work');
  const project=data?.projects.find(p=>p.id===projectId);
  const profileUrl=`/?sharedProfile=${encodeURIComponent(id)}`;
  const noop=()=>{};
  useEffect(()=>{window.scrollTo({top:0,behavior:'instant'});},[route]);
  return <div className="min-h-screen bg-white text-neutral-900">
    <header className="border-b border-neutral-100 px-5 sm:px-10 py-4 flex items-center justify-between gap-4"><UniversityBrand/><a href="/" className="text-xs font-semibold text-[#E6002D]">서비스 바로가기 / 로그인</a></header>
    {error ? <p role="alert" className="p-16 text-center">{error}</p> : !data ? <p role="status" className="p-16 text-center">프로필을 불러오는 중입니다…</p> : projectId ? project ? <article className="max-w-4xl mx-auto px-5 py-10">
      <button onClick={()=>navigate(profileUrl)} className="text-sm text-neutral-500 mb-8">← {data.user.realName} 프로필</button>
      <h1 className="text-3xl font-bold">{project.title}</h1><p className="mt-3 text-neutral-500">{project.subtitle}</p>
      <img src={project.coverImageUrl} alt={project.title} className="my-8 w-full max-h-[440px] object-contain"/>
      <p className="whitespace-pre-wrap leading-8 mb-6">{project.summary}</p><ProjectLinks project={project}/>
      <div className="mt-10"><PortfolioBlocks blocks={project.blocks}/></div>
    </article> : <div className="p-16 text-center"><p>공개된 작품을 찾을 수 없습니다.</p><button className="mt-4 underline" onClick={()=>navigate(profileUrl)}>프로필로 돌아가기</button></div> :
      <ProfilePage user={data.user} projects={data.projects} isOwner={false} onBack={()=>navigate('/')} onEdit={noop} onUpload={noop} onSelectProject={p=>navigate(`${profileUrl}&work=${encodeURIComponent(p.id)}`)} onEditProject={noop} onDeleteProject={noop} onTogglePublish={noop}/>
    }
  </div>;
}
