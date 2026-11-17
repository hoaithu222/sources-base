import { useEffect, useMemo } from 'react';
import { useLocation, useMatches } from 'react-router-dom';

import { resolveDocumentTitle } from './document-title.utils';

/**
 * DocumentTitleSync — đổi tên tab trình duyệt theo route + tab nội bộ đang mở.
 *
 * Mount MỘT lần ở route gốc (`setup/app-routes.tsx`) để phủ cả trang ngoài `AuthGuard` (đăng nhập, 403, 404).
 * Cách dựng tên: `resolveDocumentTitle` · docs/rules/structure/routing-conventions.md §6.
 */
function DocumentTitleSync() {
  const matches = useMatches();
  const { search } = useLocation();

  const title = useMemo(() => resolveDocumentTitle(matches, search), [matches, search]);

  useEffect(() => {
    document.title = title;
  }, [title]);

  return null;
}

export default DocumentTitleSync;
