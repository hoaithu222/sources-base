/**
 * Luồng CRUD của `src/features/customers` chạy trên "máy chủ demo" trong bộ nhớ (`customers-demo-adapter`) — hàm API, interceptor,
 * `readData` + schema, mapping và React Query đều là bản THẬT; chỉ tầng mạng được thay.
 *
 *  - Bộ lọc / trang sống trên URL: đọc từ query, gõ tìm kiếm ghi lại `router.replace`.
 *  - Sửa → lưu → danh sách ĐANG MỞ làm mới (invalidate `lists()`), có toast thành công + về danh sách.
 *  - Tạo mới đi vào danh sách; xoá có hộp xác nhận, xong danh sách làm mới.
 *  - Trạng thái rỗng khi bộ lọc không khớp, có đường "Xoá bộ lọc".
 */

import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';

import { resetCustomersDemo } from '@/features/customers/api/customers-demo-adapter';
import { CustomerCreateView, CustomerEditView, CustomerListView } from '@/features/customers';
import viMessages from '@/messages/vi';
import { useToastStore } from '@/shared/ui/overlays/toast/toast.store';
import { navigationMock } from '@tests/helpers/navigation-mock';
import { renderWithQuery } from '@tests/helpers/render-with-query';

const t = viMessages.customers;
const LIST_PATH = '/demo/customers';

const toastTitles = () => useToastStore.getState().toasts.map((toast) => toast.title);

const inputNamed = (container: HTMLElement, name: string) => {
  const input = container.querySelector<HTMLInputElement>(`input[name="${name}"]`);
  if (!input) throw new Error(`Không thấy ô "${name}"`);
  return input;
};

beforeEach(() => {
  resetCustomersDemo({ latencyMs: 0 });
  useToastStore.setState({ toasts: [] });
});

describe('CustomerListView — bộ lọc trên URL', () => {
  it('trang 1 hiện 12 dòng mới nhất trước; `?page=2` hiện 3 dòng còn lại', async () => {
    const first = renderWithQuery(<CustomerListView />, { pathname: LIST_PATH });

    expect(await screen.findByText('Công ty CP Phần mềm Sao Mai')).toBeInTheDocument();
    expect(screen.queryByText('Công ty TNHH Thép Việt Nhật')).not.toBeInTheDocument();
    first.unmount();

    renderWithQuery(<CustomerListView />, { pathname: LIST_PATH, search: '?page=2' });

    expect(await screen.findByText('Công ty TNHH Thép Việt Nhật')).toBeInTheDocument();
    expect(screen.queryByText('Công ty CP Phần mềm Sao Mai')).not.toBeInTheDocument();
  });

  it('`?page=` vượt quá trang cuối → tự lùi về trang cuối bằng `router.replace`', async () => {
    renderWithQuery(<CustomerListView />, { pathname: LIST_PATH, search: '?page=99' });

    await waitFor(() =>
      expect(navigationMock.replace).toHaveBeenCalledWith(`${LIST_PATH}?page=2`, {
        scroll: false,
      }),
    );
  });

  it('`?search=` khớp KHÔNG dấu, không phân biệt hoa thường, trên cả mã lẫn tên', async () => {
    renderWithQuery(<CustomerListView />, { pathname: LIST_PATH, search: '?search=THEP viet' });

    expect(await screen.findByText('Công ty TNHH Thép Việt Nhật')).toBeInTheDocument();
    expect(screen.queryByText('Công ty CP Phần mềm Sao Mai')).not.toBeInTheDocument();
  });

  it('`?status=inactive` chỉ còn khách ngừng giao dịch; giá trị rác thì không lọc', async () => {
    const inactive = renderWithQuery(<CustomerListView />, {
      pathname: LIST_PATH,
      search: '?status=inactive',
    });

    expect(await screen.findByText('Nhà máy Nhựa Đông Á')).toBeInTheDocument();
    expect(screen.queryByText('Công ty CP Phần mềm Sao Mai')).not.toBeInTheDocument();
    inactive.unmount();

    renderWithQuery(<CustomerListView />, { pathname: LIST_PATH, search: '?status=lung-tung' });

    expect(await screen.findByText('Công ty CP Phần mềm Sao Mai')).toBeInTheDocument();
  });

  it('gõ vào ô tìm kiếm ghi `?search=` bằng `router.replace` (không thêm mục lịch sử)', async () => {
    const user = userEvent.setup();
    renderWithQuery(<CustomerListView />, { pathname: LIST_PATH });
    await screen.findByText('Công ty CP Phần mềm Sao Mai');

    await user.type(screen.getByRole('textbox', { name: t.list.searchAria }), 'thep');

    expect(navigationMock.replace).toHaveBeenLastCalledWith(`${LIST_PATH}?search=thep&page=1`, {
      scroll: false,
    });
    expect(navigationMock.push).not.toHaveBeenCalled();
  });

  it('bộ lọc không khớp → trạng thái "không có kết quả" + nút xoá bộ lọc về URL sạch', async () => {
    const user = userEvent.setup();
    renderWithQuery(<CustomerListView />, { pathname: LIST_PATH, search: '?search=khong-ton-tai' });

    expect(await screen.findByText(t.list.noMatchTitle)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: t.list.clearFilters }));

    expect(navigationMock.replace).toHaveBeenLastCalledWith(LIST_PATH, { scroll: false });
  });

  it('tên khách là liên kết thật tới trang sửa, nút thêm là liên kết tới trang tạo', async () => {
    renderWithQuery(<CustomerListView />, { pathname: LIST_PATH });

    expect(
      await screen.findByRole('link', { name: 'Công ty CP Phần mềm Sao Mai' }),
    ).toHaveAttribute('href', '/demo/customers/edit?id=15');
    expect(screen.getByRole('link', { name: t.list.create })).toHaveAttribute(
      'href',
      '/demo/customers/new',
    );
  });
});

