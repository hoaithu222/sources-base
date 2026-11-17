/**
 * `ProgressCard` + `UploadQueueCard` + `ServerTaskList` + `useServerTasks` — thẻ tiến trình neo góc
 * màn hình.
 *
 * Kiểm đúng những chỗ người dùng chịu thiệt khi sai:
 *  - thẻ tự đóng khi việc còn đang chạy, hoặc khi có lỗi chưa ai đọc;
 *  - thẻ biến mất đúng lúc người dùng đang rê chuột / đặt focus vào để đọc, bấm;
 *  - vòng % nhảy lùi vì lấy % của TỪNG tệp thay cho tiến độ cả lô;
 *  - lô có tệp lỗi nhưng không nói tệp nào lỗi, vì sao.
 */

import { act, fireEvent, renderHook, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { UploadFile } from '@/shared/ui';
import { IntlWrapper, renderWithIntl } from '@tests/helpers/render';
import { ProgressCard, ProgressCardItemList } from '@/shared/widgets/progress-center/card';
import { useServerTasks } from '@/shared/widgets/progress-center';
import { ServerTaskList, useServerTaskStore } from '@/shared/widgets/progress-center/server-tasks';
import {
  UploadQueueCard,
  useUploadQueueStore,
} from '@/shared/widgets/progress-center/upload-queue';

const MB = 1024 * 1024;

const task = (patch: Partial<UploadFile> & Pick<UploadFile, 'id' | 'status'>): UploadFile => ({
  name: `${patch.id}.png`,
  size: MB,
  type: 'image/png',
  progress: 0,
  ...patch,
});

const advance = (ms: number): void => {
  act(() => {
    vi.advanceTimersByTime(ms);
  });
};
const countdownOf = (container: HTMLElement) => container.querySelector('[data-countdown]');

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
  act(() => {
    useUploadQueueStore.setState({ tasks: [] });
    useServerTaskStore.setState({ tasks: [] });
  });
});

