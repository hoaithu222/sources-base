import type { ReactNode } from 'react';

import { AppProviders } from '@/app/_providers';

/**
 * Layout của nhóm `(workspace)` — mọi thứ cần phiên đăng nhập: trang khách (`(auth)`) và ứng dụng (`(app)`). Gắn
 * `AppProviders` (React Query, phiên, toast, biểu đồ) MỘT lần, nên chuyển từ đăng nhập vào ứng dụng không dựng lại provider.
 * Trang công khai (`(public)`) nằm NGOÀI nhóm này để không phải tải các thư viện đó.
 */
export default function WorkspaceLayout({ children }: { children: ReactNode }) {
  return <AppProviders>{children}</AppProviders>;
}