describe('sửa → lưu → danh sách làm mới', () => {
  it('đổi tên rồi lưu: toast "đã lưu", về danh sách, và danh sách đang mở hiện tên mới', async () => {
    const user = userEvent.setup();
    const { container } = renderWithQuery(
      <>
        <CustomerListView />
        <CustomerEditView />
      </>,
      { pathname: LIST_PATH, search: '?id=10' },
    );
    expect(
      await screen.findByRole('link', { name: 'Công ty TNHH Dược phẩm Hoàng Long' }),
    ).toBeVisible();
    await waitFor(() =>
      expect(inputNamed(container, 'name')).toHaveValue('Công ty TNHH Dược phẩm Hoàng Long'),
    );

    const name = inputNamed(container, 'name');
    await user.clear(name);
    await user.type(name, 'Công ty Dược Mới');
    await user.click(screen.getByRole('button', { name: t.form.save }));

    await waitFor(() => expect(navigationMock.push).toHaveBeenCalledWith(LIST_PATH));
    expect(toastTitles()).toEqual([t.form.updated]);
    expect(await screen.findByRole('link', { name: 'Công ty Dược Mới' })).toBeInTheDocument();
    expect(
      screen.queryByRole('link', { name: 'Công ty TNHH Dược phẩm Hoàng Long' }),
    ).not.toBeInTheDocument();
  });

  it('tên chỉ có khoảng trắng → báo "không được để trống" và KHÔNG gọi lưu', async () => {
    const user = userEvent.setup();
    const { container } = renderWithQuery(<CustomerEditView />, {
      pathname: '/demo/customers/edit',
      search: '?id=2',
    });
    await waitFor(() => expect(inputNamed(container, 'code')).toHaveValue('KH002'));

    await user.clear(inputNamed(container, 'name'));
    await user.type(inputNamed(container, 'name'), '   ');
    await user.click(screen.getByRole('button', { name: t.form.save }));

    expect(
      await screen.findByText(viMessages.customers.validation.nameRequired),
    ).toBeInTheDocument();
    expect(navigationMock.push).not.toHaveBeenCalled();
    expect(toastTitles()).toEqual([]);
  });

  it('`?id=` rác → màn "không tìm thấy" có đường về danh sách, không có form', () => {
    renderWithQuery(<CustomerEditView />, { pathname: '/demo/customers/edit', search: '?id=abc' });

    expect(screen.getByText(t.state.notFoundTitle)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: t.state.backToList })).toHaveAttribute(
      'href',
      LIST_PATH,
    );
    expect(screen.queryByRole('button', { name: t.form.save })).not.toBeInTheDocument();
  });

  it('id đúng định dạng nhưng máy chủ trả 404 → cũng là màn "không tìm thấy"', async () => {
    renderWithQuery(<CustomerEditView />, { pathname: '/demo/customers/edit', search: '?id=999' });

    expect(await screen.findByText(t.state.notFoundTitle)).toBeInTheDocument();
  });
});

