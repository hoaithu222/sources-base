import { memo } from 'react';

import { cn } from '@/shared/utils/style/cn';
import DetailPanelHeader from '@/shared/ui/layout/DetailPanelHeader';
import {
  HUD_BRACKETS_BEFORE,
  HUD_PANEL_FILL,
  HUD_TITLE_MARK,
  HUD_TOP_RAIL_AFTER,
} from '@/shared/ui/primitives/hud.theme';
import { TEXT_ELLIPSIS_CLASSES } from '@/shared/ui/primitives/text-ellipsis.theme';

export type BoxPanelVariant = 'default' | 'cyber';
export type BoxPanelBorder = 'none' | 'hairline' | 'strong';
export type BoxPanelBodyOverflow = 'scroll' | 'hidden';

export interface BoxPanelProps {
  title: React.ReactNode;
  description?: string;
  variant?: BoxPanelVariant;
  headerRight?: React.ReactNode;
  headerDivider?: boolean;
  border?: BoxPanelBorder;
  bodyOverflow?: BoxPanelBodyOverflow;
  footer?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
  bodyClassName?: string;
  headerClassName?: string;
}

const BOX_PANEL_BASE_CLASSES = 'flex h-full flex-col bg-bg-surface';

/**
 * Theme tối: mọi panel có viền được mặt rọi từ trên; CHỈ panel đứng riêng (`strong`) mới có ngoặc 4 góc + ray sáng đỉnh
 * header — panel `hairline` nằm trong lưới / trang, ngoặc ở mỗi ô là nhiễu (ngân sách trang trí §0c).
 */
const BOX_PANEL_FRAMED_CLASSES = cn('relative', HUD_PANEL_FILL);

const BOX_PANEL_BORDER_CLASSES = {
  none: '',
  hairline: cn(
    'border border-border-default',
    BOX_PANEL_FRAMED_CLASSES,
    'dark:border-hud-5/30',
    'dark:shadow-[inset_0_0_20px_-12px_color-mix(in_srgb,var(--color-hud-5)_35%,transparent)]',
  ),
  strong: cn(
    'border-2 border-border-strong',
    BOX_PANEL_FRAMED_CLASSES,
    HUD_BRACKETS_BEFORE,
    'dark:before:-inset-0.5 dark:before:text-hud-4/85',
    'dark:shadow-[inset_0_0_24px_-12px_color-mix(in_srgb,var(--color-hud-5)_40%,transparent),0_0_14px_-8px_color-mix(in_srgb,var(--color-hud-5)_45%,transparent)]',
  ),
} satisfies Record<BoxPanelBorder, string>;

const BOX_PANEL_BODY_OVERFLOW_CLASSES = {
  scroll: 'overflow-auto',
  hidden: 'flex flex-col overflow-hidden',
} satisfies Record<BoxPanelBodyOverflow, string>;

const BOX_PANEL_HEADER_CLASSES = cn(
  'flex shrink-0 items-center gap-4 p-2',
  'dark:bg-linear-to-r dark:from-hud-5/12 dark:via-hud-5/4 dark:to-transparent',
);

/** Ray sáng mép trên hàng tiêu đề — chỉ khi panel có viền (panel trần lồng trong khung khác thì thôi). */
const BOX_PANEL_HEADER_RAIL_CLASSES = cn('relative', HUD_TOP_RAIL_AFTER);

const BOX_PANEL_HEADER_DIVIDER_CLASSES =
  'border-b border-border-default dark:border-b-primary-5/30';

const BOX_PANEL_TITLE_ROW_CLASSES = 'flex min-w-0 flex-1 items-start gap-2';

const BOX_PANEL_TITLE_BAR_CLASSES = cn('mt-0.5 ml-1', HUD_TITLE_MARK);

const BOX_PANEL_TITLE_CLASSES = cn(TEXT_ELLIPSIS_CLASSES, 'text-body-14-semibold text-fg-heading');

const BOX_PANEL_HEADER_ACTION_CLASSES = cn(
  'scrollbar-hidden flex shrink-0 items-center gap-3',
  'max-lg:min-w-0 max-lg:shrink max-lg:overflow-x-auto max-lg:overscroll-x-contain',
  'touch:min-w-0 touch:shrink touch:overflow-x-auto touch:overscroll-x-contain',
);

const BOX_PANEL_FOOTER_CLASSES =
  'flex shrink-0 items-center justify-between border-t border-border-default p-2';

