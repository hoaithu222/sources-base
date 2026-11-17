import { useCallback, useMemo, useState } from 'react';

import {
  BoxPanel,
  Button,
  Dropdown,
  EmptyState,
  PageBody,
  PageShell,
  showToast,
} from '@/shared/ui';
import { PageHeader, type PageHeaderFilter } from '@/shared/widgets/header';

import LedgerFilterBar from '../components/ledger/LedgerFilterBar';
import LedgerKpiStrip from '../components/ledger/LedgerKpiStrip';
import LedgerTable from '../components/ledger/LedgerTable';
import {
  LEDGER_ACCOUNTS,
  LEDGER_DEFAULT_ACCOUNT,
  LEDGER_OPEN_PERIOD,
  LEDGER_PERIODS,
} from '../constants/ledger.constants';
import {
  FINANCE_PANEL_HEADER_CLASSES,
  FINANCE_PANEL_SLOT_CLASSES,
  FINANCE_PANEL_TITLE_CLASSES,
} from '../finance.theme';
import { buildLedgerBook, filterLedgerEntries, formatPeriod } from '../utils/ledger.utils';

const DEFAULT_MONTH = String(LEDGER_OPEN_PERIOD.month);

const ACCOUNT_OPTIONS = LEDGER_ACCOUNTS.map((account) => ({
  value: account.code,
  label: `${account.code} – ${account.name}`,
  meta: account.nature === 'debit' ? 'Dư Nợ' : 'Dư Có',
}));

const PERIOD_OPTIONS = LEDGER_PERIODS.map(({ month }) => ({
  value: String(month),
  label: `Kỳ ${formatPeriod(month)}`,
  meta: month === LEDGER_OPEN_PERIOD.month ? 'Đang mở' : 'Đã khoá',
}));

/**
 * LedgerPage — màn `/tai-chinh/so-cai` ("Sổ cái"): sổ cái một tài khoản trong một kỳ — chọn tài khoản + kỳ ở bộ lọc
 * của thanh header, bốn thẻ tổng hợp, panel bút toán lấp phần còn lại (tìm + xuất trên header panel; dòng số dư đầu
 * kỳ, số dư lũy kế, dòng tổng dính đáy).
 * Lưu ý: dữ liệu mẫu sinh tại chỗ (`buildLedgerBook`, có hạt giống — ổn định giữa các lần tải); tìm kiếm chỉ lọc
 * bảng, thẻ KPI luôn là số của cả kỳ.
 */
export default function LedgerPage() {
  const [account, setAccount] = useState(LEDGER_DEFAULT_ACCOUNT);
  const [month, setMonth] = useState(DEFAULT_MONTH);
  const [keyword, setKeyword] = useState('');

  const book = useMemo(() => buildLedgerBook(account, Number(month)), [account, month]);
  const entries = useMemo(() => filterLedgerEntries(book.entries, keyword), [book, keyword]);

  const clearSearch = useCallback(() => setKeyword(''), []);
  const handleExport = useCallback(
    () => showToast('info', `Đang xuất sổ cái TK ${book.account.code} kỳ ${book.period}…`),
    [book],
  );

  const filters: PageHeaderFilter[] = [
    {
      key: 'account',
      label: 'Tài khoản',
      icon: 'layer-group-outline',
      value: `TK ${book.account.code} · ${book.account.name}`,
      active: account !== LEDGER_DEFAULT_ACCOUNT,
      content: (
        <Dropdown
          aria-label="Tài khoản"
          options={ACCOUNT_OPTIONS}
          searchable
          searchPlaceholder="Tìm số hiệu, tên tài khoản…"
          size="sm"
          value={account}
          onValueChange={setAccount}
        />
      ),
    },
    {
      key: 'period',
      label: 'Kỳ kế toán',
      icon: 'calendar-outline',
      value: `Kỳ ${book.period}`,
      active: month !== DEFAULT_MONTH,
      content: (
        <Dropdown
          aria-label="Kỳ kế toán"
          options={PERIOD_OPTIONS}
          size="sm"
          value={month}
          onValueChange={setMonth}
        />
      ),
    },
  ];

  return (
    <PageShell>
      <PageHeader
        filters={filters}
        subtitle={`TK ${book.account.code} · Kỳ ${book.period}`}
        title="Sổ cái"
        tone="green"
      />

      <PageBody>
        <LedgerKpiStrip book={book} />

        <BoxPanel
          bodyOverflow="hidden"
          border="hairline"
          className={FINANCE_PANEL_SLOT_CLASSES.ledger}
          headerClassName={FINANCE_PANEL_HEADER_CLASSES}
          headerDivider
          headerRight={
            <LedgerFilterBar
              keyword={keyword}
              resultCount={entries.length}
              totalCount={book.entries.length}
              onExport={handleExport}
              onKeywordChange={setKeyword}
            />
          }
          title={
            <h2 className={FINANCE_PANEL_TITLE_CLASSES}>
              {`Sổ cái TK ${book.account.code} – ${book.account.name} · Kỳ ${book.period}`}
            </h2>
          }
        >
          {entries.length === 0 ? (
            <EmptyState
              action={
                <Button size="sm" variant="stroke" onClick={clearSearch}>
                  Xoá từ khoá
                </Button>
              }
              className="min-h-0 flex-1"
              description="Thử số chứng từ (vd BC10), một phần diễn giải hoặc số TK đối ứng."
              icon="magnifying-glass-bold"
              iconColor="sky"
              title={`Không có bút toán nào khớp "${keyword}"`}
            />
          ) : (
            <LedgerTable book={book} entries={entries} />
          )}
        </BoxPanel>
      </PageBody>
    </PageShell>
  );
}
