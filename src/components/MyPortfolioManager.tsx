import React from 'react';
import { PortfolioProject, UserProfile, ScoutOffer } from '../types';
import { 
  Plus, 
  Edit3, 
  Trash2, 
  Eye, 
  Heart, 
  ShieldCheck, 
  Globe, 
  Lock, 
  Layers 
} from 'lucide-react';

interface MyPortfolioManagerProps {
  currentUser: UserProfile;
  myProjects: PortfolioProject[];
  scoutOffers: ScoutOffer[];
  onOpenUpload: () => void;
  onEditProject: (project: PortfolioProject) => void;
  onDeleteProject: (projectId: string) => void;
  onTogglePublish: (projectId: string) => void;
  onSelectProject: (project: PortfolioProject) => void;
  onOpenPortalAuth: () => void;
}

export const MyPortfolioManager: React.FC<MyPortfolioManagerProps> = ({
  currentUser,
  myProjects,
  scoutOffers,
  onOpenUpload,
  onEditProject,
  onDeleteProject,
  onTogglePublish,
  onSelectProject,
  onOpenPortalAuth,
}) => {
  const totalViews = myProjects.reduce((acc, p) => acc + p.views, 0);
  const totalLikes = myProjects.reduce((acc, p) => acc + p.likes, 0);

  return (
    <div className="space-y-6">
      {/* Profile Overview Card (Apple Squircle Header) */}
      <div className="bg-white border border-black/[0.08] rounded-3xl p-6 sm:p-7 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 bg-[#E6002D] text-white font-bold text-xl flex items-center justify-center rounded-3xl shadow-[0_4px_12px_rgba(230,0,45,0.25)] shrink-0">
            {currentUser.realName.slice(-2)}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-semibold text-[#1D1D1F] tracking-tight">
                {currentUser.realName}
              </h2>
              <ShieldCheck className="w-5 h-5 text-[#E6002D]" />
              <span className="bg-[#E6002D] text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">
                {currentUser.status}
              </span>
              <span className="text-[10px] bg-[#E6002D]/10 text-[#E6002D] font-medium px-2 py-0.5 rounded-full">
                서울예술대학교 인증
              </span>
            </div>
            <p className="text-xs sm:text-sm text-neutral-500 mt-1 font-normal">
              {currentUser.university} • {currentUser.department} (학번 {currentUser.studentId})
            </p>
            {currentUser.roleOrCompany && (
              <p className="text-xs text-[#E6002D] font-medium mt-0.5">
                {currentUser.roleOrCompany}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto">
          <button
            onClick={onOpenPortalAuth}
            className="flex-1 md:flex-none px-4 py-2 bg-black/[0.04] hover:bg-black/[0.08] text-neutral-800 text-xs font-semibold rounded-full transition-colors cursor-pointer"
          >
            학적 정보 확인
          </button>
          <button
            onClick={onOpenUpload}
            className="flex-1 md:flex-none px-5 py-2 bg-[#E6002D] hover:bg-[#D60027] text-white text-xs font-semibold rounded-full flex items-center justify-center gap-1.5 shadow-[0_2px_8px_rgba(230,0,45,0.2)] active:scale-[0.98] transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>새 작업 업로드</span>
          </button>
        </div>
      </div>

      {/* Metrics Row (Apple Stat Cards) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-white border border-black/[0.08] p-4 sm:p-5 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
          <span className="text-xs font-medium text-neutral-400 block mb-1">
            등록 작품 수
          </span>
          <span className="text-2xl sm:text-3xl font-semibold text-[#1D1D1F] tracking-tight">
            {myProjects.length}
          </span>
        </div>

        <div className="bg-white border border-black/[0.08] p-4 sm:p-5 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
          <span className="text-xs font-medium text-neutral-400 block mb-1">
            동문 총 조회수
          </span>
          <span className="text-2xl sm:text-3xl font-semibold text-[#1D1D1F] tracking-tight">
            {totalViews.toLocaleString()}
          </span>
        </div>

        <div className="bg-white border border-black/[0.08] p-4 sm:p-5 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
          <span className="text-xs font-medium text-neutral-400 block mb-1">
            받은 추천 수
          </span>
          <span className="text-2xl sm:text-3xl font-semibold text-[#E6002D] tracking-tight">
            {totalLikes.toLocaleString()}
          </span>
        </div>

        <div className="bg-white border border-black/[0.08] p-4 sm:p-5 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
          <span className="text-xs font-medium text-neutral-400 block mb-1">
            스카우트 제안
          </span>
          <span className="text-2xl sm:text-3xl font-semibold text-[#E6002D] tracking-tight">
            {scoutOffers.length}
          </span>
        </div>
      </div>

      {/* Projects List & Management Controls */}
      <div className="bg-white border border-black/[0.08] rounded-3xl overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
        <div className="p-4 sm:p-5 border-b border-black/[0.06] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#E6002D]" />
            <h3 className="font-semibold text-xs sm:text-sm text-[#1D1D1F] tracking-tight">
              내 등록 작품 관리 ({myProjects.length})
            </h3>
          </div>
          <button
            onClick={onOpenUpload}
            className="text-xs text-[#E6002D] hover:text-[#C50026] font-semibold flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>새 작품 추가</span>
          </button>
        </div>

        {myProjects.length === 0 ? (
          <div className="p-12 text-center">
            <Layers className="w-10 h-10 text-neutral-300 mx-auto mb-3" />
            <h4 className="text-sm font-semibold text-[#1D1D1F] mb-1">
              아직 등록된 작품이 없습니다
            </h4>
            <p className="text-xs text-neutral-500 mb-4 max-w-md mx-auto">
              졸업작품, 캡스톤 디자인, 동아리 창작 프로젝트를 아카이빙하고 현업 동문 리더들의 스카우트 제안을 받아보세요.
            </p>
            <button
              onClick={onOpenUpload}
              className="px-5 py-2.5 bg-[#E6002D] hover:bg-[#D60027] text-white rounded-full text-xs font-semibold cursor-pointer shadow-xs active:scale-[0.98] transition-all"
            >
              첫 번째 작품 업로드
            </button>
          </div>
        ) : (
          <div className="divide-y divide-black/[0.05]">
            {myProjects.map((project) => (
              <div
                key={project.id}
                className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-neutral-50/70 transition-colors"
              >
                {/* Thumbnail & Title Info */}
                <div
                  onClick={() => onSelectProject(project)}
                  className="flex items-center gap-4 min-w-0 cursor-pointer group flex-1"
                >
                  <img
                    src={project.coverImageUrl}
                    alt={project.title}
                    className="w-20 h-14 object-cover rounded-xl border border-black/[0.08] shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] bg-[#E6002D] text-white font-semibold px-2 py-0.5 rounded-full">
                        {project.category}
                      </span>
                      <span className="text-[10px] bg-black/[0.04] text-neutral-700 font-medium px-2 py-0.5 rounded-full">
                        {project.projectType}
                      </span>
                      {project.isPublished ? (
                        <span className="text-[10px] text-[#E6002D] font-medium flex items-center gap-0.5">
                          <Globe className="w-3 h-3" />
                          공개 중
                        </span>
                      ) : (
                        <span className="text-[10px] text-neutral-400 font-medium flex items-center gap-0.5">
                          <Lock className="w-3 h-3" />
                          비공개
                        </span>
                      )}
                    </div>
                    <h4 className="text-sm font-semibold text-[#1D1D1F] group-hover:text-[#E6002D] truncate transition-colors">
                      {project.title}
                    </h4>
                    <div className="flex items-center gap-3 text-xs text-neutral-400 mt-1 font-normal">
                      <span>{project.createdAt}</span>
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3 text-neutral-400" />
                        {project.views}
                      </span>
                      <span className="flex items-center gap-1 text-[#E6002D] font-medium">
                        <Heart className="w-3 h-3 fill-[#E6002D]" />
                        {project.likes}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Management Action Buttons */}
                <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end border-t sm:border-t-0 pt-2 sm:pt-0">
                  <button
                    onClick={() => onSelectProject(project)}
                    className="px-3.5 py-1.5 bg-black/[0.04] hover:bg-black/[0.08] text-neutral-700 rounded-full text-xs font-semibold cursor-pointer transition-colors"
                  >
                    상세보기
                  </button>

                  <button
                    onClick={() => onTogglePublish(project.id)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold cursor-pointer transition-colors ${
                      project.isPublished
                        ? 'bg-black/[0.04] text-neutral-600 hover:bg-black/[0.08]'
                        : 'bg-[#E6002D]/10 text-[#E6002D]'
                    }`}
                  >
                    {project.isPublished ? '비공개 전환' : '공개'}
                  </button>

                  <button
                    onClick={() => onEditProject(project)}
                    className="px-3.5 py-1.5 bg-white border border-black/[0.08] hover:border-black/20 text-neutral-800 rounded-full text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Edit3 className="w-3 h-3 text-[#E6002D]" />
                    수정
                  </button>

                  <button
                    onClick={() => onDeleteProject(project.id)}
                    className="w-7 h-7 rounded-full bg-black/[0.04] hover:bg-red-50 hover:text-[#E6002D] flex items-center justify-center text-neutral-400 cursor-pointer transition-colors"
                    title="작품 삭제"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
