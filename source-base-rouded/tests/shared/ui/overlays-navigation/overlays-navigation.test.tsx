/**
 * Nhóm lớp nổi + điều hướng của UI kit (overlays · navigation) — các lỗi đã ghi trong
 * `docs/known-issues.md`, an toàn bất đồng bộ của FormModal (`docs/rules/data/async-safety.md`)
 * và hành vi React 19 (`ref` là prop thường) sau khi bỏ `forwardRef`.
 */

import { createRef, useState } from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useForm } from 'react-hook-form';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createDeferred } from '@tests/helpers/deferred';

import {
  Button,
  ConfirmDialog,
  Drawer,
  FormModal,
  Input,
  Modal,
  Pagination,
  Stepper,
  TextField,
  Toast,
  ToastProvider,
  ToastViewport,
} from '@/shared/ui';

const noop = () => {};

beforeEach(() => {
  vi.spyOn(console, 'error').mockImplementation(() => {});
  vi.spyOn(console, 'warn').mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('ConfirmDialog — nút Huỷ', () => {
  it('controlled: bấm Huỷ gọi onOpenChange(false) đúng MỘT lần, onCancel một lần', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    const onCancel = vi.fn();
    render(<ConfirmDialog open title="Xoá mục?" onCancel={onCancel} onOpenChange={onOpenChange} />);

    await user.click(screen.getByRole('button', { name: 'Hủy bỏ' }));

    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onOpenChange).toHaveBeenCalledTimes(1);
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('onOpenChange kiểu bật/tắt vẫn đóng được (không bị bắn hai lần làm mở lại)', async () => {
    const user = userEvent.setup();
    function Harness() {
      const [open, setOpen] = useState(true);
      return <ConfirmDialog open={open} title="Xoá mục?" onOpenChange={() => setOpen((v) => !v)} />;
    }
    render(<Harness />);

    await user.click(screen.getByRole('button', { name: 'Hủy bỏ' }));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('uncontrolled (children làm trigger): Huỷ đóng hộp thoại', async () => {
    const user = userEvent.setup();
    render(
      <ConfirmDialog title="Xoá mục?">
        <Button>Xoá</Button>
      </ConfirmDialog>,
    );

    await user.click(screen.getByRole('button', { name: 'Xoá' }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Hủy bỏ' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});

describe('Modal / Drawer — title rỗng', () => {
  it('Modal title="" vẫn hiện nút đóng khi showClose (mặc định)', () => {
    render(
      <Modal open title="" onOpenChange={noop}>
        nội dung
      </Modal>,
    );
    expect(screen.getByRole('button', { name: 'Đóng' })).toBeInTheDocument();
  });

  it('Drawer title="" vẫn hiện nút đóng khi showClose (mặc định)', () => {
    render(
      <Drawer open title="" onOpenChange={noop}>
        nội dung
      </Drawer>,
    );
    expect(screen.getByRole('button', { name: 'Đóng' })).toBeInTheDocument();
  });
});

describe('Modal / Drawer — chỉ có description', () => {
  it('Modal description không bị nuốt khi không có title và showClose={false}', () => {
    render(
      <Modal description="Mô tả ngắn" open showClose={false} onOpenChange={noop}>
        nội dung
      </Modal>,
    );
    expect(screen.getByText('Mô tả ngắn')).toBeInTheDocument();
  });

  it('Drawer description không bị nuốt khi không có title và showClose={false}', () => {
    render(
      <Drawer description="Mô tả ngắn" open showClose={false} onOpenChange={noop}>
        nội dung
      </Drawer>,
    );
    expect(screen.getByText('Mô tả ngắn')).toBeInTheDocument();
  });
});

describe('FormModal — hai modal cùng mở', () => {
  it('nút xác nhận của modal lồng submit ĐÚNG form của nó (id form không trùng)', async () => {
    const onOuter = vi.fn();
    const onInner = vi.fn();
    function Nested() {
      const outer = useForm<{ a: string }>({ defaultValues: { a: '1' } });
      const inner = useForm<{ b: string }>({ defaultValues: { b: '2' } });
      return (
        <FormModal form={outer} open title="Ngoài" onConfirm={onOuter} onOpenChange={noop}>
          <TextField label="A" name="a" />
          <FormModal form={inner} open title="Trong" onConfirm={onInner} onOpenChange={noop}>
            <TextField label="B" name="b" />
          </FormModal>
        </FormModal>
      );
    }
    render(<Nested />);

    const [, innerConfirm] = screen.getAllByRole('button', { name: 'Xác nhận', hidden: true });
    fireEvent.click(innerConfirm);

    await waitFor(() => expect(onInner).toHaveBeenCalledWith({ b: '2' }));
    expect(onOuter).not.toHaveBeenCalled();
  });
});

describe('FormModal — chặn nổi bọt như Modal', () => {
  it('keydown trong FormModal không nổi bọt ra cây React cha', () => {
    const onParentKeyDown = vi.fn();
    render(
      <div onKeyDown={onParentKeyDown}>
        <FormModal open title="Thêm mục" onOpenChange={noop}>
          <Input aria-label="Mã" />
        </FormModal>
      </div>,
    );

    fireEvent.keyDown(screen.getByRole('textbox', { name: 'Mã' }), { key: 'a' });

    expect(onParentKeyDown).not.toHaveBeenCalled();
  });
});

describe('FormModal — submit bất đồng bộ (async-safety)', () => {
  it('không có `form`: bấm đúp khi đang chờ chỉ gọi onConfirm MỘT lần, nút khoá tới khi xong', async () => {
    const pending = createDeferred();
    const onConfirm = vi.fn(() => pending.promise);
    const onOpenChange = vi.fn();
    render(<FormModal open title="Thêm mục" onConfirm={onConfirm} onOpenChange={onOpenChange} />);

    const confirm = screen.getByRole('button', { name: 'Xác nhận' });
    fireEvent.click(confirm);
    fireEvent.click(confirm);

    expect(onConfirm).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(screen.getByRole('button', { name: /Đang xử lý/ })).toBeDisabled());

    await act(async () => pending.resolve());
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('submit cũ về muộn KHÔNG đóng modal đã đóng rồi mở lại', async () => {
    const pending = createDeferred();
    const onOpenChange = vi.fn();
    const ui = (open: boolean) => (
      <FormModal
        open={open}
        title="Thêm mục"
        onConfirm={() => pending.promise}
        onOpenChange={onOpenChange}
      />
    );
    const { rerender } = render(ui(true));

    fireEvent.click(screen.getByRole('button', { name: 'Xác nhận' }));
    rerender(ui(false));
    rerender(ui(true));
    onOpenChange.mockClear();

    await act(async () => pending.resolve());

    expect(onOpenChange).not.toHaveBeenCalled();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('đóng khi submit còn treo không chặn lượt gửi của lần mở sau', async () => {
    const first = createDeferred();
    const second = createDeferred();
    const onConfirm = vi
      .fn<() => Promise<void>>()
      .mockReturnValueOnce(first.promise)
      .mockReturnValueOnce(second.promise);
    const onOpenChange = vi.fn();
    const ui = (open: boolean) => (
      <FormModal open={open} title="Thêm mục" onConfirm={onConfirm} onOpenChange={onOpenChange} />
    );
    const { rerender } = render(ui(true));

    fireEvent.click(screen.getByRole('button', { name: 'Xác nhận' }));
    rerender(ui(false));
    rerender(ui(true));

    const confirm = screen.getByRole('button', { name: 'Xác nhận' });
    expect(confirm).toBeEnabled();
    fireEvent.click(confirm);
    expect(onConfirm).toHaveBeenCalledTimes(2);

    await act(async () => second.resolve());
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('có `form`: submit cũ về muộn không đóng modal đã mở lại', async () => {
    const pending = createDeferred();
    const onOpenChange = vi.fn();
    function Harness({ open }: { open: boolean }) {
      const form = useForm<{ code: string }>({ defaultValues: { code: 'ABC' } });
      return (
        <FormModal
          form={form}
          open={open}
          title="Thêm mục"
          onConfirm={() => pending.promise}
          onOpenChange={onOpenChange}
        >
          <TextField label="Mã" name="code" />
        </FormModal>
      );
    }
    const { rerender } = render(<Harness open />);

    fireEvent.click(screen.getByRole('button', { name: 'Xác nhận' }));
    await waitFor(() => expect(screen.getByRole('button', { name: /Đang xử lý/ })).toBeDisabled());
    rerender(<Harness open={false} />);
    rerender(<Harness open />);
    onOpenChange.mockClear();

    await act(async () => pending.resolve());

    expect(onOpenChange).not.toHaveBeenCalled();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });
});

describe('FormModal — uncontrolled (`trigger` / `defaultOpen`)', () => {
  it('Huỷ và nút ✕ đóng được modal', async () => {
    const user = userEvent.setup();
    render(
      <FormModal title="Thêm mục" trigger={<Button>Mở</Button>}>
        nội dung
      </FormModal>,
    );

    await user.click(screen.getByRole('button', { name: 'Mở' }));
    await user.click(screen.getByRole('button', { name: 'Hủy bỏ' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Mở' }));
    await user.click(screen.getByRole('button', { name: 'Đóng' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('onConfirm thành công thì tự đóng', async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn(async () => {});
    render(
      <FormModal defaultOpen title="Thêm mục" onConfirm={onConfirm}>
        nội dung
      </FormModal>,
    );

    await user.click(screen.getByRole('button', { name: 'Xác nhận' }));

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });
});

describe('Nhãn a11y tiếng Việt', () => {
  it('Pagination: nút ‹ › có nhãn "Trang trước" / "Trang sau"', async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();
    render(
      <Pagination
        pageCount={5}
        pageIndex={2}
        pageSize={10}
        total={50}
        onPageChange={onPageChange}
        onPageSizeChange={noop}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Trang trước' }));
    await user.click(screen.getByRole('button', { name: 'Trang sau' }));

    expect(onPageChange.mock.calls).toEqual([[1], [3]]);
  });

  it('Toast: nút đóng có nhãn "Đóng"', () => {
    render(
      <ToastProvider>
        <Toast open title="Đã lưu" />
        <ToastViewport />
      </ToastProvider>,
    );
    expect(screen.getByRole('button', { name: 'Đóng' })).toBeInTheDocument();
  });

  it('Toast: tiêu đề dùng token chữ tự đảo theme (không trắng cố định — vô hình ở light theme)', () => {
    render(
      <ToastProvider>
        <Toast open title="Đã lưu" />
        <ToastViewport />
      </ToastProvider>,
    );
    const title = screen.getByText('Đã lưu');
    expect(title).toHaveClass('text-fg-heading');
    expect(title).not.toHaveClass('text-neutral-0');
  });

  it('Stepper: bước đang làm có aria-current="step"', () => {
    render(
      <Stepper
        activeStep={1}
        steps={[
          { key: 'a', label: 'Thông tin' },
          { key: 'b', label: 'Xác nhận' },
        ]}
      />,
    );
    expect(screen.getByText('Xác nhận').closest('[aria-current]')).toHaveAttribute(
      'aria-current',
      'step',
    );
    expect(screen.getByText('Thông tin').closest('[aria-current]')).toBeNull();
  });
});

describe('React 19 — `ref` là prop thường', () => {
  it('Stepper / Toast / ToastViewport trỏ ref tới phần tử gốc', () => {
    const stepperRef = createRef<HTMLDivElement>();
    const toastRef = createRef<HTMLLIElement>();
    const viewportRef = createRef<HTMLOListElement>();
    render(
      <>
        <Stepper ref={stepperRef} steps={[{ key: 'a', label: 'Bước A' }]} />
        <ToastProvider>
          <Toast ref={toastRef} open title="Đã lưu" />
          <ToastViewport ref={viewportRef} />
        </ToastProvider>
      </>,
    );

    expect(stepperRef.current).toBeInstanceOf(HTMLDivElement);
    expect(toastRef.current?.tagName).toBe('LI');
    expect(viewportRef.current?.tagName).toBe('OL');
  });
});
