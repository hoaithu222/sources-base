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

const TITLE_SCREEN_BRACKET_CLASSES = {
  left: 'pointer-events-none absolute -left-1 -top-1 size-2.5 border-l-[1.5px] border-t-[1.5px]',
  right: 'pointer-events-none absolute -right-1 -top-1 size-2.5 border-r-[1.5px] border-t-[1.5px]',
} satisfies Record<'left' | 'right', string>;

const TITLE_SCREEN_BAND_CLASSES = 'pointer-events-none absolute inset-0 hidden dark:block';

const TITLE_SCREEN_BACK_CLASSES = cn(
  TOUCH_HIT_CLASSES.icon,
  'flex size-7 shrink-0 cursor-pointer items-center justify-center text-fg-body',
  'transition-[color,background-color] duration-150 ease-out',
  'hover:bg-bg-nav-hover hover:text-fg-heading active:bg-bg-nav-active',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring-focus',
);

const TITLE_SCREEN_TITLE_CLASSES = cn(
  TEXT_ELLIPSIS_CLASSES,
  'm-0 block text-h4-semibold',
  'dark:bg-[linear-gradient(180deg,var(--color-fg-heading)_30%,var(--title-screen-end)_100%)]',
  'dark:bg-clip-text dark:[-webkit-background-clip:text] dark:text-transparent',
  'dark:[filter:drop-shadow(0_0_10px_var(--title-screen-glow))]',
);

const TITLE_SCREEN_STRIPE_CLASSES = 'h-3.5 w-1 -skew-x-[20deg]';

const TITLE_SCREEN_GLOW_CLASSES = {
  stripe: 'dark:shadow-[0_0_4px_var(--title-screen-tone)]',
  underline: 'dark:shadow-[0_0_8px_var(--title-screen-tone)]',
} satisfies Record<'stripe' | 'underline', string>;

const iconStyle = (tone: TitleIconColor): React.CSSProperties => ({
  clipPath: 'polygon(7px 0, 100% 0, 100% calc(100% - 7px), calc(100% - 7px) 100%, 0 100%, 0 7px)',
  border: `1px solid var(--color-${tone}-3)`,
  background: `linear-gradient(to bottom right, var(--color-${tone}-4), var(--color-${tone}-6))`,
  boxShadow: `inset 0 0 10px 0 var(--color-${tone}-4)`,
});

const bandStyle = (tone: TitleIconColor): React.CSSProperties => ({
  backgroundImage: `linear-gradient(to right,
      color-mix(in srgb, var(--color-${tone}-5) 14%, transparent) 0%,
      color-mix(in srgb, var(--color-${tone}-5) 4%, transparent) 22%,
      transparent 45%),
    repeating-linear-gradient(122deg,
      transparent 0 16px,
      color-mix(in srgb, var(--color-${tone}-5) 5%, transparent) 16px 32px)`,
  WebkitMaskImage: 'linear-gradient(to right, black 0, black 120px, transparent 320px)',
  maskImage: 'linear-gradient(to right, black 0, black 120px, transparent 320px)',
});

/** Biến tone cho các class `dark:` (đuôi dốc chữ, quầng chữ, quầng vạch) — class không đọc được prop. */
const titleVars = (tone: TitleIconColor): React.CSSProperties => ({
  ['--title-screen-tone' as string]: `var(--color-${tone}-5)`,
  ['--title-screen-end' as string]: `color-mix(in srgb, var(--color-${tone}-4) 80%, var(--color-fg-heading))`,
  ['--title-screen-glow' as string]: `color-mix(in srgb, var(--color-${tone}-5) 40%, transparent)`,
});

