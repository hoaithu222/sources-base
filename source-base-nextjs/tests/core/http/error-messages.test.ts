/**
 * Registry câu lỗi của tầng HTTP — `errorMessages()` · `configureErrorMessages` · `messageOfCode` · `messageOfStatus`.
 *
 * Câu nằm ở `src/messages/<locale>/errors.json` (khoá `http`); `LocaleSync` đặt bộ câu theo ngôn ngữ đang hiển thị. Tầng HTTP
 * chạy ngoài React nên đọc registry LƯỜI lúc dựng lỗi: đổi ngôn ngữ giữa chừng thì lỗi MỚI đổi theo, không cần dựng lại client.
 * Mặc định là tiếng Việt (ngôn ngữ nguồn) để code / test chạy trước khi provider đăng ký vẫn có câu đọc được.
 */

import { AxiosError } from 'axios';
import { afterEach, describe, expect, it } from 'vitest';

import { configureErrorMessages, toAppError } from '@/core/http';
import { errorMessages, messageOfCode, messageOfStatus } from '@/core/http/errors/error-messages';
import { resolveErrorMessage } from '@/core/http/errors/to-app-error';
import enErrors from '@/messages/en/errors.json';
import viErrors from '@/messages/vi/errors.json';

afterEach(() => configureErrorMessages(viErrors.http));

describe('mặc định (chưa cấu hình)', () => {
  it('là bộ câu tiếng Việt — ngôn ngữ nguồn', () => {
    expect(errorMessages()).toBe(viErrors.http);
    expect(messageOfCode('AUTH_001')).toBe('Email hoặc mật khẩu không đúng');
    expect(messageOfStatus(404)).toBe('Không tìm thấy tài nguyên');
  });
});

describe('tra cứu', () => {
  it('mã lỗi / status chưa ánh xạ → `undefined` (nơi gọi tự chọn câu dự phòng)', () => {
    expect(messageOfCode('KHONG_CO_MA_NAY')).toBeUndefined();
    expect(messageOfCode('')).toBeUndefined();
    expect(messageOfStatus(418)).toBeUndefined();
    expect(messageOfStatus(0)).toBeUndefined();
  });

  it('không rò thuộc tính của Object.prototype như một mã lỗi', () => {
    expect(messageOfCode('constructor')).toBeUndefined();
    expect(messageOfCode('toString')).toBeUndefined();
    expect(messageOfCode('__proto__')).toBeUndefined();
  });

  it('⛔ BE gửi mã trùng thuộc tính của Object.prototype → câu lỗi vẫn là chuỗi, không phải hàm', () => {
    for (const code of ['constructor', 'toString', 'hasOwnProperty']) {
      const fromCode = resolveErrorMessage(400, { error: { code } });
      const fromMessage = resolveErrorMessage(400, { message: code });
      expect(typeof fromCode, code).toBe('string');
      expect(typeof fromMessage, code).toBe('string');
    }
  });

  it('mọi mã lỗi và status của bản nguồn đều tra ra đúng câu', () => {
    for (const [code, text] of Object.entries(viErrors.http.codes)) {
      expect(messageOfCode(code), code).toBe(text);
    }
    for (const [status, text] of Object.entries(viErrors.http.status)) {
      expect(messageOfStatus(Number(status)), status).toBe(text);
    }
  });
});

describe('configureErrorMessages — đổi ngôn ngữ', () => {
  it('tra cứu theo bộ câu mới ngay lập tức', () => {
    configureErrorMessages(enErrors.http);

    expect(errorMessages()).toBe(enErrors.http);
    expect(messageOfCode('AUTH_001')).toBe(enErrors.http.codes.AUTH_001);
    expect(messageOfStatus(403)).toBe(enErrors.http.status['403']);
    expect(messageOfCode('AUTH_001')).not.toBe(viErrors.http.codes.AUTH_001);
  });

  it('lỗi dựng SAU khi đổi ngôn ngữ mang câu mới; lỗi dựng trước giữ câu cũ', () => {
    const before = toAppError(new AxiosError('timeout', 'ECONNABORTED'));
    configureErrorMessages(enErrors.http);
    const after = toAppError(new AxiosError('timeout', 'ECONNABORTED'));

    expect(before.message).toBe(viErrors.http.timeout);
    expect(after.message).toBe(enErrors.http.timeout);
  });

  it('mọi câu dự phòng của `toAppError` theo ngôn ngữ: mất mạng · quá hạn · huỷ · lỗi lạ', () => {
    configureErrorMessages(enErrors.http);

    expect(resolveErrorMessage(undefined, undefined)).toBe(enErrors.http.network);
    expect(toAppError(new DOMException('Aborted', 'AbortError')).message).toBe(
      enErrors.http.canceled,
    );
    expect(toAppError(new TypeError('Cannot read properties')).message).toBe(
      enErrors.http.fallback,
    );
    expect(toAppError('chuỗi', undefined).message).toBe(enErrors.http.fallback);
  });

  it('ưu tiên giữ nguyên: mã lỗi đã ánh xạ → câu BE gửi kèm → câu theo status → câu dự phòng', () => {
    configureErrorMessages(enErrors.http);

    expect(resolveErrorMessage(401, { error: { code: 'AUTH_001', message: 'x' } })).toBe(
      enErrors.http.codes.AUTH_001,
    );
    // Câu do BE viết là của BE — không dịch, không thay.
    expect(resolveErrorMessage(400, { message: 'Project name already taken' })).toBe(
      'Project name already taken',
    );
    expect(resolveErrorMessage(404, {})).toBe(enErrors.http.status['404']);
    expect(resolveErrorMessage(418, {})).toBe(enErrors.http.fallback);
  });

  it('mã CHƯA ánh xạ không lộ ra giao diện ở bất kỳ ngôn ngữ nào', () => {
    for (const http of [viErrors.http, enErrors.http]) {
      configureErrorMessages(http);
      expect(resolveErrorMessage(400, { message: 'PROJECT_ALREADY_EXISTS' })).toBe(
        http.status['400'],
      );
    }
  });

  it('khôi phục về tiếng Việt cho lỗi dựng sau đó', () => {
    configureErrorMessages(enErrors.http);
    configureErrorMessages(viErrors.http);
    expect(toAppError(new AxiosError('timeout', 'ECONNABORTED')).message).toBe(
      viErrors.http.timeout,
    );
  });
});

describe('bộ câu của mọi ngôn ngữ đủ để registry hoạt động', () => {
  it.each([
    ['vi', viErrors.http],
    ['en', enErrors.http],
  ] as const)('`%s` có đủ câu nền, mã lỗi và status của bản nguồn', (_locale, http) => {
    for (const key of ['fallback', 'canceled', 'timeout', 'network', 'contract'] as const) {
      expect(http[key].trim(), key).not.toBe('');
    }
    expect(Object.keys(http.codes).sort()).toEqual(Object.keys(viErrors.http.codes).sort());
    expect(Object.keys(http.status).sort()).toEqual(Object.keys(viErrors.http.status).sort());
  });
});
