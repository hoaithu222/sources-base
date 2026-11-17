import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { validateFile } from '@/shared/utils/validation/file.utils';
import { generateFileId, isImageFile } from '../utils/upload.utils';
import type { UploadFile, UploadHandler, ValidationError } from '../upload.types';

export interface UseUploadOptions {
  /** Tệp có sẵn để hiển thị (vd đã tải lần trước). */
  initialFiles?: UploadFile[];
  /** Mặc định `true`. `false` → chỉ giữ MỘT tệp: thêm tệp mới thay (và huỷ) tệp cũ; tệp thừa bị bỏ. */
  multiple?: boolean;
  accept?: string;
  maxSize?: number;
  maxFiles?: number;
  /** Handler tải thật; bỏ trống = chế độ thuần state. */
  onUpload?: UploadHandler;
  /** Tự tải ngay khi thêm tệp; mặc định `true` nếu có `onUpload`. */
  autoUpload?: boolean;
  /** Gọi khi một tệp kết thúc vòng đời (success hoặc error). */
  onFileSettled?: (file: UploadFile) => void;
  /** Gọi khi tệp bị loại ở bước validate. */
  onReject?: (rejections: { file: File; error: ValidationError }[]) => void;
}

export interface UseUploadReturn {
  files: UploadFile[];
  /** Validate rồi đẩy vào danh sách, tự tải nếu `autoUpload`; trả các entry vừa nhận. */
  addFiles: (files: File[]) => UploadFile[];
  /** Xoá theo id; huỷ luôn nếu đang tải. */
  removeFile: (id: string) => void;
  /** Huỷ tải đang chạy; entry giữ status "paused". */
  cancelFile: (id: string) => void;
  /** Tải (lại) tệp lỗi / paused / pending; bỏ qua khi tệp đang tải. */
  retryFile: (id: string) => void;
  /** Gộp patch vào entry — dùng khi caller tự tải. */
  updateFile: (id: string, patch: Partial<UploadFile>) => void;
  clear: () => void;
  /** `true` khi có ít nhất một tệp đang uploading. */
  isUploading: boolean;
}

/**
 * useUpload — state danh sách tệp + vòng đời tải lên (tiến độ, huỷ, thử lại, xem trước ảnh) cho `Upload` / `FileList`.
 *
 * Không truyền `onUpload` → chế độ thuần state, caller tự tải rồi gọi `updateFile`. Tải toàn app (chạy nền,
 * qua nhiều màn) → `useUploadQueue` của widget progress-center. Không phụ thuộc React Query — caller tự bọc
 * `onUpload` bằng `useMutation` nếu muốn.
 * Lưu ý: `cancelFile` đặt entry "paused" NGAY, kể cả khi handler lờ `signal` (kết quả muộn bị bỏ); `retryFile`
 * chạy lại từ đầu và bỏ qua tệp đang tải. `multiple=false`: tệp mới THAY tệp cũ — lượt tải cũ bị huỷ, kết quả
 * muộn của nó không gọi `onFileSettled`. `previewUrl` (object URL) tạo cho ảnh, tự thu hồi khi xoá / thay / clear /
 * unmount — caller không tự revoke. Lý do thiết kế: notes/components/media-upload.md.
 *
 * @param options - Cấu hình (`UseUploadOptions`): `initialFiles` · `multiple` · `accept` · `maxSize` · `maxFiles` ·
 *   `onUpload` · `autoUpload` · `onFileSettled` · `onReject`. Mặc định `{}`.
 * @returns `UseUploadReturn`: `files` · `addFiles` · `removeFile` · `cancelFile` · `retryFile` · `updateFile` ·
 *   `clear` · `isUploading`.
 *
 * @example
 * const { files, addFiles, removeFile, cancelFile, retryFile } = useUpload({ onUpload: uploadToServer, maxFiles: 5 });
 *
 * <Upload multiple onFiles={addFiles} />
 * <FileList files={files} onRemove={(f) => removeFile(f.id)} onCancel={(f) => cancelFile(f.id)}
 *   onRetry={(f) => retryFile(f.id)} />
 */
