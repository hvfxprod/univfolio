import './PortfolioDetailPage.css';
import { Avatar } from './Avatar';
import { ProjectLinks } from './ProjectLinks';
import { PortfolioBlocks } from './PortfolioBlocks';
import React, { useState, useEffect } from 'react';
import { PortfolioProject, UserProfile } from '../types';
import { 
  ArrowLeft, 
  Heart, 
  Share2, 
  Send, 
  ShieldCheck, 
  Calendar, 
  Users, 
  Wrench, 
  MessageSquare, 
  CheckCircle2 
} from 'lucide-react';

interface PortfolioDetailPageProps {
  project: PortfolioProject | null;
  onClose: () => void;
  currentUser: UserProfile;
  onToggleLike: (projectId: string) => void;
  onAddComment: (projectId: string, content: string) => Promise<void>;
  onOpenScoutModal: (project: PortfolioProject) => void;
}

export const PortfolioDetailPage: React.FC<PortfolioDetailPageProps> = ({
  project,
  onClose,
  currentUser,
  onToggleLike,
  onAddComment,
  onOpenScoutModal,
}) => {
  const [commentInput, setCommentInput] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    if (project) {
      window.scrollTo({ top: 0, behavior: 'instant' });
      setCommentInput('');
      setCopiedLink(false);
    }
  }, [project?.id]);

  if (!project) return null;

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim()) return;
    try { await onAddComment(project.id, commentInput.trim()); } catch (e) { window.alert(e instanceof Error ? e.message : '저장 실패'); return; }
    setCommentInput('');
  };

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="project-article w-full min-h-screen bg-white">
      {/* Full-page project content */}
      <div className="bg-white w-full">
        
        {/* Sticky Translucent Header Nav */}
        <div className="max-w-[1120px] mx-auto bg-white px-5 sm:px-8 py-5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0 pr-4">
            <div className="w-9 h-9 bg-[#E6002D] text-white font-semibold text-xs flex items-center justify-center rounded-2xl shadow-xs shrink-0">
              <Avatar user={project.author} />
            </div>
            <div className="truncate">
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-sm text-[#1D1D1F] truncate">
                  {project.author.realName}
                </span>
                <ShieldCheck className="w-4 h-4 text-[#E6002D] shrink-0" />
                <span className="text-[11px] bg-[#E6002D]/10 text-[#E6002D] font-medium px-2 py-0.5 rounded-full shrink-0">
                  {project.author.status} • {project.author.matriculationYear}
                </span>
              </div>
              <p className="text-xs text-neutral-400 truncate font-normal">
                {project.author.department}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Scout button */}
            <button
              onClick={() => onOpenScoutModal(project)}
              className="bg-[#E6002D] hover:bg-[#D60027] text-white text-xs font-semibold px-4 py-2 rounded-full flex items-center gap-1.5 shadow-[0_2px_8px_rgba(230,0,45,0.2)] transition-all active:scale-[0.98] cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">스카우트 / 커피챗</span>
              <span className="sm:hidden">스카우트</span>
            </button>

            {/* Like */}
            <button
              onClick={() => onToggleLike(project.id)}
              className={`px-3 py-2 rounded-full border text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 ${
                project.likedByMe
                  ? 'bg-[#E6002D]/10 text-[#E6002D] border-[#E6002D]/20'
                  : 'bg-white text-neutral-700 border-black/[0.08] hover:border-black/20'
              }`}
            >
              <Heart
                className={`w-3.5 h-3.5 ${
                  project.likedByMe ? 'fill-[#E6002D] text-[#E6002D]' : ''
                }`}
              />
              <span className="hidden sm:inline">{project.likes}</span>
            </button>

            {/* Share */}
            <button
              onClick={handleCopyLink}
              className="p-2 rounded-full border border-black/[0.08] text-neutral-600 hover:text-black hover:bg-black/[0.04] transition-colors cursor-pointer"
              title="링크 복사"
            >
              {copiedLink ? (
                <CheckCircle2 className="w-4 h-4 text-[#E6002D]" />
              ) : (
                <Share2 className="w-4 h-4" />
              )}
            </button>

            {/* Return to the previous list or profile */}
            <button
              onClick={onClose}
              aria-label="목록으로 돌아가기"
              title="목록으로 돌아가기"
              className="px-3 h-8 gap-1.5 rounded-full bg-black/[0.05] hover:bg-black/[0.08] flex items-center justify-center text-neutral-600 hover:text-black text-xs transition-colors cursor-pointer ml-1"
            >
              <ArrowLeft className="w-4 h-4" /><span>돌아가기</span>
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="bg-white">
          <section className="project-article-hero" aria-label="작품 소개">
            <figure className="project-article-cover">
              <img src={project.coverImageUrl} alt={project.title} />
            </figure>
            <div className="project-article-heading">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="text-[#E6002D] text-xs font-bold tracking-widest uppercase">
                {project.category}
              </span>
              <span className="bg-black/[0.04] text-neutral-700 text-[11px] font-medium px-2.5 py-0.5 rounded-full">
                {project.projectType}
              </span>
              <span className="text-xs text-neutral-500 w-full mt-3 font-medium">
                {project.createdAt} • 조회 {project.views}
              </span>
            </div>

            <h1 className="project-article-title">
              {project.title}
            </h1>
            <p className="text-sm sm:text-base text-neutral-500 mt-2 font-normal leading-relaxed">
              {project.subtitle}
            </p>

            </div>
          </section>
          <div className="project-article-meta">
            {/* Project Metadata Grid (Apple Squircle Chips) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-5 text-xs">
              <div className="min-w-0 py-2">
                <span className="text-neutral-400 font-medium flex items-center gap-1 mb-1">
                  <Calendar className="w-3.5 h-3.5 text-[#E6002D]" />
                  제작 기간
                </span>
                <span className="font-semibold text-neutral-900">{project.period}</span>
              </div>

              <div className="min-w-0 py-2">
                <span className="text-neutral-400 font-medium flex items-center gap-1 mb-1">
                  <Users className="w-3.5 h-3.5 text-[#E6002D]" />
                  역할 및 팀 구성
                </span>
                <span className="font-semibold text-neutral-900">{project.teamInfo}</span>
              </div>

              <div className="min-w-0 py-2">
                <span className="text-neutral-400 font-medium flex items-center gap-1 mb-1">
                  <Wrench className="w-3.5 h-3.5 text-[#E6002D]" />
                  사용 기술 / 툴
                </span>
                <span className="font-semibold text-neutral-900 break-words">
                  {project.toolsUsed.join(', ')}
                </span>
              </div>

              <div className="min-w-0 py-2">
                <span className="text-neutral-400 font-medium flex items-center gap-1 mb-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#E6002D]" />
                  학적 검증
                </span>
                <span className="font-semibold text-[#E6002D]">
                  서울예술대학교
                </span>
              </div>
            </div>

            <ProjectLinks project={project}/>
          </div>

          {/* Executive Summary Box */}
          <div className="max-w-[800px] mx-auto px-5 sm:px-10 py-8">
            <div className="border-l-2 border-[#E6002D] pl-5 py-1">
              <h3 className="text-xs font-semibold text-[#E6002D] uppercase tracking-wider mb-2">
                PROJECT NOTE
              </h3>
              <p className="text-sm sm:text-base text-neutral-800 leading-relaxed font-normal">
                {project.summary}
              </p>
            </div>
          </div>

          {/* Dynamic Content Blocks */}
          <div className="max-w-[800px] mx-auto px-5 sm:px-10 space-y-10 pb-12">
            <PortfolioBlocks blocks={project.blocks} />

            {/* Tags (Apple subtle pills) */}
            <div className="pt-6 border-t border-black/[0.06]">
              <span className="text-[11px] font-semibold text-neutral-400 block mb-2 uppercase tracking-wider">
                PROJECT TAGS
              </span>
              <div className="flex flex-wrap gap-1.5">
                {project.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="text-xs bg-black/[0.04] text-neutral-700 font-medium px-3 py-1 rounded-full"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Author Showcase Card & Scout Action Box (Apple Squircle Card) */}
          <div className="bg-neutral-50/70 border-t border-black/[0.06] py-10 px-6 sm:px-12">
            <div className="project-author-card">
              <div className="project-author-identity">
                <div className="w-16 h-16 bg-[#E6002D] text-white font-bold text-xl flex items-center justify-center rounded-3xl shadow-[0_4px_12px_rgba(230,0,45,0.25)] shrink-0">
                  <Avatar user={project.author} />
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="text-lg font-semibold text-[#1D1D1F]">
                      {project.author.realName}
                    </h4>
                    <ShieldCheck className="w-5 h-5 text-[#E6002D] shrink-0" />
                    <span className="text-[11px] bg-[#E6002D]/10 text-[#E6002D] font-semibold px-2 py-0.5 rounded-full">
                      {project.author.status}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-500 font-normal mt-1">
                    {project.author.university} • {project.author.department} ({project.author.matriculationYear})
                  </p>
                  {project.author.roleOrCompany && (
                    <p className="text-xs text-[#E6002D] font-medium mt-0.5">
                      {project.author.roleOrCompany}
                    </p>
                  )}
                  {project.author.contact?.isPublic && <div className="flex flex-wrap gap-3 mt-3 text-xs text-[#7065bd]">
                    {project.author.contact.email && <a href={`mailto:${project.author.contact.email}`}>{project.author.contact.email}</a>}
                    {project.author.contact.phone && <a href={`tel:${project.author.contact.phone.replace(/[^+0-9]/g,'')}`}>{project.author.contact.phone}</a>}
                  </div>}
                  {project.author.bio && (
                    <p className="text-xs text-neutral-500 mt-2 leading-relaxed whitespace-pre-wrap">
                      "{project.author.bio}"
                    </p>
                  )}
                </div>
              </div>

              <div className="project-author-action">
                <button
                  onClick={() => onOpenScoutModal(project)}
                  className="w-full bg-[#E6002D] hover:bg-[#D60027] text-white font-semibold text-xs px-6 py-3 rounded-full flex items-center justify-center gap-2 shadow-[0_2px_8px_rgba(230,0,45,0.25)] cursor-pointer active:scale-[0.98] transition-all"
                >
                  <Send className="w-4 h-4 shrink-0" />
                  동문 다이렉트 스카우트 제안
                </button>
              </div>
            </div>
          </div>

          {/* Real-Name Comments & Mentorship Feedback Section */}
          <div className="max-w-[800px] mx-auto px-5 sm:px-10 py-10">
            <div className="flex items-center gap-2 mb-6">
              <MessageSquare className="w-5 h-5 text-[#E6002D]" />
              <h3 className="text-sm font-semibold text-[#1D1D1F] tracking-tight">
                동문 멘토링 및 피드백 ({project.comments.length})
              </h3>
            </div>

            {/* Comment Form */}
            <form onSubmit={handleCommentSubmit} className="mb-8">
              <div className="border border-black/[0.08] focus-within:border-[#E6002D] rounded-2xl p-3.5 bg-white shadow-xs transition-all">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-semibold text-[#1D1D1F]">
                    {currentUser.realName}
                  </span>
                  <span className="text-[10px] bg-[#E6002D]/10 text-[#E6002D] font-semibold px-2 py-0.5 rounded-full">
                    {currentUser.status} • {currentUser.matriculationYear}
                  </span>
                  <span className="text-[11px] text-neutral-400 font-normal">
                    (실명 학적으로 등록됩니다)
                  </span>
                </div>
                <textarea
                  rows={3}
                  value={commentInput}
                  onChange={(e) => setCommentInput(e.target.value)}
                  placeholder="동문 창작자에게 전할 질문, 작품 리뷰 또는 따뜻한 응원의 메시지를 남겨보세요."
                  className="w-full text-xs sm:text-sm resize-none outline-none text-neutral-800 placeholder:text-neutral-400 font-normal"
                />
                <div className="flex justify-end pt-2 border-t border-black/[0.04]">
                  <button
                    type="submit"
                    disabled={!commentInput.trim()}
                    className="bg-[#E6002D] hover:bg-[#D60027] text-white text-xs font-semibold px-5 py-2 rounded-full disabled:opacity-40 cursor-pointer shadow-xs active:scale-[0.98] transition-all"
                  >
                    피드백 등록
                  </button>
                </div>
              </div>
            </form>

            {/* Comments List */}
            <div className="space-y-3">
              {project.comments.length === 0 ? (
                <p className="text-xs text-neutral-400 py-6 text-center">
                  등록된 동문 피드백이 없습니다. 첫 번째 멘토링 메시지를 남겨보세요!
                </p>
              ) : (
                project.comments.map((comment) => (
                  <div
                    key={comment.id}
                    className="p-4 bg-black/[0.02] border border-black/[0.06] rounded-2xl flex gap-3.5"
                  >
                    <div className="w-8 h-8 bg-[#E6002D]/10 text-[#E6002D] font-bold text-[11px] flex items-center justify-center rounded-xl shrink-0 mt-0.5">
                      <Avatar user={comment.author} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-xs text-[#1D1D1F]">
                            {comment.author.realName}
                          </span>
                          <ShieldCheck className="w-3.5 h-3.5 text-[#E6002D]" />
                          <span className="text-[10px] bg-white border border-black/[0.08] text-[#E6002D] font-medium px-1.5 py-0.2 rounded-full">
                            {comment.author.status} • {comment.author.matriculationYear}
                          </span>
                          {comment.author.roleOrCompany && (
                            <span className="text-[11px] text-neutral-400 hidden sm:inline font-normal">
                              • {comment.author.roleOrCompany}
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-neutral-400 font-normal">
                          {comment.createdAt}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-neutral-700 leading-relaxed font-normal">
                        {comment.content}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

