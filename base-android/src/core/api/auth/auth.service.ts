import type { AuthUser } from '@/shell/store/slices/auth';

import { apiClient } from '../client';
import { purgeSession, setAccessToken, setRefreshToken } from '../session';
import { unwrapData } from '../unwrap';
import { AUTH_ENDPOINTS } from './auth.api';
import type {
  ForgotPasswordPayload,
  LoginPayload,
  LoginResponse,
  NormalizedSession,
  RegisterPayload,
  ResetPasswordPayload,
} from './auth.types';

/**
 * Tầng gọi API xác thực.
 *
 * Đây là nơi DUY NHẤT biết backend đặt tên trường ra sao. Mọi thứ phía trên chỉ
 * thấy `NormalizedSession`, nên khi backend đổi từ `access_token` sang
 * `accessToken` (đã xảy ra) thì chỉ file này phải sửa.
 */

/** Gom hai cách đặt tên về một dạng. */
function normalize(response: LoginResponse): NormalizedSession {
  return {
    accessToken: response.accessToken ?? response.access_token ?? '',
    refreshToken: response.refreshToken ?? response.refresh_token ?? null,
    user: response.user ?? null,
  };
}

/**
 * Ghi phiên vào đúng chỗ của nó: access token vào bộ nhớ, refresh token vào kho
 * khoá hệ điều hành.
 *
 * ⛔ `await` lượt ghi refresh token, đừng bắn rồi bỏ đó. Nếu kho khoá từ chối
 * (Keystore hỏng sau khi người dùng đổi khoá màn hình) thì phải biết NGAY, chứ
 * không phải phát hiện ở lần mở app sau khi người dùng đã bị đăng xuất.
 */
async function persistSession(session: NormalizedSession): Promise<void> {
  if (session.refreshToken) {
    const saved = await setRefreshToken(session.refreshToken);
    if (!saved && __DEV__) {
      console.warn(
        '[auth] Không ghi được refresh token vào kho khoá. Phiên vẫn dùng được tới khi ' +
          'đóng app, nhưng lần mở sau người dùng sẽ phải đăng nhập lại.',
      );
    }
  }
  setAccessToken(session.accessToken);
}

export const authService = {
  async login(payload: LoginPayload): Promise<NormalizedSession> {
    const response = await apiClient.post<LoginResponse>(AUTH_ENDPOINTS.LOGIN, payload, {
      /**
       * ⛔ BẮT BUỘC. Sai mật khẩu trả về 401; không có cờ này thì interceptor
       * tưởng phiên hết hạn và đi làm mới token — trong khi chưa hề có phiên
       * nào. Kết quả: một lượt gọi refresh vô nghĩa ở MỖI lần gõ sai mật khẩu,
       * và với backend có đếm số lần dùng refresh token thì đó là tín hiệu bất
       * thường.
       */
      skipAuthRefresh: true,
      /** Sai mật khẩu là chuyện thường — màn đăng nhập tự hiện lỗi dưới ô nhập. */
      skipErrorToast: true,
    });

    const session = normalize(unwrapData<LoginResponse>(response));
    await persistSession(session);
    return session;
  },

  async register(payload: RegisterPayload): Promise<NormalizedSession | null> {
    const response = await apiClient.post<LoginResponse>(AUTH_ENDPOINTS.REGISTER, payload, {
      skipAuthRefresh: true,
      skipErrorToast: true,
    });

    const session = normalize(unwrapData<LoginResponse>(response));
    // Nhiều backend bắt xác thực e-mail trước, nên đăng ký xong CHƯA có token.
    // Đó không phải lỗi — trả `null` để màn hình biết mà chuyển sang bước sau.
    if (!session.accessToken) return null;

    await persistSession(session);
    return session;
  },

  /**
   * Đăng xuất.
   *
   * ⛔ Dọn phiên phía client DÙ lời gọi tới máy chủ có hỏng hay không.
   *
   * Người dùng bấm "Đăng xuất" là họ muốn thoát — thường vì đang đưa máy cho
   * người khác. Nếu ta để lỗi mạng chặn việc đó lại thì họ đưa máy đi trong khi
   * phiên vẫn còn. Token phía máy chủ sẽ tự hết hạn; rủi ro đó nhỏ hơn nhiều so
   * với việc phiên còn sống trên một cái máy đã sang tay.
   */
  async logout(): Promise<void> {
    try {
      await apiClient.post(AUTH_ENDPOINTS.LOGOUT, undefined, {
        skipErrorToast: true,
        skipAuthRefresh: true,
      });
    } catch {
      // Cố ý nuốt — xem chú thích trên.
    } finally {
      await purgeSession();
    }
  },

  /** Hồ sơ người dùng hiện tại. Dùng để dựng lại phiên sau khi refresh. */
  async me(): Promise<AuthUser> {
    const response = await apiClient.get<AuthUser>(AUTH_ENDPOINTS.ME);
    return unwrapData<AuthUser>(response);
  },

  async forgotPassword(payload: ForgotPasswordPayload): Promise<void> {
    await apiClient.post(AUTH_ENDPOINTS.FORGOT_PASSWORD, payload, { skipAuthRefresh: true });
  },

  async resetPassword(payload: ResetPasswordPayload): Promise<void> {
    await apiClient.post(AUTH_ENDPOINTS.RESET_PASSWORD, payload, { skipAuthRefresh: true });
  },
};
