/**
 * Quy ước NÚT ĐÓNG của mọi lớp nổi (Modal · FormModal · ConfirmDialog · Drawer · Popover-sheet · Toast) —
 * `docs/rules/display/ipad-responsive.md`.
 *
 * jsdom không chạy CSS nên không đo được "hiện ở tablet / ẩn ở máy tính" bằng hình; ở đây khoá HỢP ĐỒNG:
 *  - nút `aria-label="Đóng"` LUÔN nằm trong DOM (kể cả khi prop tắt `showClose={false}`);
 *  - khi prop tắt, nút mang lớp "ẩn ở máy tính, hiện ở tablet / chạm ngón" (`hidden max-lg:flex touch:flex`);
 *  - bấm nút thì đóng đúng lớp nổi đang mở (`onOpenChange(false)`, hoặc tự đóng khi uncontrolled).
 * Số đo thật (40px, vùng chạm 44px, sheet cao theo nội dung) kiểm bằng Playwright trên `/demo`.
 */

import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  ConfirmDialog,
  Drawer,
  FormModal,
  Modal,
  ModalCloseButton,
  Popover,
  Toast,
  ToastProvider,
  ToastViewport,
} from '@/shared/ui';

const closeButton = () => screen.getByRole('button', { name: 'Đóng' });

function expectTouchOnly(el: HTMLElement) {
  expect(el).toHaveClass('hidden', 'max-lg:flex', 'touch:flex');
}

describe('ModalCloseButton — dùng riêng', () => {
  it('có onClick → nút thường aria-label "Đóng", bấm gọi onClick; khoá được bằng disabled', async () => {
    const onClick = vi.fn();
    const { rerender } = render(<ModalCloseButton onClick={onClick} />);

    await userEvent.setup().click(closeButton());
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(closeButton()).toHaveAttribute('type', 'button');

    rerender(<ModalCloseButton disabled onClick={onClick} />);
    expect(closeButton()).toBeDisabled();
  });

  it('forced → ẩn ở máy tính, hiện ở tablet / chạm; floating → nổi góc phải-trên', () => {
    render(<ModalCloseButton floating forced onClick={vi.fn()} />);

    expectTouchOnly(closeButton());
    expect(closeButton()).toHaveClass('absolute', 'right-2', 'top-2');
  });
});

