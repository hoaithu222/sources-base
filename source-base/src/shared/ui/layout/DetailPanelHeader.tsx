import { memo, type CSSProperties, type ReactNode } from 'react';

import { cn } from '@/shared/utils/style/cn';
import { TEXT_ELLIPSIS_CLASSES } from '@/shared/ui/primitives/text-ellipsis.theme';
import type { TitleIconColor } from './TitleScreen';

export type DetailPanelHeaderSize = 'md' | 'sm';
export type DetailPanelHeaderTitleVariant = 'gradient' | 'solid';

export interface DetailPanelHeaderProps {
  title: ReactNode;
  action?: ReactNode;
  size?: DetailPanelHeaderSize;
  titleVariant?: DetailPanelHeaderTitleVariant;
  tone?: TitleIconColor;
  brackets?: boolean;
  className?: string;
  innerClassName?: string;
}

type BracketCorner = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

const DETAIL_PANEL_HEADER_ROOT_CLASSES = 'relative flex shrink-0 items-center overflow-hidden';

const DETAIL_PANEL_HEADER_ROOT_SIZE_CLASSES = {
  md: 'min-h-8',
  sm: 'min-h-8',
} satisfies Record<DetailPanelHeaderSize, string>;

const DETAIL_PANEL_HEADER_WASH_CLASSES = 'pointer-events-none absolute inset-0 hidden dark:block';

const DETAIL_PANEL_HEADER_INNER_CLASSES =
  'relative z-10 flex flex-1 items-center max-lg:min-w-0 touch:min-w-0 phone:flex-wrap phone:gap-y-1';

const DETAIL_PANEL_HEADER_INNER_SIZE_CLASSES = {
  md: 'gap-2 px-3 max-lg:gap-1.5 max-lg:px-2',
  sm: 'gap-1.5 px-2',
} satisfies Record<DetailPanelHeaderSize, string>;

const DETAIL_PANEL_HEADER_BAR_CLASSES = 'w-[3px] -skew-x-[20deg]';

const DETAIL_PANEL_HEADER_BAR_SIZE_CLASSES = {
  md: 'h-3',
  sm: 'h-2.5',
} satisfies Record<DetailPanelHeaderSize, string>;

const DETAIL_PANEL_HEADER_BAR_GLOW_CLASSES = 'dark:shadow-[0_0_6px_var(--dph-tone)]';

const DETAIL_PANEL_HEADER_TITLE_CLASSES = cn(
  TEXT_ELLIPSIS_CLASSES,
  'flex-1 text-fg-heading phone:basis-40',
);

const DETAIL_PANEL_HEADER_TITLE_SIZE_CLASSES = {
  md: 'text-body-14-semibold max-lg:text-caption-12-semibold',
  sm: 'text-caption-12-semibold',
} satisfies Record<DetailPanelHeaderSize, string>;

const DETAIL_PANEL_HEADER_TITLE_VARIANT_CLASSES = {
  gradient: cn(
    'dark:bg-[linear-gradient(180deg,var(--color-fg-heading)_35%,var(--dph-title-end)_100%)]',
    'dark:bg-clip-text dark:[-webkit-background-clip:text] dark:text-transparent',
  ),
  solid: '',
} satisfies Record<DetailPanelHeaderTitleVariant, string>;

const DETAIL_PANEL_HEADER_TITLE_NODE_CLASSES = cn(
  'min-w-0 flex-1 phone:basis-40',
  'max-lg:overflow-x-clip max-lg:overflow-y-visible touch:overflow-x-clip touch:overflow-y-visible',
);

const DETAIL_PANEL_HEADER_ACTION_CLASSES = cn(
  'scrollbar-hidden flex shrink-0 items-center gap-2',
  'max-lg:min-w-0 max-lg:shrink max-lg:overflow-x-auto max-lg:overscroll-x-contain',
  'touch:min-w-0 touch:shrink touch:overflow-x-auto touch:overscroll-x-contain',
  'phone:ml-auto phone:max-w-full',
);

const DETAIL_PANEL_HEADER_BRACKET_BASE_CLASSES =
  'pointer-events-none absolute z-20 size-2 border-secondary-5';

const DETAIL_PANEL_HEADER_BRACKET_CLASSES = {
  'top-left': 'left-0 top-0 border-l-[1.5px] border-t-[1.5px]',
  'top-right': 'right-0 top-0 border-r-[1.5px] border-t-[1.5px]',
  'bottom-left': 'bottom-0 left-0 border-b-[1.5px] border-l-[1.5px]',
  'bottom-right': 'bottom-0 right-0 border-b-[1.5px] border-r-[1.5px]',
} satisfies Record<BracketCorner, string>;

