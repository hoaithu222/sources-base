/**
 * `decodeJwtPayload` — claim tiếng Việt. Hỏng ÂM THẦM: không ném, chỉ cho ra chữ sai.
 */

import { describe, expect, it } from 'vitest';

import { decodeJwtPayload } from '@/shared/utils/browser/jwt.utils';

/** Dựng một JWT giả — chỉ phần payload là thật, chữ ký không dùng tới. */
function fakeJwt(payload: Record<string, unknown>): string {
  const b64 = btoa(String.fromCharCode(...new TextEncoder().encode(JSON.stringify(payload))))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
  return `header.${b64}.signature`;
}

describe('decodeJwtPayload — claim tiếng Việt', () => {
  it('giữ nguyên dấu', () => {
    // `atob` trả latin1 (mỗi ký tự = một byte) nên đọc thẳng sẽ ra
    // "Nguyá»…n VÄƒn A". Và `JSON.parse` KHÔNG ném lỗi — hỏng hoàn toàn im lặng.
    const token = fakeJwt({ name: 'Nguyễn Văn A', sub: '42' });
    expect(decodeJwtPayload<{ name: string }>(token)?.name).toBe('Nguyễn Văn A');
  });

  it('token rỗng / hỏng trả null, không ném', () => {
    expect(decodeJwtPayload(null)).toBeNull();
    expect(decodeJwtPayload('khong-phai-jwt')).toBeNull();
  });
});
