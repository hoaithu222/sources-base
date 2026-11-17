/**
 * Catalog `/demo` — `DemoLibraryView`: mọi nhóm render được ở cả hai ngôn ngữ với đủ chữ khung (tiêu đề, mô tả, import, nguồn,
 * tài liệu), mục lục có neo trỏ tới section có thật, ô tìm lọc cả mục lục lẫn nội dung (bỏ dấu, IME-safe). Ví dụ tương tác của từng
 * nhóm ở `demo-catalog-entry.test.tsx` / `demo-catalog-display.test.tsx`.
 */

import { fireEvent, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { MockInstance } from 'vitest';

import DemoLibraryView from '@/app/_views/demo/DemoLibraryView';
import {
  CATALOG_GROUPS,
  CATALOG_GROUP_ORDER,
} from '@/app/_views/demo/catalog/data/catalog.constants';
import { catalogAnchorId, formatImportLine } from '@/app/_views/demo/catalog/data/catalog.utils';
import type { Locale } from '@/core/i18n';
import enMessages from '@/messages/en';
import viMessages from '@/messages/vi';
import { renderInRouter } from '@tests/helpers/render';

const MESSAGES = { vi: viMessages, en: enMessages } satisfies Record<Locale, unknown>;
const LOCALES = ['vi', 'en'] as const;

/** Thấy `demo.khoa` trong DOM nghĩa là một khoá dịch bị thiếu (next-intl trả chính đường khoá). */
const RAW_KEY = /\bdemo\.[a-z][A-Za-z]*(?:\.[A-Za-z]+)*\b/;

let consoleError: MockInstance<typeof console.error>;

beforeEach(() => {
  consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
});

afterEach(() => vi.restoreAllMocks());

const renderCatalog = (locale: Locale) =>
  renderInRouter(<DemoLibraryView />, { locale, pathname: locale === 'en' ? '/en/demo' : '/demo' });

const tocLinks = () =>
  within(
    screen.getByRole('navigation', { name: /danh mục component|component catalog/i }),
  ).queryAllByRole('link');

describe('DemoLibraryView — catalog component', () => {
  it.each(LOCALES)('mọi nhóm có mục với tiêu đề h2 và khối tra cứu (%s)', (locale) => {
    const { demo } = MESSAGES[locale];
    renderCatalog(locale);

    for (const id of CATALOG_GROUP_ORDER) {
      const section = screen.getByRole('region', { name: demo.groups[id].title });
      expect(section).toHaveAttribute('id', catalogAnchorId(id));
      expect(
        within(section).getByRole('heading', { level: 2, name: demo.groups[id].title }),
      ).toBeInTheDocument();
      expect(within(section).getByText(demo.groups[id].summary)).toBeInTheDocument();

      for (const item of CATALOG_GROUPS[id].imports) {
        expect(within(section).getByText(formatImportLine(item))).toBeInTheDocument();
      }
      for (const path of [...CATALOG_GROUPS[id].sources, ...CATALOG_GROUPS[id].docs]) {
        expect(within(section).getByText(path)).toBeInTheDocument();
      }
      expect(within(section).getByText(demo.section.importLabel)).toBeInTheDocument();
      expect(within(section).getByText(demo.section.sourceLabel)).toBeInTheDocument();
      expect(within(section).getByText(demo.section.docsLabel)).toBeInTheDocument();
    }
  });

  it.each(LOCALES)(
    'không lộ khoá thô, không MISSING_MESSAGE, không cảnh báo React (%s)',
    (locale) => {
      renderCatalog(locale);

      expect(document.body.textContent).not.toMatch(RAW_KEY);
      const missing = consoleError.mock.calls.filter(([first]) =>
        String(first).includes('MISSING_MESSAGE'),
      );
      expect(missing).toEqual([]);
      expect(consoleError).not.toHaveBeenCalled();
    },
  );

  it('mục lục: mỗi nhóm một liên kết neo đúng thứ tự, trỏ tới section có thật', () => {
    renderCatalog('vi');
    const links = tocLinks();

    expect(links.map((link) => link.textContent)).toEqual(
      CATALOG_GROUP_ORDER.map((id) => viMessages.demo.groups[id].title),
    );
    links.forEach((link, index) => {
      const id = CATALOG_GROUP_ORDER[index];
      expect(link).toHaveAttribute('href', `#${catalogAnchorId(id)}`);
      const target = document.getElementById(catalogAnchorId(id));
      expect(target?.tagName).toBe('SECTION');
    });
  });

  it('ở tiếng Anh các neo vẫn giữ nguyên (không dính tiền tố ngôn ngữ)', () => {
    renderCatalog('en');

    expect(tocLinks().map((link) => link.getAttribute('href'))).toEqual(
      CATALOG_GROUP_ORDER.map((id) => `#${catalogAnchorId(id)}`),
    );
  });

  it.each(LOCALES)('trỏ tới màn ghép hoàn chỉnh /demo/customers đúng tiền tố (%s)', (locale) => {
    renderCatalog(locale);

    expect(screen.getByRole('link', { name: MESSAGES[locale].demo.intro.link })).toHaveAttribute(
      'href',
      locale === 'en' ? '/en/demo/customers' : '/demo/customers',
    );
  });
});

describe('DemoLibraryView — ô tìm nhanh', () => {
  const searchBox = () => screen.getByRole('textbox', { name: viMessages.demo.toc.searchLabel });

  it('gõ không dấu / tên component thì lọc cả mục lục lẫn nội dung', async () => {
    const user = userEvent.setup();
    renderCatalog('vi');

    await user.type(searchBox(), 'hop thoai');
    expect(tocLinks().map((link) => link.textContent)).toEqual([
      viMessages.demo.groups.overlays.title,
    ]);
    expect(screen.getAllByRole('region')).toHaveLength(1);
    expect(
      screen.getByRole('region', { name: viMessages.demo.groups.overlays.title }),
    ).toBeVisible();

    await user.clear(searchBox());
    await user.type(searchBox(), 'Dropdown');
    expect(tocLinks().map((link) => link.textContent)).toEqual([
      viMessages.demo.groups.select.title,
    ]);
  });

  it('không có nhóm nào khớp → trạng thái rỗng; xoá ô tìm thì đủ nhóm trở lại', async () => {
    const user = userEvent.setup();
    renderCatalog('vi');

    await user.type(searchBox(), 'khong-co-nhom-nay');
    expect(tocLinks()).toHaveLength(0);
    expect(screen.queryAllByRole('region')).toHaveLength(0);
    expect(screen.getByText(viMessages.demo.toc.emptyTitle)).toBeInTheDocument();

    await user.clear(searchBox());
    expect(tocLinks()).toHaveLength(CATALOG_GROUP_ORDER.length);
    expect(screen.queryByText(viMessages.demo.toc.emptyTitle)).toBeNull();
  });

  it('IME: đang gõ dở (composition) chưa lọc, chốt dấu xong mới lọc', () => {
    renderCatalog('vi');
    const input = searchBox();

    fireEvent.compositionStart(input);
    fireEvent.change(input, { target: { value: 'hộp' } });
    expect(tocLinks()).toHaveLength(CATALOG_GROUP_ORDER.length);

    fireEvent.compositionEnd(input);
    expect(tocLinks().map((link) => link.textContent)).toEqual([
      viMessages.demo.groups.overlays.title,
    ]);
  });
});
