import { formatFileSize } from '@/shared/utils/format/file-size.utils';

/**
 * file.utils — kiểm tệp người dùng chọn / thả TRƯỚC khi đưa vào hàng đợi tải lên: dung lượng, định dạng.
 *
 * Dùng:   const err = validateFile(file, { accept: '.pdf,image/*', maxSize: 10 * 1024 * 1024 });
 *         if (err) showToast('error', err.message);   // `err.code` để rẽ nhánh, `message` hiện thẳng
 * Lưu ý:  UI kit (`useUpload`, `useUploadPicker`) đã gọi sẵn — chỉ gọi tay khi tự dựng luồng chọn tệp riêng.
 */

/** Đuôi tệp viết thường, không dấu chấm: `'bao-cao.PDF'` → `'pdf'`; không có đuôi (`'README'`, `'a.'`) → `''`. */
export function getExtension(name: string): string {
  const idx = name.lastIndexOf('.');
  if (idx < 0 || idx === name.length - 1) return '';
  return name.slice(idx + 1).toLowerCase();
}

/**
 * Tệp có khớp chuỗi `accept` của `<input type="file">` không: đuôi (`.pdf`), MIME đầy đủ
 * (`application/pdf`) hoặc MIME có sao (`image/*`). `accept` rỗng ⇒ nhận mọi tệp.
 */
export function matchesAccept(file: File, accept?: string): boolean {
  if (!accept) return true;
  const patterns = accept
    .split(',')
    .map((p) => p.trim().toLowerCase())
    .filter(Boolean);
  if (patterns.length === 0) return true;

  const fileName = file.name.toLowerCase();
  const fileType = (file.type || '').toLowerCase();

  return patterns.some((pattern) => {
    if (pattern.startsWith('.')) return fileName.endsWith(pattern);
    if (pattern.endsWith('/*')) return fileType.startsWith(pattern.slice(0, -1));
    return fileType === pattern;
  });
}

export interface ValidateFileOptions {
  /** Chuỗi `accept` của `<input type="file">` — xem `matchesAccept`. */
  accept?: string;
  /** Tối đa mỗi tệp, tính bằng byte. */
  maxSize?: number;
}

export interface FileValidationError {
  code: 'file-too-large' | 'file-invalid-type';
  message: string;
}

/** Kiểm dung lượng rồi định dạng; trả lỗi ĐẦU TIÊN gặp, hoặc `null` nếu hợp lệ. */
export function validateFile(file: File, options: ValidateFileOptions): FileValidationError | null {
  const { accept, maxSize } = options;
  if (maxSize && file.size > maxSize) {
    return { code: 'file-too-large', message: `Tệp vượt quá ${formatFileSize(maxSize)}` };
  }
  if (accept && !matchesAccept(file, accept)) {
    return { code: 'file-invalid-type', message: 'Định dạng tệp không được hỗ trợ' };
  }
  return null;
}
