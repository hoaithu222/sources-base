import type { HudCalloutStatus, HudCalloutTone } from '@/shared/ui';
import type { SystemIconName } from '@/shared/ui/icons/Icons';

/** Sơ đồ xưởng của màn `/demo/xuong`: các khu (ô lưới), nhãn ghim (toạ độ % khung) và thẻ tổng quan xưởng. */

/** Khu trên sơ đồ xưởng: ô lưới (`col`/`row` bắt đầu từ 1, `span`) + tông khung. */
export interface FactoryZone {
  key: string;
  label: string;
  col: number;
  row: number;
  colSpan: number;
  rowSpan: number;
  tone: HudCalloutTone;
}

export const FACTORY_ZONES: readonly FactoryZone[] = [
  { key: 'raw', label: 'Bãi nguyên liệu', col: 1, row: 1, colSpan: 2, rowSpan: 2, tone: 'yellow' },
  { key: 'cut', label: 'Khu cắt thép', col: 3, row: 1, colSpan: 3, rowSpan: 2, tone: 'sky' },
  { key: 'bend', label: 'Khu uốn thép', col: 6, row: 1, colSpan: 3, rowSpan: 2, tone: 'sky' },
  {
    key: 'semi',
    label: 'Bãi bán thành phẩm',
    col: 1,
    row: 3,
    colSpan: 3,
    rowSpan: 2,
    tone: 'teal',
  },
  {
    key: 'cage',
    label: 'Khu lắp lồng thép',
    col: 4,
    row: 3,
    colSpan: 3,
    rowSpan: 2,
    tone: 'primary',
  },
  {
    key: 'finish',
    label: 'Khu hoàn thiện',
    col: 7,
    row: 3,
    colSpan: 2,
    rowSpan: 2,
    tone: 'primary',
  },
];

/** Nhãn ghim trên sơ đồ — `x` · `y` là % khung sơ đồ (điểm neo). */
export interface FactoryCallout {
  key: string;
  title: string;
  subtitle?: string;
  statusLabel?: string;
  status?: HudCalloutStatus;
  tone: HudCalloutTone;
  x: number;
  y: number;
}

export const FACTORY_CALLOUTS: readonly FactoryCallout[] = [
  { key: 'cut', title: 'Khu cắt thép', statusLabel: 'Đang hoạt động', tone: 'sky', x: 45, y: 50 },
  { key: 'bend', title: 'Khu uốn thép', statusLabel: 'Đang hoạt động', tone: 'sky', x: 75, y: 50 },
  {
    key: 'cage',
    title: 'Khu lắp lồng thép',
    statusLabel: 'Đang hoạt động',
    tone: 'primary',
    x: 56,
    y: 78,
  },
  {
    key: 'finish',
    title: 'Khu hoàn thiện',
    statusLabel: 'Chờ vật tư',
    status: 'warning',
    tone: 'primary',
    x: 83,
    y: 78,
  },
  {
    key: 'raw',
    title: 'Bãi nguyên liệu',
    subtitle: 'Thép cuộn, thép cây',
    tone: 'yellow',
    x: 20.5,
    y: 50,
  },
];

export interface FactoryOverviewStat {
  key: string;
  value: number;
  label: string;
  icon: SystemIconName;
}

export const FACTORY_OVERVIEW: readonly FactoryOverviewStat[] = [
  { key: 'zones', value: 4, label: 'Khu vực sản xuất', icon: 'layer-group-outline' },
  { key: 'machines', value: 12, label: 'Thiết bị chính', icon: 'gear-outline' },
  { key: 'workers', value: 28, label: 'Công nhân đang làm việc', icon: 'users-outline' },
  { key: 'lifts', value: 3, label: 'Xe nâng, xe vận chuyển', icon: 'boxes-stacked-outline' },
];
