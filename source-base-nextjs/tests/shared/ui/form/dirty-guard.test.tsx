/**
 * `useDirtyGuard` / `<Form dirtyGuard>` — chặn rời trang khi form còn thay đổi chưa lưu.
 *
 * App Router không có `useBlocker`: hook chặn click vào `<a>` nội bộ đổi `pathname` và sự kiện `beforeunload`.
 * Mỗi ca là một tình huống người dùng thấy được:
 *  - form sạch thì đi tự do, form bẩn thì bị hỏi lại;
 *  - "Rời đi" mới điều hướng (`router.push` với URL ĐÃ có tiền tố ngôn ngữ), "Ở lại" thì không;
 *  - click không phải điều hướng nội bộ (cùng trang, mở tab mới, ngoài site, phím bổ trợ) không bị chặn.
 */

import { fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useForm } from 'react-hook-form';
import { describe, expect, it } from 'vitest';

import { Link } from '@/core/i18n';
import { Form, TextField } from '@/shared/ui';
import { renderInRouter } from '@tests/helpers/render';

interface Values {
  name: string;
}

function Harness({
  dirtyGuard = true as boolean | { message: string },
  enabled = true,
}: {
  dirtyGuard?: boolean | { message: string };
  enabled?: boolean;
}) {
  const form = useForm<Values>({ defaultValues: { name: '' } });
  return (
    <>
      <Form dirtyGuard={enabled ? dirtyGuard : false} form={form} onSubmit={() => undefined}>
        <TextField label="Họ tên" name="name" />
      </Form>
      <Link href="/settings">Cài đặt</Link>
      <Link href="/settings?tab=2#top">Cài đặt tab 2</Link>
      <Link href="/">Cùng trang</Link>
      <Link href="/?x=1#frag">Cùng trang kèm query</Link>
      <Link href="/settings" target="_blank">
        Mở tab mới
      </Link>
      <Link download href="/settings/report.csv">
        Tải về
      </Link>
      <Link href="https://example.com/ngoai">Ngoài site</Link>
    </>
  );
}

/**
 * Bấm vào `target` và cho biết lượt bấm có bị hook giữ lại không. Hook chặn ở pha capture của `document` và
 * `stopPropagation`, nên nếu bấm vẫn lên tới `window` (pha nổi bọt) tức là không bị chặn; lúc đó huỷ mặc định để
 * jsdom không thử điều hướng thật.
 */
function click(target: Element, init: MouseEventInit = {}): { blocked: boolean } {
  let reached = false;
  const onWindowClick = (event: MouseEvent) => {
    reached = true;
    event.preventDefault();
  };
  window.addEventListener('click', onWindowClick);
  try {
    fireEvent.click(target, init);
  } finally {
    window.removeEventListener('click', onWindowClick);
  }
  return { blocked: !reached };
}

async function makeDirty() {
  const user = userEvent.setup();
  await user.type(screen.getByRole('textbox', { name: 'Họ tên' }), 'An');
}