export function useUpload(options: UseUploadOptions = {}): UseUploadReturn {
  const {
    initialFiles = [],
    multiple = true,
    accept,
    maxSize,
    maxFiles,
    onUpload,
    autoUpload = !!onUpload,
    onFileSettled,
    onReject,
  } = options;

  const [files, setFiles] = useState<UploadFile[]>(initialFiles);
  const abortMapRef = useRef(new Map<string, AbortController>());
  const previewMapRef = useRef(new Map<string, string>());
  const filesRef = useRef(files);
  const onUploadRef = useRef(onUpload);
  const onFileSettledRef = useRef(onFileSettled);
  useLayoutEffect(() => {
    filesRef.current = files;
    onUploadRef.current = onUpload;
    onFileSettledRef.current = onFileSettled;
  });

  useEffect(() => {
    const map = previewMapRef.current;
    const aborts = abortMapRef.current;
    return () => {
      map.forEach((url) => URL.revokeObjectURL(url));
      map.clear();
      aborts.forEach((c) => c.abort());
      aborts.clear();
    };
  }, []);

  const patchFile = useCallback((id: string, patch: Partial<UploadFile>) => {
    setFiles((prev) => prev.map((f) => (f.id === id ? { ...f, ...patch } : f)));
  }, []);

  const cleanupEntry = useCallback((id: string) => {
    const url = previewMapRef.current.get(id);
    if (url) {
      URL.revokeObjectURL(url);
      previewMapRef.current.delete(id);
    }
    abortMapRef.current.get(id)?.abort();
    abortMapRef.current.delete(id);
  }, []);

  const cleanupAll = useCallback(() => {
    const ids = new Set([...previewMapRef.current.keys(), ...abortMapRef.current.keys()]);
    ids.forEach(cleanupEntry);
  }, [cleanupEntry]);

  const runUpload = useCallback(
    async (entry: UploadFile) => {
      const handler = onUploadRef.current;
      if (!handler || !entry.file) return;

      const controller = new AbortController();
      abortMapRef.current.set(entry.id, controller);
      const isCurrent = () => abortMapRef.current.get(entry.id) === controller;
      patchFile(entry.id, { status: 'uploading', progress: 0, error: undefined });

      try {
        const url = await handler(entry.file, {
          onProgress: (pct) => {
            if (isCurrent()) patchFile(entry.id, { progress: pct });
          },
          signal: controller.signal,
        });
        if (!isCurrent()) return;
        const next: Partial<UploadFile> = {
          status: 'success',
          progress: 100,
          url,
        };
        patchFile(entry.id, next);
        onFileSettledRef.current?.({ ...entry, ...next });
      } catch (err: unknown) {
        if (!isCurrent()) return;
        const message = err instanceof Error ? err.message : 'Tải lên thất bại';
        const next: Partial<UploadFile> = { status: 'error', error: message };
        patchFile(entry.id, next);
        onFileSettledRef.current?.({ ...entry, ...next });
      } finally {
        if (isCurrent()) abortMapRef.current.delete(entry.id);
      }
    },
    [patchFile],
  );

  const addFiles = useCallback(
    (incoming: File[]) => {
      if (incoming.length === 0) return [];
      const rejections: { file: File; error: ValidationError }[] = [];
      const accepted: UploadFile[] = [];

      const kept = multiple ? filesRef.current.length : 0;
      const remaining =
        maxFiles !== undefined ? Math.max(0, maxFiles - kept) : Number.POSITIVE_INFINITY;

      incoming.forEach((file, i) => {
        if (i >= remaining) {
          rejections.push({
            file,
            error: {
              code: 'too-many-files',
              message: `Vượt quá số lượng tối đa (${maxFiles})`,
            },
          });
          return;
        }
        const err = validateFile(file, { accept, maxSize });
        if (err) {
          rejections.push({ file, error: err });
          return;
        }
        if (!multiple && accepted.length > 0) return;
        const id = generateFileId();
        let previewUrl: string | undefined;
        if (isImageFile(file)) {
          previewUrl = URL.createObjectURL(file);
          previewMapRef.current.set(id, previewUrl);
        }
        accepted.push({
          id,
          file,
          name: file.name,
          size: file.size,
          type: file.type,
          status: autoUpload ? 'uploading' : 'pending',
          progress: 0,
          previewUrl,
        });
      });

      if (rejections.length > 0) onReject?.(rejections);
      if (accepted.length === 0) return [];

      if (!multiple) {
        const keep = new Set(accepted.map((entry) => entry.id));
        [...previewMapRef.current.keys(), ...abortMapRef.current.keys()]
          .filter((id) => !keep.has(id))
          .forEach(cleanupEntry);
      }
      setFiles((prev) => (multiple ? [...prev, ...accepted] : accepted));

      if (autoUpload) {
        accepted.forEach((entry) => {
          void runUpload(entry);
        });
      }
      return accepted;
    },
    [accept, autoUpload, cleanupEntry, maxFiles, maxSize, multiple, onReject, runUpload],
  );

  const removeFile = useCallback(
    (id: string) => {
      cleanupEntry(id);
      setFiles((prev) => prev.filter((f) => f.id !== id));
    },
    [cleanupEntry],
  );

  const cancelFile = useCallback(
    (id: string) => {
      const controller = abortMapRef.current.get(id);
      if (!controller) return;
      abortMapRef.current.delete(id);
      controller.abort();
      patchFile(id, { status: 'paused' });
    },
    [patchFile],
  );

  const retryFile = useCallback(
    (id: string) => {
      const entry = filesRef.current.find((f) => f.id === id);
      if (!entry || abortMapRef.current.has(id)) return;
      void runUpload(entry);
    },
    [runUpload],
  );

  const updateFile = useCallback(
    (id: string, patch: Partial<UploadFile>) => patchFile(id, patch),
    [patchFile],
  );

  const clear = useCallback(() => {
    cleanupAll();
    setFiles([]);
  }, [cleanupAll]);

  const isUploading = useMemo(() => files.some((f) => f.status === 'uploading'), [files]);

  return {
    files,
    addFiles,
    removeFile,
    cancelFile,
    retryFile,
    updateFile,
    clear,
    isUploading,
  };
}
