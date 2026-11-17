import { useCallback, useMemo, useRef, useState } from 'react';
import {
  DEFAULT_COLOR,
  DEFAULT_SIZE_STEP,
  baseFontSize,
  baseLineWidth,
} from './utils/annotation.utils';
import {
  HIT_TOLERANCE_PX,
  MIN_RADIUS,
  moveShape,
  newId,
  resizeShape,
  startResizeDrag,
} from './utils/annotation-editor.utils';
import { ellipseFromDrag, handleAt, hitTest, moveHandleAt } from './utils/hit-test.utils';
import type { Point, Shape, TextShape, Tool } from './types/annotation.types';
import type { Drag, UseAnnotationEditorOptions } from './types/annotation-editor.types';

/**
 * useAnnotationEditor — máy trạng thái của editor chú thích: shape, công cụ, thao tác chuột, undo.
 *
 * Lưu ý: KHÔNG đụng DOM — component canvas quy toạ độ màn hình → toạ độ ảnh GỐC rồi mới gọi vào. Thao tác
 * trên object có sẵn (thẻ kéo, handle) luôn thắng công cụ đang chọn.
 *
 * @param options.naturalWidth - Bề ngang ảnh gốc (px) — quyết định nét / cỡ chữ mặc định; 0 khi chưa tải xong.
 * @param options.naturalHeight - Chiều cao ảnh gốc (px).
 * @param options.initialShapes - Nét có sẵn. Mặc định `[]`.
 * @returns shapes · draft (ellipse đang kéo, chưa nằm trong shapes) · selected · editing (chữ đang soạn)
 *   · tool / color / sizeStep + setter · undo / canUndo · deleteSelected / clearAll · cancelDraft
 *   · pointerDown / pointerMove / pointerUp · moveHandleHitId / textAt.
 *
 * @example
 * const editor = useAnnotationEditor({ naturalWidth, naturalHeight, initialShapes });
 * editor.pointerDown(ctx, point, scale);
 */
