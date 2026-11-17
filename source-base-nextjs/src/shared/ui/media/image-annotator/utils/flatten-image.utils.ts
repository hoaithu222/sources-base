import { drawShapes } from './draw-shapes.utils';
import type { Shape } from '../types/annotation.types';

/**
 * flatten-image.utils — "nung" nét vẽ vào ảnh gốc ở KÍCH THƯỚC GỐC rồi xuất File mới.
 *
 * Dùng:   const file = await flattenAnnotations({ source, shapes, fileName });
 * Lưu ý:  PNG giữ PNG, loại khác → JPEG 0.92; tên file giữ nguyên, chỉ đổi đuôi theo mime.
 *         Lỗi do chính module ném ra là `FlattenImageError` mang `code` ổn định — nơi hiển thị dịch theo
 *         `ui.media.imageAnnotator.flattenErrors.<code>`, không in `message`.
 */

export type FlattenImageErrorCode = 'exportFailed' | 'canvasUnsupported';

export class FlattenImageError extends Error {
  readonly code: FlattenImageErrorCode;

  constructor(code: FlattenImageErrorCode) {
    super(code);
    this.name = 'FlattenImageError';
    this.code = code;
  }
}

interface FlattenOptions {
  source: Blob;
  shapes: Shape[];
  fileName: string;
}

const JPEG_QUALITY = 0.92;

const outputMime = (sourceType: string) =>
  sourceType === 'image/png' ? 'image/png' : 'image/jpeg';

const withExtension = (fileName: string, mime: string) => {
  const ext = mime === 'image/png' ? 'png' : 'jpg';
  const dot = fileName.lastIndexOf('.');
  const base = dot > 0 ? fileName.slice(0, dot) : fileName;
  return `${base}.${ext}`;
};

const toBlob = (canvas: HTMLCanvasElement, mime: string): Promise<Blob> =>
  new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new FlattenImageError('exportFailed'))),
      mime,
      mime === 'image/jpeg' ? JPEG_QUALITY : undefined,
    );
  });

export const decodeImage = (source: Blob): Promise<ImageBitmap> =>
  createImageBitmap(source, { imageOrientation: 'from-image' });

export const flattenAnnotations = async ({
  source,
  shapes,
  fileName,
}: FlattenOptions): Promise<File> => {
  const bitmap = await decodeImage(source);
  try {
    const canvas = document.createElement('canvas');
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;

    const ctx = canvas.getContext('2d');
    if (!ctx) throw new FlattenImageError('canvasUnsupported');

    const mime = outputMime(source.type);
    if (mime === 'image/jpeg') {
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    ctx.drawImage(bitmap, 0, 0);
    drawShapes(ctx, shapes);

    const blob = await toBlob(canvas, mime);
    return new File([blob], withExtension(fileName, mime), { type: mime });
  } finally {
    bitmap.close?.();
  }
};
