import type { ExecKpiKey } from './constants/executive-period.constants';

/**
 * Bảng class bố cục của màn `/bao-cao/dieu-hanh` ("Dashboard điều hành") — MỘT chỗ khai lưới KPI, lưới panel và ô
 * của từng panel.
 *
 * Dùng:   <section className={EXEC_LAYOUT_CLASSES.kpis}>…</section> · <ExecPanel className={EXEC_PANEL_SLOT_CLASSES.revenue} />
 * Sửa:    số cột KPI → `EXEC_LAYOUT_CLASSES.kpis` + `EXEC_KPI_SPAN_CLASSES` · lưới panel → `EXEC_LAYOUT_CLASSES.grid`
 *         · bề ngang từng panel → `EXEC_PANEL_SLOT_CLASSES`.
 * Lưu ý:  điện thoại KPI 2 cột (ô thứ 5 trọn hàng; < 384px một cột), panel một cột; `sm`–`xl` KPI 3 + 2 ô (lưới 6 cột); từ `xl` (1280) KPI 5 ô một hàng và
 *         panel chia lưới 12 cột 8 : 4. MỘT khe cho cả trang: `gap-3` (thân trang, lưới KPI, lưới panel) — đổi thì đổi cả ba.
 */

export type ExecPanelSlot = 'revenue' | 'mix' | 'customers' | 'attention' | 'cashflow';

export const EXEC_LAYOUT_CLASSES = {
  body: 'gap-3',
  kpis: 'grid grid-cols-2 gap-3 max-[24rem]:grid-cols-1 sm:grid-cols-6 xl:grid-cols-5',
  grid: 'grid grid-cols-1 items-stretch gap-3 xl:grid-cols-12',
} satisfies Record<string, string>;

export const EXEC_KPI_SPAN_CLASSES = {
  revenue: 'sm:col-span-2 xl:col-span-1',
  grossProfit: 'sm:col-span-2 xl:col-span-1',
  output: 'sm:col-span-2 xl:col-span-1',
  inventory: 'sm:col-span-3 xl:col-span-1',
  receivable: 'col-span-2 max-[24rem]:col-span-1 sm:col-span-3 xl:col-span-1',
} satisfies Record<ExecKpiKey, string>;

export const EXEC_PANEL_SLOT_CLASSES = {
  revenue: 'xl:col-span-8',
  mix: 'xl:col-span-4',
  customers: 'xl:col-span-8',
  attention: 'xl:col-span-4',
  cashflow: 'xl:col-span-12',
} satisfies Record<ExecPanelSlot, string>;
