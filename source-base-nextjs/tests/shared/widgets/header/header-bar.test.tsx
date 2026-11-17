/**
 * Thanh `Header` máy tính (base light) — MỘT dải trái → phải: logo · bộ chọn phân hệ · dải điều hướng phân hệ · tên trang
 * (crumb) | tìm kiếm · nút toàn cục · menu người dùng. Tab của trang KHÔNG lên header — `PageHeader` dựng dải tab gạch chân
 * trong luồng trang.
 *
 * Giữ: bốn khoá `HEADER_HEIGHT_CLASS` đi cùng hai bậc 56 · 64px (đảo nổi 48 · 56px + lề trên); không còn "bảng tên giữa
 * thanh" / chip vát của kiểu HUD cũ; mọi mục điều hướng là `<a>` thật; nhóm bung menu bằng nút; kiểu thanh đọc từ store
 * cục bộ (`data-appearance`); vào màn hình (cấp ≥ 2) header đổi sang vệt ‹ · phân hệ › màn hình, Ctrl/⌘ + ↑ lên một cấp;
 * launcher có hàng "Gần đây" và Enter mở kết quả đầu.
 * jsdom không dựng layout — số đo pixel kiểm bằng trình duyệt thật.
 */

import { act, fireEvent, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { HEADER_HEIGHT_CLASS } from '@/shared/constants/layout.constants';
import {
  Header,
  HeaderSlotsProvider,
  PageHeader,
  type HeaderModule,
  type HeaderNavItem,
} from '@/shared/widgets/header';
import { useHeaderAppearanceStore } from '@/shared/widgets/header/chrome/header-appearance.store';
import { useRecentModulesStore } from '@/shared/widgets/header/modules/recent-modules.store';
import { navigationMock } from '@tests/helpers/navigation-mock';
import { renderInRouter } from '@tests/helpers/render';

const originalMatchMedia = window.matchMedia;

const MODULES: HeaderModule[] = [
  {
    id: 'tai-chinh',
    title: 'Tài chính',
    icon: 'wallet-bold',
    tone: 'primary',
    group: 'Tài chính',
    href: '/tai-chinh',
    screens: [
      { key: 'ledger', label: 'Sổ cái', href: '/tai-chinh/so-cai', icon: 'ledger' },
      { key: 'debt', label: 'Công nợ', href: '/tai-chinh/cong-no', icon: 'invoice' },
    ],
  },
  {
    id: 'kho-van',
    title: 'Kho vận',
    subtitle: 'Nhập, xuất, tồn',
    icon: 'boxes-stacked-bold',
    tone: 'yellow',
    group: 'Chuỗi cung ứng',
    href: '/kho-van',
  },
];

const NAV: HeaderNavItem[] = [
  { key: 'overview', label: 'Tổng quan', href: '/tai-chinh' },
  { key: 'ledger', label: 'Sổ cái', href: '/tai-chinh/so-cai', active: true },
  {
    key: 'reports',
    label: 'Báo cáo tài chính',
    href: '/tai-chinh/bao-cao/can-doi',
    children: [
      { key: 'balance', label: 'Cân đối kế toán', href: '/tai-chinh/bao-cao/can-doi' },
      { key: 'pnl', label: 'Kết quả kinh doanh', href: '/tai-chinh/bao-cao/ket-qua' },
    ],
  },
];

type HeaderExtra = Partial<
  Pick<React.ComponentProps<typeof Header>, 'level' | 'moduleHref' | 'backHref' | 'activeModuleId'>
>;

function renderHeader(
  page?: React.ReactNode,
  moduleNav: HeaderNavItem[] = NAV,
  extra: HeaderExtra = {},
  pathname = '/tai-chinh/so-cai',
  locale?: 'vi' | 'en',
) {
  return renderInRouter(
    <HeaderSlotsProvider>
      <Header
        activeModuleId="tai-chinh"
        moduleNav={moduleNav}
        modules={MODULES}
        shortcutLabel="Ctrl K"
        user={{ displayName: 'An', role: 'Kế toán' }}
        {...{ level: 1, moduleHref: '/tai-chinh', ...extra }}
      />
      <main>{page}</main>
    </HeaderSlotsProvider>,
    { pathname, locale },
  );
}

beforeEach(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }),
  });
});