/**
 * BoxPanel — panel nghiệp vụ chuẩn: hàng tiêu đề (+ slot phải) · thân · chân tuỳ chọn. Figma: 1499-9570.
 *
 * Panel cao `h-full`, thân `flex-1`; hàng tiêu đề `default` có dấu `//` nghiêng màu primary trước chữ. Hộp trần
 * không tiêu đề → `Surface`; card dashboard có khung HUD + trạng thái tải / rỗng → `PanelCard`. Tiêu đề
 * chuỗi render `<span>` — cần heading thật thì truyền `<Text as="h2">`.
 * Sửa giao diện: header → `BOX_PANEL_HEADER_*` / `BOX_PANEL_TITLE_*` · viền + ngoặc góc (tối) → `BOX_PANEL_BORDER_CLASSES`
 * · thân → `BOX_PANEL_BODY_OVERFLOW_CLASSES` · slot phải → `BOX_PANEL_HEADER_ACTION_CLASSES`.
 * Lưu ý: `description` chỉ hiện ở `variant="default"`. Với `bodyOverflow="hidden"`, con tự cuộn cần
 * `min-h-0 flex-1` để giãn hết phần dôi. Lý do thiết kế: notes/components/surfaces.md.
 *
 * @param props.title - Tiêu đề: chuỗi (một dòng, cắt `…`) hoặc node tuỳ ý.
 * @param props.description - Dòng mô tả dưới tiêu đề (không cắt); chỉ ở `variant="default"`.
 * @param props.variant - `default` (hàng tiêu đề phẳng) | `cyber` (header `DetailPanelHeader` kiểu HUD).
 *   Mặc định `default`.
 * @param props.headerRight - Slot cuối hàng tiêu đề (nút, bộ lọc); màn hẹp / cảm ứng thì cuộn ngang.
 * @param props.headerDivider - `true` → vạch ngăn dưới hàng tiêu đề. Mặc định `false`.
 * @param props.border - Viền panel: `none` | `hairline` (1px, panel danh sách / lồng trong trang) | `strong`
 *   (2px, panel đứng riêng ngoài cùng). Mặc định `none`.
 * @param props.bodyOverflow - `scroll` (thân tự cuộn) | `hidden` (thân là khung `flex-col` cho con tự cuộn:
 *   Table, Tree). Mặc định `scroll`.
 * @param props.footer - Nội dung dải chân (vạch ngăn phía trên). `undefined` / `null` / `false` / `""` →
 *   KHÔNG dựng dải chân.
 * @param props.children - Nội dung thân.
 * @param props.className - Class thêm cho panel.
 * @param props.bodyClassName - Class thêm cho thân (vd đệm `p-2`).
 * @param props.headerClassName - Class thêm cho hàng tiêu đề.
 *
 * @example
 * <BoxPanel title="Mô hình BIM" border="hairline" headerRight={<Button size="sm">Thêm</Button>}>
 *   …
 * </BoxPanel>
 *
 * <BoxPanel title="Danh sách" bodyOverflow="hidden" footer={<Text size="tiny">Cập nhật 5 phút trước</Text>}>
 *   <div className="min-h-0 flex-1 overflow-auto">…</div>
 * </BoxPanel>
 */
const BoxPanel = memo(function BoxPanel({
  title,
  description,
  variant = 'default',
  headerRight,
  headerDivider = false,
  border = 'none',
  bodyOverflow = 'scroll',
  footer,
  children,
  className,
  bodyClassName,
  headerClassName,
}: BoxPanelProps) {
  const dividerClassName = headerDivider && BOX_PANEL_HEADER_DIVIDER_CLASSES;
  const hasFooter = footer != null && footer !== false && footer !== '';

  const panelClassName = cn(BOX_PANEL_BASE_CLASSES, BOX_PANEL_BORDER_CLASSES[border], className);
  const railClassName = border === 'strong' && BOX_PANEL_HEADER_RAIL_CLASSES;
  const headerRowClassName = cn(
    BOX_PANEL_HEADER_CLASSES,
    railClassName,
    dividerClassName,
    headerClassName,
  );
  const bodyAreaClassName = cn(
    'min-h-0 flex-1',
    BOX_PANEL_BODY_OVERFLOW_CLASSES[bodyOverflow],
    bodyClassName,
  );

  return (
    <div className={panelClassName}>
      {variant === 'cyber' ? (
        <DetailPanelHeader
          action={headerRight}
          className={cn(dividerClassName, headerClassName)}
          title={title}
        />
      ) : (
        <div className={headerRowClassName}>
          <div className={BOX_PANEL_TITLE_ROW_CLASSES}>
            <span aria-hidden className={BOX_PANEL_TITLE_BAR_CLASSES} />
            <div className="flex min-w-0 flex-1 flex-col">
              {typeof title === 'string' ? (
                <span className={BOX_PANEL_TITLE_CLASSES}>{title}</span>
              ) : (
                title
              )}
              {description ? (
                <span className="text-caption-12 text-fg-muted">{description}</span>
              ) : null}
            </div>
          </div>
          {headerRight && <div className={BOX_PANEL_HEADER_ACTION_CLASSES}>{headerRight}</div>}
        </div>
      )}

      <div className={bodyAreaClassName}>{children}</div>

      {hasFooter && <div className={BOX_PANEL_FOOTER_CLASSES}>{footer}</div>}
    </div>
  );
});

export default BoxPanel;
