import viErrors from '@/messages/vi/errors.json';

/**
 * Mọi câu lỗi của tầng HTTP — nguồn là `src/messages/<locale>/errors.json` (khoá `http`), sửa câu nào cũng sửa ở đó.
 *
 *   errorMessages().timeout            câu theo ngôn ngữ đang hiển thị
 *   configureErrorMessages(messages)   `LocaleSync` gọi khi ngôn ngữ đổi (xem `app/_providers`)
 *
 * Lưu ý: mặc định là tiếng Việt (ngôn ngữ nguồn) để test và code chạy trước khi provider đăng ký bản dịch vẫn
 *        có câu đọc được. Thêm mã lỗi nghiệp vụ của dự án vào `errors.http.codes` ở MỌI ngôn ngữ.
 */

export type ErrorMessages = typeof viErrors.http;

let current: ErrorMessages = viErrors.http;

export function configureErrorMessages(messages: ErrorMessages): void {
  current = messages;
}

export function errorMessages(): ErrorMessages {
  return current;
}

/** Câu theo mã lỗi của BE; `undefined` khi mã chưa ánh xạ. Mã là đầu vào ngoài nên chỉ khớp khoá RIÊNG (`constructor` không tra ra hàm của Object.prototype). */
export function messageOfCode(code: string): string | undefined {
  const codes = current.codes as Record<string, string>;
  return Object.hasOwn(codes, code) ? codes[code] : undefined;
}

/** Câu theo HTTP status; chỉ dùng khi BE không trả câu nào. */
export function messageOfStatus(status: number): string | undefined {
  return (current.status as Record<string, string>)[String(status)];
}
