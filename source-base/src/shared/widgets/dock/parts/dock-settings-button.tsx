import { memo } from 'react';

import { Popover } from '@/shared/ui';
import { SystemIcon } from '@/shared/ui/icons/Icons';
import { cn } from '@/shared/utils/style/cn';

import {
  DOCK_ENTER_CLASS,
  DOCK_SETTINGS_SLOT_CLASSES,
  DOCK_SETTINGS_TRIGGER_OPEN_CLASSES,
  dockEnterStyle,
} from '../dock.theme';
import DockSettingsPanel, { type DockSettingsPanelProps } from './dock-settings-panel';

interface DockSettingsButtonProps extends DockSettingsPanelProps {
  open: boolean;
  enterDelayMs?: number;
  onOpenChange: (open: boolean) => void;
}

/**
 * DockSettingsButton — nút bánh răng cuối thanh Dock + panel cấu hình (`Popover` của UI kit). Phần nội bộ
 * của `<Dock>`.
 *
 * Sửa giao diện: nút → `DOCK_SETTINGS_SLOT_CLASSES.trigger` · panel → `dock-settings-panel.tsx`.
 * Lưu ý: `open` do `Dock` giữ (qua `useDockReveal`) để thanh tự ẩn không thu lại khi panel đang mở.
 *
 * @param props.mode - Chế độ đang hiệu lực, chuyển cho panel.
 * @param props.modeLocked - Khoá phần chọn chế độ (máy chạm). Mặc định `false`.
 * @param props.open - Panel đang mở.
 * @param props.enterDelayMs - Độ trễ (ms) của hiệu ứng bay vào; `Dock` truyền để nút vào SAU CÙNG.
 *   Mặc định `0`.
 * @param props.onOpenChange - Gọi khi panel mở / đóng.
 *
 * @example
 * <DockSettingsButton mode={mode} modeLocked={isCoarsePointer} open={open} onOpenChange={setOpen} />
 */
const DockSettingsButton = memo(function DockSettingsButton({
  mode,
  modeLocked = false,
  open,
  enterDelayMs = 0,
  onOpenChange,
}: DockSettingsButtonProps) {
  const triggerClassName = cn(
    DOCK_SETTINGS_SLOT_CLASSES.trigger,
    open && DOCK_SETTINGS_TRIGGER_OPEN_CLASSES,
  );

  return (
    <Popover
      align="end"
      arrow
      content={<DockSettingsPanel mode={mode} modeLocked={modeLocked} />}
      open={open}
      side="top"
      sideOffset={12}
      onOpenChange={onOpenChange}
    >
      <button aria-label="Tuỳ chỉnh Dock" className={triggerClassName} type="button">
        <span className={DOCK_ENTER_CLASS} style={dockEnterStyle(enterDelayMs)}>
          <SystemIcon name="sliders-simple-bold" size={22} />
        </span>
      </button>
    </Popover>
  );
});

export default DockSettingsButton;
