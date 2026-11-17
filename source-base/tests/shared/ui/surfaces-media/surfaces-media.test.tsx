/**
 * Nhóm surfaces + media — các lỗi đã ghi trong docs/known-issues.md và lỗi trợ năng tìm thấy khi rà.
 *
 * Mỗi khối kiểm đúng điều người dùng thấy khi sai: chữ "0" lạc, dải chân rỗng, chấm góc lơ lửng, khung
 * chia đôi không kéo được, phím / lăn chuột bị bắt sai chỗ, kết quả bất đồng bộ cũ đè lên kết quả mới.
 */

import { act, fireEvent, render, renderHook, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  BoxPanel,
  CardScreenshot,
  Dropzone,
  FileCard,
  HudFrame,
  HudInfoBox,
  Image,
  ImageLightbox,
  ImagePreview,
  Splitter,
  SummaryPill,
  Surface,
  Upload,
  useUpload,
  type UploadFile,
  type UploadHandler,
} from '@/shared/ui';
import { AnnotationLayer } from '@/shared/ui/media/image-annotator';
import { flattenAnnotations } from '@/shared/ui/media/image-annotator/utils/flatten-image.utils';
import { readDirectoryDrop, type DropReadResult } from '@/shared/ui/media/upload/utils/drop.utils';
import { createDeferred, type Deferred } from '@tests/helpers/deferred';

vi.mock('@/shared/ui/media/upload/utils/drop.utils', () => ({ readDirectoryDrop: vi.fn() }));

vi.mock('@/shared/ui/media/image-annotator/utils/flatten-image.utils', () => ({
  decodeImage: vi.fn(() => Promise.resolve({ width: 100, height: 50, close: () => undefined })),
  flattenAnnotations: vi.fn(),
}));

const readDirectoryDropMock = vi.mocked(readDirectoryDrop);
const flattenMock = vi.mocked(flattenAnnotations);

const textFile = (name: string) => new File(['x'], name, { type: 'text/plain' });
const imageFile = (name: string) => new File(['x'], name, { type: 'image/png' });

function dropFiles(target: Element, files: File[]) {
  fireEvent.drop(target, { dataTransfer: { files, items: [], types: ['Files'] } });
}

function stubObjectUrls() {
  const original = { create: URL.createObjectURL, revoke: URL.revokeObjectURL };
  const revoke = vi.fn();
  let seq = 0;
  const define = (key: 'createObjectURL' | 'revokeObjectURL', value: unknown) =>
    Object.defineProperty(URL, key, { configurable: true, writable: true, value });
  define(
    'createObjectURL',
    vi.fn(() => `blob:xem-truoc-${++seq}`),
  );
  define('revokeObjectURL', revoke);
  return {
    revoke,
    restore: () => {
      define('createObjectURL', original.create);
      define('revokeObjectURL', original.revoke);
    },
  };
}

afterEach(() => {
  vi.unstubAllGlobals();
  readDirectoryDropMock.mockReset();
  flattenMock.mockReset();
});

