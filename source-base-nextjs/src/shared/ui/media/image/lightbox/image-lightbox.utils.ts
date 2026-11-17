import type { ImageLayout, ImageNatural } from './image-lightbox.types';

export const ZOOM_STEP = 0.25;
export const ZOOM_MIN = 0.25;
export const ZOOM_MAX = 4;

export function clamp(val: number, min: number, max: number) {
  return Math.min(max, Math.max(min, val));
}

/** Cỡ hiển thị + hộp bao sau xoay (`null` khi chưa biết cỡ ảnh); `scale` 1 = vừa khung, không phóng quá 100%. */
export function layoutImage(
  natural: ImageNatural | null,
  box: { width: number; height: number },
  scale: number,
  rotation: number,
): ImageLayout | null {
  if (!natural || box.width <= 0 || box.height <= 0) return null;
  const fit = Math.min(box.width / natural.w, box.height / natural.h, 1);
  const width = Math.round(natural.w * fit * scale);
  const height = Math.round(natural.h * fit * scale);
  const quarterTurn = Math.abs(rotation / 90) % 2 === 1;
  return {
    width,
    height,
    boxWidth: quarterTurn ? height : width,
    boxHeight: quarterTurn ? width : height,
  };
}
