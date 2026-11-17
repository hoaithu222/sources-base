import { memo, type CSSProperties, type KeyboardEvent, type ReactNode } from 'react';

import { cn } from '@/shared/utils/style/cn';
import { SystemIcon } from '@/shared/ui/icons/Icons';
import type { SystemIconName } from '@/shared/ui/icons';
import { TEXT_ELLIPSIS_CLASSES } from '@/shared/ui/primitives/text-ellipsis.theme';

export interface HudInfoBoxProps {
  tone?: string;
  icon?: SystemIconName;
  title?: ReactNode;
  headerRight?: ReactNode;
  children: ReactNode;
  onClick?: () => void;
  selected?: boolean;
  className?: string;
  bodyClassName?: string;
  bodyStyle?: CSSProperties;
}

const NOTCH = 12;
const CLIP = `polygon(${NOTCH}px 0, 100% 0, 100% calc(100% - ${NOTCH}px), calc(100% - ${NOTCH}px) 100%, 0 100%, 0 ${NOTCH}px)`;

const CHIP_NOTCH = 4;
const CHIP_CLIP = `polygon(${CHIP_NOTCH}px 0, 100% 0, 100% calc(100% - ${CHIP_NOTCH}px), calc(100% - ${CHIP_NOTCH}px) 100%, 0 100%, 0 ${CHIP_NOTCH}px)`;

const HUD_INFO_BOX_BASE_CLASSES = 'group/hud-info relative p-px [background:var(--hud-info-edge)]';

const HUD_INFO_BOX_INTERACTIVE_CLASSES =
  'cursor-pointer hover:[background:var(--hud-info-edge-on)] focus-visible:outline-none';

const HUD_INFO_BOX_SELECTED_CLASSES = '[background:var(--hud-info-edge-on)]';

const HUD_INFO_BOX_HOVER_TINT_CLASSES = cn(
  'pointer-events-none absolute inset-0 -z-10 opacity-0',
  'transition-[opacity] duration-200 ease-out group-hover/hud-info:opacity-100',
);

const HUD_INFO_BOX_FOCUS_RING_CLASSES = cn(
  'pointer-events-none absolute inset-0 z-30 hidden',
  'shadow-[inset_0_0_0_2px_var(--color-ring-focus)] group-focus-visible/hud-info:block',
);

const HUD_INFO_BOX_TITLE_CLASSES = cn(
  TEXT_ELLIPSIS_CLASSES,
  'text-body-14-semibold text-fg-heading',
);

const HUD_INFO_BOX_BRACKET_CLASSES = {
  topRight:
    'pointer-events-none absolute right-0 top-0 z-20 size-2 border-r-[1.5px] border-t-[1.5px]',
  bottomLeft:
    'pointer-events-none absolute bottom-0 left-0 z-20 size-2 border-b-[1.5px] border-l-[1.5px]',
} satisfies Record<'topRight' | 'bottomLeft', string>;

const mix = (tone: string, pct: number, over = 'transparent') =>
  `color-mix(in srgb, var(--color-${tone}-5) ${pct}%, ${over})`;

const edgePaint = (tone: string, on: boolean) =>
  `linear-gradient(150deg, ${mix(tone, on ? 95 : 78)} 0%, ${mix(tone, on ? 46 : 28)} 32%, var(--color-border-default) 72%)`;

const headerPaint = (tone: string) => `linear-gradient(to left, transparent, ${mix(tone, 16)})`;

const dividerPaint = (tone: string) =>
  `linear-gradient(90deg, ${mix(tone, 55)} 0%, ${mix(tone, 14)} 45%, transparent 100%)`;

