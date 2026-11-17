import { matchesSearch } from '@/shared/utils/format/string.utils';

import {
  STOCK_EXPIRY_WINDOW_DAYS,
  STOCK_GROUPS,
  STOCK_ITEMS,
  STOCK_WAREHOUSES,
} from '../constants/stock.constants';
import type {
  StockGroupId,
  StockGroupSlice,
  StockLot,
  StockLotRow,
  StockSummary,
  StockWarning,
  WarehouseFilter,
} from '../types/supply.types';
import { daysBetween } from './supply-format.utils';

/**
 * Hàm thuần dựng số cho màn "Tồn kho": ghép vật tư + giá trị + cảnh báo cho từng lô, lọc, KPI, cơ cấu theo nhóm,
 * top mã giá trị lớn. "Hôm nay" truyền vào (`STOCK_TODAY`). Tồn tối thiểu so với TỔNG các lô cùng mã cùng kho.
 */

const itemKey = (lot: StockLot) => `${lot.warehouse}|${lot.code}`;

function warningsOf(daysLeft: number | null, belowMin: boolean): StockWarning[] {
  const out: StockWarning[] = [];
  if (daysLeft !== null && daysLeft < 0) out.push('expired');
  if (belowMin) out.push('below-min');
  if (daysLeft !== null && daysLeft >= 0 && daysLeft <= STOCK_EXPIRY_WINDOW_DAYS)
    out.push('expiring');
  return out;
}

/** Lô → dòng bảng: thông tin vật tư, giá trị (đồng), số ngày còn hạn, danh sách cảnh báo. */
export function toStockRows(lots: readonly StockLot[], today: string): StockLotRow[] {
  const totals = new Map<string, number>();
  lots.forEach((lot) => totals.set(itemKey(lot), (totals.get(itemKey(lot)) ?? 0) + lot.qty));

  return lots.map((lot) => {
    const item = STOCK_ITEMS[lot.code];
    const daysLeft = lot.expiry ? daysBetween(today, lot.expiry) : null;
    const belowMin = (totals.get(itemKey(lot)) ?? 0) < lot.min;
    return {
      ...item,
      ...lot,
      value: Math.round(lot.qty * item.unitPrice),
      daysLeft,
      warnings: warningsOf(daysLeft, belowMin),
    };
  });
}

/** Các lô của một kho (`all` = mọi kho). */
export function scopeStockRows(
  rows: readonly StockLotRow[],
  warehouse: WarehouseFilter,
): StockLotRow[] {
  return warehouse === 'all' ? [...rows] : rows.filter((row) => row.warehouse === warehouse);
}

/** Lọc từ khoá (bỏ dấu: mã, tên, lô, nhóm, kho) và "chỉ hiện cảnh báo". */
export function filterStockRows(
  rows: readonly StockLotRow[],
  keyword: string,
  warningsOnly: boolean,
): StockLotRow[] {
  return rows.filter(
    (row) =>
      (!warningsOnly || row.warnings.length > 0) &&
      matchesSearch(
        [
          row.code,
          row.name,
          row.lot,
          STOCK_GROUPS[row.group].name,
          STOCK_WAREHOUSES[row.warehouse].name,
        ],
        keyword,
      ),
  );
}

/** Bốn chỉ số đầu màn + dòng phụ của chúng, tính trên các lô của kho đang chọn. */
export function summarizeStock(rows: readonly StockLotRow[]): StockSummary {
  const below = new Map<string, StockLotRow>();
  rows
    .filter((row) => row.warnings.includes('below-min'))
    .forEach((row) => below.set(itemKey(row), row));
  const shortageValue = [...below.values()].reduce((acc, row) => {
    const onHand = rows.filter((r) => itemKey(r) === itemKey(row)).reduce((a, r) => a + r.qty, 0);
    return acc + Math.max(0, row.min - onHand) * row.unitPrice;
  }, 0);

  return {
    value: rows.reduce((acc, row) => acc + row.value, 0),
    lotCount: rows.length,
    itemCount: new Set(rows.map((row) => row.code)).size,
    groupCount: new Set(rows.map((row) => row.group)).size,
    warehouseCount: new Set(rows.map((row) => row.warehouse)).size,
    belowMinItems: below.size,
    shortageValue,
    expiringLots: rows.filter((row) => row.warnings.includes('expiring')).length,
    expiredLots: rows.filter((row) => row.warnings.includes('expired')).length,
  };
}

/** Cơ cấu giá trị tồn theo nhóm vật tư — thứ tự CỐ ĐỊNH của `STOCK_GROUPS`, bỏ nhóm bằng 0. */
export function stockByGroup(rows: readonly StockLotRow[]): StockGroupSlice[] {
  const total = rows.reduce((acc, row) => acc + row.value, 0);
  return (Object.keys(STOCK_GROUPS) as StockGroupId[])
    .map((key) => {
      const value = rows
        .filter((row) => row.group === key)
        .reduce((acc, row) => acc + row.value, 0);
      return {
        key,
        name: STOCK_GROUPS[key].name,
        token: STOCK_GROUPS[key].token,
        value,
        percent: total > 0 ? (value / total) * 100 : 0,
      };
    })
    .filter((slice) => slice.value > 0);
}

/** Top `limit` mã theo giá trị tồn (cộng mọi lô của mã trong phạm vi đang xem). */
export function topStockItems(
  rows: readonly StockLotRow[],
  limit = 5,
): { id: string; label: string; value: number }[] {
  const byCode = new Map<string, number>();
  rows.forEach((row) => byCode.set(row.code, (byCode.get(row.code) ?? 0) + row.value));
  return [...byCode]
    .map(([id, value]) => ({ id, label: STOCK_ITEMS[id].name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, limit);
}
