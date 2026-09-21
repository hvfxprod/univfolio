import React from 'react';
import { UserProfile } from '../types';
import { 
  ShieldCheck, 
  Plus, 
  Briefcase, 
  Layers, 
  UserCheck, 
  Bell, 
  ExternalLink 
} from 'lucide-react';

interface NavbarProps {
  currentUser: UserProfile;
  activeTab: 'explore' | 'careers' | 'my-portfolio';
  setActiveTab: (tab: 'explore' | 'careers' | 'my-portfolio') => void;
  onOpenUpload: () => void;
  onOpenPortalAuth: () => void;
  unreadScoutCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  activeTab,
  setActiveTab,
  onOpenUpload,
  onOpenPortalAuth,
  unreadScoutCount,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-black/[0.08] transition-all">
      {/* Top Notice Bar (Apple-style subtle tint pill banner) */}
      <div className="bg-[#E6002D]/[0.06] border-b border-[#E6002D]/10 text-[#E6002D] text-[11px] font-medium py-1.5 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="bg-[#E6002D] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full tracking-wide">
              MEMBERS
            </span>
            <span className="hidden sm:inline text-neutral-800">
              관리자 승인 회원 전용 아카이브 · 학교 공식 DB 미연결
            </span>
            <span className="sm:hidden text-neutral-800">
              관리자 승인 회원 전용
            </span>
          </div>
          <button
            onClick={onOpenPortalAuth}
            className="flex items-center gap-1 text-[#E6002D] hover:text-[#C50026] text-xs font-semibold tracking-wide cursor-pointer transition-colors"
          >
            <span>내 프로필</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Main Nav */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Univ Badge */}
          <div className="flex items-center gap-6">
            <div 
              onClick={() => setActiveTab('explore')}
              className="flex items-center gap-3 cursor-pointer group"
            >
              {/* SeoulArts Red Emblem */}
              <div className="w-9 h-9 bg-[#E6002D] text-white font-bold text-sm flex items-center justify-center rounded-2xl shadow-[0_2px_8px_rgba(230,0,45,0.25)] group-hover:scale-105 transition-transform">
                <span className="tracking-tighter font-black">SIA</span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-base font-bold text-[#1D1D1F] tracking-tight">
                    UNIV<span className="text-[#E6002D]">FOLIO</span>
                  </span>
                  <span className="text-[11px] font-semibold text-[#E6002D] bg-[#E6002D]/10 px-2 py-0.5 rounded-full border border-[#E6002D]/20">
                    서울예술대학교
                  </span>
                </div>
                <p className="text-[10px] text-neutral-400 font-medium hidden sm:block">
                  Seoul Institute of the Arts • Portfolio Archive
                </p>
              </div>
            </div>
          </div>

          {/* Apple HIG Segmented Control Navigation */}
          <nav className="hidden md:flex items-center bg-black/[0.05] p-1 rounded-full">
            <button
              onClick={() => setActiveTab('explore')}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'explore'
                  ? 'bg-white text-[#1D1D1F] shadow-[0_1px_4px_rgba(0,0,0,0.08)]'
                  : 'text-neutral-600 hover:text-[#1D1D1F]'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>작품 탐색</span>
            </button>

            <button
              onClick={() => setActiveTab('careers')}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer relative ${
                activeTab === 'careers'
                  ? 'bg-white text-[#1D1D1F] shadow-[0_1px_4px_rgba(0,0,0,0.08)]'
                  : 'text-neutral-600 hover:text-[#1D1D1F]'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>동문 채용·스카우트</span>
              <span className="text-[10px] px-1.5 py-0.2 font-semibold bg-[#E6002D] text-white rounded-full">
                HOT
              </span>
            </button>

            <button
              onClick={() => setActiveTab('my-portfolio')}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer relative ${
                activeTab === 'my-portfolio'
                  ? 'bg-white text-[#1D1D1F] shadow-[0_1px_4px_rgba(0,0,0,0.08)]'
                  : 'text-neutral-600 hover:text-[#1D1D1F]'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>내 포트폴리오</span>
              {unreadScoutCount > 0 && (
                <span className="w-2 h-2 bg-[#E6002D] rounded-full ring-2 ring-white" />
              )}
            </button>
          </nav>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2.5">
            {/* Upload Button */}
            <button
              onClick={onOpenUpload}
              className="bg-[#E6002D] hover:bg-[#D60027] text-white px-3.5 py-1.5 sm:px-4 sm:py-2 text-xs font-semibold rounded-full flex items-center gap-1.5 shadow-[0_2px_8px_rgba(230,0,45,0.2)] active:scale-[0.98] transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>작업 업로드</span>
            </button>

            {/* User Badge (Apple Pill Profile) */}
            <button
              onClick={onOpenPortalAuth}
              className="flex items-center gap-2 p-1 sm:pr-3 rounded-full bg-black/[0.03] hover:bg-black/[0.06] border border-black/[0.06] transition-all cursor-pointer active:scale-[0.98]"
              title="내 프로필"
            >
              <div className="w-7 h-7 bg-[#E6002D]/10 border border-[#E6002D]/25 flex items-center justify-center text-[#E6002D] font-bold text-xs rounded-full">
                {currentUser.realName.slice(-2)}
              </div>
              <div className="hidden lg:flex flex-col text-left">
                <div className="flex items-center gap-1 leading-none">
                  <span className="text-xs font-semibold text-[#1D1D1F]">
                    {currentUser.realName}
                  </span>
                  <ShieldCheck className="w-3.5 h-3.5 text-[#E6002D]" />
                </div>
                <span className="text-[10px] text-neutral-400 font-medium leading-tight mt-0.5">
                  {currentUser.status} • {currentUser.department}
                </span>
              </div>
            </button>

            {/* Mobile Scout notification bell */}
            <button
              onClick={() => setActiveTab('my-portfolio')}
              className="md:hidden w-8 h-8 rounded-full bg-black/[0.04] flex items-center justify-center text-neutral-700 relative cursor-pointer active:scale-95"
            >
              <Bell className="w-4 h-4" />
              {unreadScoutCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-[#E6002D] rounded-full ring-1 ring-white" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Nav Tabs */}
        <div className="flex md:hidden items-center justify-around border-t border-black/[0.06] py-2 text-xs font-medium">
          <button
            onClick={() => setActiveTab('explore')}
            className={`py-1 px-2.5 rounded-full transition-colors ${
              activeTab === 'explore' ? 'bg-black/[0.08] font-semibold text-[#1D1D1F]' : 'text-neutral-500'
            }`}
          >
            작품 탐색
          </button>
          <button
            onClick={() => setActiveTab('careers')}
            className={`py-1 px-2.5 rounded-full transition-colors ${
              activeTab === 'careers' ? 'bg-black/[0.08] font-semibold text-[#1D1D1F]' : 'text-neutral-500'
            }`}
          >
            동문 채용
          </button>
          <button
            onClick={() => setActiveTab('my-portfolio')}
            className={`py-1 px-2.5 rounded-full flex items-center gap-1 transition-colors ${
              activeTab === 'my-portfolio' ? 'bg-black/[0.08] font-semibold text-[#1D1D1F]' : 'text-neutral-500'
            }`}
          >
            내 작품
            {unreadScoutCount > 0 && (
              <span className="bg-[#E6002D] text-white text-[9px] px-1 font-bold rounded-full">
                {unreadScoutCount}
              </span>
            )}
          </button>
          <button
            onClick={onOpenPortalAuth}
            className="py-1 px-2.5 text-neutral-600 flex items-center gap-1"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-[#E6002D]" />
            프로필
          </button>
        </div>
      </div>
    </header>
  );
};
