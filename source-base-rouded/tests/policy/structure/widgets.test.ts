/**
 * Khuôn widget dùng chung (`src/shared/widgets/`) — `docs/rules/structure/widget-composition.md §9`.
 *
 *  1. Không có barrel gốc `@/shared/widgets` — import theo từng widget.
 *  2. Mỗi widget có `index.ts` + ít nhất một `*.theme.ts`; file trong `parts/` đặt kebab-case.
 *  3. Widget KHÔNG import widget khác (store cục bộ chỉ widget của nó đọc — nối chéo là việc của
 *     `app/shell`). Lỗi cũ: menu người dùng của Header import sâu store của Dock rồi tự đổi chế độ.
 */

import { describe, expect, it } from 'vitest';

import { SOURCE_CODE } from '@tests/helpers/source-files';

const WIDGETS = 'src/shared/widgets/';

/** Đường dẫn tính từ `src/shared/widgets/`. */
const FILES = Object.keys(SOURCE_CODE)
  .filter((path) => path.startsWith(WIDGETS))
  .map((path) => path.slice(WIDGETS.length));

const WIDGET_NAMES = [...new Set(FILES.map((file) => file.split('/')[0]))].filter(
  (name) => !name.includes('.'),
);

const IMPORT_SOURCE = /from\s+'([^']+)'/g;

function importsOf(file: string): string[] {
  return [...SOURCE_CODE[`${WIDGETS}${file}`].matchAll(IMPORT_SOURCE)].map((match) => match[1]);
}

function widgetOfImport(file: string, source: string): string | undefined {
  if (source.startsWith('@/shared/widgets/')) return source.split('/')[3];
  if (!source.startsWith('.')) return undefined;
  const parts = file.split('/').slice(0, -1);
  for (const segment of source.split('/')) {
    if (segment === '..') parts.pop();
    else if (segment !== '.') parts.push(segment);
  }
  return parts[0];
}

describe('khuôn widget', () => {
  it('có widget để kiểm', () => {
    expect(WIDGET_NAMES).toEqual(
      expect.arrayContaining(['command-palette', 'dock', 'header', 'progress-center']),
    );
  });

  it('không còn barrel gốc `@/shared/widgets` — import theo từng widget', () => {
    expect(FILES).not.toContain('index.ts');
  });

  it.each(WIDGET_NAMES)('%s có index.ts + *.theme.ts', (name) => {
    const own = FILES.filter((file) => file.startsWith(`${name}/`));
    expect(own).toContain(`${name}/index.ts`);
    expect(own.some((file) => file.endsWith('.theme.ts'))).toBe(true);
  });

  it('file trong parts/ là phần nội bộ đặt kebab-case', () => {
    const wrong = FILES.filter((file) => file.includes('/parts/')).filter(
      (file) => !/^[a-z0-9]+(-[a-z0-9]+)*\.tsx?$/.test(file.split('/').pop() ?? ''),
    );
    expect(wrong).toEqual([]);
  });

  it('không widget nào import widget khác', () => {
    const crossing = FILES.flatMap((file) =>
      importsOf(file)
        .map((source) => [source, widgetOfImport(file, source)] as const)
        .filter(([, target]) => target !== undefined && target !== file.split('/')[0])
        .map(([source]) => `${file} → ${source}`),
    );
    expect(crossing).toEqual([]);
  });
});
