/**
 * `validators.utils` — helper Zod dùng chung. Câu lỗi mặc định đọc LƯỜI lúc parse từ `validationMessages()` (cấu hình bằng
 * `configureZodLocale`): schema dựng ở module-level (trước khi ngôn ngữ được đặt) vẫn đổi chữ theo ngôn ngữ đang hiển thị;
 * `msg` truyền tường minh luôn thắng.
 */

import { afterEach, describe, expect, it } from 'vitest';
import { z } from 'zod';

import { configureZodLocale } from '@/core/config';
import enMessages from '@/messages/en';
import viMessages from '@/messages/vi';
import {
  buildCodeSet,
  emailField,
  ensureRangeOrder,
  ipv4Field,
  ipv4WithPortField,
  optionalEmailField,
  optionalPhoneField,
  optionalText,
  passwordField,
  percentField,
  phoneField,
  positiveIntField,
  requiredText,
  strongPasswordField,
  urlField,
} from '@/shared/utils/validation/validators.utils';

const useEn = () => configureZodLocale('en', enMessages.validation);

afterEach(() => configureZodLocale('vi', viMessages.validation));

/** Câu lỗi đầu tiên của lần parse, hoặc `undefined` khi hợp lệ. */
function errorOf(schema: z.ZodType, value: unknown): string | undefined {
  const result = schema.safeParse(value);
  return result.success ? undefined : result.error.issues[0]?.message;
}

describe('validators — hành vi hợp lệ / không hợp lệ', () => {
  it('requiredText: tự trim, chuỗi toàn khoảng trắng bị từ chối', () => {
    expect(requiredText().parse('  An  ')).toBe('An');
    expect(errorOf(requiredText(), '   ')).toBeDefined();
  });

  it('optionalText / optionalEmailField / optionalPhoneField: rỗng hoặc thiếu → `""`', () => {
    expect(optionalText().parse(undefined)).toBe('');
    expect(optionalText().parse('  ')).toBe('');
    expect(optionalEmailField().parse(undefined)).toBe('');
    expect(optionalPhoneField().parse('')).toBe('');
    expect(errorOf(optionalEmailField(), 'sai')).toBeDefined();
    expect(errorOf(optionalPhoneField(), '123')).toBeDefined();
  });

  it('emailField: chặt hơn `.email()` (không `..`, không dấu chấm đầu / cuối)', () => {
    expect(errorOf(emailField(), 'an@example.com')).toBeUndefined();
    expect(errorOf(emailField(), 'a..b@example.com')).toBeDefined();
    expect(errorOf(emailField(), '.a@example.com')).toBeDefined();
    expect(errorOf(emailField(), `${'a'.repeat(250)}@x.com`)).toBeDefined();
  });

  it('phoneField: di động VN hoặc E.164', () => {
    expect(errorOf(phoneField(), '0912345678')).toBeUndefined();
    expect(errorOf(phoneField(), '+84912345678')).toBeUndefined();
    expect(errorOf(phoneField(), '0112345678')).toBeDefined();
  });

  it('ipv4Field / ipv4WithPortField / urlField', () => {
    expect(errorOf(ipv4Field(), '192.168.1.1')).toBeUndefined();
    expect(errorOf(ipv4Field(), '256.1.1.1')).toBeDefined();
    expect(errorOf(ipv4WithPortField(), '192.168.1.1:8080')).toBeUndefined();
    expect(errorOf(ipv4WithPortField(), '192.168.1.1:70000')).toBeDefined();
    expect(errorOf(urlField(), 'https://example.com/a?b=1#c')).toBeUndefined();
    expect(errorOf(urlField(), 'ftp://example.com')).toBeDefined();
  });

  it('passwordField / strongPasswordField: không trim; mạnh = chữ hoa + chữ thường + số (+ ký tự đặc biệt khi bật)', () => {
    expect(errorOf(passwordField(), '      ')).toBeUndefined();
    expect(errorOf(passwordField(8), 'abc')).toBeDefined();
    expect(errorOf(strongPasswordField(), 'Abcdefg1')).toBeUndefined();
    expect(errorOf(strongPasswordField(), 'abcdefg1')).toBeDefined();
    expect(errorOf(strongPasswordField({ requireSpecial: true }), 'Abcdefg1')).toBeDefined();
    expect(errorOf(strongPasswordField({ requireSpecial: true }), 'Abcdefg1!')).toBeUndefined();
  });

  it('percentField / positiveIntField nhận cả chuỗi số', () => {
    expect(percentField().parse('50')).toBe(50);
    expect(errorOf(percentField(), '101')).toBeDefined();
    expect(positiveIntField().parse('0')).toBe(0);
    expect(errorOf(positiveIntField(), '1.5')).toBeDefined();
    expect(errorOf(positiveIntField(), '-1')).toBeDefined();
  });

  it('ensureRangeOrder: lỗi gắn vào ô kết thúc; thiếu một đầu thì bỏ qua', () => {
    const schema = z
      .object({ from: z.string().optional(), to: z.string().optional() })
      .refine(...ensureRangeOrder('from', 'to'));

    expect(
      schema.safeParse({ from: '2026-01-02', to: '2026-01-01' }).error?.issues[0]?.path,
    ).toEqual(['to']);
    expect(schema.safeParse({ from: '2026-01-01', to: '2026-01-01' }).success).toBe(true);
    expect(schema.safeParse({ from: '2026-01-01' }).success).toBe(true);
  });

  it('buildCodeSet: trim + UPPERCASE, bỏ bản ghi đang sửa', () => {
    const items = [
      { id: 1, code: ' ab ' },
      { id: 2, code: 'cd' },
      { id: 3, code: '  ' },
    ];

    expect([...buildCodeSet(items, 2, (i) => i.code)]).toEqual(['AB']);
    expect([...buildCodeSet(items, undefined, (i) => i.code)]).toEqual(['AB', 'CD']);
  });
});

