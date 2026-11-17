import { Suspense, useMemo, type ComponentType } from 'react';
import { useLocation } from 'react-router-dom';

import { ErrorBoundary, LoadingScreen, type ScreenLevel } from '@/app/components';

interface LazyLoadProps {
  component: ComponentType;
  level?: ScreenLevel;
}

/**
 * LazyLoad — vỏ của MỌI trang trong router: chờ tải (`Suspense` + `LoadingScreen`) và ranh giới lỗi
 * (`ErrorBoundary`); `buildRoutes` tự bọc, trang không dùng tay.
 *
 * Lưu ý: lỗi tự xoá khi `pathname` đổi, KHÔNG xoá khi chỉ đổi `?search=` (routing-conventions.md §7).
 * Vỏ đọc `useLocation()` nên vẽ lại ở mỗi lần đổi URL, nhưng giữ NGUYÊN phần tử trang — trang chỉ vẽ lại
 * khi chính nó đọc router / store (không cần `memo` ở trang).
 *
 * @param props.component - Trang khai bằng `lazyPage()`, hoặc component nạp sẵn.
 * @param props.level - Cỡ màn chờ / màn lỗi: `content` (route nằm trong layout) | `app` (ngoài mọi
 *   layout). Mặc định `content`.
 */
export default function LazyLoad({ component: Page, level = 'content' }: LazyLoadProps) {
  const { pathname } = useLocation();

  const content = useMemo(
    () => (
      <Suspense fallback={<LoadingScreen level={level} />}>
        <Page />
      </Suspense>
    ),
    [Page, level],
  );

  return (
    <ErrorBoundary label="Trang" level={level} resetKey={pathname}>
      {content}
    </ErrorBoundary>
  );
}
