/**
 * `shared/utils/validation/file.utils` — nguồn DUY NHẤT kiểm tệp tải lên (trước đây 3 nơi: UI kit `validateFile`,
 * `upload-guards` 308 dòng không ai dùng, `matchesAccept` nằm lạc trong `file-size.utils`).
 */

import { afterEach, describe, expect, it } from 'vitest';

import { configureZodLocale } from '@/core/config';
import enMessages from '@/messages/en';
import viMessages from '@/messages/vi';
import { getExtension, matchesAccept, validateFile } from '@/shared/utils/validation/file.utils';

const fileOf = (name: string, type = '', size = 10) =>
  new File([new Uint8Array(size)], name, { type });

describe('getExtension', () => {
  it.each([
    ['bao-cao.PDF', 'pdf'],
    ['a.tar.gz', 'gz'],
    ['README', ''],
    ['a.', ''],
  ])('%s → %j', (name, ext) => {
    expect(getExtension(name)).toBe(ext);
  });
});

describe('matchesAccept', () => {
  it('đuôi, MIME đầy đủ, MIME có sao; `accept` rỗng nhận mọi tệp', () => {
    expect(matchesAccept(fileOf('a.PDF'), '.pdf')).toBe(true);
    expect(matchesAccept(fileOf('a.bin', 'application/pdf'), 'application/pdf')).toBe(true);
    expect(matchesAccept(fileOf('a.png', 'image/png'), 'image/*, .pdf')).toBe(true);
    expect(matchesAccept(fileOf('a.txt', 'text/plain'), 'image/*,.pdf')).toBe(false);
    expect(matchesAccept(fileOf('a.txt'), '')).toBe(true);
  });
});

describe('validateFile', () => {
  it('kiểm dung lượng TRƯỚC định dạng, trả lỗi đầu tiên', () => {
    const big = fileOf('a.exe', 'application/x-msdownload', 2048);
    expect(validateFile(big, { accept: '.pdf', maxSize: 1024 })?.code).toBe('file-too-large');
    expect(validateFile(big, { accept: '.pdf' })?.code).toBe('file-invalid-type');
    expect(validateFile(fileOf('a.pdf'), { accept: '.pdf', maxSize: 1024 })).toBeNull();
  });
});

describe('validateFile — câu lỗi theo ngôn ngữ đang cấu hình', () => {
  afterEach(() => configureZodLocale('vi', viMessages.validation));

  const big = fileOf('a.exe', 'application/x-msdownload', 2048);

  it('vi (mặc định): dung lượng điền "{size}" bằng `formatFileSize`, định dạng có câu riêng', () => {
    expect(validateFile(big, { maxSize: 1024 })?.message).toBe('Tệp vượt quá 1 KB');
    expect(validateFile(big, { accept: '.pdf' })?.message).toBe('Định dạng tệp không được hỗ trợ');
  });

  it('en: cùng mã lỗi, câu đổi sang en (chốt lúc gọi hàm)', () => {
    configureZodLocale('en', enMessages.validation);

    expect(validateFile(big, { maxSize: 1024 })).toEqual({
      code: 'file-too-large',
      message: 'File exceeds 1 KB',
    });
    expect(validateFile(big, { accept: '.pdf' })).toEqual({
      code: 'file-invalid-type',
      message: 'File type is not supported',
    });
  });
});
