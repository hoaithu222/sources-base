import type { DragEvent, ReactNode } from 'react';
import type { FieldSize } from '@/shared/ui/inputs/field.theme';

export type UploadFileStatus = 'pending' | 'uploading' | 'paused' | 'success' | 'error';

export interface UploadFile {
  id: string;
  file?: File;
  name: string;
  size: number;
  type: string;
  status: UploadFileStatus;
  /** 0–100, chỉ có nghĩa khi uploading / paused. */
  progress: number;
  url?: string;
  /** Object URL cục bộ để xem trước; tự thu hồi khi xoá tệp, đừng tự revoke. */
  previewUrl?: string;
  error?: string;
  meta?: Record<string, unknown>;
}

/** `inline` trông như ô nhập; hành động (quét, tải lên) dùng `button`, đừng dùng `inline`. */
export type UploadVariant = 'dropzone' | 'inline' | 'button';

/** Cỡ của `<Upload>`: `inline` cao bằng ô nhập (`FIELD_HEIGHT`), `dropzone` đổi padding + icon. */
export type UploadSize = FieldSize;

export type UploadDropAreaState = 'idle' | 'dragOver' | 'error' | 'disabled';
export type UploadInlineState = 'idle' | 'filled' | 'dragOver' | 'error' | 'disabled';
export type FileCardDensity = 'cozy' | 'compact';
export type FileCardVariant = 'detailed' | 'simple';
export type FileCardActionTone = 'neutral' | 'danger' | 'primary';
export type FileBadgeSkin = 'red' | 'blue' | 'green' | 'orange' | 'purple' | 'sky' | 'neutral';
export type FileBadgeSize = 'sm' | 'md' | 'lg';

/** Tải 1 tệp, trả URL khi xong. `onProgress(0–100)` cập nhật tiến độ; `signal` để huỷ. */
export type UploadHandler = (
  file: File,
  helpers: {
    onProgress: (percent: number) => void;
    signal: AbortSignal;
  },
) => Promise<string>;

export interface ValidationError {
  code: 'file-too-large' | 'file-invalid-type' | 'too-many-files' | 'duplicate';
  message: string;
}

export interface FileTypeStyle {
  iconName: string;
  /** Nhãn trên badge (PDF, DOCX, …), tối đa 4 ký tự. */
  label: string;
  skin: FileBadgeSkin;
}

export interface UploadIconSlots {
  hero?: ReactNode;
  inlinePrefix?: ReactNode;
}

export interface UploadTriggerProps {
  'aria-describedby'?: string;
  'aria-label'?: string;
  'aria-labelledby'?: string;
  disabled?: boolean;
  /** Đang có tệp kéo qua trigger (từ `useUploadPicker`). */
  dragOver: boolean;
  /** Tô đỏ trigger: Upload có `error` hoặc `invalid`. */
  hasError: boolean;
  size: UploadSize;
  onDragLeave: (e: DragEvent<HTMLElement>) => void;
  onDragOver: (e: DragEvent<HTMLElement>) => void;
  onDrop: (e: DragEvent<HTMLElement>) => void;
  onOpen: () => void;
}
