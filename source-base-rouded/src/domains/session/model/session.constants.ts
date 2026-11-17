/**
 * Khoá + bản dữ liệu phiên ở localStorage (zustand `persist`) — đổi hình dạng phần được lưu thì tăng
 * `version`. Giữ khoá `auth-storage` của bản cũ: đổi khoá là đăng xuất mọi người dùng đang có hồ sơ lưu.
 */
export const SESSION_STORAGE = { key: 'auth-storage', version: 1 } as const;
