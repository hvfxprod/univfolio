import { useState } from 'react';
import { ArrowUpRight, ChevronLeft, ChevronRight, Heart } from 'lucide-react';
import { PortfolioProject } from '../types';

export function recentPopularProjects(projects: PortfolioProject[], now = new Date()) {
  const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul', year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);
  const end = Date.parse(`${today}T00:00:00Z`);
  const date = (value: string) => Date.parse(`${value.trim().replace(/\./g, '-').slice(0, 10)}T00:00:00Z`);
  return projects.filter(p => {
    const timestamp = date(p.createdAt);
    return p.isPublished && timestamp >= end - 29 * 86400000 && timestamp <= end;
  }).sort((a, b) => b.likes - a.likes || date(b.createdAt) - date(a.createdAt) || a.id.localeCompare(b.id)).slice(0, 5);
}

export function TrendingBanner({ projects, onSelectProject }: {
  projects: PortfolioProject[];
  onSelectProject: (project: PortfolioProject) => void;
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const items = recentPopularProjects(projects);
  const index = Math.max(0, items.findIndex(p => p.id === selectedId));
  const project = items[index];
  if (!project) return (
    <section aria-label="최근 인기 작품" className="rounded-3xl border border-black/[0.08] bg-white px-6 py-10">
      <h2 className="text-xl font-semibold">최근 인기 작품</h2>
      <p className="mt-2 text-sm text-neutral-500">최근 30일 동안 공개된 작품이 없습니다. 새로운 작품을 올려보세요.</p>
    </section>
  );
  const move = (delta: number) => setSelectedId(items[(index + delta + items.length) % items.length].id);
  return (
    <section aria-label="최근 인기 작품" className="relative overflow-hidden rounded-3xl bg-neutral-900 text-white">
      <button type="button" onClick={() => onSelectProject(project)} className="group relative block w-full min-h-64 sm:min-h-80 text-left cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-white">
        {project.coverImageUrl && <img src={project.coverImageUrl} alt="" className="absolute inset-0 h-full w-full object-cover opacity-60 transition-transform duration-500 group-hover:scale-[1.02]" />}
        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/50 to-black/10" />
        <div className="relative px-6 sm:px-10 pt-8 pb-20 max-w-3xl">
          <h2 className="text-xs font-semibold tracking-wide text-white/80">최근 인기 작품 · 최근 30일 좋아요 TOP {items.length}</h2>
          <p className="mt-5 text-xs font-semibold text-white/80">{String(index + 1).padStart(2, '0')} / {project.category}</p>
          <h3 className="mt-2 text-2xl sm:text-3xl font-semibold leading-snug line-clamp-2 break-words">{project.title}</h3>
          <p className="mt-3 text-sm text-white/80">{project.author.realName}</p>
          <span className="mt-4 inline-flex items-center gap-2 text-xs"><Heart className="h-4 w-4" />{project.likes.toLocaleString()}<span className="ml-3">작품 보기</span><ArrowUpRight className="h-4 w-4" /></span>
        </div>
      </button>
      <div className="absolute bottom-5 left-6 right-6 sm:left-10 sm:right-10 flex items-center justify-between gap-4">
        <div className="flex gap-2" aria-label="인기 작품 선택">
          {items.map((item, i) => <button key={item.id} type="button" aria-label={`${i + 1}위: ${item.title}`} aria-pressed={i === index} onClick={() => setSelectedId(item.id)} className={`h-8 min-w-8 rounded-full text-xs cursor-pointer ${i === index ? 'bg-white text-black' : 'bg-black/40 text-white hover:bg-black/60'}`}>{i + 1}</button>)}
        </div>
        {items.length > 1 && <div className="flex gap-2">
          <button type="button" aria-label="이전 인기 작품" onClick={() => move(-1)} className="rounded-full bg-black/40 p-2 hover:bg-black/60 cursor-pointer"><ChevronLeft className="h-4 w-4" /></button>
          <button type="button" aria-label="다음 인기 작품" onClick={() => move(1)} className="rounded-full bg-black/40 p-2 hover:bg-black/60 cursor-pointer"><ChevronRight className="h-4 w-4" /></button>
        </div>}
      </div>
    </section>
  );
}
