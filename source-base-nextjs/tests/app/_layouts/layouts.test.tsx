/**
 * Khung trang — `src/app/_layouts`.
 *
 *  - `useRouteScrollRestoration`: vùng cuộn RIÊNG (không dựng lại khi đổi route) về đầu khi sang trang mới, khôi phục vị trí khi
 *    Back / Forward, giữ nguyên khi chỉ đổi `?search`.
 *  - `useDockOverlap`: vùng cuộn nằm dưới Dock ghim đáy nhận `--dock-overlap` = phần bị lấn + khe 8px.
 *  - `PublicHeader` / `PublicFooter` / layout công khai: landmark, liên kết đúng tiền tố ngôn ngữ, chọn ngôn ngữ.
 *  - `AuthLayout`: form nằm trong landmark `<main>` duy nhất.
 */

import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { useRef } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import PublicLayout from '@/app/[locale]/(public)/layout';
import AuthLayout from '@/app/_layouts/AuthLayout';
import PublicFooter from '@/app/_layouts/public/PublicFooter';
import PublicHeader from '@/app/_layouts/public/PublicHeader';
import { useDockOverlap } from '@/app/_layouts/useDockOverlap';
import { useRouteScrollRestoration } from '@/app/_layouts/useRouteScrollRestoration';
import { APP_NAME } from '@/shared/constants/app.constants';
import { navigationMock } from '@tests/helpers/navigation-mock';
import { renderInRouter, renderWithIntl } from '@tests/helpers/render';

let scopeSeq = 0;
/** Vị trí đã lưu sống ở cấp module — mỗi ca một `scope` riêng để không thấy dữ liệu của ca trước. */
const newScope = () => `test-${++scopeSeq}`;

