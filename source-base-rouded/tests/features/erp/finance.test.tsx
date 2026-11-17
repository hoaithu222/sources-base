/**
 * Ba màn phân hệ Tài chính (`src/features/erp/finance`) dựng được dưới router + header và lọc đúng.
 *
 * Mỗi màn: tên trang là heading cấp 1 trên thanh header, đủ thẻ KPI, bảng có dòng đặc trưng (số dư đầu kỳ, dòng tổng,
 * chỉ tiêu B02-DN), ô tìm lọc dòng THẬT (bỏ dấu) và rỗng thì hiện trạng thái rỗng. Thêm vài bất biến số liệu mẫu:
 * số dư chuyển kỳ khớp nhau, TK kết quả kết chuyển về 0, chỉ tiêu tổng đúng công thức B02-DN.
 * jsdom không có layout nên biểu đồ không vẽ — phần hình do ảnh chụp màn hình lo.
 */

import type { ReactElement } from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import { Header, HeaderSlotsProvider } from '@/shared/widgets/header';
import IncomeStatementPage from '@/features/erp/finance/pages/IncomeStatementPage';
import LedgerPage from '@/features/erp/finance/pages/LedgerPage';
import ReceivablesPage from '@/features/erp/finance/pages/ReceivablesPage';
import { LEDGER_ACCOUNTS } from '@/features/erp/finance/constants/ledger.constants';
import { buildLedgerBook, filterLedgerEntries } from '@/features/erp/finance/utils/ledger.utils';
import { buildDebtRows } from '@/features/erp/finance/utils/receivables.utils';
import {
  statementPeriods,
  statementValues,
} from '@/features/erp/finance/utils/income-statement.utils';

function renderPage(page: ReactElement) {
  const router = createMemoryRouter(
    [
      {
        path: '/',
        element: (
          <HeaderSlotsProvider>
            <Header user={{ displayName: 'An', role: 'Kế toán trưởng' }} />
            {page}
          </HeaderSlotsProvider>
        ),
      },
    ],
    { initialEntries: ['/'] },
  );
  return render(<RouterProvider router={router} />);
}

const pageTitle = (name: string) =>
  within(screen.getByRole('banner')).getByRole('heading', { level: 1, name });

describe('màn Sổ cái', () => {
  const book = buildLedgerBook('112', 10);

  it('có tên trang trên header, bốn thẻ tổng hợp, dòng số dư đầu kỳ và dòng tổng', () => {
    renderPage(<LedgerPage />);

    expect(pageTitle('Sổ cái')).toBeInTheDocument();
    const kpi = screen.getByRole('region', { name: 'Tổng hợp số dư và phát sinh trong kỳ' });
    ['Số dư đầu kỳ', 'Phát sinh Nợ', 'Phát sinh Có', 'Số dư cuối kỳ'].forEach((label) =>
      expect(within(kpi).getByText(label)).toBeInTheDocument(),
    );
    expect(
      screen.getByRole('heading', { level: 2, name: /^Sổ cái TK 112 – Tiền gửi ngân hàng/ }),
    ).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'Số dư đầu kỳ' })).toBeInTheDocument();
    expect(
      screen.getByText(`${book.entries.length}/${book.entries.length} bút toán`),
    ).toBeInTheDocument();
    expect(screen.getByText(`${book.entries.length} CT`)).toBeInTheDocument();
    expect(screen.getByText('Dư cuối kỳ')).toBeInTheDocument();
  });

  it('ô tìm lọc bút toán theo diễn giải (không dấu), rỗng thì hiện trạng thái rỗng', () => {
    renderPage(<LedgerPage />);
    const search = screen.getByRole('textbox', { name: 'Tìm bút toán' });
    const expected = filterLedgerEntries(book.entries, 'bhxh');
    expect(expected.length).toBeGreaterThan(0);
    expect(expected.length).toBeLessThan(book.entries.length);

    fireEvent.change(search, { target: { value: 'bhxh' } });
    expect(
      screen.getByText(`${expected.length}/${book.entries.length} bút toán`),
    ).toBeInTheDocument();
    expect(screen.getByText(expected[0].description)).toBeInTheDocument();
    const hidden = book.entries.find((entry) => !expected.includes(entry));
    expect(screen.queryByText(hidden!.voucher)).not.toBeInTheDocument();

    fireEvent.change(search, { target: { value: 'không có chứng từ này' } });
    expect(screen.getByText(/Không có bút toán nào khớp/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Xoá từ khoá' }));
    expect(
      screen.getByText(`${book.entries.length}/${book.entries.length} bút toán`),
    ).toBeInTheDocument();
  });

  it('số liệu mẫu: dư cuối kỳ này = dư đầu kỳ sau, TK kết quả kết chuyển về 0, 25–40 bút toán', () => {
    LEDGER_ACCOUNTS.forEach((account) => {
      for (let month = 1; month <= 10; month++) {
        const current = buildLedgerBook(account.code, month);
        expect(current.entries.length).toBeGreaterThanOrEqual(25);
        expect(current.entries.length).toBeLessThanOrEqual(40);
        if (account.kind === 'balance' && month < 10) {
          expect(buildLedgerBook(account.code, month + 1).opening).toBe(current.closing);
        }
        if (account.kind === 'pnl' && month < 10) expect(current.closing).toBe(0);
      }
    });
  });
});

