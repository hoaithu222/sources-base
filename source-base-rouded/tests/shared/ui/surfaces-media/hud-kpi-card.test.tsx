/**
 * `HudKpiCard` + `StackBar` · `CellBar` · `TrendBadge` — thẻ KPI big-screen bê từ dashboard điều hành.
 *
 * Kiểm đúng những chỗ người dùng nhìn thấy khi sai:
 *  - "không có số" (—) bị lẫn với "đang tải" hoặc với số 0;
 *  - huy hiệu biến động tô sai màu, in "80,0%" thay cho "80%";
 *  - thanh tách phần chia sai tỷ lệ; thẻ không có số liệu mất chân nên lệch hàng với thẻ bên cạnh.
 */

import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { CellBar, HudKpiCard, StackBar, TrendBadge } from '@/shared/ui';
import { stackBarDepth } from '@/shared/ui/data-display/bars/stack-bar.utils';

const COMPANY = 'var(--color-indigo-5)';
const OUTSOURCE = 'var(--color-yellow-5)';

const BAR = [
  { value: 300, color: COMPANY, label: 'Công ty' },
  { value: 100, color: OUTSOURCE, label: 'Thuê ngoài' },
];
const LEGEND = [
  { label: 'Công ty', value: '300 máy', color: COMPANY },
  { label: 'Thuê ngoài', value: '100 máy', color: OUTSOURCE },
];

const widthOf = (element: Element | null) => (element as HTMLElement | null)?.style.width;

