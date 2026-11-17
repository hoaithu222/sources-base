/**
 * Chuẩn hoá lỗi + che log.
 *
 * `resolveErrorMessage` là hàm ánh xạ thông điệp DUY NHẤT (bản trước có hai hàm
 * với thứ tự ưu tiên khác nhau). Bài này chốt thứ tự đó.
 */

import { AxiosError, AxiosHeaders } from 'axios';
import { describe, expect, it } from 'vitest';

import { AppError, errorMessageOf, isRetryableError, toAppError } from '@/core/http';
import { errorMessages } from '@/core/http/errors/error-messages';
import { resolveErrorMessage } from '@/core/http/errors/to-app-error';
import { redactSecrets } from '@/core/http/redact-secrets';

describe('resolveErrorMessage — thứ tự ưu tiên', () => {
  it('mã lỗi đã ánh xạ thắng câu BE gửi kèm', () => {
    expect(resolveErrorMessage(401, { error: { code: 'AUTH_001', message: 'Invalid' } })).toBe(
      'Email hoặc mật khẩu không đúng',
    );
  });

  it('câu của BE thắng câu theo HTTP status', () => {
    expect(resolveErrorMessage(400, { message: 'Tên dự án đã tồn tại' })).toBe(
      'Tên dự án đã tồn tại',
    );
    expect(resolveErrorMessage(400, { Message: 'Viết kiểu .NET' })).toBe('Viết kiểu .NET');
  });

  it('mã CHƯA ánh xạ không được đưa nguyên ra giao diện', () => {
    expect(resolveErrorMessage(400, { message: 'PROJECT_ALREADY_EXISTS' })).toBe(
      'Yêu cầu không hợp lệ',
    );
    expect(resolveErrorMessage(200, { status: false, errorCode: 'SOME_NEW_CODE' })).toBe(
      errorMessages().fallback,
    );
  });

  it('BaseResponse của .NET: dùng `parameters` khi nó là một câu', () => {
    expect(
      resolveErrorMessage(200, {
        status: false,
        errorCode: 'X_Y',
        parameters: 'Mã kế hoạch đã có',
      }),
    ).toBe('Mã kế hoạch đã có');
  });

  it('ProblemDetails: lấy lỗi trường đầu tiên, bỏ title chung chung', () => {
    expect(
      resolveErrorMessage(400, {
        title: 'One or more validation errors occurred.',
        errors: { Name: ['Tên không được trống'] },
      }),
    ).toBe('Tên không được trống');
  });

  it('không có phản hồi → câu mất mạng', () => {
    expect(resolveErrorMessage(undefined, undefined)).toMatch(/Không thể kết nối/);
  });
});

describe('toAppError', () => {
  it('giữ nguyên `AppError`', () => {
    const error = new AppError('business', 'x');
    expect(toAppError(error)).toBe(error);
  });

  it('quá thời gian chờ → `timeout`', () => {
    expect(toAppError(new AxiosError('timeout', 'ECONNABORTED')).kind).toBe('timeout');
  });

  it('AbortError của trình duyệt → `canceled`', () => {
    expect(toAppError(new DOMException('Aborted', 'AbortError')).kind).toBe('canceled');
  });

  it('lỗi thường / chuỗi / thứ lạ → `unknown` mang câu dự phòng, câu thô chỉ ở `cause`', () => {
    const raw = new TypeError('Cannot read properties of undefined');
    const error = toAppError(raw);
    expect(error.kind).toBe('unknown');
    expect(error.message).toBe(errorMessages().fallback);
    expect(error.cause).toBe(raw);

    expect(toAppError('chuỗi').message).toBe(errorMessages().fallback);
    expect(toAppError(null, 'mặc định').message).toBe('mặc định');
  });

  it('HTTP 408 → `timeout` kèm câu quá thời gian chờ', () => {
    const error = toAppError(
      new AxiosError('timeout', AxiosError.ERR_BAD_REQUEST, undefined, null, {
        status: 408,
        statusText: '408',
        data: {},
        headers: {},
        config: { headers: new AxiosHeaders() },
      }),
    );
    expect(error.kind).toBe('timeout');
    expect(error.message).toMatch(/quá lâu/);
  });
});

describe('errorMessageOf / isRetryableError', () => {
  it('lỗi KHÔNG phải của tầng HTTP thì không lộ `message` thô', () => {
    expect(
      errorMessageOf(new TypeError('Cannot read properties of undefined'), 'Thử lại sau'),
    ).toBe('Thử lại sau');
    expect(errorMessageOf(new AppError('business', 'Email đã dùng'), 'Thử lại sau')).toBe(
      'Email đã dùng',
    );
  });

  it('chỉ thử lại khi hạ tầng trục trặc', () => {
    expect(isRetryableError(new AppError('network', 'x'))).toBe(true);
    expect(isRetryableError(new AppError('server', 'x', { status: 503 }))).toBe(true);
    expect(isRetryableError(new AppError('business', 'x', { status: 429 }))).toBe(true);
    expect(isRetryableError(new AppError('validation', 'x', { status: 422 }))).toBe(false);
    expect(isRetryableError(new AppError('unauthorized', 'x', { status: 401 }))).toBe(false);
    expect(isRetryableError(new Error('x'))).toBe(false);
  });
});

describe('redactSecrets', () => {
  it('che mọi biến thể khoá nhạy cảm, không phân biệt hoa thường', () => {
    expect(
      redactSecrets({ email: 'a@b.vn', newPassword: 'x', Access_Token: 'y', nested: { otp: 1 } }),
    ).toEqual({
      email: 'a@b.vn',
      newPassword: '[đã ẩn]',
      Access_Token: '[đã ẩn]',
      nested: { otp: '[đã ẩn]' },
    });
  });

  it('⛔ vượt độ sâu giới hạn thì THAY THẾ, không trả nguyên object', () => {
    const deep = { a: { b: { c: { d: { password: 'lộ' } } } } };
    expect(JSON.stringify(redactSecrets(deep))).not.toContain('lộ');
  });

  it('payload lồng vòng không làm treo', () => {
    const loop: Record<string, unknown> = { name: 'x' };
    loop.self = loop;
    expect(() => redactSecrets(loop)).not.toThrow();
  });
});
