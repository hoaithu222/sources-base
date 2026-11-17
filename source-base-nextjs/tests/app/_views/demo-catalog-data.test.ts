/**
 * Dữ liệu tra cứu của catalog `/demo` — `src/app/_views/demo/catalog/data`. Catalog chỉ đáng tin khi MỌI thứ nó in ra để dev
 * sao chép là thật: dòng import trỏ tới export có thật, đường file nguồn và tài liệu tồn tại, chữ khung có ở cả hai ngôn ngữ,
 * bộ lọc theo ô tìm bỏ dấu.
 */

import { describe, expect, it } from 'vitest';

import {
  CATALOG_GROUPS,
  CATALOG_GROUP_ORDER,
} from '@/app/_views/demo/catalog/data/catalog.constants';
import {
  catalogAnchorId,
  filterCatalogGroups,
  formatImportLine,
} from '@/app/_views/demo/catalog/data/catalog.utils';
import enMessages from '@/messages/en';
import viMessages from '@/messages/vi';
import * as hooks from '@/shared/hooks';
import * as ui from '@/shared/ui';
import * as icons from '@/shared/ui/icons/Icons';
import { REPO_PATHS } from '@tests/helpers/source-files';

/** Đường import công khai mà catalog được phép in ra (`docs/rules/structure/ui-kit-architecture.md §1`). */
const PUBLIC_MODULES: Record<string, Record<string, unknown>> = {
  '@/shared/ui': ui,
  '@/shared/hooks': hooks,
  '@/shared/ui/icons/Icons': icons,
};

const titleOf = (id: (typeof CATALOG_GROUP_ORDER)[number]) => viMessages.demo.groups[id].title;

describe('catalog /demo — thứ tự và chữ khung', () => {
  it('mọi nhóm trong thứ tự có dữ liệu tra cứu và ngược lại, không trùng id', () => {
    expect(new Set(CATALOG_GROUP_ORDER).size).toBe(CATALOG_GROUP_ORDER.length);
    expect(Object.keys(CATALOG_GROUPS).sort()).toEqual([...CATALOG_GROUP_ORDER].sort());
  });

  it('chữ khung `demo.groups` đủ nhóm ở cả vi và en, không nhóm mồ côi', () => {
    for (const messages of [viMessages, enMessages]) {
      expect(Object.keys(messages.demo.groups).sort()).toEqual([...CATALOG_GROUP_ORDER].sort());
    }
  });

  it.each(CATALOG_GROUP_ORDER)('%s: tiêu đề + mô tả có chữ và khác nhau giữa vi / en', (id) => {
    const vi = viMessages.demo.groups[id];
    const en = enMessages.demo.groups[id];

    for (const text of [vi.title, vi.summary, en.title, en.summary]) {
      expect(text.trim().length).toBeGreaterThan(0);
    }
    expect(vi.title).not.toBe(en.title);
    expect(vi.summary).not.toBe(en.summary);
  });
});

describe('catalog /demo — tra cứu thật', () => {
  it.each(CATALOG_GROUP_ORDER)('%s: file nguồn và tài liệu nhắc tới có thật trong repo', (id) => {
    const { sources, docs } = CATALOG_GROUPS[id];

    expect(sources.length).toBeGreaterThan(0);
    expect(docs.length).toBeGreaterThan(0);
    for (const path of [...sources, ...docs]) {
      expect(REPO_PATHS.has(path), `${id}: không có file ${path}`).toBe(true);
    }
  });

  it.each(CATALOG_GROUP_ORDER)('%s: mọi tên trong dòng import là export thật', (id) => {
    const { imports, components } = CATALOG_GROUPS[id];

    expect(imports.length).toBeGreaterThan(0);
    for (const { from, names } of imports) {
      const exported = PUBLIC_MODULES[from];
      expect(exported, `${id}: đường import "${from}" không phải đường công khai`).toBeDefined();
      for (const name of names) {
        expect(name in exported, `${id}: ${from} không export ${name}`).toBe(true);
      }
    }
    expect(components.length).toBeGreaterThan(0);
  });

  it('dòng import dựng từ { from, names }, đường neo theo id nhóm', () => {
    expect(formatImportLine({ from: '@/shared/ui', names: ['Button'] })).toBe(
      "import { Button } from '@/shared/ui';",
    );
    expect(formatImportLine({ from: '@/shared/ui', names: ['Modal', 'FormModal'] })).toBe(
      "import { Modal, FormModal } from '@/shared/ui';",
    );
    expect(catalogAnchorId('select')).toBe('catalog-select');
  });
});

describe('catalog /demo — lọc theo ô tìm', () => {
  const filter = (search: string) => filterCatalogGroups(CATALOG_GROUP_ORDER, search, titleOf);

  it('từ khoá rỗng giữ hết, đúng thứ tự', () => {
    expect(filter('')).toEqual([...CATALOG_GROUP_ORDER]);
    expect(filter('   ')).toEqual([...CATALOG_GROUP_ORDER]);
  });

  it('khớp theo tiêu đề đã dịch, bỏ dấu và không phân biệt hoa thường', () => {
    expect(filter('hop thoai')).toEqual(['overlays']);
    expect(filter('HỘP THOẠI')).toEqual(['overlays']);
    expect(filter('bang du lieu')).toEqual(['table']);
  });

  it('khớp theo tên component dù tiêu đề không chứa nó', () => {
    expect(filter('dropdown')).toEqual(['select']);
    expect(filter('ConfirmDialog')).toEqual(['overlays']);
    expect(filter('SegmentToggle')).toEqual(['controls']);
  });

  it('không khớp gì → danh sách rỗng', () => {
    expect(filter('khong-co-nhom-nay')).toEqual([]);
  });
});
