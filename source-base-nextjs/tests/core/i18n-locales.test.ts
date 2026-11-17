/**
 * Ngôn ngữ — `LOCALES` / `LOCALE_META` / `isLocale`, cấu hình định tuyến, bộ thông điệp `vi` ↔ `en`, và registry câu lỗi validator (`configureZodLocale`).
 *
 * `vi` là NGUỒN: kiểu `Messages` suy từ nó và `en` phải khớp (`satisfies Messages` bắt khoá THIẾU, nhưng khoá THỪA ở `en`,
 * placeholder lệch, hay một file JSON chỉ có ở một ngôn ngữ thì tsc không thấy). Test này giữ phần còn lại:
 *   - cùng tập file `<namespace>.json` và cùng tập khoá lá ở hai ngôn ngữ, không chuỗi rỗng;
 *   - cùng tập đối số ICU (`{name}`) và thẻ rich-text (`<b>…</b>`) trong từng câu — dịch mất `{name}` là hiện chữ trống;
 *   - `CLIENT_NAMESPACES` là tập con của khoá thông điệp, `pickClientMessages` cắt đúng và không rò namespace chỉ-server.
 */

import { afterEach, describe, expect, it } from 'vitest';
import { z } from 'zod';

import { configureZodLocale, fillValidationMessage, validationMessages } from '@/core/config';
import {
  CLIENT_NAMESPACES,
  DEFAULT_LOCALE,
  LOCALE_COOKIE,
  LOCALE_META,
  LOCALES,
  isLocale,
  routing,
} from '@/core/i18n';
import type { Locale, Messages } from '@/core/i18n';
import { loadMessages, pickClientMessages } from '@/core/i18n/messages';
import enMessages from '@/messages/en';
import viMessages from '@/messages/vi';

// ── Ngôn ngữ ─────────────────────────────────────────────────────────────────────────────────────

describe('LOCALES · LOCALE_META · isLocale', () => {
  it('ngôn ngữ mặc định nằm trong danh sách; `LOCALE_META` có đúng khoá của `LOCALES`', () => {
    expect(LOCALES).toContain(DEFAULT_LOCALE);
    expect(Object.keys(LOCALE_META).sort()).toEqual([...LOCALES].sort());
  });

  it('siêu dữ liệu đủ trường, không trùng nhau giữa các ngôn ngữ', () => {
    for (const locale of LOCALES) {
      const meta = LOCALE_META[locale];
      expect(meta.label.trim(), `${locale}.label`).not.toBe('');
      expect(meta.shortLabel, `${locale}.shortLabel`).toMatch(/^[A-Z]{2,3}$/);
      expect(meta.htmlLang, `${locale}.htmlLang`).toMatch(/^[a-z]{2,3}(-[A-Z]{2})?$/);
      expect(meta.hrefLang, `${locale}.hrefLang`).toMatch(/^[a-z]{2,3}(-[A-Z]{2})?$/);
      expect(meta.ogLocale, `${locale}.ogLocale`).toMatch(/^[a-z]{2,3}_[A-Z]{2}$/);
    }
    for (const field of ['label', 'shortLabel', 'htmlLang', 'hrefLang', 'ogLocale'] as const) {
      const values = LOCALES.map((locale) => LOCALE_META[locale][field]);
      expect(new Set(values).size, `trùng ${field}`).toBe(values.length);
    }
  });

  it('tên ngôn ngữ viết bằng CHÍNH ngôn ngữ đó (bộ chọn ngôn ngữ)', () => {
    expect(LOCALE_META.vi.label).toBe('Tiếng Việt');
    expect(LOCALE_META.en.label).toBe('English');
  });

  it('isLocale nhận mã hợp lệ, từ chối phần còn lại (kể cả sai hoa thường, kiểu khác chuỗi)', () => {
    for (const locale of LOCALES) expect(isLocale(locale)).toBe(true);
    for (const value of ['fr', 'VI', 'En', 'vi-VN', '', ' vi', undefined, null, 1, {}, ['vi']]) {
      expect(isLocale(value), String(value)).toBe(false);
    }
  });

  it('định tuyến: cùng danh sách, ngôn ngữ mặc định không tiền tố, hreflang do Metadata API xuất (không header `Link`)', () => {
    expect([...routing.locales]).toEqual([...LOCALES]);
    expect(routing.defaultLocale).toBe(DEFAULT_LOCALE);
    expect(routing.localePrefix).toBe('as-needed');
    expect(routing.alternateLinks).toBe(false);
    expect(routing.localeCookie).toMatchObject({ name: LOCALE_COOKIE, sameSite: 'lax' });
  });
});

