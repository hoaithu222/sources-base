/**
 * `renderHookWithUrl` — `renderHook` cho hook đọc / ghi URL (`useQueryParams`, `useNavHref`) trên điều hướng GIẢ có TRẠNG THÁI.
 *
 *   const { result } = renderHookWithUrl(() => useQueryParams(), { pathname: '/danh-sach', search: '?page=2' });
 *   act(() => result.current.setSearch('thep'));
 *   result.current.search   // 'thep' — `router.replace` ghi lại URL rồi hook render lại
 *
 * Vì sao cần: `navigationMock.replace` trần chỉ là spy — không đổi URL nên hook không bao giờ thấy giá trị mới. Helper nối
 * `replace` / `push` với `navigationMock.setLocation` + `window.history` (hook ghi đọc `window.location.search` lúc gọi) rồi
 * ép hook render lại. Provider next-intl đã bọc sẵn; `initialProps` / `rerender(props)` dùng như `renderHook`.
 */

import { act, renderHook } from '@testing-library/react';
import { useSyncExternalStore } from 'react';

import { IntlWrapper } from './render';
import { navigationMock } from './navigation-mock';

import type { Locale } from '@/core/i18n';

interface UrlHookOptions<Props> {
  /** `pathname` điều hướng giả (đã có tiền tố ngôn ngữ nếu không phải `vi`). Mặc định `/`. */
  pathname?: string;
  /** Query string ban đầu, vd `?page=2`. */
  search?: string;
  locale?: Locale;
  initialProps?: Props;
}

const listeners = new Set<() => void>();
let urlVersion = 0;

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

const getVersion = () => urlVersion;

function commitUrl(href: string): void {
  const [pathname, query = ''] = href.split('?');
  window.history.replaceState({}, '', href);
  navigationMock.setLocation(pathname, query);
  urlVersion += 1;
  act(() => listeners.forEach((listener) => listener()));
}

/** Render `callback` trong provider next-intl + URL giả có trạng thái; trả về như `renderHook`. */
export function renderHookWithUrl<Result, Props = undefined>(
  callback: (props: Props) => Result,
  { pathname = '/', search = '', locale, initialProps }: UrlHookOptions<Props> = {},
) {
  navigationMock.setLocation(pathname, search);
  window.history.replaceState({}, '', `${pathname}${search}`);
  navigationMock.replace.mockImplementation(commitUrl);
  navigationMock.push.mockImplementation(commitUrl);

  return renderHook(
    (props: Props) => {
      useSyncExternalStore(subscribe, getVersion, getVersion);
      return callback(props);
    },
    {
      initialProps: initialProps as Props,
      wrapper: ({ children }) => <IntlWrapper locale={locale}>{children}</IntlWrapper>,
    },
  );
}
