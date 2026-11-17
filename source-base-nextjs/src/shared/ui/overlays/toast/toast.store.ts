import { create } from 'zustand';
import type { ToastActionSpec, ToastType } from './Toast';

/**
 * useToastStore — hàng đợi toast toàn cục (zustand) mà `ToastContainer` vẽ ra.
 * Dùng:   qua `showToast()` / `dismissToast()` / `updateToast()` (`toast.api.ts`), không gọi thẳng.
 * Lưu ý:  `add` bỏ toast trùng (type + title + description trong 500ms) và trả `''` khi bỏ;
 *         id là bộ đếm, KHÔNG dùng `crypto.randomUUID` — API này không có trên `http` ngoài
 *         localhost (TV / kiosk qua IP LAN).
 */

interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  duration?: number;
  action?: ToastActionSpec;
}

interface ToastStore {
  toasts: ToastItem[];
  /** Đẩy toast vào hàng đợi; trả `id` để dismiss / update sau (chuỗi rỗng khi bị dedup). */
  add: (item: Omit<ToastItem, 'id'>) => string;
  update: (id: string, patch: Partial<Omit<ToastItem, 'id'>>) => void;
  remove: (id: string) => void;
}

const DEDUP_WINDOW_MS = 500;
const recentSignatures = new Map<string, number>();
let toastSeq = 0;

function isDuplicate(sig: string): boolean {
  const now = Date.now();
  const last = recentSignatures.get(sig);
  for (const [k, t] of recentSignatures) {
    if (now - t > DEDUP_WINDOW_MS * 2) recentSignatures.delete(k);
  }
  if (last !== undefined && now - last < DEDUP_WINDOW_MS) return true;
  recentSignatures.set(sig, now);
  return false;
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  add: (item) => {
    const sig = `${item.type}::${item.title}::${item.description ?? ''}`;
    if (isDuplicate(sig)) return '';
    const id = `toast-${++toastSeq}`;
    set((s) => ({ toasts: [...s.toasts, { ...item, id }] }));
    return id;
  },
  update: (id, patch) =>
    set((s) => ({
      toasts: s.toasts.map((t) => (t.id === id ? { ...t, ...patch } : t)),
    })),
  remove: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));
