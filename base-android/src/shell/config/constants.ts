/**
 * Hằng số của riêng ỨNG DỤNG này (khác với hằng số dùng chung ở `shared/`).
 */

/**
 * Đường dẫn màn hình.
 *
 * ── Vì sao vẫn cần bảng này khi đã có typed routes ───────────────────────────
 * `experiments.typedRoutes` đã bắt được lỗi gõ sai đường dẫn. Bảng này giải một
 * việc khác: cho phép ĐỔI đường dẫn ở một chỗ. Khi `/settings` tách thành
 * `/settings/general`, sửa đúng một dòng ở đây thay vì đi sửa từng lời gọi
 * `router.push` rải khắp app.
 *
 * ⛔ Khai một đường dẫn ở đây thì PHẢI có file route tương ứng trong `app/`.
 * Đây là cái bẫy đã dính một lần ở base web: `PATHS.PROFILE` được khai, menu
 * người dùng điều hướng tới, nhưng không route nào mount nó — bấm vào là ra
 * trang 404. TypeScript không thấy (chuỗi vẫn hợp lệ), lint cũng không.
 * `tests/project-structure.test.ts` đối chiếu hai danh sách để chặn ca đó.
 */
export const PATHS = {
  // Nhóm khách — `app/(auth)/`
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',

  // Nhóm đã đăng nhập — `app/(app)/`
  HOME: '/',
  PROFILE: '/profile',
  SETTINGS: '/settings',

  /**
   * Nhóm demo — `app/demo/`. Thư viện component, KHÔNG phải màn hình nghiệp vụ.
   *
   * ⛔ Giao dự án thật thì xoá NGUYÊN CỤM: `app/demo/`, `src/features/demo/`
   * và bốn dòng dưới đây, cộng một lối vào ở `SettingsScreen`. Không chỗ nào
   * khác trỏ tới.
   *
   * ⚠️ `app/demo/` là thư mục route THẬT (`/demo` nằm trong đường dẫn), không
   * phải nhóm `(…)` như `(app)`/`(auth)`. Cố ý: nó đứng ngoài thanh tab và
   * ngoài hàng rào đăng nhập, nên xoá đi là một lệnh `rm -rf` chứ không phải
   * đi gỡ từng file khỏi cây tab.
   */
  DEMO: '/demo',
  DEMO_FOUNDATION: '/demo/foundation',
  DEMO_COMPONENTS: '/demo/components',
  DEMO_PATTERNS: '/demo/patterns',
} as const;

export type AppPath = (typeof PATHS)[keyof typeof PATHS];
