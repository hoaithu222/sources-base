import { useMemo, useState } from 'react';
import { useLocation, useMatches } from 'react-router-dom';

import { APP_NAME } from '@/shared/constants/app.constants';

import { resolveScreenTitle } from './document-title.utils';

/**
 * RouteAnnouncer — vùng `aria-live="polite"` ẩn (`sr-only`): mỗi lần `pathname` đổi, trình đọc màn hình
 * đọc tên trang mới — điều hướng phía client không tải lại trang nên trình đọc không tự báo.
 *
 * Mount MỘT lần ở route gốc (`setup/app-routes.tsx`), cạnh `DocumentTitleSync`; tên lấy bằng CHÍNH
 * `resolveScreenTitle` của tên tab (không có tiêu đề → tên app).
 * Lưu ý: không đọc ở lần tải đầu (trình đọc đã đọc trang) và khi chỉ đổi `?search` / `#hash` (lọc, tab).
 */
function RouteAnnouncer() {
  const matches = useMatches();
  const { pathname, search } = useLocation();
  const screenTitle = useMemo(() => resolveScreenTitle(matches, search), [matches, search]);

  const [announced, setAnnounced] = useState({ pathname, message: '' });
  if (announced.pathname !== pathname) {
    setAnnounced({ pathname, message: screenTitle ?? APP_NAME });
  }

  return (
    <div aria-atomic="true" aria-live="polite" className="sr-only">
      {announced.message}
    </div>
  );
}

export default RouteAnnouncer;
