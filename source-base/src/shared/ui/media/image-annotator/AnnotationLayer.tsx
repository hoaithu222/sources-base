import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useLatestRequest } from '@/shared/hooks';
import Spinner from '@/shared/ui/feedback/Spinner';
import { cn } from '@/shared/utils/style/cn';
import { showToast } from '@/shared/ui/overlays/toast/toast.api';
import { AnnotationLayerActionBar } from './parts/annotation-layer-action-bar';
import { AnnotationLayerTextBox } from './parts/annotation-layer-text-box';
import { drawShapes } from './utils/draw-shapes.utils';
import { decodeImage, flattenAnnotations } from './utils/flatten-image.utils';
import { useAnnotationEditor } from './useAnnotationEditor';
import type { Point, Tool } from './types/annotation.types';
import type { AnnotationLayerProps } from './types/annotation-layer.types';

const ANNOTATION_BOX_CLASSES = 'absolute left-1/2 top-1/2';
const ANNOTATION_SPINNER_BOX_CLASSES =
  'absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2';
const ANNOTATION_CANVAS_CLASSES = 'block size-full touch-none select-none';

const ANNOTATION_CANVAS_CURSOR_CLASSES = {
  move: 'cursor-move',
  text: 'cursor-text',
  ellipse: 'cursor-crosshair',
} satisfies Record<'move' | Tool, string>;

/**
 * AnnotationLayer — lớp chú thích canvas trong `ImageLightbox`: thay thẻ `<img>` khi bật chế độ vẽ, khoanh
 * ellipse / gõ chữ lên ảnh rồi "nung" thành tệp ảnh mới.
 *
 * Không dùng trực tiếp: bật qua `<ImageLightbox annotation={…}>`. Import sâu qua
 * `@/shared/ui/media/image-annotator` và nạp lười (`lazy()` ở module scope) — canvas nặng, chỉ tải khi bấm bút chì.
 * Sửa giao diện: ô soạn chữ → annotation-layer-text-box.tsx · thanh Hủy / Lưu → annotation-layer-action-bar.tsx.
 * Lưu ý: caller PHẢI `key` theo ảnh. KHÔNG `preventDefault()` ở pointerdown (mất `dblclick` — lối sửa chữ).
 * Esc bóc từng lớp (bỏ nháp → thoát chế độ vẽ). Đổi `source` hoặc unmount khi đang nung ảnh → kết quả cũ bị
 * bỏ, `onSave` không chạy. Lý do thiết kế: notes/components/media.md.
 *
 * @param props.source - Ảnh GỐC chưa có nét (Blob) — nguồn để vẽ và để nung.
 * @param props.fileName - Tên tệp ảnh gốc; tệp xuất giữ tên, chỉ đổi đuôi (PNG giữ PNG, loại khác → JPG).
 * @param props.initialShapes - Nét có sẵn (lần chú thích trước) để sửa tiếp.
 * @param props.layout - Cỡ hiển thị do lightbox tính (fit × zoom); `null` = chưa biết cỡ ảnh → spinner.
 * @param props.rotation - Góc xoay hiện tại của lightbox, độ.
 * @param props.saving - Caller đang lưu (vd tải tệp lên) → khoá công cụ, nút Lưu hiện loading.
 * @param props.onNatural - Gọi sau khi giải mã xong, báo cỡ thật của ảnh để lightbox tính `layout`.
 * @param props.onCancel - Thoát chế độ vẽ (nút Hủy, hoặc Esc khi không còn nháp).
 * @param props.onSave - Nhận `{ file, shapes }` sau khi nung xong.
 *
 * @example
 * <AnnotationLayer key={src} source={blob} fileName="hien-truong.png" initialShapes={[]} layout={layout}
 *   rotation={0} saving={false} onNatural={setNatural} onCancel={stop} onSave={({ file }) => upload(file)} />
 */
