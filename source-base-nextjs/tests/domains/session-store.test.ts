/**
 * Store phiên — kiểm đúng những điều dễ làm sai nhất:
 *  1. access token KHÔNG được rơi vào localStorage
 *  2. hồ sơ đọc lại từ localStorage là đầu vào KHÔNG tin cậy — kiểm ở MỌI lần khôi phục, cả khi
 *     cùng version (zustand chỉ gọi `migrate` khi version lệch)
 *  3. khoá `next-base:auth` cố định — đổi khoá là đăng xuất mọi người
 *
 * Kiểm quyền: `session-permission.test.ts`.
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { establishSession, useSessionStore } from '@/domains/session';
import { SESSION_STORAGE } from '@/domains/session/model/session.constants';

const USER = {
  id: 'u1',
  email: 'a@b.vn',
  name: 'A',
  roles: ['editor'],
  permissions: ['user:view', 'user:create'],
};

beforeEach(() => {
  useSessionStore.setState(useSessionStore.getInitialState(), true);
  localStorage.clear();
});

describe('store phiên', () => {
  it('KHÔNG persist access token xuống localStorage', () => {
    establishSession({ accessToken: 'secret-token', user: USER });
    expect(JSON.stringify(localStorage)).not.toContain('secret-token');
  });

  it('KHÔNG persist `status` — F5 phải hỏi lại máy chủ', () => {
    establishSession({ accessToken: 't', user: USER });
    expect(JSON.stringify(localStorage)).not.toContain('authenticated');
  });

  it('`establishSession` đưa trạng thái về authenticated, có token', () => {
    establishSession({ accessToken: 't', user: USER });
    expect(useSessionStore.getState()).toMatchObject({ status: 'authenticated', accessToken: 't' });
  });

  it('ghi đúng khoá `next-base:auth`, kèm version hiện tại, chỉ có hồ sơ', () => {
    establishSession({ accessToken: 't', user: USER });

    expect(SESSION_STORAGE.key).toBe('next-base:auth');
    expect(JSON.parse(localStorage.getItem(SESSION_STORAGE.key) ?? 'null')).toEqual({
      state: { user: USER },
      version: SESSION_STORAGE.version,
    });
  });
});

describe('khôi phục hồ sơ từ localStorage', () => {
  const rehydrateWith = async (stored: unknown, version: number = SESSION_STORAGE.version) => {
    localStorage.setItem(SESSION_STORAGE.key, JSON.stringify({ state: { user: stored }, version }));
    await useSessionStore.persist.rehydrate();
    return useSessionStore.getState().user;
  };

  it.each([
    ['cùng version', SESSION_STORAGE.version],
    ['bản cũ chưa có version (0)', 0],
  ])('hồ sơ hợp lệ được dùng lại (%s)', async (_name, version) => {
    await expect(rehydrateWith(USER, version)).resolves.toEqual(USER);
  });

  it('⛔ hồ sơ của bản app cũ (thiếu roles/permissions) được điền mặc định, không làm nổ kiểm quyền', async () => {
    const user = await rehydrateWith({ id: 'u1', email: 'a@b.vn', name: 'A' }, 0);
    expect(user).toMatchObject({ roles: [], permissions: [] });
  });

  it.each([
    ['chuỗi lạ', 'rác'],
    ['thiếu id', { email: 'a@b.vn', name: 'A' }],
    ['null', null],
  ])('⛔ dữ liệu hỏng (%s) CÙNG version → coi như chưa có hồ sơ', async (_name, stored) => {
    await expect(rehydrateWith(stored)).resolves.toBeNull();
  });

  it('⛔ field lạ trong phần đã lưu (token, status) không lọt vào store', async () => {
    localStorage.setItem(
      SESSION_STORAGE.key,
      JSON.stringify({
        state: { user: USER, accessToken: 'token-gia', status: 'authenticated' },
        version: SESSION_STORAGE.version,
      }),
    );
    await useSessionStore.persist.rehydrate();

    expect(useSessionStore.getState()).toMatchObject({
      user: USER,
      accessToken: null,
      status: 'idle',
    });
  });
});

describe('localStorage hỏng không được làm hỏng phiên', () => {
  it('⛔ ghi lỗi (hết quota, trình duyệt chặn lưu trữ) → đăng nhập vẫn xong, không ném', () => {
    const write = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('Bộ nhớ trình duyệt đầy', 'QuotaExceededError');
    });

    expect(() => establishSession({ accessToken: 't', user: USER })).not.toThrow();
    expect(useSessionStore.getState()).toMatchObject({ status: 'authenticated', user: USER });

    write.mockRestore();
  });
});