function ScrollHost({ scope, testId = 'scroller' }: { scope: string; testId?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useRouteScrollRestoration(ref, scope);
  return <div ref={ref} data-testid={testId} />;
}

/** Người dùng cuộn tới `top` — jsdom không tự phát sự kiện `scroll` khi gán `scrollTop`. */
function scrollTo(element: HTMLElement, top: number) {
  element.scrollTop = top;
  fireEvent.scroll(element);
}

const scroller = (testId = 'scroller') => screen.getByTestId(testId);

describe('useRouteScrollRestoration', () => {
  function setup(path = '/a') {
    const scope = newScope();
    const view = renderInRouter(<ScrollHost scope={scope} />, { pathname: path });
    /** Mỗi lần điều hướng là một lượt riêng (có `await`) — cờ Back / Forward được hạ bằng microtask sau commit. */
    const go = (pathname: string, search = '') =>
      act(async () => {
        navigationMock.setLocation(pathname, search);
        view.rerender(<ScrollHost scope={scope} />);
      });
    /** Back / Forward: trình duyệt phát `popstate` TRƯỚC khi router đổi pathname. */
    const pop = async (pathname: string) => {
      window.dispatchEvent(new PopStateEvent('popstate'));
      await go(pathname);
    };
    return { scope, view, go, pop };
  }

  it('sang trang khác (liên kết / push / replace) → về đầu', async () => {
    const { go } = setup('/a');
    scrollTo(scroller(), 500);

    await go('/b');

    expect(scroller().scrollTop).toBe(0);
  });

  it('Back / Forward → khôi phục đúng vị trí của từng mục lịch sử', async () => {
    const { go, pop } = setup('/a');
    scrollTo(scroller(), 500);
    await go('/b');
    scrollTo(scroller(), 120);

    await pop('/a');
    expect(scroller().scrollTop).toBe(500);

    await pop('/b');
    expect(scroller().scrollTop).toBe(120);
  });

  it('Back tới trang chưa từng cuộn → về đầu', async () => {
    const { go, pop } = setup('/a');
    await go('/b');
    scrollTo(scroller(), 80);

    await pop('/c');

    expect(scroller().scrollTop).toBe(0);
  });

  it('chỉ đổi `?search` / `#hash` (bộ lọc, tab trên URL) → giữ nguyên vị trí', async () => {
    const { go } = setup('/a');
    scrollTo(scroller(), 300);

    await go('/a', '?page=2');
    expect(scroller().scrollTop).toBe(300);

    await go('/a', '?page=3&tab=x');
    expect(scroller().scrollTop).toBe(300);
  });

  it('render lại cùng pathname không đụng tới vị trí cuộn', async () => {
    const { go } = setup('/a');
    scrollTo(scroller(), 250);

    await go('/a');

    expect(scroller().scrollTop).toBe(250);
  });

  it('⛔ popstate chỉ có hiệu lực cho MỘT lần đổi pathname kế tiếp — sau đó sang trang mới lại về đầu', async () => {
    const { go, pop } = setup('/a');
    scrollTo(scroller(), 500);
    await go('/b');
    scrollTo(scroller(), 120);
    await pop('/a');
    scrollTo(scroller(), 640);

    await go('/b');

    expect(scroller().scrollTop).toBe(0);
  });

  it('⛔ layout bị gỡ (ra ngoài khung, vd /403) rồi dựng lại sau Back → vẫn khôi phục vị trí', async () => {
    const { scope, view, go } = setup('/a');
    scrollTo(scroller(), 640);
    await go('/ngoai');
    view.unmount();

    window.dispatchEvent(new PopStateEvent('popstate'));
    await act(async () => {
      renderInRouter(<ScrollHost scope={scope} />, { pathname: '/a' });
    });

    expect(scroller().scrollTop).toBe(640);
  });

  it('layout dựng lại KHÔNG qua Back (bấm liên kết) → về đầu, không khôi phục vị trí cũ', async () => {
    const { scope, view, go } = setup('/a');
    scrollTo(scroller(), 640);
    await go('/ngoai');
    view.unmount();

    await act(async () => {
      renderInRouter(<ScrollHost scope={scope} />, { pathname: '/a' });
    });

    expect(scroller().scrollTop).toBe(0);
  });

  it('hai vùng cuộn khác `scope` trong cùng lượt render → Back khôi phục đúng từng vùng, không lẫn nhau', async () => {
    const outer = newScope();
    const inner = newScope();
    const Both = () => (
      <>
        <ScrollHost scope={outer} testId="ngoai" />
        <ScrollHost scope={inner} testId="trong" />
      </>
    );
    const view = renderInRouter(<Both />, { pathname: '/a' });
    scrollTo(scroller('ngoai'), 70);
    scrollTo(scroller('trong'), 900);

    await act(async () => {
      navigationMock.setLocation('/b');
      view.rerender(<Both />);
    });
    await act(async () => {
      window.dispatchEvent(new PopStateEvent('popstate'));
      navigationMock.setLocation('/a');
      view.rerender(<Both />);
    });

    expect(scroller('ngoai').scrollTop).toBe(70);
    expect(scroller('trong').scrollTop).toBe(900);
  });
});

type Box = { top: number; bottom: number; left: number; right: number };

const rect = ({ top, bottom, left, right }: Box) =>
  ({
    top,
    bottom,
    left,
    right,
    width: right - left,
    height: bottom - top,
    x: left,
    y: top,
  }) as DOMRect;

function DockShell({ enabled }: { enabled: boolean }) {
  const mainRef = useRef<HTMLElement>(null);
  useDockOverlap(mainRef, enabled);
  return (
    <>
      <main ref={mainRef}>
        <div data-page-shell="scroll">
          <div data-dock-aware="margin" data-testid="under">
            <div data-dock-aware="margin" data-testid="nested" />
          </div>
          <div data-dock-aware data-testid="aside" />
          <div data-dock-aware data-testid="tall" />
        </div>
        <div data-page-shell="flow">
          <div data-dock-aware data-testid="flow" />
        </div>
      </main>
      <nav className="dock-shell" />
    </>
  );
}

const BOXES: Record<string, Box> = {
  under: { top: 200, bottom: 884, left: 16, right: 1000 },
  nested: { top: 300, bottom: 884, left: 16, right: 1000 },
  flow: { top: 200, bottom: 884, left: 16, right: 1000 },
  aside: { top: 200, bottom: 884, left: 1300, right: 1900 },
  tall: { top: 200, bottom: 2400, left: 16, right: 1900 },
  dock: { top: 830, bottom: 888, left: 760, right: 1160 },
};

/** jsdom không dựng layout → giả lập hộp bằng `getBoundingClientRect`. */
function mockLayout() {
  vi.spyOn(window, 'innerHeight', 'get').mockReturnValue(900);
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (
    this: HTMLElement,
  ) {
    const key = this.classList.contains('dock-shell') ? 'dock' : this.dataset.testid;
    return rect(BOXES[key ?? ''] ?? { top: 0, bottom: 0, left: 0, right: 0 });
  });
}

const nextFrame = () =>
  act(() => new Promise<void>((resolve) => requestAnimationFrame(() => resolve())));

describe('useDockOverlap', () => {
  afterEach(() => vi.restoreAllMocks());

  it('chỉ vùng nằm dưới Dock (cùng dải ngang, trọn trong màn) nhận --dock-overlap = lấn + 8px', async () => {
    mockLayout();
    render(<DockShell enabled />);
    await nextFrame();

    expect(screen.getByTestId('under').style.getPropertyValue('--dock-overlap')).toBe('62px');
    expect(screen.getByTestId('aside').style.getPropertyValue('--dock-overlap')).toBe('');
    expect(screen.getByTestId('tall').style.getPropertyValue('--dock-overlap')).toBe('');
  });

  it('vùng nằm trong vùng đã chừa thì bỏ qua; trang trôi (không khoá cao) không bao giờ bị ghi', async () => {
    mockLayout();
    render(<DockShell enabled />);
    await nextFrame();

    expect(screen.getByTestId('nested').style.getPropertyValue('--dock-overlap')).toBe('');
    expect(screen.getByTestId('flow').style.getPropertyValue('--dock-overlap')).toBe('');
  });

  it('tắt (Dock không ghim đáy) → không ghi gì; bật rồi gỡ hook → dọn biến', async () => {
    mockLayout();
    const view = render(<DockShell enabled={false} />);
    await nextFrame();
    expect(screen.getByTestId('under').style.getPropertyValue('--dock-overlap')).toBe('');

    view.rerender(<DockShell enabled />);
    await nextFrame();
    const under = screen.getByTestId('under');
    expect(under.style.getPropertyValue('--dock-overlap')).toBe('62px');

    view.unmount();
    expect(under.style.getPropertyValue('--dock-overlap')).toBe('');
  });
});

