import React, { useState, useEffect } from 'react';
import { 
  UserProfile, 
  PortfolioProject, 
  JobPosting, 
  ScoutOffer 
} from './types';
import { 
  CURRENT_USER_DEFAULT, 
  INITIAL_PROJECTS, 
  INITIAL_JOBS, 
  INITIAL_SCOUT_OFFERS 
} from './data/mockData';
import { Navbar } from './components/Navbar';
import { PortfolioGrid } from './components/PortfolioGrid';
import { PortfolioDetailModal } from './components/PortfolioDetailModal';
import { PortfolioEditorModal } from './components/PortfolioEditorModal';
import { PortalAuthModal } from './components/PortalAuthModal';
import { ScoutModal } from './components/ScoutModal';
import { CareerSection } from './components/CareerSection';
import { MyPortfolioManager } from './components/MyPortfolioManager';
import { ShieldCheck, Plus, CheckCircle2 } from 'lucide-react';

export default function App() {
  // 1. Current User State (Reset if stale university in localStorage)
  const [currentUser, setCurrentUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('seoularts_current_user');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.university === '서울예술대학교') return parsed;
      } catch {}
    }
    return CURRENT_USER_DEFAULT;
  });

  // 2. Projects State (Reset if stale in localStorage)
  const [projects, setProjects] = useState<PortfolioProject[]>(() => {
    const saved = localStorage.getItem('seoularts_projects');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed[0]?.author?.university === '서울예술대학교') {
          return parsed;
        }
      } catch {}
    }
    return INITIAL_PROJECTS;
  });

  // 3. Jobs State
  const [jobs, setJobs] = useState<JobPosting[]>(() => {
    const saved = localStorage.getItem('seoularts_jobs');
    return saved ? JSON.parse(saved) : INITIAL_JOBS;
  });

  // 4. Scout Offers State
  const [scoutOffers, setScoutOffers] = useState<ScoutOffer[]>(() => {
    const saved = localStorage.getItem('seoularts_scout_offers');
    return saved ? JSON.parse(saved) : INITIAL_SCOUT_OFFERS;
  });

  // Navigation State
  const [activeTab, setActiveTab] = useState<'explore' | 'careers' | 'my-portfolio'>('explore');

  // Modals State
  const [selectedProject, setSelectedProject] = useState<PortfolioProject | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<PortfolioProject | null>(null);
  const [isPortalAuthOpen, setIsPortalAuthOpen] = useState(false);
  const [scoutTargetProject, setScoutTargetProject] = useState<PortfolioProject | null>(null);

  // Toast State
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  // Sync to LocalStorage
  useEffect(() => {
    localStorage.setItem('seoularts_current_user', JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('seoularts_projects', JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem('seoularts_jobs', JSON.stringify(jobs));
  }, [jobs]);

  useEffect(() => {
    localStorage.setItem('seoularts_scout_offers', JSON.stringify(scoutOffers));
  }, [scoutOffers]);

  // Handler: Toggle Like
  const handleToggleLike = (projectId: string) => {
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id === projectId) {
          const isLiked = !p.likedByMe;
          return {
            ...p,
            likedByMe: isLiked,
            likes: isLiked ? p.likes + 1 : p.likes - 1,
          };
        }
        return p;
      })
    );

    // If detail modal is open for this project, update it too
    if (selectedProject?.id === projectId) {
      setSelectedProject((prev) =>
        prev
          ? {
              ...prev,
              likedByMe: !prev.likedByMe,
              likes: !prev.likedByMe ? prev.likes + 1 : prev.likes - 1,
            }
          : null
      );
    }
  };

  // Handler: View count increment on project selection
  const handleSelectProject = (project: PortfolioProject) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === project.id ? { ...p, views: p.views + 1 } : p))
    );
    setSelectedProject({ ...project, views: project.views + 1 });
  };

  // Handler: Add Comment
  const handleAddComment = (projectId: string, content: string) => {
    const newComment = {
      id: `c-${Date.now()}`,
      author: currentUser,
      content,
      createdAt: new Date().toISOString().slice(0, 10).replace(/-/g, '.'),
    };

    setProjects((prev) =>
      prev.map((p) =>
        p.id === projectId ? { ...p, comments: [newComment, ...p.comments] } : p
      )
    );

    if (selectedProject?.id === projectId) {
      setSelectedProject((prev) =>
        prev ? { ...prev, comments: [newComment, ...prev.comments] } : null
      );
    }

    showToast('동문 실명 피드백이 등록되었습니다.');
  };

  // Handler: Save (Create or Edit) Project
  const handleSaveProject = (project: PortfolioProject) => {
    const exists = projects.some((p) => p.id === project.id);
    const nextProjects = exists ? projects.map(p => p.id === project.id ? project : p) : [project, ...projects];
    // Persist before announcing success; quota failures keep the editor open.
    localStorage.setItem('seoularts_projects', JSON.stringify(nextProjects));
    if (exists) {
      setProjects((prev) => prev.map((p) => (p.id === project.id ? project : p)));
      showToast('작품 정보가 성공적으로 수정되었습니다.');
    } else {
      setProjects((prev) => [project, ...prev]);
      showToast('새 작품이 정상 등록되었습니다!');
    }
    setEditingProject(null);
  };

  // Handler: Delete Project
  const handleDeleteProject = (projectId: string) => {
    if (window.confirm('해당 작품을 삭제하시겠습니까?')) {
      setProjects((prev) => prev.filter((p) => p.id !== projectId));
      showToast('작품이 삭제되었습니다.');
    }
  };

  // Handler: Toggle Project Publish
  const handleTogglePublish = (projectId: string) => {
    setProjects((prev) =>
      prev.map((p) =>
        p.id === projectId ? { ...p, isPublished: !p.isPublished } : p
      )
    );
  };

  // Handler: Apply to Job
  const handleApplyJob = (jobId: string, portfolioId: string) => {
    setJobs((prev) =>
      prev.map((j) =>
        j.id === jobId ? { ...j, applicantsCount: j.applicantsCount + 1 } : j
      )
    );
    showToast('동문 추천 채용 지원이 완료되었습니다.');
  };

  // Handler: Post New Job
  const handlePostJob = (newJob: JobPosting) => {
    setJobs((prev) => [newJob, ...prev]);
    showToast('동문 추천 채용 공고가 등록되었습니다.');
  };

  // Handler: Send Scout Offer
  const handleSendScoutOffer = (offer: ScoutOffer) => {
    setScoutOffers((prev) => [offer, ...prev]);
    showToast(`${offer.sender.realName} 동문님의 스카우트 제안이 전송되었습니다.`);
  };

  // Handler: Update Scout Status
  const handleUpdateScoutStatus = (scoutId: string, newStatus: ScoutOffer['status']) => {
    setScoutOffers((prev) =>
      prev.map((s) => (s.id === scoutId ? { ...s, status: newStatus } : s))
    );
    showToast(`스카우트 제안이 '${newStatus}'(으)로 변경되었습니다.`);
  };

  // Filter projects owned by current user
  const myProjects = projects.filter(
    (p) =>
      p.author.studentId === currentUser.studentId ||
      p.author.realName === currentUser.realName
  );

  return (
    <div className="min-h-screen bg-[#F5F5F7] text-[#1D1D1F] flex flex-col selection:bg-[#E6002D] selection:text-white">
      {/* Global Navbar (Apple Glass) */}
      <Navbar
        currentUser={currentUser}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenUpload={() => {
          setEditingProject(null);
          setIsUploadModalOpen(true);
        }}
        onOpenPortalAuth={() => setIsPortalAuthOpen(true)}
        unreadScoutCount={scoutOffers.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab 1: Explore Showcase */}
        {activeTab === 'explore' && (
          <div className="space-y-8">
            {/* Apple Style Section Header */}
            <div className="bg-white/80 backdrop-blur-md border border-black/[0.08] rounded-3xl p-6 sm:p-8 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-5">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-2 h-2 bg-[#E6002D] rounded-full" />
                    <span className="text-[11px] font-bold tracking-wider text-[#E6002D] uppercase">
                      SEOUL INSTITUTE OF THE ARTS ARCHIVE
                    </span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-[#1D1D1F] tracking-tight">
                    서울예술대학교 실명 포트폴리오 아카이브
                  </h1>
                  <p className="text-xs sm:text-sm text-neutral-500 mt-2 max-w-2xl font-normal leading-relaxed">
                    재학생 및 졸업 동문의 미디어아트, 디지털아트, 영상, 디자인 창작 성과를 탐색하고 문화예술계 현업 동문 리더들과 스카우트 기회를 연결합니다.
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right hidden sm:block">
                    <span className="text-[10px] text-neutral-400 block font-medium">
                      포털 종합정보시스템
                    </span>
                    <span className="text-xs font-semibold text-[#E6002D] flex items-center gap-1 justify-end">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      학적 인증 네트워크
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      setEditingProject(null);
                      setIsUploadModalOpen(true);
                    }}
                    className="bg-[#E6002D] hover:bg-[#D60027] text-white font-semibold text-xs sm:text-sm px-5 py-2.5 rounded-full flex items-center gap-2 shadow-[0_2px_8px_rgba(230,0,45,0.2)] active:scale-[0.98] transition-all cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>작업 업로드</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Gallery Grid */}
            <PortfolioGrid
              projects={projects}
              onSelectProject={handleSelectProject}
              onToggleLike={handleToggleLike}
            />
          </div>
        )}

        {/* Tab 2: Alumni Careers & Scouting */}
        {activeTab === 'careers' && (
          <CareerSection
            jobs={jobs}
            scoutOffers={scoutOffers}
            currentUser={currentUser}
            userProjects={myProjects}
            onApplyJob={handleApplyJob}
            onPostJob={handlePostJob}
            onUpdateScoutStatus={handleUpdateScoutStatus}
          />
        )}

        {/* Tab 3: My Portfolio & Profile Management */}
        {activeTab === 'my-portfolio' && (
          <MyPortfolioManager
            currentUser={currentUser}
            myProjects={myProjects}
            scoutOffers={scoutOffers}
            onOpenUpload={() => {
              setEditingProject(null);
              setIsUploadModalOpen(true);
            }}
            onEditProject={(project) => {
              setEditingProject(project);
              setIsUploadModalOpen(true);
            }}
            onDeleteProject={handleDeleteProject}
            onTogglePublish={handleTogglePublish}
            onSelectProject={handleSelectProject}
            onOpenPortalAuth={() => setIsPortalAuthOpen(true)}
          />
        )}
      </main>

      {/* Global Toast Notification (Apple Capsule Toast) */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1D1D1F]/90 backdrop-blur-md text-white border border-white/10 px-4 py-2.5 rounded-full shadow-[0_12px_24px_rgba(0,0,0,0.18)] text-xs font-medium flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-[#E6002D]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Footer (Minimalist Apple Style) */}
      <footer className="border-t border-black/[0.06] bg-white/70 backdrop-blur-md py-8 mt-16 text-xs text-neutral-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-lg bg-[#E6002D] text-white font-bold text-xs flex items-center justify-center shadow-xs">
              예
            </div>
            <span className="font-semibold text-[#1D1D1F]">
              SeoulArts <span className="text-[#E6002D]">Archive</span>
            </span>
            <span className="text-neutral-300">|</span>
            <span>서울예술대학교 재학생 및 졸업 동문 전용 창작 포트폴리오 아카이브</span>
          </div>

          <div className="flex items-center gap-3 text-neutral-500 font-normal text-xs">
            <span>종합정보시스템 학적 인증 연동</span>
            <span>•</span>
            <button
              onClick={() => setIsPortalAuthOpen(true)}
              className="text-[#E6002D] hover:underline font-medium cursor-pointer"
            >
              학적 인증 변경
            </button>
          </div>
        </div>
      </footer>

      {/* Project Detail Showcase Modal */}
      <PortfolioDetailModal
        project={selectedProject}
        onClose={() => setSelectedProject(null)}
        currentUser={currentUser}
        onToggleLike={handleToggleLike}
        onAddComment={handleAddComment}
        onOpenScoutModal={(proj) => setScoutTargetProject(proj)}
      />

      {/* Portfolio Editor (Create / Edit) Modal */}
      <PortfolioEditorModal
        isOpen={isUploadModalOpen}
        onClose={() => {
          setIsUploadModalOpen(false);
          setEditingProject(null);
        }}
        currentUser={currentUser}
        onSave={handleSaveProject}
        initialProject={editingProject}
      />

      {/* Real-Name University Student Portal Auth Modal */}
      <PortalAuthModal
        isOpen={isPortalAuthOpen}
        onClose={() => setIsPortalAuthOpen(false)}
        currentUser={currentUser}
        onUpdateUser={(updated) => {
          setCurrentUser(updated);
          showToast(`'${updated.realName}' 학우의 실명 정보가 반영되었습니다.`);
        }}
      />

      {/* Direct Scout Proposal Modal */}
      <ScoutModal
        isOpen={!!scoutTargetProject}
        onClose={() => setScoutTargetProject(null)}
        targetProject={scoutTargetProject}
        currentUser={currentUser}
        onSendScout={handleSendScoutOffer}
      />
    </div>
  );
}

