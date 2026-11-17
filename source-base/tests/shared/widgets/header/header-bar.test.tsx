/**
 * Thanh `Header` laptop — một hàng MỎNG; control canh giữa, tab của page đứng trên ray đáy.
 *
 * Giữ: thanh không còn đồng hồ; bộ bốn khoá `HEADER_HEIGHT_CLASS` đi cùng ba bậc 40 · 44 · 52px; chip tab cao
 * `PAGE_CHIP_HEIGHT`, đứng trên ray đáy (ô nav `items-end`), KHÔNG `gap` giữa chip; chiều vát SONG SONG cạnh bảng tên
 * (dải trái `\`, dải phải `/` — vạch sáng đáy của chip đang bật bám cạnh đáy lệch tương ứng). jsdom không dựng layout —
 * số đo pixel (khe chéo đều, đáy chip chạm ray, không chạm cụm mép) kiểm bằng trình duyệt thật.
 */

import { render, screen, within } from '@testing-library/react';
import type { ComponentProps } from 'react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { HEADER_HEIGHT_CLASS } from '@/shared/constants/layout.constants';
import { Header, HeaderSlotsProvider, PageHeader } from '@/shared/widgets/header';
import { pageHeaderTitleFit } from '@/shared/widgets/header/page-header/page-header.theme';
import { HEADER_SKIN_ORDER, useHeaderSkinStore } from '@/shared/widgets/header/header-skin.store';
import { HEADER_SKIN_SPECS } from '@/shared/widgets/header/page-header/header-skin.theme';
import { PLATE_SHAPE_CLASSES } from '@/shared/widgets/header/page-header/shapes/plate-shapes.theme';

const originalMatchMedia = window.matchMedia;

/** Họ "khay": kiểu có thanh khay (`nav.shelf`). */
const SHELF_SKINS = ['tray-flip', 'tray', 'tray-slant', 'command', 'facet'] as const;
const NON_SHELF_SKINS = HEADER_SKIN_ORDER.filter(
  (skin) => !(SHELF_SKINS as readonly string[]).includes(skin),
);

type NavConfig = NonNullable<ComponentProps<typeof PageHeader>['nav']>;

const NAV_ITEMS = [
  { key: 'a', label: 'Tổng quan' },
  { key: 'b', label: 'Kế hoạch' },
  { key: 'c', label: 'Báo cáo' },
  { key: 'd', label: 'Thực hiện' },
];

let router: ReturnType<typeof createMemoryRouter> | undefined;

function renderHeader(
  active: string,
  title = 'Gia công',
  subtitle = 'DEMO',
  navOverride: Partial<NavConfig> = {},
) {
  router = createMemoryRouter([
    {
      path: '*',
      element: (
        <HeaderSlotsProvider>
          <Header user={{ displayName: 'An', role: 'Quản trị' }} />
          <PageHeader
            nav={{ items: NAV_ITEMS, active, onSelect: vi.fn(), ...navOverride }}
            subtitle={subtitle}
            title={title}
          />
        </HeaderSlotsProvider>
      ),
    },
  ]);
  return render(<RouterProvider router={router} />);
}

/** Trang KHÔNG truyền `nav` (chỉ bảng tên) — ca thật của trang chi tiết / cài đặt. */
function renderBare(title = 'Gia công') {
  router = createMemoryRouter([
    {
      path: '*',
      element: (
        <HeaderSlotsProvider>
          <Header user={{ displayName: 'An', role: 'Quản trị' }} />
          <PageHeader subtitle="DEMO" title={title} />
        </HeaderSlotsProvider>
      ),
    },
  ]);
  return render(<RouterProvider router={router} />);
}

const shelves = (container: HTMLElement) => [
  ...container.querySelectorAll<HTMLElement>('[data-shelf]'),
];

/** Vạch sáng đáy của chip đang bật (`PAGE_NAV_SLOT_CLASSES.bar`). */
const activeBar = (chip: HTMLElement) => chip.querySelector<HTMLElement>('[class*="h-0.5"]');

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
  router?.dispose();
  router = undefined;
  Object.defineProperty(window, 'matchMedia', { writable: true, value: originalMatchMedia });
});