afterEach(() => {
  useHeaderAppearanceStore.setState(useHeaderAppearanceStore.getInitialState(), true);
  useRecentModulesStore.setState(useRecentModulesStore.getInitialState(), true);
  localStorage.clear();
  Object.defineProperty(window, 'matchMedia', { writable: true, value: originalMatchMedia });
});

describe('HEADER_HEIGHT_CLASS — bốn khoá là một bộ (56px → wide 64px)', () => {
  it.each([
    ['', 14, '3.5'],
    ['wide:', 16, '4'],
  ] as const)('bậc "%s" cao h-%i (%srem) ở cả bốn khoá', (prefix, step, rem) => {
    expect(HEADER_HEIGHT_CLASS.height).toContain(`${prefix}h-${step}`);
    expect(HEADER_HEIGHT_CLASS.contentTopOffset).toContain(`${prefix}pt-${step}`);
    expect(HEADER_HEIGHT_CLASS.belowHeader).toContain(`${prefix}top-${step}`);
    expect(HEADER_HEIGHT_CLASS.contentMaxHeight).toContain(
      `${prefix}max-h-[calc(100dvh-${rem}rem)]`,
    );
  });
});

describe('Header — kiểu thanh', () => {
  it('mặc định `brand` (gradient VCI trên đảo nổi), đổi store → `glass` mà không cần prop', () => {
    renderHeader();
    const banner = screen.getByRole('banner');
    expect(banner).toHaveAttribute('data-appearance', 'brand');
    expect(banner.firstElementChild?.className).toContain('from-bg-brand-from');

    act(() => useHeaderAppearanceStore.getState().setAppearance('glass'));
    expect(screen.getByRole('banner')).toHaveAttribute('data-appearance', 'glass');
  });

  it('không còn đồng hồ, không còn chip vát / bảng tên của kiểu HUD cũ', () => {
    const { container } = renderHeader();
    expect(container.querySelector('time')).toBeNull();
    expect(container.querySelector('[data-skin], [data-shelf]')).toBeNull();
  });
});

