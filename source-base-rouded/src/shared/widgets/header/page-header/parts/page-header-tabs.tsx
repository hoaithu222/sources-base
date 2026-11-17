import { memo } from 'react';
import type { KeyboardEvent } from 'react';

import { useFitCount } from '@/shared/hooks';
import { Tooltip } from '@/shared/ui';
import { SystemIcon } from '@/shared/ui/icons/Icons';
import { cn } from '@/shared/utils/style/cn';

import {
  HEADER_SIDE_SELECTOR,
  HEADER_SIDE_TRAY_CLASSES,
  type HeaderSide,
} from '../../header.theme';
import { MODULE_NAV_CLASSES } from '../../modules/module-nav.theme';
import { PAGE_HEADER_TAB_CLASSES, type PageHeaderTabsPlacement } from '../page-header.theme';
import type { PageHeaderNavConfig, PageHeaderNavItem } from '../page-header.types';
import NavElement from './nav-element';
import PageHeaderTabsMore from './page-header-tabs-more';

interface PageHeaderTabsProps {
  nav: PageHeaderNavConfig;
  placement: PageHeaderTabsPlacement;
  half?: HeaderSide;
}

/** Nửa tab của một bên khối tiêu đề: trái = nửa đầu (làm tròn lên), phải = phần còn lại; không `half` → đủ tab. */
function tabsOfHalf(items: readonly PageHeaderNavItem[], half?: HeaderSide) {
  if (!half) return items;
  const cut = Math.ceil(items.length / 2);
  return half === 'left' ? items.slice(0, cut) : items.slice(cut);
}

/** Nhãn theo chỗ đặt: trên thanh dùng nhãn đủ từ `wide`, nhãn gọn dưới đó; dải trong trang (< `xl`) luôn nhãn gọn. */
function TabLabel({
  item,
  placement,
}: {
  item: PageHeaderNavItem;
  placement: PageHeaderTabsPlacement;
}) {
  if (!item.shortLabel) return item.label;
  if (placement === 'page') return item.shortLabel;
  return (
    <>
      <span className="max-wide:hidden">{item.label}</span>
      <span className="wide:hidden">{item.shortLabel}</span>
    </>
  );
}

/** Tab vừa chỗ + tab bị dồn; tab ĐANG MỞ luôn ở lại thanh (đổi chỗ với tab vừa cuối cùng). */
function splitByFit(items: readonly PageHeaderNavItem[], active: string, count: number) {
  if (count >= items.length) return { shown: items, hidden: [] as PageHeaderNavItem[] };
  const activeIndex = items.findIndex((item) => item.key === active);
  if (activeIndex < count) return { shown: items.slice(0, count), hidden: items.slice(count) };
  const shown = [...items.slice(0, count - 1), items[activeIndex]];
  return { shown, hidden: items.filter((item) => !shown.includes(item)) };
}

/** ← / → chuyển tiêu điểm giữa các tab (vòng tròn) — không phải Tab qua từng mục mới tới tab cần. */
function moveFocus(e: KeyboardEvent<HTMLElement>) {
  if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
  const items = [
    ...e.currentTarget.querySelectorAll<HTMLElement>('a[href], button:not(:disabled)'),
  ];
  const index = items.indexOf(document.activeElement as HTMLElement);
  if (index < 0) return;
  e.preventDefault();
  const step = e.key === 'ArrowRight' ? 1 : -1;
  items[(index + step + items.length) % items.length].focus();
}

