import { memo } from 'react';
import { SystemIcon } from '@/shared/ui/icons/Icons';
import Text from '@/shared/ui/primitives/Text';
import { HUD_TEXT_GLOW } from '@/shared/ui/primitives/hud.theme';
import { cn } from '@/shared/utils/style/cn';
import { PICKER_CELL_HUD_CLASSES } from '../picker-cell.theme';

interface YearNavProps {
  year: number;
  onStep: (dir: -1 | 1) => void;
  canPrev?: boolean;
  canNext?: boolean;
  className?: string;
}

const YEAR_NAV_CLASSES = {
  root: 'flex items-center justify-between',
  button: cn(
    "relative touch:after:absolute touch:after:-inset-x-0.5 touch:after:-inset-y-3 touch:after:content-['']",
    'inline-flex size-6 shrink-0 cursor-pointer items-center justify-center',
    'text-fg-on-chrome-muted transition-[color,background-color,box-shadow] duration-150 ease-out',
    'hover:bg-primary-5/10 hover:text-link active:bg-primary-5/20',
    PICKER_CELL_HUD_CLASSES.nav,
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring-focus',
    'disabled:cursor-not-allowed disabled:opacity-50',
    'disabled:hover:bg-transparent disabled:hover:text-fg-on-chrome-muted',
  ),
  label: cn('tabular-nums text-fg-on-chrome', HUD_TEXT_GLOW),
};

/**
 * YearNav — thanh điều hướng năm (◀ YYYY ▶) trong popover của các picker THÁNG.
 *
 * Helper NỘI BỘ của `pickers/month`; không giữ state, năm do caller quản.
 * Sửa giao diện: `YEAR_NAV_CLASSES`.
 *
 * @param props.year - Năm đang hiện giữa hai nút.
 * @param props.onStep - Bấm ◀ gọi `onStep(-1)`, bấm ▶ gọi `onStep(1)`.
 * @param props.canPrev - `false` → khoá ◀ (đầu danh sách năm). Mặc định `true`.
 * @param props.canNext - `false` → khoá ▶ (cuối danh sách năm). Mặc định `true`.
 * @param props.className - Class thêm cho thanh.
 *
 * @example
 * <YearNav year={year} onStep={(dir) => setYear((y) => y + dir)} canNext={year < 2030} />
 */
export const YearNav = memo(function YearNav({
  year,
  onStep,
  canPrev = true,
  canNext = true,
  className,
}: YearNavProps) {
  return (
    <div className={cn(YEAR_NAV_CLASSES.root, className)}>
      <button
        aria-label="Năm trước"
        className={YEAR_NAV_CLASSES.button}
        disabled={!canPrev}
        type="button"
        onClick={() => onStep(-1)}
      >
        <SystemIcon name="angle-left-outline" size={14} />
      </button>
      <Text className={YEAR_NAV_CLASSES.label} size="tiny" weight="medium">
        {year}
      </Text>
      <button
        aria-label="Năm sau"
        className={YEAR_NAV_CLASSES.button}
        disabled={!canNext}
        type="button"
        onClick={() => onStep(1)}
      >
        <SystemIcon name="angle-right-outline" size={14} />
      </button>
    </div>
  );
});