describe('Header — phân hệ trên thanh', () => {
  it('nút ⊞ mở bảng "Tất cả phân hệ": thẻ phân hệ theo nhóm + màn hình của từng phân hệ, mọi mục là liên kết thật', async () => {
    renderHeader();
    fireEvent.click(screen.getByRole('button', { name: 'Tất cả phân hệ và màn hình' }));

    expect(
      await screen.findByRole('textbox', { name: 'Tìm phân hệ hoặc màn hình' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'Chuỗi cung ứng' })).toBeInTheDocument();
    const finance = screen.getAllByRole('region', { name: 'Tài chính' }).at(-1) as HTMLElement;
    expect(within(finance).getByRole('link', { name: /Tài chính/ })).toHaveAttribute(
      'aria-current',
      'true',
    );
    expect(within(finance).getByRole('link', { name: 'Công nợ' })).toHaveAttribute(
      'href',
      '/tai-chinh/cong-no',
    );
    expect(screen.getByRole('link', { name: /Kho vận/ })).toHaveAttribute('href', '/kho-van');
  });

  it('bảng "Tất cả phân hệ": gõ tên MÀN HÌNH (không dấu) rồi Enter là mở thẳng màn đó', async () => {
    renderHeader();
    fireEvent.click(screen.getByRole('button', { name: 'Tất cả phân hệ và màn hình' }));
    const search = await screen.findByRole('textbox', { name: 'Tìm phân hệ hoặc màn hình' });
    fireEvent.change(search, { target: { value: 'cong no' } });
    expect(screen.queryByRole('region', { name: 'Chuỗi cung ứng' })).toBeNull();
    fireEvent.keyDown(search, { key: 'Enter' });
    expect(navigationMock.push).toHaveBeenCalledWith('/tai-chinh/cong-no');
  });

  it('dải điều hướng phân hệ: trang con là <a href>, mục đang mở có aria-current', () => {
    renderHeader();
    const nav = screen.getByRole('navigation', { name: 'Điều hướng phân hệ' });

    expect(within(nav).getByRole('link', { name: 'Tổng quan' })).toHaveAttribute(
      'href',
      '/tai-chinh',
    );
    expect(within(nav).getByRole('link', { name: 'Sổ cái' })).toHaveAttribute(
      'aria-current',
      'page',
    );
  });

  it('nhóm (layout có con) là NÚT mở menu; trong menu mỗi trang con là liên kết thật', async () => {
    renderHeader();
    fireEvent.click(screen.getByRole('button', { name: /Báo cáo tài chính/ }));

    expect(await screen.findByRole('link', { name: 'Kết quả kinh doanh' })).toHaveAttribute(
      'href',
      '/tai-chinh/bao-cao/ket-qua',
    );
  });

  it('ít hơn 2 mục điều hướng → không dựng dải (một trang thì không cần thanh)', () => {
    renderHeader(undefined, [NAV[0]]);
    expect(screen.queryByRole('navigation', { name: 'Điều hướng phân hệ' })).toBeNull();
  });

  it('launcher: phân hệ đã mở nằm ở "Gần đây" (trừ phân hệ đang mở); Enter mở kết quả lọc đầu tiên', async () => {
    useRecentModulesStore.setState({ ids: ['kho-van'] });
    renderHeader();
    fireEvent.click(screen.getByRole('button', { name: 'Tất cả phân hệ và màn hình' }));

    const recent = await screen.findByRole('group', { name: 'Mở gần đây' });
    expect(within(recent).getByRole('link', { name: /Kho vận/ })).toHaveAttribute(
      'href',
      '/kho-van',
    );
    expect(within(recent).queryByRole('link', { name: /Tài chính/ })).toBeNull();

    const search = screen.getByRole('textbox', { name: 'Tìm phân hệ hoặc màn hình' });
    fireEvent.change(search, { target: { value: 'kho' } });
    expect(screen.queryByRole('group', { name: 'Mở gần đây' })).toBeNull();
    fireEvent.keyDown(search, { key: 'Enter' });
    expect(navigationMock.push).toHaveBeenCalledWith('/kho-van');
  });

  it('ghi phân hệ đang mở vào "Gần đây"', () => {
    renderHeader();
    expect(useRecentModulesStore.getState().ids[0]).toBe('tai-chinh');
  });
});

/**
 * jsdom không dựng layout: giả bề rộng — mục trong hàng đo (`[inert]`) rộng 10px mỗi ký tự, cụm trái của thanh rộng 400px,
 * mọi phần tử khác 0 → chỗ trống của cụm trái = 400px.
 */
function mockHeaderLayout(sideWidth = 400) {
  const offset = vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockImplementation(function (
    this: HTMLElement,
  ) {
    return this.closest('[inert]') && this.parentElement?.hasAttribute('inert')
      ? (this.textContent?.length ?? 0) * 10
      : 0;
  });
  const client = vi.spyOn(Element.prototype, 'clientWidth', 'get').mockImplementation(function (
    this: Element,
  ) {
    return this.hasAttribute('data-header-side') ? sideWidth : 0;
  });
  const rects = vi
    .spyOn(Element.prototype, 'getClientRects')
    .mockImplementation(() => [new DOMRect()] as unknown as DOMRectList);
  return () => {
    offset.mockRestore();
    client.mockRestore();
    rects.mockRestore();
  };
}

