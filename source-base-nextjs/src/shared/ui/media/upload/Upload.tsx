'use client';

import { useId, type ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import { SystemIcon } from '@/shared/ui/icons/Icons';
import type { ButtonVariant } from '@/shared/ui/actions/button.types';
import UploadButton from './parts/upload-button';
import UploadDropArea from './parts/upload-drop-area';
import UploadInline from './parts/upload-inline';
import { useUploadPicker } from './hooks/useUploadPicker';
import type { UploadSize, UploadVariant, ValidationError } from './upload.types';

export interface UploadProps {
  variant?: UploadVariant;
  size?: UploadSize;
  multiple?: boolean;
  directory?: boolean;
  directoryOnly?: boolean;
  accept?: string;
  maxSize?: number;
  maxFiles?: number;
  currentCount?: number;
  onFiles?: (files: File[]) => void;
  onDirectories?: (folderPaths: string[]) => void;
  onReject?: (rejections: { file: File; error: ValidationError }[]) => void;
  error?: string;
  invalid?: boolean;
  disabled?: boolean;
  heroIcon?: ReactNode;
  title?: ReactNode;
  description?: ReactNode;
  label?: ReactNode;
  prefixIcon?: ReactNode;
  buttonLabel?: string;
  buttonVariant?: ButtonVariant;
  buttonFullWidth?: boolean;
  trailing?: ReactNode;
  id?: string;
  name?: string;
  className?: string;
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
  ref?: React.Ref<HTMLDivElement>;
}

const UPLOAD_ERROR_CLASSES =
  'mt-1 flex items-start gap-1 text-caption-12 text-error animate-chip-in motion-reduce:animate-none';

/**
 * Upload — chọn tệp bằng bấm hoặc kéo-thả; chỉ phát `onFiles(File[])`, KHÔNG giữ danh sách.
 *
 * Danh sách + tiến độ tải: ghép với `useUpload` + `FileList`. Trong form dùng `FileField` (đã nối nhãn, lỗi).
 * Thả tệp lên vùng bảng / khung có sẵn → `Dropzone`.
 * Sửa giao diện: class → `UPLOAD_DROP_AREA_*` · `UPLOAD_INLINE_*` (upload.theme.ts); markup → `parts/`
 * (`upload-drop-area` · `upload-inline` · `upload-button`) · dòng lỗi → `UPLOAD_ERROR_CLASSES`.
 * Lưu ý: `variant="inline"` trông như ô nhập — hành động (quét, tải lên) dùng `variant="button"`. `maxFiles` chỉ
 * giới hạn MỖI LẦN chọn (`maxFiles - currentCount`); tổng số do caller giữ. Kéo tệp qua → trạng thái kéo thắng
 * `error`. Lý do thiết kế:
 * notes/components/media-upload.md.
 *
 * @param props.variant - Kiểu: `dropzone` (vùng viền đứt, icon lớn) | `inline` (hàng gọn như ô nhập) | `button`
 *   (một nút, vẫn nhận kéo-thả). Mặc định `dropzone`.
 * @param props.size - Cỡ: `sm` | `md` | `lg`. Mặc định `md`.
 * @param props.multiple - `true` → chọn nhiều tệp một lần. Mặc định `false`.
 * @param props.directory - `true` → hộp chọn lấy cả THƯ MỤC (`webkitdirectory`), tệp kèm `webkitRelativePath`;
 *   ngầm định `multiple`. Mặc định `false`.
 * @param props.directoryOnly - `true` → kéo-thả CHỈ nhận thư mục; tệp lẻ → `onReject`. Mặc định `false`.
 * @param props.accept - Đuôi tệp (`".pdf,.docx"`) hoặc MIME (`"image/*,application/pdf"`).
 * @param props.maxSize - Dung lượng tối đa MỖI tệp, byte.
 * @param props.maxFiles - Tổng số tệp tối đa; số còn được chọn = `maxFiles - currentCount`.
 * @param props.currentCount - Số tệp caller đang giữ (tính `maxFiles`, nhãn của `inline`). Mặc định `0`.
 * @param props.onFiles - Nhận các tệp HỢP LỆ của mỗi lần chọn / thả.
 * @param props.onDirectories - Đường dẫn thư mục vừa thả (kể cả rỗng), bắn TRƯỚC `onFiles`; chỉ có khi kéo-thả
 *   với `directoryOnly`.
 * @param props.onReject - Nhận `{ file, error }[]` của tệp bị loại (sai loại, quá cỡ, quá số lượng).
 * @param props.error - Thông báo lỗi dưới ô (icon + chữ, nối vào `aria-describedby`); trigger cũng tô màu lỗi
 *   (`button` → skin `danger`).
 * @param props.invalid - `true` → CHỈ tô màu lỗi cho trigger, KHÔNG in dòng lỗi (lỗi đã hiện ở nơi khác, vd
 *   `FormItem`). Mặc định `false`.
 * @param props.disabled - `true` → khoá bấm và kéo-thả. Mặc định `false`.
 * @param props.heroIcon - Icon trong ô icon của `dropzone`. Mặc định icon tải lên.
 * @param props.title - Dòng chính của `dropzone` (đổi thành "Thả tệp để tải lên" khi đang kéo). Mặc định theo
 *   ngôn ngữ (khoá `ui.media.upload.defaultTitle`: "Kéo thả tệp vào đây").
 * @param props.description - Dòng phụ của `dropzone`. Mặc định tự ghép từ `accept` + `maxSize`.
 * @param props.label - Chữ của `inline` / `button` (thay `buttonLabel` ở `button`).
 * @param props.prefixIcon - Icon đầu của `inline` / `button`.
 * @param props.buttonLabel - Chữ nút "Chọn file" (`dropzone`, `button`). Mặc định theo ngôn ngữ (khoá
 *   `ui.media.upload.pickFile`: "Chọn file").
 * @param props.buttonVariant - Kiểu nút của `variant="button"` (`ButtonVariant`). Mặc định `stroke`.
 * @param props.buttonFullWidth - `true` → nút giãn hết bề ngang (`variant="button"`). Mặc định `false`.
 * @param props.trailing - Cụm cuối hàng của `inline`. Mặc định icon tải lên.
 * @param props.id - `id` của `<input type="file">` ẩn. Mặc định tự sinh.
 * @param props.name - `name` của `<input type="file">` ẩn (gửi form thuần).
 * @param props.className - Class thêm cho khung ngoài.
 * @param props.aria-label - Tên trợ năng của vùng bấm. Mặc định theo `title` / `label` / `buttonLabel`.
 * @param props.aria-labelledby - Id nhãn đang hiện trên màn (vd của `FormItem`); thắng `aria-label`.
 * @param props.aria-describedby - Id dòng mô tả / lỗi liên quan.
 * @param props.ref - Trỏ tới `<div>` khung ngoài (React 19: `ref` là prop thường).
 *
 * @example
 * <Upload accept=".pdf,.docx" maxSize={10 * 1024 ** 2} multiple onFiles={addFiles} />
 *
 * <Upload variant="button" buttonLabel="Chọn thư mục" directory onFiles={addFiles} />
 */
function Upload({
  variant = 'dropzone',
  size = 'md',
  multiple = false,
  directory = false,
  directoryOnly = false,
  accept,
  maxSize,
  maxFiles,
  currentCount = 0,
  onFiles,
  onDirectories,
  onReject,
  error,
  invalid = false,
  disabled,
  heroIcon,
  title,
  description,
  label,
  prefixIcon,
  buttonLabel,
  buttonVariant = 'stroke',
  buttonFullWidth = false,
  trailing,
  id,
  name,
  className,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  'aria-describedby': ariaDescribedBy,
  ref,
}: UploadProps) {
  const t = useTranslations('ui.media');
  const reactId = useId();
  const inputId = id ?? `upload-${reactId}`;
  const errorId = `${inputId}-error`;
  const {
    dragOver,
    handleDragLeave,
    handleDragOver,
    handleDrop,
    handleInputChange,
    handleKeyDown,
    inputRef,
    openPicker,
  } = useUploadPicker({
    accept,
    currentCount,
    directory,
    directoryOnly,
    disabled,
    maxFiles,
    maxSize,
    onDirectories,
    onFiles,
    onReject,
  });

  const allowMultiple = multiple || directory;
  const resolvedButtonLabel = buttonLabel ?? t('upload.pickFile');
  const describedBy = [ariaDescribedBy, error ? errorId : undefined].filter(Boolean).join(' ');
  const triggerProps = {
    'aria-describedby': describedBy || undefined,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledBy,
    disabled,
    dragOver,
    hasError: invalid || Boolean(error),
    size,
    onDragLeave: handleDragLeave,
    onDragOver: handleDragOver,
    onDrop: handleDrop,
    onOpen: openPicker,
  };

  let trigger: ReactNode;
  if (variant === 'button') {
    trigger = (
      <UploadButton
        {...triggerProps}
        buttonFullWidth={buttonFullWidth}
        buttonLabel={resolvedButtonLabel}
        buttonVariant={buttonVariant}
        label={label}
        prefixIcon={prefixIcon}
      />
    );
  } else if (variant === 'inline') {
    trigger = (
      <UploadInline
        {...triggerProps}
        currentCount={currentCount}
        label={label}
        prefixIcon={prefixIcon}
        trailing={trailing}
        onKeyDown={handleKeyDown}
      />
    );
  } else {
    trigger = (
      <UploadDropArea
        {...triggerProps}
        accept={accept}
        buttonLabel={resolvedButtonLabel}
        description={description}
        heroIcon={heroIcon}
        maxSize={maxSize}
        title={title}
        onKeyDown={handleKeyDown}
      />
    );
  }

  return (
    <div ref={ref} className={className}>
      {trigger}
      <input
        ref={inputRef}
        accept={accept}
        disabled={disabled}
        hidden
        id={inputId}
        multiple={allowMultiple}
        name={name}
        type="file"
        onChange={handleInputChange}
      />
      {error ? (
        <p className={UPLOAD_ERROR_CLASSES} id={errorId}>
          <SystemIcon aria-hidden className="mt-0.5" name="circle-exclamation-outline" size={12} />
          <span>{error}</span>
        </p>
      ) : null}
    </div>
  );
}

export default Upload;