describe('validators — câu lỗi mặc định theo ngôn ngữ (vi)', () => {
  it.each([
    ['requiredText', () => requiredText(), '', 'Bắt buộc'],
    ['emailField', () => emailField(), 'sai', 'Email không đúng định dạng'],
    [
      'emailField (quá dài)',
      () => emailField(),
      `${'a'.repeat(250)}@x.com`,
      'Email tối đa 254 ký tự',
    ],
    ['phoneField', () => phoneField(), '123', 'Số điện thoại không hợp lệ'],
    ['ipv4Field', () => ipv4Field(), '1.1.1', 'IP không hợp lệ'],
    ['ipv4WithPortField', () => ipv4WithPortField(), '1.1.1.1', 'IP:Port không hợp lệ'],
    ['urlField', () => urlField(), 'abc', 'URL không hợp lệ'],
    ['passwordField', () => passwordField(8), 'abc', 'Mật khẩu tối thiểu 8 ký tự'],
    ['passwordField (max)', () => passwordField(1, 3), 'abcd', 'Mật khẩu tối đa 3 ký tự'],
    ['strongPasswordField', () => strongPasswordField(), 'abcdefgh', 'Phải có chữ hoa'],
    ['percentField', () => percentField(), '101', 'Giá trị phải từ 0 đến 100'],
    ['positiveIntField', () => positiveIntField(), '-1', 'Phải là số nguyên không âm'],
  ])('%s', (_name, build, value, expected) => {
    expect(errorOf(build(), value)).toBe(expected);
  });

  it('`string.min(1)` / `array.min(1)` trần dùng `required` / `selectAtLeastOne`', () => {
    expect(errorOf(z.string().min(1), '')).toBe('Không được để trống');
    expect(errorOf(z.array(z.string()).min(1), [])).toBe('Bắt buộc chọn ít nhất 1 mục');
  });
});

describe('validators — câu lỗi mặc định theo ngôn ngữ (en)', () => {
  it.each([
    ['requiredText', () => requiredText(), '', 'Required'],
    ['emailField', () => emailField(), 'sai', 'Invalid email format'],
    [
      'emailField (quá dài)',
      () => emailField(),
      `${'a'.repeat(250)}@x.com`,
      'Email must be at most 254 characters',
    ],
    ['phoneField', () => phoneField(), '123', 'Invalid phone number'],
    ['ipv4Field', () => ipv4Field(), '1.1.1', 'Invalid IP address'],
    ['ipv4WithPortField', () => ipv4WithPortField(), '1.1.1.1', 'Invalid IP:Port'],
    ['urlField', () => urlField(), 'abc', 'Invalid URL'],
    ['passwordField', () => passwordField(8), 'abc', 'Password must be at least 8 characters'],
    [
      'passwordField (max)',
      () => passwordField(1, 3),
      'abcd',
      'Password must be at most 3 characters',
    ],
    [
      'strongPasswordField',
      () => strongPasswordField(),
      'abcdefgh',
      'Must contain an uppercase letter',
    ],
    ['percentField', () => percentField(), '101', 'Value must be between 0 and 100'],
    ['positiveIntField', () => positiveIntField(), '-1', 'Must be a non-negative integer'],
  ])('%s', (_name, build, value, expected) => {
    useEn();

    expect(errorOf(build(), value)).toBe(expected);
  });

  it('`string.min(1)` / `array.min(1)` trần dùng `required` / `selectAtLeastOne` của en', () => {
    useEn();

    expect(errorOf(z.string().min(1), '')).toBe('This field is required');
    expect(errorOf(z.array(z.string()).min(1), [])).toBe('Select at least one item');
  });

  it('ensureRangeOrder: câu lỗi đọc lúc parse', () => {
    const schema = z
      .object({ from: z.string(), to: z.string() })
      .refine(...ensureRangeOrder('from', 'to'));
    const value = { from: '2026-01-02', to: '2026-01-01' };

    expect(errorOf(schema, value)).toBe('Ngày bắt đầu phải nhỏ hơn hoặc bằng ngày kết thúc');
    useEn();
    expect(errorOf(schema, value)).toBe('Start date must be on or before the end date');
  });
});

describe('validators — LƯỜI: schema dựng một lần, đổi ngôn ngữ sau đó vẫn theo kịp', () => {
  const schema = z.object({ name: requiredText(), email: emailField() });
  const bad = { name: ' ', email: 'sai' };

  const messages = () => {
    const result = schema.safeParse(bad);
    return result.success ? [] : result.error.issues.map((issue) => issue.message);
  };

  it('vi → en → vi trên CÙNG một schema', () => {
    expect(messages()).toEqual(['Bắt buộc', 'Email không đúng định dạng']);

    useEn();
    expect(messages()).toEqual(['Required', 'Invalid email format']);

    configureZodLocale('vi', viMessages.validation);
    expect(messages()).toEqual(['Bắt buộc', 'Email không đúng định dạng']);
  });

  it('`msg` tường minh thắng ở mọi ngôn ngữ', () => {
    const custom = z.object({ name: requiredText('Nhập tên'), email: emailField('Sai email') });

    useEn();

    expect(errorOf(custom.shape.name, '')).toBe('Nhập tên');
    expect(errorOf(custom.shape.email, 'sai')).toBe('Sai email');
  });
});