// ── Thông điệp ───────────────────────────────────────────────────────────────────────────────────

type Tree = { [key: string]: Tree | string | string[] };

/** Khoá lá dạng `a.b.c`; mảng chuỗi (vd `keywords`) tính là MỘT lá. */
function leaves(tree: Tree, prefix = ''): Map<string, string | string[]> {
  const out = new Map<string, string | string[]>();
  for (const [key, value] of Object.entries(tree)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (typeof value === 'string' || Array.isArray(value)) out.set(path, value);
    else for (const [leaf, text] of leaves(value, path)) out.set(leaf, text);
  }
  return out;
}

const textsOf = (value: string | string[]) => (Array.isArray(value) ? value : [value]);
const unique = (items: string[]) => [...new Set(items)].sort();

/**
 * Tên đối số ICU: `{name}`, `{count, plural, …}` → `name`, `count`. Duyệt theo ngăn xếp ngoặc để nhánh con của
 * `plural` / `select` (`one {# mục}`, `1 {January}`) là NỘI DUNG câu, không bị đọc nhầm thành đối số.
 */
function argsOf(text: string): string[] {
  const names = new Set<string>();
  const stack: ('arg' | 'options' | 'body')[] = [];
  for (let i = 0; i < text.length; i++) {
    if (text[i] === '}') {
      stack.pop();
    } else if (text[i] === '{') {
      if (stack.at(-1) === 'options') {
        stack.push('body'); // nhánh `one {…}` / `1 {…}`
        continue;
      }
      const head = /^\s*([A-Za-z_]\w*)\s*(?:,\s*(select|plural|selectordinal)\s*,)?/.exec(
        text.slice(i + 1),
      );
      if (head) names.add(head[1]);
      stack.push(head?.[2] ? 'options' : 'arg');
    }
  }
  return [...names].sort();
}
/** Thẻ rich-text `<b>…</b>` → `b`. */
const tagsOf = (text: string) =>
  unique([...text.matchAll(/<\/?([a-z][\w-]*)\s*>/gi)].map((m) => m[1]));

const VI = leaves(viMessages as unknown as Tree);
const EN = leaves(enMessages as unknown as Tree);

