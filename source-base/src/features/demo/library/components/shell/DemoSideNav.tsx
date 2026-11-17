import { memo } from 'react';

import { HUD_ROW_HIGHLIGHT, HUD_TEXT_GLOW, Text } from '@/shared/ui';
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

const DEMO_SIDE_NAV_LINK_BASE_CLASSES = cn(
  'block truncate border-l-2 px-2 py-1 text-body-14',
  'transition-[background-color,border-color,color] duration-150 ease-out',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring-focus',
);

const DEMO_SIDE_NAV_LINK_STATE_CLASSES = {
  idle: cn(
    'border-divider-strong text-fg-body',
    'hover:border-border-strong hover:bg-bg-nav-hover hover:text-fg-heading',
    'dark:hover:border-primary-5/50',
  ),
  active: cn(
    'border-primary-6 bg-bg-nav-active text-body-14-medium text-fg-heading',
    'dark:border-primary-4 dark:shadow-[inset_2px_0_8px_-2px_color-mix(in_srgb,var(--color-primary-5)_55%,transparent)]',
    HUD_ROW_HIGHLIGHT,
    HUD_TEXT_GLOW,
  ),
} satisfies Record<DemoSideNavLinkState, string>;

const GROUPS = Object.keys(DEMO_GROUP_LABELS) as DemoSectionGroup[];

/**
 * DemoSideNav — mục lục DỌC dính bên trái trang `/demo` (từ `lg`), dựng từ `DEMO_GROUP_LABELS` +
 * `DEMO_SECTIONS` và tô mục đang xem khi cuộn (`aria-current="location"`). Mỗi mục là `<a href="#id">` thật
 * nên Ctrl+click, chuột giữa, "Mở trong tab mới" đều chạy. Hẹp hơn `lg` trang dùng `DemoSectionChips`.
 *
 * Sửa: rail + chữ từng mục → `DEMO_SIDE_NAV_LINK_*` · khung mục lục → `DEMO_SIDE_NAV_ROOT_CLASSES`.
 * Lưu ý: mỗi nhóm là một rail 2px liền (mục không có khe), mục đang xem tô rail primary — lý do:
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
