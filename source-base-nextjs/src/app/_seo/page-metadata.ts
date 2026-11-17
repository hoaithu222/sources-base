import type { Metadata } from 'next';

import type { Messages } from '@/core/i18n';
import { getTranslations, requireLocale } from '@/core/i18n/server';
import { buildPageMetadata } from '@/core/seo';

/** Khoá trang trong `messages/<locale>/metadata.json` (trừ `site` — metadata nền của root layout). */
export type PageMetadataKey = Exclude<keyof Messages['metadata'], 'site'>;

interface PageMetadataInput {
  /** `params` của `generateMetadata` — có `locale`. */
  params: Promise<{ locale: string }>;
  key: PageMetadataKey;
  /** Đường dẫn KHÔNG tiền tố ngôn ngữ — nền của canonical + hreflang. */
  path: string;
  /** Trang riêng tư / trạng thái → không lập chỉ mục. Mặc định `true` (an toàn: thêm trang mới không vô tình lọt vào Google). */
  noIndex?: boolean;
}

/**
 * generatePageMetadata — `generateMetadata` một dòng: title + description từ `metadata.<key>`, canonical + hreflang đúng ngôn ngữ,
 * mặc định `noindex`. Trang công khai truyền `noIndex: false` và thêm path vào `PUBLIC_ROUTES`; cần JSON-LD / title tuyệt đối
 * thì gọi `buildPageMetadata` trực tiếp. Chỉ chạy ở server — docs/guides/seo.md.
 */
export async function generatePageMetadata({
  params,
  key,
  path,
  noIndex = true,
}: PageMetadataInput): Promise<Metadata> {
  const locale = requireLocale((await params).locale);
  const t = await getTranslations({ locale, namespace: `metadata.${key}` });

  return buildPageMetadata({
    locale,
    path,
    title: t('title'),
    description: t('description'),
    noIndex,
  });
}
