import React, { useState, useEffect } from 'react';
import { PortfolioProject, PortfolioBlock, UserProfile } from '../types';
import { 
  X, 
  UploadCloud, 
  Image as ImageIcon, 
  Type, 
  Plus, 
  Trash2, 
  Link as LinkIcon, 
  Check, 
  Layers
} from 'lucide-react';

interface PortfolioEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  onSave: (project: PortfolioProject) => void;
  initialProject?: PortfolioProject | null;
}

const COVER_PRESETS = [
  {
    label: '인터랙티브 미디어아트',
    url: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=1200&q=80',
  },
  {
    label: '미디어 퍼포먼스 & 무대',
    url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80',
  },
  {
    label: 'XR & 버추얼 프로덕션',
    url: 'https://images.unsplash.com/photo-1617802690992-15d93263d3a9?auto=format&fit=crop&w=1200&q=80',
  },
  {
    label: '사운드아트 & 전자음악',
    url: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=1200&q=80',
  },
  {
    label: '시각디자인 & UI/UX',
    url: 'https://images.unsplash.com/photo-1581291518655-9523c932edcf?auto=format&fit=crop&w=1200&q=80',
  },
  {
    label: '디지털 영상 & 애니메이션',
    url: 'https://images.unsplash.com/photo-1536240478700-b869070f9279?auto=format&fit=crop&w=1200&q=80',
  },
];

