/**
 * Mã lỗi backend → câu tiếng Việt.
 *
 * Dùng CHUNG bảng mã với base web `base-projects` để hai nền tảng nói cùng một
 * thứ tiếng khi cùng một lỗi xảy ra — người dùng gọi hỗ trợ mà đọc hai câu khác
 * nhau cho cùng một sự cố là chuyện đã gặp.
 *
 * ⛔ Chỉ ánh xạ mã KHÔNG phụ thuộc nghiệp vụ. Mã riêng của từng dự án thì để ở
 * feature tương ứng — nhét hết vào đây thì base gánh từ vựng của mọi dự án.
 */
export const ERROR_CODE_MESSAGES: Record<string, string> = {
  // ── Xác thực ──────────────────────────────────────────────────────────────
  AUTH_001: 'Email hoặc mật khẩu không đúng',
  AUTH_002: 'Token không hợp lệ',
  AUTH_003: 'Phiên đăng nhập đã hết hạn',
  AUTH_004: 'Token đã bị thu hồi',
  AUTH_005: 'Bạn không có quyền truy cập',

  // ── Người dùng ───────────────────────────────────────────────────────────
  USER_001: 'Không tìm thấy người dùng',
  USER_002: 'Email đã được sử dụng',
  USER_003: 'Mật khẩu cũ không đúng',

  // ── Dữ liệu / tài nguyên ─────────────────────────────────────────────────
  VAL_001: 'Dữ liệu đầu vào không hợp lệ',
  RES_001: 'Không tìm thấy tài nguyên',
  RES_002: 'Tài nguyên đã tồn tại',
  RATE_001: 'Quá nhiều yêu cầu, vui lòng thử lại sau',

  // ── Hệ thống ─────────────────────────────────────────────────────────────
  SYS_500: 'Lỗi hệ thống, vui lòng thử lại',
  SYS_502: 'Dịch vụ tạm thời không khả dụng',
};

/**
 * Mã HTTP → câu tiếng Việt.
 *
 * Đây là ĐƯỜNG LUI CUỐI CÙNG, chỉ dùng khi backend không trả câu nào. Câu do
 * backend trả luôn được ưu tiên vì nó biết ngữ cảnh: "Mã hợp đồng đã tồn tại"
 * hữu ích hơn hẳn "Yêu cầu không hợp lệ".
 */
export const HTTP_STATUS_MESSAGES: Record<number, string> = {
  400: 'Yêu cầu không hợp lệ',
  401: 'Bạn cần đăng nhập để tiếp tục',
  403: 'Bạn không có quyền truy cập',
  404: 'Không tìm thấy tài nguyên',
  408: 'Yêu cầu quá thời gian chờ',
  409: 'Dữ liệu đã bị thay đổi bởi người khác',
  413: 'Tệp tải lên quá lớn',
  415: 'Định dạng tệp không được hỗ trợ',
  422: 'Dữ liệu không hợp lệ',
  429: 'Quá nhiều yêu cầu',
  500: 'Lỗi máy chủ nội bộ',
  502: 'Dịch vụ không khả dụng',
  503: 'Hệ thống đang bảo trì',
  504: 'Máy chủ phản hồi quá chậm',
};

/**
 * Câu cho lỗi MẠNG — không có mã HTTP nào cả.
 *
 * Trên di động đây là lỗi hay gặp nhất, hơn hẳn mọi mã 4xx/5xx cộng lại: thang
 * máy, hầm gửi xe, công trường, tàu điện. Câu chữ phải nói rõ là lỗi KẾT NỐI
 * chứ không phải app hỏng, và gợi ý đúng việc người dùng làm được.
 */
export const NETWORK_ERROR_MESSAGE = 'Không có kết nối mạng. Kiểm tra Wi-Fi hoặc dữ liệu di động.';

/** Khi request bị cắt vì quá `apiTimeout`. */
export const TIMEOUT_ERROR_MESSAGE = 'Máy chủ phản hồi quá lâu. Vui lòng thử lại.';

/** Khi không moi được thông tin gì từ lỗi. */
export const UNKNOWN_ERROR_MESSAGE = 'Đã xảy ra lỗi không xác định';
