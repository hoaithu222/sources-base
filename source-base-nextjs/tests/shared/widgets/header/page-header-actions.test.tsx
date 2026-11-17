/**
 * `PageHeader actions` + bộ lọc dạng danh sách (`filters[].options`) trên thanh header máy tính.
 *
 * Giữ: hành động trang do WIDGET dựng ở ô phải của thanh — nút `primary` có CHỮ, nút phụ là icon có `aria-label`, bấm gọi
 * `onSelect`; bộ lọc `options` mở bảng nổi từ cột dọc, mỗi lựa chọn là `role="radio"` có `aria-checked`, chọn xong bảng đóng
 * và tooltip / nhãn của icon đọc giá trị mới; trang không có khối tiêu đề thì ô phải vẫn ghim cột 3.
 * jsdom không dựng layout — vị trí pixel kiểm bằng trình duyệt thật.
 */

import { useState } from 'react';
import { fireEvent, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { Header, HeaderSlotsProvider, PageHeader } from '@/shared/widgets/header';
import { renderInRouter } from '@tests/helpers/render';

const OPTIONS = [
  { value: 'all', label: 'Tất cả kho', meta: '36 lô' },
  { value: 'la', label: 'Kho xưởng Long An', meta: '10 lô' },
];

function StockLikePage({ onExport, onCreate }: { onExport: () => void; onCreate: () => void }) {
  const [warehouse, setWarehouse] = useState('all');
  return (
    <PageHeader
      actions={[
        { key: 'export', label: 'Xuất Excel', icon: 'download-bold', onSelect: onExport },
        {
          key: 'create',
          label: 'Tạo phiếu',
          icon: 'plus-outline',
          primary: true,
          onSelect: onCreate,
        },
      ]}
      filters={[
        {
          key: 'warehouse',
          label: 'Kho',
          icon: 'buildings-outline',
          value: OPTIONS.find((option) => option.value === warehouse)?.label,
          active: warehouse !== 'all',
          options: OPTIONS,
          selected: warehouse,
          onSelect: setWarehouse,
        },
      ]}
      title="Tồn kho"
    />
  );
}

function renderWith(page: React.ReactNode, locale?: 'vi' | 'en') {
  return renderInRouter(
    <HeaderSlotsProvider>
      <Header user={{ displayName: 'An', role: 'Thủ kho' }} />
      {page}
    </HeaderSlotsProvider>,
    { locale },
  );
}

describe('PageHeader actions + bộ lọc danh sách', () => {
  it('nút chính có chữ, nút phụ là icon có nhãn — đều nằm trên thanh và gọi onSelect', () => {
    const onExport = vi.fn();
    const onCreate = vi.fn();
    renderWith(<StockLikePage onCreate={onCreate} onExport={onExport} />);
    const banner = within(screen.getByRole('banner'));

    const create = banner.getByRole('button', { name: 'Tạo phiếu' });
    expect(create).toHaveTextContent('Tạo phiếu');
    fireEvent.click(create);
    fireEvent.click(banner.getByRole('button', { name: 'Xuất Excel' }));

    expect(onCreate).toHaveBeenCalledTimes(1);
    expect(onExport).toHaveBeenCalledTimes(1);
  });

  it('bộ lọc options: lựa chọn là radio có số đi kèm; chọn xong bảng đóng, icon đọc giá trị mới + "đang áp dụng"', () => {
    renderWith(<StockLikePage onCreate={vi.fn()} onExport={vi.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: 'Kho · Tất cả kho' }));
    const group = screen.getByRole('radiogroup', { name: 'Kho' });
    expect(within(group).getByRole('radio', { name: /^Tất cả kho/ })).toHaveAttribute(
      'aria-checked',
      'true',
    );
    expect(within(group).getByRole('radio', { name: /^Kho xưởng Long An/ })).toHaveTextContent(
      '10 lô',
    );

    fireEvent.click(within(group).getByRole('radio', { name: /^Kho xưởng Long An/ }));

    expect(screen.queryByRole('radiogroup', { name: 'Kho' })).toBeNull();
    expect(
      screen.getByRole('button', { name: 'Kho · Kho xưởng Long An (đang áp dụng)' }),
    ).toBeInTheDocument();
  });

  it('trang không có khối tiêu đề: ô phải của thanh vẫn ghim cột 3 (không trôi vào giữa)', () => {
    renderWith(null);
    const banner = screen.getByRole('banner');
    const rightCell = banner.querySelector('[data-header-side="right"]')?.parentElement;
    expect(rightCell).toHaveClass('col-start-3');
    expect(within(banner).queryByRole('heading', { level: 1 })).toBeNull();
  });
});

describe('PageHeader — chữ mặc định theo ngôn ngữ', () => {
  const FILTERS = [
    {
      key: 'kho',
      label: 'Kho',
      icon: 'buildings-outline',
      value: 'Kho tổng',
      active: true,
      content: <span>Lọc kho</span>,
    },
  ] as const;

  it.each([
    ['vi', 'Bộ lọc (1 đang áp dụng)', 'Kho · Kho tổng (đang áp dụng)', 'Quay lại'],
    ['en', 'Filters (1 applied)', 'Kho · Kho tổng (applied)', 'Back'],
  ] as const)(
    '%s: cột lọc, nút lọc đang áp dụng và nút quay lại lấy chữ từ bản dịch',
    (locale, railName, filterName, backName) => {
      renderWith(
        <PageHeader backHref="/" filters={FILTERS} title="Tồn kho" onBack={vi.fn()} />,
        locale,
      );

      expect(screen.getByRole('toolbar', { name: railName })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: filterName })).toBeInTheDocument();
      expect(
        within(screen.getByRole('banner')).getByRole('link', { name: backName }),
      ).toBeInTheDocument();
    },
  );

  it('`backLabel` truyền vào thắng chữ mặc định', () => {
    renderWith(
      <PageHeader backHref="/" backLabel="Về danh sách" title="Chi tiết" onBack={vi.fn()} />,
      'en',
    );

    expect(
      within(screen.getByRole('banner')).getByRole('link', { name: 'Về danh sách' }),
    ).toBeInTheDocument();
  });
});
