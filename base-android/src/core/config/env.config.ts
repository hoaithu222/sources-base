/**
 * Cấu hình ứng dụng đọc từ biến môi trường.
 *
 * ── ⛔ Luật số một: PHẢI viết đủ tên biến ngay tại chỗ đọc ────────────────────
 *
 * Metro không "đọc biến môi trường lúc chạy" — nó THAY CHUỖI vào bundle lúc
 * build. `process.env.EXPO_PUBLIC_API_BASE_URL` bị thay bằng đúng giá trị, còn
 *
 *     const key = 'EXPO_PUBLIC_API_BASE_URL';
 *     process.env[key]                       // ⛔ luôn undefined
 *
 * thì không có gì để thay, và ra `undefined` — im lặng, không lỗi, không cảnh
 * báo. Đây là lý do file này có một khối `RAW` liệt kê từng biến một thay vì
 * một hàm `getStr(key)` gọn gàng như bên web (Vite đọc `import.meta.env` lúc
 * chạy nên bên đó viết hàm được).
 *
 * ⛔ Thêm biến mới thì phải thêm MỘT DÒNG vào `RAW`. Không có đường tắt.
 *
 * ── Luật số hai: KHÔNG có secret ở đây ───────────────────────────────────────
 * Mọi giá trị trong `appConfig` nằm trong file APK/IPA. `unzip` là đọc được.
 * Khoá ký, chuỗi kết nối, `client_secret` → để ở backend, không phải ở đây.
 *
 * ── Luật số ba: đổi `.env` phải xoá cache Metro ──────────────────────────────
 * `npm run start:clear`. Chỉ reload app thì bundle cũ (đã nhúng giá trị cũ) vẫn
 * được dùng lại.
 */

/**
 * Toàn bộ biến môi trường app dùng. Viết cứng từng tên — xem luật số một.
 *
 * `??` chứ không phải `||`: chuỗi rỗng là một giá trị hợp lệ và có ý nghĩa
 * (vd cố ý để trống `API_BASE_URL` lúc dựng giao diện chưa có backend). Dùng
 * `||` thì chuỗi rỗng bị nuốt và rơi về mặc định, che mất ý đồ đó.
 */
const RAW = {
  ENV: process.env.EXPO_PUBLIC_ENV,
  API_BASE_URL: process.env.EXPO_PUBLIC_API_BASE_URL,
  API_TIMEOUT: process.env.EXPO_PUBLIC_API_TIMEOUT,
  ENABLE_ERROR_TOAST: process.env.EXPO_PUBLIC_ENABLE_ERROR_TOAST,
  ENABLE_API_LOGGING: process.env.EXPO_PUBLIC_ENABLE_API_LOGGING,
  API_LOG_PAYLOAD: process.env.EXPO_PUBLIC_API_LOG_PAYLOAD,
  ENABLE_REFRESH_TOKEN: process.env.EXPO_PUBLIC_ENABLE_REFRESH_TOKEN,
  AUTH_ENABLED: process.env.EXPO_PUBLIC_AUTH_ENABLED,
} as const;

const asString = (value: string | undefined, fallback: string): string => value ?? fallback;

const asBoolean = (value: string | undefined, fallback: boolean): boolean => {
  if (value === undefined || value === '') return fallback;
  return value === 'true' || value === '1';
};

const asNumber = (value: string | undefined, fallback: number): number => {
  if (value === undefined || value === '') return fallback;
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? fallback : parsed;
};

const environment = asString(RAW.ENV, 'development');

export const appConfig = {
  /** development | staging | production */
  env: environment,
  isDevelopment: environment === 'development',
  isProduction: environment === 'production',

  /** Gốc API — KHÔNG kèm dấu `/` cuối. */
  apiBaseUrl: asString(RAW.API_BASE_URL, ''),

  /**
   * Thời gian chờ tối đa mỗi request (ms).
   *
   * 30s chứ không phải 10s như thói quen bên web: người dùng di động thường ở
   * mạng 3G/4G chập chờn, và một request bị cắt sớm là mất hẳn dữ liệu vừa
   * nhập — tệ hơn nhiều so với chờ thêm vài giây.
   */
  apiTimeout: asNumber(RAW.API_TIMEOUT, 30_000),

  /** Toast lỗi tập trung ở response interceptor. */
  enableErrorToast: asBoolean(RAW.ENABLE_ERROR_TOAST, true),

  /** In log mạng ra console Metro. */
  enableApiLogging: asBoolean(RAW.ENABLE_API_LOGGING, false),

  /**
   * Kèm body/params vào log mạng.
   * ⛔ Mặc định TẮT — body của lượt đăng nhập chứa mật khẩu thật.
   */
  logApiPayload: asBoolean(RAW.API_LOG_PAYLOAD, false),

  /** Tắt khi BE chưa có endpoint refresh — lúc đó 401 là đăng xuất luôn. */
  enableRefreshToken: asBoolean(RAW.ENABLE_REFRESH_TOKEN, true),

  /**
   * Bật kiểm đăng nhập ở tầng điều hướng.
   *
   * ⛔ MẶC ĐỊNH `false` trong base — mở app là vào thẳng, không cần backend.
   *    Base xuất xưởng KHÔNG kèm máy chủ nào; để mặc định bật thì lần chạy đầu
   *    tiên rơi vào màn đăng nhập và người thử không xem được gì cả.
   *
   * ⛔ DỰ ÁN THẬT PHẢI ĐẶT `EXPO_PUBLIC_AUTH_ENABLED=true`.
   *
   * Toàn bộ mã xác thực (store, interceptor 401, guard, các màn khách) vẫn
   * nguyên vẹn — cờ này chỉ quyết định guard có chặn hay không.
   */
  authEnabled: asBoolean(RAW.AUTH_ENABLED, false),
} as const;

export type AppConfig = typeof appConfig;

/**
 * Cảnh báo khi cấu hình mâu thuẫn.
 *
 * ⛔ Là HÀM, không phải khối chạy ở tầm module. Chạy tự động lúc nạp module thì
 * MỌI file test có import gián tiếp tới `appConfig` — tức gần như mọi test —
 * đều in ra cảnh báo này, và người đọc kết quả test sẽ quen mắt bỏ qua. Cảnh
 * báo mà bị bỏ qua thì không còn là cảnh báo.
 *
 * Gọi MỘT lần lúc khởi động app: xem `src/shell/providers/AppProviders.tsx`.
 *
 * Không `throw`: app vẫn phải chạy được khi chưa có backend (đó là trạng thái
 * xuất xưởng của base). Nhưng phải NÓI RA, vì cả hai ca dưới đây đều dẫn tới
 * triệu chứng "app hỏng" mà không có lỗi nào chỉ về nguyên nhân.
 */
export function warnOnRiskyConfig(): void {
  if (!__DEV__) return;

  if (appConfig.authEnabled && !appConfig.apiBaseUrl) {
    console.warn(
      '⚠️ EXPO_PUBLIC_AUTH_ENABLED=true nhưng EXPO_PUBLIC_API_BASE_URL còn trống.\n' +
        '   Mọi lượt đăng nhập sẽ hỏng vì không biết gọi đi đâu. Điền URL vào `.env` ' +
        'rồi chạy lại `npm run start:clear`.',
    );
  }
  if (!appConfig.authEnabled) {
    console.warn(
      '⚠️ EXPO_PUBLIC_AUTH_ENABLED=false — MỌI màn hình đang mở cho người chưa đăng nhập.\n' +
        '   Đúng cho lúc dựng giao diện. ⛔ PHẢI đặt `true` trước khi phát hành.',
    );
  }
}
