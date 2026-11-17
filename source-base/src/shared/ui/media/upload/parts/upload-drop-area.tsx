import type { KeyboardEvent, ReactNode } from 'react';
import Button from '@/shared/ui/actions/Button';
import { SystemIcon } from '@/shared/ui/icons/Icons';
import { cn } from '@/shared/utils/style/cn';
import { formatFileSize } from '@/shared/utils/format/file-size.utils';
import {
  UPLOAD_DROP_AREA_BASE_CLASSES,
  UPLOAD_DROP_AREA_BUTTON_HOVER_CLASSES,
  UPLOAD_DROP_AREA_BUTTON_SIZES,
  UPLOAD_DROP_AREA_DESCRIPTION_CLASSES,
  UPLOAD_DROP_AREA_HERO_BASE_CLASSES,
  UPLOAD_DROP_AREA_HERO_ICON_PX,
  UPLOAD_DROP_AREA_HERO_SIZE_CLASSES,
  UPLOAD_DROP_AREA_HERO_STATE_CLASSES,
  UPLOAD_DROP_AREA_SIZE_CLASSES,
  UPLOAD_DROP_AREA_STATE_CLASSES,
  UPLOAD_DROP_AREA_TITLE_SIZE_CLASSES,
  UPLOAD_DROP_AREA_TITLE_STATE_CLASSES,
} from '../upload.theme';
import type { UploadDropAreaState, UploadTriggerProps } from '../upload.types';

interface UploadDropAreaProps extends UploadTriggerProps {
  accept?: string;
  buttonLabel: string;
  description?: ReactNode;
  heroIcon?: ReactNode;
  maxSize?: number;
  title?: ReactNode;
  onKeyDown: (e: KeyboardEvent<HTMLDivElement>) => void;
}

const DEFAULT_TITLE = 'Kéo thả tệp vào đây';

const DROP_TITLE = 'Thả tệp để tải lên';

function getDropAreaState(
  disabled: boolean | undefined,
  hasError: boolean,
  dragOver: boolean,
): UploadDropAreaState {
  if (disabled) return 'disabled';
  if (dragOver) return 'dragOver';
  return hasError ? 'error' : 'idle';
}

function buildAcceptDescription(accept?: string, maxSize?: number): string {
  const parts: string[] = [];
  const types = accept
    ?.split(',')
    .map((type) => type.trim())
    .filter(Boolean);
  if (types?.length) parts.push(`Hỗ trợ ${types.join(', ')}`);
  if (maxSize) parts.push(`${parts.length ? 'tối đa' : 'Tối đa'} ${formatFileSize(maxSize)}/tệp`);
  return parts.join(' · ');
}

/**
 * UploadDropArea — kiểu `variant="dropzone"` của Upload: vùng viền đứt, ô icon, tiêu đề + mô tả, nút "Chọn file";
 * nội bộ của Upload.
 *
 * Cả vùng là MỘT nút (`role="button"`); nút "Chọn file" bên trong chỉ là hình (`<span>`), sáng theo hover của
 * vùng. Kéo tệp vào: viền liền + nhuộm primary, tiêu đề đổi thành "Thả tệp để tải lên"; trạng thái kéo thắng lỗi.
 * Sửa giao diện: `UPLOAD_DROP_AREA_*` (upload.theme.ts).
 *
 * @param props.accept - Đuôi / MIME được nhận (ghép vào dòng mô tả mặc định).
 * @param props.buttonLabel - Chữ nút bên trong.
 * @param props.description - Dòng phụ; mặc định ghép từ `accept` + `maxSize` ("Hỗ trợ .pdf, .docx · tối đa 10 MB/tệp").
 * @param props.dragOver - Đang kéo tệp phía trên (viền liền, nhuộm primary, đổi tiêu đề).
 * @param props.hasError - Đang có lỗi (viền + ô icon màu lỗi).
 * @param props.heroIcon - Icon trong ô icon; mặc định icon tải lên.
 * @param props.maxSize - Dung lượng tối đa mỗi tệp, byte (ghép vào dòng mô tả).
 * @param props.title - Dòng chính; mặc định "Kéo thả tệp vào đây".
 * @param props.onKeyDown - Enter / Space mở hộp chọn.
 * @param props.size - Cỡ: `sm` | `md` | `lg` (đệm, ô icon, chữ, cỡ nút).
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
 * <UploadDropArea buttonLabel="Chọn file" dragOver={false} hasError={false} size="md" onKeyDown={key}
 *   onOpen={open} onDragOver={over} onDragLeave={leave} onDrop={drop} />
 */
const UploadDropArea = ({
  'aria-describedby': ariaDescribedBy,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  accept,
  buttonLabel,
  description,
  disabled,
  dragOver,
  hasError,
  heroIcon,
  maxSize,
  size,
  title,
  onDragLeave,
  onDragOver,
  onDrop,
  onKeyDown,
  onOpen,
}: UploadDropAreaProps) => {
  const state = getDropAreaState(disabled, hasError, dragOver);
  const computedTitle = title ?? DEFAULT_TITLE;
  const computedDescription = description ?? (buildAcceptDescription(accept, maxSize) || null);

  const rootClassName = cn(
    UPLOAD_DROP_AREA_BASE_CLASSES,
    UPLOAD_DROP_AREA_SIZE_CLASSES[size],
    UPLOAD_DROP_AREA_STATE_CLASSES[state],
  );
  const heroClassName = cn(
    UPLOAD_DROP_AREA_HERO_BASE_CLASSES,
    UPLOAD_DROP_AREA_HERO_SIZE_CLASSES[size],
    UPLOAD_DROP_AREA_HERO_STATE_CLASSES[state],
  );
  const titleClassName = cn(
    UPLOAD_DROP_AREA_TITLE_SIZE_CLASSES[size],
    UPLOAD_DROP_AREA_TITLE_STATE_CLASSES[state],
  );
  const buttonClassName = cn(
    'cursor-[inherit]',
    !disabled && UPLOAD_DROP_AREA_BUTTON_HOVER_CLASSES,
  );

  return (
    <div
      aria-describedby={ariaDescribedBy}
      aria-disabled={disabled || undefined}
      aria-label={ariaLabel ?? (typeof computedTitle === 'string' ? computedTitle : 'Chọn file')}
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
      <span aria-hidden className={heroClassName}>
        {heroIcon ?? (
          <SystemIcon name="upload-outline" size={UPLOAD_DROP_AREA_HERO_ICON_PX[size]} />
        )}
      </span>
      <div className="flex flex-col items-center gap-1">
        <p className={titleClassName}>{dragOver ? DROP_TITLE : computedTitle}</p>
        {computedDescription ? (
          <p className={UPLOAD_DROP_AREA_DESCRIPTION_CLASSES}>{computedDescription}</p>
        ) : null}
      </div>
      <Button
        asChild
        className={buttonClassName}
        size={UPLOAD_DROP_AREA_BUTTON_SIZES[size]}
        variant="secondary"
      >
        <span>{buttonLabel}</span>
      </Button>
    </div>
  );
};

export default UploadDropArea;
