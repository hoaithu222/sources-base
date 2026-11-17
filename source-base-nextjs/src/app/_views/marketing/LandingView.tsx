import { useTranslations } from 'next-intl';

import { Link } from '@/core/i18n';
import { PATHS } from '@/shared/constants/paths.constants';
import { AppTile, Button } from '@/shared/ui';
import type { AppIconName, AppTileTone } from '@/shared/ui';
import { cn } from '@/shared/utils/style/cn';

const FEATURES = [
  { id: 'data', icon: 'folder', tone: 'blue' },
  { id: 'permissions', icon: 'hr', tone: 'purple' },
  { id: 'reports', icon: 'analytics', tone: 'primary' },
  { id: 'multilingual', icon: 'apps', tone: 'sky' },
] as const satisfies readonly { id: string; icon: AppIconName; tone: AppTileTone }[];

const LANDING_CLASSES = {
  hero: cn(
    'relative isolate overflow-hidden border-b border-border-default',
    'bg-[radial-gradient(circle_at_80%_-10%,color-mix(in_srgb,var(--color-primary-2)_85%,transparent),transparent_55%)]',
    'dark:bg-none',
  ),
  heroInner: 'mx-auto flex w-full max-w-6xl flex-col items-start gap-6 px-4 py-16 sm:px-6 sm:py-24',
  kicker: 'font-mono text-caption-12 uppercase tracking-[0.22em] text-link',
  title: 'max-w-3xl text-h1-bold tracking-tight text-fg-heading phone:text-h2-bold',
  subtitle: 'max-w-2xl text-body-18 text-fg-muted phone:text-body-16',
  actions: 'flex flex-wrap items-center gap-3 pt-2',
  section: 'mx-auto w-full max-w-6xl px-4 py-14 sm:px-6',
  sectionTitle: 'text-h3-bold text-fg-heading',
  sectionSubtitle: 'mt-2 max-w-2xl text-body-16 text-fg-muted',
  grid: 'mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4',
  card: cn(
    'rim-soft squircle flex flex-col gap-3 rounded-xl border border-border-default bg-bg-surface p-5',
    'shadow-(--elev-1) transition-shadow duration-200 hover:shadow-(--elev-2)',
  ),
  cardTitle: 'text-body-16-semibold text-fg-heading',
  cardBody: 'text-body-14 text-fg-muted',
  cta: cn(
    'squircle mx-auto flex w-full max-w-4xl flex-col items-center gap-4 rounded-2xl border border-border-default',
    'bg-bg-surface px-6 py-10 text-center shadow-(--elev-1)',
  ),
  ctaTitle: 'text-h4-bold text-fg-heading',
  ctaBody: 'max-w-xl text-body-16 text-fg-muted',
};

/**
 * LandingView — nội dung trang chủ công khai: hero (CHỈ MỘT `<h1>`), lưới tính năng, lời kêu gọi hành động. Server
 * Component thuần — HTML đầy đủ, không JS riêng ngoài các nút / liên kết của UI kit.
 * Lưu ý: chữ ở `messages/<locale>/landing.json`; icon + tông từng thẻ ở `FEATURES`. Heading đi đúng thứ bậc h1 → h2 → h3 (SEO + a11y).
 */
export default function LandingView() {
  const t = useTranslations('landing');

  return (
    <>
      <section className={LANDING_CLASSES.hero}>
        <div className={LANDING_CLASSES.heroInner}>
          <p className={LANDING_CLASSES.kicker}>{t('hero.kicker')}</p>
          <h1 className={LANDING_CLASSES.title}>{t('hero.title')}</h1>
          <p className={LANDING_CLASSES.subtitle}>{t('hero.subtitle')}</p>
          <div className={LANDING_CLASSES.actions}>
            <Button asChild size="lg" variant="primary">
              <Link href={PATHS.REGISTER}>{t('hero.primaryCta')}</Link>
            </Button>
            <Button asChild size="lg" variant="stroke">
              <Link href={PATHS.ABOUT}>{t('hero.secondaryCta')}</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className={LANDING_CLASSES.section}>
        <h2 className={LANDING_CLASSES.sectionTitle}>{t('features.title')}</h2>
        <p className={LANDING_CLASSES.sectionSubtitle}>{t('features.subtitle')}</p>
        <ul className={LANDING_CLASSES.grid}>
          {FEATURES.map(({ id, icon, tone }) => (
            <li key={id} className={LANDING_CLASSES.card}>
              <AppTile icon={icon} size="md" tone={tone} />
              <h3 className={LANDING_CLASSES.cardTitle}>{t(`features.items.${id}.title`)}</h3>
              <p className={LANDING_CLASSES.cardBody}>{t(`features.items.${id}.description`)}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className={cn(LANDING_CLASSES.section, 'pt-0')}>
        <div className={LANDING_CLASSES.cta}>
          <h2 className={LANDING_CLASSES.ctaTitle}>{t('cta.title')}</h2>
          <p className={LANDING_CLASSES.ctaBody}>{t('cta.description')}</p>
          <Button asChild size="lg" variant="primary">
            <Link href={PATHS.REGISTER}>{t('cta.action')}</Link>
          </Button>
        </div>
      </section>
    </>
  );
}
