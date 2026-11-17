import { matchesSearch } from '@/shared/utils/format/string.utils';

import {
  LEDGER_ACCOUNTS,
  LEDGER_OPEN_PERIOD,
  type LedgerAccount,
  type LedgerTemplateRow,
} from '../constants/ledger.constants';
import {
  FINANCE_CUSTOMERS,
  FINANCE_EMPLOYEES,
  FINANCE_MATERIALS,
  FINANCE_SERVICES,
  FINANCE_SUPPLIERS,
  type FinancePartner,
} from '../constants/partners.constants';
import {
  amountBetween,
  hashSeed,
  intBetween,
  pickOne,
  pickWeighted,
  seededRandom,
} from './finance-random.utils';
import { partnerShortName } from './finance-format.utils';

/**
 * Sinh sổ cái mẫu theo tài khoản × kỳ: `buildLedgerBook('112', 10)` → số dư đầu kỳ, 25–40 bút toán xếp theo ngày (mỗi
 * dòng có số dư lũy kế), tổng phát sinh và dư cuối kỳ. TK bảng cân đối chuyển số dư từ kỳ trước (dư cuối T9 = dư đầu
 * T10); TK kết quả (511, 632, 642) đã khoá sổ thì có bút toán kết chuyển 911 ngày cuối kỳ, dư cuối về 0.
 * Lọc theo từ khoá: `filterLedgerEntries` (bỏ dấu, khớp số CT · diễn giải · TK đối ứng · ngày).
 */

export interface LedgerEntry {
  id: string;
  date: string;
  voucher: string;
  description: string;
  contra: string;
  debit: number;
  credit: number;
  /** Số dư lũy kế SAU bút toán, theo chiều dư của tài khoản (dư Nợ hoặc dư Có). */
  balance: number;
}

export interface LedgerBook {
  account: LedgerAccount;
  /** "10/2026". */
  period: string;
  /** Kỳ đang mở sổ (chưa kết chuyển cuối kỳ). */
  isOpen: boolean;
  openingDate: string;
  opening: number;
  entries: LedgerEntry[];
  totalDebit: number;
  totalCredit: number;
  closing: number;
}

const pad = (value: number, size = 2) => String(value).padStart(size, '0');

/** Kỳ dạng "MM/YYYY". */
export const formatPeriod = (month: number, year: number = LEDGER_OPEN_PERIOD.year) =>
  `${pad(month)}/${year}`;

/** Tài khoản theo số hiệu; số hiệu lạ → tài khoản đầu danh mục. */
export const ledgerAccountOf = (code: string) =>
  LEDGER_ACCOUNTS.find((account) => account.code === code) ?? LEDGER_ACCOUNTS[0];

function workdaysOf(month: number, lastDay: number): number[] {
  const days: number[] = [];
  for (let day = 1; day <= lastDay; day++) {
    if (new Date(LEDGER_OPEN_PERIOD.year, month - 1, day).getDay() !== 0) days.push(day);
  }
  return days;
}

/** Đối tác hạn mức lớn xuất hiện trong diễn giải nhiều hơn (trọng số = hạn mức). */
const byLimit = (partners: readonly FinancePartner[]) =>
  partners.map((partner) => ({ name: partner.name, weight: partner.limit }));
const CUSTOMERS_BY_LIMIT = byLimit(FINANCE_CUSTOMERS);
const SUPPLIERS_BY_LIMIT = byLimit(FINANCE_SUPPLIERS);

function fillText(text: string, rand: () => number, month: number): string {
  const replacements: Record<string, () => string> = {
    kh: () => partnerShortName(pickWeighted(rand, CUSTOMERS_BY_LIMIT).name),
    ncc: () => partnerShortName(pickWeighted(rand, SUPPLIERS_BY_LIMIT).name),
    hd: () => `HĐ ${pad(intBetween(rand, 1_180, 4_860), 7)}`,
    vt: () => pickOne(rand, FINANCE_MATERIALS),
    dv: () => pickOne(rand, FINANCE_SERVICES),
    nv: () => pickOne(rand, FINANCE_EMPLOYEES),
    thang: () => formatPeriod(month),
    thangTruoc: () => (month > 1 ? formatPeriod(month - 1) : formatPeriod(12, 2025)),
    lsx: () => `LSX-26${pad(month)}-${pad(intBetween(rand, 1, 14))}`,
  };
  return text.replace(/\{(\w+)\}/g, (match, key: string) => replacements[key]?.() ?? match);
}

/** TK kết quả chỉ có nghiệp vụ giảm (hàng trả lại, hoàn ứng) khi số dư lũy kế đã vượt mức này (đồng). */
const PNL_REVERSAL_FLOOR = 500_000_000;

/** Xác suất chọn nghiệp vụ TĂNG: số dư càng dưới giữa dải càng dễ tăng (kẹp 15–85%). */
function increaseChance(account: LedgerAccount, balance: number): number {
  if (account.kind === 'pnl') return 1;
  const [low, high] = account.band;
  const chance = 0.5 + ((low + high) / 2 - balance) / (high - low);
  return Math.min(0.85, Math.max(0.15, chance));
}

