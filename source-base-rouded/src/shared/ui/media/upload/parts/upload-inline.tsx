import type { KeyboardEvent, ReactNode } from 'react';
import { SystemIcon } from '@/shared/ui/icons/Icons';
import { FIELD_HEIGHT, FIELD_ICON_CLASS, fieldSurface } from '@/shared/ui/inputs/field.theme';
import { cn } from '@/shared/utils/style/cn';
import { TEXT_ELLIPSIS_CLASSES } from '@/shared/ui/primitives/text-ellipsis.theme';
import {
  UPLOAD_INLINE_BASE_CLASSES,
  UPLOAD_INLINE_ICON_STATE_CLASSES,
  UPLOAD_INLINE_LABEL_STATE_CLASSES,
  UPLOAD_INLINE_STATE_CLASSES,
  UPLOAD_INLINE_TRAILING_CLASSES,
} from '../upload.theme';
import type { UploadInlineState, UploadTriggerProps } from '../upload.types';

interface UploadInlineProps extends UploadTriggerProps {
  currentCount: number;
  label?: ReactNode;
  prefixIcon?: ReactNode;
  trailing?: ReactNode;
  onKeyDown: (e: KeyboardEvent<HTMLDivElement>) => void;
}

const DROP_LABEL = 'Thả tệp để tải lên';

function getInlineState(
  disabled: boolean | undefined,
  hasError: boolean,
  dragOver: boolean,
  currentCount: number,
): UploadInlineState {
  if (disabled) return 'disabled';
  if (dragOver) return 'dragOver';
  if (hasError) return 'error';
  return currentCount > 0 ? 'filled' : 'idle';
}

/**
 * UploadInline — kiểu `variant="inline"` của Upload: hàng gọn dùng khung ô nhập (`fieldSurface`), icon + nhãn +
 * cụm cuối; nội bộ của Upload.
 *
 * Kéo tệp qua: viền + nền primary, nhãn đổi thành "Thả tệp để tải lên"; trạng thái kéo thắng lỗi.
 * Sửa giao diện: `UPLOAD_INLINE_*` (upload.theme.ts); khung + cao → `fieldSurface` / `FIELD_HEIGHT` (field.theme.ts).
 *
 * @param props.currentCount - Số tệp đã chọn (nhãn mặc định "N tệp đã chọn", trạng thái `filled`).
 * @param props.dragOver - Đang kéo tệp phía trên.
 * @param props.hasError - Đang có lỗi (viền lỗi).
 * @param props.label - Nhãn; mặc định "Tải file lên" / "N tệp đã chọn".
 * @param props.prefixIcon - Icon đầu hàng; mặc định icon tệp.
 * @param props.trailing - Cụm cuối hàng; mặc định icon tải lên (báo đây là ô CHỌN tệp, không gõ).
 * @param props.onKeyDown - Enter / Space mở hộp chọn.
 * @param props.size - Cỡ: `sm` | `md` | `lg`.
 * @param props.disabled - Khoá bấm và kéo-thả.
 * @param props.aria-label - Tên trợ năng của vùng bấm.
 * @param props.aria-labelledby - Id nhãn đang hiện trên màn; thắng `aria-label`.
 * @param props.aria-describedby - Id dòng mô tả / lỗi.
 * @param props.onOpen - Mở hộp chọn tệp.
 * @param props.onDragOver - Kéo tệp đi qua (bật trạng thái kéo).
 * @param props.onDragLeave - Kéo tệp ra ngoài.
 * @param props.onDrop - Thả tệp.
 *
 * @example
 * <UploadInline currentCount={0} dragOver={false} hasError={false} size="md" onKeyDown={key} onOpen={open}
 *   onDragOver={over} onDragLeave={leave} onDrop={drop} />
 */
const UploadInline = ({
  'aria-describedby': ariaDescribedBy,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  currentCount,
  disabled,
  dragOver,
  hasError,
  label,
  prefixIcon,
  size,
  trailing,
  onDragLeave,
  onDragOver,
  onDrop,
  onKeyDown,
  onOpen,
}: UploadInlineProps) => {
  const state = getInlineState(disabled, hasError, dragOver, currentCount);
  const computedLabel =
    label ?? (currentCount > 0 ? `${currentCount} tệp đã chọn` : 'Tải file lên');

  const rootClassName = cn(
    fieldSurface({ focusMode: 'trigger', invalid: hasError, disabled }),
    UPLOAD_INLINE_BASE_CLASSES,
    FIELD_HEIGHT[size],
    UPLOAD_INLINE_STATE_CLASSES[state],
  );
  const iconClassName = cn(FIELD_ICON_CLASS, UPLOAD_INLINE_ICON_STATE_CLASSES[state]);
  const labelClassName = cn(
    TEXT_ELLIPSIS_CLASSES,
    'flex-1 text-body-14',
    UPLOAD_INLINE_LABEL_STATE_CLASSES[state],
  );

  return (
    <div
      aria-describedby={ariaDescribedBy}
      aria-disabled={disabled || undefined}
      aria-label={ariaLabel ?? (typeof computedLabel === 'string' ? computedLabel : 'Chọn file')}
      aria-labelledby={ariaLabelledBy}
      className={rootClassName}
      role="button"
      tabIndex={disabled ? -1 : 0}
      onClick={onOpen}
      onDragLeave={onDragLeave}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onKeyDown={onKeyDown}
    >
      <span aria-hidden className={iconClassName}>
        {prefixIcon ?? <SystemIcon name="file-outline" size={16} />}
      </span>
      <span className={labelClassName}>{dragOver ? DROP_LABEL : computedLabel}</span>
      <span className={UPLOAD_INLINE_TRAILING_CLASSES}>
        {trailing ?? <SystemIcon aria-hidden name="upload-outline" size={14} />}
      </span>
    </div>
  );
};

export default UploadInline;
