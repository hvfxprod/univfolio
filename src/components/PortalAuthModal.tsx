import React, { useState } from 'react';
import { UserProfile, StudentStatus } from '../types';
import { ShieldCheck, X, Check, Lock, AlertCircle, RefreshCw, Sparkles, Building2, CheckCircle2 } from 'lucide-react';
import { CURRENT_USER_DEFAULT, ALUMNI_USER_SENIOR, ALUMNI_USER_DESIGNER } from '../data/mockData';

interface PortalAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  onUpdateUser: (updated: UserProfile) => void;
}

export const PortalAuthModal: React.FC<PortalAuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUpdateUser,
}) => {
  // Verified fields from Portal / SheerID (Locked & Read-only)
  const [realName, setRealName] = useState(currentUser.realName);
  const [studentId, setStudentId] = useState(currentUser.studentId);
  const [university, setUniversity] = useState(currentUser.university || '서울예술대학교');
  const [department, setDepartment] = useState(currentUser.department);
  const [status, setStatus] = useState<StudentStatus>(currentUser.status);
  
  // User-customizable field
  const [bio, setBio] = useState(currentUser.bio || '');

  // Verification simulation states
  const [isSimulatingSSO, setIsSimulatingSSO] = useState(false);
  const [verifiedProvider, setVerifiedProvider] = useState<'portal' | 'sheerid'>('portal');
  const [successMessage, setSuccessMessage] = useState('');

  if (!isOpen) return null;

  // Simulate SheerID / Portal live re-fetch
  const handleSimulatePortalFetch = (provider: 'portal' | 'sheerid') => {
    setIsSimulatingSSO(true);
    setVerifiedProvider(provider);
    setTimeout(() => {
      setIsSimulatingSSO(false);
      setSuccessMessage(
        provider === 'portal'
          ? '서울예술대학교 종합정보시스템 포털에서 최신 학적 정보(성명, 학번, 전공, 학적상태)를 정상 조회했습니다.'
          : 'SheerID 학생 인증 API를 통해 재학·동문 자격 검증을 100% 완료했습니다.'
      );
      setTimeout(() => setSuccessMessage(''), 3000);
    }, 800);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateUser({
      ...currentUser,
      realName,
      studentId,
      university,
      department,
      status,
      bio,
      isVerified: true,
    });
    setSuccessMessage('포털 학적 인증 및 프로필 정보가 정상 저장되었습니다.');
    setTimeout(() => {
      setSuccessMessage('');
      onClose();
    }, 700);
  };

  const handlePresetSelect = (preset: UserProfile) => {
    setRealName(preset.realName);
    setStudentId(preset.studentId);
    setUniversity(preset.university);
    setDepartment(preset.department);
    setStatus(preset.status);
    setBio(preset.bio);
    onUpdateUser({
      ...preset,
      isVerified: true,
    });
    setSuccessMessage(`포털 SSO 연동: '${preset.realName}' (${preset.status}) 학적 정보를 성공적으로 가져왔습니다.`);
    setTimeout(() => {
      setSuccessMessage('');
      onClose();
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/40 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white border border-black/[0.08] rounded-3xl w-full max-w-xl max-h-[92vh] overflow-y-auto shadow-[0_24px_48px_rgba(0,0,0,0.16)] flex flex-col my-auto">
        {/* Modal Header */}
        <div className="sticky top-0 z-20 bg-white/90 backdrop-blur-xl flex items-center justify-between px-6 py-4 border-b border-black/[0.06]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#E6002D]/10 border border-[#E6002D]/20 flex items-center justify-center text-[#E6002D] shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-base font-semibold text-[#1D1D1F] tracking-tight">
                  포털 실명 학적 인증
                </h2>
                <span className="text-[10px] font-semibold bg-[#E6002D]/10 text-[#E6002D] px-2 py-0.5 rounded-full">
                  SheerID / 포털 연동
                </span>
              </div>
              <p className="text-xs text-neutral-500 font-normal">
                서울예술대학교 재학생 및 졸업 동문 전용 실명 검증 시스템
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-black/[0.04] hover:bg-black/[0.08] flex items-center justify-center text-neutral-500 hover:text-neutral-900 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Architecture Roadmap & Security Notice */}
          <div className="p-4 bg-red-50/50 border border-red-200/70 rounded-2xl text-xs text-neutral-800 space-y-2">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-[#E6002D] shrink-0 mt-0.5" />
              <div>
                <strong className="text-neutral-900 font-semibold block mb-1">
                  서울예술대학교 학생포털(종합정보시스템) & SheerID 자동 연동 안내
                </strong>
                <p className="text-neutral-600 leading-relaxed font-normal">
                  본 서비스는 예술계 창작자들의 저작권 보호와 100% 신뢰할 수 있는 실명 아카이브 네트워크를 구축하기 위해, 
                  <strong> 이름, 학번, 소속 대학교, 전공, 학적상태</strong> 정보를 학생포털 로그인 및 SheerID 대학생 인증을 통해 안전하게 자동으로 가져옵니다.
                  임의 위·변조 방지를 위해 해당 정보는 직접 수정이 제한되며, 공식 포털 인증을 통해서만 갱신됩니다.
                </p>
              </div>
            </div>
          </div>

          {/* Quick Preset Accounts (Simulated Portal Login) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-neutral-700">
                포털 인증 계정 간편 연동 (테스트 프리셋):
              </label>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleSimulatePortalFetch('portal')}
                  disabled={isSimulatingSSO}
                  className="text-[11px] text-[#E6002D] hover:underline font-medium flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className={`w-3 h-3 ${isSimulatingSSO ? 'animate-spin' : ''}`} />
                  포털 최신 학적 새로고침
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => handlePresetSelect(CURRENT_USER_DEFAULT)}
                className={`p-3.5 text-left border rounded-2xl transition-all cursor-pointer active:scale-[0.98] ${
                  currentUser.studentId === CURRENT_USER_DEFAULT.studentId
                    ? 'border-[#E6002D] bg-[#E6002D]/[0.04] text-neutral-900 shadow-xs ring-1 ring-[#E6002D]'
                    : 'border-black/[0.08] hover:border-black/20 bg-white text-neutral-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs text-[#1D1D1F]">김태원 (재학생)</span>
                  {currentUser.studentId === CURRENT_USER_DEFAULT.studentId && (
                    <Check className="w-3.5 h-3.5 text-[#E6002D]" />
                  )}
                </div>
                <p className="text-[11px] text-neutral-500 font-normal mt-0.5">
                  디지털아트 · 학번 {CURRENT_USER_DEFAULT.studentId}
                </p>
              </button>

              <button
                type="button"
                onClick={() => handlePresetSelect(ALUMNI_USER_SENIOR)}
                className={`p-3.5 text-left border rounded-2xl transition-all cursor-pointer active:scale-[0.98] ${
                  currentUser.studentId === ALUMNI_USER_SENIOR.studentId
                    ? 'border-[#E6002D] bg-[#E6002D]/[0.04] text-neutral-900 shadow-xs ring-1 ring-[#E6002D]'
                    : 'border-black/[0.08] hover:border-black/20 bg-white text-neutral-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs text-[#1D1D1F]">박준형 (졸업생)</span>
                  {currentUser.studentId === ALUMNI_USER_SENIOR.studentId && (
                    <Check className="w-3.5 h-3.5 text-[#E6002D]" />
                  )}
                </div>
                <p className="text-[11px] text-neutral-500 font-normal mt-0.5">
                  방송영상 · 학번 {ALUMNI_USER_SENIOR.studentId}
                </p>
              </button>

              <button
                type="button"
                onClick={() => handlePresetSelect(ALUMNI_USER_DESIGNER)}
                className={`p-3.5 text-left border rounded-2xl transition-all cursor-pointer active:scale-[0.98] ${
                  currentUser.studentId === ALUMNI_USER_DESIGNER.studentId
                    ? 'border-[#E6002D] bg-[#E6002D]/[0.04] text-neutral-900 shadow-xs ring-1 ring-[#E6002D]'
                    : 'border-black/[0.08] hover:border-black/20 bg-white text-neutral-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs text-[#1D1D1F]">이지은 (졸업생)</span>
                  {currentUser.studentId === ALUMNI_USER_DESIGNER.studentId && (
                    <Check className="w-3.5 h-3.5 text-[#E6002D]" />
                  )}
                </div>
                <p className="text-[11px] text-neutral-500 font-normal mt-0.5">
                  시각디자인 · 학번 {ALUMNI_USER_DESIGNER.studentId}
                </p>
              </button>
            </div>
          </div>

          {/* Form for Real-name Identity Display & Personal Bio Edit */}
          <form onSubmit={handleSave} className="space-y-4 pt-4 border-t border-black/[0.06]">
            {/* Section Header: Locked Verified Credentials */}
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-[#1D1D1F] flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-[#E6002D]" />
                <span>공식 인증 학적 정보 (포털/SheerID 자동 연동)</span>
              </h3>
              <span className="text-[11px] font-medium text-neutral-500 bg-black/[0.04] px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <Lock className="w-3 h-3 text-neutral-400" />
                위변조 방지 잠금 (수정 불가)
              </span>
            </div>

            {/* Read-only / Locked Verified Identity Card */}
            <div className="bg-neutral-50/80 border border-black/[0.06] rounded-2xl p-4 space-y-3.5">
              {/* Row 1: Real Name & Student ID */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-medium text-neutral-600">
                      성명 (실명)
                    </label>
                    <span className="text-[10px] font-semibold text-emerald-600 flex items-center gap-0.5">
                      <CheckCircle2 className="w-3 h-3" />
                      포털 실명 일치
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      readOnly
                      disabled
                      value={realName}
                      className="w-full px-3.5 py-2.5 text-sm bg-white/90 border border-black/[0.08] rounded-xl font-semibold text-neutral-900 cursor-not-allowed select-none shadow-2xs"
                    />
                    <Lock className="w-3.5 h-3.5 text-neutral-400 absolute right-3 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-medium text-neutral-600">
                      학번
                    </label>
                    <span className="text-[10px] font-semibold text-emerald-600 flex items-center gap-0.5">
                      <CheckCircle2 className="w-3 h-3" />
                      학적 원장 조회됨
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      readOnly
                      disabled
                      value={studentId}
                      className="w-full px-3.5 py-2.5 text-sm bg-white/90 border border-black/[0.08] rounded-xl font-semibold text-neutral-900 cursor-not-allowed select-none shadow-2xs"
                    />
                    <Lock className="w-3.5 h-3.5 text-neutral-400 absolute right-3 top-1/2 -translate-y-1/2" />
                  </div>
                </div>
              </div>

              {/* Row 2: University & Major/Department */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-neutral-600 mb-1">
                    소속 대학교
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      readOnly
                      disabled
                      value={university}
                      className="w-full px-3.5 py-2.5 text-sm bg-white/90 border border-black/[0.08] rounded-xl font-medium text-neutral-900 cursor-not-allowed select-none shadow-2xs"
                    />
                    <Lock className="w-3.5 h-3.5 text-neutral-400 absolute right-3 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-600 mb-1">
                    소속 학부 / 전공
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      readOnly
                      disabled
                      value={department}
                      className="w-full px-3.5 py-2.5 text-sm bg-white/90 border border-black/[0.08] rounded-xl font-medium text-neutral-900 cursor-not-allowed select-none shadow-2xs"
                    />
                    <Lock className="w-3.5 h-3.5 text-neutral-400 absolute right-3 top-1/2 -translate-y-1/2" />
                  </div>
                </div>
              </div>

              {/* Row 3: Status (재학생/졸업생 등) */}
              <div>
                <label className="block text-xs font-medium text-neutral-600 mb-1">
                  학적 상태 (포털 인증 결과)
                </label>
                <div className="relative">
                  <div className="w-full px-3.5 py-2.5 bg-white/90 border border-black/[0.08] rounded-xl flex items-center justify-between shadow-2xs">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-neutral-900">
                        {status} ({status === '재학생' ? '전문학사/학사학위 전공심화 과정' : '서울예술대학교 동문'})
                      </span>
                      <span className="text-[10px] bg-[#E6002D]/10 text-[#E6002D] font-semibold px-2 py-0.5 rounded-full">
                        인증됨
                      </span>
                    </div>
                    <Lock className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                  </div>
                </div>
              </div>

              <p className="text-[11px] text-neutral-500 leading-relaxed font-normal pt-1">
                ※ 상기 5개 항목(성명, 학번, 소속 대학교, 전공, 학적상태)은 SheerID 및 학교 포털 인증 연동 데이터로 자동 고정되며, 사용자가 임의 수정할 수 없습니다. 정보가 일치하지 않을 경우 종합정보시스템 포털에서 최신 학적을 갱신해 주시기 바랍니다.
              </p>
            </div>

            {/* Editable Profile Bio */}
            <div className="pt-2">
              <label className="block text-xs font-medium text-neutral-700 mb-1">
                프로필 한 줄 소개 (사용자 직접 편집 가능)
              </label>
              <textarea
                rows={2}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="창작 관심사 및 지향하는 예술/기술 분야를 편안하게 소개해주세요."
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-black/[0.08] focus:border-[#E6002D] focus:ring-1 focus:ring-[#E6002D] rounded-xl outline-none transition-all font-normal text-neutral-900 leading-relaxed"
              />
            </div>

            {successMessage && (
              <div className="p-3.5 bg-neutral-900 text-white rounded-2xl text-xs font-medium flex items-center gap-2 shadow-sm animate-in fade-in">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-black/[0.06]">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-neutral-600 hover:text-neutral-900 hover:bg-black/[0.04] rounded-full transition-colors cursor-pointer"
              >
                닫기
              </button>
              <button
                type="submit"
                disabled={isSimulatingSSO}
                className="bg-[#E6002D] hover:bg-[#D60027] text-white px-5 py-2 rounded-full text-xs font-semibold flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-xs active:scale-[0.98] transition-all"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>포털 학적 인증 완료</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
