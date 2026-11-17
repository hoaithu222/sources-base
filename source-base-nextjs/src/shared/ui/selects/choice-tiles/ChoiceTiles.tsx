'use client';

import * as RadioGroupPrimitive from '@radix-ui/react-radio-group';
import { useCallback } from 'react';

import { cn } from '@/shared/utils/style/cn';

import { CHOICE_TILES_GROUP_CLASSES, CHOICE_TILES_ITEM_CLASSES } from './choice-tiles.theme';
import type { ChoiceTileOption, ChoiceTilesVariant } from './choice-tiles.types';

export interface ChoiceTilesProps<V extends string = string> {
  options: readonly ChoiceTileOption<V>[];
  value: V;
  onValueChange: (value: V) => void;
  variant?: ChoiceTilesVariant;
  disabled?: boolean;
  'aria-label'?: string;
  'aria-labelledby'?: string;
  className?: string;
}

/**
 * ChoiceTiles — chọn MỘT trong vài lựa chọn bằng HÌNH, kiểu System Settings của macOS: `tile` = ô ảnh thu nhỏ + nhãn
 * (Giao diện Tự động / Sáng / Tối, kiểu header) · `swatch` = dải chấm màu tròn (Màu nhấn).
 *
 * Là nhóm radio thật (Radix RadioGroup): ← → ↑ ↓ đi và chọn, Tab vào đúng ô đang chọn. Chữ thì dùng `SegmentToggle`;
 * nhiều lựa chọn dùng `Dropdown`. Sửa giao diện: `choice-tiles.theme.ts`.
 *
 * @param props.options - Lựa chọn: `value` · `label` · `preview` (ô `tile`) hoặc `fill` (class nền chấm `swatch`) · `disabled`.
 * @param props.value - Giá trị đang chọn.
 * @param props.onValueChange - Gọi với giá trị mới (đã là một `value` trong `options`).
 * @param props.variant - `tile` (mặc định) | `swatch`.
 * @param props.disabled - Khoá cả nhóm.
 * @param props.aria-label - Tên nhóm cho trình đọc màn hình (hoặc `aria-labelledby`).
 * @param props.aria-labelledby - Id phần tử làm tên nhóm.
 * @param props.className - Class thêm cho nhóm.
 *
 * @example
 * <ChoiceTiles aria-label="Giao diện" options={THEMES} value={theme} onValueChange={setTheme} />
 * <ChoiceTiles aria-label="Màu nhấn" options={ACCENTS} value={accent} variant="swatch" onValueChange={setAccent} />
 */
function ChoiceTiles<V extends string>({
  options,
  value,
  onValueChange,
  variant = 'tile',
  disabled,
  className,
  ...aria
}: ChoiceTilesProps<V>) {
  const handleChange = useCallback(
    (next: string) => {
      const option = options.find((item) => item.value === next);
      if (option) onValueChange(option.value);
    },
    [options, onValueChange],
  );

  return (
    <RadioGroupPrimitive.Root
      {...aria}
      className={cn(CHOICE_TILES_GROUP_CLASSES[variant], className)}
      disabled={disabled}
      loop
      orientation="horizontal"
      value={value}
      onValueChange={handleChange}
    >
      {options.map((option) =>
        variant === 'swatch' ? (
          <RadioGroupPrimitive.Item
            key={option.value}
            aria-label={option.label}
            className={cn(CHOICE_TILES_ITEM_CLASSES.swatch, option.fill)}
            disabled={option.disabled}
            title={option.label}
            value={option.value}
          >
            <RadioGroupPrimitive.Indicator className={CHOICE_TILES_ITEM_CLASSES.dot} />
          </RadioGroupPrimitive.Item>
        ) : (
          <RadioGroupPrimitive.Item
            key={option.value}
            className={CHOICE_TILES_ITEM_CLASSES.tile}
            disabled={option.disabled}
            value={option.value}
          >
            <span aria-hidden className={CHOICE_TILES_ITEM_CLASSES.preview}>
              {option.preview}
            </span>
            <span className={CHOICE_TILES_ITEM_CLASSES.label}>{option.label}</span>
          </RadioGroupPrimitive.Item>
        ),
      )}
    </RadioGroupPrimitive.Root>
  );
}

export default ChoiceTiles;
