import { memo, useLayoutEffect } from 'react';
import type { ReactNode } from 'react';

import type { TitleIconColor } from '@/shared/ui';
import { useIsPhone } from '@/shared/hooks';

import { HeaderSlotPortal } from '../slots';
import { useSetHeaderPage } from '../slots/header-slots.context';
import type { PageHeaderAction, PageHeaderFilter, PageHeaderNavConfig } from './page-header.types';
import PageHeaderActions from './PageHeaderActions';
import PageHeaderBack from './parts/page-header-back';
import PageHeaderFilterRail from './parts/page-header-filter-rail';
import PageHeaderFilters from './parts/page-header-filters';
import PageHeaderPhone from './parts/page-header-phone';
import PageHeaderTabs from './parts/page-header-tabs';

interface PageHeaderProps {
  title: string;
  subtitle?: ReactNode;
  tone?: TitleIconColor;
  nav?: PageHeaderNavConfig;
  filters?: readonly PageHeaderFilter[];
  filtersLabel?: string;
  actions?: readonly PageHeaderAction[];
  start?: ReactNode;
  end?: ReactNode;
  onBack?: () => void;
  backLabel?: string;
  backHref?: string;
}

const hasNode = (node: ReactNode) => node != null && node !== false;

/**
 * PageHeader — page dùng component này để đưa TÊN TRANG + TAB lên thanh header toàn cục: tên (+ dòng phụ làm tooltip) báo
 * lên qua `HeaderSlotsProvider` → `<Header>` hiện trong KHỐI TIÊU ĐỀ GIỮA thanh; tab của trang chia ĐÔI ra hai bên khối
 * (portal vào ô `tabsLeft` / `tabsRight`, từ `xl` 1280px) thay cho dải màn hình phân hệ; dưới `xl` tab rơi về dải gạch chân
 * trong luồng trang (ngay chỗ đặt component). `start` / `end` portal vào mép trái / phải thanh.
 *
 * Đặt ở BẤT KỲ đâu trong page (thường ngay đầu JSX); page unmount → gỡ theo. Trang đã có `PageHeader` thì KHÔNG dựng
 * thêm `TitleScreen` (page-structure.md §3b). Điện thoại (`useIsPhone()`): tên + dòng phụ phẳng vào top bar, tab thành
 * dải cuộn ngang (ô `nav`) — chức năng giữ nguyên. Bộ lọc (`filters`) thành cột icon dọc sát mép phải.
 * Lưu ý: cần `<HeaderSlotsProvider>` bọc cả Header lẫn page (thiếu thì im lặng không hiện gì). Tab / action đi tới trang
 * phải có `href` (`docs/rules/interaction/navigable-controls.md`). `nav` chỉ dành cho tab TRONG một trang (`?tab=`).
 *
 * @param props.title - Tên trang / bản ghi.
 * @param props.subtitle - Dòng phụ ngắn (ngày · trạng thái…) — tooltip của tên trên thanh, dòng phụ trên top bar điện thoại.
 * @param props.tone - Tông chấm trước tên ở cấp 0 (ngoài phân hệ) (`TitleIconColor`). Mặc định `teal`.
 * @param props.nav - Tab + action (`PageHeaderNavConfig`): `items`, `active`, `onSelect`, `actions?`, `disabled?`.
 * @param props.filters - Bộ lọc của trang (`PageHeaderFilter[]`: tên · icon · giá trị · `active` · điều khiển). Máy tính: CỘT
 *   DỌC icon nổi sát mép phải dưới header (bấm mở bảng sang trái); điện thoại: nút phễu trên top bar. Không chiếm thanh header.
 * @param props.filtersLabel - Nhãn nút phễu (điện thoại). Mặc định "Bộ lọc".
 * @param props.actions - Nút hành động (`PageHeaderAction[]`: xuất, tạo mới…) ở mép phải thanh, dựng theo màu thanh: icon tròn
 *   + tooltip, `primary` = viên đặc có chữ. Dùng thay `<Button>` tự đặt trong `end` (nút xám lạc tông trên thanh màu).
 * @param props.start - Node tuỳ ý đặt sau nút quay lại (ô `start`).
 * @param props.end - Hành động LUÔN hiện ở mép PHẢI thanh header (trước ô tìm kiếm) — giữ ít (1–2 điều khiển).
 * @param props.onBack - Có → bật nút quay lại.
 * @param props.backLabel - Tooltip + `aria-label` của nút quay lại. Mặc định "Quay lại".
 * @param props.backHref - Path cố định của nút quay lại — BẮT BUỘC khi đích không phải `navigate(-1)`.
 *
 * @example
 * <PageHeader title="Sổ cái" subtitle="Kỳ 10/2026" tone="teal" nav={{ items, active: tab, onSelect: setTab }} />
 */
const PageHeader = memo(function PageHeader({
  title,
  subtitle,
  tone = 'teal',
  nav,
  filters,
  filtersLabel,
  actions,
  start,
  end,
  onBack,
  backLabel = 'Quay lại',
  backHref,
}: PageHeaderProps) {
  const isPhone = useIsPhone();
  const setPage = useSetHeaderPage();
  const subtitleText = typeof subtitle === 'string' && subtitle ? subtitle : undefined;
  const hasTabs = Boolean(nav && nav.items.length > 0);
  const hasActions = Boolean(actions && actions.length > 0);

  useLayoutEffect(() => {
    if (isPhone || !setPage) return undefined;
    setPage({ title, subtitle: subtitleText, tone, hasTabs });
    return () => setPage(null);
  }, [hasTabs, isPhone, setPage, subtitleText, title, tone]);

  if (isPhone) {
    return (
      <PageHeaderPhone
        backHref={backHref}
        backLabel={backLabel}
        end={
          <>
            {filters && filters.length > 0 && (
              <PageHeaderFilters filters={filters} label={filtersLabel} />
            )}
            {actions && hasActions && <PageHeaderActions actions={actions} phone />}
            {end}
          </>
        }
        nav={nav}
        start={start}
        subtitle={subtitle}
        title={title}
        tone={tone}
        onBack={onBack}
      />
    );
  }

  return (
    <>
      {(onBack || hasNode(start)) && (
        <HeaderSlotPortal slot="start">
          <>
            {onBack && <PageHeaderBack href={backHref} label={backLabel} onBack={onBack} />}
            {start}
          </>
        </HeaderSlotPortal>
      )}

      {(hasActions || hasNode(end)) && (
        <HeaderSlotPortal slot="end">
          <>
            {actions && hasActions && <PageHeaderActions actions={actions} />}
            {end}
          </>
        </HeaderSlotPortal>
      )}
      {filters && filters.length > 0 && <PageHeaderFilterRail filters={filters} />}

      {nav && (nav.items.length > 0 || (nav.actions?.length ?? 0) > 0) && (
        <>
          <HeaderSlotPortal slot="tabsLeft">
            <PageHeaderTabs half="left" nav={nav} placement="bar" />
          </HeaderSlotPortal>
          <HeaderSlotPortal slot="tabsRight">
            <PageHeaderTabs half="right" nav={nav} placement="bar" />
          </HeaderSlotPortal>
          <PageHeaderTabs nav={nav} placement="page" />
        </>
      )}
    </>
  );
});

export default PageHeader;
