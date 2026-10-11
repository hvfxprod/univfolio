import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
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
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const reduceMotion = useReducedMotion();
  const items = recentPopularProjects(projects);
  const itemIds = JSON.stringify(items.map(item => item.id));
  useEffect(() => {
    const ids: string[] = JSON.parse(itemIds);
    if (ids.length < 2 || hovered || focused || reduceMotion) return;
    const timer = window.setInterval(() => {
      if (document.hidden) return;
      setSelectedId(current => ids[(Math.max(0, ids.indexOf(current || '')) + 1) % ids.length]);
    }, 5000);
    return () => window.clearInterval(timer);
  }, [itemIds, hovered, focused, reduceMotion]);
  const index = Math.max(0, items.findIndex(p => p.id === selectedId));
  const project = items[index];
  if (!project) return (
    <section aria-label="최근 인기 작품" className="rounded-3xl border border-black/[0.08] bg-white px-6 py-10">
      <h2 className="text-xl font-semibold">최근 인기 작품</h2>
      <p className="mt-2 text-sm text-neutral-500">최근 30일 동안 공개된 작품이 없습니다. 새로운 작품을 올려보세요.</p>
    </section>
  );
  return (
    <section aria-label="최근 인기 작품" onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} onFocusCapture={() => setFocused(true)} onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false); }} className="relative overflow-hidden rounded-3xl bg-neutral-900 text-white">
      <AnimatePresence initial={false} mode="popLayout">
      <motion.div key={project.id} initial={{ x: reduceMotion ? 0 : '100%', opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: reduceMotion ? 0 : '-100%', opacity: 0 }} transition={{ duration: reduceMotion ? 0 : 0.6, ease: 'easeInOut' }}>
      <button type="button" onClick={() => onSelectProject(project)} className="group relative block w-full min-h-64 sm:min-h-80 text-left cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-white">
        {project.coverImageUrl && <img src={project.coverImageUrl} alt="" className="absolute inset-0 h-full w-full object-cover opacity-60 transition-transform duration-500 group-hover:scale-[1.02]" />}
        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/50 to-black/10" />
        <div className="relative px-6 sm:px-10 py-8 max-w-3xl">
          <h2 className="text-2xl sm:text-3xl font-semibold leading-snug line-clamp-2 break-words">{project.title}</h2>
          <p className="mt-3 text-sm text-white/80">{project.author.realName}</p>
        </div>
      </button>
      </motion.div>
      </AnimatePresence>
    </section>
  );
}
