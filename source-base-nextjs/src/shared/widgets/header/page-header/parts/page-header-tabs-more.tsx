'use client';

import { memo, useState } from 'react';
import { useTranslations } from 'next-intl';

import { Popover } from '@/shared/ui';
import { SystemIcon } from '@/shared/ui/icons/Icons';
import { cn } from '@/shared/utils/style/cn';

import { MODULE_NAV_CLASSES } from '../../modules/module-nav.theme';
import { PAGE_HEADER_TAB_CLASSES } from '../page-header.theme';
import type { PageHeaderNavConfig, PageHeaderNavItem } from '../page-header.types';
import NavElement from './nav-element';

interface PageHeaderTabsMoreProps {
  items: readonly PageHeaderNavItem[];
  nav: PageHeaderNavConfig;
}

/**
 * PageHeaderTabsMore — nút "Thêm ▾" cuối nhóm tab trên thanh header khi hết chỗ: tab không vừa dồn vào menu (tab có
 * `href` vẫn là `<a>` thật). Phần nội bộ của `PageHeaderTabs` (chỉ bản `bar`).
 *
 * @param props.items - Tab bị dồn, đúng thứ tự.
 * @param props.nav - Cấu hình tab của trang (`active`, `onSelect`, `disabled`).
 *
 * @example
 * <PageHeaderTabsMore items={hidden} nav={nav} />
 */
const PageHeaderTabsMore = memo(function PageHeaderTabsMore({
  items,
  nav,
}: PageHeaderTabsMoreProps) {
  const t = useTranslations('ui.widgets');
  const tc = useTranslations('ui.common');
  const [open, setOpen] = useState(false);

  const menu = (
    <nav aria-label={t('pageHeader.moreTabsMenuLabel')} className={MODULE_NAV_CLASSES.menu}>
      {items.map((item) => {
        const active = item.key === nav.active;
        return (
          <NavElement
            key={item.key}
            ariaCurrent={active}
            className={cn(MODULE_NAV_CLASSES.menuLink, active && MODULE_NAV_CLASSES.menuLinkActive)}
            disabled={nav.disabled}
            href={item.href}
            onActivate={() => {
              setOpen(false);
              nav.onSelect(item.key);
            }}
          >
            {item.label}
          </NavElement>
        );
      })}
    </nav>
  );

  return (
    <Popover
      align="end"
      content={menu}
      open={open}
      side="bottom"
      sideOffset={6}
      onOpenChange={setOpen}
    >
      <button
        aria-haspopup="menu"
        aria-label={t('pageHeader.moreTabsLabel', { count: items.length })}
        className={PAGE_HEADER_TAB_CLASSES.bar.tab}
        disabled={nav.disabled}
        type="button"
      >
        {tc('more')}
        <SystemIcon className={MODULE_NAV_CLASSES.caret} name="angle-down-bold" />
      </button>
    </Popover>
  );
});

export default PageHeaderTabsMore;
