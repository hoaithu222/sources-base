import type { DockModeOption } from './dock.types';

/**
 * dock-settings.constants.ts — nhãn UI của panel cấu hình Dock.
 *
 * Dùng:   DOCK_MODE_OPTIONS.map(…) → các hàng chọn chế độ (`parts/dock-settings-panel.tsx`); store dùng
 *         cùng danh sách để kiểm `mode` khôi phục từ localStorage.
 */

/** Thứ tự mảng = thứ tự hàng trên panel cấu hình, từ "hiện nhiều" tới "hiện ít". */
export const DOCK_MODE_OPTIONS: readonly DockModeOption[] = [
  {
    value: 'pinned',
    icon: 'location-pin-bold',
    label: 'Ghim cố định',
    description: 'Luôn hiển thị Dock',
  },
  {
    value: 'autohide',
    icon: 'eye-slash-bold',
    label: 'Tự ẩn',
    description: 'Hiện khi rê chuột vào giữa đáy',
  },
  {
    value: 'collapsed',
    icon: 'angle-up-bold',
    label: 'Thu gọn',
    description: 'Co thành tay nắm nhỏ sát đáy',
  },
  {
    value: 'hidden',
    icon: 'do-not-enter-bold',
    label: 'Ẩn hoàn toàn',
    description: 'Không để lại gợi ý nào trên màn',
  },
];
