import type { Metadata } from 'next';

import AboutView from '@/app/_views/marketing/AboutView';
import { LOCALE_META } from '@/core/i18n';
import { getTranslations, requireLocale } from '@/core/i18n/server';
import {
  absoluteUrl,
  breadcrumbJsonLd,
  buildPageMetadata,
  getSiteOrigin,
  JsonLd,
  localizedPath,
  webPageJsonLd,
} from '@/core/seo';
import { PATHS } from '@/shared/constants/paths.constants';

export async function generateMetadata({
  params,
}: PageProps<'/[locale]/about'>): Promise<Metadata> {
  const locale = requireLocale((await params).locale);
  const t = await getTranslations({ locale, namespace: 'metadata.about' });

  return buildPageMetadata({
    locale,
    path: PATHS.ABOUT,
    title: t('title'),
    description: t('description'),
  });
}

/** Trang giới thiệu (`/about`) — SSG, có JSON-LD `WebPage` + `BreadcrumbList`. */
export default async function AboutPage({ params }: PageProps<'/[locale]/about'>) {
  const locale = requireLocale((await params).locale);

  const t = await getTranslations({ locale, namespace: 'metadata.about' });
  const tAbout = await getTranslations({ locale, namespace: 'about' });
  const origin = getSiteOrigin();
  const homeUrl = absoluteUrl(origin, localizedPath(PATHS.HOME, locale));
  const url = absoluteUrl(origin, localizedPath(PATHS.ABOUT, locale));

  return (
    <>
      <JsonLd
        data={[
          webPageJsonLd({
            name: t('title'),
            url,
            description: t('description'),
            inLanguage: LOCALE_META[locale].htmlLang,
            isPartOf: homeUrl,
          }),
          breadcrumbJsonLd([
            { name: tAbout('breadcrumbHome'), url: homeUrl },
            { name: t('title'), url },
          ]),
        ]}
      />
      <AboutView />
    </>
  );
}
