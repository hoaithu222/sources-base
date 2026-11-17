'use client';

import { memo } from 'react';
import { Link } from '@/core/i18n';

import { AppTile, Tooltip } from '@/shared/ui';
import { cn } from '@/shared/utils/style/cn';

import {
  DOCK_ENTER_CLASS,
  DOCK_MAGNIFY_ITEM_CLASS,
  DOCK_POPUP_SIDE,
  DOCK_POSITION_CLASSES,
  DOCK_SLOT_CLASSES,
  dockEnterStyle,
} from '../dock.theme';
import type { DockItemConfig, DockPosition } from '../dock.types';

interface DockItemProps {
  item: DockItemConfig;
  active?: boolean;
  magnify?: boolean;
  position?: DockPosition;
  enterDelayMs?: number;
  onSelect?: () => void;
}

/**
 * DockItem — một ô trong Dock: liên kết tới trang + ô icon `AppTile` theo tông + chấm "đang mở" kiểu macOS + tooltip
 * tên mục. Phần nội bộ của `<Dock>`.
 *
 * Sửa giao diện: khung bấm → `DOCK_SLOT_CLASSES.item` · chấm đang mở → `DOCK_SLOT_CLASSES.indicator` + vị trí theo cạnh
 * `DOCK_POSITION_CLASSES[position].indicator` · ô icon → `AppTile` (UI kit).
 * Lưu ý: ⛔ Là `<Link to>` thật, KHÔNG `<button onClick={navigate}>` — để chuột phải / Ctrl+click mở được
 * tab mới (`navigable-controls.md`). Tooltip bung về phía TRONG màn hình (`DOCK_POPUP_SIDE`).
 *
 * @param props.item - Mục `{ id, label, icon, tone?, href, onIntent? }`; `onIntent` chạy khi rê chuột / focus vào ô.
 * @param props.active - Mục của trang đang mở (chấm dưới chân + `aria-current`). Mặc định `false`.
 * @param props.magnify - Bật phóng lân cận (chỉ có tác dụng khi có con trỏ thật). Mặc định `false`.
 * @param props.position - Cạnh neo của Dock — quyết định hướng nhô, vị trí chấm, phía tooltip. Mặc định `bottom`.
 * @param props.enterDelayMs - Độ trễ (ms) của hiệu ứng bay vào khi thanh vừa bung. Mặc định `0`.
 * @param props.onSelect - Gọi SAU khi chọn mục (kể cả mục của trang đang mở); `Dock` dùng để đóng thanh tự ẩn.
 *
 * @example
 * <DockItem item={{ id: 'home', label: 'Trang chủ', icon: 'house-bold', href: '/' }} active />
 */
const DockItem = memo(function DockItem({
  item,
  active = false,
  magnify = false,
  position = 'bottom',
  enterDelayMs = 0,
  onSelect,
}: DockItemProps) {
  const sides = DOCK_POSITION_CLASSES[position];
  const itemClassName = cn(
    DOCK_SLOT_CLASSES.item,
    magnify ? DOCK_MAGNIFY_ITEM_CLASS : sides.softHover,
  );

  return (
    <Tooltip
      arrow={false}
      className={DOCK_SLOT_CLASSES.tooltip}
      content={item.label}
      side={DOCK_POPUP_SIDE[position]}
      sideOffset={magnify ? 12 : 10}
    >
      <Link
        aria-current={active ? 'page' : undefined}
        aria-label={item.label}
        className={itemClassName}
        href={item.href}
        onClick={onSelect}
        onFocus={item.onIntent}
        onPointerEnter={item.onIntent}
      >
        <span className={DOCK_ENTER_CLASS} style={dockEnterStyle(enterDelayMs)}>
          <AppTile icon={item.icon} size="lg" tone={item.tone} />
        </span>
        {active && (
          <span aria-hidden className={cn(DOCK_SLOT_CLASSES.indicator, sides.indicator)} />
        )}
      </Link>
    </Tooltip>
  );
});

export default DockItem;
