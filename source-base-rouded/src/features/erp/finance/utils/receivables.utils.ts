import { matchesSearch } from '@/shared/utils/format/string.utils';

import {
  AGING_BUCKETS,
  DEBT_TURNOVER_90D,
  type AgingBucket,
  type DebtMode,
  type DebtStatus,
} from '../constants/receivables.constants';
import {
  FINANCE_CUSTOMERS,
  FINANCE_SUPPLIERS,
  type FinancePartner,
} from '../constants/partners.constants';
import { partnerShortName } from './finance-format.utils';
import { hashSeed, intBetween, seededRandom } from './finance-random.utils';

/**
 * Công nợ mẫu theo đối tác: `buildDebtRows('receivable')` → mỗi khách hàng có dư nợ chia 4 nhóm tuổi nợ, phần quá
 * hạn (theo số ngày được nợ), tuổi nợ lớn nhất và trạng thái (vượt hạn mức › quá hạn › trong hạn). `summarizeDebt`
 * cộng KPI (tổng, quá hạn, DSO / DPO, số đối tác vượt hạn mức); `agingChartRows` dựng dữ liệu biểu đồ (đơn vị TỶ).
 */

export interface DebtPartnerRow {
  id: string;
  code: string;
  name: string;
  short: string;
  termDays: number;
  limit: number;
  balance: number;
  buckets: Record<AgingBucket, number>;
  overdue: number;
  maxAge: number;
  status: DebtStatus;
  /** Tỉ lệ dư nợ / hạn mức, thang 100. */
  usage: number;
}

export interface DebtSummary {
  total: number;
  overdue: number;
  overduePct: number;
  /** DSO (phải thu) hoặc DPO (phải trả), ngày. */
  days: number;
  overLimitCount: number;
  overLimitAmount: number;
  partnerCount: number;
  buckets: Record<AgingBucket, number>;
}

export interface AgingChartRow {
  label: string;
  b0: number;
  b1: number;
  b2: number;
  b3: number;
}

const roundThousand = (value: number) => Math.round(value / 1_000) * 1_000;

const emptyBuckets = (): Record<AgingBucket, number> => ({ b0: 0, b1: 0, b2: 0, b3: 0 });

/** Phần của nhóm tuổi nợ đã quá số ngày được nợ: nhóm 31–60 với hạn 45 ngày → quá hạn một nửa. */
function overdueShare(from: number, termDays: number): number {
  const to = from + 29;
  if (from > termDays) return 1;
  if (to <= termDays) return 0;
  return (to - termDays) / 30;
}

function buildRow(mode: DebtMode, partner: FinancePartner): DebtPartnerRow {
  const rand = seededRandom(hashSeed(`${mode}|${partner.code}`));
  const usage = 0.22 + rand() * 0.93;
  const balance = roundThousand(partner.limit * usage);

  const weights = [
    0.35 + rand() * 0.55,
    rand() < 0.35 ? 0 : rand() * 0.4,
    rand() < 0.45 ? 0 : rand() * 0.22,
    rand() < 0.7 ? 0 : rand() * 0.25,
  ];
  const weightSum = weights.reduce((sum, w) => sum + w, 0);
  const buckets = emptyBuckets();
  let assigned = 0;
  AGING_BUCKETS.forEach((bucket, i) => {
    const value =
      i === AGING_BUCKETS.length - 1
        ? balance - assigned
        : roundThousand((balance * weights[i]) / weightSum);
    buckets[bucket.key] = value;
    assigned += value;
  });

  const overdue = roundThousand(
    AGING_BUCKETS.reduce(
      (sum, bucket) => sum + buckets[bucket.key] * overdueShare(bucket.from, partner.termDays),
      0,
    ),
  );
  let maxAge = intBetween(rand, 6, 30);
  if (buckets.b3 > 0) maxAge = intBetween(rand, 96, 214);
  else if (buckets.b2 > 0) maxAge = intBetween(rand, 62, 90);
  else if (buckets.b1 > 0) maxAge = intBetween(rand, 33, 60);

  let status: DebtStatus = 'ok';
  if (balance > partner.limit) status = 'limit';
  else if (overdue > 0) status = 'overdue';

  return {
    id: `${mode}-${partner.code}`,
    code: partner.code,
    name: partner.name,
    short: partner.short,
    termDays: partner.termDays,
    limit: partner.limit,
    balance,
    buckets,
    overdue,
    maxAge,
    status,
    usage: usage * 100,
  };
}

const ROWS_CACHE = new Map<DebtMode, DebtPartnerRow[]>();

/** Công nợ từng đối tác của chế độ `mode`, xếp theo mã — kết quả được nhớ lại. */
export function buildDebtRows(mode: DebtMode): DebtPartnerRow[] {
  const cached = ROWS_CACHE.get(mode);
  if (cached) return cached;
  const partners = mode === 'receivable' ? FINANCE_CUSTOMERS : FINANCE_SUPPLIERS;
  const rows = partners.map((partner) => buildRow(mode, partner));
  ROWS_CACHE.set(mode, rows);
  return rows;
}

/** KPI của danh sách đối tác. */
export function summarizeDebt(rows: readonly DebtPartnerRow[], mode: DebtMode): DebtSummary {
  const buckets = emptyBuckets();
  let total = 0;
  let overdue = 0;
  let overLimitCount = 0;
  let overLimitAmount = 0;
  for (const row of rows) {
    total += row.balance;
    overdue += row.overdue;
    AGING_BUCKETS.forEach(({ key }) => {
      buckets[key] += row.buckets[key];
    });
    if (row.balance > row.limit) {
      overLimitCount += 1;
      overLimitAmount += row.balance - row.limit;
    }
  }
  return {
    total,
    overdue,
    overduePct: total > 0 ? (overdue / total) * 100 : 0,
    days: Math.round((total / DEBT_TURNOVER_90D[mode]) * 90),
    overLimitCount,
    overLimitAmount,
    partnerCount: rows.length,
    buckets,
  };
}

/** `top` đối tác dư nợ lớn nhất → dữ liệu cột chồng theo nhóm tuổi nợ, đơn vị tỷ đồng. */
export function agingChartRows(rows: readonly DebtPartnerRow[], top: number): AgingChartRow[] {
  return [...rows]
    .sort((a, b) => b.balance - a.balance)
    .slice(0, top)
    .map((row) => ({
      label: row.short,
      b0: row.buckets.b0 / 1e9,
      b1: row.buckets.b1 / 1e9,
      b2: row.buckets.b2 / 1e9,
      b3: row.buckets.b3 / 1e9,
    }));
}

/** Lọc theo từ khoá (mã, tên — bỏ dấu) và trạng thái (`all` = mọi trạng thái). */
export function filterDebtRows(
  rows: DebtPartnerRow[],
  keyword: string,
  status: string,
): DebtPartnerRow[] {
  return rows.filter(
    (row) =>
      (status === 'all' || row.status === status) && matchesSearch([row.code, row.name], keyword),
  );
}

const STATUS_RANK = { limit: 2, overdue: 1, ok: 0 } satisfies Record<DebtStatus, number>;

/** Giá trị so sánh khi sắp xếp cột `key` của bảng đối tác. */
export function debtSortValue(row: DebtPartnerRow, key: string): string | number {
  switch (key) {
    case 'partner':
      return partnerShortName(row.name);
    case 'status':
      return STATUS_RANK[row.status];
    case 'balance':
    case 'limit':
    case 'overdue':
    case 'maxAge':
      return row[key];
    default:
      return row.code;
  }
}
