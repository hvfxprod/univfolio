import { api } from './auth';
import React, { useState, useEffect } from 'react';
import { 
  UserProfile, 
  PortfolioProject, 
  JobPosting, 
  ScoutOffer 
} from './types';
import { Navbar } from './components/Navbar';
import { PortfolioGrid } from './components/PortfolioGrid';
import { PortfolioDetailModal } from './components/PortfolioDetailModal';
import { PortfolioEditorModal } from './components/PortfolioEditorModal';
import { PortalAuthModal } from './components/PortalAuthModal';
import { ScoutModal } from './components/ScoutModal';
import { CareerSection } from './components/CareerSection';
import { MyPortfolioManager } from './components/MyPortfolioManager';
import { ShieldCheck, Plus, CheckCircle2 } from 'lucide-react';

export default function App({initialUser,isAdmin}:{initialUser:UserProfile;isAdmin:boolean}) {
  const [currentUser,setCurrentUser]=useState(initialUser);
  const [projects, setProjects] = useState<PortfolioProject[]>([]);
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [scoutOffers, setScoutOffers] = useState<ScoutOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [dbError, setDbError] = useState('');
  const [importing, setImporting] = useState(false);
  const [hasLegacy, setHasLegacy] = useState(() => !!localStorage.getItem('seoularts_projects'));
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

  const receive = (data: { projects: PortfolioProject[]; jobs: JobPosting[]; scouts: ScoutOffer[] }) => {
    setProjects(data.projects); setJobs(data.jobs); setScoutOffers(data.scouts.filter(s => s.receiverUserId === currentUser.id));
    setSelectedProject(p => p ? data.projects.find(row => row.id === p.id) || null : null);
  };
  const request = (payload?:object) => api(payload?'action':'state',payload);
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    request().then(data => { if (!cancelled) { receive(data); setDbError(''); const saved = data.profiles.find((p: UserProfile) => p.id === currentUser.id); if (saved) setCurrentUser(saved); } })
      .catch(e => { if (!cancelled) setDbError(e.message); }).finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [currentUser.id]);
  const action = async (payload: object) => { const data = await request(payload); receive(data); return data; };
  const report = (promise: Promise<unknown>) => { void promise.catch(e => showToast(e.message)); };
  const handleToggleLike = (id: string) => report(action({ action: 'like', id }));
  const handleSelectProject = (project: PortfolioProject) => {
    setSelectedProject(project); report(action({ action: 'view', id: project.id }));
  };
  const handleAddComment = async (id: string, content: string) => {
    await action({ action: 'comment', id, content, author: currentUser }); showToast('피드백이 DB에 저장되었습니다.');
  };
  const handleSaveProject = async (project: PortfolioProject) => {
    await action({ action: 'save', kind: 'projects', item: project }); showToast('작품이 DB에 저장되었습니다.'); setEditingProject(null);
  };
  const handleDeleteProject = (id: string) => {
    if (window.confirm('해당 작품을 삭제하시겠습니까?')) report(action({ action: 'delete', id }).then(() => showToast('작품이 삭제되었습니다.')));
  };
  const handleTogglePublish = (id: string) => report(action({ action: 'publish', id }));
  const handleApplyJob = async (id: string, portfolioId: string) => { await action({ action: 'apply', id, portfolioId }); showToast('지원 내역이 DB에 저장되었습니다.'); };
  const handlePostJob = async (item: JobPosting) => { await action({ action: 'save', kind: 'jobs', item }); showToast('채용 공고가 DB에 저장되었습니다.'); };
  const handleSendScoutOffer = async (item: ScoutOffer) => { await action({ action: 'save', kind: 'scouts', item }); showToast('스카우트 제안이 DB에 저장되었습니다.'); };
  const handleUpdateScoutStatus = (id: string, status: ScoutOffer['status']) => report(action({ action: 'scoutStatus', id, status }));
  const importLegacy = async () => {
    if (!window.confirm('이 브라우저의 기존 자료를 공용 서버 DB로 가져옵니다. 동일 ID의 서버 자료는 덮어쓰지 않습니다. 계속할까요?')) return;
    setImporting(true);
    try {
      const data = await action({ action: 'import', projects: JSON.parse(localStorage.getItem('seoularts_projects') || '[]'), jobs: JSON.parse(localStorage.getItem('seoularts_jobs') || '[]'), scouts: JSON.parse(localStorage.getItem('seoularts_scout_offers') || '[]') });
      showToast(`${data.imported}건을 가져왔습니다. 기존 브라우저 원본은 유지됩니다.`); setHasLegacy(false);
    } catch(e) { showToast(e instanceof Error ? e.message : '가져오기에 실패했습니다.'); }
    finally { setImporting(false); }
  };
  // Filter projects owned by current user
  const myProjects = projects.filter(
    (p) =>
      p.author.id === currentUser.id
  );

  if (loading || dbError) return <div className="p-10 text-center"><h1 className="text-xl font-semibold">{loading ? '서버 DB를 불러오는 중입니다…' : '서버 DB에 연결하지 못했습니다.'}</h1>{dbError && <><p className="my-4">{dbError}</p><button onClick={() => window.location.reload()}>다시 시도</button></>}</div>;
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

      <div className="bg-slate-100 px-6 py-3 text-xs text-slate-600 flex flex-wrap gap-3 items-center justify-center">
        <span>관리자 승인 회원 전용 · 서버 DB에 안전하게 저장됩니다.</span>
        {isAdmin && hasLegacy && <button disabled={importing} onClick={importLegacy} className="font-semibold underline">{importing ? '가져오는 중…' : '기존 브라우저 자료 가져오기'}</button>}
      </div>
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
                      회원 전용 아카이브
                    </span>
                    <span className="text-xs font-semibold text-[#E6002D] flex items-center gap-1 justify-end">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      관리자 승인 네트워크
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
            <span>학교 공식 DB 미연결</span>
            <span>•</span>
            <button
              onClick={() => setIsPortalAuthOpen(true)}
              className="text-[#E6002D] hover:underline font-medium cursor-pointer"
            >
              내 프로필
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
        onUpdateUser={async (updated) => {
          await action({ action: 'save', kind: 'profiles', item: updated });
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

