import { shapeBounds, type HandleKey } from './draw-shapes.utils';
import { ellipseFromDrag } from './hit-test.utils';
import type { Point, Shape } from '../types/annotation.types';
import type { MoveDrag, ResizeDrag } from '../types/annotation-editor.types';

/** px ảnh gốc: kéo ngắn hơn ngần này coi như bấm nhầm, không tạo ellipse. */
export const MIN_RADIUS = 4;

/** px MÀN HÌNH: bán kính bấm trúng handle (chia `scale` để ra px ảnh). */
export const HIT_TOLERANCE_PX = 9;

/** px ảnh gốc: cỡ chữ nhỏ hơn ngần này không đọc nổi — chặn kéo thu về 0. */
const MIN_FONT_SIZE = 8;

export const newId = () => `s${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;

/** Dựng thao tác đổi cỡ từ handle góc `handle`: neo là góc ĐỐI DIỆN, đứng yên suốt lúc kéo. */
export const startResizeDrag = (
  ctx: CanvasRenderingContext2D,
  shape: Shape,
  handle: HandleKey,
): ResizeDrag => {
  const b = shapeBounds(ctx, shape);
  const anchorRight = handle === 'nw' || handle === 'sw';
  const anchorBottom = handle === 'nw' || handle === 'ne';
  return {
    mode: 'resize',
    anchor: {
      x: anchorRight ? b.x + b.width : b.x,
      y: anchorBottom ? b.y + b.height : b.y,
    },
    origin: shape,
    originBounds: b,
    anchorRight,
    anchorBottom,
    snapped: false,
  };
};

/** Shape sau khi kéo handle tới `pt`; `null` khi không đổi được (chữ cao 0). */
export const resizeShape = (drag: ResizeDrag, pt: Point): Shape | null => {
  const { origin, anchor, originBounds } = drag;
  if (origin.kind === 'ellipse') return { ...origin, ...ellipseFromDrag(anchor, pt) };

  if (originBounds.height <= 0) return null;
  const ratio = Math.abs(pt.y - anchor.y) / originBounds.height;
  const fontSize = Math.max(origin.fontSize * ratio, MIN_FONT_SIZE);
  const scaled = fontSize / origin.fontSize;
  return {
    ...origin,
    fontSize,
    x: drag.anchorRight ? anchor.x - originBounds.width * scaled : anchor.x,
    y: drag.anchorBottom ? anchor.y - originBounds.height * scaled : anchor.y,
  };
};

/** Shape sau khi kéo thẻ từ `drag.start` tới `pt`. */
export const moveShape = (drag: MoveDrag, pt: Point): Shape => {
  const dx = pt.x - drag.start.x;
  const dy = pt.y - drag.start.y;
  const origin = drag.origin;
  return origin.kind === 'ellipse'
    ? { ...origin, cx: origin.cx + dx, cy: origin.cy + dy }
    : { ...origin, x: origin.x + dx, y: origin.y + dy };
};
