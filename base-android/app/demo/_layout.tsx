import { Stack } from 'expo-router';

/**
 * Nhóm route DEMO — thư viện component.
 *
 * ⛔ Cố ý nằm NGOÀI `(app)`: không có thanh tab và KHÔNG đi qua hàng rào đăng
 * nhập. Thư viện component phải xem được ngay cả khi backend chưa có, mà nhét
 * vào `(app)` thì bật `EXPO_PUBLIC_AUTH_ENABLED=true` là nó biến mất.
 *
 * ⛔ Giao dự án thật thì xoá cả thư mục này, `src/features/demo/`, bốn dòng
 * `DEMO*` trong `PATHS` và mục "Nhà phát triển" ở `SettingsScreen`. Hết —
 * không chỗ nào khác trỏ tới.
 */
export default function DemoLayout() {
  // `headerShown: false` vì mỗi màn tự dựng `<AppBar>` của bộ component; bật cả
  // hai là hai thanh tiêu đề chồng nhau.
  return <Stack screenOptions={{ headerShown: false }} />;
}
