export async function readEditorImage(file: File): Promise<string> {
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) throw new Error('JPG, PNG, WebP 이미지를 선택해 주세요.');
  if (file.size > 15 * 1024 * 1024) throw new Error('이미지는 한 장당 15MB 이하로 선택해 주세요.');
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    await new Promise<void>((resolve, reject) => { img.onload = () => resolve(); img.onerror = () => reject(new Error('이미지를 읽을 수 없습니다.')); img.src = url; });
    const scale = Math.min(1, 1600 / Math.max(img.width, img.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(img.width * scale)); canvas.height = Math.max(1, Math.round(img.height * scale));
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('이 브라우저에서 이미지를 처리할 수 없습니다.');
    ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, canvas.width, canvas.height); ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg', .8);
  } finally { URL.revokeObjectURL(url); }
}

export function safeImageUrl(value: string) {
  return /^https?:\/\//i.test(value) || /^data:image\/(jpeg|png|webp);base64,/i.test(value);
}
