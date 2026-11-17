'use client';

import { useTranslations } from 'next-intl';
import { cn } from '@/shared/utils/style/cn';
import { SystemIcon } from '@/shared/ui/icons/Icons';
import type { SystemIconName } from '@/shared/ui/icons';
import Text from '@/shared/ui/primitives/Text';
import { TEXT_ELLIPSIS_CLASSES } from '@/shared/ui/primitives/text-ellipsis.theme';
import { TOUCH_HIT_CLASSES } from '@/shared/ui/primitives/touch-hit.theme';

/** Tone dùng chung với `HudFrame` / `PanelCard` / `DetailPanelHeader`; mỗi tone cần `--color-{tone}-3…6`. */
export type TitleIconColor =
  | 'blue'
  | 'green'
  | 'yellow'
  | 'orange'
  | 'red'
  | 'purple'
  | 'sky'
  | 'teal'
  | 'indigo'
  | 'pink'
  | 'fuchsia'
  | 'azure';

export interface TitleScreenProps {
  icon?: SystemIconName;
  iconColor?: TitleIconColor;
  title: string;
  subtitle?: string;
  titleTrailing?: React.ReactNode;
  summary?: React.ReactNode;
  right?: React.ReactNode;
  onBack?: () => void;
  brackets?: boolean;
  className?: string;
}

const TITLE_SCREEN_ROOT_CLASSES = 'relative flex w-full shrink-0 flex-col gap-0';

const TITLE_SCREEN_BACK_CLASSES = cn(
  TOUCH_HIT_CLASSES.icon,
  'flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-md text-fg-body',
  'transition-[color,background-color] duration-150 ease-out',
  'hover:bg-bg-nav-hover hover:text-fg-heading active:bg-bg-nav-active',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring-focus',
);

const TITLE_SCREEN_TITLE_CLASSES = cn(TEXT_ELLIPSIS_CLASSES, 'm-0 block text-h4-semibold');

/** Ô icon: ô bo `rounded-lg` tô nhạt theo tone + glyph bậc 6 (cùng ngôn ngữ tông của `AppTile`). */
const TITLE_SCREEN_ICON_CLASSES = cn(
  'relative flex size-8 shrink-0 items-center justify-center rounded-lg text-(--title-screen-ink)',
  'bg-[color-mix(in_srgb,var(--title-screen-ink)_12%,var(--color-bg-surface))]',
  'ring-1 ring-inset ring-[color-mix(in_srgb,var(--title-screen-ink)_20%,transparent)]',
);

/** Nhãn phụ (vd "PROJECTS"): giãn chữ nhẹ, mực muted. */
const TITLE_SCREEN_SUBTITLE_CLASSES = cn(
  TEXT_ELLIPSIS_CLASSES,
  'shrink-[3] text-caption-10-medium uppercase tracking-[0.08em] text-fg-muted',
);

/** Vạch ngăn trước nhãn phụ: `border-strong`. */
const TITLE_SCREEN_SUBTITLE_DIVIDER_CLASSES = 'h-4 w-px shrink-0 bg-border-strong';

/** Đường đáy: một nét 1px `divider-default`. */
const TITLE_SCREEN_UNDERLINE_CLASSES = 'mt-2 h-px w-full shrink-0 bg-divider-default';

/** Biến tone cho class (màu glyph / nền ô icon) — class không đọc được prop. */
const titleVars = (tone: TitleIconColor): React.CSSProperties => ({
  ['--title-screen-ink' as string]: `var(--color-${tone}-6)`,
});