const bandStyle = (tone: TitleIconColor): CSSProperties => ({
  backgroundImage: `linear-gradient(to right,
    color-mix(in srgb, var(--color-${tone}-5) 26%, transparent) 0%,
    color-mix(in srgb, var(--color-${tone}-5) 8%, transparent) 28%,
    transparent 55%)`,
});

const stripeStyle = (tone: TitleIconColor): CSSProperties => ({
  backgroundImage: `repeating-linear-gradient(122deg,
    transparent 0 14px,
    color-mix(in srgb, var(--color-${tone}-5) 12%, transparent) 14px 28px)`,
  WebkitMaskImage: 'linear-gradient(to right, black 0, black 60px, transparent 140px)',
  maskImage: 'linear-gradient(to right, black 0, black 60px, transparent 140px)',
});

/** Biến tone cho class `dark:` (quầng vạch, đuôi dốc chữ) — class không đọc được prop. */
const rootStyle = (tone: TitleIconColor): CSSProperties => ({
  ['--dph-tone' as string]: `var(--color-${tone}-5)`,
  ['--dph-title-end' as string]: `color-mix(in srgb, var(--color-${tone}-3) 75%, var(--color-fg-heading))`,
});

/**
 * DetailPanelHeader — header kiểu cyber của panel chi tiết (Figma 10144-464978): ba vạch nghiêng
 * + tiêu đề + slot hành động, dải nền và sọc chéo theo `tone`, đường kẻ sáng trên / dưới.
 *
 * Đặt ở đầu panel chi tiết; `tone` trùng tone của khung bọc ngoài (`HudFrame` / `PanelCard`). Header
 * cấp MÀN HÌNH dùng `TitleScreen`, thanh tiêu đề section gọn dùng `SectionHeader`.
 * Sửa giao diện: `DETAIL_PANEL_HEADER_*_SIZE_CLASSES` · `DETAIL_PANEL_HEADER_TITLE_*_CLASSES` (chữ gradient ở
 * `DETAIL_PANEL_HEADER_TITLE_VARIANT_CLASSES`) · slot hành động → `DETAIL_PANEL_HEADER_ACTION_CLASSES` · nền / sọc
 * → `bandStyle` / `stripeStyle` (lớp `DETAIL_PANEL_HEADER_WASH_CLASSES`) · quầng vạch →
 * `DETAIL_PANEL_HEADER_BAR_GLOW_CLASSES` · biến tone cho class `dark:` → `rootStyle` · ngoặc góc →
 * `DETAIL_PANEL_HEADER_BRACKET_BASE_CLASSES` + `DETAIL_PANEL_HEADER_BRACKET_CLASSES`.
 * Lưu ý: dải nền + sọc chéo, quầng vạch, chữ dốc màu CHỈ ở theme tối; theme sáng còn nét mảnh + vạch.
 * Lưu ý: `title` ReactNode render trần trong `<div>`, KHÔNG bọc `<p>` (breadcrumb / nav là block). Co /
 * cắt / cuộn ngang của tiêu đề và slot hành động gate bằng `max-lg:` + `touch:`; `scrollbar-hidden` để
 * trần không tiền tố. Điện thoại (`phone:`): hàng trong `flex-wrap` — slot hành động không đủ chỗ cạnh tiêu đề (sàn
 * 10rem) thì xuống hàng riêng canh phải — docs/notes/components/layout.md.
 *
 * @param props.title - Tiêu đề: chuỗi → cắt `…`, áp `titleVariant` | ReactNode (breadcrumb…)
 *   → render nguyên trong `<div>`, bỏ qua `titleVariant` (bắt buộc).
 * @param props.action - Slot hành động bên phải (thường `Button size="xs" variant="ghost"`).
 * @param props.size - `md` (chữ 14px, hạ 12px dưới `lg`) | `sm` (chữ 12px đặc, panel dày dữ liệu).
 *   Mặc định `md`.
 * @param props.titleVariant - `gradient` (theme tối: trắng → tone; theme sáng: chữ đặc) | `solid` (luôn đặc —
 *   màn dày số liệu); `size="sm"` luôn đặc. Mặc định `gradient`.
 * @param props.tone - Tone vạch / dải nền / đường kẻ, cùng bộ `TitleIconColor` của `TitleScreen` /
 *   `HudFrame`. Mặc định `sky`.
 * @param props.brackets - `true` → ngoặc [ ] bốn góc; chỉ bật khi header đứng một mình (trong
 *   `HudFrame` đã có ngoặc). Mặc định `false`.
 * @param props.className - Class thêm cho khung ngoài (vd chiều cao, viền).
 * @param props.innerClassName - Class của hàng trong (vạch + tiêu đề + hành động), THAY mặc định — vd
 *   `"p-1"` khi panel dày. Mặc định `"py-1"`.
 *
 * @example
 * <DetailPanelHeader
 *   action={<Button size="xs" startIcon={<SystemIcon name="expand-outline" />} variant="ghost">Mở rộng</Button>}
 *   title="Sơ đồ tổ chức"
 *   tone="sky"
 * />
 *
 * <DetailPanelHeader brackets size="sm" title="Thiết bị" tone="teal" />
 */
