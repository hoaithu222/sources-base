/**
 * Khoá + bản dữ liệu phiên ở localStorage (zustand `persist`) — đổi hình dạng phần được lưu thì tăng
 * `version`. Khoá có tiền tố `next-base:` như mọi store persist: đổi khoá là đăng xuất mọi người dùng
 * đang có hồ sơ lưu.
 */
export const SESSION_STORAGE = { key: 'next-base:auth', version: 1 } as const;
