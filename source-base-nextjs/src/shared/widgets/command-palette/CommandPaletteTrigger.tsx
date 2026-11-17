'use client';

import { memo } from 'react';
import { useTranslations } from 'next-intl';

import { Tooltip } from '@/shared/ui';
import { SystemIcon } from '@/shared/ui/icons/Icons';
import { cn } from '@/shared/utils/style/cn';

import { COMMAND_PALETTE_SHORTCUT_LABEL } from './command-palette.constants';
import { useCommandPaletteStore } from './command-palette.store';

type CommandPaletteTriggerVariant = 'icon' | 'field';

interface CommandPaletteTriggerProps {
  variant?: CommandPaletteTriggerVariant;
  className?: string;
}

const COMMAND_PALETTE_TRIGGER_CLASSES = {
  icon: cn(
    'inline-flex shrink-0 items-center justify-center',
    'outline-none cursor-pointer',
    'transition-colors duration-150 ease-out',
    'text-fg-on-nav-muted hover:text-fg-on-chrome',
    'hover:bg-bg-nav-hover active:bg-bg-nav-active',
    'focus-visible:ring-2 focus-visible:ring-ring-focus',
    'size-9 [&>svg]:size-[18px]',
  ),
  field: cn(
    'inline-flex shrink-0 cursor-pointer items-center gap-2 text-left outline-none',
    'text-caption-12 [&>svg]:size-3.5! [&>svg]:shrink-0',
    'max-md:size-8 max-md:justify-center max-md:px-0',
  ),
} satisfies Record<CommandPaletteTriggerVariant, string>;

const FIELD_LABEL_CLASS = 'min-w-0 flex-1 truncate max-md:hidden';

const FIELD_KBD_CLASS = cn(
  'shrink-0 rounded-xs border border-current/25 px-1.5 py-px font-mono text-caption-10-medium opacity-80',
  'max-lg:hidden',
);

/**
 * CommandPaletteTrigger — nút mở Command Palette: `icon` (nút icon + tooltip phím tắt) hoặc `field` (ô "Tìm kiếm… Ctrl K"
 * dạng ô nhập giả — kiểu thanh tìm kiếm của header ERP hiện đại). Thường đặt vào slot `search` / `actions` của `<Header>`.
 *
 * Sửa giao diện: khung theo kiểu → `COMMAND_PALETTE_TRIGGER_CLASSES`; nhãn phím → `COMMAND_PALETTE_SHORTCUT_LABEL`.
 * Lưu ý: màu / nền / bề rộng do nơi gọi truyền qua `className` (trên header: `HEADER_SEARCH_FIELD_CLASS` cho `field`,
 * `HEADER_ICON_BUTTON_CLASS` cho `icon`) — component không tự cho rằng mình luôn nằm trong header. `field` dưới `md` co
 * về nút icon.
 *
 * @param props.variant - `icon` | `field`. Mặc định `icon`.
 * @param props.className - Class khung của chỗ đặt, đè lên class mặc định.
 *
 * @example
 * <CommandPaletteTrigger variant="field" className={HEADER_SEARCH_FIELD_CLASS} />
 */
const CommandPaletteTrigger = memo(function CommandPaletteTrigger({
  variant = 'icon',
  className,
}: CommandPaletteTriggerProps) {
  const t = useTranslations('ui.widgets');
  const open = useCommandPaletteStore((state) => state.open);

  const triggerClassName = cn(COMMAND_PALETTE_TRIGGER_CLASSES[variant], className);

  if (variant === 'field') {
    return (
      <button
        aria-label={t('commandPalette.title')}
        className={triggerClassName}
        type="button"
        onClick={open}
      >
        <SystemIcon name="magnifying-glass-outline" />
        <span className={FIELD_LABEL_CLASS}>{t('commandPalette.fieldLabel')}</span>
        <kbd className={FIELD_KBD_CLASS}>{COMMAND_PALETTE_SHORTCUT_LABEL}</kbd>
      </button>
    );
  }

  return (
    <Tooltip
      arrow={false}
      content={t('commandPalette.tooltip', { shortcut: COMMAND_PALETTE_SHORTCUT_LABEL })}
      side="bottom"
    >
      <button
        aria-label={t('commandPalette.title')}
        className={triggerClassName}
        type="button"
        onClick={open}
      >
        <SystemIcon name="magnifying-glass-outline" />
      </button>
    </Tooltip>
  );
});

export default CommandPaletteTrigger;
