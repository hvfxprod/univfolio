import React, { useState } from 'react';
import { PortfolioProject, UserProfile, ScoutOffer } from '../types';
import { Send, X, ShieldCheck, Check } from 'lucide-react';

interface ScoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetProject: PortfolioProject | null;
  currentUser: UserProfile;
  onSendScout: (offer: ScoutOffer) => Promise<void>;
}

export const ScoutModal: React.FC<ScoutModalProps> = ({
  isOpen,
  onClose,
  targetProject,
  currentUser,
  onSendScout,
}) => {
  const [offerType, setOfferType] = useState<ScoutOffer['offerType']>('정규직/신입 채용');
  const [company, setCompany] = useState(currentUser.roleOrCompany || '디스트릭트 (d\'strict)');
  const [message, setMessage] = useState('');
  const [contactEmail, setContactEmail] = useState(currentUser.links.email);
  const [isSent, setIsSent] = useState(false);

  if (!isOpen || !targetProject) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    const offer: ScoutOffer = {
      id: `scout-${Date.now()}`,
      sender: currentUser,
      receiverStudentId: targetProject.author.studentId,
      targetPortfolioId: targetProject.id,
      targetPortfolioTitle: targetProject.title,
      company: company.trim() || '동문 선배 기업',
      offerType,
      message: message.trim(),
      contactEmail: contactEmail.trim(),
      sentAt: new Date().toISOString().slice(0, 10).replace(/-/g, '.'),
      status: '대기중',
    };

    try { await onSendScout(offer); } catch (e) { window.alert(e instanceof Error ? e.message : '저장 실패'); return; }
    setIsSent(true);
    setTimeout(() => {
      setIsSent(false);
      setMessage('');
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/40 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white border border-black/[0.08] rounded-3xl w-full max-w-lg shadow-[0_24px_48px_rgba(0,0,0,0.18)] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-black/[0.06] bg-neutral-50/50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#E6002D]/10 text-[#E6002D] flex items-center justify-center shrink-0">
              <Send className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-[#1D1D1F] tracking-tight">
                동문 다이렉트 스카우트 & 커피챗 제안
              </h2>
              <p className="text-xs text-neutral-500 font-normal mt-0.5">
                수신자: {targetProject.author.realName} ({targetProject.author.department} • {targetProject.author.status})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-black/[0.04] hover:bg-black/[0.08] flex items-center justify-center text-neutral-500 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Target Portfolio Summary Box */}
          <div className="p-3 bg-black/[0.02] border border-black/[0.06] rounded-2xl flex items-center gap-3">
            <img
              src={targetProject.coverImageUrl}
              alt={targetProject.title}
              className="w-14 h-11 object-cover rounded-xl border border-black/[0.06] shrink-0"
            />
            <div className="min-w-0">
              <span className="text-[10px] text-[#E6002D] font-semibold block">
                제안 대상 작품
              </span>
              <h4 className="text-xs font-semibold text-[#1D1D1F] truncate mt-0.5">
                {targetProject.title}
              </h4>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-700 mb-1">
              제안 유형 *
            </label>
            <select
              value={offerType}
              onChange={(e) => setOfferType(e.target.value as any)}
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-black/[0.08] focus:border-[#E6002D] rounded-xl outline-none bg-white font-normal text-neutral-900"
            >
              <option value="정규직/신입 채용">정규직 / 신입 채용 제안</option>
              <option value="인턴십 제안">체험형 / 전환형 인턴십 오퍼</option>
              <option value="커피챗 및 멘토링">커피챗 및 포트폴리오 멘토링</option>
              <option value="프로젝트/산학 협력">외주 프로젝트 / 산학 공동 창작 제안</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-700 mb-1">
              발송자 소속 회사 및 부서 *
            </label>
            <input
              type="text"
              required
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="예: 디스트릭트 인터랙티브 랩, 네이버 웹툰, CJ ENM"
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-black/[0.08] focus:border-[#E6002D] rounded-xl outline-none font-normal text-neutral-900"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-700 mb-1">
              회신 수신용 이메일 *
            </label>
            <input
              type="email"
              required
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              placeholder="alumni@company.com"
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-black/[0.08] focus:border-[#E6002D] rounded-xl outline-none font-normal text-neutral-900"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-700 mb-1">
              스카우트 제안 메시지 *
            </label>
            <textarea
              rows={4}
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="작품의 인상 깊었던 점과 제안하려는 포지션 또는 커피챗 아젠다를 편안하게 적어주세요."
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-black/[0.08] focus:border-[#E6002D] rounded-xl outline-none font-normal text-neutral-900"
            />
          </div>

          {/* Verification Assurance */}
          <div className="p-3 bg-[#E6002D]/[0.03] border border-[#E6002D]/15 rounded-2xl flex items-center gap-2.5 text-xs text-neutral-700">
            <ShieldCheck className="w-4 h-4 text-[#E6002D] shrink-0" />
            <span className="font-normal">
              제안 발송자: <strong className="text-neutral-900 font-semibold">{currentUser.realName}</strong> ({currentUser.department} • {currentUser.status})
            </span>
          </div>

          {isSent && (
            <div className="p-3 bg-neutral-900 text-white rounded-xl text-xs font-medium flex items-center justify-center gap-2 shadow-sm">
              <Check className="w-4 h-4 text-emerald-400" />
              {targetProject.author.realName} 학우에게 스카우트 제안이 전송되었습니다!
            </div>
          )}

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-black/[0.06]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-neutral-500 hover:text-neutral-900 rounded-full cursor-pointer"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isSent}
              className="bg-[#E6002D] hover:bg-[#D60027] text-white px-5 py-2 rounded-full text-xs font-semibold flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-xs active:scale-[0.98] transition-all"
            >
              <Send className="w-3.5 h-3.5" />
              제안서 발송
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
