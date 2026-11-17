import type { ConfigContext, ExpoConfig } from 'expo/config';

/**
 * Cấu hình Expo — thay cho `app.json`.
 *
 * Dùng file `.ts` chứ không phải JSON vì mọi giá trị đổi theo môi trường (tên
 * app, package id, URL API, project EAS) phải đọc được từ `.env`. Với `app.json`
 * thì chúng bị đóng cứng trong repo, và mỗi lần build cho môi trường khác lại
 * phải sửa file rồi nhớ hoàn nguyên — chỗ này đã sinh ra vô số bản build nhầm
 * môi trường ở các dự án khác.
 *
 * ── Hai lớp biến môi trường, ĐỪNG nhầm ───────────────────────────────────────
 *
 *  · **Biến LÚC BUILD** (`APP_NAME`, `ANDROID_PACKAGE`, `EAS_PROJECT_ID`…)
 *    — chỉ file này đọc. Chạy trong Node lúc dựng cấu hình nên đọc được TOÀN BỘ
 *    `process.env`. KHÔNG vào bundle.
 *
 *  · **Biến LÚC CHẠY** (`EXPO_PUBLIC_*`) — code trong `src/` đọc qua
 *    `process.env.EXPO_PUBLIC_…`. Metro thay THẲNG chuỗi vào bundle lúc build.
 *
 *    ⛔ Vì là thay chuỗi tĩnh nên **bắt buộc viết đủ tên biến ngay tại chỗ đọc**.
 *       `process.env[key]` với `key` là biến sẽ ra `undefined` — xem cách viết
 *       đúng ở `src/core/config/env.config.ts`.
 *    ⛔ Và vì nằm trong bundle nên bất kỳ ai giải nén APK cũng đọc được.
 *       KHÔNG đặt secret (khoá ký, chuỗi kết nối, private key) vào `EXPO_PUBLIC_*`.
 *
 * Expo CLI tự nạp `.env` vào `process.env` TRƯỚC khi chạy file này, nên không
 * cần `dotenv`.
 */

/** Đọc biến build-time, có giá trị mặc định. */
const env = (key: string, fallback: string): string => process.env[key]?.trim() || fallback;

const APP_NAME = env('APP_NAME', 'Base App');
const APP_SLUG = env('APP_SLUG', 'base-android');
const APP_SCHEME = env('APP_SCHEME', 'baseapp');
const ANDROID_PACKAGE = env('ANDROID_PACKAGE', 'com.vci.baseapp');
const IOS_BUNDLE_ID = env('IOS_BUNDLE_ID', 'com.vci.baseapp');
const EAS_PROJECT_ID = process.env.EAS_PROJECT_ID?.trim();

/**
 * Nền màn hình chờ — lấy từ token `bg-1` của `colors.json`.
 *
 * ⚠️ Phải viết cứng ở đây: file này chạy trong Node LÚC BUILD, còn token màu chỉ
 * thành biến CSS khi Metro đã đóng gói xong. Đổi `bg-1` thì nhớ đổi cả hai chỗ —
 * lệch nhau thì màn chờ nháy một khung hình sai màu trước khi app lên.
 */
