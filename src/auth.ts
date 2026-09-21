let csrf = '';
export const setCsrf = (value: string) => { csrf = value; };
export async function api(path: string, payload?: object) {
  const response = await fetch(`/api/${path}`, { credentials:'same-origin', method:payload?'POST':'GET', headers:{'Content-Type':'application/json',...(csrf?{'X-CSRF-Token':csrf}:{})}, ...(payload?{body:JSON.stringify(payload)}:{}) });
  const data = await response.json();
  if (!response.ok) {
    if(response.status===401 && !path.startsWith('auth/')) window.dispatchEvent(new Event('session-expired'));
    throw new Error(data.error || '요청을 처리하지 못했습니다.');
  }
  return data;
}
