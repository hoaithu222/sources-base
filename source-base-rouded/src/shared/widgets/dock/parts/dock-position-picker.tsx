import { memo } from 'react';

import { cn } from '@/shared/utils/style/cn';

import { DOCK_POSITION_OPTIONS } from '../dock-settings.store';
import type { DockPosition } from '../dock.types';
import { DOCK_POSITION_BAR_CLASSES, DOCK_POSITION_PICKER_CLASSES } from '../dock-settings.theme';

interface DockPositionPickerProps {
  value: DockPosition;
  onChange: (position: DockPosition) => void;
}

/**
 * DockPositionPicker — ba ô chọn cạnh neo của Dock (Trái · Đáy · Phải), mỗi ô vẽ một "màn hình" thu nhỏ có vạch Dock ở
 * đúng cạnh — đọc được ngay không cần nhãn. Phần nội bộ của `DockSettingsPanel`.
 *
 * Sửa giao diện: `DOCK_POSITION_PICKER_CLASSES` · vị trí vạch → `DOCK_POSITION_BAR_CLASSES` · nhãn → `DOCK_POSITION_OPTIONS`.
 * Lưu ý: nhóm là `radiogroup`; mỗi ô `role="radio"` + `aria-checked` để trình đọc màn hình đọc đúng "đang chọn".
 *
 * @param props.value - Cạnh đang chọn.
 * @param props.onChange - Gọi với cạnh mới khi bấm một ô.
 *
 * @example
 * <DockPositionPicker value={position} onChange={setPosition} />
 */
const DockPositionPicker = memo(function DockPositionPicker({
  value,
  onChange,
}: DockPositionPickerProps) {
  return (
    <div aria-label="Vị trí Dock" className={DOCK_POSITION_PICKER_CLASSES.grid} role="radiogroup">
      {DOCK_POSITION_OPTIONS.map((option) => {
        const selected = option.value === value;
        return (
          <button
            key={option.value}
            aria-checked={selected}
            className={cn(
              DOCK_POSITION_PICKER_CLASSES.tile,
              selected && DOCK_POSITION_PICKER_CLASSES.tileSelected,
            )}
            role="radio"
            type="button"
            onClick={() => onChange(option.value)}
          >
            <span
              aria-hidden
              className={cn(
                DOCK_POSITION_PICKER_CLASSES.screen,
                selected && DOCK_POSITION_PICKER_CLASSES.screenSelected,
              )}
            >
              <span
                className={cn(
                  DOCK_POSITION_PICKER_CLASSES.bar,
                  DOCK_POSITION_BAR_CLASSES[option.value],
                  selected && 'bg-primary-6 dark:bg-primary-4',
                )}
              />
            </span>
            <span className={DOCK_POSITION_PICKER_CLASSES.label}>{option.label}</span>
          </button>
        );
      })}
    </div>
  );
});

export default DockPositionPicker;
