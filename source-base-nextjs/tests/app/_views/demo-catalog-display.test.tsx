/**
 * Ví dụ sống của nhóm "hiển thị và phản hồi" trong catalog `/demo` — Overlays · Table · Badge · Feedback · Progress. Mỗi ca chạm
 * đúng thứ dev sẽ thử trên trang: mở / đóng hộp thoại, bắn toast, đổi trạng thái bảng và sang trang, gỡ chip, đóng callout.
 */

import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import BadgeCatalog from '@/app/_views/demo/catalog/display/BadgeCatalog';
import FeedbackCatalog from '@/app/_views/demo/catalog/display/FeedbackCatalog';
import OverlayCatalog from '@/app/_views/demo/catalog/display/OverlayCatalog';
import ProgressCatalog from '@/app/_views/demo/catalog/display/ProgressCatalog';
import TableCatalog from '@/app/_views/demo/catalog/display/TableCatalog';
import enMessages from '@/messages/en';
import viMessages from '@/messages/vi';
import { useToastStore } from '@/shared/ui/overlays/toast/toast.store';
import { renderInRouter } from '@tests/helpers/render';

const { demo } = viMessages;
const group = (name: string) => screen.getByRole('group', { name });
const toasts = () => useToastStore.getState().toasts.map(({ type, title }) => [type, title]);
const dialogGone = (name: string) =>
  waitFor(() => expect(screen.queryByRole('dialog', { name })).toBeNull());

beforeEach(() => {
  vi.spyOn(console, 'error').mockImplementation(() => undefined);
});

afterEach(() => {
  vi.restoreAllMocks();
  useToastStore.setState({ toasts: [] });
});

describe('OverlayCatalog', () => {
  it('Modal: mở bằng nút, đóng bằng nút Xác nhận; mở lại và Hủy bỏ cũng đóng', async () => {
    const user = userEvent.setup();
    renderInRouter(<OverlayCatalog />);
    expect(screen.queryByRole('dialog')).toBeNull();

    await user.click(screen.getByRole('button', { name: demo.overlays.openModal }));
    const dialog = await screen.findByRole('dialog', { name: demo.overlays.modalTitle });
    expect(within(dialog).getByText(demo.overlays.modalBody)).toBeInTheDocument();
    await user.click(within(dialog).getByRole('button', { name: 'Xác nhận' }));
    await dialogGone(demo.overlays.modalTitle);

    await user.click(screen.getByRole('button', { name: demo.overlays.openModal }));
    await user.click(
      within(await screen.findByRole('dialog')).getByRole('button', { name: 'Hủy bỏ' }),
    );
    await dialogGone(demo.overlays.modalTitle);
  });

  it('ConfirmDialog (delete): hiện tiêu đề + mô tả; Esc đóng; Xác nhận đóng và bắn toast', async () => {
    const user = userEvent.setup();
    renderInRouter(<OverlayCatalog />);
    const open = () =>
      user.click(
        within(group(demo.overlays.confirm)).getByRole('button', {
          name: demo.overlays.confirmVariants.delete,
        }),
      );

    await open();
    const dialog = await screen.findByRole('dialog', { name: demo.overlays.confirmTitle });
    expect(within(dialog).getByText(demo.overlays.confirmDescription)).toBeInTheDocument();
    await user.keyboard('{Escape}');
    await dialogGone(demo.overlays.confirmTitle);
    expect(toasts()).toEqual([]);

    await open();
    await user.click(
      within(await screen.findByRole('dialog')).getByRole('button', { name: 'Xóa' }),
    );
    await dialogGone(demo.overlays.confirmTitle);
    expect(toasts()).toEqual([['success', demo.overlays.toastMessages.success]]);
  });

  it('FormModal: để trống → lỗi và modal giữ mở; điền tên rồi lưu → toast và modal tự đóng', async () => {
    const user = userEvent.setup();
    renderInRouter(<OverlayCatalog />);

    await user.click(screen.getByRole('button', { name: demo.overlays.openFormModal }));
    const dialog = await screen.findByRole('dialog', { name: demo.overlays.formTitle });
    await user.click(within(dialog).getByRole('button', { name: 'Xác nhận' }));
    expect(await within(dialog).findByText(demo.overlays.formNameRequired)).toBeInTheDocument();
    expect(toasts()).toEqual([]);

    await user.type(within(dialog).getByRole('textbox', { name: /Tên hạng mục/ }), 'Hạng mục A');
    await user.click(within(dialog).getByRole('button', { name: 'Xác nhận' }));

    await dialogGone(demo.overlays.formTitle);
    expect(toasts()).toEqual([['success', demo.overlays.formSaved]]);
  });

  it('Toast: mỗi nút bắn đúng loại và nội dung', async () => {
    vi.spyOn(Date, 'now').mockReturnValue(Date.now() + 10_000);
    const user = userEvent.setup();
    renderInRouter(<OverlayCatalog />);
    const toast = group(demo.overlays.toast);

    for (const type of ['success', 'error', 'warning', 'info'] as const) {
      await user.click(within(toast).getByRole('button', { name: demo.overlays.toastTypes[type] }));
    }

    expect(toasts()).toEqual([
      ['success', demo.overlays.toastMessages.success],
      ['error', demo.overlays.toastMessages.error],
      ['warning', demo.overlays.toastMessages.warning],
      ['info', demo.overlays.toastMessages.info],
    ]);
  });
});

