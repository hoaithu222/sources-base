'use client';

import { memo } from 'react';
import type { ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import { usePathname } from '@/core/i18n';

import { useIsCoarsePointer } from '@/shared/hooks';
import { cn } from '@/shared/utils/style/cn';

import './dock-magnify.css';
import { useDockSettingsStore } from './dock-settings.store';
import {
  DOCK_DIVIDER_CLASS,
  DOCK_DURATION,
  DOCK_ENTER_CLASS,
  DOCK_HINT_CLASS,
  DOCK_MAGNIFY_CONTAINER_CLASS,
  DOCK_POSITION_CLASSES,
  DOCK_SLOT_CLASSES,
  dockEnterStyle,
} from './dock.theme';
import type { DockDisplayMode, DockItemConfig, DockPosition } from './dock.types';
import DockItem from './parts/dock-item';
import { useDockMagnify } from './hooks/useDockMagnify';
import { useDockReveal } from './hooks/useDockReveal';
import DockSettingsButton from './parts/dock-settings-button';

interface DockProps {
  items?: readonly DockItemConfig[];
  trailing?: ReactNode;
  className?: string;
}

const HANDLE_DOT_KEYS = ['start', 'middle', 'end'] as const;

function isActivePath(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function distanceFromCenter(index: number, total: number): number {
  return Math.round(Math.abs(index - (total - 1) / 2));
}

function isEdgeTriggered(mode: DockDisplayMode): boolean {
  return mode === 'autohide' || mode === 'hidden';
}

const DockHandle = memo(function DockHandle({
  position,
  onClick,
}: {
  position: DockPosition;
  onClick: () => void;
}) {
  const t = useTranslations('ui.widgets');

  return (
    <button
      aria-expanded={false}
      aria-label={t('dock.expand')}
      className={cn(
        'flex shrink-0 cursor-pointer items-center gap-1 rounded-full p-1 outline-none',
        'focus-visible:ring-2 focus-visible:ring-ring-focus',
        DOCK_POSITION_CLASSES[position].handle,
      )}
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
 * Dock — thanh launcher kiểu macOS: kính mờ, ô icon `AppTile` theo tông phân hệ, phóng lân cận, neo ĐÁY · TRÁI · PHẢI
 * màn hình. Mục đi vào qua prop `items`; widget KHÔNG đọc registry module nào (tầng `app/shell/AppDock.tsx` dựng).
 *
 * Chế độ hiển thị (`pinned` mặc định | `collapsed` | `autohide` | `hidden`), cạnh neo và phóng lân cận nằm ở store cục
 * bộ `dock-settings.store` — người dùng đổi bằng nút bánh răng trên thanh, KHÔNG truyền qua prop. Mục đang mở:
 * `pathname` khớp chính xác hoặc theo tiền tố phân đoạn (`/a` khớp `/a/b`, KHÔNG khớp `/ab`).
 * Sửa giao diện: class → `dock.theme.ts` (theo cạnh: `DOCK_POSITION_CLASSES`) · pha hiện / ẩn → `hooks/useDockReveal.ts`
 * · phóng lân cận (liên tục theo con trỏ, ô kề nhường chỗ) → `hooks/useDockMagnify.ts` + `dock-magnify.css`.
 * Lưu ý: ⛔ Máy chạm luôn vẽ `pinned` (chỉ ghi đè giá trị vẽ, không ghi ngược vào store). Dock `fixed`; khi GHIM,
 * `AppShellLayout` chừa chỗ ở cạnh neo (`useDockReserveClass`) để bảng / form không chui dưới Dock như cửa sổ macOS.
 *
 * @param props.items - Các mục `DockItemConfig` (`id`, `label`, `icon`, `tone?`, `href`, `onIntent?`). Rỗng / thiếu → `null`.
 * @param props.trailing - Node phụ đặt sau vạch ngăn, TRƯỚC nút cài đặt (trợ lý, lối tắt riêng…).
 * @param props.className - Class thêm cho `<nav>`.
 *
 * @example
 * <Dock items={[{ id: 'home', label: 'Trang chủ', icon: 'house-bold', tone: 'primary', href: '/' }]} />
 */
const Dock = memo(function Dock({ items, trailing, className }: DockProps) {
  const t = useTranslations('ui.widgets');
  const pathname = usePathname();

  const storedMode = useDockSettingsStore((s) => s.mode);
  const magnify = useDockSettingsStore((s) => s.magnify);
  const position = useDockSettingsStore((s) => s.position);

  const isCoarsePointer = useIsCoarsePointer();
  const mode: DockDisplayMode = isCoarsePointer ? 'pinned' : storedMode;
  const edgeTriggered = isEdgeTriggered(mode);

  const { navRef, phase, settingsOpen, revealNow, conceal, concealNow, handleSettingsOpenChange } =
    useDockReveal({ edgeTriggered, itemCount: items?.length, position });

  const expanded = mode === 'pinned' || settingsOpen || phase !== 'stowed';
  const collapsed = mode === 'collapsed' && !expanded;
  useDockMagnify({
    navRef,
    enabled: magnify && Boolean(items?.length) && !collapsed && !isCoarsePointer,
    frozen: settingsOpen,
    position,
  });

  if (!items?.length) return null;

  const concealed = edgeTriggered && !expanded;
  const sides = DOCK_POSITION_CLASSES[position];

  const rootClassName = cn(
    DOCK_SLOT_CLASSES.root,
    sides.root,
    collapsed && sides.collapsed,
    concealed && sides.concealed,
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
          data-position={position}
        />
      )}

      <nav
        ref={navRef}
        aria-label={t('dock.navLabel')}
        className={rootClassName}
        data-dock-position={position}
        data-dock-state={phase}
        onMouseEnter={mode === 'collapsed' ? revealNow : undefined}
        onMouseLeave={mode === 'collapsed' ? conceal : undefined}
      >
        {collapsed ? (
          <DockHandle position={position} onClick={revealNow} />
        ) : (
          <>
            {items.map((item, idx) => (
              <DockItem
                key={item.id}
                active={isActivePath(pathname, item.href)}
                enterDelayMs={distanceFromCenter(idx, items.length) * DOCK_DURATION.iconStagger}
                item={item}
                magnify={magnify}
                position={position}
                onSelect={edgeTriggered ? concealNow : undefined}
              />
            ))}

            <span
              aria-hidden
              className={cn(DOCK_DIVIDER_CLASS, sides.divider, DOCK_ENTER_CLASS)}
              style={dockEnterStyle((tailIndex + 1) * DOCK_DURATION.iconStagger)}
            />

            {trailing}

            <DockSettingsButton
              enterDelayMs={(tailIndex + 2) * DOCK_DURATION.iconStagger}
              mode={mode}
              modeLocked={isCoarsePointer}
              open={settingsOpen}
              position={position}
              onOpenChange={handleSettingsOpenChange}
            />
          </>
        )}
      </nav>
    </>
  );
});

export default Dock;
