import { cn } from '@/shared/utils/style/cn';

import type { ChoiceTilesVariant } from './choice-tiles.types';

/**
 * choice-tiles.theme.ts — bảng class của `ChoiceTiles`: ô ảnh thu nhỏ (Giao diện) · chấm màu (Màu nhấn) kiểu System
 * Settings của macOS.
 *
 * Dùng:   cn(CHOICE_TILES_GROUP_CLASSES[variant]) · CHOICE_TILES_ITEM_CLASSES.tile / .preview / .label / .swatch / .dot
 * Lưu ý:  ⛔ Đang chọn = VIỀN NGOÀI `outline` cách 2px (khe trong suốt — không `ring-offset`, vì vành offset tô màu nền
 *         sẽ lộ ở tối). Focus bàn phím = quầng `ring` mờ thêm vào, nên ô vừa chọn vừa focus vẫn phân biệt được.
 *         Chấm `swatch` đang chọn có chấm trắng giữa (như macOS) — màu nền do nơi gọi truyền `fill`.
 */

export const CHOICE_TILES_GROUP_CLASSES = {
  tile: 'flex flex-wrap items-start gap-3',
  swatch: 'flex flex-wrap items-center gap-2',
} satisfies Record<ChoiceTilesVariant, string>;

export const CHOICE_TILES_ITEM_CLASSES = {
  tile: cn(
    'group/tile flex w-16 cursor-pointer flex-col items-center gap-1.5 outline-none',
    'disabled:cursor-not-allowed disabled:opacity-50',
  ),
  preview: cn(
    'squircle relative block h-11 w-16 overflow-hidden rounded-lg border border-border-default shadow-(--elev-1)',
    'transition-[outline-color,box-shadow,transform] duration-150 ease-out',
    'group-enabled/tile:group-hover/tile:border-border-strong group-enabled/tile:group-active/tile:scale-95',
    'group-data-[state=checked]/tile:outline-2 group-data-[state=checked]/tile:outline-offset-2',
    'group-data-[state=checked]/tile:outline-primary-6',
    'group-focus-visible/tile:ring-4 group-focus-visible/tile:ring-ring-focus/35',
  ),
  label: cn(
    'text-caption-12 text-fg-muted',
    'group-data-[state=checked]/tile:text-caption-12-semibold group-data-[state=checked]/tile:text-fg-heading',
  ),
  swatch: cn(
    'relative inline-flex size-5 shrink-0 cursor-pointer items-center justify-center rounded-full outline-none',
    'shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--color-neutral-10)_14%,transparent),inset_0_1px_0_color-mix(in_srgb,var(--color-neutral-0)_35%,transparent)]',
    'transition-[outline-color,box-shadow,transform] duration-150 ease-out enabled:active:scale-90',
    'data-[state=checked]:outline-2 data-[state=checked]:outline-offset-2 data-[state=checked]:outline-solid',
    'data-[state=checked]:outline-fg-subheading',
    'focus-visible:ring-4 focus-visible:ring-ring-focus/35',
    'disabled:cursor-not-allowed disabled:opacity-50',
  ),
  dot: 'block size-1.5 rounded-full bg-neutral-0 shadow-[0_0_2px_color-mix(in_srgb,var(--color-neutral-10)_40%,transparent)] animate-pop-in motion-reduce:animate-none',
} satisfies Record<string, string>;
