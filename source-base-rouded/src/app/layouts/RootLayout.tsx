import { useRef } from 'react';
import { Outlet } from 'react-router-dom';

import { useRouteScrollRestoration } from './useRouteScrollRestoration';

const ROOT_LAYOUT_CLASSES = 'flex h-dvh flex-col overflow-y-auto bg-bg-page *:shrink-0';

/**
 * RootLayout — layout gốc của mọi route: khung nền toàn màn hình (`bg-bg-page`) bọc `<Outlet />`;
 * layout con (`AppShellLayout`, `AuthLayout`) và trang đứng riêng (403, 404) lồng bên trong.
 *
 * Đặt ở route gốc của `setup/app-routes.tsx`, không dùng lại trong trang. Lớp bọc nghiệp vụ toàn app của
 * dự án kế thừa (stream thông báo…) đặt quanh `<Outlet />` tại đây.
 * Lưu ý: là VÙNG CUỘN của mọi trang ngoài khung ứng dụng (`body` khoá cuộn) — đừng bỏ `overflow-y-auto` /
 * `*:shrink-0`, trang đăng ký cao hơn màn hình sẽ mất nút gửi. Vị trí cuộn theo route: `useRouteScrollRestoration`.
 * Lý do: docs/notes/code/app.md.
 */
export default function RootLayout() {
  const rootRef = useRef<HTMLDivElement>(null);
  useRouteScrollRestoration(rootRef, 'root');

  return (
    <div ref={rootRef} className={ROOT_LAYOUT_CLASSES}>
      <Outlet />
    </div>
  );
}
