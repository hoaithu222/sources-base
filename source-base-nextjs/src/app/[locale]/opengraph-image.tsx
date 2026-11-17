import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

import { ImageResponse } from 'next/og';

import { LOCALES } from '@/core/i18n';
import { loadMessages, requireLocale } from '@/core/i18n/server';
import { getSiteName } from '@/core/seo';

/**
 * `/[locale]/opengraph-image` — ảnh 1200×630 khi chia sẻ link lên Facebook / Zalo / Slack / LinkedIn / X, sinh theo ngôn ngữ
 * (`landing.hero.title` + `metadata.site.description`). Next tự gắn `og:image` / `twitter:image` cho MỌI trang dưới `[locale]`
 * trừ trang tự khai `openGraph.images`; muốn ảnh riêng cho một trang thì đặt `opengraph-image.tsx` cạnh `page.tsx` của nó.
 *
 * Lưu ý: font phải nạp tay (Satori không dùng font hệ thống) và PHẢI có glyph tiếng Việt — dùng Noto Sans `latin` + `vietnamese`
 * ở `src/assets/fonts/og/` (OFL). Satori chỉ đọc TTF / OTF / WOFF, KHÔNG đọc WOFF2. Thêm ngôn ngữ dùng chữ khác (Hán, Thái…)
 * thì thêm subset tương ứng. Ảnh sinh lúc build (tĩnh) nhờ `generateStaticParams`; đóng gói standalone cần `outputFileTracingIncludes` ở
 * `next.config.ts` để mang theo thư mục font.
 */

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

const FONT_DIR = join(process.cwd(), 'src/assets/fonts/og');

const loadFont = (file: string) => readFile(join(FONT_DIR, file));

export default async function OpenGraphImage({ params }: { params: Promise<{ locale: string }> }) {
  const locale = requireLocale((await params).locale);
  const messages = await loadMessages(locale);
  const [latin700, vietnamese700, latin400, vietnamese400] = await Promise.all([
    loadFont('noto-sans-latin-700-normal.woff'),
    loadFont('noto-sans-vietnamese-700-normal.woff'),
    loadFont('noto-sans-latin-400-normal.woff'),
    loadFont('noto-sans-vietnamese-400-normal.woff'),
  ]);

  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: 72,
        color: '#0B1F1A',
        fontFamily: 'Noto Sans',
        background: 'linear-gradient(135deg, #F1F5F4 0%, #D9F1E6 55%, #CBE7F5 100%)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: 18,
            background: 'linear-gradient(135deg, #17A673 0%, #0E8F8F 55%, #1F6FB5 100%)',
          }}
        />
        <div style={{ fontSize: 40, fontWeight: 700 }}>{getSiteName()}</div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div style={{ fontSize: 76, fontWeight: 700, lineHeight: 1.1, letterSpacing: -1 }}>
          {messages.landing.hero.title}
        </div>
        <div style={{ fontSize: 32, fontWeight: 400, lineHeight: 1.35, color: '#33524A' }}>
          {messages.metadata.site.description}
        </div>
      </div>
    </div>,
    {
      ...size,
      fonts: [
        { name: 'Noto Sans', data: latin700, weight: 700, style: 'normal' },
        { name: 'Noto Sans', data: vietnamese700, weight: 700, style: 'normal' },
        { name: 'Noto Sans', data: latin400, weight: 400, style: 'normal' },
        { name: 'Noto Sans', data: vietnamese400, weight: 400, style: 'normal' },
      ],
    },
  );
}
