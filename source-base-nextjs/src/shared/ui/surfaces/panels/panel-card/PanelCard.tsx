'use client';

import { memo, type ReactNode } from 'react';
import { useTranslations } from 'next-intl';

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
 * PanelCard — card của màn dashboard: khung + header vạch tone + thân + chân + trạng thái tải / rỗng.
 *
 * Gói header, khung, nút phóng to / đóng và trạng thái vào MỘT hợp đồng để 6–8 box một màn đồng đều.
 * Chọn trong nhóm surfaces: `Surface` (hộp phẳng) · `BoxPanel` (panel nghiệp vụ) · `HudFrame` (chỉ khung).
 * Sửa giao diện: đệm / chữ → `PANEL_CARD_DENSITY_CLASSES` · nền → `PANEL_CARD_VARIANT_CLASSES` · header →
 * `PANEL_CARD_HEADER` (panel-card.theme.ts).
 * Lưu ý: KHÔNG lồng `variant="hud"` trong HudFrame khác (hai viền chồng nhau): card nằm trong
 * khung khác → `plain`; card đè lên viewer 3D / ảnh → `overlay`. Thân `overflow-hidden` — cần cuộn thì
 * truyền `bodyClassName="overflow-auto"`. Prop trang trí của khung (`frame`, `frameWeight`, `sweep`, `notch`) đã vô hiệu
 * ở source-base-rouded. Lý do thiết kế: notes/components/surfaces.md.
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
 * @param props.tone - Màu vạch dọc ở header (`TitleIconColor`). Mặc định `azure`.
 * @param props.variant - `hud` (khung HudFrame: viền gradient 1px + bóng nghỉ) | `overlay` (nền đục 92%, đè lên viewer)
 *   | `plain` (viền phẳng, lồng trong khung khác). Mặc định `hud`.
 * @param props.density - Mật độ header / đệm / chữ: `compact` | `default` | `relaxed`. Mặc định `default`.
 * @param props.frame - @deprecated — vô hiệu ở source-base-rouded, sẽ bị gỡ ở GĐ 2. `HudFrame.intensity` cũ: `default` |
 *   `cyber` | `prime`.
 * @param props.frameWeight - @deprecated — vô hiệu ở source-base-rouded, sẽ bị gỡ ở GĐ 2. `HudFrame.weight` cũ: `regular` |
 *   `hairline`.
 * @param props.sweep - @deprecated — vô hiệu ở source-base-rouded, sẽ bị gỡ ở GĐ 2. Vệt sáng quét mép trên cũ.
 * @param props.notch - @deprecated — vô hiệu ở source-base-rouded, sẽ bị gỡ ở GĐ 2. Vát góc TL + BR của khung cũ.
 * @param props.flushBody - `true` → thân tràn viền (viewer, bảng, camera tự lo đệm). Mặc định `false`.
 * @param props.loading - `true` → thân thay bằng spinner. Mặc định `false`.
 * @param props.empty - `true` → thân thay bằng `EmptyState`; bỏ qua khi `loading`. Mặc định `false`.
 * @param props.emptyText - Chữ của trạng thái rỗng. Mặc định theo ngôn ngữ (khoá `ui.surfaces.panelCard.empty`:
 *   "Chưa có dữ liệu").
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
  flushBody = false,
  loading = false,
  empty = false,
  emptyText,
  className,
  bodyClassName,
  children,
}: PanelCardProps) {
  const t = useTranslations('ui.surfaces');
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
    <Spinner label={t('panelCard.loading', { title })} size="md" />
  ) : empty ? (
    <EmptyState
      size="sm"
      title={emptyText ?? t('panelCard.empty')}
      titleClassName="text-caption-12"
    />
  ) : null;

  const header = (
    <DetailPanelHeader
      action={
        hasActions ? (
          <div className="flex shrink-0 items-center gap-0.5">
            {right}
            {onExpand ? (
              <Button
                aria-label={
                  expanded ? t('panelCard.collapse', { title }) : t('panelCard.expand', { title })
                }
                className={PANEL_CARD_TOUCH_HIT}
                size="xs"
                title={expanded ? t('panelCard.exitFullscreen') : t('panelCard.expandTitle')}
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
                aria-label={t('panelCard.close', { title })}
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

  return <HudFrame className={className}>{content}</HudFrame>;
});

export default PanelCard;
