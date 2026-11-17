/**
 * Nhóm hiển thị cơ bản của UI kit (primitives · feedback · layout · icons) — các lỗi đã ghi trong
 * `docs/known-issues.md` và hành vi React 19 (`ref` là prop thường) sau khi bỏ `forwardRef`.
 */

import { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  Avatar,
  Badge,
  Callout,
  FilterDisclosure,
  LiquidGauge,
  PageBody,
  Progress,
  ProgressCircle,
  SectionHeader,
  Text,
} from '@/shared/ui';

describe('SectionHeader — màu tone qua biến CSS', () => {
  it('inline style chỉ đặt biến `--section-tone` hợp lệ; tiêu đề không còn textShadow inline', () => {
    const { container } = render(<SectionHeader iconColor="sky" title="Tiến độ" />);
    const root = container.firstElementChild as HTMLElement;

    expect(root.style.getPropertyValue('--section-tone')).toBe('var(--color-sky-5)');
    expect(screen.getByText('Tiến độ').style.textShadow).toBe('');
  });
});

describe('Progress / ProgressCircle — max không hợp lệ', () => {
  it('Progress max=0 → 0%, không ra NaN', () => {
    const { container } = render(<Progress max={0} showValue value={0} />);
    const bar = screen.getByRole('progressbar');
    const fill = container.querySelector<HTMLElement>('[role="progressbar"] > div');

    expect(bar).toHaveAttribute('aria-valuenow', '0');
    expect(fill?.style.width).toBe('0%');
    expect(screen.getByText('0%')).toBeInTheDocument();
  });

  it('Progress giá trị NaN / max âm → 0%', () => {
    const { rerender } = render(<Progress value={Number.NaN} />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0');

    rerender(<Progress max={-10} value={5} />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0');
  });

  it('ProgressCircle max=0 → 0%, nhãn đọc được', () => {
    render(<ProgressCircle max={0} showValue size="md" value={0} />);
    const ring = screen.getByRole('progressbar', { name: 'Hoàn thành 0%' });

    expect(ring).toHaveAttribute('aria-valuenow', '0');
    expect(ring.querySelectorAll('circle')).toHaveLength(1);
  });

  it('Progress có tên truy cập được (mặc định "Hoàn thành N%", đổi bằng `label`)', () => {
    const { rerender } = render(<Progress max={50} value={30} />);
    expect(screen.getByRole('progressbar', { name: 'Hoàn thành 60%' })).toBeInTheDocument();

    rerender(<Progress label="Tiến độ gói thầu" value={30} />);
    expect(screen.getByRole('progressbar', { name: 'Tiến độ gói thầu' })).toBeInTheDocument();
  });
});

describe('React 19 — `ref` là prop thường', () => {
  it('Progress / ProgressCircle / Badge trỏ ref tới phần tử gốc', () => {
    const progressRef = createRef<HTMLDivElement>();
    const circleRef = createRef<HTMLDivElement>();
    const badgeRef = createRef<HTMLSpanElement>();

    render(
      <>
        <Progress ref={progressRef} value={10} />
        <ProgressCircle ref={circleRef} value={10} />
        <Badge ref={badgeRef}>Mới</Badge>
      </>,
    );

    expect(progressRef.current).toBeInstanceOf(HTMLDivElement);
    expect(circleRef.current).toHaveAttribute('role', 'progressbar');
    expect(badgeRef.current).toHaveTextContent('Mới');
  });
});

describe('Avatar — bấm được thì là nút thật', () => {
  it('có onClick → role button, tên theo `name`, bấm bằng Enter / Space', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<Avatar name="Vũ Đạt" onClick={onClick} />);

    const button = screen.getByRole('button', { name: 'Vũ Đạt' });
    button.focus();
    await user.keyboard('{Enter}');
    await user.keyboard(' ');
    await user.click(button);

    expect(onClick).toHaveBeenCalledTimes(3);
  });

  it('không có onClick → không phải nút, không vào thứ tự tab', () => {
    render(<Avatar name="Vũ Đạt" />);

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(screen.getByText('VĐ').closest('[tabindex]')).toBeNull();
  });
});

describe('PageBody — khung neo cho phần tử absolute', () => {
  it('luôn `relative` để span sr-only (absolute) của con không neo ra `<main>`', () => {
    render(
      <PageBody>
        <span className="sr-only">42 việc</span>
      </PageBody>,
    );

    expect(screen.getByText('42 việc').parentElement).toHaveClass('relative');
  });
});

