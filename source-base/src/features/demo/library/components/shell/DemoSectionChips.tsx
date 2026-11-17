import { memo, useEffect, useRef } from 'react';

import { usePrefersReducedMotion } from '@/shared/hooks';
import { HUD_ACTIVE_FILL, HUD_LIT_FILL, Text } from '@/shared/ui';
import { cn } from '@/shared/utils/style/cn';

import { useActiveSection } from '../../hooks/useActiveSection';
import { DEMO_GROUP_LABELS, DEMO_SECTIONS, type DemoSectionGroup } from '../../sections.constants';

interface DemoSectionChipsProps {
  scrollRef: React.RefObject<HTMLElement | null>;
  className?: string;
}

type DemoChipState = 'idle' | 'active';

const GROUPS = Object.keys(DEMO_GROUP_LABELS) as DemoSectionGroup[];

/** Chip đang xem cách mép dải nhỏ hơn mức này (px) thì cuộn vào giữa — chip đã thấy rõ thì để yên. */
const CHIPS_EDGE_PX = 24;

const DEMO_CHIPS_ROOT_CLASSES =
  'relative flex shrink-0 items-center gap-3 overflow-x-auto overscroll-x-contain pb-2';

const DEMO_CHIPS_GROUP_CLASSES =
  'flex shrink-0 items-center gap-1.5 border-l border-divider-default pl-3';

/** Chip cao 32px (hình giữ nguyên); `::after` trong suốt nới hộp bấm lên 44px — `ipad-responsive.md §3.3`. */
const DEMO_CHIPS_LINK_BASE_CLASSES = cn(
  'relative inline-flex h-8 shrink-0 items-center whitespace-nowrap rounded-full border px-3',
  'text-body-14 transition-colors',
  "after:absolute after:inset-x-0 after:-inset-y-1.5 after:content-['']",
);

const DEMO_CHIPS_LINK_STATE_CLASSES = {
  idle: cn(
    'border-border-default text-fg-body hover:bg-bg-subtle hover:text-fg-heading',
    'dark:border-primary-5/30',
    HUD_LIT_FILL,
  ),
  active: cn(
    'border-primary-5 bg-bg-subtle text-primary-5 dark:border-primary-4 dark:text-primary-3',
    HUD_ACTIVE_FILL,
  ),
} satisfies Record<DemoChipState, string>;

/**
 * DemoSectionChips — mục lục NGANG của trang `/demo` ở màn hẹp (`< lg`): dải chip cuộn ngang đặt đầu vùng nội
 * dung; tô chip đang xem và tự cuộn tới nó. Cùng dữ liệu với
 * `DemoSideNav` (cột dọc từ `lg`) — mọi khu vực đều với tới được ở mọi cỡ màn, không ẩn mục nào.
 *
 * Sửa: khung → `DEMO_CHIPS_ROOT_CLASSES` · nhóm → `DEMO_CHIPS_GROUP_CLASSES` · chip → `DEMO_CHIPS_LINK_*`.
 * Lưu ý: cuộn chip bằng `nav.scrollTo`, KHÔNG `scrollIntoView` — lý do ở `notes/code/demo.md`.
 *
 * @param props.scrollRef - Phần tử cuộn chứa các khu vực — làm `root` cho IntersectionObserver.
 * @param props.className - Class thêm cho khung (vd `sticky top-0` khi đặt trong vùng cuộn).
 */
const DemoSectionChips = memo(function DemoSectionChips({
  scrollRef,
  className,
}: DemoSectionChipsProps) {
  const [activeId, setActiveId] = useActiveSection(scrollRef);
  const navRef = useRef<HTMLElement>(null);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const nav = navRef.current;
    const chip = nav?.querySelector<HTMLElement>('[aria-current="location"]');
    if (!nav || !chip || typeof nav.scrollTo !== 'function') return;
    const chipEnd = chip.offsetLeft + chip.offsetWidth;
    const hidden =
      chip.offsetLeft < nav.scrollLeft + CHIPS_EDGE_PX ||
      chipEnd > nav.scrollLeft + nav.clientWidth - CHIPS_EDGE_PX;
    if (!hidden) return;
    nav.scrollTo({
      left: Math.max(0, chip.offsetLeft - (nav.clientWidth - chip.offsetWidth) / 2),
      behavior: reducedMotion ? 'auto' : 'smooth',
    });
  }, [activeId, reducedMotion]);

  return (
    <nav
      ref={navRef}
      aria-label="Mục lục thư viện giao diện"
      className={cn(DEMO_CHIPS_ROOT_CLASSES, className)}
    >
      {GROUPS.map((group) => (
        <div key={group} className={DEMO_CHIPS_GROUP_CLASSES}>
          <Text className="shrink-0 uppercase tracking-wider" size="extraTiny" skin="muted">
            {DEMO_GROUP_LABELS[group]}
          </Text>
          {DEMO_SECTIONS.filter((s) => s.group === group).map((s) => (
            <a
              key={s.id}
              aria-current={activeId === s.id ? 'location' : undefined}
              className={cn(
                DEMO_CHIPS_LINK_BASE_CLASSES,
                DEMO_CHIPS_LINK_STATE_CLASSES[activeId === s.id ? 'active' : 'idle'],
              )}
              href={`#${s.id}`}
              onClick={() => setActiveId(s.id)}
            >
              {s.label}
            </a>
          ))}
        </div>
      ))}
    </nav>
  );
});

export default DemoSectionChips;
