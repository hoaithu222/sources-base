import type { BoldSystemIconName, GemColor } from '@/shared/ui';

/** Dữ liệu mẫu của khu vực "Thẻ KPI HUD" — hàng tồn kho máy thiết bị + dải giá thành một dòng. */

export const COMPANY_COLOR = 'var(--color-indigo-5)';
export const OUTSOURCE_COLOR = 'var(--color-yellow-5)';

export interface DemoStockKpi {
  key: string;
  label: string;
  color: GemColor;
  icon: BoldSystemIconName;
  value: number;
  /** Ngày của số dư — chỉ thẻ tồn đầu / cuối kỳ có. */
  asOf?: string;
  /** Giá trị kỳ trước — chỉ thẻ dòng chảy (nhập / xuất) có. */
  previous?: number;
  company: number;
  outsource: number;
}

export const DEMO_STOCK_KPIS: readonly DemoStockKpi[] = [
  {
    key: 'opening',
    label: 'Tồn đầu kỳ',
    color: 'gray',
    icon: 'boxes-stacked-bold',
    value: 305,
    asOf: '01/10/2026',
    company: 305,
    outsource: 0,
  },
  {
    key: 'imported',
    label: 'Tổng nhập',
    color: 'green',
    icon: 'arrow-down-to-line-bold',
    value: 73,
    previous: 315,
    company: 61,
    outsource: 12,
  },
  {
    key: 'exported',
    label: 'Tổng xuất',
    color: 'yellow',
    icon: 'arrow-up-to-line-bold',
    value: 2,
    previous: 10,
    company: 2,
    outsource: 0,
  },
  {
    key: 'closing',
    label: 'Tồn cuối kỳ',
    color: 'blue',
    icon: 'excavator-bold',
    value: 376,
    asOf: '02/10/2026',
    company: 364,
    outsource: 12,
  },
];

interface DemoCostTile {
  label: string;
  icon: BoldSystemIconName;
  /** Đơn vị: đồng. */
  value: number;
  /** Ô chênh lệch: in dấu và tô màu theo kết quả. */
  signed?: boolean;
}

export const DEMO_COST_TILES: readonly DemoCostTile[] = [
  { label: 'Kế hoạch (V0-Hợp đồng)', icon: 'file-lines-bold', value: 8_120_000_000 },
  { label: 'Thực tế (V1-Mua hàng)', icon: 'chart-simple-bold', value: 7_640_000_000 },
  { label: 'Chênh lệch', icon: 'wallet-bold', value: -479_000_000, signed: true },
  { label: 'Đầu ra', icon: 'file-lines-bold', value: 7_750_000_000 },
  { label: 'Đầu vào', icon: 'chart-simple-bold', value: 255_850_000_000 },
  { label: 'Hiệu quả', icon: 'wallet-bold', value: -248_100_000_000, signed: true },
];
