'use client';

import { useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';

import { usePathname, useRouter } from '@/core/i18n';
import {
  nextDisplaySearch,
  readDisplayOverrides,
  selectEffectiveUiScale,
  selectIsTv,
  useDisplayStore,
} from '@/domains/preferences';

/**
 * DisplayUrlSync — đồng bộ chế độ hiển thị giữa URL (`?display=tv&scale=1.2`) và display store; `AppProviders` gắn
 * MỘT lần, bọc trong `<Suspense>` (`useSearchParams` buộc vậy khi render tĩnh).
 *
 * URL MỚI mang `display` / `scale` hợp lệ thì URL thắng store; không mang thì giữ lựa chọn đã lưu; sau đó URL luôn
 * được viết lại cho khớp store. Param rác (`?display=abc`) coi như không có.
 * Chi tiết: docs/rules/display/tv-display-mode.md · docs/notes/code/app.md (## navigation).
 */
export default function DisplayUrlSync() {
  const pathname = usePathname();
  const router = useRouter();
  const search = useSearchParams().toString();

  const isTv = useDisplayStore(selectIsTv);
  const uiScale = useDisplayStore(selectEffectiveUiScale);

  const appliedUrlRef = useRef<string | null>(null);

  useEffect(() => {
    const url = `${pathname}?${search}`;
    if (appliedUrlRef.current !== url) {
      appliedUrlRef.current = url;
      useDisplayStore.getState().applyDisplayOverrides(readDisplayOverrides(search));
    }

    const next = nextDisplaySearch(search, useDisplayStore.getState());
    if (next === null) return;

    router.replace(`${pathname}${next ? `?${next}` : ''}${window.location.hash}`, {
      scroll: false,
    });
  }, [pathname, search, router, isTv, uiScale]);

  return null;
}
