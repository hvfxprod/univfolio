export function httpUrl(value) {
  try { const u = new URL(value); return ['http:', 'https:'].includes(u.protocol) && !u.username && !u.password ? u : null; } catch { return null; }
}
export function serviceFor(value) {
  const host = httpUrl(value)?.hostname.toLowerCase() || '';
  const is = domain => host === domain || host.endsWith('.' + domain);
  if (is('github.com')) return 'GitHub';
  if (is('riss.kr')) return 'RISS';
  if (is('youtube.com') || is('youtu.be')) return 'YouTube';
  if (is('vimeo.com')) return 'Vimeo';
  if (is('figma.com')) return 'Figma';
  if (is('behance.net')) return 'Behance';
  return '';
}
export function videoEmbed(value) {
  const u = httpUrl(value.trim()); if (!u) return null;
  const host = u.hostname.toLowerCase().replace(/^www\./, '');
  const parts = u.pathname.split('/').filter(Boolean);
  let id;
  if (host === 'youtu.be') id = parts[0];
  if (['youtube.com','m.youtube.com','youtube-nocookie.com'].includes(host)) id = parts[0] === 'watch' ? u.searchParams.get('v') : ['embed','shorts','live'].includes(parts[0]) ? parts[1] : null;
  if (id && /^[\w-]{11}$/.test(id)) {
    const embed = new URL('https://www.youtube-nocookie.com/embed/' + id);
    const time = u.searchParams.get('start') || u.searchParams.get('t');
    if (time) { const m = time.match(/^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/); const seconds = /^\d+$/.test(time) ? Number(time) : m ? Number(m[1]||0)*3600+Number(m[2]||0)*60+Number(m[3]||0) : 0; if(seconds) embed.searchParams.set('start',String(seconds)); }
    return { provider: 'YouTube', src: embed.href };
  }
  if (['vimeo.com','player.vimeo.com'].includes(host)) {
    const match = u.pathname.match(/^\/(?:video\/|channels\/[^/]+\/|groups\/[^/]+\/videos\/)?(\d+)(?:\/([a-zA-Z0-9]+))?\/?$/);
    if (match) { const embed = new URL('https://player.vimeo.com/video/' + match[1]); const hash = u.searchParams.get('h') || match[2]; if (hash && /^[a-zA-Z0-9]+$/.test(hash)) embed.searchParams.set('h',hash); return {provider:'Vimeo',src:embed.href}; }
  }
  return null;
}
export function projectLinks(project) {
  if (project.actionLinks !== undefined) return project.actionLinks;
  return Object.entries(project.links || {}).filter(([,url]) => url).map(([key,url]) => ({id:key,label:({liveUrl:'라이브 프리뷰',githubUrl:'GitHub 코드',figmaUrl:'Figma 원본',pdfUrl:'기획서 PDF',behanceUrl:'Behance 아카이브'})[key] || key,url}));
}
export function validPeriod(range) {
  if (!range || (!range.start && !range.end)) return true;
  const valid = value => {
    if (!value) return true;
    if (range.precision === 'month') return /^\d{4}-(0[1-9]|1[0-2])$/.test(value);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
    const date = new Date(value + 'T00:00:00Z'); return !isNaN(+date) && date.toISOString().slice(0,10) === value;
  };
  return ['month','day'].includes(range.precision) && valid(range.start) && valid(range.end) && (!range.start || !range.end || range.start <= range.end);
}
export function formatPeriod(range) { return [range.start?.replaceAll('-','.') || '',range.end?.replaceAll('-','.') || ''].filter(Boolean).join(' - '); }
