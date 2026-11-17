import { cn } from '@/shared/utils/style/cn';

/**
 * Bảng class bố cục của ba màn Tài chính (Sổ cái · Công nợ · Kết quả kinh doanh) — MỘT chỗ khai lưới, chiều cao panel
 * và kiểu chữ số trong bảng.
 *
 * Dùng:   <div className={RECEIVABLES_GRID_CLASSES}><BoxPanel className={FINANCE_PANEL_SLOT_CLASSES.debts} …/></div>
 * Sửa:    dải KPI → FINANCE_KPI_STRIP_CLASSES · lưới Công nợ / KQKD → *_GRID_CLASSES · panel → FINANCE_PANEL_SLOT_CLASSES
 *         · ô số → FINANCE_NUM_CLASSES · dòng đặc biệt (số dư đầu kỳ, dòng tổng B02) → FINANCE_ROW_CLASSES
 * Lưu ý:  từ `xl` trang VỪA một màn hình — lưới `min-h-0 flex-1` chia phần còn lại, bảng cuộn bên trong; dưới `xl` panel
 *         cao cố định, xếp cột và `<PageBody>` cuộn. Số luôn `tabular-nums` + canh phải; âm trong ngoặc kiểu kế toán.
 */

export type FinanceNumTone = 'base' | 'strong' | 'muted' | 'negative';

export type FinanceRowKind = 'opening' | 'total' | 'key' | 'sub';

export type FinanceCellStackSlot = 'root' | 'main' | 'sub';

export type FinancePanelSlot = 'ledger' | 'debts' | 'aging' | 'trend' | 'statement';

export const FINANCE_KPI_STRIP_CLASSES = 'grid shrink-0 grid-cols-2 gap-2 lg:grid-cols-4';

export const FINANCE_PANEL_TITLE_CLASSES = 'm-0 truncate text-body-14-semibold text-fg-heading';

/** Cụm control trên hàng tiêu đề panel; điện thoại giãn trọn bề ngang và XUỐNG DÒNG (không tràn / cắt ở mép khung). */
export const FINANCE_PANEL_ACTIONS_CLASSES = 'flex items-center gap-2 phone:w-full phone:flex-wrap';

/**
 * Hàng tiêu đề panel cao bằng nhau dù có control (32px) hay chỉ chữ — panel cạnh nhau thẳng hàng; điện thoại cho cụm
 * control xuống dòng dưới tiêu đề (vẫn cuộn ngang nếu dài) thay vì bóp mất tiêu đề.
 */
export const FINANCE_PANEL_HEADER_CLASSES = 'min-h-12 phone:flex-wrap';

export const RECEIVABLES_GRID_CLASSES = cn(
  'grid shrink-0 grid-cols-1 gap-2',
  'xl:min-h-0 xl:flex-1 xl:grid-cols-[minmax(0,1fr)_23rem] xl:grid-rows-[minmax(0,1fr)]',
);

export const INCOME_GRID_CLASSES = cn(
  'grid shrink-0 grid-cols-1 gap-2',
  'xl:min-h-0 xl:flex-1 xl:grid-cols-[minmax(0,1fr)_minmax(0,48rem)] xl:grid-rows-[minmax(0,1fr)]',
);

export const FINANCE_PANEL_SLOT_CLASSES = {
  ledger: 'h-auto min-h-80 min-w-0 flex-1',
  debts: 'h-120 min-w-0 xl:h-full',
  aging: 'h-auto min-w-0 xl:h-full',
  trend: 'h-96 min-w-0 xl:h-full',
  statement: 'h-auto min-w-0 xl:h-full',
} satisfies Record<FinancePanelSlot, string>;

export const FINANCE_NUM_CLASSES = {
  base: 'tabular-nums whitespace-nowrap text-fg-heading',
  strong: 'tabular-nums whitespace-nowrap text-body-14-semibold text-fg-heading',
  muted: 'tabular-nums whitespace-nowrap text-fg-muted',
  negative: 'tabular-nums whitespace-nowrap text-error',
} satisfies Record<FinanceNumTone, string>;

export const FINANCE_ROW_CLASSES = {
  opening: '[&>td]:bg-bg-subtle [&>td]:text-body-14-medium',
  total: '[&>td]:bg-bg-subtle [&>td]:text-body-14-semibold',
  key: '[&>td]:bg-primary-1 [&>td]:text-body-14-semibold dark:[&>td]:bg-primary-5/12',
  sub: '[&>td]:text-fg-muted',
} satisfies Record<FinanceRowKind, string>;

/** Hai dòng chữ trong ô: chữ chính + dòng phụ nhỏ mờ (mã đối tác, ghi chú). */
export const FINANCE_CELL_STACK_CLASSES = {
  root: 'flex min-w-0 flex-col',
  main: 'truncate text-fg-heading',
  sub: 'truncate text-caption-12 text-fg-muted',
} satisfies Record<FinanceCellStackSlot, string>;
