import type { RefObject } from 'react';
import { FONT_FAMILY, LINE_HEIGHT_RATIO } from '../utils/annotation.utils';
import type { TextShape } from '../types/annotation.types';

const ANNOTATION_TEXT_BOX_CLASSES =
  'absolute z-10 resize-none overflow-hidden border border-primary-5 bg-neutral-10/80 p-0 outline-none';

interface AnnotationLayerTextBoxProps {
  editing: TextShape;
  scale: number;
  inputRef: RefObject<HTMLTextAreaElement | null>;
  onBlur: () => void;
  onChange: (value: string) => void;
  onCommit: () => void;
}

/**
 * AnnotationLayerTextBox — ô soạn chữ nổi trên canvas chú thích; nội bộ của AnnotationLayer.
 *
 * Lưu ý: PHẢI nằm trong hộp xoay cùng canvas để chữ dính đúng chỗ khi ảnh xoay. Phím trong ô không nổi bọt
 * (Delete / Ctrl+Z của lớp vẽ không chạy khi đang gõ).
 *
 * @param props.editing - Shape chữ đang soạn (toạ độ, cỡ chữ theo px ảnh gốc).
 * @param props.scale - px hiển thị trên 1 px ảnh gốc.
 * @param props.inputRef - Ref tới `<textarea>` (lớp vẽ focus nó ở frame sau khi mount).
 * @param props.onBlur - Rời ô (lớp vẽ chốt chữ).
 * @param props.onChange - Gõ chữ.
 * @param props.onCommit - Bấm Esc trong ô — kết thúc soạn.
 *
 * @example
 * <AnnotationLayerTextBox editing={shape} scale={0.5} inputRef={ref} onBlur={commit} onChange={setText}
 *   onCommit={commit} />
 */
export const AnnotationLayerTextBox = ({
  editing,
  scale,
  inputRef,
  onBlur,
  onChange,
  onCommit,
}: AnnotationLayerTextBoxProps) => (
  <textarea
    ref={inputRef}
    className={ANNOTATION_TEXT_BOX_CLASSES}
    placeholder="Nhập chữ…"
    rows={Math.max(editing.text.split('\n').length, 1)}
    style={{
      left: editing.x * scale,
      top: editing.y * scale,
      fontSize: editing.fontSize * scale,
      lineHeight: LINE_HEIGHT_RATIO,
      fontFamily: FONT_FAMILY,
      fontWeight: 600,
      color: editing.color,
      minWidth: 120,
    }}
    value={editing.text}
    onBlur={onBlur}
    onChange={(e) => onChange(e.target.value)}
    onClick={(e) => e.stopPropagation()}
    onKeyDown={(e) => {
      e.stopPropagation();
      if (e.key === 'Escape') onCommit();
    }}
    onPointerDown={(e) => e.stopPropagation()}
  />
);
