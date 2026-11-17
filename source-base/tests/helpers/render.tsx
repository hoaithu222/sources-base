/**
 * Dựng component trong đúng cây provider mà app thật dùng.
 *
 * `renderInRouter` — data router trong bộ nhớ: `<Form>` gọi `useDirtyGuard` → `useBlocker`, thứ CHỈ
 * chạy trong data router; component có `useNavigate` / `<Link>` (TitleScreen, Pagination) cũng cần.
 * `renderInForm` — thêm một `<Form>` thật (react-hook-form) bọc ngoài, cho field cần `name`.
 *
 * ⛔ Data router tự BẮT lỗi render và vẽ trang "Unexpected Application Error!" — component ném lỗi
 * vẫn "dựng ra DOM" và bài kiểm xanh giả. `renderInRouter` vì thế gắn `errorElement` riêng và NÉM
 * lại lỗi đó ngay lượt render đầu.
 */

import { render } from '@testing-library/react';
import type { ReactElement, ReactNode } from 'react';
import { useForm, type DefaultValues, type FieldValues } from 'react-hook-form';
import { createMemoryRouter, RouterProvider, useRouteError } from 'react-router-dom';

import { Form } from '@/shared/ui';

const ROUTE_ERROR_ATTR = 'data-test-route-error';

function RouteError() {
  const error = useRouteError();
  const message = error instanceof Error ? (error.stack ?? error.message) : String(error);
  return <pre {...{ [ROUTE_ERROR_ATTR]: '' }}>{message}</pre>;
}

export interface RenderInRouterOptions {
  /** Các đường cùng render `ui`; đường đầu là điểm vào. Mặc định `['/']`. */
  paths?: string[];
}

/** Render `ui` trong memory data router; trả thêm `router` để đọc / đổi vị trí. */
export function renderInRouter(ui: ReactElement, { paths = ['/'] }: RenderInRouterOptions = {}) {
  const router = createMemoryRouter(
    paths.map((path) => ({ path, element: ui, errorElement: <RouteError /> })),
    { initialEntries: [paths[0]] },
  );
  const view = render(<RouterProvider router={router} />);
  const crashed = view.baseElement.querySelector(`[${ROUTE_ERROR_ATTR}]`);
  if (crashed) throw new Error(`Component ném lỗi khi render:\n${crashed.textContent}`);
  return { ...view, router };
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

/** Render `ui` bên trong `<Form>` (giá trị đầu `defaultValues`) đặt trong memory data router. */
export function renderInForm<V extends FieldValues>(
  ui: ReactNode,
  defaultValues?: DefaultValues<V>,
) {
  return renderInRouter(<FormHarness<V> defaultValues={defaultValues}>{ui}</FormHarness>);
}
