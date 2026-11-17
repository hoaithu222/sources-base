'use client';

import { useCallback } from 'react';
import { useSearchParams } from 'next/navigation';

import { usePathname } from '@/core/i18n';

import { applyParamUpdates, type QueryParamValue } from './query-params.utils';

export type BuildNavHref = (updates: Record<string, QueryParamValue>) => string;

/**
 * `buildHref({ tab: 'x' })` (từ `useNavHref()`) → URL thật cho tab `?tab=`, mở được bằng Ctrl+click.
 * Như `useQueryParams.updateParams`: giá trị rỗng/`null` xoá key, key khác giữ nguyên (tab mới vẫn giữ bộ lọc).
 * KHÔNG tự nối `${pathname}?tab=…` ở call-site — nối tay xoá sạch mọi param khác (search, page, filter).
 * Lưu ý: `useSearchParams` của Next buộc trang nằm trong `<Suspense>` khi render tĩnh — bọc ở `page.tsx`.
 */
export function useNavHref(): BuildNavHref {
  const searchParams = useSearchParams();
  const pathname = usePathname();

  return useCallback(
    (updates) => {
      const query = applyParamUpdates(new URLSearchParams(searchParams), updates).toString();
      return query ? `${pathname}?${query}` : pathname;
    },
    [searchParams, pathname],
  );
}