const DetailPanelHeader = memo(function DetailPanelHeader({
  title,
  action,
  tone = 'sky',
  size = 'md',
  titleVariant = 'gradient',
  brackets = false,
  className,
  innerClassName = 'py-1',
}: DetailPanelHeaderProps) {
  const toneVar = `var(--color-${tone}-5)`;
  const lineFade = `linear-gradient(to right, transparent 0%, color-mix(in srgb, ${toneVar} 50%, transparent) 50%, transparent 100%)`;
  const useGradientTitle = size === 'md' && titleVariant === 'gradient';

  const rootClassName = cn(
    DETAIL_PANEL_HEADER_ROOT_CLASSES,
    DETAIL_PANEL_HEADER_ROOT_SIZE_CLASSES[size],
    className,
  );
  const innerRowClassName = cn(
    DETAIL_PANEL_HEADER_INNER_CLASSES,
    DETAIL_PANEL_HEADER_INNER_SIZE_CLASSES[size],
    innerClassName,
  );
  const barClassName = cn(
    DETAIL_PANEL_HEADER_BAR_CLASSES,
    DETAIL_PANEL_HEADER_BAR_SIZE_CLASSES[size],
  );
  const titleClassName = cn(
    DETAIL_PANEL_HEADER_TITLE_CLASSES,
    DETAIL_PANEL_HEADER_TITLE_SIZE_CLASSES[size],
    DETAIL_PANEL_HEADER_TITLE_VARIANT_CLASSES[useGradientTitle ? 'gradient' : 'solid'],
  );

  return (
    <div className={rootClassName} style={rootStyle(tone)}>
      <div aria-hidden className={DETAIL_PANEL_HEADER_WASH_CLASSES}>
        <div className="absolute inset-0" style={bandStyle(tone)} />
        <div className="absolute inset-0" style={stripeStyle(tone)} />
      </div>

      <div className="absolute inset-x-0 top-0 z-10 flex items-center">
        <div className="h-px w-12 shrink-0" style={{ background: toneVar }} />
        <div className="h-px flex-1" style={{ background: lineFade }} />
      </div>

      {brackets &&
        Object.entries(DETAIL_PANEL_HEADER_BRACKET_CLASSES).map(([corner, bracketClassName]) => (
          <span
            key={corner}
            aria-hidden
            className={cn(DETAIL_PANEL_HEADER_BRACKET_BASE_CLASSES, bracketClassName)}
          />
        ))}

      <div className={innerRowClassName}>
        <span aria-hidden className="flex shrink-0 items-center gap-[3px]">
          <span
            className={cn(barClassName, DETAIL_PANEL_HEADER_BAR_GLOW_CLASSES)}
            style={{ background: toneVar }}
          />
          <span
            className={barClassName}
            style={{ background: `color-mix(in srgb, ${toneVar} 72%, transparent)` }}
          />
          <span
            className={barClassName}
            style={{ background: `color-mix(in srgb, ${toneVar} 42%, transparent)` }}
          />
        </span>

        {typeof title === 'string' ? (
          <span className={titleClassName}>{title}</span>
        ) : (
          <div className={DETAIL_PANEL_HEADER_TITLE_NODE_CLASSES}>{title}</div>
        )}
        {action && <div className={DETAIL_PANEL_HEADER_ACTION_CLASSES}>{action}</div>}
      </div>

      <div className="absolute inset-x-0 bottom-0 z-10 flex items-center gap-2">
        <div className="flex shrink-0 items-center gap-[2px]">
          <div className="h-px w-2 bg-secondary-6" />
          <div className="h-px w-2 bg-secondary-5" />
          <div className="h-px w-2 bg-secondary-4" />
        </div>
        <div className="h-px flex-1" style={{ background: lineFade }} />
      </div>
    </div>
  );
});

export default DetailPanelHeader;
