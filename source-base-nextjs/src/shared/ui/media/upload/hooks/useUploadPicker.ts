'use client';

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
  type KeyboardEvent,
} from 'react';
import { useTranslations } from 'next-intl';
import { validateFile } from '@/shared/utils/validation/file.utils';
import { readDirectoryDrop, type DropReadResult } from '../utils/drop.utils';
import type { ValidationError } from '../upload.types';
import { useDropQueue } from './useDropQueue';

interface UseUploadPickerOptions {
  accept?: string;
  currentCount: number;
  directory: boolean;
  directoryOnly: boolean;
  disabled?: boolean;
  maxFiles?: number;
  maxSize?: number;
  onDirectories?: (folderPaths: string[]) => void;
  onFiles?: (files: File[]) => void;
  onReject?: (rejections: { file: File; error: ValidationError }[]) => void;
}

/**
 * useUploadPicker — logic chọn tệp của `Upload`: hộp chọn, validate, kéo-thả (cả thư mục).
 *
 * Lưu ý: kéo-thả thư mục đọc BẤT ĐỒNG BỘ; kết quả giao đúng thứ tự thả và bỏ hẳn khi Upload đã unmount
 * (`useDropQueue`), mỗi lần thả dùng đúng các handler của lúc thả. Thông báo từ chối (quá số lượng, tệp lẻ khi
 * `directoryOnly`) theo ngôn ngữ — khoá `ui.media.upload`. Kéo qua phần tử con của trigger không tắt
 * `dragOver` (chỉ tắt khi rời hẳn trigger).
 *
 * @param options.accept - Đuôi / MIME được nhận.
 * @param options.currentCount - Số tệp caller đang giữ (tính `maxFiles`).
 * @param options.directory - Hộp chọn lấy cả thư mục (`webkitdirectory`).
 * @param options.directoryOnly - Kéo-thả chỉ nhận thư mục; tệp lẻ → `onReject`.
 * @param options.disabled - Khoá mở hộp chọn và kéo-thả.
 * @param options.maxFiles - Tổng số tệp tối đa.
 * @param options.maxSize - Dung lượng tối đa mỗi tệp, byte.
 * @param options.onDirectories - Nhận đường dẫn thư mục vừa thả (trước `onFiles`).
 * @param options.onFiles - Nhận tệp hợp lệ.
 * @param options.onReject - Nhận tệp bị loại.
 * @returns `inputRef` gắn vào `<input type="file">` ẩn · `dragOver` · các handler kéo-thả / bàn phím ·
 *   `openPicker`.
 *
 * @example
 * const picker = useUploadPicker({ accept: '.pdf', currentCount: 0, directory: false, directoryOnly: false, onFiles });
 */
export function useUploadPicker({
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
}: UseUploadPickerOptions) {
  const t = useTranslations('ui.media');
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const enqueueDrop = useDropQueue();

  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    if (directory) {
      el.setAttribute('webkitdirectory', '');
      el.setAttribute('directory', '');
    } else {
      el.removeAttribute('webkitdirectory');
      el.removeAttribute('directory');
    }
  }, [directory]);

  const openPicker = useCallback(() => {
    if (disabled) return;
    inputRef.current?.click();
  }, [disabled]);

  const processFiles = useCallback(
    (fileList: FileList | File[] | null) => {
      if (!fileList || fileList.length === 0) return;
      const accepted: File[] = [];
      const rejected: { file: File; error: ValidationError }[] = [];

      const remainingSlots =
        maxFiles !== undefined ? Math.max(0, maxFiles - currentCount) : Number.POSITIVE_INFINITY;

      Array.from(fileList).forEach((file, index) => {
        if (index >= remainingSlots) {
          rejected.push({
            file,
            error: {
              code: 'too-many-files',
              message: t('upload.exceedMax', { max: String(maxFiles) }),
            },
          });
          return;
        }
        const validation = validateFile(file, { accept, maxSize });
        if (validation) {
          rejected.push({ file, error: validation });
        } else {
          accepted.push(file);
        }
      });

      if (accepted.length > 0) onFiles?.(accepted);
      if (rejected.length > 0) onReject?.(rejected);
    },
    [accept, currentCount, maxFiles, maxSize, onFiles, onReject, t],
  );

  const handleInputChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      processFiles(e.target.files);
      e.target.value = '';
    },
    [processFiles],
  );

  const handleDragOver = useCallback(
    (e: DragEvent<HTMLElement>) => {
      if (disabled) return;
      e.preventDefault();
      e.stopPropagation();
      if (!dragOver) setDragOver(true);
    },
    [disabled, dragOver],
  );

  const handleDragLeave = useCallback((e: DragEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.currentTarget.contains(e.relatedTarget as Node | null)) return;
    setDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: DragEvent<HTMLElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setDragOver(false);
      if (disabled) return;

      if (directoryOnly) {
        enqueueDrop(
          readDirectoryDrop(e.dataTransfer),
          ({ files, folderPaths, hasRootFile }: DropReadResult) => {
            if (hasRootFile) {
              const error: ValidationError = {
                code: 'file-invalid-type',
                message: t('upload.directoryOnly'),
              };
              onReject?.([{ file: new File([], ''), error }]);
            }
            if (folderPaths.length > 0) onDirectories?.(folderPaths);
            processFiles(files);
          },
        );
        return;
      }

      processFiles(e.dataTransfer.files);
    },
    [directoryOnly, disabled, enqueueDrop, onDirectories, onReject, processFiles, t],
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      if (e.target !== e.currentTarget) return;
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openPicker();
      }
    },
    [openPicker],
  );

  return {
    dragOver,
    handleDragLeave,
    handleDragOver,
    handleDrop,
    handleInputChange,
    handleKeyDown,
    inputRef,
    openPicker,
  };
}
