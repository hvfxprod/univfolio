import {test} from 'node:test';
import assert from 'node:assert/strict';
import {videoEmbed,serviceFor,httpUrl,projectLinks,validPeriod,formatPeriod} from '../src/utils/media.mjs';

test('video links accept supported hosts and preserve Vimeo privacy hash',()=>{
  for(const url of ['https://youtube.com/watch?v=M7lc1UVf-VE','https://youtu.be/M7lc1UVf-VE','https://www.youtube.com/shorts/M7lc1UVf-VE','https://youtube.com/embed/M7lc1UVf-VE']) assert.equal(videoEmbed(url).src,'https://www.youtube-nocookie.com/embed/M7lc1UVf-VE');
  assert.match(videoEmbed('https://youtu.be/M7lc1UVf-VE?t=1m30s').src,/start=90/);
  assert.equal(videoEmbed('https://vimeo.com/76979871/abcdef1234').src,'https://player.vimeo.com/video/76979871?h=abcdef1234');
  assert.equal(videoEmbed('https://player.vimeo.com/video/76979871?h=abcdef').src,'https://player.vimeo.com/video/76979871?h=abcdef');
  for(const url of ['javascript:alert(1)','https://youtube.com.evil.test/watch?v=M7lc1UVf-VE','https://evil.test/video/76979871','https://youtube.com/watch?v=bad','https://vimeo.com/']) assert.equal(videoEmbed(url),null);
});
test('custom buttons retain legacy links and use hostname-based icons',()=>{
  assert.equal(serviceFor('https://www.riss.kr/link?id=1'),'RISS');
  assert.equal(serviceFor('https://github.com/team/repo'),'GitHub');
  assert.equal(serviceFor('https://github.com.evil.test'),'');
  assert.equal(httpUrl('javascript:alert(1)'),null);
  assert.equal(projectLinks({links:{githubUrl:'https://github.com/test'}})[0].label,'GitHub 코드');
  assert.deepEqual(projectLinks({links:{githubUrl:'https://github.com/test'},actionLinks:[]}),[]);
});
test('calendar ranges validate precision, actual dates and ordering',()=>{
  assert.equal(validPeriod({precision:'day',start:'2024-02-29',end:'2024-03-01'}),true);
  assert.equal(validPeriod({precision:'day',start:'2025-02-29',end:''}),false);
  assert.equal(validPeriod({precision:'month',start:'2026-10',end:'2026-09'}),false);
  assert.equal(validPeriod({precision:'month',start:'2026-09',end:'2026-12'}),true);
  assert.equal(formatPeriod({precision:'day',start:'2026-09-01',end:'2026-09-16'}),'2026.09.01 - 2026.09.16');
});
