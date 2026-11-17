import { memo } from 'react';

import { Tooltip } from '@/shared/ui';
import { SystemIcon } from '@/shared/ui/icons/Icons';
import { cn } from '@/shared/utils/style/cn';

import { COMMAND_PALETTE_SHORTCUT_LABEL } from './command-palette.constants';
import { useCommandPaletteStore } from './command-palette.store';

interface CommandPaletteTriggerProps {
  className?: string;
}

const COMMAND_PALETTE_TRIGGER_CLASSES = cn(
  'inline-flex shrink-0 items-center justify-center',
  'outline-none cursor-pointer',
  'transition-colors duration-150 ease-out',
  'text-fg-on-nav-muted hover:text-fg-on-chrome',
  'hover:bg-bg-nav-hover active:bg-bg-nav-active',
  'focus-visible:ring-2 focus-visible:ring-ring-focus',
  'size-9 [&>svg]:size-[18px]',
);

/**
 * CommandPaletteTrigger — nút icon mở Command Palette (kèm tooltip nhắc phím tắt), thường đặt vào slot
 * `actions` của `<Header>`.
 *
 * Sửa giao diện: màu · hover · cỡ → `COMMAND_PALETTE_TRIGGER_CLASSES`; nhãn phím →
 * `COMMAND_PALETTE_SHORTCUT_LABEL`.
 * Lưu ý: `className` do nơi gọi truyền để khớp khung icon của chỗ đặt (trên header:
 * `HEADER_ICON_BUTTON_CLASS`) — component không tự cho rằng mình luôn nằm trong header.
 *
 * @param props.className - Class khung nút của chỗ đặt, đè lên class mặc định.
 *
 * @example
 * <CommandPaletteTrigger className={HEADER_ICON_BUTTON_CLASS} />
 */
const CommandPaletteTrigger = memo(function CommandPaletteTrigger({
  className,
}: CommandPaletteTriggerProps) {
  const open = useCommandPaletteStore((state) => state.open);

  const triggerClassName = cn(COMMAND_PALETTE_TRIGGER_CLASSES, className);

  return (
    <Tooltip arrow={false} content={`Tìm nhanh (${COMMAND_PALETTE_SHORTCUT_LABEL})`} side="bottom">
      <button aria-label="Tìm nhanh" className={triggerClassName} type="button" onClick={open}>
        <SystemIcon name="magnifying-glass-outline" />
      </button>
    </Tooltip>
  );
});

export default CommandPaletteTrigger;