const SPLASH_BG_LIGHT = '#FFFFFF';
const SPLASH_BG_DARK = '#0A1D30';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: APP_NAME,
  slug: APP_SLUG,
  version: '0.1.0',
  orientation: 'portrait',
  icon: './assets/images/icon.png',
  scheme: APP_SCHEME,

  /**
   * `automatic` = đi theo cài đặt sáng/tối của hệ điều hành.
   *
   * BẮT BUỘC phải là `automatic` (không phải `light`) thì `useColorScheme()` của
   * React Native mới báo đúng theme hệ thống. Để `light` là hệ điều hành luôn
   * trả `'light'`, và lựa chọn "Theo hệ thống" trong màn Cài đặt thành vô nghĩa.
   */
  userInterfaceStyle: 'automatic',

  ios: {
    bundleIdentifier: IOS_BUNDLE_ID,
    supportsTablet: true,
    infoPlist: {
      // Tiếng Việt có dấu trong tên app hiển thị dưới icon.
      CFBundleDisplayName: APP_NAME,
    },
  },

  android: {
    package: ANDROID_PACKAGE,
    adaptiveIcon: {
      backgroundColor: SPLASH_BG_LIGHT,
      foregroundImage: './assets/images/android-icon-foreground.png',
      backgroundImage: './assets/images/android-icon-background.png',
      monochromeImage: './assets/images/android-icon-monochrome.png',
    },
    /**
     * Cử chỉ "vuốt lùi có xem trước" của Android 13+.
     *
     * ⛔ Để `false` CÓ CHỦ Ý. Bật lên thì Android tự vẽ hoạt ảnh lùi, nhưng
     * React Navigation vẫn giữ màn hình trong ngăn xếp của nó — hai bên bất
     * đồng bộ và người dùng thấy màn hình nháy về rồi lại hiện ra. Chỉ bật khi
     * đã kiểm tra tay trên máy thật với đúng phiên bản react-native-screens
     * đang dùng.
     */
    predictiveBackGestureEnabled: false,
  },

  plugins: [
    'expo-router',

    [
      'expo-splash-screen',
      {
        image: './assets/images/splash-icon.png',
        imageWidth: 160,
        resizeMode: 'contain',
        backgroundColor: SPLASH_BG_LIGHT,
        dark: { backgroundColor: SPLASH_BG_DARK },
      },
    ],

    /**
     * Nhúng font vào bản native LÚC BUILD, không tải lúc chạy.
     *
     * Vì sao không dùng `useFonts()` ở tầng React: hook đó tải font sau khi app
     * đã lên, nên có một khoảng khung hình đầu chữ hiện bằng font hệ thống rồi
     * mới nhảy sang Plus Jakarta Sans — chớp một cái, thấy rõ trên máy chậm. Nhúng
     * lúc build thì font có sẵn từ khung hình ĐẦU TIÊN.
     *
     * ⚠️ Android khai dạng OBJECT (`fontFamily` + `fontDefinitions`) chứ không
     * phải danh sách đường dẫn. Chỉ dạng object mới sinh ra file XML
     * `font-family` — thứ khiến `font-medium` / `font-bold` chọn ĐÚNG file nét
     * đậm. Khai dạng danh sách thì Android chỉ thấy 4 font rời không liên quan,
     * `fontWeight` bị bỏ qua và mọi thứ ra nét Regular, hoặc tệ hơn là Android
     * tự "bôi đậm" nét Regular (fake bold) trông rất bẩn.
     *
     * iOS thì ngược lại: chỉ cần danh sách đường dẫn, tên họ font lấy từ bảng
     * `name` bên trong file .ttf — cũng đúng bằng chuỗi 'Plus Jakarta Sans' (nameID 16).
     */
    [
      'expo-font',
      {
        android: {
          fonts: [
            {
              fontFamily: 'Plus Jakarta Sans',
              fontDefinitions: [
                { path: './assets/fonts/PlusJakartaSans-Regular.ttf', weight: 400 },
                { path: './assets/fonts/PlusJakartaSans-Medium.ttf', weight: 500 },
                { path: './assets/fonts/PlusJakartaSans-SemiBold.ttf', weight: 600 },
                { path: './assets/fonts/PlusJakartaSans-Bold.ttf', weight: 700 },
              ],
            },
          ],
        },
        ios: {
          fonts: [
            './assets/fonts/PlusJakartaSans-Regular.ttf',
            './assets/fonts/PlusJakartaSans-Medium.ttf',
            './assets/fonts/PlusJakartaSans-SemiBold.ttf',
            './assets/fonts/PlusJakartaSans-Bold.ttf',
          ],
        },
      },
    ],
  ],

  experiments: {
    /**
     * Sinh kiểu cho mọi đường dẫn trong `app/`. Nhờ nó `router.push('/setting')`
     * (thiếu chữ `s`) là lỗi TypeScript chứ không phải màn hình trắng lúc chạy.
     * Kiểu nằm ở `.expo/types` — chạy `npx expo start` một lần để sinh.
     */
    typedRoutes: true,
    /** React Compiler — tự memo hoá, bớt phải rải `useMemo`/`useCallback`. */
    reactCompiler: true,
  },

  extra: {
    ...(EAS_PROJECT_ID ? { eas: { projectId: EAS_PROJECT_ID } } : {}),
  },
});
