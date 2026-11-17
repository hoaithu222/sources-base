import { memo, type ReactNode } from 'react';

import { Surface } from '@/shared/ui';

type DemoStatTileVariant = 'plain' | 'widget';

interface DemoStatTileProps {
  caption: string;
  variant?: DemoStatTileVariant;
  children: ReactNode;
}

/**
 * `plain`: nhãn 10px mờ + số semibold (ô số đo kỹ thuật — nhãn có thể là tên biến CSS, không được in hoa).
 * `widget`: kiểu widget macOS — nhãn IN HOA giãn chữ, MỘT số lớn đậm, thẻ bo `xl`.
 */
const DEMO_STAT_TILE_LABEL_CLASSES = {
  plain: 'text-caption-10 text-fg-muted',
  widget: 'text-caption-12-semibold uppercase tracking-[0.06em] text-fg-muted',
} satisfies Record<DemoStatTileVariant, string>;

const DEMO_STAT_TILE_VALUE_CLASSES = {
  plain: 'text-h3-semibold tabular-nums text-fg-heading',
  widget: 'text-h2-bold tabular-nums text-fg-heading',
} satisfies Record<DemoStatTileVariant, string>;

const DEMO_STAT_TILE_FRAME_CLASSES = {
  plain: 'flex flex-col gap-0.5',
  widget: 'flex flex-col gap-0.5 rounded-xl',
} satisfies Record<DemoStatTileVariant, string>;

/**
 * DemoStatTile — ô "nhãn mờ ở trên, số to ở dưới" cho hàng trình bày số (mục "Sống & tự chạy", responsive lab).
 * Lưu ý: giữ `flex-col` — lý do ở `notes/code/demo.md` (mục DemoStatTile).
 *
 * @param props.caption - Tên biến thể đang minh hoạ (vd "rút gọn tiền").
 * @param props.variant - `plain` (nhãn thường) | `widget` (nhãn in hoa + số lớn kiểu widget). Mặc định `plain`.
 * @param props.children - Con số / nội dung lớn.
 *
 * @example
 * <DemoStatTile caption="rút gọn tiền" variant="widget">{formatMoneyCompact(n)}</DemoStatTile>
 */
const DemoStatTile = memo(function DemoStatTile({
  caption,
  variant = 'plain',
  children,
}: DemoStatTileProps) {
  return (
    <Surface className={DEMO_STAT_TILE_FRAME_CLASSES[variant]} padding="md">
      <p className={DEMO_STAT_TILE_LABEL_CLASSES[variant]}>{caption}</p>
      <p className={DEMO_STAT_TILE_VALUE_CLASSES[variant]}>{children}</p>
    </Surface>
  );
});

export default DemoStatTile;