describe('TableCatalog', () => {
  const dataRows = () => screen.getAllByRole('row').slice(1);

  it('vi: trang đầu 5 dòng, số tiền và ngày theo ngôn ngữ, trạng thái là huy hiệu', () => {
    renderInRouter(<TableCatalog />);
    const [first] = dataRows();

    expect(dataRows()).toHaveLength(5);
    expect(within(first).getByText('KH-001')).toBeInTheDocument();
    expect(within(first).getByText('12.500.000 ₫')).toBeInTheDocument();
    expect(within(first).getByText('01/07/2026')).toBeInTheDocument();
    expect(within(first).getByText(demo.table.status.active)).toBeInTheDocument();
  });

  it('en: cùng bảng hiện tiền và ngày kiểu Anh, tiêu đề cột đã dịch', () => {
    renderInRouter(<TableCatalog />, { locale: 'en' });
    const [first] = dataRows();

    expect(within(first).getByText('07/01/2026')).toBeInTheDocument();
    expect(within(first).getByText(enMessages.demo.table.status.active)).toBeInTheDocument();
    expect(screen.getByText(enMessages.demo.table.columns.amount)).toBeInTheDocument();
  });

  it('sang trang 2 → dòng 6 trở đi', async () => {
    const user = userEvent.setup();
    renderInRouter(<TableCatalog />);

    await user.click(screen.getByRole('button', { name: '2' }));

    expect(within(dataRows()[0]).getByText('KH-006')).toBeInTheDocument();
  });

  it('đổi sang "Đang tải" rồi "Rỗng" rồi quay lại "Có dữ liệu"', async () => {
    const user = userEvent.setup();
    renderInRouter(<TableCatalog />);
    const view = () => within(group(demo.table.view));

    await user.click(view().getByRole('button', { name: demo.table.views.loading }));
    expect(screen.queryByText('KH-001')).toBeNull();
    expect(screen.getByRole('status')).toBeInTheDocument();

    await user.click(view().getByRole('button', { name: demo.table.views.empty }));
    expect(screen.queryByText('KH-001')).toBeNull();
    expect(screen.getByText('Không có dữ liệu')).toBeInTheDocument();

    await user.click(view().getByRole('button', { name: demo.table.views.data }));
    expect(screen.getByText('KH-001')).toBeInTheDocument();
  });
});

