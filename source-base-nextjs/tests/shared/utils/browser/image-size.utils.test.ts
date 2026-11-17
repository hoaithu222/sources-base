/**
 * `image-size.utils` — có trong catalog `reuse-first.md` nhưng base chưa có màn nào gọi (API dọn sẵn
 * cho dự án kế thừa). Test vừa giữ hành vi, vừa là "nơi dùng" để knip không báo file mồ côi.
 */

import { afterEach, describe, expect, it, vi } from 'vitest';

import { readImageSize } from '@/shared/utils/browser/image-size.utils';

describe('image-size.utils', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('không phải ảnh → null, không gọi giải mã', async () => {
    const decode = vi.fn();
    vi.stubGlobal('createImageBitmap', decode);
    expect(await readImageSize(new File(['x'], 'a.pdf', { type: 'application/pdf' }))).toBeNull();
    expect(decode).not.toHaveBeenCalled();
  });

  it('ảnh → { width, height } và giải phóng bitmap', async () => {
    const close = vi.fn();
    vi.stubGlobal(
      'createImageBitmap',
      vi.fn().mockResolvedValue({ width: 640, height: 480, close }),
    );
    const size = await readImageSize(new File(['x'], 'a.png', { type: 'image/png' }));
    expect(size).toEqual({ width: 640, height: 480 });
    expect(close).toHaveBeenCalledOnce();
  });

  it('giải mã lỗi → null, KHÔNG ném', async () => {
    vi.stubGlobal('createImageBitmap', vi.fn().mockRejectedValue(new Error('svg')));
    expect(await readImageSize(new File(['x'], 'a.svg', { type: 'image/svg+xml' }))).toBeNull();
  });
});
