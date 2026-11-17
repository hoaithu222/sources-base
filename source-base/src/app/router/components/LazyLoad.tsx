import { useMemo, type ComponentType } from 'react';
import { useLocation } from 'react-router-dom';

import { ErrorBoundary, type ScreenLevel } from '@/app/components';

interface LazyLoadProps {
  component: ComponentType;
  level?: ScreenLevel;
}

/**
 * LazyLoad — vỏ của MỌI trang trong router: ranh giới lỗi (`ErrorBoundary`); `buildRoutes` tự bọc, trang không
 * dùng tay.
 *
 * KHÔNG có `Suspense`: ranh giới chờ tải nằm ở layout (`RootLayout` · `AppShellLayout` · `AuthLayout`) và đứng yên
 * qua mọi lần đổi trang. Đặt `Suspense` ở đây thì mỗi route là một ranh giới MỚI, trang mới chưa tải xong là hiện
 * màn chờ thay trang cũ (chớp); ranh giới đã hiện thì React giữ trang cũ tới khi trang mới sẵn sàng.
 * Lưu ý: lỗi tự xoá khi `pathname` đổi, KHÔNG xoá khi chỉ đổi `?search=` (routing-conventions.md §7).
 * Vỏ đọc `useLocation()` nên vẽ lại ở mỗi lần đổi URL, nhưng giữ NGUYÊN phần tử trang — trang chỉ vẽ lại
 * khi chính nó đọc router / store (không cần `memo` ở trang). Trang nạp lười phải nằm dưới một layout có `Suspense`
 * (test dựng `buildRoutes` trần thì bọc bằng `<Suspense>` hoặc `RootLayout`).
 *
 * @param props.component - Trang khai bằng `lazyPage()`, hoặc component nạp sẵn.
 * @param props.level - Cỡ màn lỗi: `content` (route nằm trong layout) | `app` (ngoài mọi layout). Mặc định
 *   `content`.
 */
export default function LazyLoad({ component: Page, level = 'content' }: LazyLoadProps) {
  const { pathname } = useLocation();

  const content = useMemo(() => <Page />, [Page]);

  return (
    <ErrorBoundary label="Trang" level={level} resetKey={pathname}>
      {content}
    </ErrorBoundary>
  );
}
