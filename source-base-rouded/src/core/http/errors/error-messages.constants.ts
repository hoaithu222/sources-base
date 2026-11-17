/**
 * Mọi câu lỗi tiếng Việt của tầng HTTP — sửa câu nào cũng sửa ở đây.
 *
 * Thêm mã lỗi nghiệp vụ của dự án vào `ERROR_CODE_MESSAGES`.
 */

/** Câu khi lỗi không mang câu nào đọc được (lỗi lạ, mã chưa ánh xạ, lỗi không phải `AppError`). */
export const FALLBACK_ERROR_MESSAGE = 'Đã xảy ra lỗi';

export const CANCELED_MESSAGE = 'Yêu cầu đã bị huỷ';

export const TIMEOUT_MESSAGE = 'Máy chủ phản hồi quá lâu. Vui lòng thử lại.';

export const NETWORK_ERROR_MESSAGE = 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra mạng.';

/** Phản hồi sai hình dạng đã thống nhất (`readData`). */
export const CONTRACT_MESSAGE = 'Máy chủ trả dữ liệu không đúng định dạng. Vui lòng thử lại sau.';

/** Mã lỗi của BE → câu hiển thị. */
export const ERROR_CODE_MESSAGES: Record<string, string> = {
  AUTH_001: 'Email hoặc mật khẩu không đúng',
  AUTH_002: 'Token không hợp lệ',
  AUTH_003: 'Phiên đăng nhập đã hết hạn',
  AUTH_004: 'Token đã bị thu hồi',
  AUTH_005: 'Bạn không có quyền truy cập',

  USER_001: 'Không tìm thấy người dùng',
  USER_002: 'Email đã được sử dụng',
  USER_003: 'Mật khẩu cũ không đúng',

  VAL_001: 'Dữ liệu đầu vào không hợp lệ',
  RES_001: 'Không tìm thấy tài nguyên',
  RES_002: 'Tài nguyên đã tồn tại',
  RATE_001: 'Quá nhiều yêu cầu, vui lòng thử lại sau',

  SYS_500: 'Lỗi hệ thống, vui lòng thử lại',
  SYS_502: 'Dịch vụ tạm thời không khả dụng',
};

/** HTTP status → câu hiển thị; chỉ dùng khi BE không trả câu nào. */
export const HTTP_STATUS_MESSAGES: Record<number, string> = {
  400: 'Yêu cầu không hợp lệ',
  401: 'Bạn cần đăng nhập để tiếp tục',
  403: 'Bạn không có quyền truy cập',
  404: 'Không tìm thấy tài nguyên',
  408: TIMEOUT_MESSAGE,
  415: 'Định dạng file không được hỗ trợ. Vui lòng kiểm tra lại file upload.',
  429: 'Quá nhiều yêu cầu',
  500: 'Lỗi máy chủ nội bộ',
  502: 'Dịch vụ không khả dụng',
  503: 'Đang bảo trì',
};
