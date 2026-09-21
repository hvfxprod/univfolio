import { Avatar } from './Avatar';
import React, { useState } from 'react';
import { JobPosting, ScoutOffer, UserProfile, PortfolioProject } from '../types';
import { 
  Briefcase, 
  MapPin, 
  Send, 
  ShieldCheck, 
  Plus, 
  X, 
  Inbox, 
  Check 
} from 'lucide-react';

interface CareerSectionProps {
  jobs: JobPosting[];
  scoutOffers: ScoutOffer[];
  currentUser: UserProfile;
  userProjects: PortfolioProject[];
  onApplyJob: (jobId: string, portfolioId: string) => Promise<void>;
  onPostJob: (job: JobPosting) => Promise<void>;
  onUpdateScoutStatus: (scoutId: string, newStatus: ScoutOffer['status']) => void;
}

export const CareerSection: React.FC<CareerSectionProps> = ({
  jobs,
  scoutOffers,
  currentUser,
  userProjects,
  onApplyJob,
  onPostJob,
  onUpdateScoutStatus,
}) => {
  const [subTab, setSubTab] = useState<'jobs' | 'scouts'>('jobs');
  const [selectedJob, setSelectedJob] = useState<JobPosting | null>(jobs[0] || null);
  const [filterType, setFilterType] = useState('전체');

  // Application Modal state
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [selectedPortfolioId, setSelectedPortfolioId] = useState(userProjects[0]?.id || '');
  const [applicantNote, setApplicantNote] = useState('');
  const [applySuccess, setApplySuccess] = useState(false);

  // New Job Modal state
  const [isNewJobModalOpen, setIsNewJobModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCompany, setNewCompany] = useState('');
  const [newLocation, setNewLocation] = useState('서울 강남구');
  const [newJobType, setNewJobType] = useState<JobPosting['jobType']>('인턴십');
  const [newCategory, setNewCategory] = useState('인터랙티브 미디어아트');
  const [newSalary, setNewSalary] = useState('월 320만원');
  const [newDescription, setNewDescription] = useState('');
  const [newRequirements, setNewRequirements] = useState('');
  const [newBenefits, setNewBenefits] = useState('');

  const filteredJobs = jobs.filter((j) => {
    if (filterType !== '전체' && j.jobType !== filterType) return false;
    return true;
  });

  const handleConfirmApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJob || !selectedPortfolioId) return;
    try { await onApplyJob(selectedJob.id, selectedPortfolioId); } catch (e) { window.alert(e instanceof Error ? e.message : '저장 실패'); return; }
    setApplySuccess(true);
    setTimeout(() => {
      setApplySuccess(false);
      setIsApplyModalOpen(false);
      setApplicantNote('');
    }, 1200);
  };

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newCompany.trim()) return;

    const job: JobPosting = {
      id: `job-${Date.now()}`,
      title: newTitle.trim(),
      company: newCompany.trim(),
      location: newLocation.trim(),
      jobType: newJobType,
      category: newCategory,
      postedByAlumni: {
        name: currentUser.realName,
        department: `${currentUser.department} (${currentUser.matriculationYear})`,
        matriculationYear: currentUser.matriculationYear,
        currentPosition: currentUser.roleOrCompany || '동문 선배',
      },
      salaryInfo: newSalary.trim(),
      description: newDescription.trim(),
      requirements: newRequirements.split('\n').filter((r) => r.trim()),
      preferredQualifications: ['서울예술대학교 전공 프로젝트 포트폴리오 우대'],
      benefits: newBenefits.split('\n').filter((b) => b.trim()),
      deadline: '채용 시 마감',
      isReferralAvailable: true,
      applicantsCount: 0,
    };

    try { await onPostJob(job); } catch (e) { window.alert(e instanceof Error ? e.message : '저장 실패'); return; }
    setIsNewJobModalOpen(false);
    setSelectedJob(job);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Action (Apple Squircle Header) */}
      <div className="bg-white/90 backdrop-blur-md border border-black/[0.08] rounded-3xl p-6 sm:p-7 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-[#E6002D] text-white text-[10px] font-bold tracking-wide px-2 py-0.5 rounded-full">
              SEOULARTS ALUMNI
            </span>
            <span className="text-xs text-[#E6002D] font-semibold">
              서울예술대학교 동문 채용 네트워크
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-semibold text-[#1D1D1F] tracking-tight">
            동문 채용 기회 & 스카우트 오퍼
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1 max-w-2xl font-normal leading-relaxed">
            모교를 졸업하고 문화·예술·산업계 유수 기업에 재직 중인 동문 선배들이 등록된 실명 포트폴리오를 직접 열람하고 추천 및 서류 면제 트랙을 제공합니다.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setIsNewJobModalOpen(true)}
            className="px-5 py-2.5 bg-[#E6002D] hover:bg-[#D60027] text-white text-xs font-semibold rounded-full flex items-center gap-1.5 shadow-[0_2px_8px_rgba(230,0,45,0.2)] active:scale-[0.98] transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>동문 채용공고 등록</span>
          </button>
        </div>
      </div>

      {/* Segmented Tab: Jobs vs Received Scouts (Apple Segmented Pill) */}
      <div className="flex items-center gap-2 pb-1">
        <div className="bg-black/[0.05] p-1 rounded-full flex items-center gap-1">
          <button
            onClick={() => setSubTab('jobs')}
            className={`px-4 py-1.5 text-xs font-semibold rounded-full transition-all flex items-center gap-2 cursor-pointer ${
              subTab === 'jobs'
                ? 'bg-white text-[#1D1D1F] shadow-[0_1px_4px_rgba(0,0,0,0.08)]'
                : 'text-neutral-500 hover:text-[#1D1D1F]'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>동문 추천 채용 ({jobs.length})</span>
          </button>

          <button
            onClick={() => setSubTab('scouts')}
            className={`px-4 py-1.5 text-xs font-semibold rounded-full transition-all flex items-center gap-2 cursor-pointer relative ${
              subTab === 'scouts'
                ? 'bg-white text-[#1D1D1F] shadow-[0_1px_4px_rgba(0,0,0,0.08)]'
                : 'text-neutral-500 hover:text-[#1D1D1F]'
            }`}
          >
            <Inbox className="w-3.5 h-3.5" />
            <span>도착한 스카우트 제안 ({scoutOffers.length})</span>
            {scoutOffers.length > 0 && (
              <span className="w-2 h-2 bg-[#E6002D] rounded-full ring-2 ring-white" />
            )}
          </button>
        </div>
      </div>

      {subTab === 'jobs' ? (
        <div className="space-y-4">
          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {['전체', '정규직 신입', '전환형 인턴', '인턴십', '경력 이직'].map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold cursor-pointer whitespace-nowrap transition-all ${
                  filterType === type
                    ? 'bg-[#1D1D1F] text-white shadow-xs'
                    : 'bg-black/[0.04] text-neutral-600 hover:bg-black/[0.08]'
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          {/* Jobs Main Split Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Job List */}
            <div className="lg:col-span-5 space-y-3">
              {filteredJobs.map((job) => {
                const isSelected = selectedJob?.id === job.id;
                return (
                  <div
                    key={job.id}
                    onClick={() => setSelectedJob(job)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer bg-white active:scale-[0.99] ${
                      isSelected
                        ? 'border-[#E6002D] ring-1 ring-[#E6002D] shadow-[0_4px_16px_rgba(230,0,45,0.08)]'
                        : 'border-black/[0.08] hover:border-black/20 hover:shadow-xs'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <span className="text-xs font-semibold text-[#E6002D]">
                        {job.company}
                      </span>
                      {job.isReferralAvailable && (
                        <span className="text-[10px] font-semibold text-white bg-[#E6002D] px-2 py-0.5 rounded-full">
                          동문 직추천
                        </span>
                      )}
                    </div>

                    <h4 className="font-semibold text-sm text-[#1D1D1F] line-clamp-1 mb-1 tracking-tight">
                      {job.title}
                    </h4>
                    <p className="text-xs text-neutral-500 font-normal mb-2">
                      {job.jobType} • {job.category}
                    </p>

                    <div className="flex items-center gap-3 text-[11px] text-neutral-400 pt-2.5 border-t border-black/[0.04] font-normal">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-[#E6002D]" />
                        {job.location.split(' ')[0]} {job.location.split(' ')[1]}
                      </span>
                      <span className="flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3 text-[#E6002D]" />
                        {job.postedByAlumni.name} 동문
                      </span>
                      <span className="ml-auto text-[#E6002D] font-medium">
                        {job.deadline}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Right: Selected Job Detailed Viewer */}
            <div className="lg:col-span-7 bg-white border border-black/[0.08] rounded-3xl p-6 sm:p-7 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex flex-col justify-between">
              {selectedJob ? (
                <div className="space-y-6">
                  {/* Job Header */}
                  <div className="border-b border-black/[0.06] pb-5">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="bg-[#E6002D] text-white text-[11px] font-semibold px-2.5 py-0.5 rounded-full">
                        {selectedJob.jobType}
                      </span>
                      <span className="bg-black/[0.04] text-neutral-700 text-[11px] font-medium px-2.5 py-0.5 rounded-full">
                        {selectedJob.category}
                      </span>
                      <span className="text-xs text-neutral-400 ml-auto font-medium">
                        지원자 {selectedJob.applicantsCount}명
                      </span>
                    </div>

                    <h3 className="text-xl sm:text-2xl font-semibold text-[#1D1D1F] leading-snug tracking-tight">
                      {selectedJob.title}
                    </h3>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-neutral-500 mt-2 font-normal">
                      <span className="font-semibold text-neutral-900">
                        {selectedJob.company}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-[#E6002D]" />
                        {selectedJob.location}
                      </span>
                      {selectedJob.salaryInfo && (
                        <span className="text-[#E6002D] font-semibold">
                          {selectedJob.salaryInfo}
                        </span>
                      )}
                    </div>

                    {/* Alumni Referrer Card */}
                    <div className="mt-4 p-4 bg-[#E6002D]/[0.03] border border-[#E6002D]/15 rounded-2xl flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-[#E6002D] text-white font-bold text-xs flex items-center justify-center rounded-xl shadow-xs">
                          {selectedJob.postedByAlumni.name.slice(-2)}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-xs text-[#1D1D1F]">
                              {selectedJob.postedByAlumni.name} 동문
                            </span>
                            <ShieldCheck className="w-3.5 h-3.5 text-[#E6002D]" />
                            <span className="text-[10px] bg-[#E6002D]/10 text-[#E6002D] font-semibold px-1.5 py-0.2 rounded-full">
                              서울예대
                            </span>
                          </div>
                          <p className="text-[11px] text-neutral-500 font-normal mt-0.5">
                            {selectedJob.postedByAlumni.department} • {selectedJob.postedByAlumni.currentPosition}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs text-[#E6002D] font-semibold bg-white border border-[#E6002D]/20 px-3 py-1 rounded-full shadow-xs">
                        동문 추천 트랙
                      </span>
                    </div>
                  </div>

                  {/* Job Details Content */}
                  <div className="space-y-5 text-xs sm:text-sm text-neutral-700 font-normal leading-relaxed">
                    <div>
                      <h4 className="font-semibold text-[#1D1D1F] text-xs uppercase tracking-wider mb-2">
                        포지션 상세 안내
                      </h4>
                      <p className="text-neutral-600 whitespace-pre-line leading-relaxed">
                        {selectedJob.description}
                      </p>
                    </div>

                    {selectedJob.requirements.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-[#1D1D1F] text-xs uppercase tracking-wider mb-2">
                          지원 자격
                        </h4>
                        <ul className="list-disc pl-4 space-y-1.5 text-neutral-600">
                          {selectedJob.requirements.map((req, i) => (
                            <li key={i}>{req}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {selectedJob.preferredQualifications.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-[#1D1D1F] text-xs uppercase tracking-wider mb-2">
                          우대 사항
                        </h4>
                        <ul className="list-disc pl-4 space-y-1.5 text-neutral-600">
                          {selectedJob.preferredQualifications.map((pref, i) => (
                            <li key={i}>{pref}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {selectedJob.benefits.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-[#1D1D1F] text-xs uppercase tracking-wider mb-2">
                          혜택 및 복지
                        </h4>
                        <ul className="list-disc pl-4 space-y-1.5 text-neutral-600">
                          {selectedJob.benefits.map((b, i) => (
                            <li key={i}>{b}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Apply Action Bar */}
                  <div className="pt-6 border-t border-black/[0.06] flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="text-xs text-neutral-500 font-medium">
                      마감일: <strong className="text-[#E6002D]">{selectedJob.deadline}</strong>
                    </div>
                    <button
                      onClick={() => setIsApplyModalOpen(true)}
                      className="w-full sm:w-auto bg-[#E6002D] hover:bg-[#D60027] text-white font-semibold text-xs px-6 py-2.5 rounded-full flex items-center justify-center gap-2 shadow-[0_2px_8px_rgba(230,0,45,0.2)] active:scale-[0.98] transition-all cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>포트폴리오로 바로 지원하기</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-20 text-neutral-400">
                  확인할 채용 공고를 선택해 주세요.
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Received Scout Offers Tab */
        <div className="space-y-4">
          <div className="p-4 bg-[#E6002D]/[0.03] border border-[#E6002D]/15 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#E6002D] shrink-0" />
              <div>
                <h4 className="text-xs font-semibold text-[#1D1D1F]">
                  서울예술대학교 동문 스카우트 보관함
                </h4>
                <p className="text-[11px] text-neutral-500 font-normal">
                  현업에 진출한 동문 선배들이 공개된 실명 포트폴리오를 확인하고 직접 발송한 면접 및 커피챗 제안 목록입니다.
                </p>
              </div>
            </div>
            <span className="text-xs bg-[#E6002D] text-white font-semibold px-2.5 py-1 rounded-full">
              총 {scoutOffers.length}건
            </span>
          </div>

          <div className="space-y-3">
            {scoutOffers.length === 0 ? (
              <div className="text-center py-16 bg-white border border-black/[0.08] rounded-3xl p-8">
                <Inbox className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
                <p className="text-xs text-neutral-500">
                  아직 도착한 스카우트 제안이 없습니다. 새 프로젝트를 등록하고 동문 네트워크에 공유해 보세요.
                </p>
              </div>
            ) : (
              scoutOffers.map((offer) => (
                <div
                  key={offer.id}
                  className="bg-white border border-black/[0.08] rounded-3xl p-5 sm:p-6 shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-3"
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-black/[0.04] pb-3">
                    <div className="flex items-center gap-2">
                      <span className="bg-[#E6002D] text-white text-[11px] font-semibold px-2.5 py-0.5 rounded-full">
                        {offer.offerType}
                      </span>
                      <strong className="text-sm font-semibold text-[#1D1D1F]">
                        {offer.company}
                      </strong>
                      <span className="text-xs text-neutral-400 font-normal">
                        {offer.sentAt}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                          offer.status === '수락'
                            ? 'bg-neutral-900 text-white'
                            : 'bg-[#E6002D]/10 text-[#E6002D]'
                        }`}
                      >
                        상태: {offer.status}
                      </span>
                    </div>
                  </div>

                  {/* Target Portfolio */}
                  <div className="text-xs text-neutral-600 flex items-center gap-1.5 bg-black/[0.02] p-2.5 rounded-xl">
                    <span className="text-[#E6002D] font-semibold">열람한 포트폴리오:</span>
                    <span className="font-semibold text-[#1D1D1F] truncate">
                      {offer.targetPortfolioTitle}
                    </span>
                  </div>

                  {/* Message */}
                  <div className="p-3.5 bg-neutral-50 rounded-2xl border border-black/[0.04] text-xs text-neutral-800 leading-relaxed whitespace-pre-line font-normal">
                    "{offer.message}"
                  </div>

                  {/* Sender and Response Actions */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2">
                    <div className="flex items-center gap-2 text-xs">
                      <div className="w-6 h-6 bg-[#E6002D]/10 text-[#E6002D] font-bold text-[10px] flex items-center justify-center rounded-full">
                        <Avatar user={offer.sender} />
                      </div>
                      <span className="font-semibold text-[#1D1D1F]">
                        {offer.sender.realName} 동문
                      </span>
                      <ShieldCheck className="w-3.5 h-3.5 text-[#E6002D]" />
                      <span className="text-neutral-500 font-normal">
                        ({offer.sender.department} • {offer.contactEmail})
                      </span>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <button
                        onClick={() => onUpdateScoutStatus(offer.id, '수락')}
                        className="flex-1 sm:flex-none px-4 py-1.5 bg-[#E6002D] hover:bg-[#D60027] text-white text-xs font-semibold rounded-full cursor-pointer transition-all active:scale-[0.98]"
                      >
                        제안 수락
                      </button>
                      <a
                        href={`mailto:${offer.contactEmail}`}
                        className="flex-1 sm:flex-none px-4 py-1.5 bg-white border border-black/[0.08] hover:bg-neutral-50 text-neutral-700 text-xs font-semibold rounded-full text-center transition-colors"
                      >
                        이메일 회신
                      </a>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* 1-Click Portfolio Application Modal (Apple Squircle Sheet) */}
      {isApplyModalOpen && selectedJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/40 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white border border-black/[0.08] rounded-3xl w-full max-w-lg shadow-[0_24px_48px_rgba(0,0,0,0.18)] overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-black/[0.06] bg-neutral-50/50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#E6002D]/10 text-[#E6002D] flex items-center justify-center">
                  <Send className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-[#1D1D1F]">
                    원클릭 포트폴리오 지원
                  </h3>
                  <p className="text-xs text-[#E6002D] font-medium">
                    {selectedJob.company} • {selectedJob.title}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsApplyModalOpen(false)}
                className="w-8 h-8 rounded-full bg-black/[0.04] hover:bg-black/[0.08] flex items-center justify-center text-neutral-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleConfirmApply} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1.5">
                  제출할 포트폴리오 선택 *
                </label>
                {userProjects.length === 0 ? (
                  <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200">
                    등록된 포트폴리오가 없습니다. 상단 '작업 업로드' 버튼을 통해 포트폴리오를 먼저 등록해 주세요.
                  </div>
                ) : (
                  <select
                    value={selectedPortfolioId}
                    onChange={(e) => setSelectedPortfolioId(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-black/[0.08] focus:border-[#E6002D] rounded-xl outline-none bg-white font-normal text-neutral-900"
                  >
                    {userProjects.map((p) => (
                      <option key={p.id} value={p.id}>
                        [{p.category}] {p.title} ({p.projectType})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  지원자 실명 학적 확인
                </label>
                <div className="p-3.5 bg-neutral-50 border border-black/[0.06] rounded-xl text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-500">성명 / 학번:</span>
                    <strong className="text-neutral-900">
                      {currentUser.realName} ({currentUser.studentId})
                    </strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-500">소속 / 학적 상태:</span>
                    <span className="font-semibold text-[#E6002D]">
                      {currentUser.department} ({currentUser.status})
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  동문 선배에게 전하는 한 줄 메시지 (선택)
                </label>
                <textarea
                  rows={2}
                  value={applicantNote}
                  onChange={(e) => setApplicantNote(e.target.value)}
                  placeholder="예: 이번 학기 졸업작품으로 인터랙티브 미디어 인스톨레이션을 제작한 21학번 김태원입니다."
                  className="w-full px-3.5 py-2 text-xs border border-black/[0.08] focus:border-[#E6002D] rounded-xl outline-none font-normal"
                />
              </div>

              {applySuccess && (
                <div className="p-3 bg-neutral-900 text-white rounded-xl text-xs font-medium flex items-center justify-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" />
                  동문 선배에게 포트폴리오 지원이 성공적으로 전송되었습니다!
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsApplyModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-neutral-500 hover:text-neutral-900 rounded-full cursor-pointer"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={userProjects.length === 0 || applySuccess}
                  className="bg-[#E6002D] hover:bg-[#D60027] text-white px-5 py-2 rounded-full text-xs font-semibold flex items-center gap-1.5 disabled:opacity-50 cursor-pointer shadow-xs active:scale-[0.98] transition-all"
                >
                  <Send className="w-3.5 h-3.5" />
                  지원서 전송
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Alumni Job Posting Modal (Apple Squircle Sheet) */}
      {isNewJobModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/40 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white border border-black/[0.08] rounded-3xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-[0_24px_48px_rgba(0,0,0,0.18)]">
            <div className="flex items-center justify-between p-5 border-b border-black/[0.06] bg-neutral-50/50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#E6002D]/10 text-[#E6002D] flex items-center justify-center font-bold">
                  <Briefcase className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-[#1D1D1F]">
                    동문 추천 채용공고 등록
                  </h3>
                  <p className="text-xs text-[#E6002D] font-medium">
                    등록자: {currentUser.realName} 동문 ({currentUser.department})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsNewJobModalOpen(false)}
                className="w-8 h-8 rounded-full bg-black/[0.04] hover:bg-black/[0.08] flex items-center justify-center text-neutral-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateJob} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  모집 직무 / 포지션명 *
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="예: [서울예대 동문 특별전형] 미디어아트 인터랙션 디자이너"
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-black/[0.08] focus:border-[#E6002D] rounded-xl outline-none font-normal"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">
                    회사명 / 기관명 *
                  </label>
                  <input
                    type="text"
                    required
                    value={newCompany}
                    onChange={(e) => setNewCompany(e.target.value)}
                    placeholder="예: 디스트릭트 (d'strict)"
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-black/[0.08] focus:border-[#E6002D] rounded-xl outline-none font-normal"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">
                    고용 형태 *
                  </label>
                  <select
                    value={newJobType}
                    onChange={(e) => setNewJobType(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-black/[0.08] focus:border-[#E6002D] rounded-xl outline-none bg-white font-normal"
                  >
                    <option value="정규직 신입">정규직 신입</option>
                    <option value="전환형 인턴">전환형 인턴</option>
                    <option value="인턴십">체험형 인턴십</option>
                    <option value="경력 이직">경력 이직</option>
                    <option value="프로젝트 외주">프로젝트 외주</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">
                    근무지
                  </label>
                  <input
                    type="text"
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    placeholder="예: 서울 강남구 삼성동"
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-black/[0.08] focus:border-[#E6002D] rounded-xl outline-none font-normal"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">
                    급여 / 보수 조건
                  </label>
                  <input
                    type="text"
                    value={newSalary}
                    onChange={(e) => setNewSalary(e.target.value)}
                    placeholder="예: 월 320만원 / 신입 초봉 협의"
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-black/[0.08] focus:border-[#E6002D] rounded-xl outline-none font-normal"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  직무 설명 *
                </label>
                <textarea
                  rows={3}
                  required
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="담당 업무 및 프로젝트에 대해 설명해주세요."
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-black/[0.08] focus:border-[#E6002D] rounded-xl outline-none font-normal"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  지원 자격 요건 (줄바꿈으로 구분)
                </label>
                <textarea
                  rows={2}
                  value={newRequirements}
                  onChange={(e) => setNewRequirements(e.target.value)}
                  placeholder="서울예술대학교 재학생 또는 졸업 동문&#10;TouchDesigner, Unity, 또는 Unreal Engine 활용 가능자"
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-black/[0.08] focus:border-[#E6002D] rounded-xl outline-none font-normal"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewJobModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-neutral-500 hover:text-neutral-900 rounded-full cursor-pointer"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="bg-[#E6002D] hover:bg-[#D60027] text-white px-5 py-2 rounded-full text-xs font-semibold cursor-pointer shadow-xs active:scale-[0.98] transition-all"
                >
                  공고 등록
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
