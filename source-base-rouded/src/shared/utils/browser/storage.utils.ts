import { createJSONStorage } from 'zustand/middleware';

/**
 * storage.utils — `localStorage` KHÔNG BAO GIỜ ném lỗi: hết quota (`QuotaExceededError`), Safari riêng tư, iframe
 * sandbox, môi trường không có `window` → đọc ra `null`, ghi / xoá trả `false`, giá trị trong bộ nhớ vẫn dùng tiếp.
 *
 * Dùng:   safeStorage.setItem(key, JSON.stringify(v)) · safeStorage.getItem(key)
 *         persist(…, { name, storage: createSafeJSONStorage() })   // store zustand
 * Lưu ý:  ⛔ không gọi `localStorage.*` trần trong code mới — đi qua module này.
 */

function storageOrNull(): Storage | null {
  try {
    return typeof window === 'undefined' ? null : window.localStorage;
  } catch {
    return null;
  }
}

/** Bản `localStorage` an toàn — cùng chữ ký `StateStorage` của zustand; `setItem` / `removeItem` trả `true` khi ghi được. */
export const safeStorage = {
  getItem(key: string): string | null {
    try {
      return storageOrNull()?.getItem(key) ?? null;
    } catch {
      return null;
    }
  },
  setItem(key: string, value: string): boolean {
    try {
      const storage = storageOrNull();
      if (!storage) return false;
      storage.setItem(key, value);
      return true;
    } catch {
      return false;
    }
  },
  removeItem(key: string): boolean {
    try {
      const storage = storageOrNull();
      if (!storage) return false;
      storage.removeItem(key);
      return true;
    } catch {
      return false;
    }
  },
};

/** `storage` cho `persist` của zustand: JSON trên `safeStorage` — ghi lỗi không làm hỏng `set()` của store. */
export function createSafeJSONStorage<S>() {
  return createJSONStorage<S>(() => safeStorage);
}
