/**
 * `FormTabs` — form chia tab có badge đếm lỗi.
 *
 * Mỗi ca là một lỗi người dùng nhìn thấy được:
 *  - nút tab của FormTabs có style riêng, lệch khỏi `Tabs` của kit (tab đang chọn
 *    từng là một khối gần trắng, chữ không đọc được trên nền tối);
 *  - lỗi của field LỒNG (`address.city`) không được đếm;
 *  - gửi form hỏng mà lỗi nằm ở tab khác → người dùng không thấy lỗi nào.
 */

import { zodResolver } from '@hookform/resolvers/zod';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useForm } from 'react-hook-form';
import { describe, expect, it } from 'vitest';
import { z } from 'zod';

import { Form, FormTabs, Tabs, TextField } from '@/shared/ui';
import { renderInRouter, renderWithIntl } from '@tests/helpers/render';

const schema = z.object({
  fullName: z.string().trim().min(1, 'Bắt buộc'),
  email: z.string().trim().min(1, 'Bắt buộc'),
  company: z.object({ name: z.string().trim().min(1, 'Bắt buộc') }),
});
type Values = z.infer<typeof schema>;

const EMPTY: Values = { fullName: '', email: '', company: { name: '' } };
const noop = () => {};

function Harness({
  defaults = EMPTY,
  withHidden = false,
}: {
  defaults?: Values;
  withHidden?: boolean;
}) {
  const form = useForm<Values>({ defaultValues: defaults, resolver: zodResolver(schema) });
  return (
    <Form form={form} onSubmit={noop}>
      <FormTabs form={form}>
        <FormTabs.Panel fields={['fullName', 'email']} label="Cá nhân" value="personal">
          <TextField label="Họ tên" name="fullName" />
          <TextField label="Email" name="email" />
        </FormTabs.Panel>
        <FormTabs.Panel fields={['company.name']} label="Doanh nghiệp" value="business">
          <TextField label="Tên công ty" name="company.name" />
        </FormTabs.Panel>
        {withHidden && null}
        {false}
      </FormTabs>
      <button type="submit">Gửi</button>
    </Form>
  );
}

const tab = (name: string | RegExp) => screen.getByRole('tab', { name });
const submit = () => userEvent.click(screen.getByRole('button', { name: 'Gửi' }));

describe('FormTabs', () => {
  it('⛔ nút tab dùng ĐÚNG class của `Tabs` — không có style riêng để lệch', () => {
    const { unmount } = renderWithIntl(<Tabs options={[{ key: 'a', label: 'A' }]} />);
    const kitClassName = screen.getByRole('tab', { name: 'A' }).className;
    unmount();

    renderInRouter(<Harness />);
    expect(tab('Cá nhân').className).toBe(kitClassName);
    expect(tab('Cá nhân').className).not.toMatch(/primary-1|primary-7/);
  });

  it('tab đầu được chọn sẵn; chưa có lỗi thì không có badge', () => {
    renderInRouter(<Harness />);
    expect(tab('Cá nhân')).toHaveAttribute('aria-selected', 'true');
    expect(tab('Doanh nghiệp')).toHaveAttribute('aria-selected', 'false');
    expect(screen.getByLabelText('Họ tên')).toBeInTheDocument();
  });

  it('gửi form trống → mỗi tab đếm đúng số lỗi, kể cả field lồng `company.name`', async () => {
    renderInRouter(<Harness />);
    await submit();

    expect(await screen.findByRole('tab', { name: 'Cá nhân, 2 lỗi' })).toBeInTheDocument();
    expect(tab('Doanh nghiệp, 1 lỗi')).toBeInTheDocument();
  });

  it('tab đang mở có lỗi → ở lại tab đó', async () => {
    renderInRouter(<Harness />);
    await submit();

    expect(await screen.findByRole('tab', { name: 'Cá nhân, 2 lỗi' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
  });

  it('⛔ lỗi chỉ nằm ở tab KHÁC → tự nhảy sang tab đầu tiên có lỗi', async () => {
    renderInRouter(<Harness defaults={{ ...EMPTY, fullName: 'An', email: 'an@congty.vn' }} />);
    await submit();

    expect(await screen.findByRole('tab', { name: 'Doanh nghiệp, 1 lỗi' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect(screen.getByLabelText('Tên công ty')).toBeInTheDocument();
  });

  it('sau khi tự nhảy, người dùng vẫn đổi tab bằng tay được', async () => {
    renderInRouter(<Harness defaults={{ ...EMPTY, fullName: 'An', email: 'an@congty.vn' }} />);
    await submit();
    await screen.findByRole('tab', { name: 'Doanh nghiệp, 1 lỗi' });

    await userEvent.click(tab('Cá nhân'));
    expect(tab('Cá nhân')).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByLabelText('Họ tên')).toBeInTheDocument();
  });

  it('sửa xong lỗi rồi gửi lại → badge biến mất', async () => {
    renderInRouter(<Harness defaults={{ ...EMPTY, fullName: 'An', email: 'an@congty.vn' }} />);
    await submit();
    await userEvent.type(await screen.findByLabelText('Tên công ty'), 'Công ty A');
    await submit();

    expect(await screen.findByRole('tab', { name: 'Doanh nghiệp' })).toBeInTheDocument();
    expect(screen.queryByText(/lỗi$/)).not.toBeInTheDocument();
  });

  it('con `null` / `false` (tab ẩn theo điều kiện) không làm vỡ', () => {
    renderInRouter(<Harness withHidden />);
    expect(screen.getAllByRole('tab')).toHaveLength(2);
  });
});