describe('Header — thanh hết chỗ: mục dồn vào "Thêm"', () => {
  it('dải màn hình CHIA ĐÔI hai bên khối tiêu đề; nửa không vừa dồn vào "Thêm", mục ĐANG MỞ luôn ở lại', async () => {
    const restore = mockHeaderLayout(120);
    try {
      renderHeader(undefined, NAV, { level: 1 }, '/tai-chinh');
      const left = screen.getByRole('navigation', { name: 'Điều hướng phân hệ' });
      const right = screen.getByRole('navigation', { name: 'Điều hướng phân hệ (tiếp)' });

      expect(within(left).getByRole('link', { name: 'Sổ cái' })).toHaveAttribute(
        'aria-current',
        'page',
      );
      expect(within(right).getByRole('button', { name: /Báo cáo tài chính/ })).toBeInTheDocument();

      fireEvent.click(within(left).getByRole('button', { name: /Thêm \d+ màn hình/ }));
      const menu = await screen.findByRole('navigation', { name: 'Màn hình khác' });
      expect(within(menu).getByRole('link', { name: 'Tổng quan' })).toHaveAttribute(
        'href',
        '/tai-chinh',
      );
    } finally {
      restore();
    }
  });

  it('tab của trang trên thanh: tab không vừa vào "Thêm", tab đang mở luôn ở lại', async () => {
    const restore = mockHeaderLayout(120);
    try {
      const onSelect = vi.fn();
      renderHeader(
        <PageHeader
          nav={{
            items: [
              { key: 'a', label: 'Gói thầu' },
              { key: 'b', label: 'Tiến độ' },
              { key: 'c', label: 'Nghiệm thu' },
              { key: 'd', label: 'Thanh toán' },
            ],
            active: 'd',
            onSelect,
          }}
          title="Khu đô thị"
        />,
      );
      const bar = within(screen.getByRole('banner')).getByRole('navigation', {
        name: 'Tab của trang (tiếp)',
      });
      expect(within(bar).getByRole('button', { name: 'Thanh toán' })).toHaveAttribute(
        'aria-current',
        'page',
      );
      fireEvent.click(within(bar).getByRole('button', { name: /Thêm \d+ tab/ }));
      const menu = await screen.findByRole('navigation', { name: 'Tab khác' });
      fireEvent.click(within(menu).getAllByRole('button')[0]);
      expect(onSelect).toHaveBeenCalled();
    } finally {
      restore();
    }
  });

  it('cấp 0 (ngoài phân hệ): thanh gọn — chỉ nút ⊞, không vệt phân hệ, không dải màn hình', () => {
    renderHeader(undefined, [], { level: 0, activeModuleId: undefined }, '/');
    expect(screen.getByRole('button', { name: 'Tất cả phân hệ và màn hình' })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Quay lại' })).toBeNull();
    expect(screen.queryByRole('navigation', { name: 'Điều hướng phân hệ' })).toBeNull();
  });
});

describe('Header — đổi cấp khi vào màn hình', () => {
  const DEEP: HeaderExtra = { level: 2, moduleHref: '/tai-chinh', backHref: '/tai-chinh' };

  it('cấp 2: ‹ quay lại bên TRÁI thanh (liên kết thật), khối giữa CHỈ tên trang, dải màn hình vẫn hai bên', () => {
    renderHeader(undefined, NAV, DEEP);
    const banner = screen.getByRole('banner');

    expect(
      within(banner).getByRole('navigation', { name: 'Điều hướng phân hệ' }),
    ).toBeInTheDocument();
    expect(within(banner).getByRole('heading', { level: 1, name: 'Sổ cái' })).toBeInTheDocument();
    expect(within(banner).getByRole('link', { name: 'Quay lại' })).toHaveAttribute(
      'href',
      '/tai-chinh',
    );
    expect(within(banner).queryByRole('button', { name: /Chuyển màn hình/ })).toBeNull();
  });

  it('Ctrl + ↑ lên một cấp; đang gõ trong ô nhập thì bỏ qua', () => {
    renderHeader(<input aria-label="Ô nhập" />, NAV, DEEP);

    fireEvent.keyDown(screen.getByRole('textbox', { name: 'Ô nhập' }), {
      code: 'ArrowUp',
      ctrlKey: true,
    });
    expect(navigationMock.push).not.toHaveBeenCalled();

    fireEvent.keyDown(window, { code: 'ArrowUp', ctrlKey: true });
    expect(navigationMock.push).toHaveBeenCalledWith('/tai-chinh');
  });

  it('cấp 1 (trang chủ phân hệ): giữ dải điều hướng, Ctrl + ↑ không làm gì', () => {
    renderHeader(undefined, NAV, { level: 1 }, '/tai-chinh');
    expect(screen.getByRole('navigation', { name: 'Điều hướng phân hệ' })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Quay lại' })).toBeNull();

    fireEvent.keyDown(window, { code: 'ArrowUp', ctrlKey: true });
    expect(navigationMock.push).not.toHaveBeenCalled();
  });
});

describe('PageHeader — tên trang + tab lên header (≥ xl), dải trong trang làm dự phòng', () => {
  it('filters: CỘT DỌC icon nổi sát mép phải (portal ra body), chấm = đang áp dụng, bấm icon mở bảng chứa điều khiển', () => {
    renderHeader(
      <PageHeader
        filters={[
          {
            key: 'kho',
            label: 'Kho',
            icon: 'buildings-outline',
            value: 'Kho tổng',
            active: true,
            content: <span>Lọc kho</span>,
          },
          { key: 'ky', label: 'Kỳ', icon: 'calendar-outline', content: <span>Lọc kỳ</span> },
        ]}
        title="Tồn kho"
      />,
    );
    const rail = screen.getByRole('toolbar', { name: 'Bộ lọc (1 đang áp dụng)' });
    expect(within(screen.getByRole('banner')).queryByRole('toolbar')).not.toBeInTheDocument();

    const kho = within(rail).getByRole('button', { name: 'Kho · Kho tổng (đang áp dụng)' });
    expect(within(rail).getByRole('button', { name: 'Kỳ' })).toBeInTheDocument();
    fireEvent.click(kho);
    expect(screen.getByText('Lọc kho')).toBeInTheDocument();
  });

  it('khối tiêu đề giữa CHỈ có tên trang — không vệt phân hệ, không nút ▾ chuyển màn', () => {
    renderHeader(<PageHeader title="Sổ cái" />, NAV, { level: 2, backHref: '/tai-chinh' });
    const banner = screen.getByRole('banner');

    expect(within(banner).getByRole('heading', { level: 1, name: 'Sổ cái' })).toBeVisible();
    expect(within(banner).queryByRole('link', { name: /Trang đích/ })).toBeNull();
    expect(within(banner).queryByRole('button', { name: /Chuyển màn hình/ })).toBeNull();
  });

  it('tên trang KHÁC tên màn hình: khối giữa vẫn chỉ tên trang; dòng phụ chỉ trong tooltip', () => {
    renderHeader(
      <PageHeader
        nav={{ items: [{ key: 'a', label: 'Bút toán' }], active: 'a', onSelect: vi.fn() }}
        subtitle="Kỳ 10/2026"
        title="Chứng từ 0001"
      />,
      NAV,
      { level: 2, backHref: '/tai-chinh' },
    );
    const banner = screen.getByRole('banner');
    const heading = within(banner).getByRole('heading', { name: 'Chứng từ 0001' });

    expect(heading).toHaveAttribute('title', 'Chứng từ 0001 — Kỳ 10/2026');
    expect(within(banner).queryByText('Kỳ 10/2026')).not.toBeInTheDocument();
  });

  it('tên trang vào khối tiêu đề GIỮA thanh (h1), dòng phụ là tooltip của tên', () => {
    renderHeader(<PageHeader subtitle="Kỳ 10/2026" title="Sổ cái tổng hợp" />);
    const banner = screen.getByRole('banner');

    expect(within(banner).getByRole('heading', { name: 'Sổ cái tổng hợp' })).toHaveAttribute(
      'title',
      'Sổ cái tổng hợp — Kỳ 10/2026',
    );
  });

  it('tab của trang: CHIA ĐÔI hai bên khối tiêu đề (ẩn dưới xl) + dải gạch chân trong <main> (ẩn từ xl); tab có href là <a>', () => {
    const onSelect = vi.fn();
    renderHeader(
      <PageHeader
        nav={{
          items: [
            { key: 'a', label: 'Chứng từ', href: '?tab=a' },
            { key: 'b', label: 'Bút toán' },
          ],
          active: 'a',
          onSelect,
        }}
        title="Sổ cái"
      />,
    );
    const barTabs = within(screen.getByRole('banner')).getByRole('navigation', {
      name: 'Tab của trang',
    });
    const barTabsRight = within(screen.getByRole('banner')).getByRole('navigation', {
      name: 'Tab của trang (tiếp)',
    });
    const pageTabs = within(screen.getByRole('main')).getByRole('navigation', {
      name: 'Tab của trang',
    });

    expect(barTabs).toHaveAttribute('data-placement', 'bar');
    expect(barTabs.className).toContain('max-xl:hidden');
    expect(pageTabs).toHaveAttribute('data-placement', 'page');
    expect(pageTabs.className).toContain('xl:hidden');

    expect(screen.queryByRole('navigation', { name: 'Điều hướng phân hệ' })).toBeNull();
    for (const tabs of [barTabs, pageTabs]) {
      expect(within(tabs).getByRole('link', { name: 'Chứng từ' })).toHaveAttribute(
        'aria-current',
        'page',
      );
      expect(within(tabs).getByRole('link', { name: 'Chứng từ' }).getAttribute('href')).toMatch(
        /\?tab=a$/,
      );
    }

    expect(within(barTabs).queryByRole('button', { name: 'Bút toán' })).toBeNull();
    fireEvent.click(within(barTabsRight).getByRole('button', { name: 'Bút toán' }));
    expect(onSelect).toHaveBeenCalledWith('b');
  });

  it('nút quay lại vào ô `start` của header; có backHref → liên kết thật', () => {
    renderHeader(<PageHeader backHref="/tai-chinh" title="Chứng từ 0001" onBack={vi.fn()} />);
    expect(
      within(screen.getByRole('banner')).getByRole('link', { name: 'Quay lại' }),
    ).toHaveAttribute('href', '/tai-chinh');
  });
});

describe('Header — ngôn ngữ en', () => {
  it('nhãn vùng điều hướng, nút launcher, ô tìm và hàng "Recently opened" lấy từ bản dịch en', async () => {
    useRecentModulesStore.setState({ ids: ['kho-van'] });
    renderHeader(undefined, NAV, {}, '/tai-chinh/so-cai', 'en');

    expect(screen.getByRole('navigation', { name: 'Module navigation' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'All modules and screens' }));
    expect(
      await screen.findByRole('textbox', { name: 'Search modules or screens' }),
    ).toBeInTheDocument();
    expect(await screen.findByRole('group', { name: 'Recently opened' })).toBeInTheDocument();
  });

  it('cấp 2: nút quay lại tên "Back", liên kết thật có tiền tố `/en`', () => {
    renderHeader(
      undefined,
      NAV,
      { level: 2, moduleHref: '/tai-chinh', backHref: '/tai-chinh' },
      '/en/tai-chinh/so-cai',
      'en',
    );

    expect(within(screen.getByRole('banner')).getByRole('link', { name: 'Back' })).toHaveAttribute(
      'href',
      '/en/tai-chinh',
    );
  });

  it('Ctrl + ↑ lên một cấp đi qua router của next-intl → đích mang tiền tố `/en`', () => {
    renderHeader(
      <input aria-label="Ô nhập" />,
      NAV,
      { level: 2, moduleHref: '/tai-chinh', backHref: '/tai-chinh' },
      '/en/tai-chinh/so-cai',
      'en',
    );

    fireEvent.keyDown(window, { code: 'ArrowUp', ctrlKey: true });

    expect(navigationMock.push).toHaveBeenCalledWith('/en/tai-chinh');
  });

  it('menu người dùng: tên dự phòng "Guest" khi chưa có user', () => {
    renderInRouter(
      <HeaderSlotsProvider>
        <Header />
      </HeaderSlotsProvider>,
      { locale: 'en' },
    );

    expect(within(screen.getByRole('banner')).getByText('Guest')).toBeInTheDocument();
  });
});
