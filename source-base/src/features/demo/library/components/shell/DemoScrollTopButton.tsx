import { memo, useCallback, useEffect, useState } from 'react';

import { usePrefersReducedMotion } from '@/shared/hooks';
import { Button } from '@/shared/ui';
import { SystemIcon } from '@/shared/ui/icons/Icons';
import { cn } from '@/shared/utils/style/cn';

interface DemoScrollTopButtonProps {
  scrollRef: React.RefObject<HTMLElement | null>;
  className?: string;
}

/** Cuộn quá ngưỡng này (px) thì nút hiện — tầm một khu vực, đủ để khỏi che đầu trang. */
const SCROLL_TOP_THRESHOLD = 480;

/**
 * Neo đáy: điện thoại có thanh tab do VỎ chừa chỗ nên chỉ cách mép 12px; tablet có Dock nổi (~72px) nên neo
 * trên Dock + vạch Home (`--safe-b`). `ipad-responsive.md §6`.
 */
const DEMO_SCROLL_TOP_CLASSES = cn(
  'absolute right-3 bottom-3 z-20 aspect-square bg-bg-surface/95 px-0 backdrop-blur-sm lg:hidden',
  'md:max-lg:bottom-[calc(5.5rem+var(--safe-b,0px))] phone:bottom-3',
);

/**
 * DemoScrollTopButton — nút "Lên đầu trang" nổi ở góc phải-dưới vùng cuộn của `/demo`, CHỈ dưới `lg` (nơi
 * mục lục không còn là cột dính nên cuộn ngược một trang dài rất mỏi tay).
 *
 * Đặt trong khung `relative` bao quanh vùng cuộn. Chỉ hiện khi đã cuộn quá `SCROLL_TOP_THRESHOLD`; tôn trọng
 * `prefers-reduced-motion` (nhảy thẳng, không cuộn mượt). Vùng chạm ≥ 44px do `Button` tự nới bằng `::after`.
 *
 * @param props.scrollRef - Phần tử cuộn thật (cùng ref đưa cho `DemoSideNav`).
 * @param props.className - Class thêm.
 *
 * @example
 * <div className="relative min-h-0 flex-1">
 *   <div ref={scrollRef} className="absolute inset-0 overflow-y-auto">…</div>
 *   <DemoScrollTopButton scrollRef={scrollRef} />
 * </div>
 */
const DemoScrollTopButton = memo(function DemoScrollTopButton({
  scrollRef,
  className,
}: DemoScrollTopButtonProps) {
  const [visible, setVisible] = useState(false);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const sync = () => setVisible(el.scrollTop > SCROLL_TOP_THRESHOLD);
    sync();
    el.addEventListener('scroll', sync, { passive: true });
    return () => el.removeEventListener('scroll', sync);
  }, [scrollRef]);

  const handleClick = useCallback(() => {
    scrollRef.current?.scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' });
  }, [scrollRef, reducedMotion]);

  if (!visible) return null;

  return (
    <Button
      aria-label="Lên đầu trang"
      className={cn(DEMO_SCROLL_TOP_CLASSES, className)}
      size="lg"
      skin="neutral"
      title="Lên đầu trang"
      variant="stroke"
      onClick={handleClick}
    >
      <SystemIcon name="angle-up-outline" size={18} />
    </Button>
  );
});

export default DemoScrollTopButton;
