import type { Metadata } from 'next';

import enErrors from '@/messages/en/errors.json';
import viErrors from '@/messages/vi/errors.json';

import '@/styles/globals.css';

export const metadata: Metadata = {
  title: `${viErrors.screens.notFound.title} · ${enErrors.screens.notFound.title}`,
  robots: { index: false, follow: false },
};

/**
 * global-not-found — 404 cho URL KHÔNG khớp route nào và không đi qua `proxy.ts` (đường có đuôi file, vd `/anh.png`); Next bỏ qua
 * mọi layout nên tự dựng `<html>`. Không biết ngôn ngữ → hiện cả hai. 404 theo ngôn ngữ cho các đường còn lại do
 * `[locale]/[...rest]` + `[locale]/not-found.tsx` lo.
 */
export default function GlobalNotFound() {
  return (
    <html lang="vi">
      <body>
        <main className="flex min-h-dvh flex-col items-center justify-center gap-3 bg-bg-page p-6 text-center">
          <p className="text-h1-bold tabular-nums text-fg-heading">404</p>
          <h1 className="text-h4-semibold text-fg-heading">{viErrors.screens.notFound.title}</h1>
          <p className="text-body-14 text-fg-muted">{viErrors.screens.notFound.description}</p>
          <p className="text-body-14 text-fg-muted" lang="en">
            {enErrors.screens.notFound.title} — {enErrors.screens.notFound.description}
          </p>
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- global-not-found chạy ngoài mọi layout / router: liên kết cứng là đúng */}
          <a
            className="text-body-14-semibold text-link underline-offset-2 hover:underline"
            href="/"
          >
            {viErrors.screens.homeAction} · {enErrors.screens.homeAction}
          </a>
        </main>
      </body>
    </html>
  );
}
