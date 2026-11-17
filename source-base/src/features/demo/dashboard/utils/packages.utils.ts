import type { RankingBoardItem } from '@/shared/ui';
import { formatMoneyCompactRaw } from '@/shared/utils/format/money.utils';

import type { DemoPackageRow, PackageStatus } from '../../shared/constants/packages.constants';

/**
 * Hàm thuần của màn `/demo/tong-quan`: số KPI và bảng xếp hạng đều dẫn xuất từ `DEMO_PACKAGE_ROWS`,
 * nên đổi một gói ở `/demo/ghep` là cả hai màn đổi theo — không có con số thứ hai để lệch.
 */

interface PackageSummary {
  count: number;
  /** Tổng giá trị hợp đồng, đồng. */
  totalValue: number;
  byStatus: Record<PackageStatus, number>;
}

interface ContractorRank extends RankingBoardItem {
  packageCount: number;
  /** Tổng giá trị các hợp đồng của nhà thầu, đồng. */
  contractValue: number;
}

const EMPTY_BY_STATUS: Record<PackageStatus, number> = {
  draft: 0,
  running: 0,
  review: 0,
  done: 0,
  late: 0,
};

const LEGAL_FORM_PREFIX = /^Công ty (?:CP|TNHH|Cổ phần|Trách nhiệm hữu hạn) /;

export function summarizePackages(rows: readonly DemoPackageRow[]): PackageSummary {
  const byStatus = { ...EMPTY_BY_STATUS };
  let totalValue = 0;
  for (const row of rows) {
    byStatus[row.status] += 1;
    totalValue += row.value;
  }
  return { count: rows.length, totalValue, byStatus };
}

/** "Công ty CP Xây dựng Trường Sơn" → "Xây dựng Trường Sơn" — nhãn đủ ngắn cho bảng xếp hạng. */
export function shortContractorName(name: string): string {
  return name.replace(LEGAL_FORM_PREFIX, '');
}

/**
 * Xếp hạng nhà thầu theo tiến độ BÌNH QUÂN GIA QUYỀN theo giá trị hợp đồng (làm tròn 1 số lẻ), giảm dần;
 * bằng nhau thì hợp đồng lớn hơn đứng trước. `id` là tên đầy đủ — khoá ổn định khi thứ hạng đổi.
 */
export function rankContractors(rows: readonly DemoPackageRow[]): ContractorRank[] {
  const groups = new Map<string, DemoPackageRow[]>();
  for (const row of rows) {
    groups.set(row.contractor, [...(groups.get(row.contractor) ?? []), row]);
  }

  const ranks = [...groups].map(([contractor, own]): ContractorRank => {
    const contractValue = own.reduce((sum, row) => sum + row.value, 0);
    const weighted =
      contractValue > 0
        ? own.reduce((sum, row) => sum + row.progress * row.value, 0) / contractValue
        : own.reduce((sum, row) => sum + row.progress, 0) / own.length;

    return {
      id: contractor,
      label: shortContractorName(contractor),
      value: Math.round(weighted * 10) / 10,
      packageCount: own.length,
      contractValue,
    };
  });

  return ranks.sort(
    (a, b) =>
      b.value - a.value ||
      b.contractValue - a.contractValue ||
      a.label.localeCompare(b.label, 'vi'),
  );
}

/** Số đồng → "119,7 tỷ" (1 số lẻ, đơn vị tự chọn): đưa thẳng vào `valueFormat` của thẻ KPI đếm số. */
export function formatMoneyKpi(valueDong: number): string {
  const { text, suffix } = formatMoneyCompactRaw(valueDong, 1);
  return suffix ? `${text} ${suffix}` : text;
}
