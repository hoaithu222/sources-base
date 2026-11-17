import type { Bounds, Point, Shape } from './annotation.types';

export interface UseAnnotationEditorOptions {
  /** Bề ngang ảnh gốc (px) — quyết định độ dày nét / cỡ chữ mặc định; 0 khi ảnh chưa tải xong. */
  naturalWidth: number;
  naturalHeight: number;
  initialShapes?: Shape[];
}

export interface DrawDrag {
  mode: 'draw';
  start: Point;
}

export interface MoveDrag {
  mode: 'move';
  start: Point;
  origin: Shape;
  snapped: boolean;
}

export interface ResizeDrag {
  mode: 'resize';
  anchor: Point;
  origin: Shape;
  originBounds: Bounds;
  anchorRight: boolean;
  anchorBottom: boolean;
  snapped: boolean;
}

/** `origin` = bản chụp shape lúc BẮT ĐẦU kéo (mọi phép cập nhật tính từ nó); `snapped` = đã ghi mốc undo. */
export type Drag = DrawDrag | MoveDrag | ResizeDrag;
