'use client';

import { useTranslations } from 'next-intl';

import { useAppMenu } from '@/app/_navigation';
import type { MenuItem, ModuleNavLink } from '@/app/_navigation';
import { appConfig } from '@/core/config';
import { Link } from '@/core/i18n';
import { PATHS } from '@/shared/constants/paths.constants';
import { AppIcon, AppTile, InsetGroup, InsetGroupRow, PageBody, PageShell } from '@/shared/ui';
import { cn } from '@/shared/utils/style/cn';
import { PageHeader } from '@/shared/widgets/header';
import { useWorkTabsStore } from '@/shared/widgets/work-tabs';

/** Số màn hình hiện thẳng trên thẻ phân hệ — còn lại qua "+N" (vào trang chủ phân hệ). */
const QUICK_SCREENS = 3;

const DASHBOARD_CLASSES = {
  layout: 'grid grid-cols-1 items-start gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]',
  column: 'flex min-w-0 flex-col gap-4',
  sectionLabel: 'px-1 text-body-14-semibold text-fg-heading',
  grid: 'grid grid-cols-1 gap-3 sm:grid-cols-2 2xl:grid-cols-3',
  card: cn(
    'rim-soft squircle flex min-w-0 flex-col gap-2 rounded-xl border border-border-default bg-bg-surface p-3 shadow-(--elev-1)',
    'transition-[border-color,box-shadow] duration-200 hover:border-border-strong hover:shadow-(--elev-2)',
  ),
  cardHead:
    'group/head flex min-w-0 items-center gap-3 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring-focus',
  cardTitle: 'truncate text-body-16-semibold text-fg-heading group-hover/head:text-link',
  cardSubtitle: 'line-clamp-1 text-caption-12 text-fg-muted',
  chips: 'flex flex-wrap gap-1.5',
  chip: cn(
    'inline-flex h-7 items-center gap-1.5 rounded-full bg-bg-subtle px-2.5 outline-none',
    'text-caption-12-medium text-fg-body transition-colors duration-150',
    'hover:bg-bg-nav-hover hover:text-link focus-visible:ring-2 focus-visible:ring-ring-focus',
  ),
  more: 'text-fg-muted',
  code: 'rounded-xs bg-bg-subtle px-1 font-mono text-caption-12 text-fg-subheading',
} satisfies Record<string, string>;

/** Màn hình lá của phân hệ (bỏ trang chủ phân hệ), nhóm trải phẳng. */
const leavesOf = (module: MenuItem): ModuleNavLink[] =>
  (module.nav ?? [])
    .flatMap((link) => link.children ?? [link])
    .filter((link) => link.href !== module.href);

function ModuleCard({ module }: { module: MenuItem }) {
  const screens = leavesOf(module);
  const rest = screens.length - QUICK_SCREENS;
  return (
    <section aria-label={module.title} className={DASHBOARD_CLASSES.card}>
      <Link className={DASHBOARD_CLASSES.cardHead} href={module.href}>
        <AppTile icon={module.icon} size="md" tone={module.tone} />
        <span className="flex min-w-0 flex-col">
          <span className={DASHBOARD_CLASSES.cardTitle}>{module.title}</span>
          {module.subtitle && (
            <span className={DASHBOARD_CLASSES.cardSubtitle}>{module.subtitle}</span>
          )}
        </span>
      </Link>
      {screens.length > 0 && (
        <div className={DASHBOARD_CLASSES.chips}>
          {screens.slice(0, QUICK_SCREENS).map((screen) => (
            <Link key={screen.id} className={DASHBOARD_CLASSES.chip} href={screen.href}>
              <AppIcon name={screen.icon ?? module.icon} size={14} />
              {screen.title}
            </Link>
          ))}
          {rest > 0 && (
            <Link className={cn(DASHBOARD_CLASSES.chip, DASHBOARD_CLASSES.more)} href={module.href}>
              +{rest}
            </Link>
          )}
        </div>
      )}
    </section>
  );
}

/**
 * DashboardView — BÀN LÀM VIỆC (工作台 kiểu ERP Kingdee / Yonyou): mọi phân hệ thành thẻ, mỗi thẻ có lối tắt tới các màn chính
 * (một chạm tới chức năng, không phải mở phân hệ rồi tìm) · "Mở gần đây" lấy từ dải thẻ làm việc · "Bắt đầu" cho người
 * dựng dự án từ base. Dữ liệu từ menu đã dịch + lọc quyền (`useAppMenu`) nên thêm phân hệ là bàn làm việc tự có thẻ.
 * Lưu ý: route `/dashboard` — chỉ ghép, chữ ở `messages/<locale>/shell.json` (`dashboard`).
 */
export default function DashboardView() {
  const t = useTranslations('shell.dashboard');
  const { modules } = useAppMenu();
  const recent = useWorkTabsStore((state) => state.tabs)
    .slice(-6)
    .reverse();

  return (
    <PageShell variant="flow">
      <PageHeader subtitle={t('subtitle')} title={t('title')} tone="teal" />
      <PageBody>
        <div className={DASHBOARD_CLASSES.layout}>
          <div className={DASHBOARD_CLASSES.column}>
            <h2 className={DASHBOARD_CLASSES.sectionLabel}>{t('modules')}</h2>
            <div className={DASHBOARD_CLASSES.grid}>
              {modules.map((module) => (
                <ModuleCard key={module.id} module={module} />
              ))}
            </div>
          </div>

          <div className={DASHBOARD_CLASSES.column}>
            <InsetGroup
              description={recent.length === 0 ? t('recentEmpty') : undefined}
              title={t('recent')}
            >
              {recent.map((tab) => (
                <InsetGroupRow
                  key={tab.path}
                  description={tab.fullTitle}
                  href={tab.path + tab.search}
                  icon={tab.icon}
                  title={tab.title}
                  tone={tab.tone}
                />
              ))}
            </InsetGroup>

            <InsetGroup surface="sunken" title={t('start.title')}>
              <InsetGroupRow
                description={
                  <code className={DASHBOARD_CLASSES.code}>
                    src/app/_navigation/navigation.config.ts
                  </code>
                }
                icon="add-doc"
                title={t('start.declare')}
              />
              <InsetGroupRow
                description={t('start.autoDescription')}
                icon="apps"
                title={t('start.auto')}
                tone="purple"
              />
              {appConfig.isDemo && (
                <InsetGroupRow
                  description={t('start.libraryDescription')}
                  href={PATHS.DEMO}
                  icon="overview"
                  title={t('start.library')}
                  tone="blue"
                />
              )}
            </InsetGroup>
          </div>
        </div>
      </PageBody>
    </PageShell>
  );
}
