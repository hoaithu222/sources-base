import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import { GuestGate } from '@/app/_guards';
import { AuthLayout } from '@/app/_layouts';

/** Cả nhóm `(auth)` không lập chỉ mục: trang đăng nhập / đăng ký không có giá trị tìm kiếm và không nên tranh hạng với trang chủ. */
export const metadata: Metadata = { robots: { index: false, follow: false } };

/**
 * Layout của nhóm `(auth)` — thẻ hai khoang (thương hiệu | form) cho trang khách; `GuestGate` đưa người đã có phiên đi nơi khác
 * (`?next=` hoặc bảng điều khiển). Form hiện ngay từ HTML server, không đợi khôi phục phiên.
 */
export default function AuthGroupLayout({ children }: { children: ReactNode }) {
  return (
    <GuestGate>
      <AuthLayout>{children}</AuthLayout>
    </GuestGate>
  );
}
