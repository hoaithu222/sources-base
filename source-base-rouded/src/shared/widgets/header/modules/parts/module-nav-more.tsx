import { Fragment, memo, useCallback, useState } from 'react';
import { Link } from 'react-router-dom';

import { AppIcon, Popover } from '@/shared/ui';
import { SystemIcon } from '@/shared/ui/icons/Icons';
import { cn } from '@/shared/utils/style/cn';

import { MODULE_NAV_CLASSES } from '../module-nav.theme';
import type { HeaderNavItem } from '../module-nav.types';

interface ModuleNavMoreProps {
  items: readonly HeaderNavItem[];
}

/**
 * ModuleNavMore — nút "Thêm ▾" cuối rãnh màn hình khi thanh hết chỗ (mẫu priority+ của thanh công cụ macOS): các mục
 * không vừa dồn vào menu, mỗi dòng có icon; nhóm thành tiêu đề + mục con. Phần nội bộ của `ModuleNav`.
 *
 * @param props.items - Mục bị dồn (`HeaderNavItem[]`, đúng thứ tự trên thanh).
 *
 * @example
 * <ModuleNavMore items={items.slice(count)} />
 */
const ModuleNavMore = memo(function ModuleNavMore({ items }: ModuleNavMoreProps) {
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);

  const renderLink = (item: HeaderNavItem) => (
    <Link
      key={item.key}
      aria-current={item.active ? 'page' : undefined}
      className={cn(MODULE_NAV_CLASSES.menuLink, item.active && MODULE_NAV_CLASSES.menuLinkActive)}
      to={item.href}
      onClick={close}
      onFocus={item.onIntent}
      onPointerEnter={item.onIntent}
    >
      {item.icon && <AppIcon name={item.icon} size={16} />}
      {item.label}
    </Link>
  );

  const menu = (
    <nav aria-label="Màn hình khác" className={MODULE_NAV_CLASSES.menu}>
      {items.map((item) =>
        item.children ? (
          <Fragment key={item.key}>
            <span className={MODULE_NAV_CLASSES.menuLabel}>{item.label}</span>
            {item.children.map(renderLink)}
          </Fragment>
        ) : (
          renderLink(item)
        ),
      )}
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
        aria-label={`Thêm ${items.length} màn hình`}
        className={MODULE_NAV_CLASSES.link}
        type="button"
      >
        Thêm
        <SystemIcon className={MODULE_NAV_CLASSES.caret} name="angle-down-bold" />
      </button>
    </Popover>
  );
});

export default ModuleNavMore;