describe('thông điệp vi ↔ en', () => {
  it('cùng tập file `<namespace>.json` ở hai ngôn ngữ', () => {
    const files = import.meta.glob('/src/messages/*/*.json');
    const byLocale = (locale: Locale) =>
      Object.keys(files)
        .filter((path) => path.startsWith(`/src/messages/${locale}/`))
        .map((path) => path.split('/').pop() ?? path)
        .sort();

    expect(byLocale('vi').length).toBeGreaterThan(20);
    expect(byLocale('en')).toEqual(byLocale('vi'));
  });

  it('cùng tập khoá lá — không thiếu bản dịch, không thừa khoá mồ côi', () => {
    const missingInEn = [...VI.keys()].filter((key) => !EN.has(key));
    const extraInEn = [...EN.keys()].filter((key) => !VI.has(key));
    expect(missingInEn, 'Khoá có ở vi mà thiếu ở en').toEqual([]);
    expect(extraInEn, 'Khoá có ở en mà vi (nguồn) không có').toEqual([]);
    expect(VI.size).toBeGreaterThan(500);
  });

  it.each([
    ['vi', VI],
    ['en', EN],
  ] as const)('không câu rỗng ở `%s`', (_locale, tree) => {
    const blank = [...tree]
      .filter(([, value]) => textsOf(value).some((text) => text.trim() === ''))
      .map(([key]) => key);
    expect(blank).toEqual([]);
  });

  it('mảng chuỗi (từ khoá…) cùng độ dài ở hai ngôn ngữ', () => {
    const lengthMismatch = [...VI]
      .filter(([key, value]) => Array.isArray(value) && Array.isArray(EN.get(key)))
      .filter(([key, value]) => (value as string[]).length !== (EN.get(key) as string[]).length)
      .map(([key]) => key);
    expect(lengthMismatch).toEqual([]);
  });

  it('cùng đối số ICU `{…}` và thẻ rich-text `<b>` trong từng câu', () => {
    const drift = [...VI].flatMap(([key, value]) => {
      const other = EN.get(key);
      if (other === undefined) return [];
      return textsOf(value).flatMap((text, index) => {
        const translated = textsOf(other)[index] ?? '';
        const problems: string[] = [];
        if (argsOf(text).join() !== argsOf(translated).join()) {
          problems.push(`${key} — đối số vi {${argsOf(text)}} ≠ en {${argsOf(translated)}}`);
        }
        if (tagsOf(text).join() !== tagsOf(translated).join()) {
          problems.push(`${key} — thẻ vi <${tagsOf(text)}> ≠ en <${tagsOf(translated)}>`);
        }
        return problems;
      });
    });
    expect(drift, `Placeholder lệch:\n  ${drift.join('\n  ')}`).toEqual([]);
  });

  it('bắt được dịch mất đối số / thẻ (kiểm chính bộ so khớp)', () => {
    expect(argsOf('Xin chào {name}, còn {count, plural, one {# mục} other {# mục}}')).toEqual([
      'count',
      'name',
    ]);
    // Nhánh của select / plural là nội dung câu, không phải đối số.
    expect(argsOf('{month, select, 1 {January} 2 {February} other {Other}} {year}')).toEqual([
      'month',
      'year',
    ]);
    expect(argsOf('Xin chào {name}')).not.toEqual(argsOf('Hello'));
    expect(tagsOf('Bấm <kbd>Ctrl</kbd> + <b>K</b>')).toEqual(['b', 'kbd']);
    expect(tagsOf('Nhấn Ctrl K')).toEqual([]);
  });
});

describe('loadMessages · CLIENT_NAMESPACES · pickClientMessages', () => {
  it.each(LOCALES)('loadMessages(`%s`) trả đúng bộ thông điệp của ngôn ngữ', async (locale) => {
    const messages = await loadMessages(locale);
    expect(messages).toBe(locale === 'vi' ? viMessages : enMessages);
  });

  it.each(LOCALES)('`CLIENT_NAMESPACES` ⊂ khoá thông điệp (ngôn ngữ `%s`)', async (locale) => {
    const keys = Object.keys(await loadMessages(locale));
    expect(keys.length).toBeGreaterThan(CLIENT_NAMESPACES.length);
    for (const namespace of CLIENT_NAMESPACES) expect(keys, namespace).toContain(namespace);
  });

  it('hai ngôn ngữ cùng tập namespace gốc', () => {
    expect(Object.keys(enMessages).sort()).toEqual(Object.keys(viMessages).sort());
  });

  it.each(LOCALES)(
    'pickClientMessages chỉ giữ đúng `CLIENT_NAMESPACES` (ngôn ngữ `%s`)',
    async (locale) => {
      const messages: Messages = await loadMessages(locale);
      const picked = pickClientMessages(messages);

      expect(Object.keys(picked).sort()).toEqual([...CLIENT_NAMESPACES].sort());
      for (const namespace of CLIENT_NAMESPACES)
        expect(picked[namespace]).toBe(messages[namespace]);
    },
  );

  it('⛔ không rò namespace chỉ-server (metadata, landing, about, site) xuống trình duyệt', async () => {
    const picked = Object.keys(pickClientMessages(await loadMessages('vi')));
    for (const serverOnly of ['metadata', 'landing', 'about', 'site']) {
      expect(picked, serverOnly).not.toContain(serverOnly);
    }
  });

  it('phần gửi xuống client nhỏ hơn bộ đầy đủ — mục đích của việc cắt', async () => {
    const messages = await loadMessages('vi');
    const size = (value: unknown) => JSON.stringify(value).length;
    expect(size(pickClientMessages(messages))).toBeLessThan(size(messages));
  });
});

