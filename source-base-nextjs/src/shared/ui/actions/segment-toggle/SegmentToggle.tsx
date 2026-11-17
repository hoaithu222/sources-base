'use client';

import { useCallback, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { cn } from '@/shared/utils/style/cn';
import {
  SEGMENT_TOGGLE_GLIDE_BASE_CLASSES,
  SEGMENT_TOGGLE_GLIDE_BLEED_PX,
  segmentGlideClasses,
} from './segment-toggle-glide.theme';
import SegmentToggleItem from './parts/segment-toggle-item';
import SegmentToggleWave from './parts/segment-toggle-wave';
import { getRovingTargetKey } from './segment-toggle.utils';
import {
  SEGMENT_TOGGLE_ROOT_BASE_CLASSES,
  SEGMENT_TOGGLE_ROOT_DISABLED_CLASSES,
  SEGMENT_TOGGLE_ROOT_VARIANT_CLASSES,
} from './segment-toggle.theme';
import type { SegmentToggleProps } from './segment-toggle.types';
import { useSegmentGlide } from './useSegmentGlide';

/**
 * SegmentToggle — chọn MỘT trong vài đoạn liền nhau (segmented control): đổi chế độ xem, khoảng thời gian,
 * lọc nhanh theo trạng thái.
 *
 * Controlled (`value` + `onValueChange`) hoặc tự quản (`defaultValue`); mỗi đoạn là một
 * `<button aria-pressed>`.
 * Chuyển nội dung theo tab có panel riêng thì dùng `Tabs`; chọn trong danh sách dài thì dùng `Dropdown`.
 * Chọn variant theo ngữ cảnh: docs/notes/components/actions.md (mục SegmentToggle).
 * Sửa giao diện: khung / đoạn / nhãn ở `segment-toggle.theme.ts` (`*_VARIANT_CLASSES`, `*_STATE_CLASSES`,
 * `*_SIZE_CLASSES`) · skin + badge ở `segment-toggle-tone.theme.ts` · mặt trượt + sóng ở `segment-toggle-glide.theme.ts`.
 * Lưu ý: `size` chỉ đổi cỡ đoạn của `pill` / `glass` / `wave` (đoạn 28 | 32 | 36px — rãnh `pill` / `glass` thêm 4px,
 * bằng Button / ô nhập cùng cỡ); variant khác tự định chiều cao. `skin` chỉ có tác dụng ở `subtle` và `pill` + `primary`.
 * Lưu ý: đoạn CHỈ CÓ ICON phải khai `title` — đó là tên trợ năng duy nhất của nút.
 * Lưu ý: `wave` (tab uốn lượn) = vạch nền mảnh võng thành đường cong mềm dưới đoạn đang chọn, rê → viên nền nhạt; cao
 * thêm 10px dưới đoạn cho dải sóng. Màu qua biến CSS đặt trên khung hoặc tổ tiên: `--seg-wave-color` (sóng) ·
 * `--seg-wave-fg` / `--seg-wave-fg-muted` (chữ chọn / nghỉ) · `--seg-wave-hover` · `--seg-wave-track` (vạch nền,
 * `transparent` = chỉ còn nét cười) · `--seg-wave-ring` · `--seg-wave-badge` / `--seg-wave-badge-fg`. Nằm trong thanh
 * header thì tự đọc `--hdr-pill` · `--hdr-fg` · `--hdr-fg-muted` · `--hdr-hover` · `--hdr-divider` · `--hdr-ring`.
 * Hành vi: `pill` / `solid` / `glass` / `underline` / `wave` có MẶT TRƯỢT dưới đoạn đang chọn (`useSegmentGlide`); cả
 * nhóm là MỘT điểm Tab — ←/→/↑/↓ (vòng), Home/End chọn đoạn kế tiếp, bỏ qua đoạn khoá; đoạn khoá riêng mờ.
 * Lưu ý: hai theme cùng hình (rãnh lõm + chip nổi), chỉ khác màu.
 *
 * @param props.options - Các đoạn `SegmentOption[]`: `key`, `label`, `icon`, `badge`, `disabled`, `title`.
 * @param props.value - Khoá đang chọn (controlled). Bỏ trống = tự quản.
 * @param props.defaultValue - Khoá chọn ban đầu khi tự quản. Mặc định khoá của đoạn đầu tiên.
 * @param props.variant - Kiểu: `pill` | `glass` | `solid` | `subtle` | `tab` | `tab-v2` | `tab-hud` (@deprecated —
 *   nay y hệt `tab-v2`, giữ tên để tương thích) | `underline` | `wave`. Mặc định `pill`.
 * @param props.size - Cỡ đoạn của `pill` / `glass` / `wave`: `sm` 28px | `md` 32px | `lg` 36px. Mặc định `md`.
 * @param props.skin - Màu đoạn đang chọn: `neutral` | `primary` | `primary-solid` | `sky` | `success` |
 *   `warning` (chỉ `subtle`; `pill` nhận `primary`). Mặc định `neutral`.
 * @param props.fullWidth - `true` → giãn hết bề ngang, các đoạn chia đều. Mặc định `false`.
 * @param props.fitContent - `true` → chỉ rộng bằng tổng các đoạn, không giãn dù cha là `flex-col`.
 *   Mặc định `false`.
 * @param props.disabled - `true` → khoá mọi đoạn (từng đoạn khoá riêng bằng `option.disabled`).
 * @param props.onValueChange - Gọi với `key` của đoạn vừa bấm (kể cả khi bấm lại đoạn đang chọn).
 * @param props.className - Class thêm cho khung `role="group"`.
 * @param props.ref - Trỏ tới khung `<div role="group">`.
 *
 * @example
 * <SegmentToggle
 *   options={[{ key: 'week', label: 'Tuần' }, { key: 'month', label: 'Tháng' }]}
 *   size="sm"
 *   value={range}
 *   onValueChange={setRange}
 * />
 *
 * <SegmentToggle
 *   options={[
 *     { key: 'grid', icon: <SystemIcon name="grid-2-outline" />, title: 'Dạng lưới' },
 *     { key: 'list', icon: <SystemIcon name="list-outline" />, title: 'Dạng danh sách' },
 *   ]}
 *   defaultValue="grid"
 *   skin="primary"
 *   variant="subtle"
 * />
 *
 * <SegmentToggle
 *   className="[--seg-wave-track:transparent]"
 *   options={tabs}
 *   value={tab}
 *   variant="wave"
 *   onValueChange={setTab}
 * />
 */
function SegmentToggle({
  options,
  value: valueProp,
  defaultValue,
  variant = 'pill',
  size = 'md',
  skin = 'neutral',
  fullWidth = false,
  fitContent = false,
  disabled,
  onValueChange,
  className,
  ref,
}: SegmentToggleProps) {
  const [internalValue, setInternalValue] = useState<string | undefined>(
    defaultValue ?? options[0]?.key,
  );
  const isControlled = valueProp !== undefined;
  const value = isControlled ? valueProp : internalValue;

  const select = useCallback(
    (key: string) => {
      if (!isControlled) setInternalValue(key);
      onValueChange?.(key);
    },
    [isControlled, onValueChange],
  );

  const enabledKeys = useMemo(
    () =>
      disabled ? [] : options.filter((option) => !option.disabled).map((option) => option.key),
    [options, disabled],
  );
  /** Đúng MỘT đoạn nhận Tab: đoạn đang chọn nếu bật được, không thì đoạn bật đầu tiên. */
  const tabStopKey = value !== undefined && enabledKeys.includes(value) ? value : enabledKeys[0];

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      const current = (event.target as HTMLElement).closest<HTMLElement>('[data-segment-key]');
      if (!current || current.parentElement !== event.currentTarget) return;
      const nextKey = getRovingTargetKey(enabledKeys, current.dataset.segmentKey, event.key);
      if (nextKey === undefined) return;
      event.preventDefault();
      const buttons = event.currentTarget.querySelectorAll<HTMLElement>(
        ':scope > [data-segment-key]',
      );
      Array.from(buttons)
        .find((button) => button.dataset.segmentKey === nextKey)
        ?.focus();
      if (nextKey !== value) select(nextKey);
    },
    [enabledKeys, select, value],
  );

  const glideRef = useRef<HTMLSpanElement>(null);
  const glideClassName = segmentGlideClasses(variant, skin);
  const glideBleed = SEGMENT_TOGGLE_GLIDE_BLEED_PX[variant] ?? 0;
  useSegmentGlide(glideRef, {
    activeKey: value,
    enabled: glideClassName !== undefined,
    bleed: glideBleed,
    layoutKey: options,
  });

  const rootClassName = cn(
    SEGMENT_TOGGLE_ROOT_BASE_CLASSES,
    SEGMENT_TOGGLE_ROOT_VARIANT_CLASSES[variant],
    fullWidth && 'w-full',
    fitContent && 'w-fit self-start',
    disabled && SEGMENT_TOGGLE_ROOT_DISABLED_CLASSES,
    className,
  );

  const segmentElements = useMemo(
    () =>
      options.map((option) => (
        <SegmentToggleItem
          key={option.key}
          disabled={disabled}
          fullWidth={fullWidth}
          isActive={option.key === value}
          option={option}
          size={size}
          skin={skin}
          tabIndex={option.key === tabStopKey ? 0 : -1}
          variant={variant}
          onSelect={select}
        />
      )),
    [options, value, disabled, select, variant, size, skin, fullWidth, tabStopKey],
  );

  return (
    <div
      ref={ref}
      aria-disabled={disabled || undefined}
      className={rootClassName}
      role="group"
      onKeyDown={handleKeyDown}
    >
      {glideClassName && (
        <span
          ref={glideRef}
          aria-hidden
          className={cn(SEGMENT_TOGGLE_GLIDE_BASE_CLASSES, glideClassName)}
        >
          {variant === 'wave' && <SegmentToggleWave />}
        </span>
      )}
      {segmentElements}
    </div>
  );
}

export default SegmentToggle;
