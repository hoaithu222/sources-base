import { memo, useRef } from 'react';

import { PageBody, PageShell, TitleScreen } from '@/shared/ui';
import { cn } from '@/shared/utils/style/cn';

import { useIsBelowLg } from '../../shared/hooks/useIsBelowLg';
import DemoScreenLinks from '../components/shell/DemoScreenLinks';
import DemoScrollTopButton from '../components/shell/DemoScrollTopButton';
import DemoSectionChips from '../components/shell/DemoSectionChips';
import DemoSideNav from '../components/shell/DemoSideNav';
import { DEMO_SECTIONS } from '../sections.constants';

/** Chỗ chừa cuối trang cho Dock nổi (~72px) + vạch Home — chỉ tablet (điện thoại có thanh tab do VỎ chừa chỗ). */
const DEMO_PAGE_DOCK_SPACER_CLASSES =
  'hidden h-[calc(5rem+var(--safe-b,0px))] shrink-0 md:max-lg:block phone:hidden';

/** Dải chip dính đỉnh vùng cuộn ở màn hẹp: nền mờ để khu vực cuộn qua phía dưới không lẫn vào chữ chip. */
const DEMO_PAGE_CHIPS_STICKY_CLASSES = 'sticky top-0 z-10 bg-bg-page/90 backdrop-blur-sm';

/** Neo `#id` chừa chỗ cho dải chip dính (~44px) ở màn hẹp, còn lại chừa 16px như cũ. */
const DEMO_PAGE_ANCHOR_CLASSES = {
  stickyNav: 'scroll-mt-16',
  sideNav: 'scroll-mt-4',
};

/**
 * DemoPage — màn `/demo` ("Thư viện giao diện"): mọi thứ base dựng sẵn trên một trang, dùng đúng component
 * của sản phẩm nên đổi token (`colors-theme.json`, `font.json`) rồi sinh lại là trang này đổi theo.
 * Khu vực và thứ tự lấy từ `DEMO_SECTIONS`; trang dựng neo `<section id>` cho từng khu vực.
 * Lưu ý: dùng được ở MỌI cỡ màn — `≥ lg` mục lục là cột trái (`DemoSideNav`); hẹp hơn header + dải chip
 * ngang (`DemoSectionChips`, dính đỉnh) nằm TRONG vùng cuộn nên header trôi đi nhường chỗ cho nội dung (điện
 * thoại ngang chỉ còn ~250px cao); liên kết sang màn mẫu khác luôn ở `right` của `TitleScreen` (kit tự xuống hàng).
 */
const DemoPage = memo(function DemoPage() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const belowLg = useIsBelowLg();

  const header = (
    <TitleScreen
      icon="grid-2-bold"
      iconColor="teal"
      right={<DemoScreenLinks />}
      subtitle="DESIGN SYSTEM"
      title="Thư viện giao diện"
    />
  );

  return (
    <PageShell>
      {belowLg ? null : header}

      <PageBody className="flex gap-3" overflow="hidden" stack={false}>
        {belowLg ? null : <DemoSideNav scrollRef={scrollRef} />}

        <div className="relative min-h-0 min-w-0 flex-1">
          <div
            ref={scrollRef}
            className="absolute inset-0 flex flex-col gap-3 overflow-y-auto overscroll-contain pr-1"
          >
            {belowLg ? (
              <>
                {header}
                <DemoSectionChips
                  className={DEMO_PAGE_CHIPS_STICKY_CLASSES}
                  scrollRef={scrollRef}
                />
              </>
            ) : null}
            {DEMO_SECTIONS.map(({ id, Section }) => (
              <section
                key={id}
                className={cn(
                  belowLg ? DEMO_PAGE_ANCHOR_CLASSES.stickyNav : DEMO_PAGE_ANCHOR_CLASSES.sideNav,
                  '[content-visibility:auto] [contain-intrinsic-size:auto_420px]',
                )}
                id={id}
              >
                <Section />
              </section>
            ))}
            <div aria-hidden className={DEMO_PAGE_DOCK_SPACER_CLASSES} />
          </div>
          <DemoScrollTopButton scrollRef={scrollRef} />
        </div>
      </PageBody>
    </PageShell>
  );
});

export default DemoPage;