export const PortfolioEditorModal: React.FC<PortfolioEditorModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSave,
  initialProject,
}) => {
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [category, setCategory] = useState<PortfolioProject['category']>('디지털아트');
  const [projectType, setProjectType] = useState<PortfolioProject['projectType']>('졸업작품');
  const [coverImageUrl, setCoverImageUrl] = useState(COVER_PRESETS[0].url);
  const [period, setPeriod] = useState('2026.03 - 2026.08 (5개월)');
  const [teamInfo, setTeamInfo] = useState('개인 창작 (1인)');
  const [toolsInput, setToolsInput] = useState('TouchDesigner, Arduino, Ableton Live');
  const [tagsInput, setTagsInput] = useState('미디어아트, 인터랙션, 서울예술대학교');
  const [summary, setSummary] = useState('');
  const [blocks, setBlocks] = useState<PortfolioBlock[]>([
    {
      id: 'b-init-1',
      type: 'text',
      title: '작품 기획 의도 및 예술적 배경',
      content: '관객의 생체 신호와 움직임을 실시간으로 감지하여 빛과 소리의 파동으로 치환하는 몰입형 미디어 인스톨레이션입니다.',
    },
    {
      id: 'b-init-2',
      type: 'image',
      imageUrl: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=1200&q=80',
      caption: '공간 설치 전경 및 실시간 제네레이티브 비주얼 시연 장면',
    },
  ]);
  const [liveUrl, setLiveUrl] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [figmaUrl, setFigmaUrl] = useState('');
  const [pdfUrl, setPdfUrl] = useState('');
  const [isPublished, setIsPublished] = useState(true);

  useEffect(() => {
    if (initialProject) {
      setTitle(initialProject.title);
      setSubtitle(initialProject.subtitle);
      setCategory(initialProject.category);
      setProjectType(initialProject.projectType);
      setCoverImageUrl(initialProject.coverImageUrl);
      setPeriod(initialProject.period);
      setTeamInfo(initialProject.teamInfo);
      setToolsInput(initialProject.toolsUsed.join(', '));
      setTagsInput(initialProject.tags.join(', '));
      setSummary(initialProject.summary);
      setBlocks(initialProject.blocks);
      setLiveUrl(initialProject.links?.liveUrl || '');
      setGithubUrl(initialProject.links?.githubUrl || '');
      setFigmaUrl(initialProject.links?.figmaUrl || '');
      setPdfUrl(initialProject.links?.pdfUrl || '');
      setIsPublished(initialProject.isPublished);
    } else {
      setTitle('');
      setSubtitle('');
      setCategory('디지털아트');
      setProjectType('졸업작품');
      setCoverImageUrl(COVER_PRESETS[0].url);
      setPeriod('2026.03 - 2026.08 (5개월)');
      setTeamInfo('개인 창작 (1인)');
      setToolsInput('TouchDesigner, Arduino, Ableton Live');
      setTagsInput('미디어아트, 인터랙션, 서울예술대학교');
      setSummary('');
      setBlocks([
        {
          id: 'b-init-1',
          type: 'text',
          title: '작품 기획 의도 및 예술적 배경',
          content: '관객의 생체 신호와 움직임을 실시간으로 감지하여 빛과 소리의 파동으로 치환하는 몰입형 미디어 인스톨레이션입니다.',
        },
        {
          id: 'b-init-2',
          type: 'image',
          imageUrl: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=1200&q=80',
          caption: '공간 설치 전경 및 실시간 제네레이티브 비주얼 시연 장면',
        },
      ]);
      setLiveUrl('');
      setGithubUrl('');
      setFigmaUrl('');
      setPdfUrl('');
      setIsPublished(true);
    }
  }, [initialProject, isOpen]);

  if (!isOpen) return null;

  const handleAddTextBlock = () => {
    setBlocks([
      ...blocks,
      {
        id: `b-text-${Date.now()}`,
        type: 'text',
        title: '새 섹션 제목',
        content: '작품의 기획 과정, 기술적 도전 과제, 또는 구현 디테일을 기록하세요.',
      },
    ]);
  };

  const handleAddImageBlock = (presetUrl?: string) => {
    setBlocks([
      ...blocks,
      {
        id: `b-img-${Date.now()}`,
        type: 'image',
        imageUrl: presetUrl || 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=1200&q=80',
        caption: '작품 이미지 캡션을 입력하세요.',
      },
    ]);
  };

  const handleRemoveBlock = (id: string) => {
    setBlocks(blocks.filter((b) => b.id !== id));
  };

  const handleUpdateBlock = (id: string, updates: Partial<PortfolioBlock>) => {
    setBlocks(blocks.map((b) => (b.id === id ? { ...b, ...updates } : b)));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const toolsUsed = toolsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
    const tags = tagsInput
      .split(',')
      .map((t) => t.trim().replace(/^#/, ''))
      .filter(Boolean);

    const newProject: PortfolioProject = {
      id: initialProject?.id || `proj-${Date.now()}`,
      title: title.trim(),
      subtitle: subtitle.trim() || '작품 간략 설명',
      category,
      projectType,
      coverImageUrl,
      author: currentUser,
      createdAt: initialProject?.createdAt || new Date().toISOString().slice(0, 10).replace(/-/g, '.'),
      views: initialProject?.views || 1,
      likes: initialProject?.likes || 0,
      likedByMe: initialProject?.likedByMe || false,
      tags: tags.length > 0 ? tags : ['포트폴리오', category],
      toolsUsed: toolsUsed.length > 0 ? toolsUsed : ['Tool'],
      period,
      teamInfo,
      summary: summary.trim() || subtitle.trim() || '작품 상세 설명',
      blocks,
      links: {
        liveUrl: liveUrl.trim() || undefined,
        githubUrl: githubUrl.trim() || undefined,
        figmaUrl: figmaUrl.trim() || undefined,
        pdfUrl: pdfUrl.trim() || undefined,
      },
      comments: initialProject?.comments || [],
      isPublished,
    };

    onSave(newProject);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/40 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
      <div className="bg-white border border-black/[0.08] rounded-3xl w-full max-w-3xl max-h-[92vh] flex flex-col shadow-[0_24px_48px_rgba(0,0,0,0.18)] overflow-hidden my-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-black/[0.06] bg-neutral-50/50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#E6002D]/10 text-[#E6002D] flex items-center justify-center shrink-0">
              <UploadCloud className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-[#1D1D1F] tracking-tight">
                {initialProject ? '작품 정보 수정' : '새 작품 등록 (SeoulArts 아카이브)'}
              </h2>
              <p className="text-xs text-neutral-500 font-normal mt-0.5">
                작성자: {currentUser.realName} ({currentUser.department} • {currentUser.status})
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

        {/* Scrollable Form */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-6 flex-1 bg-white">
          {/* Section 1: Basic Metadata */}
          <div className="space-y-4">
            <h3 className="text-xs font-semibold text-[#E6002D] uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5" />
              1. 기본 정보 및 분류
            </h3>

            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1">
                작품명 (Title) *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="예: 공명(Resonance): 키네틱 사운드 인스톨레이션"
                className="w-full px-3.5 py-2.5 text-sm border border-black/[0.08] focus:border-[#E6002D] rounded-xl outline-none font-normal text-neutral-900"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1">
                한 줄 소개 (Subtitle) *
              </label>
              <input
                type="text"
                required
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="예: 관객의 심박 파동을 빛과 공간 음향으로 공명시키는 인터랙티브 설치작"
                className="w-full px-3.5 py-2.5 text-sm border border-black/[0.08] focus:border-[#E6002D] rounded-xl outline-none font-normal text-neutral-900"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  창작 분야 (Category) *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as PortfolioProject['category'])}
                  className="w-full px-3.5 py-2.5 text-sm border border-black/[0.08] focus:border-[#E6002D] rounded-xl outline-none bg-white font-normal text-neutral-900"
                >
                  <option value="디지털아트">디지털아트</option>
                  <option value="시각·모션디자인">시각·모션디자인</option>
                  <option value="영화·방송영상">영화·방송영상</option>
                  <option value="무대·공간예술">무대·공간예술</option>
                  <option value="실용음악·음향">실용음악·음향</option>
                  <option value="사진·순수미술">사진·순수미술</option>
                  <option value="UI/UX·소프트웨어">UI/UX·소프트웨어</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  프로젝트 유형 (Project Type) *
                </label>
                <select
                  value={projectType}
                  onChange={(e) => setProjectType(e.target.value as PortfolioProject['category'])}
                  className="w-full px-3.5 py-2.5 text-sm border border-black/[0.08] focus:border-[#E6002D] rounded-xl outline-none bg-white font-normal text-neutral-900"
                >
                  <option value="졸업작품">졸업작품 (Graduation)</option>
                  <option value="캡스톤 디자인">캡스톤 디자인</option>
                  <option value="산학협력 프로젝트">산학협력 프로젝트</option>
                  <option value="공모전 수상작">공모전 수상작</option>
                  <option value="동아리/학회">동아리 / 창작 랩</option>
                  <option value="개인 연구/사이드">개인 창작 / 사이드</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  제작 기간 (Period)
                </label>
                <input
                  type="text"
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                  placeholder="예: 2026.03 - 2026.08 (5개월)"
                  className="w-full px-3.5 py-2.5 text-sm border border-black/[0.08] focus:border-[#E6002D] rounded-xl outline-none font-normal text-neutral-900"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  창작 구성 (Team & Role)
                </label>
                <input
                  type="text"
                  value={teamInfo}
                  onChange={(e) => setTeamInfo(e.target.value)}
                  placeholder="예: 개인 창작 (미디어 인스톨레이션 총괄)"
                  className="w-full px-3.5 py-2.5 text-sm border border-black/[0.08] focus:border-[#E6002D] rounded-xl outline-none font-normal text-neutral-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  활용 도구 및 기술 스택 (쉼표 구분)
                </label>
                <input
                  type="text"
                  value={toolsInput}
                  onChange={(e) => setToolsInput(e.target.value)}
                  placeholder="TouchDesigner, Arduino, Max/MSP, Blender"
                  className="w-full px-3.5 py-2.5 text-sm border border-black/[0.08] focus:border-[#E6002D] rounded-xl outline-none font-normal text-neutral-900"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  검색 태그 (쉼표 구분)
                </label>
                <input
                  type="text"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder="미디어아트, 인터랙션, 서울예술대학교"
                  className="w-full px-3.5 py-2.5 text-sm border border-black/[0.08] focus:border-[#E6002D] rounded-xl outline-none font-normal text-neutral-900"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Cover Image */}
          <div className="space-y-3 pt-5 border-t border-black/[0.06]">
            <h3 className="text-xs font-semibold text-[#E6002D] uppercase tracking-wider flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5" />
              2. 커버 대표 이미지
            </h3>

            {/* Current Cover Preview */}
            <div className="relative aspect-16/9 rounded-2xl overflow-hidden border border-black/[0.08] max-h-52 bg-neutral-100">
              <img
                src={coverImageUrl}
                alt="Cover Preview"
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md text-white text-[11px] font-medium px-3 py-1 rounded-full">
                현재 대표 커버
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1.5">
                추천 프리셋 선택:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {COVER_PRESETS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCoverImageUrl(preset.url)}
                    className={`p-2 text-left border rounded-xl text-xs font-medium flex items-center gap-2 cursor-pointer transition-all ${
                      coverImageUrl === preset.url
                        ? 'border-[#E6002D] bg-[#E6002D]/[0.04] text-[#E6002D]'
                        : 'border-black/[0.08] hover:border-black/20 bg-white text-neutral-700'
                    }`}
                  >
                    <img
                      src={preset.url}
                      alt={preset.label}
                      className="w-6 h-6 object-cover rounded-lg shrink-0"
                    />
                    <span className="truncate">{preset.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1">
                또는 직접 이미지 URL 입력:
              </label>
              <input
                type="url"
                value={coverImageUrl}
                onChange={(e) => setCoverImageUrl(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full px-3.5 py-2 text-xs border border-black/[0.08] focus:border-[#E6002D] rounded-xl outline-none font-normal text-neutral-900"
              />
            </div>
          </div>

          {/* Section 3: Project Summary & Behance Vertical Blocks */}
          <div className="space-y-4 pt-5 border-t border-black/[0.06]">
            <h3 className="text-xs font-semibold text-[#E6002D] uppercase tracking-wider flex items-center gap-1.5">
              <Type className="w-3.5 h-3.5" />
              3. 상세 스토리 & 스트림 블록
            </h3>

            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1">
                작품 상세 설명 (Summary) *
              </label>
              <textarea
                rows={3}
                required
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="작품의 핵심 콘셉트와 기술 구현 방식, 전시 성과를 간결히 요약해 주세요."
                className="w-full px-3.5 py-2.5 text-sm border border-black/[0.08] focus:border-[#E6002D] rounded-xl outline-none font-normal text-neutral-900"
              />
            </div>

            {/* Dynamic Blocks List */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#1D1D1F]">
                  스토리 블록 ({blocks.length})
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleAddTextBlock}
                    className="px-3 py-1.5 text-xs font-medium text-[#E6002D] bg-[#E6002D]/10 hover:bg-[#E6002D]/15 rounded-full flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                    <span>텍스트 블록</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddImageBlock()}
                    className="px-3 py-1.5 text-xs font-medium text-[#E6002D] bg-[#E6002D]/10 hover:bg-[#E6002D]/15 rounded-full flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                    <span>이미지 블록</span>
                  </button>
                </div>
              </div>

              {blocks.map((block, index) => (
                <div
                  key={block.id}
                  className="p-4 border border-black/[0.08] bg-neutral-50/70 rounded-2xl space-y-2.5 relative group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-[#E6002D]">
                      블록 #{index + 1} ({block.type === 'text' ? '텍스트 섹션' : '이미지 쇼케이스'})
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveBlock(block.id)}
                      className="text-neutral-400 hover:text-[#E6002D] p-1 cursor-pointer"
                      title="블록 삭제"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {block.type === 'text' ? (
                    <>
                      <input
                        type="text"
                        value={block.title || ''}
                        onChange={(e) =>
                          handleUpdateBlock(block.id, { title: e.target.value })
                        }
                        placeholder="섹션 소제목 (예: 창작 철학 및 리서치)"
                        className="w-full px-3.5 py-2 text-xs font-semibold border border-black/[0.08] focus:border-[#E6002D] rounded-xl bg-white outline-none text-neutral-900"
                      />
                      <textarea
                        rows={3}
                        value={block.content || ''}
                        onChange={(e) =>
                          handleUpdateBlock(block.id, { content: e.target.value })
                        }
                        placeholder="상세 창작 배경 및 기획 의도를 설명하세요."
                        className="w-full px-3.5 py-2 text-xs border border-black/[0.08] focus:border-[#E6002D] rounded-xl bg-white outline-none text-neutral-700 leading-relaxed"
                      />
                    </>
                  ) : (
                    <>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <input
                          type="url"
                          value={block.imageUrl || ''}
                          onChange={(e) =>
                            handleUpdateBlock(block.id, { imageUrl: e.target.value })
                          }
                          placeholder="이미지 URL (https://...)"
                          className="w-full px-3.5 py-2 text-xs border border-black/[0.08] focus:border-[#E6002D] rounded-xl bg-white outline-none text-neutral-900"
                        />
                        <input
                          type="text"
                          value={block.caption || ''}
                          onChange={(e) =>
                            handleUpdateBlock(block.id, { caption: e.target.value })
                          }
                          placeholder="이미지 캡션 / 상세 설명"
                          className="w-full px-3.5 py-2 text-xs border border-black/[0.08] focus:border-[#E6002D] rounded-xl bg-white outline-none text-neutral-900"
                        />
                      </div>
                      {block.imageUrl && (
                        <div className="aspect-16/9 max-h-36 overflow-hidden border border-black/[0.08] rounded-xl bg-neutral-200">
                          <img
                            src={block.imageUrl}
                            alt="preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Section 4: External Links */}
          <div className="space-y-3 pt-5 border-t border-black/[0.06]">
            <h3 className="text-xs font-semibold text-[#E6002D] uppercase tracking-wider flex items-center gap-1.5">
              <LinkIcon className="w-3.5 h-3.5" />
              4. 외부 참고 링크 & 레퍼런스
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  라이브 데모 / 아카이브 웹 URL
                </label>
                <input
                  type="url"
                  value={liveUrl}
                  onChange={(e) => setLiveUrl(e.target.value)}
                  placeholder="https://my-exhibition.art"
                  className="w-full px-3.5 py-2 text-xs border border-black/[0.08] focus:border-[#E6002D] rounded-xl outline-none font-normal text-neutral-900"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Figma / 기획서 링크
                </label>
                <input
                  type="url"
                  value={figmaUrl}
                  onChange={(e) => setFigmaUrl(e.target.value)}
                  placeholder="https://figma.com/file/..."
                  className="w-full px-3.5 py-2 text-xs border border-black/[0.08] focus:border-[#E6002D] rounded-xl outline-none font-normal text-neutral-900"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  GitHub / 소스코드 저장소
                </label>
                <input
                  type="url"
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  placeholder="https://github.com/..."
                  className="w-full px-3.5 py-2 text-xs border border-black/[0.08] focus:border-[#E6002D] rounded-xl outline-none font-normal text-neutral-900"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  상세 PDF 포트폴리오 URL
                </label>
                <input
                  type="url"
                  value={pdfUrl}
                  onChange={(e) => setPdfUrl(e.target.value)}
                  placeholder="https://.../portfolio.pdf"
                  className="w-full px-3.5 py-2 text-xs border border-black/[0.08] focus:border-[#E6002D] rounded-xl outline-none font-normal text-neutral-900"
                />
              </div>
            </div>
          </div>

          {/* Section 5: Publish Toggle */}
          <div className="pt-4 border-t border-black/[0.06] flex items-center justify-between">
            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                id="isPublished"
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
                className="w-4 h-4 text-[#E6002D] focus:ring-0 border-black/20 rounded-md accent-[#E6002D] cursor-pointer"
              />
              <span className="text-xs font-medium text-neutral-800">
                서울예술대학교 동문 및 재학생 네트워크에 공개 발행
              </span>
            </label>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-black/[0.06]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-neutral-500 hover:text-neutral-900 rounded-full cursor-pointer"
            >
              취소
            </button>
            <button
              type="submit"
              className="bg-[#E6002D] hover:bg-[#D60027] text-white px-5 py-2 rounded-full text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-[0.98] transition-all"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{initialProject ? '변경사항 저장' : '작품 발행하기'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};


