'use client';

import { useSyncExternalStore } from 'react';

/** Server không có `window` — luôn coi là không khớp; React đổi sang giá trị thật ngay sau hydrate, không báo lệch DOM. */
const getServerSnapshot = () => false;

/**
 * `useMediaQuery('(hover: none)')` → `true` khi query đang khớp; tự cập nhật theo sự kiện `change`.
 * ⛔ Không tự gõ query bề rộng để chia bố cục — dùng preset `useIsPhone` · `useIsBelowWide` · `useIsCoarsePointer`
 * (có biến thể CSS cùng điều kiện); đổi class thì viết biến thể Tailwind (`ipad-responsive.md`).
 * Lưu ý: dựng ở client (điều hướng, mount sau) cho giá trị đúng ngay khung hình đầu; riêng lần hydrate HTML tĩnh thì khung đầu
 * là `false` (khớp HTML server) rồi tự cập nhật — bố cục phụ thuộc hook này nên viết bằng biến thể CSS khi có thể (SEO, không nháy).
 */
export function useMediaQuery(query: string): boolean {
  const subscribe = (onChange: () => void) => {
    const mql = window.matchMedia?.(query);
    mql?.addEventListener('change', onChange);
    return () => mql?.removeEventListener('change', onChange);
  };
  const getSnapshot = () => window.matchMedia?.(query).matches === true;

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
