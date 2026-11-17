import { cn } from '@/shared/utils/style/cn';
import {
  SEGMENT_TOGGLE_BADGE_ACTIVE_CLASSES,
  SEGMENT_TOGGLE_BADGE_BASE_CLASSES,
  SEGMENT_TOGGLE_BADGE_INACTIVE_CLASSES,
  SEGMENT_TOGGLE_BADGE_MUTED_CLASSES,
  SEGMENT_TOGGLE_BADGE_SKIN_CLASSES,
  SEGMENT_TOGGLE_BADGE_VARIANT_CLASSES,
  SEGMENT_TOGGLE_ICON_BASE_CLASSES,
  SEGMENT_TOGGLE_ICON_VARIANT_CLASSES,
  SEGMENT_TOGGLE_LABEL_BASE_CLASSES,
  SEGMENT_TOGGLE_LABEL_VARIANT_CLASSES,
  SEGMENT_TOGGLE_SEGMENT_BASE_CLASSES,
  SEGMENT_TOGGLE_SEGMENT_DISABLED_CLASSES,
  SEGMENT_TOGGLE_SEGMENT_SIZE_CLASSES,
  SEGMENT_TOGGLE_SEGMENT_SKIN_CLASSES,
  SEGMENT_TOGGLE_SEGMENT_STATE_CLASSES,
  SEGMENT_TOGGLE_SEGMENT_VARIANT_CLASSES,
} from './segment-toggle.theme';
import type {
  SegmentOption,
  SegmentToggleSize,
  SegmentToggleSkin,
  SegmentToggleVariant,
} from './segment-toggle.types';

interface SegmentToggleItemProps {
  option: SegmentOption;
  isActive: boolean;
  variant: SegmentToggleVariant;
  size: SegmentToggleSize;
  skin: SegmentToggleSkin;
  fullWidth: boolean;
  disabled?: boolean;
  tabIndex: 0 | -1;
  onSelect: (key: string) => void;
}

/** Badge chìm khi đoạn khoá hoặc đếm = 0 (chưa chọn) — không có gì để xem thì không hút mắt. */
function badgeToneClasses(
  option: SegmentOption,
  isActive: boolean,
  variant: SegmentToggleVariant,
  skin: SegmentToggleSkin,
) {
  if (option.disabled || (!isActive && Number(option.badge) === 0)) {
    return SEGMENT_TOGGLE_BADGE_MUTED_CLASSES;
  }
  if (!isActive) return SEGMENT_TOGGLE_BADGE_INACTIVE_CLASSES;
  return (
    SEGMENT_TOGGLE_BADGE_SKIN_CLASSES[variant]?.[skin] ??
    SEGMENT_TOGGLE_BADGE_ACTIVE_CLASSES[variant]
  );
}

/**
 * SegmentToggleItem — một đoạn (`<button aria-pressed>`) của SegmentToggle; chỉ SegmentToggle dùng.
 *
 * Sửa giao diện: các bảng `SEGMENT_TOGGLE_SEGMENT_*` / `*_ICON_*` / `*_LABEL_*` / `*_BADGE_*` ở
 * `segment-toggle.theme.ts`; ô `*_SKIN_CLASSES` (nếu có) THAY ô `active` của `*_STATE_CLASSES`.
 *
 * @param props.option - Đoạn cần vẽ (`SegmentOption`); không có `label` thì `title` thành `aria-label`.
 * @param props.isActive - `true` → đoạn đang chọn (`aria-pressed`, màu active).
 * @param props.variant - Variant của SegmentToggle cha.
 * @param props.size - Cỡ của SegmentToggle cha (chỉ `pill` / `glass` đọc).
 * @param props.skin - Skin của SegmentToggle cha.
 * @param props.fullWidth - `true` → đoạn `flex-1`, nội dung canh giữa.
 * @param props.disabled - `true` → khoá đoạn vì CẢ NHÓM khoá (không sọc — khung đã mờ); `option.disabled` → sọc chéo.
 * @param props.tabIndex - Roving tabindex do SegmentToggle tính: `0` cho đúng một đoạn, `-1` cho phần còn lại.
 * @param props.onSelect - Gọi với `option.key` khi bấm.
 *
 * @example
 * <SegmentToggleItem
 *   isActive
 *   fullWidth={false}
 *   option={{ key: 'week', label: 'Tuần' }}
 *   size="md"
 *   skin="neutral"
 *   tabIndex={0}
 *   variant="pill"
 *   onSelect={select}
 * />
 */
function SegmentToggleItem({
  option,
  isActive,
  variant,
  size,
  skin,
  fullWidth,
  disabled,
  tabIndex,
  onSelect,
}: SegmentToggleItemProps) {
  const hasLabel = option.label !== undefined;
  const state = isActive ? 'active' : 'inactive';
  const segmentSkinClasses = isActive
    ? SEGMENT_TOGGLE_SEGMENT_SKIN_CLASSES[variant]?.[skin]
    : undefined;

  const segmentClassName = cn(
    SEGMENT_TOGGLE_SEGMENT_BASE_CLASSES,
    SEGMENT_TOGGLE_SEGMENT_VARIANT_CLASSES[variant],
    SEGMENT_TOGGLE_SEGMENT_SIZE_CLASSES[variant]?.[size],
    segmentSkinClasses ?? SEGMENT_TOGGLE_SEGMENT_STATE_CLASSES[variant][state],
    option.disabled && !isActive && SEGMENT_TOGGLE_SEGMENT_DISABLED_CLASSES,
    fullWidth && 'flex-1 justify-center',
  );
  const iconClassName = cn(
    SEGMENT_TOGGLE_ICON_BASE_CLASSES,
    SEGMENT_TOGGLE_ICON_VARIANT_CLASSES[variant],
  );
  const labelClassName = cn(
    SEGMENT_TOGGLE_LABEL_BASE_CLASSES,
    SEGMENT_TOGGLE_LABEL_VARIANT_CLASSES[variant],
  );
  const badgeClassName = cn(
    SEGMENT_TOGGLE_BADGE_BASE_CLASSES,
    SEGMENT_TOGGLE_BADGE_VARIANT_CLASSES[variant],
    badgeToneClasses(option, isActive, variant, skin),
  );

  return (
    <button
      aria-label={hasLabel ? undefined : option.title}
      aria-pressed={isActive}
      className={segmentClassName}
      data-segment-key={option.key}
      disabled={disabled || option.disabled}
      tabIndex={tabIndex}
      title={option.title}
      type="button"
      onClick={() => onSelect(option.key)}
    >
      {option.icon && <span className={iconClassName}>{option.icon}</span>}
      {hasLabel && <span className={labelClassName}>{option.label}</span>}
      {option.badge !== undefined && <span className={badgeClassName}>{option.badge}</span>}
    </button>
  );
}

export default SegmentToggleItem;
