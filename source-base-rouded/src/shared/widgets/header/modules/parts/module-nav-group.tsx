import { memo, useCallback, useState } from 'react';
import { Link } from 'react-router-dom';

import { AppIcon, Popover } from '@/shared/ui';
import { SystemIcon } from '@/shared/ui/icons/Icons';
import { cn } from '@/shared/utils/style/cn';

import { MODULE_NAV_CLASSES } from '../module-nav.theme';
import type { HeaderNavItem } from '../module-nav.types';

/**
 * ModuleNavGroup — một NHÓM trên dải điều hướng phân hệ: nút có mũi tên mở menu thả xuống liệt kê trang con (mỗi dòng
 * là `<Link>` thật). Phần nội bộ của `ModuleNav`.
 *
 * Lưu ý: nút nhóm sáng (`linkActive`) khi một trang con đang mở; bấm một dòng thì đóng menu.
 *
 * @param props.item - Mục nhóm (`HeaderNavItem` có `children`).
 *
 * @example
 * <ModuleNavGroup item={{ key: 'bao-cao', label: 'Báo cáo', href: '/bao-cao/a', children: [...] }} />
 */
const ModuleNavGroup = memo(function ModuleNavGroup({ item }: { item: HeaderNavItem }) {
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);

  const menu = (
    <nav aria-label={item.label} className={MODULE_NAV_CLASSES.menu}>
      {item.children?.map((child) => (
        <Link
          key={child.key}
          aria-current={child.active ? 'page' : undefined}
          className={cn(
            MODULE_NAV_CLASSES.menuLink,
            child.active && MODULE_NAV_CLASSES.menuLinkActive,
          )}
          to={child.href}
          onClick={close}
          onFocus={child.onIntent}
          onPointerEnter={child.onIntent}
        >
          {child.icon && <AppIcon name={child.icon} size={16} />}
          {child.label}
        </Link>
      ))}
    </nav>
  );

  return (
    <Popover
      align="start"
      content={menu}
      open={open}
      side="bottom"
      sideOffset={6}
      onOpenChange={setOpen}
    >
      <button
        aria-haspopup="menu"
        className={cn(MODULE_NAV_CLASSES.link, item.active && MODULE_NAV_CLASSES.linkActive)}
        type="button"
      >
        {item.label}
        <SystemIcon className={MODULE_NAV_CLASSES.caret} name="angle-down-bold" />
      </button>
    </Popover>
  );
});

export default ModuleNavGroup;
