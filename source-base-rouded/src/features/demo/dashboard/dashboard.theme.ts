import { cn } from '@/shared/utils/style/cn';

/**
 * Bảng class bố cục của màn `/demo/tong-quan` — MỘT chỗ khai số cột, chiều cao panel và kiểu tiêu đề panel.
 *
 * Dùng:   <div className={DASHBOARD_GRID_CLASSES}><DashboardPanel slot="progress" … /></div>
 * Sửa:    số cột / tỉ lệ hàng → DASHBOARD_GRID_CLASSES · bề ngang + chiều cao từng panel → DASHBOARD_PANEL_SLOT_CLASSES
 *         · chữ tiêu đề panel → DASHBOARD_PANEL_TITLE_CLASSES (giữ khớp tiêu đề chuỗi của `BoxPanel`)
 * Lưu ý:  từ `xl` lưới CHIA đều chiều cao còn lại (hàng chính 11fr : hàng dưới 9fr) nên trang không cuộn; dưới `xl`
 *         panel cao cố định, xếp 1–2 cột và `<PageBody>` cuộn. `xl:min-h-120` là sàn: thấp hơn thì cuộn thay vì
 *         bóp panel. `order` ở `equipment` / `alerts` chỉ đổi chỗ ở `xl` — lý do: notes/code/demo.md.
 */

export type DashboardPanelSlot =
  'progress' | 'work' | 'status' | 'contractor' | 'equipment' | 'alerts';

export const DASHBOARD_KPI_STRIP_CLASSES =
  'grid shrink-0 grid-cols-2 gap-2 max-[24rem]:grid-cols-1 md:grid-cols-3 xl:grid-cols-6';

export const DASHBOARD_GRID_CLASSES = cn(
  'grid shrink-0 grid-cols-1 gap-2 md:grid-cols-2',
  'xl:min-h-120 xl:flex-1 xl:grid-cols-12 xl:grid-rows-[minmax(0,11fr)_minmax(0,9fr)]',
);

export const DASHBOARD_PANEL_BASE_CLASSES = 'min-h-0 min-w-0';

export const DASHBOARD_PANEL_TITLE_CLASSES = 'm-0 truncate text-body-14-semibold text-fg-heading';

export const DASHBOARD_PANEL_SLOT_CLASSES = {
  progress: 'h-80 md:col-span-2 xl:col-span-5 xl:h-auto',
  work: 'h-72 xl:col-span-4 xl:h-auto',
  status: 'h-72 xl:col-span-3 xl:h-auto',
  contractor: 'h-72 xl:col-span-3 xl:h-auto',
  equipment: 'h-72 xl:order-2 xl:col-span-4 xl:h-auto',
  alerts: 'h-72 md:col-span-2 xl:order-1 xl:col-span-5 xl:h-auto',
} satisfies Record<DashboardPanelSlot, string>;
