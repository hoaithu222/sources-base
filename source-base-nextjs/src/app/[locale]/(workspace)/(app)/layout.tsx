import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import { AuthGate } from '@/app/_guards';
import { AppShellLayout } from '@/app/_layouts';

/** Cả vùng làm việc không lập chỉ mục — nội dung riêng tư; `robots.txt` cũng chặn các đường này. */
export const metadata: Metadata = { robots: { index: false, follow: false } };

/**
 * Layout của nhóm `(app)` — vùng làm việc cần đăng nhập: `proxy.ts` chặn người không có cookie phiên ở server, `AuthGate` lo
 * phiên hết hạn ở client, rồi khung shell (header, Dock, thẻ làm việc, bảng lệnh) bọc trang.
 */
export default function AppGroupLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGate>
      <AppShellLayout>{children}</AppShellLayout>
    </AuthGate>
  );
}
