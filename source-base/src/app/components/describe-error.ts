/**
 * describe-error — biến giá trị bị ném (kể cả `null`) thành câu chữ cho người dùng, và ghi bản kỹ
 * thuật ra console với một tiền tố chung.
 *
 * Dùng:   <ErrorScreen error={describeError(error)} /> · logAppError('Trang không hiển thị được:', error)
 * Lưu ý:  lỗi HTTP do React Router trả (`isRouteErrorResponse`) do `RouteErrorScreen` tự mô tả — file này
 *         không phụ thuộc router.
 */

export interface ErrorDescription {
  /** `chunk`: không tải được mã của trang. `response`: router trả lỗi HTTP. */
  kind: 'chunk' | 'response' | 'unexpected';
  title: string;
  description: string;
}

/** Tiền tố của mọi log lỗi giao diện — lọc console bằng chuỗi này. */
export const APP_ERROR_LOG_PREFIX = '[giao diện]';

/** Thông điệp khi `import()` một chunk thất bại (Chrome · Firefox · Safari; Vite: CSS đi kèm chunk). */
const CHUNK_ERROR_PATTERNS = [
  'Failed to fetch dynamically imported module',
  'error loading dynamically imported module',
  'Importing a module script failed',
  'Failed to load module script',
  'Unable to preload CSS',
  'Loading chunk',
  'Loading CSS chunk',
  'MIME type',
];

export function isChunkLoadError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  return CHUNK_ERROR_PATTERNS.some((pattern) => error.message.includes(pattern));
}

/**
 * Câu chữ hiện cho người dùng khi một phần của app hỏng.
 * @param showDetail Hiện thông điệp kỹ thuật gốc; mặc định chỉ ở dev.
 */
export function describeError(
  error: unknown,
  showDetail: boolean = import.meta.env.DEV,
): ErrorDescription {
  if (isChunkLoadError(error)) {
    return {
      kind: 'chunk',
      title: 'Không tải được trang',
      description:
        'Có thể kết nối mạng bị gián đoạn, hoặc ứng dụng vừa được cập nhật. Hãy kiểm tra kết nối rồi tải lại trang.',
    };
  }

  const detail = error instanceof Error ? error.message : '';
  return {
    kind: 'unexpected',
    title: 'Có lỗi xảy ra',
    description:
      showDetail && detail
        ? detail
        : 'Trang gặp sự cố ngoài dự kiến. Hãy tải lại trang; nếu vẫn lỗi, vui lòng báo cho quản trị viên.',
  };
}

/** Ghi lỗi ra console: `[giao diện] <message>` rồi tới chi tiết (lỗi gốc, component stack…). */
export function logAppError(message: string, ...details: unknown[]): void {
  console.error(`${APP_ERROR_LOG_PREFIX} ${message}`, ...details);
}
