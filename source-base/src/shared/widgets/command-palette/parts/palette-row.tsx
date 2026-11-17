import { memo } from 'react';
import type { MouseEvent } from 'react';
import { Link } from 'react-router-dom';

import { Text } from '@/shared/ui';
import { SystemIcon } from '@/shared/ui/icons/Icons';
import { isModifiedClick } from '@/shared/utils/browser/link.utils';

import { COMMAND_PALETTE_SLOT_CLASSES } from '../command-palette.theme';
import type { CommandPaletteItem } from '../command-palette.types';

interface PaletteRowProps {
  item: CommandPaletteItem;
  flatIndex: number;
  active: boolean;
  onActivate: (flatIndex: number) => void;
  onRun: (item: CommandPaletteItem) => void;
}

/**
 * PaletteRow — một hàng kết quả của Command Palette: icon + nhãn + mô tả (nếu có). Phần nội bộ của
 * `CommandPalette`.
 *
 * Mục có `href` → `<Link>` thật (chuột phải / Ctrl+click mở tab mới; click thường chạy `onRun`); mục có
 * `onSelect` → `<button>`. Hàng sáng do `data-highlighted` (`popup-surface.theme`).
 * Sửa giao diện: `COMMAND_PALETTE_SLOT_CLASSES.item*`.
 *
 * @param props.item - Mục cần vẽ.
 * @param props.flatIndex - Vị trí phẳng xuyên các nhóm (không phải vị trí trong nhóm).
 * @param props.active - Hàng đang được trỏ (bàn phím / chuột).
 * @param props.onActivate - Gọi với `flatIndex` khi rê chuột vào hàng hoặc hàng nhận focus.
 * @param props.onRun - Gọi với `item` khi bấm (click thường).
 *
 * @example
 * <PaletteRow item={item} flatIndex={3} active onActivate={setIndex} onRun={run} />
 */
const PaletteRow = memo(function PaletteRow({
  item,
  flatIndex,
  active,
  onActivate,
  onRun,
}: PaletteRowProps) {
  const content = (
    <>
      <SystemIcon className={COMMAND_PALETTE_SLOT_CLASSES.itemIcon} name={item.icon} size={18} />
      <span className={COMMAND_PALETTE_SLOT_CLASSES.itemBody}>
        <Text className={COMMAND_PALETTE_SLOT_CLASSES.itemText} size="small" weight="medium">
          {item.label}
        </Text>
        {item.description && (
          <Text className={COMMAND_PALETTE_SLOT_CLASSES.itemText} size="tiny" skin="muted">
            {item.description}
          </Text>
        )}
      </span>
    </>
  );

  const shared = {
    className: COMMAND_PALETTE_SLOT_CLASSES.item,
    'data-highlighted': active ? '' : undefined,
    onFocus: () => onActivate(flatIndex),
    onMouseEnter: () => onActivate(flatIndex),
  };

  if (item.href !== undefined) {
    const handleLinkClick = (e: MouseEvent<HTMLAnchorElement>) => {
      if (isModifiedClick(e)) return;
      e.preventDefault();
      onRun(item);
    };

    return (
      <Link {...shared} to={item.href} onClick={handleLinkClick}>
        {content}
      </Link>
    );
  }

  return (
    <button {...shared} type="button" onClick={() => onRun(item)}>
      {content}
    </button>
  );
});

export default PaletteRow;