describe('metadata.<trang> — chữ cho `generatePageMetadata`', () => {
  const PAGES = Object.entries(viMessages.metadata).filter(([key]) => key !== 'site');

  it('mọi trang có `title` và `description` không rỗng ở MỌI ngôn ngữ', () => {
    expect(PAGES.length).toBeGreaterThanOrEqual(2);
    for (const messages of [viMessages, enMessages]) {
      for (const [page] of PAGES) {
        const entry = (
          messages.metadata as unknown as Record<string, { title: string; description: string }>
        )[page];
        expect(entry?.title?.trim(), `${page}.title`).toBeTruthy();
        expect(entry?.description?.trim(), `${page}.description`).toBeTruthy();
      }
    }
  });

  it('`metadata.site` có đủ thứ root layout cần: title, description, từ khoá', () => {
    for (const messages of [viMessages, enMessages]) {
      expect(messages.metadata.site.title.trim()).not.toBe('');
      expect(messages.metadata.site.description.trim()).not.toBe('');
      expect(messages.metadata.site.keywords.length).toBeGreaterThan(0);
    }
  });
});

describe('configureZodLocale · validationMessages · fillValidationMessage', () => {
  afterEach(() => configureZodLocale('vi', viMessages.validation));

  const messageOf = (result: { success: boolean; error?: { issues: { message: string }[] } }) =>
    result.error?.issues[0]?.message;

  it('mặc định (chưa cấu hình) là bộ câu tiếng Việt', () => {
    expect(validationMessages()).toBe(viMessages.validation);
  });

  it.each([
    ['vi', viMessages.validation],
    ['en', enMessages.validation],
  ] as const)(
    '`%s`: registry đổi theo; `min(1)` của chuỗi / mảng dùng câu riêng của bộ câu',
    (locale, messages) => {
      configureZodLocale(locale, messages);

      expect(validationMessages()).toBe(messages);
      expect(messageOf(z.string().min(1).safeParse(''))).toBe(messages.required);
      expect(messageOf(z.array(z.string()).min(1).safeParse([]))).toBe(messages.selectAtLeastOne);
    },
  );

  it('câu mặc định khác của Zod đi theo locale của Zod; đổi ngôn ngữ thì đổi theo', () => {
    configureZodLocale('en', enMessages.validation);
    const en = messageOf(z.number().safeParse('x'));
    configureZodLocale('vi', viMessages.validation);
    const vi = messageOf(z.number().safeParse('x'));

    expect(en).toBeTruthy();
    expect(vi).toBeTruthy();
    expect(vi).not.toBe(en);
  });

  it('chỉ `min(1)` mới dùng câu "bắt buộc": `min(3)` giữ câu của Zod', () => {
    configureZodLocale('en', enMessages.validation);
    expect(messageOf(z.string().min(3).safeParse('a'))).not.toBe(enMessages.validation.required);
  });

  it('fillValidationMessage điền `{tên}`; tham số thiếu giữ nguyên placeholder; nhiều lần xuất hiện đều được điền', () => {
    expect(fillValidationMessage('Tối thiểu {min} ký tự', { min: 8 })).toBe('Tối thiểu 8 ký tự');
    expect(fillValidationMessage('{a}-{b}-{a}', { a: 1, b: 'x' })).toBe('1-x-1');
    expect(fillValidationMessage('Tối đa {max}', {})).toBe('Tối đa {max}');
    expect(fillValidationMessage('Không có tham số')).toBe('Không có tham số');
    expect(fillValidationMessage('Giá trị {n}', { n: 0 })).toBe('Giá trị 0');
  });

  it('câu có tham số của cả hai ngôn ngữ điền được bằng đúng tham số của bản nguồn', () => {
    for (const messages of [viMessages.validation, enMessages.validation]) {
      expect(fillValidationMessage(messages.passwordMin, { min: 8 })).toContain('8');
      expect(fillValidationMessage(messages.passwordMin, { min: 8 })).not.toContain('{');
    }
  });
});
