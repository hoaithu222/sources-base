import { memo } from 'react';
import type { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';

import { useIsCoarsePointer } from '@/shared/hooks';
import { cn } from '@/shared/utils/style/cn';

import './dock-magnify.css';
import { useDockSettingsStore } from './dock-settings.store';
import {
  DOCK_DURATION,
  DOCK_ENTER_CLASS,
  DOCK_HINT_CLASS,
  DOCK_MAGNIFY_CONTAINER_CLASS,
  DOCK_ROOT_STATE_CLASSES,
  DOCK_SLOT_CLASSES,
  dockEnterStyle,
} from './dock.theme';
import type { DockDisplayMode, DockItemConfig } from './dock.types';
import DockItem from './parts/dock-item';
import DockSettingsButton from './parts/dock-settings-button';
import { useDockReveal } from './useDockReveal';

interface DockProps {
  items?: readonly DockItemConfig[];
  trailing?: ReactNode;
  className?: string;
}

const HANDLE_DOT_KEYS = ['start', 'middle', 'end'] as const;

const DIVIDER_CLASSES = cn(DOCK_SLOT_CLASSES.divider, DOCK_ENTER_CLASS);

function isActivePath(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function distanceFromCenter(index: number, total: number): number {
  return Math.round(Math.abs(index - (total - 1) / 2));
}

function isEdgeTriggered(mode: DockDisplayMode): boolean {
  return mode === 'autohide' || mode === 'hidden';
}

const DockHandle = memo(function DockHandle({ onClick }: { onClick: () => void }) {
  return (
    <button
      aria-expanded={false}
      aria-label="Mở rộng Dock"
      className={DOCK_SLOT_CLASSES.handle}
      type="button"
      onClick={onClick}
    >
      {HANDLE_DOT_KEYS.map((key) => (
        <span key={key} aria-hidden className={DOCK_SLOT_CLASSES.handleDot} />
      ))}
    </button>
  );
});

/**
 * Dock — thanh launcher kiểu macOS neo đáy màn hình. Mục đi vào qua prop `items`; widget KHÔNG đọc
 * registry module nào (tầng `app/shell/AppDock.tsx` dựng danh sách).
 *
 * Chế độ hiển thị (`pinned` mặc định | `collapsed` | `autohide` | `hidden`) + phóng lân cận nằm ở store cục
 * bộ `dock-settings.store` — người dùng đổi bằng nút bánh răng trên thanh, KHÔNG truyền qua prop. Mục đang
 * mở: `pathname` khớp chính xác hoặc theo tiền tố phân đoạn (`/a` khớp `/a/b`, KHÔNG khớp `/ab`).
 * Sửa giao diện: class → `dock.theme.ts` · pha hiện / ẩn + theo dõi con trỏ → `useDockReveal.ts`.
 * Lưu ý: ⛔ Máy chạm luôn vẽ `pinned` (chỉ ghi đè giá trị vẽ, không ghi ngược vào store). ⛔ Neo đáy qua
 * `DOCK_BOTTOM_CLASS` (có `--safe-b`); chật chỗ thì cuộn ngang, không ẩn mục. Dock luôn `fixed` NỔI ĐÈ lên
 * `<main>` ở mọi chế độ (kể cả `pinned`) — không chừa chỗ trong luồng, để `<main>` luôn full height.
 *
 * @param props.items - Các mục `DockItemConfig` (`id`, `label`, `icon`, `href`, `onIntent?` — gọi khi rê chuột /
 *   focus vào mục, vd nạp trước trang đích). Rỗng / thiếu → `null`.
 * @param props.trailing - Node phụ đặt sau vạch ngăn, TRƯỚC nút cài đặt (trợ lý, lối tắt riêng…).
 * @param props.className - Class thêm cho `<nav>`.
 *
 * @example
 * <Dock items={[{ id: 'home', label: 'Trang chủ', icon: 'house-outline', href: '/' }]} />
 */
const Dock = memo(function Dock({ items, trailing, className }: DockProps) {
  const { pathname } = useLocation();

  const storedMode = useDockSettingsStore((s) => s.mode);
  const magnify = useDockSettingsStore((s) => s.magnify);

  const isCoarsePointer = useIsCoarsePointer();
  const mode: DockDisplayMode = isCoarsePointer ? 'pinned' : storedMode;
  const edgeTriggered = isEdgeTriggered(mode);

  const { navRef, phase, settingsOpen, revealNow, conceal, concealNow, handleSettingsOpenChange } =
    useDockReveal({ edgeTriggered, itemCount: items?.length });

  if (!items?.length) return null;

  const expanded = mode === 'pinned' || settingsOpen || phase !== 'stowed';
  const collapsed = mode === 'collapsed' && !expanded;
  const concealed = edgeTriggered && !expanded;

  const rootClassName = cn(
    DOCK_SLOT_CLASSES.root,
    collapsed && DOCK_ROOT_STATE_CLASSES.collapsed,
    concealed && DOCK_ROOT_STATE_CLASSES.concealed,
    magnify && DOCK_MAGNIFY_CONTAINER_CLASS,
    className,
  );

  const tailIndex = Math.floor(items.length / 2);

  return (
    <>
      {mode === 'autohide' && (
        <span
          aria-hidden
          className={DOCK_HINT_CLASS}
          data-hint-visible={concealed ? 'true' : 'false'}
        />
      )}

      <nav
        ref={navRef}
        aria-label="Dock"
        className={rootClassName}
        data-dock-state={phase}
        onMouseEnter={mode === 'collapsed' ? revealNow : undefined}
        onMouseLeave={mode === 'collapsed' ? conceal : undefined}
      >
        {collapsed ? (
          <DockHandle onClick={revealNow} />
        ) : (
          <>
            {items.map((item, idx) => (
              <DockItem
                key={item.id}
                active={isActivePath(pathname, item.href)}
                enterDelayMs={distanceFromCenter(idx, items.length) * DOCK_DURATION.iconStagger}
                item={item}
                magnify={magnify}
                onSelect={edgeTriggered ? concealNow : undefined}
              />
            ))}

            <span
              aria-hidden
              className={DIVIDER_CLASSES}
              style={dockEnterStyle((tailIndex + 1) * DOCK_DURATION.iconStagger)}
            />

            {trailing}

            <DockSettingsButton
              enterDelayMs={(tailIndex + 2) * DOCK_DURATION.iconStagger}
              mode={mode}
              modeLocked={isCoarsePointer}
              open={settingsOpen}
              onOpenChange={handleSettingsOpenChange}
            />
          </>
        )}
      </nav>
    </>
  );
});

export default Dock;
