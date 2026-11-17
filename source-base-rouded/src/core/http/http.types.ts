/** Hợp đồng dữ liệu của tầng HTTP — nơi duy nhất khai `ApiResponse`. */

/** Khối lỗi có cấu trúc của BE: `{ error: { code, message, details } }`. */
interface ApiErrorPayload {
  code: string;
  message: string;
  details?: unknown;
}

/** Vỏ bọc phản hồi thành công. Hàm API bóc `data` bằng `readData()`, không trả thẳng vỏ này. */
export interface ApiResponse<T = unknown> {
  data: T;
  /** Quy ước kiểu Node/Nest. */
  success?: boolean;
  /** Quy ước kiểu .NET gateway. */
  status?: boolean;
  message?: string;
  error?: ApiErrorPayload;
  timestamp?: string;
  requestId?: string;
}
