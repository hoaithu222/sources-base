import { memo } from 'react';
import { Link } from 'react-router-dom';

import { Tooltip } from '@/shared/ui';
import { SystemIcon } from '@/shared/ui/icons/Icons';
import { cn } from '@/shared/utils/style/cn';

import {
  DOCK_ACTIVE_CLASSES,
  DOCK_ENTER_CLASS,
  DOCK_MAGNIFY_ITEM_CLASS,
  DOCK_SLOT_CLASSES,
  DOCK_SOFT_HOVER_CLASSES,
  dockEnterStyle,
} from '../dock.theme';
import type { DockItemConfig } from '../dock.types';

interface DockItemProps {
  item: DockItemConfig;
  active?: boolean;
  magnify?: boolean;
  enterDelayMs?: number;
  onSelect?: () => void;
}

/**
 * DockItem — một ô trong Dock: liên kết tới trang + tooltip tên mục. Phần nội bộ của `<Dock>`.
 *
 * Sửa giao diện: màu · cỡ ô → `DOCK_SLOT_CLASSES.item` · trạng thái đang mở → `DOCK_ACTIVE_CLASSES`.
 * Lưu ý: ⛔ Là `<Link to>` thật, KHÔNG `<button onClick={navigate}>` — để chuột phải / Ctrl+click mở được
 * tab mới (`navigable-controls.md`).
 *
 * @param props.item - Mục `{ id, label, icon, href, onIntent? }`; `onIntent` chạy khi rê chuột / focus vào ô.
 * @param props.active - Mục của trang đang mở (vạch sáng dưới chân + `aria-current`). Mặc định `false`.
 * @param props.magnify - Bật phóng lân cận (chỉ có tác dụng khi có con trỏ thật). Mặc định `false`.
 * @param props.enterDelayMs - Độ trễ (ms) của hiệu ứng bay vào khi thanh vừa bung. Mặc định `0`.
 * @param props.onSelect - Gọi SAU khi chọn mục (kể cả mục của trang đang mở); `Dock` dùng để đóng thanh
 *   tự ẩn.
 *
 * @example
 * <DockItem item={{ id: 'home', label: 'Trang chủ', icon: 'house-outline', href: '/' }} active />
 */
const DockItem = memo(function DockItem({
  item,
  active = false,
  magnify = false,
  enterDelayMs = 0,
  onSelect,
}: DockItemProps) {
  const itemClassName = cn(
    DOCK_SLOT_CLASSES.item,
    active && DOCK_ACTIVE_CLASSES.item,
    magnify ? DOCK_MAGNIFY_ITEM_CLASS : DOCK_SOFT_HOVER_CLASSES,
  );
  const glyphClassName = cn(
    DOCK_SLOT_CLASSES.glyph,
    active && DOCK_ACTIVE_CLASSES.glyph,
    DOCK_ENTER_CLASS,
  );

  return (
    <Tooltip
      arrow={false}
      className={DOCK_SLOT_CLASSES.tooltip}
      content={item.label}
      side="top"
      sideOffset={magnify ? 14 : 10}
    >
      <Link
        aria-current={active ? 'page' : undefined}
        aria-label={item.label}
        className={itemClassName}
        to={item.href}
        onClick={onSelect}
        onFocus={item.onIntent}
        onPointerEnter={item.onIntent}
      >
        <span className={glyphClassName} style={dockEnterStyle(enterDelayMs)}>
          <SystemIcon name={item.icon} size={22} />
        </span>
        {active && <span aria-hidden className={DOCK_SLOT_CLASSES.indicator} />}
      </Link>
    </Tooltip>
  );
});

export default DockItem;