describe('ProgressCard: tự đóng', () => {
  it('hết việc thì tự đóng sau đúng autoCloseMs', () => {
    const onClose = vi.fn();
    renderWithIntl(
      <ProgressCard autoCloseMs={6000} status="success" title="Xong" onClose={onClose} />,
    );

    advance(5999);
    expect(onClose).not.toHaveBeenCalled();

    advance(1);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('đang chạy thì KHÔNG tự đóng dù có autoCloseMs; chạy xong mới bắt đầu đếm', () => {
    const onClose = vi.fn();
    const { rerender, container } = renderWithIntl(
      <ProgressCard autoCloseMs={1000} status="running" title="Đang chạy" onClose={onClose} />,
    );

    advance(5000);
    expect(onClose).not.toHaveBeenCalled();
    expect(countdownOf(container)).toBeNull();

    rerender(<ProgressCard autoCloseMs={1000} status="success" title="Xong" onClose={onClose} />);
    advance(999);
    expect(onClose).not.toHaveBeenCalled();
    advance(1);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('không khai autoCloseMs thì ở lại mãi (thẻ lỗi)', () => {
    const onClose = vi.fn();
    const { container } = renderWithIntl(
      <ProgressCard status="error" title="Lỗi" onClose={onClose} />,
    );

    advance(60_000);

    expect(onClose).not.toHaveBeenCalled();
    expect(countdownOf(container)).toBeNull();
  });

  it('rê chuột vào thì dừng đếm, rời ra chạy TIẾP phần còn lại (không đếm lại từ đầu)', () => {
    const onClose = vi.fn();
    const { container } = renderWithIntl(
      <ProgressCard autoCloseMs={6000} status="success" title="Xong" onClose={onClose} />,
    );
    const root = container.firstElementChild as HTMLElement;

    advance(4000);
    fireEvent.mouseEnter(root);
    expect(countdownOf(container)).toHaveAttribute('data-countdown', 'paused');

    advance(60_000);
    expect(onClose).not.toHaveBeenCalled();

    fireEvent.mouseLeave(root);
    expect(countdownOf(container)).toHaveAttribute('data-countdown', 'running');
    advance(1999);
    expect(onClose).not.toHaveBeenCalled();
    advance(1);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('focus còn trong thẻ thì chuột rời ra vẫn chưa đóng; focus ra ngoài mới đếm tiếp', () => {
    const onClose = vi.fn();
    renderWithIntl(
      <>
        <ProgressCard autoCloseMs={3000} status="success" title="Xong" onClose={onClose}>
          <span>chi tiết</span>
        </ProgressCard>
        <button type="button">ngoài thẻ</button>
      </>,
    );
    const expand = screen.getByRole('button', { name: 'Xem chi tiết' });
    const close = screen.getByRole('button', { name: 'Đóng' });
    const root = expand.closest('.group\\/toast') as HTMLElement;

    fireEvent.mouseEnter(root);
    fireEvent.focus(expand);
    fireEvent.mouseLeave(root);
    advance(10_000);
    expect(onClose).not.toHaveBeenCalled();

    fireEvent.blur(expand, { relatedTarget: close });
    advance(10_000);
    expect(onClose).not.toHaveBeenCalled();

    fireEvent.blur(close, { relatedTarget: screen.getByRole('button', { name: 'ngoài thẻ' }) });
    advance(3000);
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});

describe('ProgressCard: hiển thị', () => {
  it('đang chạy có % → vòng tiến độ đọc được bằng trình đọc màn hình', () => {
    renderWithIntl(<ProgressCard progress={42.4} status="running" title="Đang tải lên" />);

    const ring = screen.getByRole('progressbar', { name: 'Đã xong 42%' });
    expect(ring).toHaveAttribute('aria-valuenow', '42');
  });

  it.each([
    ['vi', 'Đã xong 42%', 'Xem chi tiết', 'Thu gọn chi tiết', 'Đóng'],
    ['en', '42% complete', 'View details', 'Hide details', 'Close'],
  ] as const)(
    'chữ cho trình đọc màn hình theo ngôn ngữ %s: vòng %, nút mở / thu chi tiết, nút đóng',
    (locale, ringName, expandName, collapseName, closeName) => {
      renderWithIntl(
        <ProgressCard progress={42.4} status="running" title="x" onClose={vi.fn()}>
          <span>Chi tiết</span>
        </ProgressCard>,
        { locale },
      );

      expect(screen.getByRole('progressbar', { name: ringName })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: closeName })).toBeInTheDocument();
      fireEvent.click(screen.getByRole('button', { name: expandName }));
      expect(screen.getByRole('button', { name: collapseName })).toBeInTheDocument();
    },
  );

  it('en: tác vụ chạy không biết % hiện chữ "Processing"', () => {
    renderWithIntl(<ProgressCard status="running" title="Importing" />, { locale: 'en' });

    expect(screen.getByText('Processing')).toBeInTheDocument();
  });

  it('đang chạy không biết % → không có vòng, có chữ cho trình đọc màn hình', () => {
    renderWithIntl(<ProgressCard status="running" title="Đang xử lý tệp" />);

    expect(screen.queryByRole('progressbar')).toBeNull();
    expect(screen.getByText('Đang xử lý')).toBeInTheDocument();
  });

  it('không có onClose thì không có nút đóng; có thì bấm là gọi', () => {
    const onClose = vi.fn();
    const { rerender } = renderWithIntl(<ProgressCard status="running" title="Đang chạy" />);
    expect(screen.queryByRole('button', { name: 'Đóng' })).toBeNull();

    rerender(<ProgressCard status="error" title="Lỗi" onClose={onClose} />);
    fireEvent.click(screen.getByRole('button', { name: 'Đóng' }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('phần chi tiết ẩn sẵn, bấm mới mở; không có children thì không có nút mở', () => {
    const { rerender } = renderWithIntl(
      <ProgressCard status="success" title="Xong">
        <span>danh sách tệp</span>
      </ProgressCard>,
    );
    const toggle = screen.getByRole('button', { name: 'Xem chi tiết' });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByText('danh sách tệp')).toBeNull();

    fireEvent.click(toggle);
    expect(screen.getByText('danh sách tệp')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Thu gọn chi tiết' })).toHaveAttribute(
      'aria-expanded',
      'true',
    );

    rerender(<ProgressCard status="success" title="Xong" />);
    expect(screen.queryByRole('button', { name: /chi tiết/ })).toBeNull();
  });

  it('defaultExpanded mở sẵn, nhưng người dùng đã tự thu gọn thì giữ ý người dùng', () => {
    const { rerender } = renderWithIntl(
      <ProgressCard defaultExpanded status="error" title="Lỗi">
        <span>danh sách tệp</span>
      </ProgressCard>,
    );
    expect(screen.getByText('danh sách tệp')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Thu gọn chi tiết' }));
    rerender(
      <ProgressCard defaultExpanded status="error" title="Lỗi">
        <span>danh sách tệp</span>
      </ProgressCard>,
    );

    expect(screen.queryByText('danh sách tệp')).toBeNull();
  });

  it('thông điệp của thẻ lỗi tô màu lỗi, thẻ thường thì không', () => {
    const { rerender } = renderWithIntl(
      <ProgressCard message="Hỏng dòng 12" status="error" title="Lỗi" />,
    );
    expect(screen.getByText('Hỏng dòng 12')).toHaveClass('text-error');

    rerender(<ProgressCard message="Đã nhập 400 dòng" status="success" title="Xong" />);
    expect(screen.getByText('Đã nhập 400 dòng')).not.toHaveClass('text-error');
  });
});

describe('ProgressCardItemList', () => {
  it('mỗi mục một dòng: tên + chữ chi tiết bên phải', () => {
    renderWithIntl(
      <ProgressCardItemList
        items={[
          { id: 'a', name: 'a.png', status: 'success', detail: '1 MB' },
          { id: 'b', name: 'b.png', status: 'error', detail: 'Quá dung lượng' },
          { id: 'c', name: 'c.png', status: 'pending' },
        ]}
      />,
    );

    const rows = screen.getAllByRole('listitem');
    expect(rows).toHaveLength(3);
    expect(within(rows[0]).getByText('1 MB')).toBeInTheDocument();
    expect(within(rows[1]).getByText('Quá dung lượng')).toHaveClass('text-error');
    expect(rows[2]).toHaveTextContent('c.png');
  });
});

describe('UploadQueueCard', () => {
  it('hàng đợi rỗng thì không vẽ gì', () => {
    const { container } = renderWithIntl(<UploadQueueCard />);

    expect(container).toBeEmptyDOMElement();
  });

  it('đang tải: vòng % là tiến độ CẢ LÔ, kèm số tệp xong và tên tệp đang tải', () => {
    useUploadQueueStore.setState({
      tasks: [
        task({ id: 'a', status: 'success', progress: 100 }),
        task({ id: 'b', status: 'uploading', progress: 50 }),
        task({ id: 'c', status: 'pending' }),
        task({ id: 'd', status: 'pending' }),
      ],
    });
    renderWithIntl(<UploadQueueCard />);

    expect(screen.getByText('Đang tải lên')).toBeInTheDocument();
    expect(screen.getByText('1/4')).toBeInTheDocument();
    expect(screen.getByText('b.png')).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '38');
    expect(screen.queryByRole('button', { name: 'Đóng' })).toBeNull();
    expect(screen.getByRole('button', { name: 'Huỷ tải lên' })).toBeInTheDocument();
  });

  it('xong sạch: báo tổng số tệp + dung lượng, không còn nút to, tự dọn sau 6 giây', () => {
    useUploadQueueStore.setState({
      tasks: [
        task({ id: 'a', status: 'success', progress: 100 }),
        task({ id: 'b', status: 'success', progress: 100, size: MB / 2 }),
      ],
    });
    renderWithIntl(<UploadQueueCard />);

    expect(screen.getByText('Tải lên hoàn tất')).toBeInTheDocument();
    expect(screen.getByText('2/2')).toBeInTheDocument();
    expect(screen.getByText('2 tệp · 1.5 MB')).toBeInTheDocument();
    expect(
      screen.getAllByRole('button').map((button) => button.getAttribute('aria-label')),
    ).toEqual(['Xem chi tiết', 'Đóng']);

    advance(5999);
    expect(useUploadQueueStore.getState().tasks).toHaveLength(2);
    advance(1);
    expect(useUploadQueueStore.getState().tasks).toHaveLength(0);
  });

  it('có tệp lỗi: thẻ Ở LẠI, mở sẵn danh sách và nói rõ tệp nào lỗi vì sao', () => {
    useUploadQueueStore.setState({
      tasks: [
        task({ id: 'a', status: 'success', progress: 100 }),
        task({ id: 'b', status: 'error', error: 'Tệp vượt quá 10 MB' }),
      ],
    });
    renderWithIntl(<UploadQueueCard />);

    expect(screen.getByText('Có tệp tải lên lỗi')).toBeInTheDocument();
    expect(screen.getByText('1 tệp xong · 1 tệp lỗi')).toBeInTheDocument();
    const rows = screen.getAllByRole('listitem');
    expect(rows[1]).toHaveTextContent('b.png');
    expect(rows[1]).toHaveTextContent('Tệp vượt quá 10 MB');

    advance(60_000);
    expect(useUploadQueueStore.getState().tasks).toHaveLength(2);
  });

  it('thẻ lỗi: "Thử lại" gọi retryFailed, "Bỏ qua" dọn hàng đợi', () => {
    const retryFailed = vi.fn();
    const original = useUploadQueueStore.getState().retryFailed;
    useUploadQueueStore.setState({
      retryFailed,
      tasks: [task({ id: 'a', status: 'error', error: 'Mất mạng' })],
    });
    renderWithIntl(<UploadQueueCard />);

    expect(screen.getByText('Tải lên thất bại')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Thử lại' }));
    expect(retryFailed).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole('button', { name: 'Bỏ qua' }));
    expect(useUploadQueueStore.getState().tasks).toHaveLength(0);

    act(() => useUploadQueueStore.setState({ retryFailed: original }));
  });

  it('tệp lỗi KHÔNG kèm `error` → dòng tệp hiện câu mặc định theo ngôn ngữ của provider', () => {
    useUploadQueueStore.setState({ tasks: [task({ id: 'a', status: 'error' })] });
    const { unmount } = renderWithIntl(<UploadQueueCard />);

    expect(screen.getByRole('listitem')).toHaveTextContent('Tải lên thất bại');
    unmount();

    renderWithIntl(<UploadQueueCard />, { locale: 'en' });
    expect(screen.getByRole('listitem')).toHaveTextContent('Upload failed');
    expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument();
  });

  it('chữ của thẻ theo ngôn ngữ: en dịch tiêu đề và nút huỷ', () => {
    useUploadQueueStore.setState({
      tasks: [
        task({ id: 'a', status: 'success', progress: 100 }),
        task({ id: 'b', status: 'uploading', progress: 50 }),
      ],
    });
    renderWithIntl(<UploadQueueCard />, { locale: 'en' });

    expect(screen.getByText('Uploading')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel upload' })).toBeInTheDocument();
  });
});

describe('ServerTaskList', () => {
  const start = () =>
    useServerTaskStore.getState().start({
      label: 'Nhập vật tư',
      fileName: 'vat-tu.xlsx',
      message: 'Đang đọc tệp…',
      progress: 10,
    });

  it('đang chạy: không đóng được, không tự đóng', () => {
    act(() => void start());
    renderWithIntl(<ServerTaskList />);

    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '10');
    expect(screen.queryByRole('button', { name: 'Đóng' })).toBeNull();

    advance(60_000);
    expect(useServerTaskStore.getState().tasks).toHaveLength(1);
  });

  it('thành công: tự đóng sau 10 giây', () => {
    let id = '';
    act(() => void (id = start()));
    renderWithIntl(<ServerTaskList />);

    act(() => useServerTaskStore.getState().finishSuccess(id, 'Đã nhập 400 dòng'));
    expect(screen.getByText('Đã nhập 400 dòng')).toBeInTheDocument();

    advance(9999);
    expect(useServerTaskStore.getState().tasks).toHaveLength(1);
    advance(1);
    expect(useServerTaskStore.getState().tasks).toHaveLength(0);
  });

  it('lỗi: ở lại tới khi người dùng bấm đóng', () => {
    let id = '';
    act(() => void (id = start()));
    renderWithIntl(<ServerTaskList />);

    act(() => useServerTaskStore.getState().finishError(id, 'Hỏng dòng 12'));
    advance(120_000);
    expect(useServerTaskStore.getState().tasks).toHaveLength(1);

    fireEvent.click(screen.getByRole('button', { name: 'Đóng' }));
    expect(useServerTaskStore.getState().tasks).toHaveLength(0);
  });
});

describe('useServerTasks — dựng thẻ qua hook, không gọi `getState()` trần', () => {
  it('start → thẻ tác vụ hiện, finishSuccess → thẻ báo xong', () => {
    const { result } = renderHook(() => useServerTasks(), { wrapper: IntlWrapper });
    renderWithIntl(<ServerTaskList />);

    let id = '';
    act(() => {
      id = result.current.start({ label: 'Nhập vật tư', message: 'Đang đọc tệp…' });
    });
    expect(screen.getByText('Nhập vật tư')).toBeInTheDocument();
    expect(screen.getByText('Đang xử lý')).toBeInTheDocument();

    act(() => result.current.finishSuccess(id, 'Đã nhập 400 dòng'));
    expect(screen.getByText('Đã nhập 400 dòng')).toBeInTheDocument();
  });
});
