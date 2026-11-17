import {
  INCOME_BASE_REVENUE,
  INCOME_LAST_CLOSED,
  INCOME_SEASONALITY,
  type StatementCode,
  type StatementCompare,
  type StatementGranularity,
} from '../constants/income-statement.constants';
import { hashSeed, seededRandom } from './finance-random.utils';

/**
 * Số liệu Mẫu B02-DN mẫu: mỗi tháng (01/2025 → 09/2026) sinh có hạt giống theo doanh thu gốc × tăng trưởng × mùa vụ,
 * các chỉ tiêu còn lại theo tỉ lệ hợp lý (giá vốn ~78%, CP bán hàng ~5%…) và dòng tổng tính ĐÚNG công thức B02-DN.
 * Dùng: `statementPeriods('quarter', 'yoy')` → hai kỳ (nhãn + tháng) · `statementValues(kỳ.months)` → giá trị theo
 * mã số · `incomeChartRows()` → 12 tháng gần nhất cho biểu đồ (đơn vị TỶ).
 */

export type StatementValues = Record<StatementCode, number>;

export interface YearMonth {
  year: number;
  month: number;
}

export interface StatementPeriod {
  /** "T9/2026" · "Quý III/2026" · "9T/2026". */
  label: string;
  months: YearMonth[];
}

export interface IncomeChartRow {
  label: string;
  revenue: number;
  cost: number;
  profit: number;
}

const roundThousand = (value: number) => Math.round(value / 1_000) * 1_000;

function monthValues({ year, month }: YearMonth): StatementValues {
  const step = (year - 2025) * 12 + (month - 1);
  const rand = seededRandom(hashSeed(`b02|${year}-${month}`));
  const ratio = (min: number, spread: number) => min + rand() * spread;

  const v01 = roundThousand(
    INCOME_BASE_REVENUE * (1 + 0.011 * step) * INCOME_SEASONALITY[month - 1] * ratio(0.96, 0.08),
  );
  const v02 = roundThousand(v01 * ratio(0.006, 0.006));
  const v10 = v01 - v02;
  const v11 = roundThousand(v10 * ratio(0.765, 0.035));
  const v20 = v10 - v11;
  const v21 = roundThousand(v10 * ratio(0.003, 0.003));
  const v22 = roundThousand(v10 * ratio(0.011, 0.004));
  const v23 = roundThousand(v22 * ratio(0.84, 0.1));
  const v25 = roundThousand(v10 * ratio(0.045, 0.01));
  const v26 = roundThousand(v10 * ratio(0.052, 0.008));
  const v30 = v20 + (v21 - v22) - (v25 + v26);
  const v31 = roundThousand(ratio(2, 43) * 1e6);
  const v32 = roundThousand(ratio(1, 29) * 1e6);
  const v40 = v31 - v32;
  const v50 = v30 + v40;
  const v51 = roundThousand(Math.max(0, v50) * 0.2);
  const v52 = roundThousand(v50 * ratio(-0.004, 0.012));
  const v60 = v50 - v51 - v52;

  return {
    '01': v01,
    '02': v02,
    '10': v10,
    '11': v11,
    '20': v20,
    '21': v21,
    '22': v22,
    '23': v23,
    '25': v25,
    '26': v26,
    '30': v30,
    '31': v31,
    '32': v32,
    '40': v40,
    '50': v50,
    '51': v51,
    '52': v52,
    '60': v60,
  };
}

const MONTH_CACHE = new Map<string, StatementValues>();

function cachedMonth(ym: YearMonth): StatementValues {
  const key = `${ym.year}-${ym.month}`;
  let values = MONTH_CACHE.get(key);
  if (!values) {
    values = monthValues(ym);
    MONTH_CACHE.set(key, values);
  }
  return values;
}

/** Cộng giá trị B02-DN của các tháng (mọi chỉ tiêu cộng dồn được qua tháng). */
export function statementValues(months: readonly YearMonth[]): StatementValues {
  const total = { ...cachedMonth(months[0]) };
  for (const ym of months.slice(1)) {
    const values = cachedMonth(ym);
    (Object.keys(total) as StatementCode[]).forEach((code) => {
      total[code] += values[code];
    });
  }
  return total;
}

const ROMAN = ['I', 'II', 'III', 'IV'];
const range = (from: number, to: number, year: number): YearMonth[] =>
  Array.from({ length: to - from + 1 }, (_, i) => ({ year, month: from + i }));

function periodOf(
  granularity: StatementGranularity,
  year: number,
  anchor: number,
): StatementPeriod {
  if (granularity === 'month')
    return { label: `T${anchor}/${year}`, months: range(anchor, anchor, year) };
  if (granularity === 'quarter') {
    const quarter = Math.ceil(anchor / 3);
    return {
      label: `Quý ${ROMAN[quarter - 1]}/${year}`,
      months: range(quarter * 3 - 2, quarter * 3, year),
    };
  }
  return { label: `${anchor}T/${year}`, months: range(1, anchor, year) };
}

/** Kỳ báo cáo và kỳ so sánh. Lũy kế năm luôn so cùng kỳ năm trước. */
export function statementPeriods(
  granularity: StatementGranularity,
  compare: StatementCompare,
): { current: StatementPeriod; previous: StatementPeriod } {
  const { year, month } = INCOME_LAST_CLOSED;
  const current = periodOf(granularity, year, month);
  if (compare === 'yoy' || granularity === 'ytd') {
    return { current, previous: periodOf(granularity, year - 1, month) };
  }
  const back = granularity === 'month' ? 1 : 3;
  return { current, previous: periodOf(granularity, year, month - back) };
}

/** 12 tháng đã khoá sổ gần nhất: tổng doanh thu (10 + 21 + 31), tổng chi phí (11 + 22 + 25 + 26 + 32), LN trước thuế (50) — tỷ đồng. */
export function incomeChartRows(): IncomeChartRow[] {
  const { year, month } = INCOME_LAST_CLOSED;
  return Array.from({ length: 12 }, (_, i) => {
    const offset = month - 12 + i;
    const ym = offset < 0 ? { year: year - 1, month: offset + 13 } : { year, month: offset + 1 };
    const v = cachedMonth(ym);
    return {
      label: `T${ym.month}/${String(ym.year).slice(2)}`,
      revenue: (v['10'] + v['21'] + v['31']) / 1e9,
      cost: (v['11'] + v['22'] + v['25'] + v['26'] + v['32']) / 1e9,
      profit: v['50'] / 1e9,
    };
  });
}

/** % thay đổi so với kỳ trước; `null` khi kỳ trước bằng 0. */
export function changePercent(current: number, previous: number): number | null {
  if (!previous) return null;
  return ((current - previous) / Math.abs(previous)) * 100;
}
