import { memo } from 'react';
import Button from '@/shared/ui/actions/Button';
import SegmentToggle from '@/shared/ui/actions/segment-toggle/SegmentToggle';
import { SystemIcon } from '@/shared/ui/icons/Icons';
import Tooltip from '@/shared/ui/overlays/Tooltip';
import { cn } from '@/shared/utils/style/cn';
import { ANNOTATION_COLOR_NAMES, ANNOTATION_COLORS, SIZE_STEPS } from '../utils/annotation.utils';
import type { Tool } from '../types/annotation.types';
import type { AnnotationEditor } from '../useAnnotationEditor';

const TOOL_OPTIONS = [
  { key: 'ellipse', label: 'Khoanh', icon: <SystemIcon name="circle-outline" size={16} /> },
  { key: 'text', label: 'Chữ', icon: <SystemIcon name="type-outline" size={16} /> },
];

const SIZE_LABELS = ['Mảnh', 'Vừa', 'Dày'];

const SIZE_OPTIONS = SIZE_STEPS.map((step, idx) => ({
  key: String(step),
  label: SIZE_LABELS[idx],
}));

const ANNOTATOR_TOOLBAR_CLASSES = 'flex items-center gap-2';
const ANNOTATOR_SWATCH_LIST_CLASSES = 'flex items-center gap-1.5';
const ANNOTATOR_SWATCH_BASE_CLASSES = cn(
  'size-5 cursor-pointer rounded-full border',
  'transition-[border-color,box-shadow] duration-150 ease-out',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring-focus',
  'disabled:cursor-not-allowed disabled:opacity-50',
);

const ANNOTATOR_SWATCH_STATE_CLASSES = {
  active: cn(
    'border-neutral-0/80 ring-2 ring-primary-5',
    'dark:ring-primary-4 dark:shadow-[0_0_10px_color-mix(in_srgb,var(--color-primary-5)_70%,transparent)]',
  ),
  idle: 'border-border-strong enabled:hover:border-primary-5/60',
} satisfies Record<'active' | 'idle', string>;

interface AnnotatorToolbarProps {
  editor: AnnotationEditor;
  disabled?: boolean;
}

/**
 * AnnotatorToolbar — cụm công cụ chú thích: công cụ · màu · cỡ nét / chữ · hoàn tác · xoá; nội bộ của AnnotationLayer.
 *
 * Sửa giao diện: công cụ → `TOOL_OPTIONS` · nhãn cỡ → `SIZE_LABELS` · dáng ô màu → `ANNOTATOR_SWATCH_*_CLASSES`.
 * Lưu ý: import Button / SegmentToggle / Tooltip theo đường TRỰC TIẾP, không qua barrel `@/shared/ui` (barrel
 * export ImageLightbox, mà lightbox import lớp chú thích ⇒ vòng lặp). Đổi màu / cỡ khi đang chọn một nét áp
 * NGAY cho nét đó (xử lý trong useAnnotationEditor).
 *
 * @param props.editor - Editor trả về từ `useAnnotationEditor`.
 * @param props.disabled - `true` → khoá từng nút / ô màu / nhóm chọn (ảnh đang giải mã / đang lưu).
 *   Mặc định `false`.
 *
 * @example
 * <AnnotatorToolbar editor={editor} disabled={busy} />
 */
export const AnnotatorToolbar = memo(function AnnotatorToolbar({
  editor,
  disabled = false,
}: AnnotatorToolbarProps) {
  return (
    <div className={ANNOTATOR_TOOLBAR_CLASSES}>
      <SegmentToggle
        disabled={disabled}
        options={TOOL_OPTIONS}
        size="sm"
        value={editor.tool}
        variant="subtle"
        onValueChange={(next) => editor.setTool(next as Tool)}
      />

      <div className={ANNOTATOR_SWATCH_LIST_CLASSES}>
        {ANNOTATION_COLORS.map((c) => (
          <button
            key={c}
            aria-label={`Màu ${ANNOTATION_COLOR_NAMES[c]}`}
            aria-pressed={editor.color === c}
            className={cn(
              ANNOTATOR_SWATCH_BASE_CLASSES,
              editor.color === c
                ? ANNOTATOR_SWATCH_STATE_CLASSES.active
                : ANNOTATOR_SWATCH_STATE_CLASSES.idle,
            )}
            disabled={disabled}
            style={{ backgroundColor: c }}
            type="button"
            onClick={() => editor.setColor(c)}
          />
        ))}
      </div>

      <SegmentToggle
        disabled={disabled}
        options={SIZE_OPTIONS}
        size="sm"
        value={String(editor.sizeStep)}
        variant="subtle"
        onValueChange={(next) => editor.setSizeStep(Number(next))}
      />

      <Tooltip content="Hoàn tác (Ctrl+Z)">
        <Button
          aria-label="Hoàn tác"
          disabled={disabled || !editor.canUndo}
          size="sm"
          skin="neutral"
          variant="ghost"
          onClick={editor.undo}
        >
          <SystemIcon name="arrow-rotate-left-outline" size={16} />
        </Button>
      </Tooltip>
      <Tooltip content="Xoá nét đang chọn (Delete)">
        <Button
          aria-label="Xoá nét đang chọn"
          disabled={disabled || !editor.selected}
          size="sm"
          skin="neutral"
          variant="ghost"
          onClick={editor.deleteSelected}
        >
          <SystemIcon name="trash-can-outline" size={16} />
        </Button>
      </Tooltip>
      <Tooltip content="Xoá toàn bộ chú thích">
        <Button
          aria-label="Xoá toàn bộ chú thích"
          disabled={disabled || !editor.shapes.length}
          size="sm"
          skin="neutral"
          variant="ghost"
          onClick={editor.clearAll}
        >
          <SystemIcon name="circle-xmark-outline" size={16} />
        </Button>
      </Tooltip>
    </div>
  );
});