describe('PublicHeader', () => {
  it('có landmark banner, điều hướng chính và chọn ngôn ngữ; liên kết theo ngôn ngữ vi', () => {
    renderWithIntl(<PublicHeader />);

    const banner = screen.getByRole('banner');
    expect(
      within(banner).getByRole('navigation', { name: 'Điều hướng chính' }),
    ).toBeInTheDocument();
    expect(within(banner).getByRole('navigation', { name: 'Ngôn ngữ' })).toBeInTheDocument();
    expect(within(banner).getByRole('link', { name: APP_NAME })).toHaveAttribute('href', '/');
    expect(within(banner).getByRole('link', { name: 'Giới thiệu' })).toHaveAttribute(
      'href',
      '/about',
    );
    expect(within(banner).getByRole('link', { name: 'Đăng nhập' })).toHaveAttribute(
      'href',
      '/login',
    );
    expect(within(banner).getByRole('link', { name: 'Bắt đầu' })).toHaveAttribute(
      'href',
      '/register',
    );
  });

  it('bản tiếng Anh: chữ tiếng Anh và liên kết có tiền tố /en', () => {
    renderWithIntl(<PublicHeader />, { locale: 'en' });

    const banner = screen.getByRole('banner');
    expect(within(banner).getByRole('navigation', { name: 'Main navigation' })).toBeInTheDocument();
    expect(within(banner).getByRole('link', { name: APP_NAME })).toHaveAttribute('href', '/en');
    expect(within(banner).getByRole('link', { name: 'About' })).toHaveAttribute(
      'href',
      '/en/about',
    );
    expect(within(banner).getByRole('link', { name: 'Sign in' })).toHaveAttribute(
      'href',
      '/en/login',
    );
    expect(within(banner).getByRole('link', { name: 'Get started' })).toHaveAttribute(
      'href',
      '/en/register',
    );
  });

  it('bộ chọn ngôn ngữ trỏ sang bản dịch của CHÍNH trang đang xem', () => {
    renderInRouter(<PublicHeader />, { pathname: '/about' });

    const switcher = screen.getByRole('navigation', { name: 'Ngôn ngữ' });
    expect(within(switcher).getByRole('link', { name: 'EN' })).toHaveAttribute('href', '/en/about');
  });

  it('nút đổi giao diện có nhãn theo theme hiện tại', () => {
    renderWithIntl(<PublicHeader />);

    expect(screen.getByRole('button', { name: 'Chuyển sang chế độ tối' })).toBeInTheDocument();
  });
});

describe('PublicFooter', () => {
  it('có landmark contentinfo, liên kết chân trang và dòng bản quyền có năm + tên app', () => {
    renderWithIntl(<PublicFooter />);

    const footer = screen.getByRole('contentinfo');
    const nav = within(footer).getByRole('navigation', { name: 'Liên kết chân trang' });
    expect(within(nav).getByRole('link', { name: 'Giới thiệu' })).toHaveAttribute('href', '/about');
    expect(within(nav).getByRole('link', { name: 'Đăng nhập' })).toHaveAttribute('href', '/login');
    expect(footer).toHaveTextContent(
      `© ${new Date().getFullYear()} ${APP_NAME}. Bảo lưu mọi quyền.`,
    );
  });

  it('bản tiếng Anh', () => {
    renderWithIntl(<PublicFooter />, { locale: 'en' });

    const footer = screen.getByRole('contentinfo');
    expect(footer).toHaveTextContent('All rights reserved.');
    expect(within(footer).getByRole('link', { name: 'About' })).toHaveAttribute(
      'href',
      '/en/about',
    );
  });
});

describe('layout nhóm (public)', () => {
  it('khung gồm liên kết bỏ qua, header, MỘT <main id="main-content"> chứa trang, và footer', () => {
    renderWithIntl(
      <PublicLayout>
        <p>Nội dung trang</p>
      </PublicLayout>,
    );

    const skip = screen.getByRole('link', { name: 'Bỏ qua tới nội dung' });
    expect(skip).toHaveAttribute('href', '#main-content');
    const main = screen.getByRole('main');
    expect(main).toHaveAttribute('id', 'main-content');
    expect(within(main).getByText('Nội dung trang')).toBeInTheDocument();
    expect(screen.getAllByRole('main')).toHaveLength(1);
    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
  });
});

describe('AuthLayout', () => {
  it('đặt trang con trong landmark <main> duy nhất của thẻ xác thực', () => {
    renderWithIntl(
      <AuthLayout>
        <p>Form đăng nhập</p>
      </AuthLayout>,
    );

    const main = screen.getByRole('main');
    expect(within(main).getByText('Form đăng nhập')).toBeInTheDocument();
    expect(screen.getAllByRole('main')).toHaveLength(1);
  });
});
