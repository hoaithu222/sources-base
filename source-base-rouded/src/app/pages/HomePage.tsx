import { Link } from 'react-router-dom';

import { useAppMenu, type MenuItem, type ModuleNavLink } from '@/app/router/menu';
import { getRoutePath } from '@/app/router/modules';
import { AppIcon, AppTile, InsetGroup, InsetGroupRow, PageBody, PageShell } from '@/shared/ui';
import { cn } from '@/shared/utils/style/cn';
import { PageHeader } from '@/shared/widgets/header';
import { useWorkTabsStore } from '@/shared/widgets/work-tabs';

/** Số màn hình hiện thẳng trên thẻ phân hệ — còn lại qua "+N" (vào trang chủ phân hệ). */
const QUICK_SCREENS = 3;

const HOME_CLASSES = {
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
    <section aria-label={module.title} className={HOME_CLASSES.card}>
      <Link
        className={HOME_CLASSES.cardHead}
        to={module.href}
        onFocus={module.preload}
        onPointerEnter={module.preload}
      >
        <AppTile icon={module.icon} size="md" tone={module.tone} />
        <span className="flex min-w-0 flex-col">
          <span className={HOME_CLASSES.cardTitle}>{module.title}</span>
          {module.subtitle && <span className={HOME_CLASSES.cardSubtitle}>{module.subtitle}</span>}
        </span>
      </Link>
      {screens.length > 0 && (
        <div className={HOME_CLASSES.chips}>
          {screens.slice(0, QUICK_SCREENS).map((screen) => (
            <Link
              key={screen.id}
              className={HOME_CLASSES.chip}
              to={screen.href}
              onFocus={screen.preload}
              onPointerEnter={screen.preload}
            >
              <AppIcon name={screen.icon ?? module.icon} size={14} />
              {screen.title}
            </Link>
          ))}
          {rest > 0 && (
            <Link className={cn(HOME_CLASSES.chip, HOME_CLASSES.more)} to={module.href}>
              +{rest}
            </Link>
          )}
        </div>
      )}
    </section>
  );
}

/**
 * HomePage — BÀN LÀM VIỆC (工作台 kiểu ERP Kingdee / Yonyou): mọi phân hệ thành thẻ, mỗi thẻ có lối tắt tới các màn chính
 * (một chạm tới chức năng, không phải mở phân hệ rồi tìm) · "Mở gần đây" lấy từ dải thẻ làm việc · "Bắt đầu" cho người
 * dựng dự án từ base. Dữ liệu từ menu đã lọc quyền (`useAppMenu`) nên thêm phân hệ là bàn làm việc tự có thẻ.
 */
function HomePage() {
  const { modules } = useAppMenu();
  const recent = useWorkTabsStore((state) => state.tabs)
    .slice(-6)
    .reverse();
  const demoPath = getRoutePath('demo');

  return (
    <PageShell variant="flow">
      <PageHeader subtitle="Phân hệ · mở gần đây" title="Bàn làm việc" tone="teal" />
      <PageBody>
        <div className={HOME_CLASSES.layout}>
          <div className={HOME_CLASSES.column}>
            <h2 className={HOME_CLASSES.sectionLabel}>Phân hệ</h2>
            <div className={HOME_CLASSES.grid}>
              {modules.map((module) => (
                <ModuleCard key={module.id} module={module} />
              ))}
            </div>
          </div>

          <div className={HOME_CLASSES.column}>
            <InsetGroup
              description={
                recent.length === 0
                  ? 'Màn hình bạn mở sẽ hiện ở đây — một chạm quay lại.'
                  : undefined
              }
              title="Mở gần đây"
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

            <InsetGroup surface="sunken" title="Bắt đầu với base">
              <InsetGroupRow
                description={
                  <code className={HOME_CLASSES.code}>
                    src/app/router/modules/module-registry.ts
                  </code>
                }
                icon="add-doc"
                title="Khai báo phân hệ"
              />
              <InsetGroupRow
                description="Router, header, Dock, bảng lệnh và bàn làm việc cùng đọc danh sách đó"
                icon="apps"
                title="Route, menu, quyền tự dựng"
                tone="purple"
              />
              {demoPath && (
                <InsetGroupRow
                  description="Chọn đúng mảnh UI kit để ghép màn hình"
                  href={demoPath}
                  icon="overview"
                  title="Thư viện giao diện"
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

export default HomePage;
