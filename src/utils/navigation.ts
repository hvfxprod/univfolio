import { useSyncExternalStore } from 'react';

const snapshot = () => window.location.pathname + window.location.search;
function subscribe(listener: () => void) {
  window.addEventListener('popstate', listener);
  return () => window.removeEventListener('popstate', listener);
}
export function useRoute() { return useSyncExternalStore(subscribe, snapshot); }
export function navigate(path: string, replace = false) {
  if (path === snapshot()) return;
  window.history[replace ? 'replaceState' : 'pushState']({}, '', path);
  window.dispatchEvent(new PopStateEvent('popstate'));
}
export function openPanel(path: string) {
  if (path === snapshot()) return;
  window.history.pushState({ panelParent: snapshot() }, '', path);
  window.dispatchEvent(new PopStateEvent('popstate'));
}
export function closePanel(fallback: string) {
  if (typeof window.history.state?.panelParent === 'string') window.history.back();
  else navigate(fallback, true);
}
export const tabPaths = { explore: '/', careers: '/careers', 'my-portfolio': '/my-portfolio' } as const;
export function tabForPath(path: string): keyof typeof tabPaths {
  return path.split('?')[0] === '/careers' ? 'careers' : path.split('?')[0] === '/my-portfolio' ? 'my-portfolio' : 'explore';
}
