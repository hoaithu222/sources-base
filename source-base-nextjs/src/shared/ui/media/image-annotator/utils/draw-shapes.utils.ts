import { FONT_FAMILY, LINE_HEIGHT_RATIO } from './annotation.utils';
import type { Bounds, Shape, TextShape } from '../types/annotation.types';

/**
 * draw-shapes.utils — vẽ shape lên canvas 2D; hàm thuần, không React, không DOM ngoài `ctx`.
 *
 * Dùng:   drawShapes(ctx, shapes, { selectedId, scale, draft, showMoveHandles, imageHeight })
 * Lưu ý:  ⛔ Mọi số liệu là pixel ảnh gốc: canvas hiển thị đã `setTransform` theo scale, flatten dùng 1.
 *         ⛔ Flatten gọi với tuỳ chọn mặc định (không chọn, không thẻ kéo) để khung chọn và thẻ kéo
 *         không bị nung vào ảnh.
 *         Hex trong file là ngoại lệ canvas (`ctx` không nhận className) — docs/rules/styling/color-system.md.
 */

export type HandleKey = ReturnType<typeof cornerHandles>[number]['key'];

interface DrawOptions {
  selectedId?: string | null;
  /** Tỉ lệ hiển thị, để nét trang trí không dày lên khi zoom; mặc định 1. */
  scale?: number;
  /** Ellipse đang kéo dở: vẽ preview nhưng KHÔNG gắn thẻ kéo. */
  draft?: Shape | null;
  /** Vẽ thẻ kéo cho mọi shape; mặc định tắt. */
  showMoveHandles?: boolean;
  /** Chiều cao ảnh gốc — dùng kẹp thẻ kéo của shape nằm sát đáy. */
  imageHeight?: number;
}

/** Kích thước thẻ kéo tính bằng px MÀN HÌNH (chia `scale` khi vẽ) để thẻ không phình ra khi zoom. */
const MOVE_TAG_W = 22;
const MOVE_TAG_H = 15;
const MOVE_TAG_GAP = 7;

const textLines = (shape: TextShape): string[] => shape.text.split('\n');

/** Hộp bao của shape trong hệ toạ độ ảnh; shape chữ cần `ctx` để đo bề rộng thật. */
export const shapeBounds = (ctx: CanvasRenderingContext2D, shape: Shape): Bounds => {
  if (shape.kind === 'ellipse') {
    return {
      x: shape.cx - shape.rx,
      y: shape.cy - shape.ry,
      width: shape.rx * 2,
      height: shape.ry * 2,
    };
  }

  ctx.save();
  ctx.font = `600 ${shape.fontSize}px ${FONT_FAMILY}`;
  const lines = textLines(shape);
  const width = Math.max(...lines.map((line) => ctx.measureText(line).width), 1);
  ctx.restore();

  const lineHeight = shape.fontSize * LINE_HEIGHT_RATIO;
  return { x: shape.x, y: shape.y, width, height: lineHeight * lines.length };
};

export const cornerHandles = (bounds: Bounds) => [
  { key: 'nw' as const, x: bounds.x, y: bounds.y },
  { key: 'ne' as const, x: bounds.x + bounds.width, y: bounds.y },
  { key: 'sw' as const, x: bounds.x, y: bounds.y + bounds.height },
  { key: 'se' as const, x: bounds.x + bounds.width, y: bounds.y + bounds.height },
];

/** Vùng thẻ kéo: ngay dưới mép TRÁI hộp bao; `imageHeight` > 0 thì kẹp thẻ vào trong ảnh khi shape sát đáy. */
export const moveHandleRect = (bounds: Bounds, scale: number, imageHeight: number): Bounds => {
  const width = MOVE_TAG_W / scale;
  const height = MOVE_TAG_H / scale;
  const below = bounds.y + bounds.height + MOVE_TAG_GAP / scale;
  return {
    x: bounds.x,
    y: imageHeight > 0 ? Math.min(below, Math.max(imageHeight - height, 0)) : below,
    width,
    height,
  };
};

