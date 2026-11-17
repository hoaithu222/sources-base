import Button from '@/shared/ui/actions/Button';
import { IMAGE_LIGHTBOX_SURFACE_CLASSES } from '@/shared/ui/media/image/lightbox/image-lightbox.theme';
import { cn } from '@/shared/utils/style/cn';
import { AnnotatorToolbar } from './annotator-toolbar';
import type { AnnotationEditor } from '../useAnnotationEditor';

const ANNOTATION_ACTION_BAR_CLASSES = cn(
  'fixed bottom-[calc(4.75rem+var(--safe-b,0px))] left-1/2 z-20 flex -translate-x-1/2 items-center gap-2',
  IMAGE_LIGHTBOX_SURFACE_CLASSES,
  'px-2 py-1',
);

interface AnnotationLayerActionBarProps {
  editor: AnnotationEditor;
  ready: boolean;
  busy: boolean;
  onCancel: () => void;
  onSave: () => void;
}

/**
 * AnnotationLayerActionBar — thanh nổi khi đang chú thích: cụm công cụ · Hủy · Lưu; nội bộ của AnnotationLayer.
 *
 * Dùng chung bề mặt nổi với thanh công cụ lightbox (`IMAGE_LIGHTBOX_SURFACE_CLASSES`).
 * Lưu ý: `fixed` nằm NGAY TRÊN thanh zoom của lightbox (đã cộng `--safe-b`) — đổi `bottom` của một bên phải
 * đổi cả bên kia.
 *
 * @param props.editor - Editor trả về từ `useAnnotationEditor`.
 * @param props.ready - `false` (ảnh chưa giải mã xong) → khoá công cụ và nút Lưu.
 * @param props.busy - `true` (đang lưu / nung ảnh) → khoá mọi nút, nút Lưu hiện loading.
 * @param props.onCancel - Bấm Hủy (thoát chế độ vẽ).
 * @param props.onSave - Bấm Lưu.
 *
 * @example
 * <AnnotationLayerActionBar editor={editor} ready busy={false} onCancel={stop} onSave={save} />
 */
export const AnnotationLayerActionBar = ({
  editor,
  ready,
  busy,
  onCancel,
  onSave,
}: AnnotationLayerActionBarProps) => (
  <div className={ANNOTATION_ACTION_BAR_CLASSES} onClick={(e) => e.stopPropagation()}>
    <AnnotatorToolbar disabled={!ready || busy} editor={editor} />
    <span aria-hidden className="h-6 w-px bg-border-strong" />
    <Button disabled={busy} size="sm" skin="neutral" variant="ghost" onClick={onCancel}>
      Hủy
    </Button>
    <Button disabled={!ready} loading={busy} size="sm" variant="primary" onClick={onSave}>
      Lưu
    </Button>
  </div>
);