function pickTemplate(
  account: LedgerAccount,
  rand: () => number,
  balance: number,
  used: Set<LedgerTemplateRow>,
): LedgerTemplateRow {
  const free = account.templates.filter((row) => !(row[7] && used.has(row)));
  const toItems = (rows: readonly LedgerTemplateRow[]) =>
    rows.map((row) => ({ row, weight: row[6] ?? 1 }));
  if (account.kind === 'pnl') {
    const pool = balance > PNL_REVERSAL_FLOOR ? free : free.filter((row) => row[1] === '+');
    return pickWeighted(rand, toItems(pool)).row;
  }
  const effect = rand() < increaseChance(account, balance) ? '+' : '-';
  const sameEffect = free.filter((row) => row[1] === effect);
  return pickWeighted(rand, toItems(sameEffect.length > 0 ? sameEffect : free)).row;
}

const BOOK_CACHE = new Map<string, LedgerBook>();

/** Nghiệp vụ GIẢM không được vượt tỉ lệ này của số dư hiện có (làm tròn nghìn đồng). */
const DECREASE_CAP = 0.4;

function generateBook(account: LedgerAccount, month: number): LedgerBook {
  const { year } = LEDGER_OPEN_PERIOD;
  const isOpen = month === LEDGER_OPEN_PERIOD.month;
  const daysInMonth = new Date(year, month, 0).getDate();
  const rand = seededRandom(hashSeed(`${account.code}|${year}-${month}`));
  const opening =
    account.kind === 'pnl' || month === 1
      ? account.openingYear
      : buildLedgerBook(account.code, month - 1).closing;

  const workdays = workdaysOf(month, isOpen ? LEDGER_OPEN_PERIOD.lastDay : daysInMonth);
  const closes = account.kind === 'pnl' && !isOpen;
  const count = intBetween(rand, 25, 40) - (closes ? 1 : 0);
  const days = Array.from({ length: count }, () => pickOne(rand, workdays)).sort((a, b) => a - b);

  const counters = new Map<string, number>();
  const nextVoucher = (prefix: string) => {
    const next = (counters.get(prefix) ?? intBetween(rand, 0, 6)) + intBetween(rand, 1, 3);
    counters.set(prefix, next);
    return `${prefix}${pad(month)}-${pad(next, 3)}`;
  };

  const used = new Set<LedgerTemplateRow>();
  const entries: LedgerEntry[] = [];
  let balance = opening;
  const push = (day: number, voucher: string, text: string, contra: string, delta: number) => {
    const increasesDebit = (account.nature === 'debit') === delta > 0;
    balance += delta;
    entries.push({
      id: `${account.code}-${month}-${entries.length}`,
      date: `${pad(day)}/${pad(month)}/${year}`,
      voucher,
      description: text,
      contra,
      debit: increasesDebit ? Math.abs(delta) : 0,
      credit: increasesDebit ? 0 : Math.abs(delta),
      balance,
    });
  };

  for (const day of days) {
    const row = pickTemplate(account, rand, balance, used);
    used.add(row);
    const [prefix, effect, contra, text, min, max] = row;
    const amount = amountBetween(rand, min, max);
    const cap = Math.round((balance * DECREASE_CAP) / 1_000) * 1_000;
    const delta = effect === '+' ? amount : -Math.min(amount, cap);
    push(day, nextVoucher(prefix), fillText(text, rand, month), contra, delta);
  }

  if (closes) {
    const text = `Kết chuyển ${account.name.toLowerCase()} kỳ ${formatPeriod(month)} sang TK 911`;
    push(daysInMonth, nextVoucher('KT'), text, '911', -balance);
  }

  const totalDebit = entries.reduce((sum, entry) => sum + entry.debit, 0);
  const totalCredit = entries.reduce((sum, entry) => sum + entry.credit, 0);
  return {
    account,
    period: formatPeriod(month),
    isOpen,
    openingDate: `01/${pad(month)}/${year}`,
    opening,
    entries,
    totalDebit,
    totalCredit,
    closing: balance,
  };
}

/** Sổ cái của tài khoản `code` trong tháng `month` (năm 2026) — kết quả được nhớ lại, gọi lại không tốn. */
export function buildLedgerBook(code: string, month: number): LedgerBook {
  const key = `${code}|${month}`;
  const cached = BOOK_CACHE.get(key);
  if (cached) return cached;
  const book = generateBook(ledgerAccountOf(code), month);
  BOOK_CACHE.set(key, book);
  return book;
}

/** Bút toán khớp từ khoá (bỏ dấu, không phân biệt hoa thường); từ khoá rỗng → giữ nguyên. */
export function filterLedgerEntries(entries: LedgerEntry[], keyword: string): LedgerEntry[] {
  if (!keyword.trim()) return entries;
  return entries.filter((entry) =>
    matchesSearch([entry.voucher, entry.description, entry.contra, entry.date], keyword),
  );
}