describe('Modal — nút đóng', () => {
  it('mặc định có X (aria-label "Đóng"), bấm thì gọi onOpenChange(false)', async () => {
    const onOpenChange = vi.fn();
    render(
      <Modal open title="Chi tiết" onOpenChange={onOpenChange}>
        nội dung
      </Modal>,
    );

    expect(closeButton()).not.toHaveClass('hidden');
    await userEvent.setup().click(closeButton());
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('X hình 32px (tablet / chạm 40px) và vùng chạm nới bằng ::after', () => {
    render(
      <Modal open title="Chi tiết">
        nội dung
      </Modal>,
    );

    expect(closeButton()).toHaveClass(
      'size-8',
      'max-lg:size-10',
      'touch:size-10',
      "after:content-['']",
      'after:-inset-1.5',
    );
  });

  it('showClose={false} + có tiêu đề → X vẫn nằm trong DOM, chỉ hiện ở tablet / chạm', async () => {
    const onOpenChange = vi.fn();
    render(
      <Modal open showClose={false} title="Chi tiết" onOpenChange={onOpenChange}>
        nội dung
      </Modal>,
    );

    expectTouchOnly(closeButton());
    await userEvent.setup().click(closeButton());
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('modal KHÔNG header (noPadding, tự dựng nội dung) → X NỔI góc phải-trên, panel chừa đệm đầu', () => {
    render(
      <Modal noPadding open showClose={false}>
        <div>tự dựng</div>
      </Modal>,
    );

    expectTouchOnly(closeButton());
    expect(closeButton()).toHaveClass('absolute', 'right-2', 'top-2');
    expect(screen.getByRole('dialog')).toHaveClass('max-lg:pt-12', 'touch:pt-12');
  });

  it('forceCloseOnTouch={false} (khoá cứng / tự vẽ nút đóng) → KHÔNG có X', () => {
    render(
      <Modal forceCloseOnTouch={false} noPadding open showClose={false}>
        <div>tự dựng</div>
      </Modal>,
    );

    expect(screen.queryByRole('button', { name: 'Đóng' })).not.toBeInTheDocument();
  });

  it('tiêu đề tablet / điện thoại xuống dòng, không cắt bằng truncate', () => {
    render(
      <Modal open title="Một tiêu đề rất dài">
        nội dung
      </Modal>,
    );

    const title = screen.getByText('Một tiêu đề rất dài');
    expect(title.className).not.toMatch(/\btruncate\b/);
    expect(title).toHaveClass('max-lg:whitespace-normal', 'touch:whitespace-normal');
  });

  it('điện thoại: panel rộng 100vw − 16px, cao theo vùng an toàn; thân cuộn riêng', () => {
    render(
      <Modal open title="Chi tiết">
        nội dung
      </Modal>,
    );

    expect(screen.getByRole('dialog')).toHaveClass(
      'phone:w-[calc(100vw-16px)]',
      'phone:max-h-[calc(100dvh-16px-var(--safe-t,0px)-var(--safe-b,0px))]',
    );
    expect(screen.getByText('nội dung')).toHaveClass('overflow-auto', 'min-h-0');
  });
});

describe('FormModal — nút đóng', () => {
  it('controlled: bấm X gọi onOpenChange(false)', async () => {
    const onOpenChange = vi.fn();
    render(
      <FormModal open title="Thêm mục" onOpenChange={onOpenChange}>
        form
      </FormModal>,
    );

    await userEvent.setup().click(closeButton());
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('uncontrolled (trigger, không onOpenChange): X VẪN đóng được modal', async () => {
    const user = userEvent.setup();
    render(
      <FormModal title="Thêm mục" trigger={<button type="button">Mở</button>}>
        form
      </FormModal>,
    );

    await user.click(screen.getByRole('button', { name: 'Mở' }));
    expect(await screen.findByRole('dialog')).toBeInTheDocument();

    await user.click(closeButton());
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('form dài ở tablet / điện thoại: thân cuộn, header + footer đứng yên', () => {
    render(
      <FormModal open title="Thêm mục">
        <p>dòng</p>
      </FormModal>,
    );

    expect(screen.getByText('dòng').parentElement).toHaveClass(
      'max-lg:overflow-y-auto',
      'touch:overflow-y-auto',
    );
  });
});

describe('ConfirmDialog — nút đóng', () => {
  it('mặc định có X và bấm đóng được', async () => {
    const onOpenChange = vi.fn();
    render(<ConfirmDialog open title="Xoá?" onOpenChange={onOpenChange} />);

    await userEvent.setup().click(closeButton());
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('showClose={false} → X chỉ ẩn ở máy tính, tablet / chạm vẫn có', () => {
    render(<ConfirmDialog open showClose={false} title="Xoá?" />);

    expectTouchOnly(closeButton());
  });

  it('uncontrolled: X đóng được hộp thoại', async () => {
    const user = userEvent.setup();
    render(
      <ConfirmDialog title="Xoá?">
        <button type="button">Mở</button>
      </ConfirmDialog>,
    );

    await user.click(screen.getByRole('button', { name: 'Mở' }));
    await user.click(closeButton());
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });
});

describe('Drawer — nút đóng', () => {
  it('mặc định có X, bấm gọi onOpenChange(false)', async () => {
    const onOpenChange = vi.fn();
    render(
      <Drawer open title="Bình luận" onOpenChange={onOpenChange}>
        nội dung
      </Drawer>,
    );

    await userEvent.setup().click(closeButton());
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('showClose={false} → X chỉ ẩn ở máy tính; không tiêu đề cũng có X nổi', () => {
    render(
      <Drawer open showClose={false} onOpenChange={vi.fn()}>
        nội dung
      </Drawer>,
    );

    expectTouchOnly(closeButton());
    expect(closeButton()).toHaveClass('absolute');
  });

  it('ngăn kéo ĐÁY có tay nắm kéo-để-đóng, cao theo nội dung ở tablet / điện thoại; ngăn kéo phải thì không', () => {
    const { unmount } = render(
      <Drawer open side="bottom" title="Bộ lọc" onOpenChange={vi.fn()}>
        nội dung
      </Drawer>,
    );
    expect(document.querySelector('[class*="cursor-grab"]')).not.toBeNull();
    expect(screen.getByRole('dialog')).toHaveClass(
      'max-lg:h-auto',
      'max-lg:max-h-[calc(100dvh-var(--safe-t,0px)-1.5rem)]',
    );
    expect(screen.getByText('nội dung')).toHaveClass('last:pb-[calc(1rem+var(--safe-b,0px))]');
    unmount();

    render(
      <Drawer open side="right" title="Bộ lọc" onOpenChange={vi.fn()}>
        nội dung
      </Drawer>,
    );
    expect(document.querySelector('[class*="cursor-grab"]')).toBeNull();
  });

  it('header không có mô tả canh GIỮA theo X (tablet / điện thoại)', () => {
    render(
      <Drawer open side="bottom" title="Bộ lọc" onOpenChange={vi.fn()}>
        nội dung
      </Drawer>,
    );

    expect(closeButton().parentElement).toHaveClass('max-lg:items-center', 'touch:items-center');
  });

  it('kéo tay nắm xuống quá 80px rồi thả → đóng; kéo ngắn → không đóng', () => {
    const proto = HTMLElement.prototype as unknown as Record<string, unknown>;
    proto.setPointerCapture = vi.fn();
    proto.releasePointerCapture = vi.fn();
    proto.hasPointerCapture = vi.fn(() => true);

    const onOpenChange = vi.fn();
    render(
      <Drawer open side="bottom" title="Bộ lọc" onOpenChange={onOpenChange}>
        nội dung
      </Drawer>,
    );
    const grip = document.querySelector<HTMLElement>('[class*="cursor-grab"]') as HTMLElement;

    fireEvent.pointerDown(grip, { clientY: 100, pointerId: 1 });
    fireEvent.pointerMove(grip, { clientY: 140, pointerId: 1 });
    fireEvent.pointerUp(grip, { clientY: 140, pointerId: 1 });
    expect(onOpenChange).not.toHaveBeenCalled();

    fireEvent.pointerDown(grip, { clientY: 100, pointerId: 1 });
    fireEvent.pointerMove(grip, { clientY: 220, pointerId: 1 });
    fireEvent.pointerUp(grip, { clientY: 220, pointerId: 1 });
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});

describe('Popover sheetOnPhone', () => {
  const realMatchMedia = window.matchMedia;
  afterEach(() => {
    window.matchMedia = realMatchMedia;
  });

  const mockPhone = (matches: boolean) => {
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
  };

  it('điện thoại: nội dung hiện trong ngăn kéo đáy CÓ nút đóng; bấm X đóng được', async () => {
    mockPhone(true);
    const user = userEvent.setup();
    render(
      <Popover content={<p>chi tiết dài</p>} sheetOnPhone="Chi tiết">
        <button type="button">Mở</button>
      </Popover>,
    );

    await user.click(screen.getByRole('button', { name: 'Mở' }));
    expect(await screen.findByText('chi tiết dài')).toBeInTheDocument();
    expect(screen.getByText('Chi tiết')).toBeInTheDocument();

    await user.click(closeButton());
    await waitFor(() => expect(screen.queryByText('chi tiết dài')).not.toBeInTheDocument());
  });

  it('laptop (không phải điện thoại): vẫn là popover thường, không có nút đóng', async () => {
    mockPhone(false);
    const user = userEvent.setup();
    render(
      <Popover content={<p>chi tiết dài</p>} sheetOnPhone="Chi tiết">
        <button type="button">Mở</button>
      </Popover>,
    );

    await user.click(screen.getByRole('button', { name: 'Mở' }));
    expect(await screen.findByText('chi tiết dài')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Đóng' })).not.toBeInTheDocument();
  });

  it('điện thoại + không bật sheetOnPhone: panel nổi thường, không có nút đóng', async () => {
    mockPhone(true);
    const user = userEvent.setup();
    render(
      <Popover content={<p>chi tiết ngắn</p>}>
        <button type="button">Mở</button>
      </Popover>,
    );

    await user.click(screen.getByRole('button', { name: 'Mở' }));
    expect(await screen.findByText('chi tiết ngắn')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Đóng' })).not.toBeInTheDocument();
  });
});

describe('Toast — nút đóng', () => {
  it('có nút "Đóng" 32px ở tablet, vùng chạm nới bằng ::after', () => {
    render(
      <ToastProvider>
        <Toast open title="Đã lưu" type="success" />
        <ToastViewport />
      </ToastProvider>,
    );

    expect(screen.getByRole('button', { name: 'Đóng' })).toHaveClass(
      'after:-inset-2',
      'max-lg:size-8',
      'touch:size-8',
    );
  });

  it('viewport neo trên-phải dưới header (laptop), điện thoại neo đáy TRÊN thanh tab + vùng an toàn', () => {
    render(
      <ToastProvider>
        <ToastViewport data-testid="viewport" />
      </ToastProvider>,
    );

    expect(screen.getByTestId('viewport')).toHaveClass(
      'top-[calc(4.5rem+var(--safe-t,0px))]',
      'max-w-[min(380px,calc(100vw-32px))]',
      'phone:top-auto',
      'phone:bottom-[calc(var(--tab-bar-reach,0px)+var(--safe-b,0px)+0.75rem)]',
      'phone:max-w-[calc(100vw-16px)]',
    );
  });
});
