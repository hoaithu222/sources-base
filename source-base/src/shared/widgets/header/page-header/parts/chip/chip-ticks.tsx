import { memo } from 'react';
import type { CSSProperties } from 'react';

import { cn } from '@/shared/utils/style/cn';

import { PAGE_NAV_SLOT_CLASSES, type PageHeaderChipSlant } from '../../page-nav.theme';

interface ChipTicksProps {
  slant: PageHeaderChipSlant;
  active: boolean;
}

/** Độ sáng của bốn vạch khi chip nghỉ, từ xa tới gần bảng tên (chip bật: cả bốn sáng hết). */
const TICK_LEVELS = [0.3, 0.45, 0.65, 0.9] as const;

/** Vạch đậm dần về phía bảng tên: dải trái xếp xa → gần theo chiều đọc, dải phải đảo lại. */
const TICK_ORDER = {
  left: TICK_LEVELS,
  right: [...TICK_LEVELS].reverse(),
} satisfies Record<PageHeaderChipSlant, readonly number[]>;

/** Thang vạch neo ở mép TRONG của chip (phía bảng tên), thẳng hàng với lề chữ. */
const TICKS_ANCHOR = {
  left: 'right-2 xl:right-3 wide:right-3.5',
  right: 'left-2 xl:left-3 wide:left-3.5',
} satisfies Record<PageHeaderChipSlant, string>;

const TICK_ACTIVE_CLASS = 'bg-primary-4 opacity-100 dark:shadow-[0_0_6px_var(--color-primary-4)]';
const TICK_IDLE_CLASS =
  'bg-hud-5 opacity-[var(--level)] group-hover:bg-hud-4 group-hover:opacity-100';

/**
 * ChipTicks — thang vạch của kiểu "Thang vạch" (nội bộ `ChipSurface`): bốn vạch 2px sáng dần về phía bảng tên, thay cho vạch
 * sáng đáy của các kiểu khác. Chip bật: cả bốn sáng hết kèm quầng (chỉ `dark:`); chip nghỉ: mờ theo bậc, rê chuột thì sáng lên.
 *
 * @param props.slant - Dải chip đứng (`left` | `right`) — quyết định phía neo + chiều đậm dần.
 * @param props.active - Chip đang sáng.
 *
 * @example
 * <ChipTicks active slant="left" />
 */
const ChipTicks = memo(function ChipTicks({ slant, active }: ChipTicksProps) {
  return (
    <span className={cn(PAGE_NAV_SLOT_CLASSES.ticks, TICKS_ANCHOR[slant])}>
      {TICK_ORDER[slant].map((level) => (
        <span
          key={level}
          className={cn(PAGE_NAV_SLOT_CLASSES.tick, active ? TICK_ACTIVE_CLASS : TICK_IDLE_CLASS)}
          style={{ '--level': level } as CSSProperties}
        />
      ))}
    </span>
  );
});

export default ChipTicks;
