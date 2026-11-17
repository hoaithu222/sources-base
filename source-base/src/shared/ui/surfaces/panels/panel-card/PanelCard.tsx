import { memo, type ReactNode } from 'react';

import { cn } from '@/shared/utils/style/cn';
import { SystemIcon } from '@/shared/ui/icons/Icons';

import Button from '@/shared/ui/actions/Button';
import EmptyState from '@/shared/ui/feedback/EmptyState';
import Spinner from '@/shared/ui/feedback/Spinner';
import DetailPanelHeader from '@/shared/ui/layout/DetailPanelHeader';
import type { TitleIconColor } from '@/shared/ui/layout/TitleScreen';
import HudFrame from '../../hud/hud-frame/HudFrame';
import type { HudFrameIntensity, HudFrameWeight } from '../../hud/hud-frame/hud-frame.types';
import {
  PANEL_CARD_ACTION_ICON,
  PANEL_CARD_BASE_CLASSES,
  PANEL_CARD_DENSITY_CLASSES,
  PANEL_CARD_FLUSH_CLASSES,
  PANEL_CARD_HEADER,
  PANEL_CARD_TOUCH_HIT,
  PANEL_CARD_VARIANT_CLASSES,
} from './panel-card.theme';
import type { PanelCardDensity, PanelCardVariant } from './panel-card.types';

export interface PanelCardProps {
  title: string;
  titleNote?: string;
  right?: ReactNode;
  onExpand?: () => void;
  expanded?: boolean;
  onClose?: () => void;
  footer?: ReactNode;
  tone?: TitleIconColor;
  variant?: PanelCardVariant;
  density?: PanelCardDensity;
  frame?: HudFrameIntensity;
  frameWeight?: HudFrameWeight;
  sweep?: boolean;
  notch?: boolean;
  flushBody?: boolean;
  loading?: boolean;
  empty?: boolean;
  emptyText?: string;
  className?: string;
  bodyClassName?: string;
  children?: ReactNode;
}

/**
 * PanelCard — card của màn dashboard: khung HUD + header vạch chéo + thân + chân + trạng thái tải / rỗng.
 *
 * Gói header, khung, nút phóng to / đóng và trạng thái vào MỘT hợp đồng để 6–8 box một màn đồng đều.
 * Chọn trong nhóm surfaces: `Surface` (hộp phẳng) · `BoxPanel` (panel nghiệp vụ) · `HudFrame` (chỉ khung).
 * Sửa giao diện: đệm / chữ → `PANEL_CARD_DENSITY_CLASSES` · nền → `PANEL_CARD_VARIANT_CLASSES` · header →
 * `PANEL_CARD_HEADER` (panel-card.theme.ts).
 * Lưu ý: KHÔNG lồng `variant="hud"` trong HudFrame khác (hai quầng sáng mất cạnh khung): card nằm trong
 * khung khác → `plain`; card đè lên viewer 3D / ảnh → `overlay`. Thân `overflow-hidden` — cần cuộn thì
 * truyền `bodyClassName="overflow-auto"`. Lý do thiết kế: notes/components/surfaces.md.
 *
 * @param props.title - Tên box (một dòng, viết như câu thường); `string` vì `aria-label` của nút đóng /
 *   phóng to ghép câu từ nó.
 * @param props.titleNote - Ghi chú NGẮN sau tiêu đề, chữ nhỏ hơn, tự bọc ngoặc — thường là con số tổng
 *   ("1.453 máy").
 * @param props.right - Slot trước cụm nút ở header (bộ lọc nhỏ, badge).
 * @param props.onExpand - Có handler → hiện nút phóng to / thu nhỏ.
 * @param props.expanded - Đang phóng to (đổi icon + nhãn nút). Mặc định `false`.
 * @param props.onClose - Có handler → hiện nút đóng.
 * @param props.footer - Nội dung dải chân. `undefined` / `null` / `false` / `""` → KHÔNG dựng dải chân.
 * @param props.tone - Màu header + khung (`TitleIconColor`). Mặc định `azure`.
 * @param props.variant - `hud` (khung HudFrame) | `overlay` (nền đục 92%, đè lên viewer) | `plain` (viền
 *   phẳng, lồng trong khung khác). Mặc định `hud`.
 * @param props.density - Mật độ header / đệm / chữ: `compact` | `default` | `relaxed`. Mặc định `default`.
 * @param props.frame - `HudFrame.intensity`: `default` | `cyber` | `prime`; chỉ dùng khi `variant="hud"`.
 *   Mặc định `prime`.
 * @param props.frameWeight - `HudFrame.weight`: `regular` | `hairline` (lưới dày). Mặc định `regular`.
 * @param props.sweep - Vệt sáng quét mép trên, chỉ khi `frame="prime"`; chỉ bật cho panel hero. Mặc định `false`.
 * @param props.notch - Vát góc TL + BR của khung. Mặc định `false` (card dashboard vuông góc).
 * @param props.flushBody - `true` → thân tràn viền (viewer, bảng, camera tự lo đệm). Mặc định `false`.
 * @param props.loading - `true` → thân thay bằng spinner. Mặc định `false`.
 * @param props.empty - `true` → thân thay bằng `EmptyState`; bỏ qua khi `loading`. Mặc định `false`.
 * @param props.emptyText - Chữ của trạng thái rỗng. Mặc định `"Chưa có dữ liệu"`.
 * @param props.className - Class thêm cho khung ngoài.
 * @param props.bodyClassName - Class thêm cho thân (vd `overflow-auto`).
 * @param props.children - Nội dung thân.
 *
 * @example
 * <PanelCard title="Máy thiết bị" titleNote="1.453 máy" tone="azure" onExpand={toggleExpand}>
 *   <DeviceChart />
 * </PanelCard>
 *
 * <PanelCard title="Camera" variant="overlay" flushBody loading={isLoading}>…</PanelCard>
 */
