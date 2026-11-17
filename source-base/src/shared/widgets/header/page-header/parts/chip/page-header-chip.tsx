import { memo } from 'react';
import type { ReactNode } from 'react';

import { Tooltip } from '@/shared/ui';
import { SystemIcon, type SystemIconName } from '@/shared/ui/icons/Icons';
import { cn } from '@/shared/utils/style/cn';
import { useHeaderSkinSpec, type ChipShape } from '../../header-skin.theme';

import {
  PAGE_NAV_SLOT_CLASSES,
  pageNavItemClassName,
  type PageHeaderChipSlant,
} from '../../page-nav.theme';
import ChipElement from './chip-element';
import ChipSurface from './chip-surface';

/**
 * Hình chip mà cạnh vát / mũi / đuôi đã chiếm chỗ ngang → dùng đệm gọn (như chip action: −2px mỗi phía) để dải tab không tràn ô nav
 * sớm ở 1280–1366px. Đệm gọn nhất (6 · 10 · 12px) vẫn ≥ độ vát (5–8px) nên chữ không đâm vào cạnh vát.
 */
const TIGHT_SHAPES: readonly ChipShape[] = ['chevron', 'slant', 'skew', 'tag', 'folder'];

interface PageHeaderChipProps {
  label?: string;
  shortLabel?: string;
  icon?: SystemIconName;
  slant?: PageHeaderChipSlant;
  compact?: boolean;
  href?: string;
  newTab?: boolean;
  active?: boolean;
  current?: boolean;
  pressed?: boolean;
  disabled?: boolean;
  tooltip?: string;
  onSelect?: () => void;
  className?: string;
  children?: ReactNode;
}

/**
 * PageHeaderChip — hình khối CHUẨN cho MỌI control bấm được mà page ghim lên thanh header (tab, action,
 * quay lại): control mới dùng chip này, đừng vẽ khung riêng. Phần nội bộ của `PageHeader`.
 *
 * Bề mặt: wrapper (quầng — CHỈ ở `dark:`) → `edge` (viền 1px) → `face` (thân đặc) → `corner` (nét sáng ở góc ngoài vát
 * ngược) → vạch đáy (chip bật: vạch sáng; chip nghỉ: vạch nở ra khi rê chuột), cắt bằng `clip-path`; mặt
 * chip trộn với nền thanh qua `--header-bg` (do `HEADER_SLOT_CLASSES.root` đặt). `<a>` hay `<button>` do `ChipElement`
 * quyết theo `href`. Chip đứng trên ray đáy vì ô nav của `PageHeader` canh `items-end`, không phải chip tự neo.
 * Sửa giao diện: khung chip → `PAGE_NAV_SLOT_CLASSES.item` · sáng / mờ → `PAGE_NAV_STATE_CLASSES`
 * · màu bề mặt → `ChipSurface` / `faceBackground` (`parts/chip/chip-surface.tsx`).
 * Lưu ý: ⛔ Không `border` / `box-shadow` (`clip-path` cắt mất). ⛔ Màu LUÔN `primary` (không theo `tone`
 * module); không dùng `HEADER_ICON_BUTTON_CLASS`. Lý do hình khối: docs/notes/code/widgets-header.md.
 *
 * @param props.label - Nhãn hiển thị. Bỏ trống + có `icon` → chip icon-only (BẮT BUỘC `tooltip`).
 * @param props.shortLabel - Nhãn rút gọn cho màn < 1024px / máy chạm (`PAGE_NAV_SLOT_CLASSES.labelShort`).
 * @param props.icon - Icon từ registry, đứng trước nhãn.
 * @param props.slant - Hướng nghiêng hình bình hành: `right` (`/`) | `left` (`\`). Mặc định `right`.
 * @param props.compact - Siết BỀ NGANG cho control phụ chung dải đáy với tab (không đổi chiều cao); với
 *   chip icon-only là no-op có chủ ý. Mặc định `false`.
 * @param props.href - Đích điều hướng THẬT → chip render `<Link>`.
 * @param props.newTab - Mở `href` ở tab mới.
 * @param props.active - Sáng lên (nền primary loang; quầng ở theme tối) — tab đang mở / chế độ đang bật. Mặc
 *   định `false`.
 * @param props.current - Ngữ nghĩa "trang hiện tại" cho chip TAB (`aria-current="page"`).
 * @param props.pressed - Ngữ nghĩa "đang bật" cho chip TOGGLE (`aria-pressed`).
 * @param props.disabled - Khoá chip (mờ, không bấm, không href, không tooltip). Mặc định `false`.
 * @param props.tooltip - Tooltip — BẮT BUỘC khi chip icon-only (cũng là `aria-label` của chip đó).
 * @param props.onSelect - Gọi khi bấm (click thường; Ctrl / chuột giữa trên chip có `href` mở tab mới).
 * @param props.className - Class thêm cho chip.
 * @param props.children - Nội dung thêm sau nhãn.
 *
 * @example
 * <PageHeaderChip label="Tiến độ" active current href="/progress" onSelect={openProgress} />
 * <PageHeaderChip icon="gear-outline" tooltip="Cài đặt" slant="left" onSelect={openSettings} />
 */
const PageHeaderChip = memo(function PageHeaderChip({
  label,
  shortLabel,
  icon,
  slant = 'right',
  compact = false,
  href,
  newTab,
  active = false,
  current,
  pressed,
  disabled = false,
  tooltip,
  onSelect,
  className,
  children,
}: PageHeaderChipProps) {
  const iconOnly = label == null && children == null;
  const spec = useHeaderSkinSpec();
  const chipSpec = spec.chip;
  const solid = chipSpec.look === 'solid';
  const tight = compact || TIGHT_SHAPES.includes(chipSpec.shape);

  const chipClassName = cn(
    pageNavItemClassName({
      active,
      iconOnly,
      compact: tight,
      solid,
    }),
    disabled && 'pointer-events-none opacity-50',
    className,
  );

  const chip = (
    <ChipElement
      aria-label={iconOnly ? tooltip : undefined}
      ariaCurrent={current}
      ariaPressed={pressed}
      className={chipClassName}
      disabled={disabled}
      href={href}
      newTab={newTab}
      onActivate={onSelect}
    >
      <ChipSurface active={active} slant={slant} />

      {icon && <SystemIcon name={icon} />}
      {label != null &&
        (shortLabel ? (
          <>
            <span className={PAGE_NAV_SLOT_CLASSES.labelFull}>{label}</span>
            <span className={PAGE_NAV_SLOT_CLASSES.labelShort}>{shortLabel}</span>
          </>
        ) : (
          <span className={PAGE_NAV_SLOT_CLASSES.label}>{label}</span>
        ))}
      {children}
    </ChipElement>
  );

  if (!tooltip || disabled) return chip;

  return (
    <Tooltip content={tooltip} side="bottom">
      {chip}
    </Tooltip>
  );
});

export default PageHeaderChip;
