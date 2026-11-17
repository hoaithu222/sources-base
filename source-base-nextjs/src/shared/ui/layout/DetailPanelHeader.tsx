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

/** Vạch ngăn đáy 1px `divider-default`. */
const DETAIL_PANEL_HEADER_ROOT_CLASSES =
  'relative flex shrink-0 items-center overflow-hidden border-b border-divider-default';

const DETAIL_PANEL_HEADER_ROOT_SIZE_CLASSES = {
  md: 'min-h-8',
  sm: 'min-h-8',
} satisfies Record<DetailPanelHeaderSize, string>;

const DETAIL_PANEL_HEADER_INNER_CLASSES =
  'relative z-10 flex flex-1 items-center max-lg:min-w-0 touch:min-w-0 phone:flex-wrap phone:gap-y-1';

const DETAIL_PANEL_HEADER_INNER_SIZE_CLASSES = {
  md: 'gap-2 px-3 max-lg:gap-1.5 max-lg:px-2',
  sm: 'gap-1.5 px-2',
} satisfies Record<DetailPanelHeaderSize, string>;

/** MỘT vạch tone 3px bo tròn (bậc 6, cùng hình `HUD_TITLE_MARK`). */
const DETAIL_PANEL_HEADER_BAR_CLASSES = 'w-[3px] shrink-0 rounded-xs bg-(--dph-mark)';

const DETAIL_PANEL_HEADER_BAR_SIZE_CLASSES = {
  md: 'h-3.5',
  sm: 'h-3',
} satisfies Record<DetailPanelHeaderSize, string>;

const DETAIL_PANEL_HEADER_TITLE_CLASSES = cn(
  TEXT_ELLIPSIS_CLASSES,
  'flex-1 text-fg-heading phone:basis-40',
);

const DETAIL_PANEL_HEADER_TITLE_SIZE_CLASSES = {
  md: 'text-body-14-semibold max-lg:text-caption-12-semibold',
  sm: 'text-caption-12-semibold',
} satisfies Record<DetailPanelHeaderSize, string>;

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

/** Biến tone cho class (màu vạch `--dph-mark`) — class không đọc được prop. */
const rootStyle = (tone: TitleIconColor): CSSProperties => ({
  ['--dph-mark' as string]: `var(--color-${tone}-6)`,
});

/**
 * DetailPanelHeader — header của panel chi tiết (Figma 10144-464978): MỘT vạch tone 3px bo tròn + tiêu đề + slot hành
 * động, vạch ngăn đáy 1px; cùng một hình ở cả hai theme.
 *
 * Đặt ở đầu panel chi tiết; `tone` trùng tone của khung bọc ngoài (`HudFrame` / `PanelCard`). Header
 * cấp MÀN HÌNH dùng `TitleScreen`, thanh tiêu đề section gọn dùng `SectionHeader`.
 * Sửa giao diện: `DETAIL_PANEL_HEADER_*_SIZE_CLASSES` · vạch tone → `DETAIL_PANEL_HEADER_BAR_CLASSES` + `rootStyle` ·
 * slot hành động → `DETAIL_PANEL_HEADER_ACTION_CLASSES`.
 * Lưu ý: `title` ReactNode render trần trong `<div>`, KHÔNG bọc `<p>` (breadcrumb / nav là block). Co /
 * cắt / cuộn ngang của tiêu đề và slot hành động gate bằng `max-lg:` + `touch:`; `scrollbar-hidden` để
 * trần không tiền tố. Điện thoại (`phone:`): hàng trong `flex-wrap` — slot hành động không đủ chỗ cạnh tiêu đề (sàn
 * 10rem) thì xuống hàng riêng canh phải — docs/notes/components/layout.md. Ba vạch nghiêng, dải nền + sọc chéo, đường kẻ
 * sáng trên / dưới, ngoặc góc và chữ dốc màu kiểu HUD đã gỡ ở source-base-rouded.
 *
 * @param props.title - Tiêu đề: chuỗi → cắt `…`, chữ đặc | ReactNode (breadcrumb…) → render nguyên trong `<div>`
 *   (bắt buộc).
 * @param props.action - Slot hành động bên phải (thường `Button size="xs" variant="ghost"`).
 * @param props.size - `md` (chữ 14px, hạ 12px dưới `lg`) | `sm` (chữ 12px đặc, panel dày dữ liệu).
 *   Mặc định `md`.
 * @param props.titleVariant - @deprecated — vô hiệu ở source-base-rouded, sẽ bị gỡ ở GĐ 2. Chữ dốc màu cũ (`gradient`) |
 *   `solid`; tiêu đề luôn là chữ đặc.
 * @param props.tone - Tone của vạch dọc, cùng bộ `TitleIconColor` của `TitleScreen` / `HudFrame`. Mặc định `sky`.
 * @param props.brackets - @deprecated — vô hiệu ở source-base-rouded, sẽ bị gỡ ở GĐ 2. Ngoặc [ ] bốn góc cũ.
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
 * <DetailPanelHeader size="sm" title="Thiết bị" tone="teal" />
 */
const DetailPanelHeader = memo(function DetailPanelHeader({
  title,
  action,
  tone = 'sky',
  size = 'md',
  className,
  innerClassName = 'py-1',
}: DetailPanelHeaderProps) {
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
  );

  return (
    <div className={rootClassName} style={rootStyle(tone)}>
      <div className={innerRowClassName}>
        <span aria-hidden className="flex shrink-0 items-center gap-[3px]">
          <span className={barClassName} />
        </span>

        {typeof title === 'string' ? (
          <span className={titleClassName}>{title}</span>
        ) : (
          <div className={DETAIL_PANEL_HEADER_TITLE_NODE_CLASSES}>{title}</div>
        )}
        {action && <div className={DETAIL_PANEL_HEADER_ACTION_CLASSES}>{action}</div>}
      </div>
    </div>
  );
});

export default DetailPanelHeader;
