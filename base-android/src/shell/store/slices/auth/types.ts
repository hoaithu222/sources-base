/**
 * Kiểu dữ liệu phiên đăng nhập — JWT, ĐƠN TENANT.
 *
 * Cố ý KHÔNG có organization / project / department: base này chạy RBAC phẳng.
 * Dự án nào cần nhiều tổ chức thì thêm ở tầng feature, đừng nhét ngược vào đây —
 * mọi màn hình sẽ phải biết về một khái niệm mà đa số chúng không dùng.
 */

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  avatar?: string | null;
  /** Vai trò — dùng cho gate thô. Vd `['admin']`. */
  roles: string[];
  /**
   * Quyền chi tiết, mã hoá dạng `"resource:action"` (vd `"user:create"`).
   * Dùng chuỗi thay vì object để so khớp bằng `includes` và dễ serialize.
   */
  permissions: string[];
}

/**
 * Trạng thái phiên — phân biệt "chưa biết" với "chắc chắn chưa đăng nhập".
 *
 * Gộp hai thứ này làm một boolean là bug kinh điển của app di động: ở khung hình
 * đầu chưa ai biết có phiên hay không (`AsyncStorage` còn đang đọc), mà boolean
 * thì bắt buộc phải là `false` — nên guard đá người dùng ra màn đăng nhập rồi
 * một nhịp sau mới kéo về. Người dùng thấy màn đăng nhập nhấp nháy mỗi lần mở app.
 */
export type AuthStatus =
  /** Chưa thử khôi phục phiên lần nào (khung hình đầu sau khi mở app). */
  | 'idle'
  /** Đang gọi refresh để khôi phục phiên. */
  | 'restoring'
  /** Có token hợp lệ. */
  | 'authenticated'
  /** Đã thử và xác nhận không có phiên. */
  | 'anonymous';

export interface AuthState {
  user: AuthUser | null;

  /**
   * Access token — CHỈ NẰM TRONG BỘ NHỚ, cố ý KHÔNG persist.
   *
   * Tắt app là mất, và được dựng lại bằng một lượt refresh lúc khởi động
   * (refresh token lấy từ kho khoá hệ điều hành — xem `core/api/session.ts`).
   * Đó là điểm mấu chốt: kẻ đọc được `AsyncStorage` cũng không có gì để dùng.
   */
  token: string | null;

  status: AuthStatus;

  /**
   * `AsyncStorage` đã nạp xong chưa.
   *
   * ⛔ Điều hướng KHÔNG được quyết định trước khi cờ này bật — xem chú thích
   * "BẤT ĐỒNG BỘ" ở `core/storage/app-storage.ts`.
   */
  hasHydrated: boolean;
}

export interface AuthActions {
  /** Ghi phần nào truyền vào; phần không truyền GIỮ NGUYÊN. */
  setAuth: (payload: { user?: AuthUser | null; token?: string | null }) => void;
  setStatus: (status: AuthStatus) => void;
  setHasHydrated: (value: boolean) => void;
  /** Xoá phiên trong bộ nhớ. ⛔ KHÔNG xoá refresh token — xem `session.purgeSession()`. */
  clearAuth: () => void;
  /** Có token và token chưa hết hạn (đọc `exp` trong JWT). */
  isAuthenticated: () => boolean;
  /** Khớp `"resource:action"`. Người có vai trò `admin` luôn trả `true`. */
  hasPermission: (resource: string, action: string) => boolean;
  hasRole: (role: string) => boolean;
}

export type AuthStore = AuthState & AuthActions;
