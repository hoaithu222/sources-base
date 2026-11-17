'use client';

import type { ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import Button from '@/shared/ui/actions/Button';
import type { ButtonVariant } from '@/shared/ui/actions/button.types';
import { cn } from '@/shared/utils/style/cn';
import type { UploadTriggerProps } from '../upload.types';

interface UploadButtonProps extends UploadTriggerProps {
  buttonFullWidth: boolean;
  buttonLabel: string;
  buttonVariant: ButtonVariant;
  label?: ReactNode;
  prefixIcon?: ReactNode;
}

const UPLOAD_BUTTON_DRAG_OVER_CLASSES =
  'outline-2 outline-offset-2 outline-dashed outline-primary-5';

/**
 * UploadButton — kiểu `variant="button"` của Upload: đúng một `<Button>` UI kit, KHÔNG khung ô nhập; nội bộ của Upload.
 *
 * Vẫn nhận kéo-thả vì nút là đích thả hợp lệ: kéo tệp qua → viền đứt quanh nút; lỗi / `invalid` → skin `danger`.
 * Sửa giao diện: viền khi kéo → `UPLOAD_BUTTON_DRAG_OVER_CLASSES`.
 *
 * @param props.buttonFullWidth - Nút giãn hết bề ngang.
 * @param props.buttonLabel - Chữ nút khi không có `label`.
 * @param props.buttonVariant - Kiểu nút (`ButtonVariant`).
 * @param props.label - Chữ nút (thắng `buttonLabel`).
 * @param props.prefixIcon - Icon đầu nút.
 * @param props.dragOver - Đang kéo tệp phía trên (viền đứt quanh nút).
 * @param props.hasError - Đang có lỗi (nút đổi sang skin `danger`).
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
 * <UploadButton buttonFullWidth={false} buttonLabel="Chọn file" buttonVariant="stroke" dragOver={false}
 *   hasError={false} size="md"
 *   onOpen={open} onDragOver={over} onDragLeave={leave} onDrop={drop} />
 */
const UploadButton = ({
  'aria-describedby': ariaDescribedBy,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  buttonFullWidth,
  buttonLabel,
  buttonVariant,
  disabled,
  dragOver,
  hasError,
  label,
  prefixIcon,
  size,
  onDragLeave,
  onDragOver,
  onDrop,
  onOpen,
}: UploadButtonProps) => {
  const t = useTranslations('ui.media');
  const buttonText = label ?? buttonLabel;

  return (
    <Button
      aria-describedby={ariaDescribedBy}
      aria-label={ariaLabel ?? (typeof buttonText === 'string' ? buttonText : t('upload.pickFile'))}
      aria-labelledby={ariaLabelledBy}
      className={cn(dragOver && UPLOAD_BUTTON_DRAG_OVER_CLASSES)}
      disabled={disabled}
      fullWidth={buttonFullWidth}
      size={size}
      skin={hasError ? 'danger' : 'base'}
      startIcon={prefixIcon}
      type="button"
      variant={buttonVariant}
      onClick={onOpen}
      onDragLeave={onDragLeave}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      {buttonText}
    </Button>
  );
};

export default UploadButton;
