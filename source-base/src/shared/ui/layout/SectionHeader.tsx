import { cn } from '@/shared/utils/style/cn';
import { SystemIcon } from '@/shared/ui/icons/Icons';
import type { SystemIconName } from '@/shared/ui/icons';
import { TEXT_ELLIPSIS_CLASSES } from '@/shared/ui/primitives/text-ellipsis.theme';
import type { TitleIconColor } from './TitleScreen';

export type SectionHeaderProps = {
  title: string;
  description?: string;
  right?: React.ReactNode;
  icon?: SystemIconName;
  iconColor?: TitleIconColor;
  accent?: boolean;
  className?: string;
};

const SECTION_HEADER_ROOT_CLASSES = cn(
  'relative flex w-full flex-col',
  'after:pointer-events-none after:absolute after:bottom-0 after:left-0 after:right-0 after:h-px',
  'after:bg-[linear-gradient(to_right,transparent,var(--color-teal-5),transparent)]',
  'dark:after:shadow-[0_0_6px_color-mix(in_srgb,var(--color-teal-5)_55%,transparent)]',
  'bg-[linear-gradient(to_left,transparent,color-mix(in_srgb,var(--color-sky-5)_18%,transparent))]',
  'dark:bg-[linear-gradient(to_left,transparent,color-mix(in_srgb,var(--color-sky-8)_50%,transparent))]',
);

/** Dấu `//` theo tone — cùng hình `HUD_TITLE_MARK` (hud.theme.ts) nhưng màu lấy từ `--section-tone`. */
const SECTION_HEADER_ACCENT_CLASSES = cn(
  'ml-0.5 h-4 w-[11px] shrink-0 -skew-x-[24deg]',
  'bg-[linear-gradient(90deg,var(--section-tone)_0_4px,transparent_4px_7px,color-mix(in_srgb,var(--section-tone)_55%,transparent)_7px_11px)]',
  'dark:drop-shadow-[0_0_5px_color-mix(in_srgb,var(--section-tone)_70%,transparent)]',
);

const SECTION_HEADER_DOT_CLASSES =
  'size-1 shrink-0 rounded-full bg-[var(--section-tone)] dark:shadow-[0_0_6px_var(--section-tone)]';

/**
 * SectionHeader — thanh tiêu đề gọn một hàng của một section / panel trong trang: dấu `//` (khi `accent`),
 * chấm sáng hoặc icon, tiêu đề + mô tả, slot bên phải; đường kẻ phát sáng ở đáy.
 *
 * Header cấp MÀN HÌNH dùng `TitleScreen`; header panel kiểu cyber (vạch nghiêng, sọc) dùng
 * `DetailPanelHeader`.
 * Sửa giao diện: nền + đường kẻ đáy → `SECTION_HEADER_ROOT_CLASSES` · dấu `//` → `SECTION_HEADER_ACCENT_CLASSES`
 * · chấm sáng → `SECTION_HEADER_DOT_CLASSES`.
 * Lưu ý: nền đổi theo theme (`sky-5` 18% sáng / `sky-8` 50% tối, tách bằng `dark:`); quầng sáng (đường kẻ
 * đáy, dấu `//`, chấm) CHỈ ở theme tối. Màu tone đi qua biến `--section-tone` đặt trong `style` (không hex
 * cứng) — docs/notes/components/layout.md.
 *
 * @param props.title - Tiêu đề, một dòng, cắt `…` khi tràn (bắt buộc).
 * @param props.description - Dòng mô tả nhỏ dưới tiêu đề.
 * @param props.right - Slot bên phải (nút, bộ lọc nhỏ, badge), không co.
 * @param props.icon - Icon trước tiêu đề (14px), thay chấm sáng mặc định — dùng biến thể `-outline`.
 * @param props.iconColor - Tone của icon / chấm sáng / dấu `//`. Không truyền → icon theo màu chữ,
 *   chấm sáng `teal`, không có dấu `//`.
 * @param props.accent - `true` → dấu `//` theo tone trước icon (thay chấm sáng khi không có icon); CHỈ hiện khi
 *   có `iconColor`. Mặc định `false`.
 * @param props.className - Class thêm cho khung ngoài.
 *
 * @example
 * <SectionHeader accent icon="user-outline" iconColor="sky" title="Hồ sơ cá nhân" />
 *
 * <SectionHeader description="Tuần này" right={<Button size="xs">Xem tất cả</Button>} title="Tiến độ" />
 */
function SectionHeader({
  title,
  description,
  right,
  icon,
  iconColor,
  accent = false,
  className,
}: SectionHeaderProps) {
  const tone = iconColor ?? 'teal';
  const showAccentMark = accent && iconColor != null;
  const toneStyle = { ['--section-tone' as string]: `var(--color-${tone}-5)` };

  return (
    <div className={cn(SECTION_HEADER_ROOT_CLASSES, className)} style={toneStyle}>
      <div className="flex w-full items-center justify-between gap-2 px-2 py-1.5">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          {showAccentMark && <span aria-hidden className={SECTION_HEADER_ACCENT_CLASSES} />}
          {icon ? (
            <SystemIcon
              className="shrink-0"
              name={icon}
              size={14}
              style={iconColor ? { color: 'var(--section-tone)' } : undefined}
            />
          ) : showAccentMark ? null : (
            <span aria-hidden className={SECTION_HEADER_DOT_CLASSES} />
          )}

          <div className="flex min-w-0 flex-col justify-center">
            <p className={cn('text-body-14-semibold text-fg-heading', TEXT_ELLIPSIS_CLASSES)}>
              {title}
            </p>
            {description && (
              <p className={cn('text-caption-12 text-fg-muted', TEXT_ELLIPSIS_CLASSES)}>
                {description}
              </p>
            )}
          </div>
        </div>

        {right && <div className="flex shrink-0 items-center gap-2">{right}</div>}
      </div>
    </div>
  );
}

export default SectionHeader;
