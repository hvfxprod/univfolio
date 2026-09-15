import React from 'react';
import { PortfolioBlock } from '../types';
import { VideoEmbed } from './VideoEmbed';
import { LinkPreview } from './LinkPreview';

export function PortfolioBlocks({ blocks }: { blocks: PortfolioBlock[] }) {
  return <div className="space-y-10">{blocks.map(block => {
    if (block.type === 'link') return <LinkPreview key={block.id} url={block.linkUrl || ''} title={block.title}/>;
    if (block.type === 'video') return <VideoEmbed key={block.id} url={block.videoUrl || ''}/>;
    if (block.type === 'divider') return <hr key={block.id} className="border-neutral-200 my-12" />;
    if (block.type === 'image') return block.imageUrl ? <figure key={block.id} className="space-y-3">
      <img src={block.imageUrl} alt={block.caption || '작품 이미지'} className="w-full h-auto rounded-lg" loading="lazy" />
      {block.caption && <figcaption className="text-center text-xs text-neutral-500">{block.caption}</figcaption>}
    </figure> : null;
    return <section key={block.id} style={{ textAlign: block.align || 'left' }} className={block.type === 'quote' ? 'border-l-4 border-[#E6002D] pl-6 py-3 bg-neutral-50' : ''}>
      {block.title && <h3 className="text-2xl font-semibold mb-4 break-words">{block.title}</h3>}
      <p className={`text-base leading-8 whitespace-pre-wrap break-words ${block.bold ? 'font-bold' : ''}`}>{block.content}</p>
    </section>;
  })}</div>;
}
