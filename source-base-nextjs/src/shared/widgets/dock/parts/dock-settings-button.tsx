'use client';

import { memo } from 'react';
import { useTranslations } from 'next-intl';

import { AppTile, Popover } from '@/shared/ui';
import { cn } from '@/shared/utils/style/cn';

import {
  DOCK_ENTER_CLASS,
  DOCK_MAGNIFY_ITEM_CLASS,
  DOCK_POPUP_SIDE,
  dockEnterStyle,
} from '../dock.theme';
import type { DockPosition } from '../dock.types';
import DockSettingsPanel, { type DockSettingsPanelProps } from './dock-settings-panel';
import {
  DOCK_SETTINGS_SLOT_CLASSES,
  DOCK_SETTINGS_TRIGGER_OPEN_CLASSES,
} from '../dock-settings.theme';

interface DockSettingsButtonProps extends DockSettingsPanelProps {
  open: boolean;
  position?: DockPosition;
  enterDelayMs?: number;
  onOpenChange: (open: boolean) => void;
}

/**
 * DockSettingsButton — ô "Tuỳ chỉnh Dock" cuối thanh (như ô Thùng rác của macOS) + panel cấu hình (`Popover` của UI kit).
 * Phần nội bộ của `<Dock>`.
 *
 * Sửa giao diện: nút → `DOCK_SETTINGS_SLOT_CLASSES.trigger` · panel → `dock-settings-panel.tsx`.
 * Lưu ý: `open` do `Dock` giữ (qua `useDockReveal`) để thanh tự ẩn không thu lại khi panel đang mở. Panel bung về
 * phía TRONG màn hình theo cạnh neo (`DOCK_POPUP_SIDE`). Nút PHÓNG như mục (`DOCK_MAGNIFY_ITEM_CLASS`); panel mở thì
 * `useDockMagnify` giữ nguyên độ phóng để mũi tên popover không lệch khỏi nút.
 *
 * @param props.mode - Chế độ đang hiệu lực, chuyển cho panel.
 * @param props.modeLocked - Khoá phần chọn chế độ (máy chạm). Mặc định `false`.
 * @param props.open - Panel đang mở.
 * @param props.position - Cạnh neo hiện tại — quyết định phía bung panel. Mặc định `bottom`.
 * @param props.enterDelayMs - Độ trễ (ms) của hiệu ứng bay vào; `Dock` truyền để nút vào SAU CÙNG. Mặc định `0`.
 * @param props.onOpenChange - Gọi khi panel mở / đóng.
 *
 * @example
 * <DockSettingsButton mode={mode} modeLocked={isCoarsePointer} open={open} onOpenChange={setOpen} />
 */
const DockSettingsButton = memo(function DockSettingsButton({
  mode,
  modeLocked = false,
  open,
  position = 'bottom',
  enterDelayMs = 0,
  onOpenChange,
}: DockSettingsButtonProps) {
  const t = useTranslations('ui.widgets');
  const triggerClassName = cn(
    DOCK_SETTINGS_SLOT_CLASSES.trigger,
    DOCK_MAGNIFY_ITEM_CLASS,
    open && DOCK_SETTINGS_TRIGGER_OPEN_CLASSES,
  );

  return (
    <Popover
      align="end"
      arrow
      content={<DockSettingsPanel mode={mode} modeLocked={modeLocked} />}
      open={open}
      side={DOCK_POPUP_SIDE[position]}
      sideOffset={12}
      onOpenChange={onOpenChange}
    >
      <button aria-label={t('dock.settings.title')} className={triggerClassName} type="button">
        <span className={DOCK_ENTER_CLASS} style={dockEnterStyle(enterDelayMs)}>
          <AppTile icon="sliders-simple-bold" size="lg" tone="neutral" />
        </span>
      </button>
    </Popover>
  );
});

export default DockSettingsButton;