describe('Header — không đồng hồ', () => {
  it('mép phải chỉ còn nút toàn cục + menu người dùng, không có phần tử `<time>`', () => {
    const { container } = renderHeader('a');

    expect(container.querySelector('time')).toBeNull();
    expect(
      within(screen.getByRole('banner')).getByRole('button', { name: 'Menu người dùng' }),
    ).toBeInTheDocument();
  });
});

describe('HEADER_HEIGHT_CLASS — bốn khoá là một bộ', () => {
  it.each([
    ['', 10, '2.5'],
    ['xl:', 11, '2.75'],
    ['wide:', 13, '3.25'],
  ] as const)('bậc "%s" cao h-%i (%srem) ở cả bốn khoá', (prefix, step, rem) => {
    expect(HEADER_HEIGHT_CLASS.height).toContain(`${prefix}h-${step}`);
    expect(HEADER_HEIGHT_CLASS.contentTopOffset).toContain(`${prefix}pt-${step}`);
    expect(HEADER_HEIGHT_CLASS.belowHeader).toContain(`${prefix}top-${step}`);
    expect(HEADER_HEIGHT_CLASS.contentMaxHeight).toContain(
      `${prefix}max-h-[calc(100dvh-${rem}rem)]`,
    );
  });
});

describe('PageHeader trên Header — tab đứng trên ray đáy, vát song song bảng tên', () => {
  // Hai bài kiểm dưới đo hình bình hành của kiểu `slant` (kiểu mặc định hiện là `tray`).
  beforeEach(() => useHeaderSkinStore.getState().setSkin('slant'));
  afterEach(() => useHeaderSkinStore.setState(useHeaderSkinStore.getInitialState(), true));

  it('chip thấp gọn, không cao trọn thanh, không còn cờ neo `data-header-chip`', () => {
    renderHeader('a');

    const chip = screen.getByRole('button', { name: 'Kế hoạch' });

    expect(chip).toHaveClass('h-5.5');
    expect(chip).not.toHaveAttribute('data-header-chip');
    expect(chip).not.toHaveClass('self-stretch');
  });

  it('đứng trên ray đáy nhờ ô nav `items-end`; giữa các chip KHÔNG có `gap` (khe chéo = `--chip-cut`, đều với khe tới bảng tên)', () => {
    renderHeader('a');

    const row = screen.getByRole('button', { name: 'Kế hoạch' }).parentElement;
    const cell = row?.parentElement;

    expect(row).toHaveClass('items-end');
    expect(row?.className).toContain('gap-[var(--chip-gap,0px)]');
    expect(row?.className).not.toMatch(/(^|\s)gap-(?!\[var\(--chip-gap)/);
    expect(cell).toHaveClass('items-end', 'md:pe-[var(--nav-pad)]');
  });

  it('tab đang bật ở dải TRÁI: vạch đáy bám cạnh đáy lệch phải (chip vát ngả phải), KHÔNG có hình thoi xoay', () => {
    renderHeader('a');

    const chip = screen.getByRole('button', { name: 'Tổng quan' });
    const bar = activeBar(chip);

    expect(bar).not.toBeNull();
    expect(bar).toHaveClass('left-[var(--chip-cut)]', 'right-0');
    expect(chip.querySelector('[class*="rotate-45"]')).toBeNull();
  });

  it('tab đang bật ở dải PHẢI: vạch đáy bám cạnh đáy lệch trái (chip vát `/`)', () => {
    renderHeader('d');

    const bar = activeBar(screen.getByRole('button', { name: 'Thực hiện' }));

    expect(bar).not.toBeNull();
    expect(bar).toHaveClass('left-0', 'right-[var(--chip-cut)]');
  });

  it('tab nghỉ: vạch đáy thu về 0 (nở ra khi rê chuột), KHÔNG có hình thoi xoay', () => {
    renderHeader('a');

    const chip = screen.getByRole('button', { name: 'Kế hoạch' });

    expect(activeBar(chip)).toHaveClass('scale-x-0', 'group-hover:scale-x-100');
    expect(chip.querySelector('[class*="rotate-45"]')).toBeNull();
  });
});

describe('pageHeaderTitleFit — chữ tên co theo độ dài, trước khi bị cắt "…"', () => {
  it.each([
    ['Gia công', 'base'],
    ['x'.repeat(16), 'base'],
    ['x'.repeat(17), 'snug'],
    ['x'.repeat(26), 'snug'],
    ['x'.repeat(27), 'tight'],
  ] as const)('"%s" → %s', (title, fit) => {
    expect(pageHeaderTitleFit(title)).toBe(fit);
  });

  it('đếm ký tự hiển thị: chữ tiếng Việt dựng sẵn hay tách dấu đều cùng một bậc', () => {
    const composed = 'Khu đô thị Đông Đô'.normalize('NFC');
    const decomposed = composed.normalize('NFD');

    expect(decomposed.length).toBeGreaterThan(composed.length);
    expect(pageHeaderTitleFit(decomposed)).toBe(pageHeaderTitleFit(composed));
  });
});

describe('PageHeader trên Header — bảng tên thông minh', () => {
  it('tên dài hạ cỡ chữ (không còn cỡ gốc 16px), tên ngắn giữ cỡ gốc', () => {
    const { unmount } = renderHeader('a', 'Gia công');
    const short = screen.getByText('Gia công');
    expect(short).toHaveClass('md:text-body-16-bold');
    unmount();
    router?.dispose();

    renderHeader('a', 'Khu đô thị Đông Đô — Giai đoạn 2 và hạ tầng kỹ thuật');
    const long = screen.getByText(/Khu đô thị Đông Đô — Giai đoạn 2/);
    expect(long).not.toHaveClass('md:text-body-16-bold');
    expect(long).toHaveAttribute('title', 'Khu đô thị Đông Đô — Giai đoạn 2 và hạ tầng kỹ thuật');
  });

  it('dòng phụ dạng chữ có `title` để đọc đủ khi bị cắt; hai vạch hai bên là trang trí (aria-hidden)', () => {
    renderHeader('a', 'Gia công', 'Gia công cốt thép, lồng thép trong nhà xưởng');

    const subtitle = screen.getByText('Gia công cốt thép, lồng thép trong nhà xưởng');
    const rules = subtitle.parentElement?.querySelectorAll('[aria-hidden="true"]');

    expect(subtitle).toHaveAttribute('title', 'Gia công cốt thép, lồng thép trong nhà xưởng');
    expect(rules).toHaveLength(2);
  });
});

describe('Header — không hình thoi xoay ở mọi kiểu khung', () => {
  afterEach(() => useHeaderSkinStore.setState(useHeaderSkinStore.getInitialState(), true));

  it.each(HEADER_SKIN_ORDER)(
    'kiểu "%s": cả thanh (chip bật + bảng tên) không có phần tử xoay 45° — vài px mà xoay là vỡ nét thành dấu "*"',
    (skin) => {
      useHeaderSkinStore.getState().setSkin(skin);
      const { container } = renderHeader('a');

      expect(screen.getByRole('banner')).toHaveAttribute('data-skin', skin);
      expect(container.querySelector('[class*="rotate-45"]')).toBeNull();
    },
  );
});

describe('Header — kiểu "tray": thanh khay ngang trên nhóm tab', () => {
  beforeEach(() => useHeaderSkinStore.getState().setSkin('tray'));
  afterEach(() => useHeaderSkinStore.setState(useHeaderSkinStore.getInitialState(), true));

  it('tab hai bên → đúng 2 thanh khay (left + right), trang trí (aria-hidden), không bắt chuột', () => {
    const { container } = renderHeader('a');

    const found = shelves(container);

    expect(found.map((shelf) => shelf.dataset.shelf)).toEqual(['left', 'right']);
    for (const shelf of found) {
      expect(shelf).toHaveAttribute('aria-hidden', 'true');
      expect(shelf).toHaveClass('pointer-events-none');
    }
  });

  it('thanh khay nằm TRONG dải chip, đứng sau chip cuối, bề ngang do hai mép dải quyết định (không có `w-` cố định) — nhiều tab thì dài', () => {
    const { container } = renderHeader('a');

    const [left, right] = shelves(container);

    expect(left.parentElement).toBe(screen.getByRole('button', { name: 'Kế hoạch' }).parentElement);
    expect(left.parentElement?.lastElementChild).toBe(left);
    expect(right.parentElement?.lastElementChild).toBe(right);
    expect(left).toHaveClass('left-0', 'right-[calc(var(--plate-tuck)-var(--nav-pad)-3px)]');
    expect(right).toHaveClass('right-0', 'left-[calc(var(--plate-tuck)-var(--nav-pad)-3px)]');
    for (const shelf of [left, right]) {
      expect(shelf.className).not.toMatch(/(^|\s)w-/);
      expect(shelf).toHaveClass('h-[var(--shelf-y)]', 'bottom-[calc(100%+var(--shelf-rise))]');
    }
  });

  it.each(NON_SHELF_SKINS)('kiểu "%s" KHÔNG vẽ thanh khay', (skin) => {
    useHeaderSkinStore.getState().setSkin(skin);
    const { container } = renderHeader('a');

    expect(shelves(container)).toHaveLength(0);
  });

  it('chỉ một bên có tab → chỉ một thanh khay, ô trống không có', () => {
    const { container } = renderHeader('a', 'Gia công', 'DEMO', { splitAt: 0 });

    expect(shelves(container).map((shelf) => shelf.dataset.shelf)).toEqual(['right']);
  });

  it('không có tab (chỉ bảng tên) → KHÔNG thanh khay: bảng tên đứng một mình, không ô giả', () => {
    const { container } = renderHeader('a', 'Gia công', 'DEMO', { items: [] });

    expect(shelves(container)).toHaveLength(0);
  });

  it('không truyền nav → cũng không thanh khay', () => {
    const { container } = renderBare();

    expect(shelves(container)).toHaveLength(0);
  });

  it('có tab hai bên → thanh khay nằm trong dải chip thật', () => {
    const { container } = renderHeader('a');

    for (const shelf of shelves(container)) {
      expect(shelf.parentElement?.querySelector('button')).not.toBeNull();
    }
  });
});

describe('Header — trang KHÔNG có tab: hình bảng tên như có tab, viền vẽ LIỀN thẳng lên', () => {
  beforeEach(() => useHeaderSkinStore.getState().setSkin('tray-flip'));
  afterEach(() => useHeaderSkinStore.setState(useHeaderSkinStore.getInitialState(), true));

  const plateOf = (container: HTMLElement) =>
    container.querySelector<HTMLElement>('h1')?.closest<HTMLElement>('div');
  /** Lớp viền bị che từ `--shelf-y` (`plateEdgeCapped`) — chỉ có khi có thanh khay bên cạnh. */
  const CAPPED_EDGE = '[class*="transparent_var(--shelf-y)"]';

  it.each(HEADER_SKIN_ORDER)(
    'kiểu "%s": hình bảng tên (`--plate-cut-sided`) giống nhau khi có tab và khi không tab — không còn dạng `--plate-cut-free` riêng',
    (skin) => {
      useHeaderSkinStore.getState().setSkin(skin);
      const withTabs = renderHeader('a').container;
      const withoutTabs = renderBare().container;

      expect(plateOf(withTabs)).toHaveClass('md:[--plate-cut:var(--plate-cut-sided)]');
      expect(plateOf(withoutTabs)).toHaveClass('md:[--plate-cut:var(--plate-cut-sided)]');
    },
  );

  it.each(SHELF_SKINS)(
    'kiểu khay "%s": có tab thì viền bảng tên bị che từ đường khay; KHÔNG tab thì viền vẽ liền thẳng lên mép trên (không che)',
    (skin) => {
      useHeaderSkinStore.getState().setSkin(skin);
      const withTabs = renderHeader('a').container;
      const withoutTabs = renderBare().container;

      expect(plateOf(withTabs)?.querySelectorAll(CAPPED_EDGE)).toHaveLength(1);
      expect(plateOf(withoutTabs)?.querySelectorAll(CAPPED_EDGE)).toHaveLength(0);
    },
  );

  it.each(NON_SHELF_SKINS)('kiểu "%s" (không khay): viền không bao giờ bị che', (skin) => {
    useHeaderSkinStore.getState().setSkin(skin);

    expect(plateOf(renderHeader('a').container)?.querySelectorAll(CAPPED_EDGE)).toHaveLength(0);
    expect(plateOf(renderBare().container)?.querySelectorAll(CAPPED_EDGE)).toHaveLength(0);
  });

  it.each([
    ['tray', 'lean'],
    ['tray-slant', 'lean'],
    ['command', 'lean'],
    ['facet', 'lean'],
    ['tray-flip', 'leanVee'],
  ] as const)(
    'kiểu khay "%s": không tab thì nét viền nghiêng THẲNG từ mép trên (hình `%s`); có tab thì giữ hình gốc',
    (skin, solo) => {
      useHeaderSkinStore.getState().setSkin(skin);
      const edgeClass = (container: HTMLElement) =>
        plateOf(container)?.querySelector<HTMLElement>('span[aria-hidden]')?.className ?? '';

      expect(edgeClass(renderBare().container)).toContain(PLATE_SHAPE_CLASSES[solo]);
      expect(edgeClass(renderHeader('a').container)).not.toContain(PLATE_SHAPE_CLASSES[solo]);
    },
  );

  it('không tab: bảng tên không chui vào ô nào (không `-mx` tuck), chữ tên vẫn là <h1>', () => {
    const { container } = renderBare();

    expect(plateOf(container)).not.toHaveClass('md:-mx-[var(--plate-tuck)]');
    expect(screen.getByRole('heading', { level: 1, name: 'Gia công' })).toBeInTheDocument();
  });
});

describe('Header — vùng bấm của chip theo HÌNH chip, không theo hộp chữ nhật', () => {
  afterEach(() => useHeaderSkinStore.setState(useHeaderSkinStore.getInitialState(), true));

  it('chip KHÔNG tự bắt chuột; lớp `hit` bên trong bắt thay và mang clip-path của khung (mũi tên chồng nhau không cướp vùng bấm của nhau)', () => {
    useHeaderSkinStore.getState().setSkin('chevron');
    renderHeader('a');

    const chip = screen.getByRole('button', { name: 'Kế hoạch' });
    const hit = chip.querySelector<HTMLElement>('.pointer-events-auto');

    expect(chip).toHaveClass('pointer-events-none');
    expect(hit).not.toBeNull();
    expect(hit?.style.clipPath).toContain('polygon');
  });

  it('kiểu khung không cắt (vuông) → lớp `hit` phủ trọn hộp chip (không clip-path)', () => {
    useHeaderSkinStore.getState().setSkin('square');
    renderHeader('a');

    const hit = screen
      .getByRole('button', { name: 'Kế hoạch' })
      .querySelector<HTMLElement>('.pointer-events-auto');

    expect(hit).not.toBeNull();
    expect(hit?.style.clipPath).toBe('');
  });
});

describe('Header — thanh khay có vật trang trí (`nav.ornament`) + đường đôi (`nav.double`)', () => {
  afterEach(() => useHeaderSkinStore.setState(useHeaderSkinStore.getInitialState(), true));

  const ornaments = (container: HTMLElement) => [
    ...container.querySelectorAll<HTMLElement>('[data-shelf] [data-ornament]'),
  ];

  it.each([
    ['command', 'hatch', 7],
    ['facet', 'wedge', 1],
  ] as const)(
    'kiểu "%s": mỗi thanh khay (trái + phải) có MỘT cụm "%s" gồm %i phần tử, nằm TRONG thanh, trang trí thuần',
    (skin, kind, count) => {
      useHeaderSkinStore.getState().setSkin(skin);
      const { container } = renderHeader('a');

      const found = ornaments(container);

      expect(found).toHaveLength(2);
      for (const group of found) {
        expect(group.dataset.ornament).toBe(kind);
        expect(group.children).toHaveLength(count);
        expect(group.closest('[data-shelf]')).toHaveAttribute('aria-hidden', 'true');
        expect(group).toHaveClass('pointer-events-none');
      }
    },
  );

  it.each(HEADER_SKIN_ORDER.filter((skin) => skin !== 'command' && skin !== 'facet'))(
    'kiểu "%s" KHÔNG có vật trang trí trong thanh khay',
    (skin) => {
      useHeaderSkinStore.getState().setSkin(skin);
      const { container } = renderHeader('a');

      expect(ornaments(container)).toHaveLength(0);
    },
  );

  it('vạch xiên của "command" song song vai bảng tên: hai dải xiên NGƯỢC chiều nhau (trái `\\`, phải `/`), mờ dần ra ngoài', () => {
    useHeaderSkinStore.getState().setSkin('command');
    const { container } = renderHeader('a');

    const [left, right] = ornaments(container);

    expect(left.firstElementChild).toHaveClass('skew-x-[17deg]');
    expect(right.firstElementChild).toHaveClass('-skew-x-[17deg]');
    expect(left.firstElementChild).toHaveClass('bg-[var(--plate-tone)]');
    expect(left.lastElementChild).toHaveClass(
      'bg-[color-mix(in_srgb,var(--plate-tone)_16%,transparent)]',
    );
  });

  it('chỉ "facet" vẽ đường đôi (thanh khay mang nền hai đường song song), kiểu khay khác một đường', () => {
    useHeaderSkinStore.getState().setSkin('facet');
    const facet = renderHeader('a').container.querySelector<HTMLElement>('[data-shelf="left"]');

    expect(facet?.className).toContain('center_bottom_5px');
    useHeaderSkinStore.getState().setSkin('tray-slant');
    const plain = renderHeader('a').container.querySelector<HTMLElement>('[data-shelf="left"]');

    expect(plain?.className).not.toContain('center_bottom_5px');
  });

  it('tab hình bình hành trọn ("command") có vùng bấm theo đa giác của chính nó', () => {
    useHeaderSkinStore.getState().setSkin('command');
    renderHeader('a');

    const hit = screen
      .getByRole('button', { name: 'Kế hoạch' })
      .querySelector<HTMLElement>('.pointer-events-auto');

    expect(hit?.style.clipPath).toContain('polygon');
  });
});

describe('Header — đường khay KHÔNG còn đoạn xanh "active" phía trên chip đang bật', () => {
  afterEach(() => useHeaderSkinStore.setState(useHeaderSkinStore.getInitialState(), true));

  const SHELF_MARK = '[class*="bottom-[calc(100%+var(--shelf-rise)-1px)]"]';

  it.each(HEADER_SKIN_ORDER)(
    'kiểu "%s": không có đoạn sáng trên đường khay, chip không nâng z (đường khay một màu — màu phân hệ)',
    (skin) => {
      useHeaderSkinStore.getState().setSkin(skin);
      const { container } = renderHeader('b');

      expect(container.querySelectorAll(SHELF_MARK)).toHaveLength(0);
      expect(screen.getByRole('button', { name: 'Kế hoạch' })).not.toHaveClass('z-[1]');
    },
  );
});

describe('Header — cụm vạch gạch–chấm hai bên bảng tên (`plate.flank`)', () => {
  afterEach(() => useHeaderSkinStore.setState(useHeaderSkinStore.getInitialState(), true));

  const FLANK = '[class*="top-[22%]"]';

  it.each(HEADER_SKIN_ORDER)(
    'kiểu "%s": cụm vạch hai bên có đúng khi bật trong cấu hình',
    (skin) => {
      useHeaderSkinStore.getState().setSkin(skin);
      const { container } = renderHeader('a');

      const groups = container.querySelectorAll(FLANK);

      expect(groups).toHaveLength(HEADER_SKIN_SPECS[skin].plate.flank ? 2 : 0);
      for (const group of groups) {
        expect(group).toHaveAttribute('aria-hidden', 'true');
        expect(group.children).toHaveLength(3);
      }
    },
  );
});

describe('PageHeader — chế độ DÀY khi nhiều tab (bỏ cánh `///` ở md..2xl để dải tab không tràn)', () => {
  const WING_DENSE = '[class*="md:max-2xl:hidden!"]';
  const FIVE_TABS = [...NAV_ITEMS, { key: 'e', label: 'So sánh' }];

  it('4 tab → giữ cánh `///` ở mọi bề ngang', () => {
    const { container } = renderHeader('a');

    expect(container.querySelectorAll(WING_DENSE)).toHaveLength(0);
  });

  it('5 tab trở lên → hai cánh mang lớp ẩn ở md..2xl (chỉ còn từ 2xl)', () => {
    const { container } = renderHeader('a', 'Gia công', 'DEMO', { items: FIVE_TABS });

    expect(container.querySelectorAll(WING_DENSE)).toHaveLength(2);
  });
});
