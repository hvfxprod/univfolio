import React, { useState, useMemo } from 'react';
import { PortfolioProject } from '../types';
import { PortfolioCard } from './PortfolioCard';
import { Search, RotateCcw } from 'lucide-react';

interface PortfolioGridProps {
  projects: PortfolioProject[];
  onSelectProject: (project: PortfolioProject) => void;
  onToggleLike: (projectId: string) => void;
}

const CATEGORIES = [
  '전체',
  '디지털아트',
  '시각·모션디자인',
  '영화·방송영상',
  '무대·공간예술',
  '실용음악·음향',
  '사진·순수미술',
  'UI/UX·소프트웨어',
];

export const PortfolioGrid: React.FC<PortfolioGridProps> = ({
  projects,
  onSelectProject,
  onToggleLike,
}) => {
  const [selectedCategory, setSelectedCategory] = useState('전체');
  const [selectedStatus, setSelectedStatus] = useState<'전체' | '재학생' | '졸업생'>('전체');
  const [selectedProjectType, setSelectedProjectType] = useState<string>('전체');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'likes' | 'recent' | 'views'>('likes');

  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      // Must be published
      if (!project.isPublished) return false;

      // Category
      if (selectedCategory !== '전체' && project.category !== selectedCategory) {
        return false;
      }

      // Status (재학생 / 졸업생)
      if (selectedStatus !== '전체' && project.author.status !== selectedStatus) {
        return false;
      }

      // Project Type
      if (selectedProjectType !== '전체' && project.projectType !== selectedProjectType) {
        return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = project.title.toLowerCase().includes(query);
        const matchesSubtitle = project.subtitle.toLowerCase().includes(query);
        const matchesAuthor = project.author.realName.toLowerCase().includes(query);
        const matchesDept = project.author.department.toLowerCase().includes(query);
        const matchesTools = project.toolsUsed.some((t) => t.toLowerCase().includes(query));
        const matchesTags = project.tags.some((t) => t.toLowerCase().includes(query));

        if (!matchesTitle && !matchesSubtitle && !matchesAuthor && !matchesDept && !matchesTools && !matchesTags) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'likes') return b.likes - a.likes;
      if (sortBy === 'views') return b.views - a.views;
      return b.createdAt.localeCompare(a.createdAt);
    });
  }, [projects, selectedCategory, selectedStatus, selectedProjectType, searchQuery, sortBy]);

  return (
    <div className="space-y-6">
      {/* Category Pills Bar (Apple-style pill selector) */}
      <div className="pb-1">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          {CATEGORIES.map((category) => {
            const isActive = selectedCategory === category;
            return (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer active:scale-95 ${
                  isActive
                    ? 'bg-[#1D1D1F] text-white shadow-[0_2px_8px_rgba(0,0,0,0.15)]'
                    : 'bg-black/[0.04] text-neutral-600 hover:text-[#1D1D1F] hover:bg-black/[0.08]'
                }`}
              >
                {category}
              </button>
            );
          })}
        </div>
      </div>

      {/* Secondary Filter & Search Bar (Apple Translucent Toolbar) */}
      <div className="bg-white/90 backdrop-blur-md border border-black/[0.08] p-3 sm:p-3.5 rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Apple Pill Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="작품 제목, 전공, 창작자 실명, 사용 툴, 태그 검색..."
            className="w-full pl-10 pr-12 py-2 bg-black/[0.03] focus:bg-white text-xs sm:text-sm border border-transparent focus:border-black/[0.12] focus:ring-2 focus:ring-[#E6002D]/15 rounded-full outline-none font-normal text-slate-900 transition-all placeholder:text-neutral-400"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-medium text-neutral-400 hover:text-neutral-700 cursor-pointer"
            >
              지우기
            </button>
          )}
        </div>

        {/* Filters Group */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Segmented Control (전체 / 재학생 / 졸업생) */}
          <div className="flex bg-black/[0.04] rounded-full p-1 text-xs">
            {(['전체', '재학생', '졸업생'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setSelectedStatus(status)}
                className={`px-3 py-1 rounded-full font-semibold cursor-pointer transition-all ${
                  selectedStatus === status
                    ? 'bg-white text-[#1D1D1F] shadow-[0_1px_3px_rgba(0,0,0,0.08)]'
                    : 'text-neutral-500 hover:text-[#1D1D1F]'
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          {/* Project Type Filter */}
          <select
            value={selectedProjectType}
            onChange={(e) => setSelectedProjectType(e.target.value)}
            className="px-3 py-1.5 text-xs font-semibold border border-black/[0.08] rounded-full bg-white text-neutral-700 focus:border-[#E6002D] outline-none cursor-pointer"
          >
            <option value="전체">유형: 전체</option>
            <option value="졸업작품">졸업작품</option>
            <option value="캡스톤 디자인">캡스톤 디자인</option>
            <option value="산학협력 프로젝트">산학협력 프로젝트</option>
            <option value="동아리/학회">동아리/창작회</option>
            <option value="공모전 수상작">공모전/영화제 수상작</option>
            <option value="개인 연구/사이드">개인 연구/사이드</option>
          </select>

          {/* Sort By Toggle Buttons (Latest vs Popular) */}
          <div className="flex bg-black/[0.04] rounded-full p-1">
            <button
              onClick={() => setSortBy('recent')}
              className={`px-3 py-1 text-xs font-semibold rounded-full cursor-pointer transition-all ${
                sortBy === 'recent'
                  ? 'bg-white text-[#1D1D1F] shadow-[0_1px_3px_rgba(0,0,0,0.08)]'
                  : 'text-neutral-500 hover:text-[#1D1D1F]'
              }`}
            >
              최신순
            </button>
            <button
              onClick={() => setSortBy('likes')}
              className={`px-3 py-1 text-xs font-semibold rounded-full cursor-pointer transition-all ${
                sortBy === 'likes'
                  ? 'bg-white text-[#1D1D1F] shadow-[0_1px_3px_rgba(0,0,0,0.08)]'
                  : 'text-neutral-500 hover:text-[#1D1D1F]'
              }`}
            >
              인기순
            </button>
          </div>
        </div>
      </div>

      {/* Result Count Status */}
      <div className="flex items-center justify-between text-xs text-neutral-500 px-1 font-medium">
        <div>
          서울예술대학교 인증 아카이브 총 <strong className="text-[#E6002D] font-bold">{filteredProjects.length}</strong>건
        </div>
        {(selectedCategory !== '전체' || selectedStatus !== '전체' || selectedProjectType !== '전체' || searchQuery) && (
          <button
            onClick={() => {
              setSelectedCategory('전체');
              setSelectedStatus('전체');
              setSelectedProjectType('전체');
              setSearchQuery('');
            }}
            className="text-[#E6002D] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>필터 초기화</span>
          </button>
        )}
      </div>

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <div className="text-center py-20 bg-white border border-black/[0.08] rounded-3xl p-8">
          <div className="w-12 h-12 mx-auto rounded-full bg-black/[0.04] flex items-center justify-center text-neutral-400 mb-3">
            <Search className="w-5 h-5" />
          </div>
          <h4 className="font-semibold text-[#1D1D1F] text-sm mb-1 tracking-tight">
            일치하는 포트폴리오를 찾을 수 없습니다
          </h4>
          <p className="text-xs text-neutral-400 max-w-sm mx-auto mb-4">
            검색어를 변경하거나 선택한 학과 및 전공 필터를 초기화해 보세요.
          </p>
          <button
            onClick={() => {
              setSelectedCategory('전체');
              setSelectedStatus('전체');
              setSelectedProjectType('전체');
              setSearchQuery('');
            }}
            className="px-4 py-2 bg-[#1D1D1F] text-white rounded-full text-xs font-semibold cursor-pointer hover:bg-black transition-colors"
          >
            모든 필터 초기화
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
          {filteredProjects.map((project) => (
            <PortfolioCard
              key={project.id}
              project={project}
              onClick={() => onSelectProject(project)}
              onLike={(e) => {
                e.stopPropagation();
                onToggleLike(project.id);
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};
