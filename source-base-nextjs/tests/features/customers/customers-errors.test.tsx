/**
 * Lỗi THẬT từ máy chủ trong `src/features/customers` — qua `mockHttp` (interceptor, `readData`, `AppError`, React Query là bản thật).
 * Mock `@/core/config` đặt `isDemo = false` để hàm API đi thẳng `apiClient` (không gắn adapter demo).
 *
 * Mỗi lỗi có ĐÚNG một nơi hiện: lỗi của form hiện trên form (ô `code` / ô có `fieldErrors` / dòng lỗi chung), KHÔNG toast chen vào;
 * form GIỮ dữ liệu đã nhập và không điều hướng. Lỗi tải danh sách / chi tiết hiện trạng thái lỗi có "Thử lại"; lỗi xoá — không
 * có chỗ tự vẽ — do bộ báo lỗi tập trung toast, hộp xác nhận ở lại. BE trả sai hình dạng là lỗi hợp đồng, không phải trang trắng.
 */

import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { CustomerCreateView, CustomerEditView, CustomerListView } from '@/features/customers';
import viMessages from '@/messages/vi';
import { useToastStore } from '@/shared/ui/overlays/toast/toast.store';
import { mockHttp } from '@tests/helpers/http-mock';
import type { MockHandler, MockReply } from '@tests/helpers/http-mock';
import { navigationMock } from '@tests/helpers/navigation-mock';
import { renderWithQuery } from '@tests/helpers/render-with-query';

vi.mock('@/core/config', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/core/config')>();
  return { ...actual, appConfig: { ...actual.appConfig, isDemo: false } };
});

const t = viMessages.customers;

const DTO = {
  id: 7,
  code: 'KH007',
  name: 'Cửa hàng Vật tư Minh Tâm',
  email: 'minhtam@example.com',
  phone: '0912345607',
  status: 'active',
  credit_limit: '15000000.00',
  created_at: '2026-09-07T08:30:00.000Z',
  updated_at: '2026-09-07T08:30:00.000Z',
};

interface Recorded {
  method: string;
  url: string;
  body: unknown;
}

let restore: () => void = () => {};
let requests: Recorded[] = [];

const serve = (handler: (request: Recorded) => MockReply | Promise<MockReply>) => {
  const wrapped: MockHandler = (config) => {
    const request = {
      method: String(config.method).toUpperCase(),
      url: String(config.url),
      body: typeof config.data === 'string' ? (JSON.parse(config.data) as unknown) : undefined,
    };
    requests.push(request);
    return handler(request);
  };
  restore = mockHttp(wrapped);
};

const inputNamed = (container: HTMLElement, name: string) => {
  const input = container.querySelector<HTMLInputElement>(`input[name="${name}"]`);
  if (!input) throw new Error(`Không thấy ô "${name}"`);
  return input;
};

const toastTitles = () => useToastStore.getState().toasts.map((toast) => toast.title);

beforeEach(() => {
  requests = [];
  useToastStore.setState({ toasts: [] });
});

afterEach(() => {
  restore();
  restore = () => {};
});

async function fillNewCustomer(container: HTMLElement) {
  const user = userEvent.setup();
  await user.type(inputNamed(container, 'code'), 'KH001');
  await user.type(inputNamed(container, 'name'), 'Công ty Thép Mới');
  await user.type(inputNamed(container, 'email'), 'thepmoi@example.com');
  return user;
}

describe('form tạo / sửa — lỗi từ máy chủ', () => {
  it('409 mã đã tồn tại → lỗi ở ô mã; dữ liệu còn nguyên; không điều hướng; không toast', async () => {
    serve(() => ({ status: 409, data: { error: { code: 'CUSTOMER_001' } } }));
    const { container } = renderWithQuery(<CustomerCreateView />);
    const user = await fillNewCustomer(container);

    await user.click(screen.getByRole('button', { name: t.form.create }));

    expect(await screen.findByText(t.form.codeTaken)).toBeInTheDocument();
    expect(inputNamed(container, 'code')).toHaveValue('KH001');
    expect(inputNamed(container, 'name')).toHaveValue('Công ty Thép Mới');
    expect(navigationMock.push).not.toHaveBeenCalled();
    expect(toastTitles()).toEqual([]);
  });

  it('gửi payload đúng hợp đồng BE: snake_case, tiền là chuỗi, phone trống là null', async () => {
    serve(() => ({ status: 201, data: { data: { ...DTO, id: 8, code: 'KH001' } } }));
    const { container } = renderWithQuery(<CustomerCreateView />);
    const user = await fillNewCustomer(container);

    await user.click(screen.getByRole('button', { name: t.form.create }));

    await waitFor(() => expect(navigationMock.push).toHaveBeenCalledWith('/demo/customers'));
    expect(requests).toEqual([
      {
        method: 'POST',
        url: '/customers',
        body: {
          code: 'KH001',
          name: 'Công ty Thép Mới',
          email: 'thepmoi@example.com',
          phone: null,
          status: 'active',
          credit_limit: '0.00',
        },
      },
    ]);
  });

  it('500 khi lưu bản sửa → dòng lỗi chung trên form; tên vừa sửa còn nguyên; không điều hướng, không toast', async () => {
    serve(({ method }) =>
      method === 'GET' ? { status: 200, data: { data: DTO } } : { status: 500, data: {} },
    );
    const { container } = renderWithQuery(<CustomerEditView />, {
      pathname: '/demo/customers/edit',
      search: '?id=7',
    });
    await waitFor(() => expect(inputNamed(container, 'name')).toHaveValue(DTO.name));
    const user = userEvent.setup();

    await user.clear(inputNamed(container, 'name'));
    await user.type(inputNamed(container, 'name'), 'Tên đang sửa dở');
    await user.click(screen.getByRole('button', { name: t.form.save }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Lỗi máy chủ nội bộ');
    expect(inputNamed(container, 'name')).toHaveValue('Tên đang sửa dở');
    expect(navigationMock.push).not.toHaveBeenCalled();
    expect(toastTitles()).toEqual([]);
  });

  it('422 kèm lỗi theo từng ô → hiện đúng dưới ô đó, form giữ dữ liệu', async () => {
    serve(({ method }) =>
      method === 'GET'
        ? { status: 200, data: { data: DTO } }
        : {
            status: 422,
            data: {
              error: { code: 'VAL_001' },
              errors: { email: ['Email này đã thuộc về khách hàng khác'] },
            },
          },
    );
    const { container } = renderWithQuery(<CustomerEditView />, {
      pathname: '/demo/customers/edit',
      search: '?id=7',
    });
    await waitFor(() => expect(inputNamed(container, 'email')).toHaveValue(DTO.email));
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: t.form.save }));

    expect(await screen.findByText('Email này đã thuộc về khách hàng khác')).toBeInTheDocument();
    expect(inputNamed(container, 'email')).toHaveValue(DTO.email);
    expect(navigationMock.push).not.toHaveBeenCalled();
    expect(toastTitles()).toEqual([]);
  });
});

