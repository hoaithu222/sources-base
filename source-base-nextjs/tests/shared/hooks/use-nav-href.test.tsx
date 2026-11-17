/**
 * `useNavHref` — dựng URL THẬT cho tab / bộ lọc (mở được bằng Ctrl+click): giữ param khác, giá trị rỗng xoá key, không bao giờ
 * tự nối `${pathname}?tab=…` làm mất search / page / filter.
 */

import { describe, expect, it } from 'vitest';

import { useNavHref } from '@/shared/hooks';
import { renderHookWithUrl } from '@tests/helpers/url-state-hook';

const PATHNAME = '/danh-sach';

function renderNavHref(search: string, locale?: 'vi' | 'en') {
  const pathname = locale === 'en' ? `/en${PATHNAME}` : PATHNAME;
  return renderHookWithUrl(() => useNavHref(), { pathname, search, locale });
}

describe('useNavHref', () => {
  it('đổi một param, GIỮ nguyên mọi param khác (tab mới vẫn giữ bộ lọc)', () => {
    const { result } = renderNavHref('?search=thep&page=3');

    expect(result.current({ tab: 'chi-tiet' })).toBe(`${PATHNAME}?search=thep&page=3&tab=chi-tiet`);
  });

  it('giá trị rỗng / null / undefined xoá key; số được ghi dạng chuỗi', () => {
    const { result } = renderNavHref('?search=thep&page=3&tab=a');

    expect(result.current({ tab: '', search: null })).toBe(`${PATHNAME}?page=3`);
    expect(result.current({ page: 5, tab: undefined })).toBe(`${PATHNAME}?search=thep&page=5`);
  });

  it('hết query → trả đúng `pathname`, không để dư dấu `?`', () => {
    const { result } = renderNavHref('?tab=a');

    expect(result.current({ tab: null })).toBe(PATHNAME);
  });

  it('không có query và không đổi gì → `pathname` trần', () => {
    const { result } = renderNavHref('');

    expect(result.current({})).toBe(PATHNAME);
  });

  it('`pathname` lấy từ router của next-intl: ở en vẫn là đường KHÔNG tiền tố (`<Link>` tự thêm `/en`)', () => {
    const { result } = renderNavHref('?search=x', 'en');

    expect(result.current({ tab: 'a' })).toBe(`${PATHNAME}?search=x&tab=a`);
  });
});
