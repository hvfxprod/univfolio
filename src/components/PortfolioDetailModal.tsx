import { ProjectLinks } from './ProjectLinks';
import { PortfolioBlocks } from './PortfolioBlocks';
import React, { useState } from 'react';
import { PortfolioProject, UserProfile } from '../types';
import { 
  X, 
  Heart, 
  Share2, 
  Send, 
  ExternalLink, 
  Github, 
  FileText, 
  ShieldCheck, 
  Calendar, 
  Users, 
  Wrench, 
  MessageSquare, 
  CheckCircle2 
} from 'lucide-react';

interface PortfolioDetailModalProps {
  project: PortfolioProject | null;
  onClose: () => void;
  currentUser: UserProfile;
  onToggleLike: (projectId: string) => void;
  onAddComment: (projectId: string, content: string) => Promise<void>;
  onOpenScoutModal: (project: PortfolioProject) => void;
}

export const PortfolioDetailModal: React.FC<PortfolioDetailModalProps> = ({
  project,
  onClose,
  currentUser,
  onToggleLike,
  onAddComment,
  onOpenScoutModal,
}) => {
  const [commentInput, setCommentInput] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 md:p-6 bg-black/40 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      {/* Modal Container (Apple Squircle Sheet) */}
      <div className="bg-white w-full max-w-5xl min-h-screen sm:min-h-0 sm:max-h-[92vh] sm:rounded-3xl overflow-hidden flex flex-col shadow-[0_24px_48px_rgba(0,0,0,0.18)] border border-black/[0.08]">
        
        {/* Sticky Translucent Header Nav */}
        <div className="sticky top-0 z-30 bg-white/85 backdrop-blur-xl border-b border-black/[0.08] px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0 pr-4">
            <div className="w-9 h-9 bg-[#E6002D] text-white font-semibold text-xs flex items-center justify-center rounded-2xl shadow-xs shrink-0">
              {project.author.realName.slice(-2)}
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

            {/* Close */}
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-black/[0.05] hover:bg-black/[0.08] flex items-center justify-center text-neutral-500 hover:text-black transition-colors cursor-pointer ml-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="overflow-y-auto flex-1 bg-white">
          {/* Hero Header Area */}
          <div className="px-6 sm:px-12 pt-8 pb-6 max-w-4xl mx-auto">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="bg-[#E6002D] text-white text-[11px] font-semibold px-2.5 py-0.5 rounded-full">
                {project.category}
              </span>
              <span className="bg-black/[0.04] text-neutral-700 text-[11px] font-medium px-2.5 py-0.5 rounded-full">
                {project.projectType}
              </span>
              <span className="text-xs text-neutral-400 ml-auto font-medium">
                {project.createdAt} • 조회 {project.views}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-[#1D1D1F] tracking-tight leading-snug">
              {project.title}
            </h1>
            <p className="text-sm sm:text-base text-neutral-500 mt-2 font-normal leading-relaxed">
              {project.subtitle}
            </p>

            {/* Project Metadata Grid (Apple Squircle Chips) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8 text-xs">
              <div className="bg-black/[0.02] border border-black/[0.06] rounded-2xl p-3.5">
                <span className="text-neutral-400 font-medium flex items-center gap-1 mb-1">
                  <Calendar className="w-3.5 h-3.5 text-[#E6002D]" />
                  제작 기간
                </span>
                <span className="font-semibold text-neutral-900">{project.period}</span>
              </div>

              <div className="bg-black/[0.02] border border-black/[0.06] rounded-2xl p-3.5">
                <span className="text-neutral-400 font-medium flex items-center gap-1 mb-1">
                  <Users className="w-3.5 h-3.5 text-[#E6002D]" />
                  역할 및 팀 구성
                </span>
                <span className="font-semibold text-neutral-900">{project.teamInfo}</span>
              </div>

              <div className="bg-black/[0.02] border border-black/[0.06] rounded-2xl p-3.5">
                <span className="text-neutral-400 font-medium flex items-center gap-1 mb-1">
                  <Wrench className="w-3.5 h-3.5 text-[#E6002D]" />
                  사용 기술 / 툴
                </span>
                <span className="font-semibold text-neutral-900 line-clamp-1">
                  {project.toolsUsed.join(', ')}
                </span>
              </div>

              <div className="bg-black/[0.02] border border-black/[0.06] rounded-2xl p-3.5">
                <span className="text-neutral-400 font-medium flex items-center gap-1 mb-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#E6002D]" />
                  학적 검증
                </span>
                <span className="font-semibold text-[#E6002D]">
                  서울예술대학교 인증
                </span>
              </div>
            </div>

            <ProjectLinks project={project}/>
          </div>

          {/* Project Cover Presentation */}
          <div className="w-full bg-neutral-100 border-y border-black/[0.06]">
            <img
              src={project.coverImageUrl}
              alt={project.title}
              className="w-full max-h-[640px] object-cover mx-auto"
            />
          </div>

          {/* Executive Summary Box */}
          <div className="max-w-4xl mx-auto px-6 sm:px-12 py-8">
            <div className="p-6 bg-[#E6002D]/[0.03] border border-[#E6002D]/15 rounded-2xl">
              <h3 className="text-xs font-semibold text-[#E6002D] uppercase tracking-wider mb-2">
                Project Overview & Summary
              </h3>
              <p className="text-sm sm:text-base text-neutral-800 leading-relaxed font-normal">
                {project.summary}
              </p>
            </div>
          </div>

          {/* Dynamic Content Blocks */}
          <div className="max-w-4xl mx-auto px-6 sm:px-12 space-y-10 pb-12">
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
            <div className="max-w-4xl mx-auto bg-white border border-black/[0.08] rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-[0_4px_16px_rgba(0,0,0,0.04)]">
              <div className="flex items-center gap-5 text-center sm:text-left">
                <div className="w-16 h-16 bg-[#E6002D] text-white font-bold text-xl flex items-center justify-center rounded-3xl shadow-[0_4px_12px_rgba(230,0,45,0.25)] shrink-0">
                  {project.author.realName.slice(-2)}
                </div>
                <div>
                  <div className="flex items-center justify-center sm:justify-start gap-2">
                    <h4 className="text-lg font-semibold text-[#1D1D1F]">
                      {project.author.realName}
                    </h4>
                    <ShieldCheck className="w-5 h-5 text-[#E6002D]" />
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
                  {project.author.bio && (
                    <p className="text-xs text-neutral-400 mt-2 max-w-md">
                      "{project.author.bio}"
                    </p>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-2 w-full sm:w-auto shrink-0">
                <button
                  onClick={() => onOpenScoutModal(project)}
                  className="w-full sm:w-auto bg-[#E6002D] hover:bg-[#D60027] text-white font-semibold text-xs px-6 py-3 rounded-full flex items-center justify-center gap-2 shadow-[0_2px_8px_rgba(230,0,45,0.25)] cursor-pointer active:scale-[0.98] transition-all"
                >
                  <Send className="w-4 h-4" />
                  동문 다이렉트 스카우트 제안
                </button>
                <p className="text-[10px] text-neutral-400 text-center font-medium">
                  서울예술대학교 실명 인증 동문 네트워크
                </p>
              </div>
            </div>
          </div>

          {/* Real-Name Comments & Mentorship Feedback Section */}
          <div className="max-w-4xl mx-auto px-6 sm:px-12 py-10">
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
                      {comment.author.realName.slice(-2)}
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

