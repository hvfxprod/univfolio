import React from 'react';
import { videoEmbed, httpUrl } from '../utils/media.mjs';
export function VideoEmbed({url}: {url:string}) {
  const video = videoEmbed(url);
  if (!video) return <p className="text-sm text-neutral-500 py-4">YouTube 또는 Vimeo 영상 주소를 입력해 주세요.</p>;
  return <figure className="space-y-2"><div className="aspect-video rounded-xl overflow-hidden bg-black"><iframe className="w-full h-full" src={video.src} title={`${video.provider} 영상`} loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen" allowFullScreen referrerPolicy="strict-origin-when-cross-origin"/></div><figcaption className="text-xs text-neutral-500">{video.provider} · 재생이 제한되면 <a className="underline" href={httpUrl(url)?.href} target="_blank" rel="noopener noreferrer">원본 영상 보기</a></figcaption></figure>;
}
