'use client';

import { memo, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { cn } from '@/shared/utils/style/cn';
import Button from '@/shared/ui/actions/Button';
import { SystemIcon } from '@/shared/ui/icons/Icons';
import { useScrollEdgeNav } from './useScrollEdgeNav';

interface EdgeButtonProps {
  side: 'left' | 'right';
  active: boolean;
  onStep: () => void;
  onHoldStart: () => void;
  onHoldEnd: () => void;
}

export interface ScrollEdgeNavProps {
  targetRef: React.RefObject<HTMLElement | null>;
  className?: string;
  getStops?: () => number[];
}

const SCROLL_EDGE_NAV_ROOT_CLASSES = cn(
  'pointer-events-none absolute -inset-x-2 inset-y-0 z-30 flex items-center justify-between',
  'opacity-0 transition-opacity duration-150 ease-out',
  'focus-within:opacity-100 group-hover/scroll-edge:opacity-100',
  'touch:opacity-100',
);

/** Nút dẹt nổi trên bề mặt: nền `bg-surface` 90% mờ + bóng đổ; rê → viền `primary-5/60` + chữ `action-base`. */
const SCROLL_EDGE_NAV_BUTTON_CLASSES = cn(
  'h-8 w-5 px-0',
  'bg-bg-surface/90 text-fg-body backdrop-blur-sm shadow-[0_2px_8px_var(--color-shadow-popup)]',
  'hover:border-primary-5/60 hover:bg-bg-surface hover:text-action-base',
);

const SCROLL_EDGE_NAV_BUTTON_STATE_CLASSES = {
  active: 'pointer-events-auto',
  inactive: 'pointer-events-none opacity-0',
} satisfies Record<'active' | 'inactive', string>;

/**
 * EdgeButton — một nút cuộn dẹt ở mép của `ScrollEdgeNav` (nội bộ): bấm = một nhịp, giữ = chạy liên tục.
 *
 * @param props.side - Mép đặt nút: `left` | `right`.
 * @param props.active - Còn cuộn được về phía này; `false` → ẩn, bỏ khỏi Tab và cây a11y.
 * @param props.onStep - Bấm một nhịp.
 * @param props.onHoldStart - Nhấn giữ bắt đầu (sau một quãng trễ thì cuộn liên tục).
 * @param props.onHoldEnd - Nhả / rời nút / huỷ con trỏ.
 *
 * @example
 * <EdgeButton
 *   active={canScrollLeft}
 *   side="left"
 *   onHoldEnd={endHold}
 *   onHoldStart={holdLeft}
 *   onStep={stepLeft}
 * />
 */
const EdgeButton = memo(function EdgeButton(props: EdgeButtonProps) {
  const { side, active, onStep, onHoldStart, onHoldEnd } = props;
  const t = useTranslations('ui.navigation');
  const isLeft = side === 'left';
  const label = isLeft ? t('scrollEdgeNav.left') : t('scrollEdgeNav.right');

  const buttonClassName = cn(
    SCROLL_EDGE_NAV_BUTTON_CLASSES,
    SCROLL_EDGE_NAV_BUTTON_STATE_CLASSES[active ? 'active' : 'inactive'],
  );

  return (
    <Button
      aria-hidden={!active}
      aria-label={label}
      className={buttonClassName}
      size="xs"
      skin="neutral"
      tabIndex={active ? undefined : -1}
      title={t('scrollEdgeNav.title', { label })}
      variant="stroke"
      onClick={onStep}
      onPointerCancel={onHoldEnd}
      onPointerDown={onHoldStart}
      onPointerLeave={onHoldEnd}
      onPointerUp={onHoldEnd}
    >
      <SystemIcon name={isLeft ? 'angle-left-outline' : 'angle-right-outline'} size={14} />
    </Button>
  );
});

/**
 * ScrollEdgeNav — cặp nút cuộn NGANG dán hai mép một vùng cuộn (bảng rộng, Gantt, dải thẻ): bấm = một
 * nhịp, giữ = chạy liên tục. Nút chỉ hiện khi rê chuột vào vùng (máy chạm: luôn hiện) và còn cuộn được.
 * `Table` đã gắn sẵn — chỉ dùng trực tiếp cho vùng cuộn tự dựng.
 *
 * Đặt làm con của khung bọc vùng cuộn; khung bọc PHẢI có `relative` + `group/scroll-edge`.
 * Sửa giao diện: lớp phủ → `SCROLL_EDGE_NAV_ROOT_CLASSES` · nút → `SCROLL_EDGE_NAV_BUTTON_CLASSES`.
 * Lưu ý: KHÔNG bọc trong điều kiện "đang tràn ngang" để `return null` — unmount là mất
 * `ResizeObserver`, khung hẹp lại thì nút không bao giờ hiện lại (notes/components/navigation.md).
 *
 * @param props.targetRef - Ref tới CHÍNH phần tử cuộn ngang (`overflow-auto` / `overflow-x-auto`).
 * @param props.className - Ghi đè vị trí lớp phủ — mặc định `-inset-x-2` (nút lấn ra ngoài 8px); khung
 *   sát mép / `overflow-hidden` thì truyền `inset-x-0`.
 * @param props.getStops - Trả các mốc `scrollLeft` được dừng (mép trái từng cột) → một nhịp = ĐÚNG một
 *   cột. Bỏ trống → một nhịp ≈ 80% khung nhìn (tối thiểu 200px). PHẢI ổn định reference (`useCallback`).
 *
 * @example
 * <div className="group/scroll-edge relative">
 *   <div ref={scrollRef} className="overflow-x-auto">…</div>
 *   <ScrollEdgeNav targetRef={scrollRef} />
 * </div>
 */
const ScrollEdgeNav = memo(function ScrollEdgeNav({
  targetRef,
  className,
  getStops,
}: ScrollEdgeNavProps) {
  const { canScrollLeft, canScrollRight, step, startHold, endHold } = useScrollEdgeNav(targetRef, {
    getStops,
  });

  const stepLeft = useCallback(() => step(-1), [step]);
  const stepRight = useCallback(() => step(1), [step]);
  const holdLeft = useCallback(() => startHold(-1), [startHold]);
  const holdRight = useCallback(() => startHold(1), [startHold]);

  const rootClassName = cn(SCROLL_EDGE_NAV_ROOT_CLASSES, className);

  return (
    <div className={rootClassName}>
      <EdgeButton
        active={canScrollLeft}
        side="left"
        onHoldEnd={endHold}
        onHoldStart={holdLeft}
        onStep={stepLeft}
      />
      <EdgeButton
        active={canScrollRight}
        side="right"
        onHoldEnd={endHold}
        onHoldStart={holdRight}
        onStep={stepRight}
      />
    </div>
  );
});

export default ScrollEdgeNav;
