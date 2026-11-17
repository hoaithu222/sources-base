import { memo, type ReactNode } from 'react';

import { Surface, Text } from '@/shared/ui';

interface DemoStatTileProps {
  caption: string;
  children: ReactNode;
}

/**
 * DemoStatTile — ô "nhãn mờ ở trên, số to ở dưới" cho hàng trình bày số (mục "Sống & tự chạy").
 * Lưu ý: giữ `flex-col` — lý do ở `notes/code/demo.md` (mục DemoStatTile).
 *
 * @param props.caption - Tên biến thể đang minh hoạ (vd "rút gọn tiền").
 * @param props.children - Con số / nội dung lớn.
 *
 * @example
 * <DemoStatTile caption="rút gọn tiền">{formatMoneyCompact(n)}</DemoStatTile>
 */
const DemoStatTile = memo(function DemoStatTile({ caption, children }: DemoStatTileProps) {
  return (
    <Surface className="flex flex-col gap-0.5" padding="md">
      <Text size="extraTiny" skin="muted">
        {caption}
      </Text>
      <Text className="text-h3-semibold tabular-nums" size="large">
        {children}
      </Text>
    </Surface>
  );
});

export default DemoStatTile;
