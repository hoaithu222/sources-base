/**
 * `renderWithQuery` — dựng view CÓ DỮ LIỆU như app thật: provider next-intl (thông điệp thật) + `LocaleSync` + `QueryClient` có bộ
 * báo lỗi tập trung (lỗi không khai `silentError` thành toast — view quên `silentError` là test bắt được).
 *
 *   const { container, queryClient } = renderWithQuery(<CustomerListView />, { pathname: '/demo/customers', search: '?page=2' });
 *
 * Lưu ý: tắt `retry` của query để lỗi 5xx hiện NGAY (app thật thử lại một lần, chờ ~1 giây); `LocaleSync` ghi câu lỗi HTTP / Zod
 * vào registry toàn cục nên ca dùng `locale: 'en'` phải trả về `vi` ở `afterEach` (`configureErrorMessages` · `configureZodLocale`).
 * Truyền `queryClient` để hai lần render dùng chung một cache (ca "sửa xong, danh sách làm mới").
 */

import { QueryClientProvider } from '@tanstack/react-query';
import type { QueryClient } from '@tanstack/react-query';
import { render } from '@testing-library/react';
import type { ReactElement } from 'react';

import LocaleSync from '@/app/_providers/sync/LocaleSync';
import type { Locale } from '@/core/i18n';
import { createQueryClient } from '@/core/query';
import { showToast } from '@/shared/ui';

import { navigationMock } from './navigation-mock';
import { IntlWrapper } from './render';

interface RenderWithQueryOptions {
  locale?: Locale;
  /** `pathname` điều hướng giả (đã có tiền tố ngôn ngữ nếu không phải `vi`). Mặc định `/`. */
  pathname?: string;
  /** Query string điều hướng giả, vd `?page=2`. */
  search?: string;
  queryClient?: QueryClient;
}

export function createTestQueryClient(): QueryClient {
  const client = createQueryClient({ notifyUser: (message) => showToast('error', message) });
  client.setDefaultOptions({
    ...client.getDefaultOptions(),
    queries: { ...client.getDefaultOptions().queries, retry: false },
  });
  return client;
}

export function renderWithQuery(
  ui: ReactElement,
  { locale = 'vi', pathname = '/', search = '', queryClient }: RenderWithQueryOptions = {},
) {
  navigationMock.setLocation(pathname, search);
  window.history.replaceState({}, '', `${pathname}${search}`);
  const client = queryClient ?? createTestQueryClient();
  const view = render(
    <IntlWrapper locale={locale}>
      <LocaleSync />
      <QueryClientProvider client={client}>{ui}</QueryClientProvider>
    </IntlWrapper>,
  );
  return { ...view, queryClient: client };
}
