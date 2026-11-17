/**
 * Chữ mặc định của UI kit theo ngôn ngữ — mọi chuỗi người dùng thấy đều đi qua `useTranslations('ui.*')`.
 *
 * Các test cũ khoá chữ tiếng Việt (ngôn ngữ nguồn); file này khoá THÊM rằng đổi `locale` thì cùng component ra đúng
 * chữ tiếng Anh, và tiếng Việt vẫn giữ nguyên — một chuỗi còn viết cứng hoặc trỏ nhầm khoá sẽ lộ ở đây.
 */

import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import {
  Avatar,
  Badge,
  ConfirmDialog,
  DateTimePicker,
  SingleDatePicker,
  TimePicker,
} from '@/shared/ui';
import { renderWithIntl } from '@tests/helpers/render';

describe('ConfirmDialog — nhãn mặc định', () => {
  it('vi: "Xóa" + "Hủy bỏ"', () => {
    renderWithIntl(<ConfirmDialog open title="Xoá mục?" variant="delete" />);

    expect(screen.getByRole('button', { name: 'Xóa' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Hủy bỏ' })).toBeInTheDocument();
  });

  it('en: "Delete" + "Cancel"', () => {
    renderWithIntl(<ConfirmDialog open title="Delete item?" variant="delete" />, {
      locale: 'en',
    });

    expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Hủy bỏ' })).not.toBeInTheDocument();
  });

  it('nhãn truyền tay thắng nhãn mặc định ở mọi ngôn ngữ', () => {
    renderWithIntl(
      <ConfirmDialog actionLabel="Gỡ bỏ" cancelLabel="Quay lại" open title="Tiêu đề" />,
      { locale: 'en' },
    );

    expect(screen.getByRole('button', { name: 'Gỡ bỏ' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Quay lại' })).toBeInTheDocument();
  });
});

describe('Badge · Avatar — nhãn truy cập mặc định', () => {
  it('Badge onRemove: vi "Xoá …" · en "Remove …"', () => {
    const view = renderWithIntl(<Badge onRemove={() => undefined}>Mới</Badge>);
    expect(screen.getByRole('button', { name: 'Xoá Mới' })).toBeInTheDocument();
    view.unmount();

    renderWithIntl(<Badge onRemove={() => undefined}>New</Badge>, { locale: 'en' });
    expect(screen.getByRole('button', { name: 'Remove New' })).toBeInTheDocument();
  });

  it('Avatar bấm được, không tên: vi "Ảnh đại diện" · en "Profile picture"', () => {
    const view = renderWithIntl(<Avatar onClick={() => undefined} />);
    expect(screen.getByRole('button', { name: 'Ảnh đại diện' })).toBeInTheDocument();
    view.unmount();

    renderWithIntl(<Avatar onClick={() => undefined} />, { locale: 'en' });
    expect(screen.getByRole('button', { name: 'Profile picture' })).toBeInTheDocument();
  });
});

describe('Picker — chữ trong panel', () => {
  it('TimePicker: tiêu đề cột vi "Giờ" / "Phút" · en "Hour" / "Minute"', () => {
    const view = renderWithIntl(<TimePicker allowManualInput={false} />);
    fireEvent.keyDown(screen.getByText('HH:mm').closest('[role="button"]') as HTMLElement, {
      key: 'Enter',
    });
    expect(screen.getByText('Giờ')).toBeInTheDocument();
    expect(screen.getByText('Phút')).toBeInTheDocument();
    view.unmount();

    renderWithIntl(<TimePicker allowManualInput={false} />, { locale: 'en' });
    fireEvent.keyDown(screen.getByText('HH:mm').closest('[role="button"]') as HTMLElement, {
      key: 'Enter',
    });
    expect(screen.getByText('Hour')).toBeInTheDocument();
    expect(screen.getByText('Minute')).toBeInTheDocument();
  });

  it('DateTimePicker: nút chốt vi "Xác nhận" · en "Confirm"', () => {
    const view = renderWithIntl(<DateTimePicker />);
    fireEvent.keyDown(
      screen.getByText('DD/MM/YYYY HH:mm').closest('[role="button"]') as HTMLElement,
      { key: 'Enter' },
    );
    expect(screen.getByRole('button', { name: 'Xác nhận' })).toBeInTheDocument();
    view.unmount();

    renderWithIntl(<DateTimePicker />, { locale: 'en' });
    fireEvent.keyDown(
      screen.getByText('DD/MM/YYYY HH:mm').closest('[role="button"]') as HTMLElement,
      { key: 'Enter' },
    );
    expect(screen.getByRole('button', { name: 'Confirm' })).toBeInTheDocument();
  });

  it('SingleDatePicker: lịch đổi tên thứ và nút chuyển tháng theo ngôn ngữ', () => {
    const view = renderWithIntl(<SingleDatePicker value={new Date(2026, 5, 15)} />);
    fireEvent.focus(screen.getByPlaceholderText('DD/MM/YYYY'));
    expect(screen.getByRole('button', { name: 'Tháng trước' })).toBeInTheDocument();
    view.unmount();

    renderWithIntl(<SingleDatePicker value={new Date(2026, 5, 15)} />, { locale: 'en' });
    fireEvent.focus(screen.getByPlaceholderText('DD/MM/YYYY'));
    expect(screen.getByRole('button', { name: 'Previous month' })).toBeInTheDocument();
    expect(screen.getByText('Mo')).toBeInTheDocument();
  });
});
