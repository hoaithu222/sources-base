import type { ReactNode } from 'react';
import { useTranslations } from 'next-intl';

import PublicFooter from '@/app/_layouts/public/PublicFooter';
import PublicHeader from '@/app/_layouts/public/PublicHeader';

/**
 * Layout của nhóm `(public)` — trang marketing / nội dung cho công cụ tìm kiếm: header + `<main>` + footer, TÀI LIỆU CUỘN TỰ
 * NHIÊN (khác vùng làm việc khoá viewport). Tĩnh (SSG), không React Query / phiên → ít JS nhất có thể.
 */
export default function PublicLayout({ children }: { children: ReactNode }) {
  const t = useTranslations('site');

  return (
    <div className="flex min-h-dvh flex-col bg-bg-page">
      <a
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[70] focus:rounded-full focus:bg-bg-surface focus:px-4 focus:py-2 focus:text-body-14-semibold focus:text-link focus:shadow-(--elev-3) focus:ring-2 focus:ring-ring-focus focus:outline-none"
        href="#main-content"
      >
        {t('skipToContent')}
      </a>
      <PublicHeader />
      <main className="flex-1" id="main-content">
        {children}
      </main>
      <PublicFooter />
    </div>
  );
}
