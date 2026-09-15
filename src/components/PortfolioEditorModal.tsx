import React, { useEffect, useRef, useState } from 'react';
import { X, ImagePlus, Type, Quote, Minus, ArrowUp, ArrowDown, Copy, Trash2, Eye, Pencil, Upload, Plus, Bold, AlignLeft, AlignCenter, AlignRight, Settings2 } from 'lucide-react';
import { PortfolioBlock, PortfolioProject, UserProfile } from '../types';
import { PortfolioBlocks } from './PortfolioBlocks';
import { readEditorImage, safeImageUrl } from '../utils/editor';

interface Props {
  isOpen: boolean; onClose: () => void; currentUser: UserProfile;
  onSave: (project: PortfolioProject) => void; initialProject?: PortfolioProject | null;
}
const categories: PortfolioProject['category'][] = ['디지털아트','시각·모션디자인','영화·방송영상','무대·공간예술','실용음악·음향','사진·순수미술','UI/UX·소프트웨어'];
const projectTypes: PortfolioProject['projectType'][] = ['졸업작품','캡스톤 디자인','산학협력 프로젝트','동아리/학회','개인 연구/사이드','공모전 수상작'];
const uid = () => `block-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
const field = 'w-full rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#E6002D]';
const button = 'inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-neutral-100 aria-pressed:bg-red-50 aria-pressed:text-[#E6002D] disabled:opacity-30 disabled:cursor-not-allowed transition-colors';

export function PortfolioEditorModal({ isOpen, onClose, currentUser, onSave, initialProject }: Props) {
  const [project, setProject] = useState<PortfolioProject | null>(null);
  const [tools, setTools] = useState(''); const [tags, setTags] = useState('');
  const [preview, setPreview] = useState(false); const [settings, setSettings] = useState(false);
  const [active, setActive] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false); const [error, setError] = useState(''); const [busy, setBusy] = useState(false);
  const dialog = useRef<HTMLDivElement>(null); const picker = useRef<HTMLInputElement>(null); const coverPicker = useRef<HTMLInputElement>(null);
  const generation = useRef(0);
  useEffect(() => {
    generation.current++;
    if (!isOpen) return;
    setProject(initialProject ? JSON.parse(JSON.stringify(initialProject)) : {
      id: uid(), title: '', subtitle: '', category: '디지털아트', projectType: '개인 연구/사이드', coverImageUrl: '',
      author: currentUser, createdAt: new Date().toISOString().slice(0,10).replace(/-/g,'.'), views: 0, likes: 0,
      tags: [], toolsUsed: [], period: '', teamInfo: '', summary: '', links: {}, comments: [], isPublished: true,
      blocks: [{ id: uid(), type: 'text', title: '', content: '' }],
    });
    setTools(initialProject?.toolsUsed.join(', ') || ''); setTags(initialProject?.tags.join(', ') || '');
    setPreview(false); setSettings(false); setDirty(false); setError(''); setActive(null); setBusy(false);
    const old = document.body.style.overflow; document.body.style.overflow = 'hidden';
    const previous = document.activeElement as HTMLElement;
    const timer = setTimeout(() => dialog.current?.focus(), 0);
    return () => { generation.current++; clearTimeout(timer); document.body.style.overflow = old; previous?.focus(); };
  }, [isOpen, initialProject]);
  useEffect(() => {
    if (!isOpen || !dirty) return;
    const guard = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = ''; };
    window.addEventListener('beforeunload', guard); return () => window.removeEventListener('beforeunload', guard);
  }, [isOpen, dirty]);
  if (!isOpen || !project) return null;
  const change = (patch: Partial<PortfolioProject>) => { setProject(p => p ? { ...p, ...patch } : p); setDirty(true); };
  const update = (id: string, patch: Partial<PortfolioBlock>) => { setProject(p => p ? { ...p, blocks: p.blocks.map(b => b.id === id ? { ...b, ...patch } : b) } : p); setDirty(true); };
  const insert = (blocks: PortfolioBlock[]) => {
    setProject(p => { if (!p) return p; const index = p.blocks.findIndex(b => b.id === active); const next = [...p.blocks]; next.splice(index < 0 ? next.length : index + 1, 0, ...blocks); return { ...p, blocks: next }; });
    setActive(blocks[blocks.length - 1].id); setDirty(true);
  };
  const add = (type: PortfolioBlock['type']) => insert([{ id: uid(), type, content: '', title: '' }]);
  const images = async (files: FileList | File[], cover = false) => {
    if (busy || !files.length) return;
    const selected = Array.from(files); const version = generation.current;
    setBusy(true); setError('');
    try {
      if (selected.length > 10) throw new Error('이미지는 한 번에 최대 10장까지 추가할 수 있습니다.');
      const urls: string[] = [];
      for (const file of selected) urls.push(await readEditorImage(file));
      if (version !== generation.current) return;
      if (cover) change({ coverImageUrl: urls[0] });
      else { insert(urls.map((url, i) => ({ id: uid(), type: 'image', imageUrl: url, caption: selected[i].name.replace(/\.[^.]+$/, '') }))); }
    } catch (e) { if (version === generation.current) setError(e instanceof Error ? e.message : '이미지 추가에 실패했습니다.'); }
    finally { if (version === generation.current) setBusy(false); }
  };
  const move = (index: number, direction: number) => {
    const next = [...project.blocks]; const target = index + direction;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]]; change({ blocks: next });
  };
  const close = () => { if (!dirty || window.confirm('저장하지 않은 변경사항이 있습니다. 작성을 종료할까요?')) onClose(); };
  const save = (published: boolean) => {
    setError('');
    if (!project.title.trim()) { setError('작품 제목을 입력해 주세요.'); setPreview(false); return; }
    const cover = project.coverImageUrl || project.blocks.find(b => b.type === 'image' && b.imageUrl)?.imageUrl || '';
    if (published && !cover) { setError('발행하려면 대표 이미지 또는 본문 이미지를 추가해 주세요.'); setSettings(true); setPreview(false); return; }
    if ((cover && !safeImageUrl(cover)) || project.blocks.some(b => b.type === 'image' && b.imageUrl && !safeImageUrl(b.imageUrl))) { setError('이미지 주소는 http 또는 https 주소를 입력해 주세요.'); return; }
    for (const link of Object.values(project.links)) if (link && !/^https?:\/\//i.test(link)) { setError('외부 링크는 http 또는 https 주소를 입력해 주세요.'); setSettings(true); setPreview(false); return; }
    const result = { ...project, title: project.title.trim(), coverImageUrl: cover,
      subtitle: project.subtitle.trim(), summary: project.summary.trim() || project.subtitle.trim(), isPublished: published,
      toolsUsed: tools.split(',').map(t => t.trim()).filter(Boolean), tags: tags.split(',').map(t => t.trim().replace(/^#/, '')).filter(Boolean) };
    try { onSave(result); setDirty(false); onClose(); }
    catch { setError('저장하지 못했습니다. 브라우저 저장 공간이 부족하거나 차단되어 있습니다. 이미지 수를 줄이거나 이미지 URL을 사용해 주세요. 작성 내용은 유지됩니다.'); }
  };
  return <div ref={dialog} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="editor-title" className="fixed inset-0 z-[60] flex flex-col bg-[#f4f5f7] outline-none" onKeyDown={e => {
    if (e.key === 'Escape') { e.stopPropagation(); close(); }
    if (e.key === 'Tab') {
      const nodes = Array.from(dialog.current?.querySelectorAll<HTMLElement>('button:not(:disabled), input:not(:disabled), textarea, select, [tabindex="0"]') || []).filter(el => el.getClientRects().length);
      const first = nodes[0], last = nodes[nodes.length - 1];
      if (e.shiftKey && (document.activeElement === first || document.activeElement === dialog.current)) { e.preventDefault(); last?.focus(); }
      else if (!e.shiftKey && (document.activeElement === last || document.activeElement === dialog.current)) { e.preventDefault(); first?.focus(); }
    }
  }}>
    <header className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-200 bg-white px-4 sm:px-8 py-4">
      <div className="flex items-center gap-3"><span className="bg-[#E6002D] text-white rounded-xl px-3 py-2 font-bold">U.</span><div><h2 id="editor-title" className="font-semibold">{initialProject ? '프로젝트 편집' : '새 프로젝트'}</h2><p className="text-xs text-neutral-400">{currentUser.realName} · {dirty ? '저장하지 않은 변경사항' : '작품의 이야기를 들려주세요'}</p></div></div>
      <div className="flex items-center gap-1 sm:gap-2">
        <button className={button} onClick={() => setPreview(!preview)}>{preview ? <Pencil size={16}/> : <Eye size={16}/>}<span>{preview ? '편집' : '미리보기'}</span></button>
        <button className={button} disabled={busy} onClick={() => save(false)}>비공개 저장</button>
        <button className="rounded-full bg-[#E6002D] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-40" disabled={busy} onClick={() => save(true)}>발행하기</button>
        <button aria-label="에디터 닫기" className={button} onClick={close}><X size={20}/></button>
      </div>
    </header>
    {!preview && <nav aria-label="본문 도구" className="flex flex-wrap justify-center items-center gap-1 bg-white border-b px-3 py-2 border-neutral-200">
      <button className={button} onClick={() => add('text')}><Type size={17}/>텍스트</button>
      <button className={button} disabled={busy} onClick={() => picker.current?.click()}><ImagePlus size={17}/>이미지 업로드</button>
      <button className={button} onClick={() => add('image')}><Plus size={16}/>이미지 URL</button>
      <button className={button} onClick={() => add('quote')}><Quote size={17}/>인용문</button>
      <button className={button} onClick={() => add('divider')}><Minus size={17}/>구분선</button>
      <button className={`${button} lg:hidden`} onClick={() => setSettings(!settings)}><Settings2 size={17}/>작품 정보</button>
    </nav>}
    <input ref={picker} type="file" accept="image/jpeg,image/png,image/webp" multiple hidden onChange={e => { if (e.target.files) void images(e.target.files); e.target.value = ''; }}/>
    <input ref={coverPicker} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={e => { if (e.target.files) void images(e.target.files, true); e.target.value = ''; }}/>
    {(error || busy) && <div role={error ? 'alert' : 'status'} className={`px-6 py-3 text-sm ${error ? 'bg-red-50 text-red-700' : 'bg-blue-50 text-blue-700'}`}>{error || '이미지를 최적화하고 있습니다…'}</div>}
    <div className="flex-1 overflow-y-auto">
      <div className={`mx-auto max-w-[1440px] p-3 sm:p-8 grid gap-6 items-start ${preview ? '' : 'lg:grid-cols-[minmax(0,1fr)_290px]'}`}>
        <main className="bg-white min-w-0 rounded-2xl border border-neutral-200 shadow-sm overflow-hidden" onDragOver={e => { if (!preview) e.preventDefault(); }} onDrop={e => { if (!preview) { e.preventDefault(); void images(e.dataTransfer.files); } }}>
          <div className="px-6 sm:px-14 pt-10 sm:pt-14 pb-8">
            <p className="text-[10px] tracking-[.2em] text-[#E6002D] font-bold mb-6">PROJECT STORY</p>
            {preview ? <><h1 className="text-4xl font-bold break-words">{project.title || '제목 없는 프로젝트'}</h1><p className="mt-5 text-neutral-500 whitespace-pre-wrap">{project.subtitle}</p></> : <>
              <input aria-label="작품 제목" className="w-full text-3xl sm:text-4xl font-bold outline-none placeholder:text-neutral-300 bg-transparent" value={project.title} placeholder="프로젝트 제목을 입력하세요" onChange={e => change({ title: e.target.value })}/>
              <textarea aria-label="한 줄 소개" className="w-full mt-5 resize-y outline-none text-base text-neutral-600 placeholder:text-neutral-300" rows={2} value={project.subtitle} placeholder="어떤 작업인가요? 짧은 소개를 남겨주세요." onChange={e => change({ subtitle: e.target.value })}/>
            </>}
          </div>
          {preview ? <div className="px-6 sm:px-14 pb-14">{project.coverImageUrl && <img src={project.coverImageUrl} alt="대표 이미지" className="w-full rounded-lg mb-8"/>}{project.summary && <p className="mb-10 text-neutral-600 whitespace-pre-wrap">{project.summary}</p>}<PortfolioBlocks blocks={project.blocks}/></div> : <div className="px-3 sm:px-8 pb-10">
            {project.blocks.map((block, index) => <section key={block.id} aria-label={`본문 블록 ${index + 1}`} onFocus={() => setActive(block.id)} onClick={() => setActive(block.id)} className={`group relative rounded-xl border mb-5 p-4 sm:p-6 ${active === block.id ? 'border-[#E6002D]/40 ring-2 ring-red-50' : 'border-transparent hover:border-neutral-200'}`}>
              <div className="flex flex-wrap items-center justify-between gap-2 mb-4 text-neutral-400">
                <span className="text-[10px] font-semibold tracking-wider">{String(index + 1).padStart(2, '0')} / {({ text: 'TEXT', image: 'IMAGE', quote: 'QUOTE', divider: 'DIVIDER', two_column: 'TEXT' })[block.type]}</span>
                <div className="flex">
                  <button className={button} aria-label={`블록 ${index + 1} 위로`} disabled={index === 0} onClick={() => move(index,-1)}><ArrowUp size={14}/></button>
                  <button className={button} aria-label={`블록 ${index + 1} 아래로`} disabled={index === project.blocks.length - 1} onClick={() => move(index,1)}><ArrowDown size={14}/></button>
                  <button className={button} aria-label={`블록 ${index + 1} 복제`} onClick={() => { const next = [...project.blocks]; next.splice(index + 1,0,{ ...block,id: uid() }); change({ blocks: next }); }}><Copy size={14}/></button>
                  <button className={button} aria-label={`블록 ${index + 1} 삭제`} onClick={() => { if ((block.content || block.imageUrl || block.title) && !window.confirm('이 블록을 삭제할까요?')) return; change({ blocks: project.blocks.filter(b => b.id !== block.id) }); }}><Trash2 size={14}/></button>
                </div>
              </div>
              {block.type === 'divider' ? <hr className="my-8 border-neutral-200"/> : block.type === 'image' ? <>
                {block.imageUrl && <img src={block.imageUrl} alt={block.caption || '본문 이미지'} className="w-full h-auto rounded-lg mb-4"/>}
                <input aria-label={`이미지 ${index + 1} URL`} className={field} value={block.imageUrl?.startsWith('data:') ? '' : block.imageUrl || ''} placeholder={block.imageUrl?.startsWith('data:') ? '업로드한 이미지 · URL 입력으로 교체 가능' : 'https:// 이미지 주소'} onChange={e => update(block.id,{ imageUrl: e.target.value })}/>
                <input aria-label={`이미지 ${index + 1} 설명`} className="w-full text-center text-xs text-neutral-500 outline-none mt-4" value={block.caption || ''} placeholder="이미지에 대한 설명을 입력하세요" onChange={e => update(block.id,{ caption: e.target.value })}/>
                {block.imageUrl && <button className={`${button} mt-3 text-xs`} onClick={() => change({ coverImageUrl: block.imageUrl! })}>대표 이미지로 사용</button>}
              </> : <>
                <div className="flex gap-1 mb-4">
                  <button className={button} aria-label="본문 굵게" aria-pressed={!!block.bold} onClick={() => update(block.id,{ bold: !block.bold })}><Bold size={15}/></button>
                  {(['left','center','right'] as const).map((align,i) => { const Icon = [AlignLeft,AlignCenter,AlignRight][i]; return <button key={align} className={button} aria-label={['왼쪽 정렬','가운데 정렬','오른쪽 정렬'][i]} aria-pressed={(block.align || 'left') === align} onClick={() => update(block.id,{ align })}><Icon size={15}/></button>; })}
                </div>
                <div className={block.type === 'quote' ? 'border-l-4 border-[#E6002D] pl-5' : ''}>
                  <input aria-label={`블록 ${index + 1} 소제목`} style={{ textAlign: block.align }} className="w-full text-2xl font-semibold outline-none mb-4 placeholder:text-neutral-300" placeholder={block.type === 'quote' ? '인용문 제목 (선택)' : '소제목을 입력하세요 (선택)'} value={block.title || ''} onChange={e => update(block.id,{ title: e.target.value })}/>
                  <textarea aria-label={`블록 ${index + 1} 본문`} style={{ textAlign: block.align, fontWeight: block.bold ? 700 : 400 }} className="w-full min-h-36 resize-y outline-none text-base leading-8 placeholder:text-neutral-300" placeholder={block.type === 'quote' ? '기억에 남기고 싶은 문장을 적어보세요.' : '작업의 배경, 과정, 그리고 결과를 자유롭게 풀어보세요.'} value={block.content || ''} onChange={e => update(block.id,{ content: e.target.value })}/>
                </div>
              </>}
            </section>)}
            <div className="border-2 border-dashed border-neutral-200 rounded-xl p-8 text-center"><ImagePlus className="mx-auto text-neutral-300 mb-3" size={30}/><p className="text-sm text-neutral-500">이미지를 끌어 놓거나, 이야기를 이어가세요</p><div className="flex flex-wrap justify-center gap-2 mt-4"><button className={button} onClick={() => add('text')}><Plus size={15}/>텍스트 추가</button><button className={button} disabled={busy} onClick={() => picker.current?.click()}><Upload size={15}/>이미지 선택</button></div><p className="text-xs text-neutral-400 mt-3">JPG · PNG · WebP / 한 장당 최대 15MB</p></div>
          </div>}
        </main>
        {!preview && <aside className={`space-y-5 ${settings ? 'block' : 'hidden lg:block'}`}>
          <div className="rounded-2xl border border-neutral-200 bg-white p-5 space-y-4">
            <h3 className="font-semibold text-sm">프로젝트 설정</h3>
            <p className="text-xs text-neutral-400">작품을 발견하는 데 필요한 정보를 추가하세요.</p>
            <div className="rounded-xl overflow-hidden bg-neutral-100 aspect-video flex items-center justify-center">{project.coverImageUrl ? <img src={project.coverImageUrl} alt="대표 이미지 미리보기" className="w-full h-full object-cover"/> : <ImagePlus className="text-neutral-300" size={30}/>}</div>
            <button className={`${field} text-center`} disabled={busy} onClick={() => coverPicker.current?.click()}>대표 이미지 업로드</button>
            <input aria-label="대표 이미지 URL" className={field} placeholder="또는 대표 이미지 URL" value={project.coverImageUrl.startsWith('data:') ? '' : project.coverImageUrl} onChange={e => change({ coverImageUrl: e.target.value })}/>
            <label className="block text-xs space-y-2"><span>창작 분야</span><select className={field} value={project.category} onChange={e => change({ category: e.target.value as PortfolioProject['category'] })}>{categories.map(c => <option key={c}>{c}</option>)}</select></label>
            <label className="block text-xs space-y-2"><span>프로젝트 유형</span><select className={field} value={project.projectType} onChange={e => change({ projectType: e.target.value as PortfolioProject['projectType'] })}>{projectTypes.map(c => <option key={c}>{c}</option>)}</select></label>
            {(['period','teamInfo'] as const).map((key,i) => <label key={key} className="block text-xs space-y-2"><span>{['제작 기간','팀 구성 및 담당 역할'][i]}</span><input className={field} value={project[key]} onChange={e => change({ [key]: e.target.value })}/></label>)}
            <label className="block text-xs space-y-2"><span>사용 도구 (쉼표로 구분)</span><input className={field} value={tools} onChange={e => { setTools(e.target.value); setDirty(true); }}/></label>
            <label className="block text-xs space-y-2"><span>태그 (쉼표로 구분)</span><input className={field} value={tags} onChange={e => { setTags(e.target.value); setDirty(true); }}/></label>
            <label className="block text-xs space-y-2"><span>프로젝트 요약</span><textarea className={field} rows={3} value={project.summary} onChange={e => change({ summary: e.target.value })}/></label>
          </div>
          <details className="rounded-2xl border border-neutral-200 bg-white p-5"><summary className="cursor-pointer font-semibold text-sm">외부 링크</summary><div className="space-y-3 mt-4">{(['liveUrl','githubUrl','figmaUrl','pdfUrl','behanceUrl'] as const).map((key,i) => <label key={key} className="block text-xs space-y-2"><span>{['웹사이트','GitHub','Figma','PDF','Behance'][i]}</span><input className={field} value={project.links[key] || ''} placeholder="https://" onChange={e => change({ links: { ...project.links, [key]: e.target.value } })}/></label>)}</div></details>
          <p className="text-xs leading-5 text-neutral-400 px-2">비공개로 저장한 작품은 내 포트폴리오에서 이어서 편집할 수 있습니다. 현재 작품과 이미지는 이 브라우저에 저장됩니다.</p>
        </aside>}
      </div>
    </div>
  </div>;
}

