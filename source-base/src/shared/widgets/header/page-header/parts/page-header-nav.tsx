import { memo, useCallback } from 'react';

import { cn } from '@/shared/utils/style/cn';

import {
  PAGE_HEADER_NAV_SLANT,
  PAGE_HEADER_SIDE_CLASSES,
  PAGE_HEADER_SLOT_CLASSES,
  type PageHeaderSide,
} from '../page-header.theme';
import { PAGE_NAV_SLOT_CLASSES, type PageHeaderChipSlant } from '../page-nav.theme';
import type { PageHeaderNavAction, PageHeaderNavItem } from '../page-header.types';
import PageHeaderChip from './chip/page-header-chip';
import NavShelf from './nav-shelf';

interface PageHeaderNavProps {
  side: PageHeaderSide;
  items: readonly PageHeaderNavItem[];
  active: string;
  onSelect: (key: string) => void;
  actions?: readonly PageHeaderNavAction[];
  disabled?: boolean;
}

interface NavChipProps {
  item: PageHeaderNavItem;
  active: boolean;
  slant: PageHeaderChipSlant;
  disabled?: boolean;
  onSelect: (key: string) => void;
}

const NavChip = memo(function NavChip({ item, active, slant, disabled, onSelect }: NavChipProps) {
  const handleSelect = useCallback(() => onSelect(item.key), [item.key, onSelect]);

  return (
    <PageHeaderChip
      active={active}
      current={active}
      disabled={disabled}
      href={item.href}
      label={item.label}
      shortLabel={item.shortLabel}
      slant={slant}
      onSelect={handleSelect}
    />
  );
});

/**
 * PageHeaderNav — MỘT ô nav cạnh bảng tên (trái hoặc phải): dải chip tab + action icon-only đứng sau chip
 * cuối. Phần nội bộ của `PageHeader` (nó chia `nav.items` làm hai ô).
 *
 * Ô LUÔN render (kể cả rỗng) để hai ô `flex-1 basis-0` giữ bảng tên đúng tâm; dải chip chỉ render khi có
 * tab hoặc action. Chip nghiêng VỀ PHÍA bảng tên (`PAGE_HEADER_NAV_SLANT[side]`).
 * Sửa giao diện: ô → `PAGE_HEADER_SLOT_CLASSES.navCell` + `PAGE_HEADER_SIDE_CLASSES[side].navCell`
 * · dải chip → `PAGE_NAV_SLOT_CLASSES.root`. Tab cao TRỌN thanh, cùng trục với bảng tên (không có máng nền sau tab).
 * Họ kiểu khung "khay" (`HEADER_SKIN_SPECS[skin].nav.shelf`): dải chip có thêm thanh khay (`NavShelf`) phủ trên đầu chip — dài đúng
 * bề ngang dải, nên nhiều tab thì dài.
 *
 * @param props.side - Vị trí ô: `left` (trái bảng tên) | `right` (phải bảng tên).
 * @param props.items - Tab của ô này (đã cắt từ `nav.items`).
 * @param props.active - `key` của tab đang mở.
 * @param props.onSelect - Gọi với `key` của tab vừa bấm.
 * @param props.actions - Action icon-only đứng sau chip cuối (chỉ một trong hai ô nhận).
 * @param props.disabled - Khoá cả dải.
 *
 * @example
 * <PageHeaderNav side="left" items={items} active={tab} onSelect={setTab} />
 */
const PageHeaderNav = memo(function PageHeaderNav({
  side,
  items,
  active,
  onSelect,
  actions,
  disabled,
}: PageHeaderNavProps) {
  const slant = PAGE_HEADER_NAV_SLANT[side];
  const hasChips = items.length > 0 || (actions?.length ?? 0) > 0;
  const sideClasses = PAGE_HEADER_SIDE_CLASSES[side];
  const cellClassName = cn(PAGE_HEADER_SLOT_CLASSES.navCell, sideClasses.navCell);

  return (
    <span className={cellClassName}>
      {hasChips && (
        <span className={PAGE_NAV_SLOT_CLASSES.root}>
          {items.map((item) => (
            <NavChip
              key={item.key}
              active={item.key === active}
              disabled={disabled}
              item={item}
              slant={slant}
              onSelect={onSelect}
            />
          ))}
          {actions?.map((action) => (
            <PageHeaderChip
              key={action.key}
              disabled={disabled}
              href={action.href}
              icon={action.icon}
              newTab={action.newTab}
              slant={slant}
              tooltip={action.label}
              onSelect={action.onSelect}
            />
          ))}
          <NavShelf side={side} slant={slant} />
        </span>
      )}
    </span>
  );
});

export default PageHeaderNav;
