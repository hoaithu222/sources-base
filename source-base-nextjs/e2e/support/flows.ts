import type { Locator, Page } from '@playwright/test';

import { E2E_ACCOUNT } from './fake-api';
import type { FakeApi } from './fake-api';
import { vi } from './messages';
import { expect } from './test';

/**
 * Các thao tác dùng chung của nhiều kịch bản — mỗi hàm là MỘT hành vi người dùng, dùng chữ dịch thật (`messages.ts`).
 */

/**
 * Tiêu đề mục "Phân hệ" của bàn làm việc — chỉ hiện SAU khi phiên đã khôi phục (server luôn dựng màn chờ), nên thấy nó là
 * bằng chứng trang đã hydrate và `AuthGate` cho vào.
 */
export const dashboardMarker = (page: Page) =>
  page.getByRole('heading', { name: vi('shell.dashboard.modules'), exact: true });

/**
 * Chờ phần tử được React HYDRATE (đã gắn handler). React ghi khoá `__reactProps$…` lên node DOM đúng lúc hydrate — chưa có
 * khoá đó mà click thì trình duyệt chạy hành vi thuần của thẻ (liên kết đi thẳng, form gửi GET), không phải `onClick` /
 * `onSubmit` của React. Cần khi hành vi KHÁC giữa hai trường hợp (vd chuyển ngôn ngữ ghi cookie trong `onClick`).
 */
export async function expectHydrated(target: Locator): Promise<void> {
  await expect
    .poll(
      () =>
        target.evaluate((element) =>
          Object.keys(element).some((key) => key.startsWith('__reactProps$')),
        ),
      { message: 'Phần tử chưa được React hydrate' },
    )
    .toBe(true);
}

/**
 * Điền và gửi form đăng nhập bằng đúng nhãn người dùng thấy.
 *
 * Chờ `GuestGate` hỏi phiên (một lượt refresh) trước khi gõ: lượt đó chạy trong effect nên chắc chắn form đã hydrate —
 * bấm gửi quá sớm thì trình duyệt gửi form kiểu thuần (GET) thay vì handler của React.
 */
export async function submitLoginForm(page: Page, api: FakeApi): Promise<void> {
  await expect
    .poll(() => api.calls.refresh, { message: 'GuestGate chưa hỏi phiên — trang chưa hydrate' })
    .toBeGreaterThan(0);

  await page
    .getByRole('textbox', { name: vi('auth.login.email'), exact: true })
    .fill(E2E_ACCOUNT.email);
  await page
    .getByRole('textbox', { name: vi('auth.login.password'), exact: true })
    .fill(E2E_ACCOUNT.password);
  await page.getByRole('button', { name: vi('auth.login.submit') }).click();
}

/** Mọi cặp khoá → giá trị của localStorage (chuỗi thô), để kiểm cái gì được lưu / không được lưu. */
export const readLocalStorage = (page: Page): Promise<Record<string, string>> =>
  page.evaluate(() => Object.fromEntries(Object.entries(localStorage)));