const drawEllipse = (ctx: CanvasRenderingContext2D, shape: Extract<Shape, { kind: 'ellipse' }>) => {
  ctx.save();
  ctx.beginPath();
  ctx.ellipse(shape.cx, shape.cy, Math.max(shape.rx, 1), Math.max(shape.ry, 1), 0, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(255,255,255,0.65)';
  ctx.lineWidth = shape.lineWidth * 1.9;
  ctx.stroke();
  ctx.strokeStyle = shape.color;
  ctx.lineWidth = shape.lineWidth;
  ctx.stroke();
  ctx.restore();
};

const drawText = (ctx: CanvasRenderingContext2D, shape: TextShape) => {
  ctx.save();
  ctx.font = `600 ${shape.fontSize}px ${FONT_FAMILY}`;
  ctx.textBaseline = 'top';
  ctx.lineJoin = 'round';

  const lineHeight = shape.fontSize * LINE_HEIGHT_RATIO;
  textLines(shape).forEach((line, idx) => {
    const y = shape.y + idx * lineHeight;
    ctx.strokeStyle = 'rgba(255,255,255,0.9)';
    ctx.lineWidth = Math.max(shape.fontSize / 6, 2);
    ctx.strokeText(line, shape.x, y);
    ctx.fillStyle = shape.color;
    ctx.fillText(line, shape.x, y);
  });
  ctx.restore();
};

const drawSelection = (ctx: CanvasRenderingContext2D, bounds: Bounds, scale: number) => {
  const pad = 6 / scale;
  ctx.save();
  ctx.setLineDash([6 / scale, 4 / scale]);
  ctx.lineWidth = 1.5 / scale;
  ctx.strokeStyle = '#38BDF8';
  ctx.strokeRect(bounds.x - pad, bounds.y - pad, bounds.width + pad * 2, bounds.height + pad * 2);
  ctx.restore();
};

const drawHandles = (ctx: CanvasRenderingContext2D, bounds: Bounds, scale: number) => {
  const size = 9 / scale;
  ctx.save();
  ctx.fillStyle = '#38BDF8';
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 1.5 / scale;
  cornerHandles(bounds).forEach(({ x, y }) => {
    ctx.fillRect(x - size / 2, y - size / 2, size, size);
    ctx.strokeRect(x - size / 2, y - size / 2, size, size);
  });
  ctx.restore();
};

const drawMoveTag = (
  ctx: CanvasRenderingContext2D,
  rect: Bounds,
  scale: number,
  active: boolean,
) => {
  ctx.save();
  ctx.fillStyle = active ? '#38BDF8' : 'rgba(15,23,42,0.9)';
  ctx.strokeStyle = '#38BDF8';
  ctx.lineWidth = 1.5 / scale;
  ctx.fillRect(rect.x, rect.y, rect.width, rect.height);
  ctx.strokeRect(rect.x, rect.y, rect.width, rect.height);

  ctx.fillStyle = '#FFFFFF';
  const dot = 1.5 / scale;
  for (let col = 1; col <= 2; col += 1) {
    for (let row = 1; row <= 3; row += 1) {
      ctx.beginPath();
      ctx.arc(
        rect.x + (rect.width / 3) * col,
        rect.y + (rect.height / 4) * row,
        dot,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }
  }
  ctx.restore();
};

/** Vẽ toàn bộ shape theo thứ tự mảng (phần tử sau nằm trên), rồi khung chọn, rồi thẻ kéo. */
export const drawShapes = (
  ctx: CanvasRenderingContext2D,
  shapes: Shape[],
  {
    selectedId = null,
    scale = 1,
    draft = null,
    showMoveHandles = false,
    imageHeight = 0,
  }: DrawOptions = {},
) => {
  const paint = (shape: Shape) => {
    if (shape.kind === 'ellipse') drawEllipse(ctx, shape);
    else drawText(ctx, shape);
  };
  shapes.forEach(paint);
  if (draft) paint(draft);

  const selected = selectedId ? shapes.find((s) => s.id === selectedId) : undefined;
  if (selected) {
    const bounds = shapeBounds(ctx, selected);
    drawSelection(ctx, bounds, scale);
    drawHandles(ctx, bounds, scale);
  }

  if (!showMoveHandles) return;
  shapes.forEach((shape) => {
    const rect = moveHandleRect(shapeBounds(ctx, shape), scale, imageHeight);
    drawMoveTag(ctx, rect, scale, shape.id === selectedId);
  });
};