/**
 * TitleScreen — header của MỘT màn hình: nút quay lại + khối icon + tiêu đề `<h1>` (+ nhãn phụ), dải
 * KPI ở giữa và cụm hành động bên phải; nét ngăn 1px `divider-default` ở đáy. Cùng một hình ở cả hai theme.
 *
 * Đặt đầu tiên trong `<PageShell>`. Header của panel dùng `DetailPanelHeader`, của section dùng
 * `SectionHeader`. Điều hướng về một URL cụ thể thì đặt `<Button asChild><Link …/></Button>` vào `right`
 * thay vì `onBack` (docs/rules/interaction/navigable-controls.md).
 * Sửa giao diện: ô icon → `TITLE_SCREEN_ICON_CLASSES` + biến tone `titleVars` · chữ → `TITLE_SCREEN_TITLE_CLASSES` ·
 * nhãn phụ → `TITLE_SCREEN_SUBTITLE_*` · nút quay lại → `TITLE_SCREEN_BACK_CLASSES` · đường đáy →
 * `TITLE_SCREEN_UNDERLINE_CLASSES`.
 * Lưu ý: chữ đặc `fg-heading`, ô icon tô nhạt bo `rounded-lg`, một nét đáy `divider-default`; nền dải + sọc, ngoặc góc, ba
 * vạch nghiêng, đường kẻ tone, chữ dốc màu và quầng kiểu HUD đã gỡ ở source-base-rouded.
 * Lưu ý: tiêu đề là `<h1>` THẬT (trình đọc màn hình nhảy theo heading) — đừng đổi lại `<span>`; một trang
 * chỉ có một TitleScreen, và trang đã có `<PageHeader>` thì KHÔNG dùng (page-structure.md §3b). Thêm tone mới
 * ở `TitleIconColor` thì palette phải có đủ `--color-{tone}-3…6` — docs/notes/components/layout.md.
 *
 * @param props.icon - Icon trong ô trước tiêu đề (ô bo tròn; thường biến thể `-bold`).
 * @param props.iconColor - Tone của ô icon. Mặc định `yellow`.
 * @param props.title - Tiêu đề màn hình, render `<h1>`, cắt `…` khi tràn (bắt buộc).
 * @param props.subtitle - Nhãn phụ sau vạch ngăn (thường tiếng Anh, viết hoa) — kiểu "tiêu đề kép" của
 *   dashboard màn lớn.
 * @param props.titleTrailing - Chèn ngay sau tiêu đề — vd breadcrumb, badge trạng thái.
 * @param props.summary - Slot GIỮA tiêu đề và `right` — thường dải KPI `<SummaryPill>` (nhận Fragment);
 *   giữ nguyên bề ngang nội dung nên không đủ chỗ cạnh tiêu đề thì xuống hàng riêng (không bị bóp / cắt); tự cuộn
 *   ngang khi hẹp (điện thoại thì xuống dòng), có thì tự chèn vạch dọc trước `right` (ẩn dưới `lg`).
 * @param props.right - Cụm hành động bên phải (nút, bộ lọc), không co; không đủ chỗ (điện thoại, máy tính bảng) thì xuống
 *   hàng riêng canh phải và tự xuống dòng khi dài, tiêu đề thì cắt `…` thay vì đẩy tràn.
 * @param props.onBack - Có thì hiện nút mũi tên "Quay lại" (`ui.common.back`, theo ngôn ngữ) ở đầu hàng.
 * @param props.brackets - @deprecated — vô hiệu ở source-base-rouded, sẽ bị gỡ ở GĐ 2. Ngoặc [ ] hai góc trên cũ.
 * @param props.className - Class thêm cho khung ngoài.
 *
 * @example
 * <TitleScreen icon="house-bold" iconColor="sky" title="Tổng quan" right={<Button size="sm">Thêm</Button>} />
 *
 * <TitleScreen
 *   subtitle="PROJECT OVERVIEW"
 *   summary={<><SummaryPill … /><SummaryPill … /></>}
 *   title="Tổng quan dự án"
 *   onBack={() => navigate(-1)}
 * />
 */
function TitleScreen({
  icon,
  iconColor = 'yellow',
  title,
  subtitle,
  titleTrailing,
  summary,
  right,
  onBack,
  className,
}: TitleScreenProps) {
  const t = useTranslations('ui.common');
  const hasSummary = summary != null && summary !== false;

  return (
    <div className={cn(TITLE_SCREEN_ROOT_CLASSES, className)} style={titleVars(iconColor)}>
      <div className="relative flex w-full flex-wrap items-center justify-between gap-x-2 gap-y-1">
        <div className="flex max-w-full min-w-0 items-center gap-2">
          {onBack && (
            <button
              aria-label={t('back')}
              className={TITLE_SCREEN_BACK_CLASSES}
              type="button"
              onClick={onBack}
            >
              <SystemIcon name="angle-left-outline" size={18} />
            </button>
          )}

          {icon && (
            <div className={TITLE_SCREEN_ICON_CLASSES}>
              <SystemIcon name={icon} size={18} />
            </div>
          )}

          <Text as="h1" className={TITLE_SCREEN_TITLE_CLASSES} size="large">
            {title}
          </Text>

          {subtitle && (
            <>
              <span aria-hidden className={TITLE_SCREEN_SUBTITLE_DIVIDER_CLASSES} />
              <span className={TITLE_SCREEN_SUBTITLE_CLASSES}>{subtitle}</span>
            </>
          )}

          {titleTrailing}
        </div>

        {hasSummary && (
          <div className="scrollbar-hidden flex min-w-0 flex-auto items-center justify-end gap-2 overflow-x-auto overscroll-x-contain phone:flex-wrap phone:justify-start phone:overflow-visible">
            {summary}
          </div>
        )}

        {right && (
          <div className="ml-auto flex max-w-full shrink-0 flex-wrap items-center justify-end gap-2">
            {hasSummary && <div className="h-5 w-px shrink-0 bg-border-strong max-lg:hidden" />}
            {right}
          </div>
        )}
      </div>

      <div aria-hidden className={TITLE_SCREEN_UNDERLINE_CLASSES} />
    </div>
  );
}

export default TitleScreen;