describe('Splitter — đo lại khi khung có kích thước, kéo được bằng phím', () => {
  type Observer = { callback: ResizeObserverCallback; target?: Element };
  let observers: Observer[] = [];

  beforeEach(() => {
    observers = [];
    vi.stubGlobal(
      'ResizeObserver',
      class {
        private readonly entry: Observer;
        constructor(callback: ResizeObserverCallback) {
          this.entry = { callback };
          observers.push(this.entry);
        }
        observe(target: Element) {
          this.entry.target = target;
        }
        unobserve() {}
        disconnect() {}
      },
    );
  });

  function renderHidden(onResize = vi.fn()) {
    const { container } = render(
      <Splitter initialSize="40%" onResize={onResize}>
        <div>Cây</div>
        <div>Bảng</div>
      </Splitter>,
    );
    const root = container.querySelector<HTMLElement>('[data-orientation]')!;
    return { root, firstPane: root.children[0] as HTMLElement, onResize };
  }

  function showContainer(root: HTMLElement, width: number) {
    Object.defineProperty(root, 'clientWidth', { configurable: true, value: width });
    act(() => {
      observers
        .filter((o) => o.target === root)
        .forEach((o) => o.callback([], {} as ResizeObserver));
    });
  }

  it('mount trong khung 0px rồi khung hiện ra → tự đo, pane chốt có bề rộng thật', () => {
    const { root, firstPane } = renderHidden();
    expect(firstPane.style.width).toBe('');

    showContainer(root, 1000);

    expect(firstPane.style.width).toBe('400px');
    expect(screen.getByRole('separator')).toHaveAttribute('aria-valuenow', '40');
  });

  it('tay nắm đổi cỡ bằng ←/→ (Shift = bước lớn) và gọi onResize', () => {
    const { root, firstPane, onResize } = renderHidden();
    showContainer(root, 1000);
    const handle = screen.getByRole('separator', { name: 'Đổi kích thước khung' });

    fireEvent.keyDown(handle, { key: 'ArrowRight' });
    expect(firstPane.style.width).toBe('410px');
    expect(onResize).toHaveBeenLastCalledWith(410);

    fireEvent.keyDown(handle, { key: 'ArrowLeft', shiftKey: true });
    expect(firstPane.style.width).toBe('360px');
  });

  it('khung ngang (hai pane trái / phải) có tay nắm đứng: aria-orientation="vertical"', () => {
    renderHidden();
    expect(screen.getByRole('separator')).toHaveAttribute('aria-orientation', 'vertical');
  });
});

describe('HudFrame — chấm khoá góc', () => {
  const dots = (container: HTMLElement) =>
    Array.from(container.querySelectorAll<HTMLElement>('span.rounded-full'));

  it('notch=false: chấm nằm sát góc vuông (cách viền 1px), không lơ lửng theo notchSize', () => {
    const { container } = render(
      <HudFrame intensity="cyber" notch={false}>
        <div />
      </HudFrame>,
    );
    const [topLeft, bottomRight] = dots(container);
    expect(topLeft.style.left).toBe('1px');
    expect(topLeft.style.top).toBe('1px');
    expect(bottomRight.style.right).toBe('1px');
    expect(bottomRight.style.bottom).toBe('1px');
  });

  it('có vát góc: chấm đứng ở chân cạnh vát (offset = notchSize)', () => {
    const { container } = render(
      <HudFrame intensity="cyber" notchSize={16}>
        <div />
      </HudFrame>,
    );
    const [topLeft, bottomRight] = dots(container);
    expect(topLeft.style.left).toBe('16px');
    expect(bottomRight.style.bottom).toBe('16px');
  });
});

describe('Không in chữ "0" lạc / không dựng dải rỗng', () => {
  it('CardScreenshot actionIcons={[]} không in "0"', () => {
    const { container } = render(<CardScreenshot actionIcons={[]} title="Mặt bằng" />);
    expect(container).toHaveTextContent(/^Mặt bằng$/);
  });

  it('SummaryPill hint={0} không in "0"', () => {
    render(<SummaryPill animate={false} hint={0} icon="cube-bold" label="Hồ sơ" value="12" />);
    expect(screen.queryByText('0')).not.toBeInTheDocument();
  });

  it('BoxPanel footer={null} không dựng dải chân; có nội dung thì có', () => {
    const { container, rerender } = render(
      <BoxPanel footer={null} title="Danh sách">
        nội dung
      </BoxPanel>,
    );
    expect(container.querySelector('.border-t')).toBeNull();

    rerender(
      <BoxPanel footer="Cập nhật 5 phút trước" title="Danh sách">
        nội dung
      </BoxPanel>,
    );
    expect(screen.getByText('Cập nhật 5 phút trước')).toHaveClass('border-t');
  });
});