export const useAnnotationEditor = ({
  naturalWidth,
  naturalHeight,
  initialShapes = [],
}: UseAnnotationEditorOptions) => {
  const [shapes, setShapes] = useState<Shape[]>(initialShapes);
  const [tool, setTool] = useState<Tool>('ellipse');
  const [color, setColor] = useState<string>(DEFAULT_COLOR);
  const [sizeStep, setSizeStep] = useState<number>(DEFAULT_SIZE_STEP);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Shape | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  const dragRef = useRef<Drag | null>(null);
  const historyRef = useRef<Shape[][]>([]);
  const [historyDepth, setHistoryDepth] = useState(0);

  const lineWidth = baseLineWidth(naturalWidth) * sizeStep;
  const fontSize = baseFontSize(naturalWidth) * sizeStep;

  const selected = useMemo(
    () => shapes.find((s) => s.id === selectedId) ?? null,
    [shapes, selectedId],
  );
  const editing = useMemo(
    () => shapes.find((s): s is TextShape => s.id === editingId && s.kind === 'text') ?? null,
    [shapes, editingId],
  );

  const snapshot = useCallback(() => {
    historyRef.current = [...historyRef.current, shapes].slice(-30);
    setHistoryDepth(historyRef.current.length);
  }, [shapes]);

  const undo = useCallback(() => {
    const prev = historyRef.current.pop();
    setHistoryDepth(historyRef.current.length);
    if (!prev) return;
    setShapes(prev);
    setSelectedId(null);
    setEditingId(null);
  }, []);

  const patchShape = useCallback((id: string, next: Shape) => {
    setShapes((prev) => prev.map((s) => (s.id === id ? next : s)));
  }, []);

  const deleteSelected = useCallback(() => {
    if (!selectedId) return;
    snapshot();
    setShapes((prev) => prev.filter((s) => s.id !== selectedId));
    setSelectedId(null);
    setEditingId(null);
  }, [selectedId, snapshot]);

  const clearAll = useCallback(() => {
    if (!shapes.length) return;
    snapshot();
    setShapes([]);
    setSelectedId(null);
    setEditingId(null);
  }, [shapes.length, snapshot]);

  const applyColor = useCallback(
    (next: string) => {
      setColor(next);
      if (!selected) return;
      snapshot();
      patchShape(selected.id, { ...selected, color: next });
    },
    [selected, snapshot, patchShape],
  );

  const applySizeStep = useCallback(
    (step: number) => {
      setSizeStep(step);
      if (!selected) return;
      snapshot();
      patchShape(
        selected.id,
        selected.kind === 'ellipse'
          ? { ...selected, lineWidth: baseLineWidth(naturalWidth) * step }
          : { ...selected, fontSize: baseFontSize(naturalWidth) * step },
      );
    },
    [selected, naturalWidth, snapshot, patchShape],
  );

  const startEditText = useCallback((shape: TextShape) => {
    setSelectedId(shape.id);
    setEditingId(shape.id);
  }, []);

  const changeEditingText = useCallback(
    (value: string) => {
      if (!editing) return;
      patchShape(editing.id, { ...editing, text: value });
    },
    [editing, patchShape],
  );

  const commitEditing = useCallback(() => {
    if (!editing) return;
    if (!editing.text.trim()) {
      setShapes((prev) => prev.filter((s) => s.id !== editing.id));
      setSelectedId(null);
    }
    setEditingId(null);
  }, [editing]);

  const moveHandleHitId = useCallback(
    (ctx: CanvasRenderingContext2D, pt: Point, scale: number) =>
      moveHandleAt(ctx, shapes, pt, scale, naturalHeight)?.id ?? null,
    [shapes, naturalHeight],
  );

  const pointerDown = useCallback(
    (ctx: CanvasRenderingContext2D, pt: Point, scale: number) => {
      if (editing) commitEditing();
      const tol = HIT_TOLERANCE_PX / scale;

      const grabbed = moveHandleAt(ctx, shapes, pt, scale, naturalHeight);
      if (grabbed) {
        setSelectedId(grabbed.id);
        dragRef.current = { mode: 'move', start: pt, origin: grabbed, snapped: false };
        return;
      }

      const handle = handleAt(ctx, selected, pt, tol);
      if (handle && selected) {
        dragRef.current = startResizeDrag(ctx, selected, handle);
        return;
      }

      if (tool === 'text') {
        const existing = hitTest(ctx, shapes, pt, tol);
        if (existing?.kind === 'text') {
          startEditText(existing);
          return;
        }
        snapshot();
        const shape: TextShape = {
          id: newId(),
          kind: 'text',
          color,
          x: pt.x,
          y: pt.y,
          text: '',
          fontSize,
        };
        setShapes((prev) => [...prev, shape]);
        startEditText(shape);
        return;
      }

      dragRef.current = { mode: 'draw', start: pt };
      setSelectedId(null);
    },
    [
      tool,
      color,
      fontSize,
      editing,
      commitEditing,
      selected,
      shapes,
      naturalHeight,
      snapshot,
      startEditText,
    ],
  );

  const textAt = useCallback(
    (ctx: CanvasRenderingContext2D, pt: Point, scale: number) => {
      const hit = hitTest(ctx, shapes, pt, HIT_TOLERANCE_PX / scale);
      return hit?.kind === 'text' ? hit : null;
    },
    [shapes],
  );

  const pointerMove = useCallback(
    (pt: Point) => {
      const drag = dragRef.current;
      if (!drag) return;

      if (drag.mode === 'draw') {
        setDraft({
          id: 'draft',
          kind: 'ellipse',
          color,
          lineWidth,
          ...ellipseFromDrag(drag.start, pt),
        });
        return;
      }

      if (!drag.snapped) {
        snapshot();
        drag.snapped = true;
      }

      const next = drag.mode === 'resize' ? resizeShape(drag, pt) : moveShape(drag, pt);
      if (next) patchShape(next.id, next);
    },
    [color, lineWidth, patchShape, snapshot],
  );

  const cancelDraft = useCallback(() => {
    dragRef.current = null;
    setDraft(null);
  }, []);

  const pointerUp = useCallback(() => {
    const drag = dragRef.current;
    dragRef.current = null;
    if (drag?.mode !== 'draw') return;

    const shape = draft;
    setDraft(null);
    if (!shape || shape.kind !== 'ellipse') return;
    if (shape.rx < MIN_RADIUS || shape.ry < MIN_RADIUS) return;

    snapshot();
    const committed = { ...shape, id: newId() };
    setShapes((prev) => [...prev, committed]);
    setSelectedId(committed.id);
  }, [draft, snapshot]);

  return {
    shapes,
    draft,
    tool,
    setTool,
    color,
    setColor: applyColor,
    sizeStep,
    setSizeStep: applySizeStep,
    selected,
    selectedId,
    setSelectedId,
    editing,
    startEditText,
    changeEditingText,
    commitEditing,
    undo,
    canUndo: historyDepth > 0,
    deleteSelected,
    clearAll,
    pointerDown,
    pointerMove,
    pointerUp,
    cancelDraft,
    moveHandleHitId,
    textAt,
  };
};

export type AnnotationEditor = ReturnType<typeof useAnnotationEditor>;
