/**
 * Quyền trong `src/features/customers` khi kiểm đăng nhập BẬT — quyền chỉ điều khiển GIAO DIỆN (ẩn nút, form chỉ đọc); quyền thật do
 * BE kiểm trên từng API. Hai nơi khai quyền phải khớp: `navigation.config.ts` (ẩn mục menu) và `PermissionGate` ở route (chặn trang).
 *
 *  - `customer:create` → nút "Thêm khách hàng" · `customer:delete` → cột nút xoá · `customer:update` → form sửa ghi được + nút lưu.
 *  - Thiếu quyền ghi: form chỉ đọc kèm thông báo, không có nút lưu (xem được nhưng không sửa được).
 *  - Cấu hình điều hướng ↔ `PermissionGate` ở `layout.tsx` / `page.tsx` của từng màn.
 */

import { screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { NAV_MODULES } from '@/app/_navigation';
import { useSessionStore } from '@/domains/session';
import { resetCustomersDemo } from '@/features/customers/api/customers-demo-adapter';
import { CustomerEditView, CustomerListView } from '@/features/customers';
import viMessages from '@/messages/vi';
import { PATHS } from '@/shared/constants/paths.constants';
import { SOURCE_CODE } from '@tests/helpers/source-files';
import { renderWithQuery } from '@tests/helpers/render-with-query';

vi.mock('@/core/config', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/core/config')>();
  return { ...actual, appConfig: { ...actual.appConfig, authEnabled: true } };
});

const t = viMessages.customers;
const DELETE_ARIA = t.actions.deleteAria.replace('{name}', 'Công ty CP Phần mềm Sao Mai');

const signInWith = (...permissions: string[]) =>
  useSessionStore.setState({
    status: 'authenticated',
    user: { id: 'u1', email: 'an@congty.vn', name: 'An', roles: [], permissions },
  });

beforeEach(() => {
  resetCustomersDemo({ latencyMs: 0 });
  useSessionStore.setState(useSessionStore.getInitialState(), true);
});

describe('danh sách', () => {
  it('chỉ có quyền xem: có dòng, KHÔNG có nút thêm, KHÔNG có nút xoá', async () => {
    signInWith('customer:view');
    renderWithQuery(<CustomerListView />, { pathname: PATHS.DEMO_CUSTOMERS });

    expect(await screen.findByRole('link', { name: 'Công ty CP Phần mềm Sao Mai' })).toBeVisible();
    expect(screen.queryByRole('link', { name: t.list.create })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: DELETE_ARIA })).not.toBeInTheDocument();
  });

  it('có `customer:create` + `customer:delete`: hiện nút thêm và nút xoá từng dòng', async () => {
    signInWith('customer:view', 'customer:create', 'customer:delete');
    renderWithQuery(<CustomerListView />, { pathname: PATHS.DEMO_CUSTOMERS });

    expect(await screen.findByRole('button', { name: DELETE_ARIA })).toBeVisible();
    expect(screen.getByRole('link', { name: t.list.create })).toHaveAttribute(
      'href',
      PATHS.DEMO_CUSTOMER_NEW,
    );
  });
});

describe('trang sửa', () => {
  const edit = () =>
    renderWithQuery(<CustomerEditView />, { pathname: PATHS.DEMO_CUSTOMER_EDIT, search: '?id=2' });

  it('chỉ có quyền xem: form chỉ đọc + thông báo, KHÔNG có ô nhập, KHÔNG có nút lưu', async () => {
    signInWith('customer:view');
    const { container } = edit();

    expect(await screen.findByText(t.form.readOnly)).toBeInTheDocument();
    expect(await screen.findByText('Công ty CP Vận tải Sông Hồng')).toBeInTheDocument();
    expect(container.querySelector('input[name="name"]')).toBeNull();
    expect(screen.queryByRole('button', { name: t.form.save })).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Hủy bỏ' })).toHaveAttribute(
      'href',
      PATHS.DEMO_CUSTOMERS,
    );
  });

  it('có `customer:update`: ô nhập ghi được và có nút lưu', async () => {
    signInWith('customer:view', 'customer:update');
    const { container } = edit();

    await waitFor(() =>
      expect(container.querySelector('input[name="name"]')).toHaveValue(
        'Công ty CP Vận tải Sông Hồng',
      ),
    );
    expect(screen.getByRole('button', { name: t.form.save })).toBeInTheDocument();
    expect(screen.queryByText(t.form.readOnly)).not.toBeInTheDocument();
  });
});

describe('khai quyền ở hai nơi phải khớp', () => {
  const demo = NAV_MODULES.find((module) => module.id === 'demo');
  const ROUTE_DIR = 'src/app/[locale]/(workspace)/(app)/demo/customers';
  const gateOf = (file: string) =>
    /<PermissionGate permission=\{\{([^}]*)\}\}/
      .exec(SOURCE_CODE[`${ROUTE_DIR}/${file}`])?.[1]
      ?.replace(/\s+/g, ' ')
      .trim();

  it('màn danh sách: `permission` ở menu = `PermissionGate` của `layout.tsx` (cả nhóm route)', () => {
    const screen = demo?.screens.find((item) => item.id === 'demoCustomers');

    expect(screen?.permission).toEqual({ resource: 'customer' });
    expect(gateOf('layout.tsx')).toBe("resource: 'customer'");
  });

  it('màn thêm: quyền THÊM `customer:create` khai ở cả menu lẫn `PermissionGate` của `new/page.tsx`', () => {
    const screen = demo?.screens.find((item) => item.id === 'demoCustomerNew');

    expect(screen?.permission).toEqual({ resource: 'customer', action: 'create' });
    expect(gateOf('new/page.tsx')).toBe("resource: 'customer', action: 'create'");
  });
});
