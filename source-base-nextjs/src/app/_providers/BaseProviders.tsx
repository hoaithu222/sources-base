'use client';

import type { ReactNode } from 'react';

import AppearanceSync from './appearance/AppearanceSync';
import StoreHydration from './sync/StoreHydration';

interface BaseProvidersProps {
  children: ReactNode;
}

/**
 * BaseProviders — phần provider TỐI THIỂU mà MỌI trang cần (kể cả trang công khai): nạp state đã lưu vào các store và áp
 * giao diện (theme, màu nhấn, TV) lên `<html>`. Gắn ở `[locale]/layout.tsx`.
 *
 * Lưu ý: cố ý KHÔNG có React Query, phiên, toast, biểu đồ — những thứ đó nặng và chỉ vùng làm việc cần, nên ở `AppProviders`
 * (layout `(workspace)`). Trang marketing nhờ vậy tải ít JS hơn (LCP / TBT).
 *
 * @param props.children - Toàn bộ cây trang.
 */
export default function BaseProviders({ children }: BaseProvidersProps) {
  return (
    <>
      <StoreHydration />
      <AppearanceSync />
      {children}
    </>
  );
}
