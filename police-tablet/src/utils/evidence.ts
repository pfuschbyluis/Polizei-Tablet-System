const IMAGE_EXT = /\.(jpg|jpeg|png|gif|webp|bmp|svg)(\?|$)/i;
const VIDEO_EXT = /\.(mp4|webm|mov|avi)(\?|$)/i;

export const MAX_EVIDENCE_FILE_BYTES = 2 * 1024 * 1024;

export function inferEvidenceType(mimeType: string, fileName: string): string {
  if (mimeType.startsWith('image/')) return 'Foto';
  if (mimeType.startsWith('video/')) return 'Video';
  const lower = fileName.toLowerCase();
  if (IMAGE_EXT.test(lower)) return 'Foto';
  if (VIDEO_EXT.test(lower)) return 'Video';
  if (lower.endsWith('.pdf')) return 'Dokument';
  return 'Forensik';
}

export function isValidEvidenceLink(url: string): boolean {
  return /^https?:\/\/.+/i.test(url.trim());
}

export function isImageEvidence(url?: string): boolean {
  if (!url) return false;
  return url.startsWith('data:image/') || IMAGE_EXT.test(url);
}

export function isVideoEvidence(url?: string): boolean {
  if (!url) return false;
  return url.startsWith('data:video/') || VIDEO_EXT.test(url);
}

export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ''));
    reader.onerror = () => reject(new Error('Datei konnte nicht gelesen werden.'));
    reader.readAsDataURL(file);
  });
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