/**
 * HudInfoBox — khung khối kiểu HUD: vát góc TL + BR, ngoặc [ ] ở 2 góc còn lại, viền gradient, header tuỳ chọn.
 *
 * Có `onClick` thì khung thành thẻ chọn được: `role="button"`, vào được bằng Tab, Enter / Space kích hoạt,
 * `selected` → `aria-pressed` + viền sáng hơn. Khung bọc panel lớn có tiêu đề → `PanelCard` / `HudFrame`.
 * Sửa giao diện: cỡ vát → `NOTCH` / `CHIP_NOTCH` · màu → `edgePaint` / `headerPaint` / `dividerPaint`
 * · phản hồi bấm (viền sáng khi rê, phủ màu, vòng focus) → `HUD_INFO_BOX_INTERACTIVE_CLASSES` /
 * `HUD_INFO_BOX_HOVER_TINT_CLASSES` / `HUD_INFO_BOX_FOCUS_RING_CLASSES`.
 * Lưu ý: ruột nền ĐỤC (`color-mix` với `bg-surface`); `bodyStyle` đè `background` thì tự lo luôn nền của
 * trạng thái `selected`. Lý do thiết kế: notes/components/surfaces-hud.md.
 *
 * @param props.tone - Tên họ token màu (bậc `-5` được dùng), vd `sky` | `teal` | `orange`. Mặc định `sky`.
 * @param props.icon - Icon trong chip vát góc đầu header.
 * @param props.title - Tiêu đề header: chuỗi (một dòng đậm, cắt `…`) hoặc node tuỳ ý. Không `title` +
 *   không `icon` + không `headerRight` → ẩn hẳn header.
 * @param props.headerRight - Slot cuối header (nút, badge).
 * @param props.children - Nội dung thân.
 * @param props.onClick - Có handler → thẻ bấm được (chuột + bàn phím).
 * @param props.selected - Thẻ đang được chọn (chỉ có nghĩa khi có `onClick`). Mặc định `false`.
 * @param props.className - Class thêm cho khung ngoài.
 * @param props.bodyClassName - Class của vùng thân; truyền vào là THAY đệm mặc định `p-2`.
 * @param props.bodyStyle - Style của MẶT thẻ (lớp ruột, dưới cả header lẫn thân), vd gradient `color-mix`.
 *
 * @example
 * <HudInfoBox tone="sky" icon="cube-bold" title="Thông tin" headerRight={<Badge>Mới</Badge>}>
 *   …
 * </HudInfoBox>
 *
 * <HudInfoBox tone="teal" title="Khu A" selected={active === 'A'} onClick={() => setActive('A')}>…</HudInfoBox>
 */
const HudInfoBox = memo(function HudInfoBox({
  tone = 'sky',
  icon,
  title,
  headerRight,
  children,
  onClick,
  selected = false,
  className,
  bodyClassName,
  bodyStyle,
}: HudInfoBoxProps) {
  const bracket = `var(--color-${tone}-5)`;
  const hasHeader = !!icon || title != null || headerRight != null;
  const interactive = !!onClick;

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget) return;
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    onClick?.();
  };

  const boxClassName = cn(
    HUD_INFO_BOX_BASE_CLASSES,
    interactive && HUD_INFO_BOX_INTERACTIVE_CLASSES,
    selected && HUD_INFO_BOX_SELECTED_CLASSES,
    className,
  );

  return (
    <div
      aria-pressed={interactive ? selected : undefined}
      className={boxClassName}
      role={interactive ? 'button' : undefined}
      style={{
        clipPath: CLIP,
        ['--hud-info-edge' as string]: edgePaint(tone, false),
        ['--hud-info-edge-on' as string]: edgePaint(tone, true),
      }}
      tabIndex={interactive ? 0 : undefined}
      onClick={onClick}
      onKeyDown={interactive ? handleKeyDown : undefined}
    >
      <div
        className="relative flex h-full min-w-0 flex-col overflow-hidden"
        style={{
          clipPath: CLIP,
          background: selected
            ? mix(tone, 10, 'var(--color-bg-surface)')
            : 'var(--color-bg-surface)',
          ...bodyStyle,
        }}
      >
        {interactive && !selected && (
          <span
            aria-hidden
            className={HUD_INFO_BOX_HOVER_TINT_CLASSES}
            style={{ background: mix(tone, 6) }}
          />
        )}

        {hasHeader && (
          <>
            <div
              className="flex min-w-0 shrink-0 items-center gap-2 px-2.5 py-2"
              style={{ background: headerPaint(tone) }}
            >
              {icon && (
                <span
                  className="flex shrink-0 items-center p-1"
                  style={{ clipPath: CHIP_CLIP, background: mix(tone, 28), color: bracket }}
                >
                  <SystemIcon name={icon} size={14} />
                </span>
              )}
              {title != null && (
                <div className="flex min-w-0 flex-1 items-center gap-2">
                  {typeof title === 'string' ? (
                    <span className={HUD_INFO_BOX_TITLE_CLASSES}>{title}</span>
                  ) : (
                    title
                  )}
                </div>
              )}
              {headerRight != null && (
                <div className="flex shrink-0 items-center">{headerRight}</div>
              )}
            </div>
            <span
              aria-hidden
              className="h-px w-full shrink-0"
              style={{ background: dividerPaint(tone) }}
            />
          </>
        )}

        <div className={cn('min-w-0 flex-1', bodyClassName ?? 'p-2')}>{children}</div>
      </div>

      <span
        aria-hidden
        className={HUD_INFO_BOX_BRACKET_CLASSES.topRight}
        style={{ borderColor: bracket }}
      />
      <span
        aria-hidden
        className={HUD_INFO_BOX_BRACKET_CLASSES.bottomLeft}
        style={{ borderColor: bracket }}
      />
      {interactive && <span aria-hidden className={HUD_INFO_BOX_FOCUS_RING_CLASSES} />}
    </div>
  );
});

export default HudInfoBox;