function AnnotationLayer({
  source,
  fileName,
  initialShapes,
  layout,
  rotation,
  saving,
  onNatural,
  onCancel,
  onSave,
}: AnnotationLayerProps) {
  const [bitmap, setBitmap] = useState<ImageBitmap | null>(null);
  const [flattening, setFlattening] = useState(false);
  const [flattenedSource, setFlattenedSource] = useState(source);
  const [hoveringMove, setHoveringMove] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const textRef = useRef<HTMLTextAreaElement>(null);
  const draggingRef = useRef(false);
  const { begin: beginSave, invalidate: invalidateSave } = useLatestRequest();

  if (source !== flattenedSource) {
    setFlattenedSource(source);
    setFlattening(false);
  }

  useLayoutEffect(() => {
    invalidateSave();
  }, [source, invalidateSave]);

  useEffect(() => {
    let alive = true;
    let created: ImageBitmap | null = null;
    decodeImage(source)
      .then((bmp) => {
        if (!alive) {
          bmp.close?.();
          return;
        }
        created = bmp;
        setBitmap(bmp);
        onNatural({ w: bmp.width, h: bmp.height });
      })
      .catch(() => {
        if (alive) showToast('error', 'Không đọc được ảnh để chú thích');
      });
    return () => {
      alive = false;
      created?.close?.();
    };
  }, [source, onNatural]);

  const editor = useAnnotationEditor({
    naturalWidth: bitmap?.width ?? 0,
    naturalHeight: bitmap?.height ?? 0,
    initialShapes,
  });
  const { shapes, draft, selectedId, editing, tool, deleteSelected, undo, cancelDraft } = editor;
  const editingId = editing?.id;

  const displayScale = bitmap && layout ? layout.width / bitmap.width : 0;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !bitmap || !layout || !displayScale) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.round(layout.width * dpr);
    canvas.height = Math.round(layout.height * dpr);

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.setTransform(dpr * displayScale, 0, 0, dpr * displayScale, 0, 0);
    ctx.clearRect(0, 0, bitmap.width, bitmap.height);
    ctx.drawImage(bitmap, 0, 0);
    drawShapes(ctx, shapes, {
      draft,
      selectedId,
      scale: displayScale,
      showMoveHandles: true,
      imageHeight: bitmap.height,
    });
  }, [bitmap, layout, displayScale, shapes, draft, selectedId]);

  const toImagePoint = useCallback(
    (e: { clientX: number; clientY: number }): Point => {
      const canvas = canvasRef.current;
      if (!canvas || !layout || !displayScale) return { x: 0, y: 0 };
      const rect = canvas.getBoundingClientRect();
      const dx = e.clientX - (rect.left + rect.width / 2);
      const dy = e.clientY - (rect.top + rect.height / 2);
      const rad = (-rotation * Math.PI) / 180;
      const cos = Math.cos(rad);
      const sin = Math.sin(rad);
      return {
        x: (dx * cos - dy * sin + layout.width / 2) / displayScale,
        y: (dx * sin + dy * cos + layout.height / 2) / displayScale,
      };
    },
    [layout, displayScale, rotation],
  );

  const withCtx = useCallback((fn: (ctx: CanvasRenderingContext2D) => void) => {
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) fn(ctx);
  }, []);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (!displayScale) return;
      e.stopPropagation();
      e.currentTarget.setPointerCapture(e.pointerId);
      draggingRef.current = true;
      withCtx((ctx) => editor.pointerDown(ctx, toImagePoint(e), displayScale));
    },
    [displayScale, toImagePoint, withCtx, editor],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (!displayScale) return;
      if (draggingRef.current) {
        editor.pointerMove(toImagePoint(e));
        return;
      }
      const pt = toImagePoint(e);
      withCtx((ctx) => setHoveringMove(editor.moveHandleHitId(ctx, pt, displayScale) !== null));
    },
    [displayScale, toImagePoint, withCtx, editor],
  );

  const handlePointerUp = useCallback(() => {
    draggingRef.current = false;
    editor.pointerUp();
  }, [editor]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (editing) return;
      if (e.key === 'Escape') {
        e.preventDefault();
        if (draft) cancelDraft();
        else onCancel();
        return;
      }
      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        deleteSelected();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        undo();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [editing, draft, cancelDraft, deleteSelected, undo, onCancel]);

  const readyRef = useRef(false);
  useEffect(() => {
    readyRef.current = false;
    if (!editingId) return;
    const id = requestAnimationFrame(() => {
      const el = textRef.current;
      if (el) {
        el.focus();
        el.setSelectionRange(el.value.length, el.value.length);
      }
      readyRef.current = true;
    });
    return () => cancelAnimationFrame(id);
  }, [editingId]);

  const handleTextBlur = useCallback(() => {
    if (readyRef.current) editor.commitEditing();
  }, [editor]);

  const handleSave = useCallback(async () => {
    editor.commitEditing();
    const isCurrent = beginSave();
    setFlattening(true);
    try {
      const file = await flattenAnnotations({ source, shapes: editor.shapes, fileName });
      if (!isCurrent()) return;
      onSave({ file, shapes: editor.shapes });
    } catch (e) {
      if (!isCurrent()) return;
      showToast('error', 'Không lưu được ảnh đã chú thích', { description: (e as Error).message });
    } finally {
      if (isCurrent()) setFlattening(false);
    }
  }, [beginSave, source, fileName, editor, onSave]);

  const handleDoubleClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!displayScale) return;
      e.preventDefault();
      e.stopPropagation();
      const pt = toImagePoint(e);
      withCtx((ctx) => {
        const target = editor.textAt(ctx, pt, displayScale);
        if (target) editor.startEditText(target);
      });
    },
    [displayScale, toImagePoint, withCtx, editor],
  );

  const busy = saving || flattening;
  const canvasClassName = cn(
    ANNOTATION_CANVAS_CLASSES,
    ANNOTATION_CANVAS_CURSOR_CLASSES[hoveringMove ? 'move' : tool],
  );

  const boxStyle = useMemo(
    () =>
      layout
        ? {
            width: layout.width,
            height: layout.height,
            transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
          }
        : undefined,
    [layout, rotation],
  );

  return (
    <>
      {layout && bitmap ? (
        <div className={ANNOTATION_BOX_CLASSES} style={boxStyle}>
          <canvas
            ref={canvasRef}
            className={canvasClassName}
            onClick={(e) => e.stopPropagation()}
            onDoubleClick={handleDoubleClick}
            onPointerCancel={handlePointerUp}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
          />

          {editing && (
            <AnnotationLayerTextBox
              editing={editing}
              inputRef={textRef}
              scale={displayScale}
              onBlur={handleTextBlur}
              onChange={editor.changeEditingText}
              onCommit={editor.commitEditing}
            />
          )}
        </div>
      ) : (
        <div className={ANNOTATION_SPINNER_BOX_CLASSES}>
          <Spinner />
        </div>
      )}

      <AnnotationLayerActionBar
        busy={busy}
        editor={editor}
        ready={!!bitmap}
        onCancel={onCancel}
        onSave={handleSave}
      />
    </>
  );
}

export default AnnotationLayer;