describe('useDirtyGuard — click vào liên kết nội bộ', () => {
  it('form sạch: bấm liên kết đi tự do, không hiện hộp xác nhận', () => {
    renderInRouter(<Harness />);

    expect(click(screen.getByRole('link', { name: 'Cài đặt' })).blocked).toBe(false);
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
  });

  it('form bẩn: bấm liên kết bị giữ lại và hiện hộp "Bỏ thay đổi?"', async () => {
    const { router } = renderInRouter(<Harness />);
    await makeDirty();

    expect(click(screen.getByRole('link', { name: 'Cài đặt' })).blocked).toBe(true);

    expect(await screen.findByText('Bỏ thay đổi?')).toBeInTheDocument();
    expect(
      screen.getByText('Bạn có thay đổi chưa lưu. Rời đi sẽ mất dữ liệu.'),
    ).toBeInTheDocument();
    expect(router.push).not.toHaveBeenCalled();
  });

  it('"Rời đi" điều hướng tới đúng đích (đã có tiền tố ngôn ngữ), hộp đóng lại', async () => {
    const { router } = renderInRouter(<Harness />, { pathname: '/en', locale: 'en' });
    await makeDirty();

    click(screen.getByRole('link', { name: 'Cài đặt' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Leave' }));

    expect(router.push).toHaveBeenCalledTimes(1);
    expect(router.push).toHaveBeenCalledWith('/en/settings');
    await waitFor(() => expect(screen.queryByText('Discard changes?')).not.toBeInTheDocument());
  });

  it('"Ở lại" không điều hướng và đóng hộp; bấm tiếp vẫn bị hỏi lại', async () => {
    const { router } = renderInRouter(<Harness />);
    await makeDirty();

    click(screen.getByRole('link', { name: 'Cài đặt' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Ở lại' }));

    expect(router.push).not.toHaveBeenCalled();
    await waitFor(() => expect(screen.queryByText('Bỏ thay đổi?')).not.toBeInTheDocument());

    expect(click(screen.getByRole('link', { name: 'Cài đặt' })).blocked).toBe(true);
    expect(await screen.findByText('Bỏ thay đổi?')).toBeInTheDocument();
  });

  it('giữ nguyên query và hash của đích khi "Rời đi"', async () => {
    const { router } = renderInRouter(<Harness />);
    await makeDirty();

    click(screen.getByRole('link', { name: 'Cài đặt tab 2' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Rời đi' }));

    expect(router.push).toHaveBeenCalledWith('/settings?tab=2#top');
  });

  it('dirtyGuard={{ message }} đổi câu hỏi trong hộp', async () => {
    renderInRouter(<Harness dirtyGuard={{ message: 'Hồ sơ chưa lưu, đi thật không?' }} />);
    await makeDirty();

    click(screen.getByRole('link', { name: 'Cài đặt' }));

    expect(await screen.findByText('Hồ sơ chưa lưu, đi thật không?')).toBeInTheDocument();
  });

  it('không chặn: cùng pathname, mở tab mới, tải về, ngoài site, phím bổ trợ, chuột giữa', async () => {
    renderInRouter(<Harness />);
    await makeDirty();

    expect(click(screen.getByRole('link', { name: 'Cùng trang' })).blocked).toBe(false);
    expect(click(screen.getByRole('link', { name: 'Cùng trang kèm query' })).blocked).toBe(false);
    expect(click(screen.getByRole('link', { name: 'Mở tab mới' })).blocked).toBe(false);
    expect(click(screen.getByRole('link', { name: 'Tải về' })).blocked).toBe(false);
    expect(click(screen.getByRole('link', { name: 'Ngoài site' })).blocked).toBe(false);
    expect(click(screen.getByRole('link', { name: 'Cài đặt' }), { ctrlKey: true }).blocked).toBe(
      false,
    );
    expect(click(screen.getByRole('link', { name: 'Cài đặt' }), { metaKey: true }).blocked).toBe(
      false,
    );
    expect(click(screen.getByRole('link', { name: 'Cài đặt' }), { button: 1 }).blocked).toBe(false);
    expect(screen.queryByText('Bỏ thay đổi?')).not.toBeInTheDocument();
  });

  it('không có dirtyGuard: form bẩn vẫn đi tự do', async () => {
    renderInRouter(<Harness enabled={false} />);
    await makeDirty();

    expect(click(screen.getByRole('link', { name: 'Cài đặt' })).blocked).toBe(false);
    expect(screen.queryByText('Bỏ thay đổi?')).not.toBeInTheDocument();
  });

  it('gỡ form khỏi cây thì hết chặn', async () => {
    const view = renderInRouter(<Harness />);
    await makeDirty();
    expect(click(screen.getByRole('link', { name: 'Cài đặt' })).blocked).toBe(true);

    view.rerender(<Link href="/settings">Cài đặt</Link>);

    expect(click(screen.getByRole('link', { name: 'Cài đặt' })).blocked).toBe(false);
  });
});

describe('useDirtyGuard — đóng tab / tải lại', () => {
  const beforeUnload = () => {
    const event = new Event('beforeunload', { cancelable: true });
    window.dispatchEvent(event);
    return event;
  };

  it('form bẩn: beforeunload bị huỷ để trình duyệt hỏi lại', async () => {
    renderInRouter(<Harness />);
    await makeDirty();

    expect(beforeUnload().defaultPrevented).toBe(true);
  });

  it('form sạch: beforeunload không bị chặn', () => {
    renderInRouter(<Harness />);

    expect(beforeUnload().defaultPrevented).toBe(false);
  });

  it('không có dirtyGuard: beforeunload không bị chặn dù form bẩn', async () => {
    renderInRouter(<Harness enabled={false} />);
    await makeDirty();

    expect(beforeUnload().defaultPrevented).toBe(false);
  });

  it('unmount gỡ listener beforeunload', async () => {
    const view = renderInRouter(<Harness />);
    await makeDirty();
    view.unmount();

    expect(beforeUnload().defaultPrevented).toBe(false);
  });
});
