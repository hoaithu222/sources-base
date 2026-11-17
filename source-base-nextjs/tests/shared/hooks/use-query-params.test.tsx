/**
 * `useQueryParams` — ba lỗi của bản trước, mỗi lỗi một nhóm ca kiểm:
 *  - `parseInt('12abc')` ra 12: số lẫn đuôi / dấu / dạng khoa học vẫn được nhận;
 *  - `pageSize` không có trần: `?pageSize=99999999` chảy thẳng vào lời gọi API;
 *  - `clearParams()` thay cả query string bằng chuỗi rỗng, xoá luôn param của người khác
 *    (`?display=tv&scale=1.2` của `DisplayUrlSync`, bộ lọc của tính năng khác).
 */

import { act } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import {
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
  PAGE_SIZE_OPTIONS,
} from '@/shared/constants/pagination.constants';
import { useQueryParams } from '@/shared/hooks';
import type { QueryParamsConfig } from '@/shared/hooks';
import { navigationMock } from '@tests/helpers/navigation-mock';
import { renderHookWithUrl } from '@tests/helpers/url-state-hook';

const PATHNAME = '/danh-sach';

function renderParams(search: string, config?: QueryParamsConfig) {
  return renderHookWithUrl(() => useQueryParams(config), { pathname: PATHNAME, search });
}

const urlOf = (result: { current: { searchParams: URLSearchParams } }) =>
  result.current.searchParams.toString();

const queryOf = (params: Record<string, string>) => `?${new URLSearchParams(params).toString()}`;

describe('đọc `page`', () => {
  it('không có param → trang 1; hợp lệ → dùng đúng số đó', () => {
    expect(renderParams('').result.current.page).toBe(1);
    expect(renderParams('?page=3').result.current.page).toBe(3);
  });

  it.each([
    ['đuôi chữ', '12abc'],
    ['số âm', '-3'],
    ['dấu cộng', '+2'],
    ['dạng khoa học', '1e3'],
    ['số thập phân', '1.5'],
    ['hệ 16', '0x10'],
    ['khoảng trắng đầu', ' 2'],
    ['khoảng trắng cuối', '2 '],
    ['xuống dòng cuối', '12\n'],
    ['chuỗi rỗng', ''],
    ['số 0', '0'],
    ['vượt số nguyên an toàn', '99999999999999999999'],
    ['Infinity', 'Infinity'],
  ])('⛔ `?page=` %s (`%s`) → trang 1', (_name, raw) => {
    expect(renderParams(queryOf({ page: raw })).result.current.page).toBe(1);
  });

  it('key tuỳ chỉnh (`pageKey`) cũng bị kiểm chặt như key mặc định', () => {
    const config = { pageKey: 'aPage' };

    expect(renderParams('?aPage=12abc', config).result.current.page).toBe(1);
    expect(renderParams('?aPage=5&page=9', config).result.current.page).toBe(5);
  });
});

