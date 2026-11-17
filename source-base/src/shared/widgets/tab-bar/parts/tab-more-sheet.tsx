import { memo, useCallback, useState } from 'react';

import { Drawer } from '@/shared/ui';
import { SystemIcon } from '@/shared/ui/icons/Icons';
import { cn } from '@/shared/utils/style/cn';

import {
  TAB_BAR_ACTIVE_CLASSES,
  TAB_BAR_SHEET_CLASSES,
  TAB_BAR_SLOT_CLASSES,
} from '../tab-bar.theme';
import type { TabBarItem } from '../tab-bar.types';
import { tileSpanClass } from '../tab-bar.utils';
import TabCellContent from './tab-cell-content';
import TabMoreTile from './tab-more-tile';

interface TabMoreSheetProps {
  items: readonly TabBarItem[];
  activeId: string | undefined;
  overflowIds: ReadonlySet<string>;
  moreLabel: string;
  sheetTitle: string;
}

/**
 * TabMoreSheet — ô "Thêm" của thanh tab + sheet đáy "Tất cả phân hệ" nó mở (`Drawer side="bottom"`: nút X, kéo /
 * Esc / bấm nền để đóng). Phần nội bộ của `TabBar`.
 *
 * Mục đang mở nằm trong sheet → ô "Thêm" mượn icon + nhãn của mục đó và sáng lên, để thanh luôn cho biết đang ở đâu.
 *
 * @param props.items - MỌI mục của thanh (sheet liệt kê tất cả, không chỉ phần tràn).
 * @param props.activeId - `id` mục đang mở; `undefined` khi không mục nào khớp.
 * @param props.overflowIds - `id` các mục KHÔNG nằm thẳng trên thanh.
 * @param props.moreLabel - Nhãn ô "Thêm".
 * @param props.sheetTitle - Tiêu đề sheet.
 *
 * @example
 * <TabMoreSheet activeId="a" items={items} moreLabel="Thêm" overflowIds={new Set(['d'])} sheetTitle="Tất cả phân hệ" />
 */
const TabMoreSheet = memo(function TabMoreSheet({
  items,
  activeId,
  overflowIds,
  moreLabel,
  sheetTitle,
}: TabMoreSheetProps) {
  const [open, setOpen] = useState(false);
  const closeSheet = useCallback(() => setOpen(false), []);

  const activeOverflow = items.find((item) => item.id === activeId && overflowIds.has(item.id));
  const cellItem = activeOverflow ?? { icon: 'ellipsis-outline' as const, label: moreLabel };
  const cellClassName = cn(
    TAB_BAR_SLOT_CLASSES.cell,
    activeOverflow && TAB_BAR_ACTIVE_CLASSES.cell,
  );
  const ariaLabel = activeOverflow
    ? `${moreLabel} — đang mở ${activeOverflow.label}`
    : `${moreLabel} phân hệ`;

  return (
    <Drawer
      open={open}
      side="bottom"
      size="sm"
      title={sheetTitle}
      trigger={
        <button aria-label={ariaLabel} className={cellClassName} type="button">
          {activeOverflow && (
            <span aria-hidden className={TAB_BAR_SLOT_CLASSES.moreMark}>
              <SystemIcon name="ellipsis-bold" />
            </span>
          )}
          <TabCellContent active={Boolean(activeOverflow)} item={cellItem} />
        </button>
      }
      onOpenChange={setOpen}
    >
      <div className={TAB_BAR_SHEET_CLASSES.grid}>
        {items.map((item, index) => (
          <TabMoreTile
            key={item.id}
            active={item.id === activeId}
            item={item}
            spanClassName={tileSpanClass(index, items.length)}
            onNavigate={closeSheet}
          />
        ))}
      </div>
    </Drawer>
  );
});

export default TabMoreSheet;
