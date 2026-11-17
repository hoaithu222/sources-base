import { cornerHandles, moveHandleRect, shapeBounds, type HandleKey } from './draw-shapes.utils';
import type { Bounds, EllipseShape, Point, Shape } from '../types/annotation.types';

/**
 * hit-test.utils — con trỏ trúng shape / handle nào; hàm thuần, không React, không DOM ngoài `ctx`.
 *
 * Lưu ý:  ⛔ `pt` và `tol` là px ẢNH GỐC; tolerance tính bằng px màn hình thì chia `scale` trước khi truyền.
 */

const pointInBounds = (pt: Point, b: Bounds, tol: number): boolean =>
  pt.x >= b.x - tol &&
  pt.x <= b.x + b.width + tol &&
  pt.y >= b.y - tol &&
  pt.y <= b.y + b.height + tol;

export const ellipseFromDrag = (
  a: Point,
  b: Point,
): Pick<EllipseShape, 'cx' | 'cy' | 'rx' | 'ry'> => ({
  cx: (a.x + b.x) / 2,
  cy: (a.y + b.y) / 2,
  rx: Math.abs(b.x - a.x) / 2,
  ry: Math.abs(b.y - a.y) / 2,
});

/** Shape TRÊN CÙNG dưới con trỏ, theo hộp bao nới thêm `tol`. */
export const hitTest = (
  ctx: CanvasRenderingContext2D,
  shapes: Shape[],
  pt: Point,
  tol: number,
): Shape | undefined => {
  for (let i = shapes.length - 1; i >= 0; i -= 1) {
    const shape = shapes[i];
    if (pointInBounds(pt, shapeBounds(ctx, shape), tol)) return shape;
  }
  return undefined;
};

export const handleAt = (
  ctx: CanvasRenderingContext2D,
  selected: Shape | null,
  pt: Point,
  tol: number,
): HandleKey | null => {
  if (!selected) return null;
  const handles = cornerHandles(shapeBounds(ctx, selected));
  for (const h of handles) {
    if (Math.abs(pt.x - h.x) <= tol && Math.abs(pt.y - h.y) <= tol) return h.key;
  }
  return null;
};

export const moveHandleAt = (
  ctx: CanvasRenderingContext2D,
  shapes: Shape[],
  pt: Point,
  scale: number,
  imageHeight: number,
): Shape | undefined => {
  for (let i = shapes.length - 1; i >= 0; i -= 1) {
    const shape = shapes[i];
    const rect = moveHandleRect(shapeBounds(ctx, shape), scale, imageHeight);
    if (pointInBounds(pt, rect, 0)) return shape;
  }
  return undefined;
};
