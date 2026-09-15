import React from 'react';
import { Github, BookOpen, ExternalLink, Youtube, Figma, Play } from 'lucide-react';
import { PortfolioProject } from '../types';
import { httpUrl, projectLinks, serviceFor } from '../utils/media.mjs';

export function ProjectLinks({ project }: { project: PortfolioProject }) {
  return <div className="flex flex-wrap gap-2 mt-4">{projectLinks(project).filter(link => link.label && httpUrl(link.url)).map((link,index) => {
    const service = serviceFor(link.url);
    const Icon = ({ GitHub: Github, RISS: BookOpen, YouTube: Youtube, Vimeo: Play, Figma })[service] || ExternalLink;
    return <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer" className={`px-4 py-2 rounded-full text-xs font-semibold inline-flex items-center gap-2 ${index === 0 ? 'bg-neutral-900 text-white' : 'bg-white border border-neutral-200 text-neutral-800'}`}>
      {service === 'Behance' ? <span aria-label="Behance" className="font-bold">Bē</span> : <Icon aria-label={service || '외부 링크'} size={15}/>}{service === 'RISS' && <span className="text-[10px]">RISS</span>}{link.label}
    </a>;
  })}</div>;
}
