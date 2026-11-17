import { matchesSearch } from '@/shared/utils/format/string.utils';

import {
  PURCHASE_COMMITTED_STATUSES,
  PURCHASE_OPEN_STATUSES,
  PURCHASE_STATUS_STEPS,
  PURCHASE_SUPPLIERS,
} from '../constants/purchase-orders.constants';
import type {
  PurchaseOrder,
  PurchaseOrderRow,
  PurchaseStatusFilter,
  PurchaseSummary,
} from '../types/supply.types';
import { daysBetween } from './supply-format.utils';

/**
 * Hàm thuần dựng số cho màn "Đơn mua": ghép tên NCC + số ngày trễ, đếm theo trạng thái, KPI, top nhà cung cấp, lọc.
 * Không đọc `Date.now()` — "hôm nay" truyền vào (`PURCHASE_TODAY`) để số liệu ổn định.
 */

const isOpen = (row: PurchaseOrder) => PURCHASE_OPEN_STATUSES.includes(row.status);

/** Đơn đã cam kết mà CHƯA nhận đủ (đã duyệt / đang giao) — chỉ những đơn này mới có thể trễ hạn giao. */
const awaitsDelivery = (row: PurchaseOrder) =>
  row.status === 'approved' || row.status === 'delivering';

/** Ghép tên nhà cung cấp và số ngày trễ hạn giao (0 khi chưa trễ / không còn chờ giao). */
export function toPurchaseRows(
  orders: readonly PurchaseOrder[],
  today: string,
): PurchaseOrderRow[] {
  return orders.map((order) => ({
    ...order,
    supplier: PURCHASE_SUPPLIERS[order.supplierId]?.name ?? order.supplierId,
    lateDays: awaitsDelivery(order) ? Math.max(0, daysBetween(order.dueDate, today)) : 0,
  }));
}

/** Số đơn theo từng đoạn của bộ lọc luồng trạng thái (`all` = tổng). */
export function countPurchaseStatuses(
  rows: readonly PurchaseOrderRow[],
): Record<PurchaseStatusFilter, number> {
  const counts = Object.fromEntries(PURCHASE_STATUS_STEPS.map((step) => [step, 0])) as Record<
    PurchaseStatusFilter,
    number
  >;
  rows.forEach((row) => {
    counts[row.status] += 1;
  });
  counts.all = rows.length;
  return counts;
}

/** Bốn chỉ số đầu màn: đơn mở, giá trị đơn mở (+ còn phải nhận), trễ hạn giao, tỉ lệ giao đúng hạn. */
export function summarizePurchases(rows: readonly PurchaseOrderRow[]): PurchaseSummary {
  const open = rows.filter(isOpen);
  const late = rows.filter((row) => row.lateDays > 0);
  const done = rows.filter((row) => row.status === 'done');
  const onTime = done.filter((row) => row.deliveredDate && row.deliveredDate <= row.dueDate);
  const sumValue = (list: readonly PurchaseOrderRow[]) =>
    list.reduce((acc, row) => acc + row.value, 0);

  return {
    openCount: open.length,
    pendingCount: open.filter((row) => row.status === 'pending').length,
    deliveringCount: open.filter((row) => row.status === 'delivering').length,
    openValue: sumValue(open),
    remainingValue: open.reduce((acc, row) => acc + row.value * (1 - row.receivedPct / 100), 0),
    lateCount: late.length,
    lateValue: late.reduce((acc, row) => acc + row.value * (1 - row.receivedPct / 100), 0),
    doneCount: done.length,
    onTimeCount: onTime.length,
    onTimeRate: done.length > 0 ? (onTime.length / done.length) * 100 : 0,
  };
}

/** Giá trị đã nhận theo tỉ trọng giá trị (thang 100) của một tập đơn — dòng tổng của bảng. */
export function receivedShare(rows: readonly PurchaseOrderRow[]): number {
  const total = rows.reduce((acc, row) => acc + row.value, 0);
  if (total <= 0) return 0;
  return rows.reduce((acc, row) => acc + row.value * row.receivedPct, 0) / total || 0;
}

/** Top `limit` nhà cung cấp theo giá trị đơn đã cam kết (đã duyệt → hoàn tất), đơn vị TRIỆU đồng. */
export function topSuppliers(
  rows: readonly PurchaseOrderRow[],
  limit = 5,
): { key: string; name: string; value: number }[] {
  const byId = new Map<string, number>();
  rows
    .filter((row) => PURCHASE_COMMITTED_STATUSES.includes(row.status))
    .forEach((row) => byId.set(row.supplierId, (byId.get(row.supplierId) ?? 0) + row.value));

  return [...byId]
    .map(([key, value]) => ({
      key,
      name: PURCHASE_SUPPLIERS[key]?.short ?? key,
      value: Math.round(value / 1_000_000),
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, limit);
}

/** Lọc theo đoạn trạng thái + từ khoá (bỏ dấu) trên số PO, nhà cung cấp, hàng đặt, người phụ trách. */
export function filterPurchaseRows(
  rows: readonly PurchaseOrderRow[],
  status: PurchaseStatusFilter,
  keyword: string,
): PurchaseOrderRow[] {
  return rows.filter(
    (row) =>
      (status === 'all' || row.status === status) &&
      matchesSearch([row.code, row.supplier, row.items, row.owner], keyword),
  );
}
