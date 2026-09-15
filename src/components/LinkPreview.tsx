import React from 'react';
import { BookOpen, Github, ExternalLink, Globe } from 'lucide-react';
import { httpUrl, serviceFor } from '../utils/media.mjs';

export function LinkPreview({ url, title }: { url: string; title?: string }) {
  const parsed = httpUrl(url);
  if (!parsed) return <p className="text-sm text-neutral-500 py-4">미리 볼 웹페이지의 http 또는 https 주소를 입력해 주세요.</p>;
  const service = serviceFor(url);
  const Icon = service === 'GitHub' ? Github : service === 'RISS' ? BookOpen : Globe;
  const path = parsed.pathname.split('/').filter(Boolean).join(' / ');
  const heading = title?.trim() || (service === 'GitHub' && path ? path : service === 'RISS' ? 'RISS 학술연구정보서비스' : service || parsed.hostname);
  return <a href={parsed.href} target="_blank" rel="noopener noreferrer" className="group flex items-center gap-4 sm:gap-5 rounded-2xl border border-neutral-200 bg-white p-5 hover:border-neutral-400 hover:shadow-sm transition-all min-w-0">
    <span className={`shrink-0 rounded-xl p-4 ${service === 'GitHub' ? 'bg-neutral-900 text-white' : service === 'RISS' ? 'bg-blue-50 text-blue-700' : 'bg-neutral-100 text-neutral-500'}`}><Icon size={28}/></span>
    <span className="min-w-0 flex-1"><span className="block text-[10px] font-bold tracking-wider text-neutral-400 mb-1">{service || 'WEB LINK'}</span><span className="block font-semibold text-base break-words">{heading}</span><span className="block text-xs text-neutral-500 truncate mt-2">{parsed.hostname}{parsed.pathname}{parsed.search}</span></span>
    <ExternalLink size={17} className="shrink-0 text-neutral-400"/>
  </a>;
}