/**
 * PageHeaderTabs — nhóm tab của trang, hai chỗ đặt dùng chung dữ liệu: `bar` = TRÊN thanh header, chia ĐÔI ra hai bên khối
 * tiêu đề giữa (`half` trái / phải, máy tính ≥ `xl`; tab cong trong khay cong, đang mở = tab đặc) · `page` = dải gạch chân trong
 * luồng trang (dưới `xl`). Phần nội bộ của `PageHeader` (điện thoại dùng dải chip ở top bar).
 *
 * Lưu ý: tab có `href` → `<Link>` thật (`navigable-controls.md`); state tab sống trong `useState` là sai — đẩy lên URL.
 * Khoá cả cụm bằng `nav.disabled` (chip vẫn thấy, không bấm được). Thanh hết chỗ (`bar`): tab không vừa dồn vào nút
 * "Thêm ▾" (`useFitCount`), tab đang mở luôn ở lại; dải trong trang (`page`) cuộn ngang. ← / → đi giữa các tab.
 *
 * @param props.nav - `PageHeaderNavConfig`: `items`, `active`, `onSelect`, `actions?`, `disabled?`.
 * @param props.placement - `bar` (trên thanh header, ≥ `xl`) · `page` (dải trong trang, < `xl`).
 * @param props.half - Chỉ với `bar`: `left` = nửa đầu, `right` = nửa sau (+ action); bỏ trống → đủ tab.
 *
 * @example
 * <HeaderSlotPortal slot="tabsLeft"><PageHeaderTabs half="left" nav={nav} placement="bar" /></HeaderSlotPortal>
 * <PageHeaderTabs nav={nav} placement="page" />
 */
const PageHeaderTabs = memo(function PageHeaderTabs({ nav, placement, half }: PageHeaderTabsProps) {
  const classes = PAGE_HEADER_TAB_CLASSES[placement];
  const items = tabsOfHalf(nav.items, half);
  const actions = half === 'left' ? undefined : nav.actions;
  const { wrapperRef, measureRef, count } = useFitCount({
    itemCount: items.length,
    gap: 4,
    reserve: 6,
    hostSelector: HEADER_SIDE_SELECTOR[half ?? 'left'],
  });
  const isBar = placement === 'bar';
  if (items.length === 0 && !actions?.length) return null;
  const { shown, hidden } = splitByFit(items, nav.active, isBar ? count : items.length);

  const tabs = (
    <nav
      aria-label={half === 'right' ? 'Tab của trang (tiếp)' : 'Tab của trang'}
      className={cn(classes.root, isBar && half && HEADER_SIDE_TRAY_CLASSES[half])}
      data-placement={placement}
      onKeyDown={moveFocus}
    >
      <span className={classes.track}>
        {shown.map((item) => {
          const active = item.key === nav.active;
          return (
            <NavElement
              key={item.key}
              ariaCurrent={active}
              className={cn(classes.tab, active && classes.tabActive)}
              disabled={nav.disabled}
              href={item.href}
              onActivate={() => nav.onSelect(item.key)}
            >
              <TabLabel item={item} placement={placement} />
            </NavElement>
          );
        })}
        {hidden.length > 0 && <PageHeaderTabsMore items={hidden} nav={nav} />}
      </span>
      {actions?.map((action) => (
        <Tooltip key={action.key} arrow={false} content={action.label} side="bottom">
          <NavElement
            aria-label={action.label}
            className={classes.action}
            disabled={nav.disabled}
            href={action.href}
            newTab={action.newTab}
            onActivate={action.onSelect}
          >
            <SystemIcon name={action.icon} />
          </NavElement>
        </Tooltip>
      ))}
    </nav>
  );
  if (!isBar) return tabs;

  return (
    <div ref={wrapperRef} className={classes.fit}>
      {tabs}
      <div ref={measureRef} aria-hidden className={classes.measure} inert>
        {items.map((item) => (
          <span
            key={item.key}
            className={cn(classes.tab, item.key === nav.active && classes.tabActive)}
          >
            <TabLabel item={item} placement={placement} />
          </span>
        ))}
        <span className={classes.tab} data-fit-more>
          Thêm
          <SystemIcon className={MODULE_NAV_CLASSES.caret} name="angle-down-bold" />
        </span>
        {actions?.map((action) => (
          <span key={action.key} className={classes.action} data-fit-fixed>
            <SystemIcon name={action.icon} />
          </span>
        ))}
      </div>
    </div>
  );
});

export default PageHeaderTabs;
