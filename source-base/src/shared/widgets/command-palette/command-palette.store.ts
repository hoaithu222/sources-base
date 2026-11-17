import { create } from 'zustand';

/**
 * command-palette.store — store CỤC BỘ của widget Command Palette: chỉ cờ mở / đóng.
 *
 * Dùng:   useCommandPaletteStore((s) => s.open) · `useCommandPaletteStore.getState().open()` (ngoài React)
 * Lưu ý:  là cầu nối HAI cây component (nút mở trên header ↔ hộp thoại mount ở gốc layout) nên không
 *         dùng `useDisclosure()`; không chứa dữ liệu nghiệp vụ — `groups` vào qua prop của `CommandPalette`.
 */

interface CommandPaletteState {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
}

export const useCommandPaletteStore = create<CommandPaletteState>((set) => ({
  isOpen: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
  toggle: () => set((s) => ({ isOpen: !s.isOpen })),
}));
