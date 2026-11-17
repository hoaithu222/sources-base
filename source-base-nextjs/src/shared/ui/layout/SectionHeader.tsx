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

/** Dải nền chìm `bg-subtle` bo `rounded-md`, không đường kẻ — cùng một hình ở cả hai theme. */
const SECTION_HEADER_ROOT_CLASSES = 'relative flex w-full flex-col rounded-md bg-bg-subtle';

/** Vạch dọc bo tròn theo tone (cùng hình `HUD_TITLE_MARK` — hud.theme.ts), màu từ `--section-tone`. */
const SECTION_HEADER_ACCENT_CLASSES =
  'ml-0.5 h-3.5 w-[3px] shrink-0 rounded-xs bg-[var(--section-tone)]';

const SECTION_HEADER_DOT_CLASSES = 'size-1 shrink-0 rounded-full bg-[var(--section-tone)]';

/**
 * SectionHeader — thanh tiêu đề gọn một hàng của một section / panel trong trang: vạch dọc theo tone (khi `accent`), chấm
 * hoặc icon, tiêu đề + mô tả, slot bên phải; dải nền chìm bo góc, không đường kẻ — cùng một hình ở cả hai theme.
 *
 * Header cấp MÀN HÌNH dùng `TitleScreen`; header panel có vạch tone + vạch ngăn đáy dùng
 * `DetailPanelHeader`.
 * Sửa giao diện: nền → `SECTION_HEADER_ROOT_CLASSES` · vạch dọc → `SECTION_HEADER_ACCENT_CLASSES`
 * · chấm → `SECTION_HEADER_DOT_CLASSES`.
 * Lưu ý: nền `bg-subtle` tự lật theo theme. Màu tone đi qua biến `--section-tone` đặt trong `style` (không hex
 * cứng) — docs/notes/components/layout.md.
 *
 * @param props.title - Tiêu đề, một dòng, cắt `…` khi tràn (bắt buộc).
 * @param props.description - Dòng mô tả nhỏ dưới tiêu đề.
 * @param props.right - Slot bên phải (nút, bộ lọc nhỏ, badge), không co.
 * @param props.icon - Icon trước tiêu đề (14px), thay chấm mặc định — dùng biến thể `-outline`.
 * @param props.iconColor - Tone của icon / chấm / vạch dọc. Không truyền → icon theo màu chữ,
 *   chấm `teal`, không có vạch dọc.
 * @param props.accent - `true` → vạch dọc theo tone trước icon (thay chấm khi không có icon); CHỈ hiện khi
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