describe('đọc `pageSize`', () => {
  it('không có param → `DEFAULT_PAGE_SIZE`; hợp lệ → dùng đúng số đó', () => {
    expect(renderParams('').result.current.pageSize).toBe(DEFAULT_PAGE_SIZE);
    expect(renderParams('?pageSize=24').result.current.pageSize).toBe(24);
  });

  it.each([
    ['không có trần', '99999999'],
    ['bằng 0', '0'],
    ['số âm', '-5'],
    ['đuôi chữ', '12abc'],
    ['dạng khoa học', '1e3'],
    ['thập phân', '10.5'],
    ['vượt số nguyên an toàn', '99999999999999999999'],
    ['vượt trần 1 đơn vị', String(MAX_PAGE_SIZE + 1)],
  ])('⛔ `?pageSize=` %s (`%s`) → `DEFAULT_PAGE_SIZE`', (_name, raw) => {
    expect(renderParams(queryOf({ pageSize: raw })).result.current.pageSize).toBe(
      DEFAULT_PAGE_SIZE,
    );
  });

  it('biên: 1 và đúng bằng trần đều hợp lệ', () => {
    expect(renderParams('?pageSize=1').result.current.pageSize).toBe(1);
    expect(renderParams(`?pageSize=${MAX_PAGE_SIZE}`).result.current.pageSize).toBe(MAX_PAGE_SIZE);
  });

  it('trần mặc định không chặn lựa chọn nào của `PAGE_SIZE_OPTIONS`', () => {
    PAGE_SIZE_OPTIONS.forEach((size) => {
      expect(renderParams(`?pageSize=${size}`).result.current.pageSize).toBe(size);
    });
  });

  it('`defaultPageSize` tuỳ chỉnh là giá trị rơi về cho mọi ca không hợp lệ', () => {
    const config = { defaultPageSize: 20 };

    expect(renderParams('', config).result.current.pageSize).toBe(20);
    expect(renderParams('?pageSize=12abc', config).result.current.pageSize).toBe(20);
    expect(renderParams('?pageSize=99999999', config).result.current.pageSize).toBe(20);
  });

  it('`maxPageSize` tuỳ chỉnh thay trần mặc định', () => {
    const config = { maxPageSize: 50 };

    expect(renderParams('?pageSize=50', config).result.current.pageSize).toBe(50);
    expect(renderParams('?pageSize=51', config).result.current.pageSize).toBe(DEFAULT_PAGE_SIZE);
    expect(renderParams('?pageSize=200', { maxPageSize: 500 }).result.current.pageSize).toBe(200);
  });

  it('key tuỳ chỉnh (`pageSizeKey`) cũng bị kiểm chặt', () => {
    const config = { pageSizeKey: 'size' };

    expect(renderParams('?size=24', config).result.current.pageSize).toBe(24);
    expect(renderParams('?size=99999999&pageSize=24', config).result.current.pageSize).toBe(
      DEFAULT_PAGE_SIZE,
    );
  });
});

describe('`clearParams`', () => {
  it('⛔ chỉ xoá param của hook (page, pageSize, search, tab) — `?display=tv&scale=1.2` còn nguyên', () => {
    const { result } = renderParams(
      '?page=3&pageSize=24&search=thep&tab=chi-tiet&display=tv&scale=1.2',
    );

    act(() => result.current.clearParams());

    expect(urlOf(result)).toBe('display=tv&scale=1.2');
    expect(result.current.page).toBe(1);
    expect(result.current.pageSize).toBe(DEFAULT_PAGE_SIZE);
    expect(result.current.search).toBe('');
    expect(result.current.tab).toBe('');
  });

  it('⛔ param của tính năng khác (bộ lọc không khai báo) cũng được giữ', () => {
    const { result } = renderParams('?status=2&search=abc&page=4');

    act(() => result.current.clearParams());

    expect(urlOf(result)).toBe('status=2');
  });

  it('`paramKeys` khai báo thêm → các key đó cũng bị xoá, key còn lại vẫn giữ', () => {
    const { result } = renderParams('?status=2&type=a&page=4&display=tv', {
      paramKeys: ['status', 'type'],
    });

    act(() => result.current.clearParams());

    expect(urlOf(result)).toBe('display=tv');
    expect(result.current.getParam('status')).toBe('');
  });

  it('key tuỳ chỉnh của hook (`pageKey`, `searchKey`…) là của hook → bị xoá; bảng kia giữ nguyên', () => {
    const { result } = renderParams('?aPage=2&aSearch=x&aSize=24&aTab=t&bPage=3&bSearch=y', {
      pageKey: 'aPage',
      searchKey: 'aSearch',
      pageSizeKey: 'aSize',
      tabKey: 'aTab',
    });

    act(() => result.current.clearParams());

    expect(urlOf(result)).toBe('bPage=3&bSearch=y');
  });

  it('`clearParams` giữ danh tính giữa các render dù `paramKeys` là mảng literal mới mỗi lần', () => {
    const { result, rerender } = renderHookWithUrl(
      () => useQueryParams({ paramKeys: ['status'] }),
      {
        pathname: PATHNAME,
      },
    );
    const first = result.current.clearParams;

    rerender();
    expect(result.current.clearParams).toBe(first);
  });

  it('`clearParams` dùng `paramKeys` mới nhất sau khi cấu hình đổi', () => {
    const { result, rerender } = renderHookWithUrl(
      ({ keys }) => useQueryParams({ paramKeys: keys }),
      { pathname: PATHNAME, search: '?a=1&b=2', initialProps: { keys: ['a'] } },
    );

    rerender({ keys: ['b'] });
    act(() => result.current.clearParams());

    expect(urlOf(result)).toBe('a=1');
  });

  it('không có param nào của hook → URL giữ nguyên', () => {
    const { result } = renderParams('?display=tv&scale=1.2');

    act(() => result.current.clearParams());

    expect(urlOf(result)).toBe('display=tv&scale=1.2');
  });

  it('chỉ có param của hook → query string rỗng', () => {
    const { result } = renderParams('?page=2&search=abc');

    act(() => result.current.clearParams());

    expect(urlOf(result)).toBe('');
  });
});