describe('màn Công nợ', () => {
  const customers = buildDebtRows('receivable');

  it('có KPI phải thu, bảng khách hàng và dòng tổng', () => {
    renderPage(<ReceivablesPage />);

    expect(pageTitle('Công nợ')).toBeInTheDocument();
    const kpi = screen.getByRole('region', { name: 'Chỉ số tổng phải thu' });
    ['Tổng phải thu', 'Nợ quá hạn', 'KH vượt hạn mức'].forEach((label) =>
      expect(within(kpi).getByText(label)).toBeInTheDocument(),
    );
    expect(screen.getByText('Xây dựng Trường Sơn')).toBeInTheDocument();
    expect(screen.getByText(`Cộng ${customers.length} đối tác`)).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: 'Tuổi nợ' })).toBeInTheDocument();
  });

  it('ô tìm lọc đối tác (không dấu), sắp theo dư nợ, đổi sang Phải trả', () => {
    renderPage(<ReceivablesPage />);

    fireEvent.change(screen.getByRole('textbox', { name: 'Tìm đối tác' }), {
      target: { value: 'truong son' },
    });
    expect(screen.getByText(`1/${customers.length}`)).toBeInTheDocument();
    expect(screen.queryByText('Thương mại Minh Phát')).not.toBeInTheDocument();
    fireEvent.change(screen.getByRole('textbox', { name: 'Tìm đối tác' }), {
      target: { value: '' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Dư nợ/ }));
    const smallest = [...customers].sort((a, b) => a.balance - b.balance)[0];
    const firstRow = screen.getAllByRole('row')[1];
    expect(within(firstRow).getByText(smallest.code, { exact: false })).toBeInTheDocument();

    const sideTabs = screen.getByRole('navigation', { name: 'Tab của trang (tiếp)' });
    fireEvent.click(within(sideTabs).getByRole('button', { name: 'Phải trả' }));
    expect(screen.getByText('Tổng phải trả')).toBeInTheDocument();
    expect(screen.getByText('Thép Kim Sơn')).toBeInTheDocument();
  });
});

describe('màn Kết quả kinh doanh', () => {
  it('có KPI, bảng B02-DN đủ chỉ tiêu và đổi kỳ so sánh', () => {
    renderPage(<IncomeStatementPage />);

    expect(pageTitle('Kết quả kinh doanh')).toBeInTheDocument();
    const kpi = screen.getByRole('region', { name: 'Chỉ số kết quả kinh doanh' });
    ['Doanh thu thuần', 'Lợi nhuận gộp', 'Biên lợi nhuận gộp', 'Lợi nhuận sau thuế'].forEach(
      (label) => expect(within(kpi).getByText(label)).toBeInTheDocument(),
    );
    const keyRow = screen.getByText('Lợi nhuận sau thuế thu nhập doanh nghiệp').closest('tr')!;
    expect(within(keyRow).getByText('60')).toBeInTheDocument();
    expect(screen.getAllByText('T8/2026').length).toBeGreaterThan(0);

    fireEvent.click(screen.getByRole('button', { name: /^So sánh với/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Cùng kỳ' }));
    expect(screen.getAllByText('T9/2025').length).toBeGreaterThan(0);
  });

  it('chỉ tiêu tổng đúng công thức B02-DN ở mọi kỳ', () => {
    (['month', 'quarter', 'ytd'] as const).forEach((granularity) => {
      const v = statementValues(statementPeriods(granularity, 'yoy').current.months);
      expect(v['10']).toBe(v['01'] - v['02']);
      expect(v['20']).toBe(v['10'] - v['11']);
      expect(v['30']).toBe(v['20'] + (v['21'] - v['22']) - (v['25'] + v['26']));
      expect(v['40']).toBe(v['31'] - v['32']);
      expect(v['50']).toBe(v['30'] + v['40']);
      expect(v['60']).toBe(v['50'] - v['51'] - v['52']);
    });
  });
});