describe('tải dữ liệu — lỗi và thử lại', () => {
  it('danh sách 500 → trạng thái lỗi có "Thử lại" (không toast); thử lại được thì hiện dòng', async () => {
    let failing = true;
    serve(() =>
      failing
        ? { status: 500, data: {} }
        : { status: 200, data: { data: { items: [DTO], total: 1 } } },
    );
    const user = userEvent.setup();
    renderWithQuery(<CustomerListView />, { pathname: '/demo/customers' });

    expect(await screen.findByText(t.state.loadFailed)).toBeInTheDocument();
    expect(screen.getByText('Lỗi máy chủ nội bộ')).toBeInTheDocument();
    expect(toastTitles()).toEqual([]);

    failing = false;
    await user.click(screen.getByRole('button', { name: t.state.retry }));

    expect(await screen.findByRole('link', { name: DTO.name })).toBeInTheDocument();
    expect(screen.queryByText(t.state.loadFailed)).not.toBeInTheDocument();
  });

  it('chi tiết 500 → trạng thái lỗi có "Thử lại"; 404 → "không tìm thấy" (không phải lỗi tải)', async () => {
    serve(() => ({ status: 500, data: {} }));
    const failed = renderWithQuery(<CustomerEditView />, {
      pathname: '/demo/customers/edit',
      search: '?id=7',
    });

    expect(await screen.findByText(t.state.loadFailed)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: t.state.retry })).toBeInTheDocument();
    failed.unmount();
    restore();

    serve(() => ({ status: 404, data: { error: { code: 'RES_001' } } }));
    renderWithQuery(<CustomerEditView />, { pathname: '/demo/customers/edit', search: '?id=7' });

    expect(await screen.findByText(t.state.notFoundTitle)).toBeInTheDocument();
    expect(screen.queryByText(t.state.loadFailed)).not.toBeInTheDocument();
  });

  it('BE trả tiền sai định dạng → lỗi hợp đồng (câu "dữ liệu không đúng định dạng"), không vẽ dòng hỏng', async () => {
    serve(() => ({
      status: 200,
      data: { data: { items: [{ ...DTO, credit_limit: 'mười triệu' }], total: 1 } },
    }));
    renderWithQuery(<CustomerListView />, { pathname: '/demo/customers' });

    expect(await screen.findByText(t.state.loadFailed)).toBeInTheDocument();
    expect(screen.getByText(viMessages.errors.http.contract)).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: DTO.name })).not.toBeInTheDocument();
  });
});

describe('xoá — lỗi từ máy chủ', () => {
  it('500 → bộ báo lỗi tập trung toast MỘT lần, hộp xác nhận ở lại để thử lại; thử lại xong thì đóng + làm mới', async () => {
    let failing = true;
    let deleted = false;
    serve(({ method }) => {
      if (method === 'DELETE') {
        if (failing) return { status: 500, data: {} };
        deleted = true;
        return { status: 204 };
      }
      return {
        status: 200,
        data: { data: { items: deleted ? [] : [DTO], total: deleted ? 0 : 1 } },
      };
    });
    const user = userEvent.setup();
    renderWithQuery(<CustomerListView />, { pathname: '/demo/customers' });
    await screen.findByRole('link', { name: DTO.name });

    await user.click(
      screen.getByRole('button', { name: t.actions.deleteAria.replace('{name}', DTO.name) }),
    );
    const dialog = await screen.findByRole('dialog');
    await user.click(within(dialog).getByRole('button', { name: t.delete.confirm }));

    await waitFor(() => expect(toastTitles()).toEqual(['Lỗi máy chủ nội bộ']));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByRole('link', { hidden: true, name: DTO.name })).toBeInTheDocument();

    failing = false;
    await user.click(
      within(screen.getByRole('dialog')).getByRole('button', { name: t.delete.confirm }),
    );

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    await waitFor(() =>
      expect(screen.queryByRole('link', { name: DTO.name })).not.toBeInTheDocument(),
    );
    expect(toastTitles()).toEqual(['Lỗi máy chủ nội bộ', t.delete.success]);
    expect(requests.filter(({ method }) => method === 'DELETE')).toHaveLength(2);
  });
});