describe('tạo mới', () => {
  it('điền form và lưu: toast "đã tạo" rồi về danh sách; khách mới đứng đầu danh sách', async () => {
    const user = userEvent.setup();
    const created = renderWithQuery(<CustomerCreateView />, { pathname: '/demo/customers/new' });

    await user.type(inputNamed(created.container, 'code'), 'KH016');
    await user.type(inputNamed(created.container, 'name'), 'Công ty Khách Mới');
    await user.type(inputNamed(created.container, 'email'), 'moi@khachmoi.vn');
    await user.click(screen.getByRole('button', { name: t.form.create }));

    await waitFor(() => expect(navigationMock.push).toHaveBeenCalledWith(LIST_PATH));
    expect(toastTitles()).toEqual([t.form.created]);
    created.unmount();

    renderWithQuery(<CustomerListView />, {
      pathname: LIST_PATH,
      queryClient: created.queryClient,
    });
    expect(await screen.findByRole('link', { name: 'Công ty Khách Mới' })).toBeInTheDocument();
  });

  it('mã đã có (409) → lỗi ở ô mã, giữ nguyên dữ liệu đã nhập, không điều hướng, không toast', async () => {
    const user = userEvent.setup();
    const { container } = renderWithQuery(<CustomerCreateView />, {
      pathname: '/demo/customers/new',
    });

    await user.type(inputNamed(container, 'code'), 'kh001');
    await user.type(inputNamed(container, 'name'), 'Công ty Trùng Mã');
    await user.type(inputNamed(container, 'email'), 'trung@example.com');
    await user.click(screen.getByRole('button', { name: t.form.create }));

    expect(await screen.findByText(t.form.codeTaken)).toBeInTheDocument();
    expect(inputNamed(container, 'name')).toHaveValue('Công ty Trùng Mã');
    expect(navigationMock.push).not.toHaveBeenCalled();
    expect(toastTitles()).toEqual([]);
  });
});

describe('xoá', () => {
  it('xác nhận xoá: toast "đã xoá", hộp đóng, danh sách làm mới không còn dòng đó', async () => {
    const user = userEvent.setup();
    renderWithQuery(<CustomerListView />, { pathname: LIST_PATH });
    await screen.findByRole('link', { name: 'Công ty CP Phần mềm Sao Mai' });

    await user.click(
      screen.getByRole('button', {
        name: t.actions.deleteAria.replace('{name}', 'Công ty CP Phần mềm Sao Mai'),
      }),
    );
    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByText(/Công ty CP Phần mềm Sao Mai/)).toBeInTheDocument();
    await user.click(within(dialog).getByRole('button', { name: t.delete.confirm }));

    await waitFor(() => expect(toastTitles()).toEqual([t.delete.success]));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    await waitFor(() =>
      expect(
        screen.queryByRole('link', { name: 'Công ty CP Phần mềm Sao Mai' }),
      ).not.toBeInTheDocument(),
    );
  });

  it('huỷ ở hộp xác nhận: không xoá gì', async () => {
    const user = userEvent.setup();
    renderWithQuery(<CustomerListView />, { pathname: LIST_PATH });
    await screen.findByRole('link', { name: 'Công ty CP Phần mềm Sao Mai' });

    await user.click(
      screen.getByRole('button', {
        name: t.actions.deleteAria.replace('{name}', 'Công ty CP Phần mềm Sao Mai'),
      }),
    );
    await user.click(
      within(await screen.findByRole('dialog')).getByRole('button', { name: 'Hủy bỏ' }),
    );

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(screen.getByRole('link', { name: 'Công ty CP Phần mềm Sao Mai' })).toBeInTheDocument();
    expect(toastTitles()).toEqual([]);
  });
});
