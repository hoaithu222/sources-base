import { memo, useMemo } from 'react';
import type { ReactNode } from 'react';

import { useIsPhone } from '@/shared/hooks';
import { cn } from '@/shared/utils/style/cn';

import { HeaderSlotPortal } from '../slots';
import {
  PAGE_HEADER_SIDED_CLASSES,
  PAGE_HEADER_SLOT_CLASSES,
  plateToneStyle,
} from './page-header.theme';
import { type PageHeaderChipSlant } from './page-nav.theme';
import type { PageHeaderNavConfig } from './page-header.types';
import PageHeaderBack from './parts/page-header-back';
import PageHeaderNav from './parts/page-header-nav';
import PageHeaderPhone from './parts/page-header-phone';
import PageHeaderTitle, { type PageHeaderTitleProps } from './parts/page-header-title';

interface PageHeaderProps extends PageHeaderTitleProps {
  nav?: PageHeaderNavConfig;
  start?: ReactNode;
  end?: ReactNode;
  onBack?: () => void;
  backLabel?: string;
  backHref?: string;
  backSlant?: PageHeaderChipSlant;
  backCompact?: boolean;
}

/** Từ ngần này tab trở lên bảng tên vào chế độ DÀY (bỏ cánh `///` ở md..2xl) để dải tab không tràn ô nav. */
const DENSE_MIN_TABS = 5;

/**
 * PageHeader — page dùng component này để CHIẾM SLOT trên thanh header toàn cục (portal vào `start` ·
 * `title` · `end` của `<Header>`): nút quay lại + node trái · bảng tên + dải tab · node phải.
 *
 * Đặt ở BẤT KỲ đâu trong page (thường ngay đầu JSX); page unmount → portal gỡ theo. Cụm tâm:
 * [ô nav trái] ⟨BẢNG TÊN⟩ [ô nav phải] — `nav.items` chia đôi, `nav.splitAt` ghim điểm cắt; action
 * bám dải CUỐI CÙNG có mặt.
 * Không có tab: bảng tên cùng hình như lúc có tab, viền vẽ LIỀN thẳng lên mép trên thanh (không có thanh khay để viền rẽ ngang).
 * Lưu ý: cần `<HeaderSlotsProvider>` bọc cả Header lẫn page (thiếu thì im lặng không hiện gì). Tab /
 * action đi tới trang phải có `href` (`docs/rules/interaction/navigable-controls.md`). Điện thoại (`useIsPhone()`):
 * tên + dòng phụ phẳng vào top bar, tab thành dải cuộn ngang (ô `nav`) — chức năng giữ nguyên, bảng tên vát không dựng.
 *
 * @param props.title - Tiêu đề module / bản ghi trên bảng tên.
 * @param props.subtitle - Dòng phụ NGAY DƯỚI tiêu đề (ngày · trạng thái…): một hàng, ngắn — đừng nhét
 *   ngữ cảnh đó vào `start` (cụm trái phình là bảng tên lệch tâm).
 * @param props.tone - Tông màu bảng tên (`TitleIconColor`) — nhận diện module. Mặc định `yellow`.
 * @param props.titleSize - `md` (tiêu đề TĨNH của module) | `sm` (tên bản ghi ở trang chi tiết: chữ nhỏ,
 *   trần bề rộng chặt). Mặc định `md`.
 * @param props.nav - Dải tab + action (`PageHeaderNavConfig`): `items`, `active`, `onSelect`, `actions?`,
 *   `splitAt?`, `disabled?`. Chia đôi quanh bảng tên.
 * @param props.start - Node tuỳ ý đẩy ra mép TRÁI thanh header (sau nút quay lại).
 * @param props.end - Node tuỳ ý đẩy ra mép PHẢI thanh header.
 * @param props.onBack - Có → bật nút quay lại ở mép trái.
 * @param props.backLabel - Tooltip + `aria-label` của nút quay lại. Mặc định "Quay lại".
 * @param props.backHref - Path cố định của nút quay lại — BẮT BUỘC khi đích không phải `navigate(-1)`.
 * @param props.backSlant - Hướng nghiêng nút quay lại: `left` | `right`. Mặc định `left`.
 * @param props.backCompact - Nút quay lại ở bậc compact (chỉ siết BỀ NGANG). Mặc định `false`.
 *
 * @example
 * <PageHeader
 *   title="Người dùng"
 *   backHref="/"
 *   onBack={goHome}
 *   nav={{ items, active: tab, onSelect: setTab, actions }}
 * />
 */
const PageHeader = memo(function PageHeader({
  title,
  subtitle,
  tone,
  titleSize,
  nav,
  start,
  end,
  onBack,
  backLabel,
  backHref,
  backSlant,
  backCompact,
}: PageHeaderProps) {
  const isPhone = useIsPhone();
  const [navStart, navEnd] = useMemo(() => {
    const items = nav?.items ?? [];
    const cut = nav?.splitAt ?? Math.ceil(items.length / 2);
    return [items.slice(0, cut), items.slice(cut)];
  }, [nav?.items, nav?.splitAt]);

  const actionsOnEnd = navEnd.length > 0;

  const hasNavStart = navStart.length > 0 || (!actionsOnEnd && (nav?.actions?.length ?? 0) > 0);
  const hasNavEnd = navEnd.length > 0;

  const hasSides = nav != null && (hasNavStart || hasNavEnd);
  const dense = (nav?.items.length ?? 0) >= DENSE_MIN_TABS;
  const layout = hasSides ? 'sided' : 'free';

  if (isPhone) {
    return (
      <PageHeaderPhone
        backHref={backHref}
        backLabel={backLabel ?? 'Quay lại'}
        end={end}
        nav={nav}
        start={start}
        subtitle={subtitle}
        title={title}
        tone={tone ?? 'yellow'}
        onBack={onBack}
      />
    );
  }

  const backNode = onBack ? (
    <PageHeaderBack
      compact={backCompact}
      href={backHref}
      label={backLabel}
      slant={backSlant}
      onBack={onBack}
    />
  ) : null;

  const startNode = start != null && start !== false ? start : null;
  const endNode = end != null && end !== false ? end : null;

  const clusterClassName = cn(
    PAGE_HEADER_SLOT_CLASSES.cluster,
    PAGE_HEADER_SIDED_CLASSES[layout].cluster,
  );

  return (
    <>
      {(backNode != null || startNode != null) && (
        <HeaderSlotPortal slot="start">
          <>
            {backNode}
            {startNode}
          </>
        </HeaderSlotPortal>
      )}

      <HeaderSlotPortal slot="title">
        <span className={clusterClassName} style={plateToneStyle(tone ?? 'yellow')}>
          {hasSides && nav && (
            <PageHeaderNav
              actions={actionsOnEnd ? undefined : nav.actions}
              active={nav.active}
              disabled={nav.disabled}
              items={navStart}
              side="left"
              onSelect={nav.onSelect}
            />
          )}

          <PageHeaderTitle
            dense={dense}
            layout={layout}
            subtitle={subtitle}
            title={title}
            titleSize={titleSize}
            tone={tone}
          />

          {hasSides && nav && (
            <PageHeaderNav
              actions={actionsOnEnd ? nav.actions : undefined}
              active={nav.active}
              disabled={nav.disabled}
              items={navEnd}
              side="right"
              onSelect={nav.onSelect}
            />
          )}
        </span>
      </HeaderSlotPortal>

      {endNode != null && <HeaderSlotPortal slot="end">{endNode}</HeaderSlotPortal>}
    </>
  );
});

export default PageHeader;