/**
 * TitleScreen — header của MỘT màn hình: nút quay lại + khối icon + tiêu đề `<h1>` (+ nhãn phụ), dải
 * KPI ở giữa và cụm hành động bên phải; đường kẻ sáng theo tone ở đáy.
 *
 * Đặt đầu tiên trong `<PageShell>`. Header của panel dùng `DetailPanelHeader`, của section dùng
 * `SectionHeader`. Điều hướng về một URL cụ thể thì đặt `<Button asChild><Link …/></Button>` vào `right`
 * thay vì `onBack` (docs/rules/interaction/navigable-controls.md).
 * Sửa giao diện: nền + sọc → `bandStyle` (lớp `TITLE_SCREEN_BAND_CLASSES`) · khối icon → `iconStyle` · chữ →
 * `TITLE_SCREEN_TITLE_CLASSES` + biến tone `titleVars` · nút quay lại → `TITLE_SCREEN_BACK_CLASSES` · ngoặc góc
 * → `TITLE_SCREEN_BRACKET_CLASSES` · vạch nghiêng → `TITLE_SCREEN_STRIPE_CLASSES` · quầng vạch / đường kẻ →
 * `TITLE_SCREEN_GLOW_CLASSES`.
 * Lưu ý: nền + sọc, chữ dốc màu và quầng CHỈ ở theme tối; theme sáng chữ đặc `fg-heading`.
 * Lưu ý: tiêu đề là `<h1>` THẬT (trình đọc màn hình nhảy theo heading) — đừng đổi lại `<span>`; một trang
 * chỉ có một TitleScreen, và trang đã có `<PageHeader>` thì KHÔNG dùng (page-structure.md §3b). Thêm tone mới
 * ở `TitleIconColor` thì palette phải có đủ `--color-{tone}-3…6` — docs/notes/components/layout.md.
 *
 * @param props.icon - Icon trong khối vuông vát góc trước tiêu đề (thường biến thể `-bold`).
 * @param props.iconColor - Tone của khối icon, chữ gradient (theme tối), vạch và đường kẻ. Mặc định `yellow`.
 * @param props.title - Tiêu đề màn hình, render `<h1>`, cắt `…` khi tràn (bắt buộc).
 * @param props.subtitle - Nhãn phụ sau vạch ngăn (thường tiếng Anh, viết hoa) — kiểu "tiêu đề kép" của
 *   dashboard màn lớn.
 * @param props.titleTrailing - Chèn ngay sau tiêu đề và ba vạch nghiêng (vd breadcrumb, badge trạng thái).
 * @param props.summary - Slot GIỮA tiêu đề và `right` — thường dải KPI `<SummaryPill>` (nhận Fragment);
 *   giữ nguyên bề ngang nội dung nên không đủ chỗ cạnh tiêu đề thì xuống hàng riêng (không bị bóp / cắt); tự cuộn
 *   ngang khi hẹp (điện thoại thì xuống dòng), có thì tự chèn vạch dọc trước `right` (ẩn dưới `lg`).
 * @param props.right - Cụm hành động bên phải (nút, bộ lọc), không co; không đủ chỗ (điện thoại, máy tính bảng) thì xuống
 *   hàng riêng canh phải và tự xuống dòng khi dài, tiêu đề thì cắt `…` thay vì đẩy tràn.
 * @param props.onBack - Có thì hiện nút mũi tên "Quay lại" ở đầu hàng.
 * @param props.brackets - `true` → ngoặc [ ] hai góc trên, cho trang giám sát / màn lớn. Mặc định `false`.
 * @param props.className - Class thêm cho khung ngoài.
 *
 * @example
 * <TitleScreen icon="house-bold" iconColor="sky" title="Tổng quan" right={<Button size="sm">Thêm</Button>} />
 *
 * <TitleScreen
 *   brackets
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
  brackets = false,
  className,
}: TitleScreenProps) {
  const hasSummary = summary != null && summary !== false;
  const tone = iconColor;
  const toneVar = `var(--color-${tone}-5)`;

  return (
    <div className={cn(TITLE_SCREEN_ROOT_CLASSES, className)} style={titleVars(tone)}>
      <div aria-hidden className={TITLE_SCREEN_BAND_CLASSES} style={bandStyle(tone)} />

      {brackets && (
        <>
          <span
            aria-hidden
            className={TITLE_SCREEN_BRACKET_CLASSES.left}
            style={{ borderColor: toneVar }}
          />
          <span
            aria-hidden
            className={TITLE_SCREEN_BRACKET_CLASSES.right}
            style={{ borderColor: toneVar }}
          />
        </>
      )}

      <div className="relative flex w-full flex-wrap items-center justify-between gap-x-2 gap-y-1">
        <div className="flex max-w-full min-w-0 items-center gap-2">
          {onBack && (
            <button
              aria-label="Quay lại"
              className={TITLE_SCREEN_BACK_CLASSES}
              type="button"
              onClick={onBack}
            >
              <SystemIcon name="angle-left-outline" size={18} />
            </button>
          )}

          {icon && (
            <div
              className="relative flex size-8 shrink-0 items-center justify-center"
              style={iconStyle(tone)}
            >
              <SystemIcon className="text-neutral-0" name={icon} size={18} />
            </div>
          )}

          <Text as="h1" className={TITLE_SCREEN_TITLE_CLASSES} size="large">
            {title}
          </Text>

          {subtitle && (
            <>
              <span aria-hidden className="h-4 w-px shrink-0" style={{ background: toneVar }} />
              <span
                className={cn(
                  'shrink-[3] text-caption-10-medium uppercase tracking-[0.18em] text-fg-body',
                  TEXT_ELLIPSIS_CLASSES,
                )}
              >
                {subtitle}
              </span>
            </>
          )}

          <span aria-hidden className="hidden shrink-0 items-center gap-1 md:flex">
            <span
              className={cn(TITLE_SCREEN_STRIPE_CLASSES, TITLE_SCREEN_GLOW_CLASSES.stripe)}
              style={{ background: toneVar }}
            />
            <span
              className={TITLE_SCREEN_STRIPE_CLASSES}
              style={{ background: `color-mix(in srgb, ${toneVar} 65%, transparent)` }}
            />
            <span
              className={TITLE_SCREEN_STRIPE_CLASSES}
              style={{ background: `color-mix(in srgb, ${toneVar} 35%, transparent)` }}
            />
          </span>

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

      <div aria-hidden className="relative mt-1 flex h-px w-full shrink-0 items-center gap-1">
        <span
          className={cn('h-px w-16 shrink-0', TITLE_SCREEN_GLOW_CLASSES.underline)}
          style={{ background: toneVar }}
        />
        <span
          className="h-px flex-1"
          style={{
            background: `linear-gradient(to right, color-mix(in srgb, ${toneVar} 45%, transparent) 0%, color-mix(in srgb, ${toneVar} 8%, transparent) 55%, transparent 100%)`,
          }}
        />
        <span
          className="h-px w-2 shrink-0"
          style={{ background: `color-mix(in srgb, ${toneVar} 55%, transparent)` }}
        />
        <span
          className="h-px w-1 shrink-0"
          style={{ background: `color-mix(in srgb, ${toneVar} 35%, transparent)` }}
        />
      </div>
    </div>
  );
}

export default TitleScreen;