const PanelCard = memo(function PanelCard({
  title,
  titleNote,
  right,
  onExpand,
  expanded = false,
  onClose,
  footer,
  tone = 'azure',
  variant = 'hud',
  density = 'default',
  frame = 'prime',
  frameWeight = 'regular',
  sweep = false,
  notch = false,
  flushBody = false,
  loading = false,
  empty = false,
  emptyText = 'Chưa có dữ liệu',
  className,
  bodyClassName,
  children,
}: PanelCardProps) {
  const geometry = PANEL_CARD_HEADER[density];
  const iconSize = PANEL_CARD_ACTION_ICON[density];
  const densityClasses = PANEL_CARD_DENSITY_CLASSES[density];
  const hasActions = Boolean(right || onExpand || onClose);
  const hasFooter = footer != null && footer !== false && footer !== '';

  const titleClassName = cn(PANEL_CARD_BASE_CLASSES.title, densityClasses.title);
  const noteClassName = cn(PANEL_CARD_BASE_CLASSES.note, densityClasses.note);
  const bodyBoxClassName = cn(
    PANEL_CARD_BASE_CLASSES.body,
    densityClasses.body,
    flushBody && PANEL_CARD_FLUSH_CLASSES.body,
    bodyClassName,
  );
  const stateClassName = cn(
    PANEL_CARD_BASE_CLASSES.state,
    flushBody && PANEL_CARD_FLUSH_CLASSES.state,
  );
  const footerClassName = cn(PANEL_CARD_BASE_CLASSES.footer, densityClasses.footer);

  const stateNode = loading ? (
    <Spinner label={`Đang tải ${title}`} size="md" />
  ) : empty ? (
    <EmptyState size="sm" title={emptyText} titleClassName="text-caption-12" />
  ) : null;

  const header = (
    <DetailPanelHeader
      action={
        hasActions ? (
          <div className="flex shrink-0 items-center gap-0.5">
            {right}
            {onExpand ? (
              <Button
                aria-label={expanded ? `Thu nhỏ ${title}` : `Phóng to ${title}`}
                className={PANEL_CARD_TOUCH_HIT}
                size="xs"
                title={expanded ? 'Thoát toàn màn hình (Esc)' : 'Phóng to'}
                variant="ghost"
                onClick={onExpand}
              >
                <SystemIcon
                  className="text-fg-subheading"
                  name={
                    expanded
                      ? 'arrow-down-left-and-arrow-up-right-to-center-outline'
                      : 'arrow-up-right-and-arrow-down-left-from-center-outline'
                  }
                  size={iconSize}
                />
              </Button>
            ) : null}
            {onClose ? (
              <Button
                aria-label={`Đóng ${title}`}
                className={PANEL_CARD_TOUCH_HIT}
                size="xs"
                variant="ghost"
                onClick={onClose}
              >
                <SystemIcon className="text-fg-subheading" name="xmark-outline" size={iconSize} />
              </Button>
            ) : null}
          </div>
        ) : undefined
      }
      className={geometry.className}
      innerClassName={geometry.innerClassName}
      size={geometry.size}
      title={
        <span className={PANEL_CARD_BASE_CLASSES.titleRow}>
          <span className={titleClassName} title={title}>
            {title}
          </span>
          {titleNote ? <span className={noteClassName}>({titleNote})</span> : null}
        </span>
      }
      tone={tone}
    />
  );

  const content = (
    <>
      {header}
      <div className={bodyBoxClassName}>
        {stateNode ? <div className={stateClassName}>{stateNode}</div> : children}
      </div>
      {hasFooter && <div className={footerClassName}>{footer}</div>}
    </>
  );

  if (variant !== 'hud') {
    return (
      <section
        className={cn(PANEL_CARD_BASE_CLASSES.root, PANEL_CARD_VARIANT_CLASSES[variant], className)}
      >
        {content}
      </section>
    );
  }

  return (
    <HudFrame
      className={className}
      intensity={frame}
      notch={notch}
      sweep={sweep}
      tone={tone}
      weight={frameWeight}
    >
      {content}
    </HudFrame>
  );
});

export default PanelCard;
