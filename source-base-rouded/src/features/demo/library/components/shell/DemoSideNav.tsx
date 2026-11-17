import { memo } from 'react';

import { Text } from '@/shared/ui';
import { cn } from '@/shared/utils/style/cn';

import { useActiveSection } from '../../hooks/useActiveSection';
import { DEMO_GROUP_LABELS, DEMO_SECTIONS, type DemoSectionGroup } from '../../sections.constants';

type DemoSideNavLinkState = 'idle' | 'active';

interface DemoSideNavProps {
  scrollRef: React.RefObject<HTMLElement | null>;
}

const DEMO_SIDE_NAV_ROOT_CLASSES = cn(
  'sticky top-0 flex h-fit max-h-full w-44 shrink-0 flex-col gap-3',
  'overflow-y-auto overscroll-contain pb-2',
);

const DEMO_SIDE_NAV_GROUP_LABEL_CLASSES = 'px-2.5 pb-1 uppercase tracking-wider';

/** Mỗi mục là viên bo `rounded-md` (không rail), cùng hình ở cả hai theme. */
const DEMO_SIDE_NAV_LINK_BASE_CLASSES = cn(
  'block truncate rounded-md px-2 py-1 text-body-14',
  'transition-[background-color,border-color,color] duration-150 ease-out',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring-focus',
);

const DEMO_SIDE_NAV_LINK_STATE_CLASSES = {
  idle: 'text-fg-body hover:bg-bg-nav-hover hover:text-fg-heading',
  /** Viên ĐẶC màu nhấn chữ trắng (như sidebar System Settings). */
  active: 'edge-hi bg-primary-6 text-body-14-semibold text-neutral-0',
} satisfies Record<DemoSideNavLinkState, string>;

const GROUPS = Object.keys(DEMO_GROUP_LABELS) as DemoSectionGroup[];

/**
 * DemoSideNav — mục lục DỌC dính bên trái trang `/demo` (từ `lg`), dựng từ `DEMO_GROUP_LABELS` +
 * `DEMO_SECTIONS` và tô mục đang xem khi cuộn (`aria-current="location"`). Mỗi mục là `<a href="#id">` thật
 * nên Ctrl+click, chuột giữa, "Mở trong tab mới" đều chạy. Hẹp hơn `lg` trang dùng `DemoSectionChips`.
 *
 * Sửa: rail + chữ từng mục → `DEMO_SIDE_NAV_LINK_*` · khung mục lục → `DEMO_SIDE_NAV_ROOT_CLASSES`.
 * Lưu ý: mỗi mục là viên bo góc, mục đang xem tô viên ĐẶC `primary-6` chữ trắng ở cả hai theme — lý do:
 * `notes/code/demo.md` (mục DemoSideNav).
 *
 * @param props.scrollRef - Phần tử cuộn chứa các khu vực — làm `root` cho IntersectionObserver.
 */
const DemoSideNav = memo(function DemoSideNav({ scrollRef }: DemoSideNavProps) {
  const [activeId, setActiveId] = useActiveSection(scrollRef);

  return (
    <nav aria-label="Mục lục thư viện giao diện" className={DEMO_SIDE_NAV_ROOT_CLASSES}>
      {GROUPS.map((group) => (
        <div key={group} className="flex flex-col">
          <Text
            className={DEMO_SIDE_NAV_GROUP_LABEL_CLASSES}
            size="extraTiny"
            skin="muted"
            weight="medium"
          >
            {DEMO_GROUP_LABELS[group]}
          </Text>
          {DEMO_SECTIONS.filter((s) => s.group === group).map((s) => {
            const state: DemoSideNavLinkState = activeId === s.id ? 'active' : 'idle';
            return (
              <a
                key={s.id}
                aria-current={state === 'active' ? 'location' : undefined}
                className={cn(
                  DEMO_SIDE_NAV_LINK_BASE_CLASSES,
                  DEMO_SIDE_NAV_LINK_STATE_CLASSES[state],
                )}
                href={`#${s.id}`}
                onClick={() => setActiveId(s.id)}
              >
                {s.label}
              </a>
            );
          })}
        </div>
      ))}
    </nav>
  );
});

export default DemoSideNav;