describe('ghi param — hành vi giữ nguyên', () => {
  it('`setSearch` ghi `search` và đưa `page` về 1; chuỗi rỗng xoá key', () => {
    const { result } = renderParams('?page=4&display=tv');

    act(() => result.current.setSearch('thep'));
    expect(result.current.search).toBe('thep');
    expect(result.current.page).toBe(1);
    expect(result.current.getParam('display')).toBe('tv');

    act(() => result.current.setSearch(''));
    expect(result.current.searchParams.has('search')).toBe(false);
  });

  it('`setParam(key, v)` đưa `page` về 1; `null` / rỗng xoá key', () => {
    const { result } = renderParams('?page=4&status=1');

    act(() => result.current.setParam('status', '2'));
    expect(result.current.getParam('status')).toBe('2');
    expect(result.current.page).toBe(1);

    act(() => result.current.setParam('status', null));
    expect(result.current.searchParams.has('status')).toBe(false);
  });

  it('`resetPageOnChange: false` → `setSearch` / `setParam` không đụng `page`', () => {
    const { result } = renderParams('?page=4', { resetPageOnChange: false });

    act(() => result.current.setSearch('thep'));
    act(() => result.current.setParam('status', '2'));

    expect(result.current.page).toBe(4);
  });

  it('`setParam` với chính key page / pageSize không tự reset page', () => {
    const { result } = renderParams('?page=4');

    act(() => result.current.setParam('page', 6));
    expect(result.current.page).toBe(6);
  });

  it('`setPageSize` đưa `page` về 1; `setPage` chỉ đổi page; `setTab` và `updateParams` không reset', () => {
    const { result } = renderParams('?page=4');

    act(() => result.current.setPageSize(24));
    expect(result.current.pageSize).toBe(24);
    expect(result.current.page).toBe(1);

    act(() => result.current.setPage(5));
    expect(result.current.page).toBe(5);

    act(() => result.current.setTab('chi-tiet'));
    expect(result.current.tab).toBe('chi-tiet');
    expect(result.current.page).toBe(5);

    act(() => result.current.updateParams({ status: '1', type: 'a' }));
    expect(result.current.getParam('type')).toBe('a');
    expect(result.current.page).toBe(5);
  });
});

describe('ghi param qua `router.replace` của next-intl', () => {
  it('ghi `${pathname}?query` kèm `{ scroll: false }`; hết query thì chỉ còn `pathname`', () => {
    const { result } = renderParams('?page=4');

    act(() => result.current.setSearch('thep'));
    expect(navigationMock.replace).toHaveBeenLastCalledWith(`${PATHNAME}?page=1&search=thep`, {
      scroll: false,
    });

    act(() => result.current.clearParams());
    expect(navigationMock.replace).toHaveBeenLastCalledWith(PATHNAME, { scroll: false });
    expect(navigationMock.push).not.toHaveBeenCalled();
  });

  it('⛔ hai lần ghi liên tiếp trong cùng một lượt không ghi đè nhau (đọc URL tại lúc gọi, không dùng bản của render)', () => {
    const { result } = renderParams('?display=tv');

    act(() => {
      result.current.setParam('status', '2');
      result.current.setParam('type', 'a');
    });

    expect(result.current.getParam('status')).toBe('2');
    expect(result.current.getParam('type')).toBe('a');
    expect(result.current.getParam('display')).toBe('tv');
  });

  it('ngôn ngữ `en`: `replace` đi qua router của next-intl → URL ghi ra mang tiền tố `/en`', () => {
    const { result } = renderHookWithUrl(() => useQueryParams(), {
      pathname: `/en${PATHNAME}`,
      search: '?page=2',
      locale: 'en',
    });

    act(() => result.current.setPage(3));

    expect(navigationMock.replace).toHaveBeenLastCalledWith(`/en${PATHNAME}?page=3`, {
      scroll: false,
    });
    expect(result.current.page).toBe(3);
  });
});
