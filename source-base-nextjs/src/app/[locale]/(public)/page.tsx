import type { Metadata } from 'next';

import LandingView from '@/app/_views/marketing/LandingView';
import { LOCALE_META } from '@/core/i18n';
import { getTranslations, requireLocale } from '@/core/i18n/server';
import {
  buildPageMetadata,
  getSiteName,
  getSiteOrigin,
  JsonLd,
  localizedPath,
  organizationJsonLd,
  websiteJsonLd,
} from '@/core/seo';
import { PATHS } from '@/shared/constants/paths.constants';

export async function generateMetadata({ params }: PageProps<'/[locale]'>): Promise<Metadata> {
  const locale = requireLocale((await params).locale);
  const t = await getTranslations({ locale, namespace: 'metadata.home' });

  return buildPageMetadata({
    locale,
    path: PATHS.HOME,
    title: t('title'),
    description: t('description'),
    absoluteTitle: true,
  });
}

/** Trang chủ công khai (`/`, `/en`) — SSG, có JSON-LD `WebSite` + `Organization`. Nội dung ở `LandingView`. */
export default async function HomePage({ params }: PageProps<'/[locale]'>) {
  const locale = requireLocale((await params).locale);

  const t = await getTranslations({ locale, namespace: 'metadata' });
  const origin = getSiteOrigin();
  const name = getSiteName();

  return (
    <>
      <JsonLd
        data={[
          websiteJsonLd({
            name,
            url: `${origin}${localizedPath(PATHS.HOME, locale)}`,
            description: t('site.description'),
            inLanguage: LOCALE_META[locale].htmlLang,
          }),
          organizationJsonLd({
            name,
            url: origin,
            logo: `${origin}/favicon.svg`,
            description: t('site.organizationDescription'),
          }),
        ]}
      />
      <LandingView />
    </>
  );
}
