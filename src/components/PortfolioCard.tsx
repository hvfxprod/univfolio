import React from 'react';
import { PortfolioProject } from '../types';
import { Heart, Eye, ShieldCheck } from 'lucide-react';

interface PortfolioCardProps {
  project: PortfolioProject;
  onClick: () => void;
  onLike: (e: React.MouseEvent) => void;
}

export const PortfolioCard: React.FC<PortfolioCardProps> = ({
  project,
  onClick,
  onLike,
}) => {
  return (
    <div
      onClick={onClick}
      className="group bg-white border border-black/[0.08] hover:border-black/20 rounded-2xl overflow-hidden transition-all duration-300 shadow-[0_2px_10px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_28px_rgba(0,0,0,0.08)] hover:-translate-y-0.5 cursor-pointer flex flex-col active:scale-[0.99]"
    >
      {/* Cover Image Container */}
      <div className="relative aspect-16/10 overflow-hidden bg-neutral-100">
        <img
          src={project.coverImageUrl}
          alt={project.title}
          className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
          loading="lazy"
        />

        {/* Top Badges (Apple Frosted Glass Pills) */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
          <span className="bg-[#E6002D] text-white text-[11px] font-semibold tracking-wide px-2.5 py-0.5 rounded-full shadow-xs">
            {project.category}
          </span>
          <span className="bg-white/90 backdrop-blur-md text-neutral-800 border border-white/60 text-[11px] font-medium tracking-wide px-2.5 py-0.5 rounded-full shadow-xs">
            {project.projectType}
          </span>
        </div>

        {/* Hover Quick Overlay with Tools (Apple Dark Glass) */}
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-end p-4 text-white">
          <p className="text-xs line-clamp-2 text-neutral-200 font-medium mb-2.5 leading-relaxed">
            {project.subtitle}
          </p>
          <div className="flex flex-wrap gap-1">
            {project.toolsUsed.slice(0, 3).map((tool, idx) => (
              <span
                key={idx}
                className="text-[10px] bg-white/20 backdrop-blur-md border border-white/25 text-white font-medium px-2 py-0.5 rounded-full"
              >
                {tool}
              </span>
            ))}
            {project.toolsUsed.length > 3 && (
              <span className="text-[10px] text-white/80 font-medium px-1.5 py-0.5">
                +{project.toolsUsed.length - 3}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Card Info */}
      <div className="p-4 flex flex-col justify-between flex-1 bg-white">
        <div>
          <h4 className="font-semibold text-sm sm:text-base text-[#1D1D1F] line-clamp-1 group-hover:text-[#E6002D] transition-colors tracking-tight">
            {project.title}
          </h4>
          <p className="text-xs text-neutral-500 mt-1 line-clamp-1 font-normal">
            {project.author.realName} • {project.author.department}
          </p>
        </div>

        {/* Footer: Author & Metrics */}
        <div className="mt-3.5 pt-3 border-t border-black/[0.05] flex items-center justify-between">
          {/* Author with Real Name & Verified status */}
          <div className="flex items-center gap-1.5 min-w-0 pr-2">
            <span className="text-xs font-semibold text-neutral-800 truncate">
              {project.author.realName}
            </span>
            <ShieldCheck
              className="w-3.5 h-3.5 text-[#E6002D] shrink-0"
              aria-label="작품 작성자"
            />
            <span className="text-[10px] text-[#E6002D] font-medium bg-[#E6002D]/10 px-1.5 py-0.2 rounded-full shrink-0">
              {project.author.status}
            </span>
          </div>

          {/* Stats & Like button */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="flex items-center gap-1 text-neutral-400 text-xs font-medium">
              <Eye className="w-3.5 h-3.5" />
              <span>{project.views}</span>
            </div>
            <button
              type="button"
              onClick={onLike}
              className={`flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full transition-all cursor-pointer active:scale-90 ${
                project.likedByMe
                  ? 'text-[#E6002D] bg-[#E6002D]/10'
                  : 'text-neutral-400 hover:text-[#E6002D] hover:bg-neutral-100'
              }`}
            >
              <Heart
                className={`w-3.5 h-3.5 transition-colors ${
                  project.likedByMe ? 'fill-[#E6002D] text-[#E6002D]' : ''
                }`}
              />
              <span>{project.likes}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};


