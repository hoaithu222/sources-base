/**
 * Dựng component trong đúng cây provider mà app thật dùng.
 *
 *   renderWithIntl(ui, { locale })   bọc `NextIntlClientProvider` với thông điệp THẬT (`src/messages/<locale>`)
 *   renderInRouter(ui, { pathname }) = renderWithIntl + đặt vị trí điều hướng giả (`navigationMock`) — tên giữ từ bản React Router
 *                                    để test cũ dùng lại; `router` trả về là chính `navigationMock`
 *   renderInForm(ui, defaultValues)  thêm một `<Form>` thật (react-hook-form) bọc ngoài, cho field cần `name`
 *
 * Lưu ý: component dùng `useTranslations` / `Link` / `useRouter` của `@/core/i18n` PHẢI có provider — dựng thẳng bằng `render` của
 * Testing Library sẽ ném "No intl context found". `next/navigation` được mock ở `tests/setup.ts`.
 */

import { render } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import type { ReactElement, ReactNode } from 'react';
import { useForm, type DefaultValues, type FieldValues } from 'react-hook-form';

import type { Locale } from '@/core/i18n';
import enMessages from '@/messages/en';
import viMessages from '@/messages/vi';
import { Form } from '@/shared/ui';

import { navigationMock } from './navigation-mock';

const MESSAGES = { vi: viMessages, en: enMessages } satisfies Record<Locale, unknown>;

export interface RenderWithIntlOptions {
  /** Ngôn ngữ của provider. Mặc định `vi` (ngôn ngữ nguồn — chữ trong test viết tiếng Việt). */
  locale?: Locale;
}

export function IntlWrapper({ children, locale = 'vi' }: { children: ReactNode; locale?: Locale }) {
  return (
    <NextIntlClientProvider locale={locale} messages={MESSAGES[locale]}>
      {children}
    </NextIntlClientProvider>
  );
}

/** Render `ui` trong provider next-intl với thông điệp thật. */
export function renderWithIntl(ui: ReactElement, { locale = 'vi' }: RenderWithIntlOptions = {}) {
  return render(ui, {
    wrapper: ({ children }) => <IntlWrapper locale={locale}>{children}</IntlWrapper>,
  });
}

export interface RenderInRouterOptions extends RenderWithIntlOptions {
  /** `pathname` điều hướng giả (đã có tiền tố ngôn ngữ nếu không phải `vi`). Mặc định `/`. */
  pathname?: string;
  /** Query string điều hướng giả, vd `?tab=2`. */
  search?: string;
}

/** Render `ui` với điều hướng giả; trả thêm `router` (= `navigationMock`) để đọc `push` / `replace`. */
export function renderInRouter(
  ui: ReactElement,
  { pathname = '/', search = '', locale }: RenderInRouterOptions = {},
) {
  navigationMock.setLocation(pathname, search);
  return { ...renderWithIntl(ui, { locale }), router: navigationMock };
}

function FormHarness<V extends FieldValues>({
  children,
  defaultValues,
}: {
  children: ReactNode;
  defaultValues?: DefaultValues<V>;
}) {
  const form = useForm<V>({ defaultValues });
  return (
    <Form form={form} onSubmit={() => undefined}>
      {children}
    </Form>
  );
}

/** Render `ui` bên trong `<Form>` (giá trị đầu `defaultValues`) với điều hướng giả. */
export function renderInForm<V extends FieldValues>(
  ui: ReactNode,
  defaultValues?: DefaultValues<V>,
) {
  return renderInRouter(<FormHarness<V> defaultValues={defaultValues}>{ui}</FormHarness>);
}