describe('HudKpiCard', () => {
  it('hiện nhãn, mốc thời gian, số đã định dạng và đơn vị', () => {
    render(
      <HudKpiCard
        icon="boxes-stacked-bold"
        label="Tồn đầu kỳ"
        labelNote="01/10/2026"
        unit="máy"
        value={27682}
      />,
    );

    expect(screen.getByText('Tồn đầu kỳ')).toBeInTheDocument();
    expect(screen.getByText('01/10/2026')).toBeInTheDocument();
    expect(screen.getByText('27.682')).toBeInTheDocument();
    expect(screen.getByText('máy')).toBeInTheDocument();
  });

  it('⛔ `value={null}` hiện "—", KHÔNG hiện số 0', () => {
    render(<HudKpiCard icon="wallet-bold" label="Công nợ" value={null} />);

    expect(screen.getByText('—')).toBeInTheDocument();
    expect(screen.queryByText('0')).not.toBeInTheDocument();
  });

  it('⛔ đang tải thì hiện khung chờ, KHÔNG hiện "—" (dễ đọc nhầm thành không có dữ liệu)', () => {
    render(<HudKpiCard icon="wallet-bold" label="Công nợ" loading value={null} />);

    expect(screen.getByRole('status', { name: 'Đang tải' })).toBeInTheDocument();
    expect(screen.queryByText('—')).not.toBeInTheDocument();
  });

  it('`format` tuỳ biến và `valueTitle` đọc số đủ khi rê chuột', () => {
    render(
      <HudKpiCard
        format={(value) => `${value / 1_000_000_000} tỷ`}
        icon="file-lines-bold"
        label="Kế hoạch"
        value={8_120_000_000}
        valueTitle="8.120.000.000 đ"
      />,
    );

    expect(screen.getByText('8.12 tỷ')).toBeInTheDocument();
    expect(screen.getByTitle('8.120.000.000 đ')).toBeInTheDocument();
  });

  it('chân thẻ: chú thích từng phần + thanh chia đúng tỷ lệ', () => {
    const { container } = render(
      <HudKpiCard
        bar={BAR}
        icon="excavator-bold"
        label="Tồn cuối kỳ"
        legend={LEGEND}
        value={400}
      />,
    );

    expect(screen.getByTitle('Công ty 300 máy')).toBeInTheDocument();
    expect(screen.getByTitle('Thuê ngoài 100 máy')).toBeInTheDocument();
    expect(widthOf(container.querySelector('[title="Công ty"]'))).toBe('75%');
    expect(widthOf(container.querySelector('[title="Thuê ngoài"]'))).toBe('25%');
  });

  it('⛔ thẻ có `bar` mà tổng bằng 0 vẫn GIỮ chân thẻ — không lệch hàng với thẻ bên cạnh', () => {
    render(
      <HudKpiCard
        bar={[{ value: 0, color: COMPANY }]}
        icon="excavator-bold"
        label="Tổng xuất"
        legend={[{ label: 'Công ty', value: '0 máy', color: COMPANY }]}
        value={0}
      />,
    );

    expect(screen.getByTitle('Công ty 0 máy')).toBeInTheDocument();
  });

  it('`density="compact"` không có chân thẻ; dòng phụ bị cắt `…` vẫn rê chuột đọc đủ', () => {
    render(
      <HudKpiCard
        bar={BAR}
        caption="+3 so với tuần trước"
        density="compact"
        icon="users-bold"
        label="Nhân sự"
        legend={LEGEND}
        value={128}
      />,
    );

    expect(screen.getByText('+3 so với tuần trước')).toHaveAttribute(
      'title',
      '+3 so với tuần trước',
    );
    expect(screen.queryByTitle('Công ty 300 máy')).not.toBeInTheDocument();
  });

  it('`onDetail` dựng nút có tên đọc được và gọi đúng handler', async () => {
    const onDetail = vi.fn();
    render(
      <HudKpiCard
        detailLabel="Xem tồn cuối kỳ theo tháng"
        icon="excavator-bold"
        label="Tồn cuối kỳ"
        value={376}
        onDetail={onDetail}
      />,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Xem tồn cuối kỳ theo tháng' }));
    expect(onDetail).toHaveBeenCalledTimes(1);
  });

  it('số lớn luôn là mực `fg-heading` ở mọi `color` — tông chỉ ở ô icon, không biến thể `dark:`', () => {
    const colors = ['blue', 'green', 'yellow', 'red', 'gray'] as const;
    colors.forEach((color) => {
      const { unmount } = render(
        <HudKpiCard
          color={color}
          icon="wallet-bold"
          label="Số dư"
          value={5}
          valueTitle={`so-${color}`}
        />,
      );

      const classes = screen.getByTitle(`so-${color}`).className.split(/\s+/);
      expect(classes).toContain('text-fg-heading');
      expect(classes.filter((name) => name.includes('dark:'))).toEqual([]);
      unmount();
    });
  });

  it('không truyền `onDetail` thì không có nút nào', () => {
    render(<HudKpiCard icon="excavator-bold" label="Tồn cuối kỳ" value={376} />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('`valueClassName` thay màu số lớn (ô chênh lệch tô theo dấu)', () => {
    render(
      <HudKpiCard
        format={(value) => `${value} tr`}
        icon="wallet-bold"
        label="Chênh lệch"
        value={-479}
        valueClassName="text-orange-4"
        valueTitle="chenh-lech"
      />,
    );

    const value = screen.getByTitle('chenh-lech');
    expect(value.className).toContain('text-orange-4');
    expect(value.className).not.toContain('text-sky-4');
  });
});

describe('TrendBadge', () => {
  it('giảm → "▼" + % không dấu, một chữ số thập phân khi cần', () => {
    const { container } = render(<TrendBadge current={73} previous={315} versus="tháng 9/2026" />);
    const badge = container.firstElementChild as HTMLElement;

    expect(badge).toHaveTextContent('▼giảm76,8%');
    expect(badge).toHaveAttribute('title', 'So với tháng 9/2026');
    expect(badge.className).toContain('text-red-4');
  });

  it('⛔ số tròn in "80%", không phải "80,0%"', () => {
    render(<TrendBadge current={2} previous={10} />);
    expect(screen.getByText('80%')).toBeInTheDocument();
  });

  it('tăng → màu tốt; `positive="down"` thì tăng là XẤU (chi phí, tồn kho)', () => {
    const good = render(<TrendBadge current={120} previous={100} />);
    expect((good.container.firstElementChild as HTMLElement).className).toContain('text-green-4');
    good.unmount();

    const bad = render(<TrendBadge current={120} positive="down" previous={100} />);
    expect((bad.container.firstElementChild as HTMLElement).className).toContain('text-red-4');
  });

  it('biến động dưới 0,5% → trung tính, giữ dấu để còn biết chiều', () => {
    const { container } = render(<TrendBadge current={100.2} previous={100} />);
    const badge = container.firstElementChild as HTMLElement;

    expect(badge).toHaveTextContent('+0,2%');
    expect(badge.className).toContain('text-fg-muted');
  });

  it('kỳ trước bằng 0 → "—" (không chia được), không ra Infinity', () => {
    render(<TrendBadge current={5} previous={0} />);
    expect(screen.getByText('—')).toBeInTheDocument();
  });
});

describe('StackBar', () => {
  it('đoạn chia theo tỷ lệ; đoạn giá trị 0 bị bỏ', () => {
    const { container } = render(
      <StackBar
        segments={[
          { value: 60, color: COMPANY, title: 'a' },
          { value: 0, color: OUTSOURCE, title: 'rong' },
          { value: 20, color: OUTSOURCE, title: 'b' },
        ]}
      />,
    );

    expect(widthOf(container.querySelector('[title="a"]'))).toBe('75%');
    expect(widthOf(container.querySelector('[title="b"]'))).toBe('25%');
    expect(container.querySelector('[title="rong"]')).toBeNull();
  });

  it('`max` lớn hơn tổng → phần dư là rãnh trống (thanh tiến độ)', () => {
    const { container } = render(
      <StackBar max={200} segments={[{ value: 50, color: COMPANY, title: 'a' }]} />,
    );
    const fill = container.querySelector('[title="a"]')?.parentElement;

    expect(widthOf(fill ?? null)).toBe('25%');
  });

  it('không có giá trị → chỉ còn rãnh, không vẽ khối', () => {
    const { container } = render(
      <StackBar segments={[{ value: 0, color: COMPANY, title: 'a' }]} />,
    );
    expect(container.querySelector('[title="a"]')).toBeNull();
  });

  it('hộp nhận bề dày + độ sâu qua biến (sáng phẳng, tối cộng độ sâu); `ariaLabel` biến thanh thành hình có tên', () => {
    render(
      <StackBar ariaLabel="Công ty 305" height={12} segments={[{ value: 1, color: COMPANY }]} />,
    );
    const bar = screen.getByRole('img', { name: 'Công ty 305' });

    expect(bar.style.getPropertyValue('--stack-bar-h')).toBe('12px');
    expect(bar.style.getPropertyValue('--stack-bar-depth')).toBe(`${stackBarDepth(12)}px`);
  });

  it('độ sâu nông dần theo bề dày', () => {
    expect([stackBarDepth(24), stackBarDepth(12), stackBarDepth(4), stackBarDepth(2)]).toEqual([
      5, 4, 2, 2,
    ]);
  });
});

describe('CellBar', () => {
  it('`total` lớn hơn tổng → thêm đoạn ô TẮT cho phần dư', () => {
    const { container } = render(
      <CellBar segments={[{ value: 45, color: COMPANY, title: 'sang' }]} total={100} />,
    );
    const parts = within(container.firstElementChild as HTMLElement)
      .getAllByText('', { selector: ':scope > span[style*="width"]' })
      .map(widthOf);

    expect(parts).toEqual(['45%', '55%']);
  });

  it('chưa có số (`total` 0) → cả thanh là ô tắt', () => {
    const { container } = render(<CellBar segments={[]} />);
    const parts = container.querySelectorAll(':scope > div > span[style*="width"]');

    expect(parts).toHaveLength(1);
    expect(widthOf(parts[0])).toBe('100%');
  });
});
