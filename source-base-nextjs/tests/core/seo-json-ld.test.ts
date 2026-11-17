/**
 * JSON-LD (schema.org) — `serializeJsonLd`, bốn hàm dựng và thẻ `<JsonLd>`.
 *
 * Điều dễ sai nhất: JSON-LD được nhét NGUYÊN VĂN vào `<script>` bằng `dangerouslySetInnerHTML`, nên chuỗi do người dùng nhập
 * (tên sản phẩm, mô tả…) chứa `</script>` sẽ đóng thẻ sớm và chạy mã tuỳ ý (XSS). `serializeJsonLd` phải đổi mọi `<` thành
 * chuỗi escape `\u003c` — vẫn là JSON hợp lệ và `JSON.parse` trả đúng giá trị gốc.
 */

import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import JsonLd from '@/core/seo/JsonLd';
import {
  breadcrumbJsonLd,
  organizationJsonLd,
  serializeJsonLd,
  webPageJsonLd,
  websiteJsonLd,
} from '@/core/seo/json-ld.utils';

const ORIGIN = 'https://example.com';
const ATTACK = '</script><script>alert(1)</script>';

describe('serializeJsonLd', () => {
  it('⛔ thoát `<`: không còn ký tự `<` nào trong chuỗi sinh ra, `</script>` không thoát được khỏi thẻ', () => {
    const data = { name: ATTACK, nested: { list: [ATTACK, '<b>x</b>'] } };
    const out = serializeJsonLd(data);
    expect(out).not.toContain('<');
    expect(out.toLowerCase()).not.toContain('</script');
    // Mỗi `<` thành đúng một chuỗi escape sáu ký tự (backslash + `u003c`) — không bỏ chữ, không thay nhầm chỗ khác.
    const count = (text: string, part: string) => text.split(part).length - 1;
    expect(count(out, '\\u003c')).toBe(count(JSON.stringify(data), '<'));
  });

  it('vẫn là JSON hợp lệ: `JSON.parse` trả đúng giá trị gốc (kể cả chuỗi tấn công)', () => {
    const data = { name: ATTACK, tags: ['<a>', 'b & c'], n: 1, ok: true, none: null };
    expect(JSON.parse(serializeJsonLd(data))).toEqual(data);
  });

  it('chỉ thay `<` — dấu nháy, `>` và `&` giữ nguyên', () => {
    expect(serializeJsonLd({ a: '"x" > y & z' })).toBe('{"a":"\\"x\\" > y & z"}');
  });

  it('nhận cả mảng nhiều đối tượng', () => {
    const out = serializeJsonLd([{ '@type': 'A' }, { '@type': 'B' }]);
    expect(JSON.parse(out)).toEqual([{ '@type': 'A' }, { '@type': 'B' }]);
  });
});

describe('organizationJsonLd', () => {
  it('đủ trường: @context, @type, name, url, logo, description, sameAs', () => {
    expect(
      organizationJsonLd({
        name: 'Test App',
        url: ORIGIN,
        logo: `${ORIGIN}/logo.png`,
        description: 'Mô tả',
        sameAs: ['https://github.com/test'],
      }),
    ).toEqual({
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'Test App',
      url: ORIGIN,
      logo: `${ORIGIN}/logo.png`,
      description: 'Mô tả',
      sameAs: ['https://github.com/test'],
    });
  });

  it('trường tuỳ chọn thiếu / rỗng thì VẮNG MẶT (không `undefined`, không mảng rỗng)', () => {
    const org = organizationJsonLd({ name: 'Test App', url: ORIGIN, sameAs: [] });
    expect(Object.keys(org).sort()).toEqual(['@context', '@type', 'name', 'url']);
  });
});

describe('websiteJsonLd', () => {
  it('WebSite có ngôn ngữ nội dung', () => {
    expect(
      websiteJsonLd({ name: 'Test App', url: ORIGIN, description: 'Mô tả', inLanguage: 'vi' }),
    ).toEqual({
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'Test App',
      url: ORIGIN,
      inLanguage: 'vi',
      description: 'Mô tả',
    });
  });

  it('thiếu description thì không có khoá `description`', () => {
    expect(websiteJsonLd({ name: 'A', url: ORIGIN, inLanguage: 'en' })).not.toHaveProperty(
      'description',
    );
  });
});

describe('webPageJsonLd', () => {
  it('WebPage trỏ về WebSite chứa nó qua `isPartOf`', () => {
    expect(
      webPageJsonLd({
        name: 'Giới thiệu',
        url: `${ORIGIN}/about`,
        description: 'Mô tả',
        inLanguage: 'vi',
        isPartOf: ORIGIN,
      }),
    ).toEqual({
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: 'Giới thiệu',
      url: `${ORIGIN}/about`,
      inLanguage: 'vi',
      isPartOf: { '@type': 'WebSite', url: ORIGIN },
      description: 'Mô tả',
    });
  });

  it('thiếu description thì không có khoá `description`', () => {
    const page = webPageJsonLd({ name: 'A', url: ORIGIN, inLanguage: 'vi', isPartOf: ORIGIN });
    expect(page).not.toHaveProperty('description');
  });
});

describe('breadcrumbJsonLd', () => {
  it('ListItem đánh số từ 1 theo thứ tự mảng, `item` là URL tuyệt đối', () => {
    expect(
      breadcrumbJsonLd([
        { name: 'Trang chủ', url: `${ORIGIN}/` },
        { name: 'Giới thiệu', url: `${ORIGIN}/about` },
      ]),
    ).toEqual({
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Trang chủ', item: `${ORIGIN}/` },
        { '@type': 'ListItem', position: 2, name: 'Giới thiệu', item: `${ORIGIN}/about` },
      ],
    });
  });

  it('danh sách rỗng cho `itemListElement` rỗng', () => {
    expect(breadcrumbJsonLd([]).itemListElement).toEqual([]);
  });
});

describe('<JsonLd>', () => {
  it('là thẻ `<script type="application/ld+json">` chứa JSON đã thoát `<`', () => {
    const html = renderToStaticMarkup(
      createElement(JsonLd, {
        data: websiteJsonLd({ name: ATTACK, url: ORIGIN, inLanguage: 'vi' }),
      }),
    );

    expect(html.startsWith('<script type="application/ld+json">')).toBe(true);
    // Chỉ MỘT thẻ đóng — chuỗi tấn công không mở được thẻ mới.
    expect(html.match(/<\/script>/g)).toHaveLength(1);
    expect(html.match(/<script/g)).toHaveLength(1);

    const body = html.slice(html.indexOf('>') + 1, html.lastIndexOf('</script>'));
    expect(JSON.parse(body)).toMatchObject({ '@type': 'WebSite', name: ATTACK });
  });

  it('nhận mảng nhiều đối tượng trong MỘT thẻ', () => {
    const html = renderToStaticMarkup(
      createElement(JsonLd, {
        data: [
          websiteJsonLd({ name: 'A', url: ORIGIN, inLanguage: 'vi' }),
          breadcrumbJsonLd([{ name: 'Trang chủ', url: ORIGIN }]),
        ],
      }),
    );
    expect(html.match(/<script/g)).toHaveLength(1);
    const body = html.slice(html.indexOf('>') + 1, html.lastIndexOf('</script>'));
    expect((JSON.parse(body) as { '@type': string }[]).map((item) => item['@type'])).toEqual([
      'WebSite',
      'BreadcrumbList',
    ]);
  });
});