describe('Ảnh bấm được — bàn phím và tên tiếng Việt', () => {
  it('Image: `rounded` sinh class bo góc thật', () => {
    render(<Image alt="Thư mục rỗng" name="folder-empty" rounded="md" />);
    expect(screen.getByRole('img', { name: 'Thư mục rỗng' })).toHaveClass('rounded-md');
  });

  it('Image preview: là nút "Xem ảnh …", Enter mở lightbox', async () => {
    const user = userEvent.setup();
    render(<Image alt="Thư mục rỗng" name="folder-empty" preview />);

    screen.getByRole('button', { name: 'Xem ảnh Thư mục rỗng' }).focus();
    await user.keyboard('{Enter}');

    expect(await screen.findByRole('dialog', { name: 'Thư mục rỗng' })).toBeInTheDocument();
  });

  it('ImagePreview onClick: Tab tới được, Enter / Space gọi onClick; không ảnh thì không phải nút', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    const { rerender } = render(<ImagePreview alt="Ảnh hồ sơ" src="/a.png" onClick={onClick} />);

    await user.tab();
    expect(screen.getByRole('button', { name: 'Ảnh hồ sơ' })).toHaveFocus();
    await user.keyboard('{Enter}');
    await user.keyboard(' ');
    expect(onClick).toHaveBeenCalledTimes(2);

    rerender(<ImagePreview alt="Ảnh hồ sơ" onClick={onClick} />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('CardScreenshot preview: nút phủ ảnh tới được bằng bàn phím, nút hành động vẫn là nút riêng', async () => {
    const user = userEvent.setup();
    const remove = vi.fn();
    render(
      <CardScreenshot
        actionIcons={[{ name: 'trash-bold', label: 'Xoá', onClick: remove }]}
        alt="Tầng 3"
        preview
        src="/a.png"
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Xoá' }));
    expect(remove).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    screen.getByRole('button', { name: 'Xem ảnh Tầng 3' }).focus();
    await user.keyboard('{Enter}');
    expect(await screen.findByRole('dialog', { name: 'Tầng 3' })).toBeInTheDocument();
  });
});

describe('ImageLightbox — phím và lăn chuột', () => {
  const noop = () => undefined;

  it('alt rỗng → tiêu đề hộp thoại "Xem ảnh"; nút đóng có tên "Đóng"', () => {
    render(<ImageLightbox open src="/a.png" onOpenChange={noop} />);
    expect(screen.getByRole('dialog', { name: 'Xem ảnh' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Đóng' })).toBeInTheDocument();
  });

  it('total ≤ 1: ←/→ không bị bắt, không gọi onNext / onPrev', () => {
    const onNext = vi.fn();
    const onPrev = vi.fn();
    render(
      <ImageLightbox
        navigation={{ index: 0, total: 1, onNext, onPrev }}
        open
        src="/a.png"
        onOpenChange={noop}
      />,
    );

    const event = new KeyboardEvent('keydown', { key: 'ArrowRight', cancelable: true });
    window.dispatchEvent(event);
    expect(onNext).not.toHaveBeenCalled();
    expect(event.defaultPrevented).toBe(false);
  });

  it('total > 1: → gọi onNext', () => {
    const onNext = vi.fn();
    render(
      <ImageLightbox
        navigation={{ index: 0, total: 3, onNext, onPrev: noop }}
        open
        src="/a.png"
        onOpenChange={noop}
      />,
    );
    fireEvent.keyDown(window, { key: 'ArrowRight' });
    expect(onNext).toHaveBeenCalledTimes(1);
  });

  it('lăn chuột chỉ zoom khi ở trên vùng ảnh, không zoom khi ở trên thanh công cụ', () => {
    render(<ImageLightbox alt="Ảnh" open src="/a.png" onOpenChange={noop} />);
    const viewport = screen.getByRole('img', { name: 'Ảnh' }).parentElement!.parentElement!;

    fireEvent.wheel(screen.getByRole('button', { name: 'Phóng to' }), { deltaY: -100 });
    expect(screen.getByText('100%')).toBeInTheDocument();

    fireEvent.wheel(viewport, { deltaY: -100 });
    expect(screen.getByText('125%')).toBeInTheDocument();
  });
});

describe('AnnotationLayer — lưu ảnh đã chú thích', () => {
  const props = {
    fileName: 'a.png',
    initialShapes: [],
    layout: null,
    rotation: 0,
    saving: false,
    onNatural: () => undefined,
    onCancel: () => undefined,
  };

  async function startSave(onSave = vi.fn()) {
    const pending = createDeferred<File>();
    flattenMock.mockReturnValue(pending.promise);
    const view = render(<AnnotationLayer {...props} source={new Blob(['a'])} onSave={onSave} />);
    const save = screen.getByRole('button', { name: 'Lưu' });
    await waitFor(() => expect(save).toBeEnabled());
    fireEvent.click(save);
    expect(flattenMock).toHaveBeenCalledTimes(1);
    return { ...view, onSave, pending, save };
  }

  it('đổi `source` khi đang nung ảnh → kết quả cũ bị bỏ, nút Lưu không kẹt loading', async () => {
    const { rerender, onSave, pending, save } = await startSave();

    rerender(<AnnotationLayer {...props} source={new Blob(['b'])} onSave={onSave} />);
    await act(async () => pending.resolve(new File(['x'], 'a.png')));

    expect(onSave).not.toHaveBeenCalled();
    expect(save).not.toHaveAttribute('aria-busy');
  });

  it('unmount khi đang nung ảnh → không gọi onSave, không cảnh báo', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const { unmount, onSave, pending } = await startSave();

    unmount();
    await act(async () => pending.resolve(new File(['x'], 'a.png')));

    expect(onSave).not.toHaveBeenCalled();
    expect(consoleError).not.toHaveBeenCalled();
    consoleError.mockRestore();
  });

  it('nung xong bình thường → onSave nhận tệp đúng một lần', async () => {
    const { onSave, pending } = await startSave();
    const file = new File(['x'], 'a.png');

    await act(async () => pending.resolve(file));

    expect(onSave).toHaveBeenCalledTimes(1);
    expect(onSave).toHaveBeenCalledWith({ file, shapes: [] });
  });
});

describe('Kéo-thả thư mục — đúng thứ tự thả, không giao sau unmount', () => {
  const folderRead = (files: File[] = []): DropReadResult => ({
    files,
    folderPaths: [],
    hasRootFile: true,
  });

  function queueReads(count: number): Deferred<DropReadResult>[] {
    const reads = Array.from({ length: count }, () => createDeferred<DropReadResult>());
    reads.forEach((read) => readDirectoryDropMock.mockReturnValueOnce(read.promise));
    return reads;
  }

  it('Dropzone: lần thả sau đọc xong trước vẫn được giao SAU lần thả trước', async () => {
    const [first, second] = queueReads(2);
    const onDrop = vi.fn();
    render(
      <Dropzone onDrop={onDrop}>
        <div>Bảng tệp</div>
      </Dropzone>,
    );
    const zone = screen.getByText('Bảng tệp').parentElement!;

    dropFiles(zone, [textFile('a.txt')]);
    dropFiles(zone, [textFile('b.txt')]);
    await act(async () => second.resolve(folderRead()));
    expect(onDrop).not.toHaveBeenCalled();

    await act(async () => first.resolve(folderRead()));
    expect(onDrop.mock.calls.map(([payload]) => payload.files[0].name)).toEqual(['a.txt', 'b.txt']);
  });

  it('Dropzone: unmount trước khi đọc xong → không gọi onDrop; đọc lỗi không chặn lần sau', async () => {
    const [failed, later] = queueReads(2);
    const onDrop = vi.fn();
    const { unmount } = render(
      <Dropzone onDrop={onDrop}>
        <div>Bảng tệp</div>
      </Dropzone>,
    );
    const zone = screen.getByText('Bảng tệp').parentElement!;

    dropFiles(zone, [textFile('a.txt')]);
    dropFiles(zone, [textFile('b.txt')]);
    await act(async () => failed.reject(new Error('không đọc được')));
    await act(async () => later.resolve(folderRead()));
    expect(onDrop.mock.calls.map(([payload]) => payload.files[0].name)).toEqual(['b.txt']);

    queueReads(1);
    dropFiles(zone, [textFile('c.txt')]);
    unmount();
    expect(onDrop).toHaveBeenCalledTimes(1);
  });

  it('Upload directoryOnly: unmount trước khi đọc xong → không gọi onFiles / onDirectories', async () => {
    const [read] = queueReads(1);
    const onFiles = vi.fn();
    const onDirectories = vi.fn();
    const { unmount } = render(
      <Upload directoryOnly onDirectories={onDirectories} onFiles={onFiles} />,
    );

    dropFiles(screen.getByRole('button', { name: /Kéo thả tệp/ }), []);
    unmount();
    await act(async () =>
      read.resolve({ files: [textFile('a.txt')], folderPaths: ['ho-so'], hasRootFile: false }),
    );

    expect(onDirectories).not.toHaveBeenCalled();
    expect(onFiles).not.toHaveBeenCalled();
  });
});

describe('useUpload — multiple=false thay tệp, retry không mở lượt thứ hai', () => {
  function controlledHandler() {
    const calls: { file: File; signal: AbortSignal; result: Deferred<string> }[] = [];
    const handler: UploadHandler = (file, { signal }) => {
      const result = createDeferred<string>();
      calls.push({ file, signal, result });
      return result.promise;
    };
    return { handler, calls };
  }

  it('chọn tệp mới khi tệp cũ đang tải: huỷ lượt cũ, thu hồi previewUrl, kết quả muộn bị bỏ', async () => {
    const urls = stubObjectUrls();
    const { handler, calls } = controlledHandler();
    const onFileSettled = vi.fn();
    const { result } = renderHook(() =>
      useUpload({ multiple: false, onUpload: handler, onFileSettled }),
    );

    act(() => {
      result.current.addFiles([imageFile('cu.png')]);
    });
    act(() => {
      result.current.addFiles([textFile('moi.txt')]);
    });

    expect(calls[0].signal.aborted).toBe(true);
    expect(urls.revoke).toHaveBeenCalledWith('blob:xem-truoc-1');
    await act(async () => calls[0].result.resolve('/cu.png'));
    expect(onFileSettled).not.toHaveBeenCalled();
    expect(result.current.files.map((f: UploadFile) => f.name)).toEqual(['moi.txt']);
    urls.restore();
  });

  it('maxFiles=1 + multiple=false: tệp mới THAY tệp cũ, không bị loại vì "vượt số lượng"', () => {
    const onReject = vi.fn();
    const { result } = renderHook(() => useUpload({ multiple: false, maxFiles: 1, onReject }));

    act(() => {
      result.current.addFiles([textFile('a.txt')]);
    });
    act(() => {
      result.current.addFiles([textFile('b.txt')]);
    });

    expect(onReject).not.toHaveBeenCalled();
    expect(result.current.files.map((f: UploadFile) => f.name)).toEqual(['b.txt']);
  });

  it('retryFile khi tệp đang tải → bỏ qua, handler chỉ chạy một lượt', () => {
    const { handler, calls } = controlledHandler();
    const { result } = renderHook(() => useUpload({ onUpload: handler }));

    let added: UploadFile[] = [];
    act(() => {
      added = result.current.addFiles([textFile('a.txt')]);
    });
    act(() => result.current.retryFile(added[0].id));

    expect(calls).toHaveLength(1);
    expect(calls[0].signal.aborted).toBe(false);
  });
});

describe('Thẻ bấm được bằng bàn phím', () => {
  const file: UploadFile = {
    id: '1',
    name: 'ho-so.pdf',
    size: 1024,
    type: 'application/pdf',
    status: 'success',
    progress: 100,
  };

  it('FileCard onClick: Enter trên thẻ gọi onClick; Enter trên nút Xoá không gọi onClick', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    const onRemove = vi.fn();
    const { container } = render(<FileCard file={file} onClick={onClick} onRemove={onRemove} />);

    (container.firstElementChild as HTMLElement).focus();
    await user.keyboard('{Enter}');
    expect(onClick).toHaveBeenCalledTimes(1);

    screen.getByRole('button', { name: 'Xoá tệp' }).focus();
    await user.keyboard('{Enter}');
    expect(onRemove).toHaveBeenCalledTimes(1);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('HudInfoBox onClick: Enter / Space kích hoạt', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <HudInfoBox title="Khu A" onClick={onClick}>
        nội dung
      </HudInfoBox>,
    );

    await user.tab();
    await user.keyboard('{Enter}');
    await user.keyboard(' ');
    expect(onClick).toHaveBeenCalledTimes(2);
  });
});

describe('Surface as="button"', () => {
  it('tự gắn type="button" — bấm trong form không gửi form', () => {
    const onSubmit = vi.fn((e: React.FormEvent) => e.preventDefault());
    render(
      <form onSubmit={onSubmit}>
        <Surface as="button" interactive>
          Mở chi tiết
        </Surface>
      </form>,
    );
    const box = screen.getByRole('button', { name: 'Mở chi tiết' });
    expect(box).toHaveAttribute('type', 'button');
    fireEvent.click(box);
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
