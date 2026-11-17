'use client';

import { useTranslations } from 'next-intl';

import { useActiveModule } from '@/app/_navigation';
import type { ModuleNavLink } from '@/app/_navigation';
import { Link } from '@/core/i18n';
import { AppTile, PageBody, PageShell } from '@/shared/ui';
import { SystemIcon } from '@/shared/ui/icons/Icons';
import { cn } from '@/shared/utils/style/cn';

const MODULE_HOME_CLASSES = {
  hero: cn(
    'rim-soft squircle relative isolate flex items-center gap-4 overflow-hidden rounded-2xl border border-border-default p-4',
    'bg-bg-surface shadow-(--elev-1)',
    'bg-[radial-gradient(circle_at_100%_0%,color-mix(in_srgb,var(--color-primary-2)_80%,transparent),transparent_55%)]',
    'dark:bg-none',
  ),
  heroText: 'flex min-w-0 flex-col gap-1',
  heroTitle: 'text-h4-bold text-fg-heading',
  heroSubtitle: 'text-body-14 text-fg-muted',
  heroMeta: 'text-caption-12-medium text-link',
  group: 'flex flex-col gap-2',
  groupLabel: 'px-1 text-caption-12-semibold uppercase tracking-[0.1em] text-fg-muted',
  grid: 'grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3',
  card: cn(
    'rim-soft squircle group/card relative flex items-center gap-3 rounded-xl border border-border-default bg-bg-surface p-4 outline-none',
    'shadow-(--elev-1) transition-[transform,box-shadow,border-color] duration-200 ease-[cubic-bezier(0.2,0.8,0.2,1)]',
    'hover:-translate-y-0.5 hover:border-border-strong hover:shadow-(--elev-2) active:translate-y-0',
    'focus-visible:ring-2 focus-visible:ring-ring-focus',
  ),
  cardTitle: 'text-body-16-semibold text-fg-heading',
  cardDesc: 'line-clamp-2 text-body-13 text-fg-muted',
  cardArrow: cn(
    'ml-auto shrink-0 text-fg-faint transition-[transform,color] duration-200',
    'group-hover/card:translate-x-0.5 group-hover/card:text-link',
  ),
} satisfies Record<string, string>;

/** Mục lá cấp 1 (trang) và nhóm (layout có con) — nhóm thành một hàng có tiêu đề riêng. */
function splitGroups(links: readonly ModuleNavLink[]) {
  const pages = links.filter((link) => !link.children);
  const groups = links.filter((link) => link.children?.length);
  return { pages, groups };
}

/**
 * ModuleHomeView — TRANG CHỦ của một phân hệ (cấp 1 của header): thẻ giới thiệu phân hệ + lưới THẺ MÀN HÌNH của phân hệ
 * (màn hình trên dải điều hướng), nhóm (mục có con) thành hàng riêng có tiêu đề. Bấm một thẻ → header ĐỔI CẤP sang
 * vệt ‹ · phân hệ › màn hình. Dữ liệu dựng từ cấu hình điều hướng (`useActiveModule`) nên dùng chung cho mọi phân hệ.
 * Dùng:   `page.tsx` của trang chủ phân hệ: `export default function Page() { return <ModuleHomeView />; }`.
 * Lưu ý:  thẻ là `<Link>` thật (mở tab mới được).
 */
export default function ModuleHomeView() {
  const t = useTranslations('shell.moduleHome');
  const { module, rootHref } = useActiveModule();
  if (!module) return null;

  const screens = (module.nav ?? []).filter((link) => link.href !== rootHref);
  const { pages, groups } = splitGroups(screens);
  const total =
    pages.length + groups.reduce((sum, group) => sum + (group.children?.length ?? 0), 0);

  const renderCard = (link: ModuleNavLink) => (
    <Link key={link.id} className={MODULE_HOME_CLASSES.card} href={link.href}>
      <AppTile icon={link.icon ?? module.icon} size="md" tone={module.tone} />
      <span className="flex min-w-0 flex-col gap-0.5">
        <span className={MODULE_HOME_CLASSES.cardTitle}>{link.title}</span>
        {link.description && (
          <span className={MODULE_HOME_CLASSES.cardDesc}>{link.description}</span>
        )}
      </span>
      <SystemIcon
        aria-hidden
        className={MODULE_HOME_CLASSES.cardArrow}
        name="arrow-right-outline"
        size={16}
      />
    </Link>
  );

  return (
    <PageShell>
      <PageBody>
        <section className={MODULE_HOME_CLASSES.hero}>
          <AppTile icon={module.icon} size="xl" tone={module.tone} />
          <div className={MODULE_HOME_CLASSES.heroText}>
            <h1 className={MODULE_HOME_CLASSES.heroTitle}>{module.title}</h1>
            {module.subtitle && (
              <p className={MODULE_HOME_CLASSES.heroSubtitle}>{module.subtitle}</p>
            )}
            <span className={MODULE_HOME_CLASSES.heroMeta}>
              {t('screenCount', { count: total })}
            </span>
          </div>
        </section>

        {pages.length > 0 && (
          <section aria-label={t('screens')} className={MODULE_HOME_CLASSES.group}>
            <h2 className={MODULE_HOME_CLASSES.groupLabel}>{t('screens')}</h2>
            <div className={MODULE_HOME_CLASSES.grid}>{pages.map(renderCard)}</div>
          </section>
        )}

        {groups.map((group) => (
          <section key={group.id} aria-label={group.title} className={MODULE_HOME_CLASSES.group}>
            <h2 className={MODULE_HOME_CLASSES.groupLabel}>{group.title}</h2>
            <div className={MODULE_HOME_CLASSES.grid}>{group.children?.map(renderCard)}</div>
          </section>
        ))}
      </PageBody>
    </PageShell>
  );
}