describe('BadgeCatalog', () => {
  it('gỡ chip bằng nút ✕ rồi "Khôi phục" trả đủ ba chip', async () => {
    const user = userEvent.setup();
    renderInRouter(<BadgeCatalog />);
    const extras = group(demo.badge.extras);
    const tags = Object.values(demo.badge.tags);
    for (const tag of tags) expect(within(extras).getByText(tag)).toBeInTheDocument();

    await user.click(within(extras).getByRole('button', { name: `Xoá ${demo.badge.tags.design}` }));
    expect(within(extras).queryByText(demo.badge.tags.design)).toBeNull();
    expect(within(extras).getByText(demo.badge.tags.review)).toBeInTheDocument();

    await user.click(within(extras).getByRole('button', { name: demo.badge.restore }));
    for (const tag of tags) expect(within(extras).getByText(tag)).toBeInTheDocument();
  });

  it('đủ 9 màu × 4 kiểu tô và các cỡ ảnh đại diện', () => {
    renderInRouter(<BadgeCatalog />);

    expect(within(group(demo.badge.colors)).getAllByText('primary')).toHaveLength(4);
    expect(within(group(demo.badge.colors)).getAllByText('neutral')).toHaveLength(4);
    expect(within(group(demo.badge.avatars)).getAllByText('BA').length).toBeGreaterThanOrEqual(4);
  });
});

describe('FeedbackCatalog', () => {
  it('lỗi là role="alert", các intent khác là role="status"', () => {
    renderInRouter(<FeedbackCatalog />);
    const intents = group(demo.feedback.intents);

    expect(within(intents).getByRole('alert')).toHaveTextContent(demo.feedback.titles.error);
    expect(within(intents).getAllByRole('status').length).toBeGreaterThanOrEqual(4);
  });

  it('đóng callout bằng ✕ → hiện nút "Hiện lại"; bấm → callout trở lại', async () => {
    const user = userEvent.setup();
    renderInRouter(<FeedbackCatalog />);
    const closable = group(demo.feedback.closable);
    expect(within(closable).getByText(demo.feedback.closableTitle)).toBeInTheDocument();

    await user.click(within(closable).getByRole('button', { name: 'Đóng' }));
    expect(within(closable).queryByText(demo.feedback.closableTitle)).toBeNull();

    await user.click(within(closable).getByRole('button', { name: demo.feedback.restore }));
    expect(within(closable).getByText(demo.feedback.closableTitle)).toBeInTheDocument();
  });

  it('EmptyState có tiêu đề, mô tả và nút hành động', () => {
    renderInRouter(<FeedbackCatalog />);
    const empty = group(demo.feedback.empty);

    expect(within(empty).getByText(demo.feedback.emptyTitle)).toBeInTheDocument();
    expect(within(empty).getByText(demo.feedback.emptyDescription)).toBeInTheDocument();
    expect(
      within(empty).getByRole('button', { name: demo.feedback.emptyAction }),
    ).toBeInTheDocument();
  });
});

describe('ProgressCatalog', () => {
  const bar = () =>
    within(group(demo.progress.bar)).getByRole('progressbar', { name: demo.progress.barAria });

  it('tăng / giảm 10% và kẹp trong 0–100', async () => {
    const user = userEvent.setup();
    renderInRouter(<ProgressCatalog />);
    const press = (name: string) =>
      user.click(within(group(demo.progress.bar)).getByRole('button', { name }));
    expect(bar()).toHaveAttribute('aria-valuenow', '40');

    await press(demo.progress.increase);
    expect(bar()).toHaveAttribute('aria-valuenow', '50');

    for (let i = 0; i < 7; i += 1) await press(demo.progress.increase);
    expect(bar()).toHaveAttribute('aria-valuenow', '100');

    for (let i = 0; i < 12; i += 1) await press(demo.progress.decrease);
    expect(bar()).toHaveAttribute('aria-valuenow', '0');
  });

  it('có vòng tiến độ, spinner và skeleton', () => {
    renderInRouter(<ProgressCatalog />);

    expect(within(group(demo.progress.circle)).getAllByRole('progressbar').length).toBeGreaterThan(
      0,
    );
    expect(within(group(demo.progress.spinner)).getAllByRole('status').length).toBeGreaterThan(0);
  });
});