describe('Callout — nút đóng', () => {
  it('bấm × gọi onClose một lần', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<Callout closable intent="warning" title="Sắp hết hạn" onClose={onClose} />);

    await user.click(screen.getByRole('button', { name: 'Đóng' }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});

describe('Text — `title` không bị nuốt', () => {
  it('không `ellipsis` → `title` gắn thẳng lên phần tử (tooltip gốc của trình duyệt)', () => {
    render(<Text title="Mã nội bộ">PKG-01</Text>);

    expect(screen.getByText('PKG-01')).toHaveAttribute('title', 'Mã nội bộ');
  });
});

describe('LiquidGauge — nhãn đọc màn hình khớp số hiển thị', () => {
  it('làm tròn % trong aria-label như con số in giữa', () => {
    render(<LiquidGauge label="Bể số 2" value={63.456} />);

    expect(screen.getByRole('meter', { name: 'Bể số 2: 63%' })).toBeInTheDocument();
    expect(screen.getByText('63%')).toBeInTheDocument();
  });
});

describe('FilterDisclosure — gom bộ lọc thành một thanh ở điện thoại', () => {
  const realMatchMedia = window.matchMedia;
  afterEach(() => {
    window.matchMedia = realMatchMedia;
  });

  const mockPhone = (matches: boolean) => {
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
  };

  it('màn rộng: vẽ nguyên children, không có nút thu gọn, lớp bọc là display:contents', () => {
    mockPhone(false);
    const { container } = render(
      <FilterDisclosure summary="T10/2026">
        <button type="button">Tháng</button>
      </FilterDisclosure>,
    );

    expect(screen.getByRole('button', { name: 'Tháng' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Bộ lọc/ })).toBeNull();
    expect(container.firstElementChild).toHaveClass('contents');
  });

  it('điện thoại: thu gọn mặc định, hiện tóm tắt; bấm thì bung và đổi aria-expanded', async () => {
    mockPhone(true);
    const user = userEvent.setup();
    render(
      <FilterDisclosure summary="T11/2025 → T10/2026">
        <button type="button">Tháng</button>
      </FilterDisclosure>,
    );
    const toggle = screen.getByRole('button', { name: /Bộ lọc/ });

    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(toggle).toHaveClass('min-h-11');
    expect(screen.getByText('T11/2025 → T10/2026')).toBeInTheDocument();

    await user.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    expect(screen.queryByText('T11/2025 → T10/2026')).toBeNull();
  });

  it('điện thoại: vùng đang đóng là inert (không nhận Tab) nhưng KHÔNG gỡ khỏi cây; mở thì hết inert', async () => {
    mockPhone(true);
    const user = userEvent.setup();
    render(
      <FilterDisclosure>
        <button type="button">Quý</button>
      </FilterDisclosure>,
    );
    const toggle = screen.getByRole('button', { name: /Bộ lọc/ });
    const region = document.getElementById(toggle.getAttribute('aria-controls') ?? '');

    expect(region).not.toBeNull();
    expect(region).toHaveAttribute('inert');
    expect(region?.parentElement).toHaveClass('grid-rows-[0fr]');

    await user.click(toggle);
    expect(region).not.toHaveAttribute('inert');
    expect(region?.parentElement).toHaveClass('grid-rows-[1fr]');
  });

  it('điện thoại: huy hiệu số bộ lọc; "Đặt lại" khoá khi activeCount = 0, gọi onReset khi > 0', async () => {
    mockPhone(true);
    const user = userEvent.setup();
    const onReset = vi.fn();
    const { rerender } = render(
      <FilterDisclosure activeCount={0} defaultOpen onReset={onReset}>
        <span>x</span>
      </FilterDisclosure>,
    );
    expect(screen.getByRole('button', { name: 'Đặt lại' })).toBeDisabled();

    rerender(
      <FilterDisclosure activeCount={2} defaultOpen onReset={onReset}>
        <span>x</span>
      </FilterDisclosure>,
    );
    expect(screen.getByText('2')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Đặt lại' }));
    expect(onReset).toHaveBeenCalledTimes(1);
  });

  it('điện thoại: sticky dính đầu vùng cuộn; bodyClassName đổi lưới điều khiển', () => {
    mockPhone(true);
    render(
      <FilterDisclosure bodyClassName="grid-cols-2" defaultOpen sticky>
        <span>a</span>
        <span>b</span>
      </FilterDisclosure>,
    );

    expect(screen.getByRole('region', { name: 'Bộ lọc' })).toHaveClass('sticky', 'top-0');
    expect(screen.getByText('a').parentElement).toHaveClass('grid-cols-2');
  });
});
