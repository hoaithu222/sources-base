import type { AppIconName } from '@/shared/ui';

/**
 * tab-bar.types.ts — dữ liệu vào của `<TabBar>`.
 */

/** Một mục của `<TabBar items>` — tầng `app/` dựng danh sách; widget KHÔNG đọc registry nào. */
export interface TabBarItem {
  /** Khoá ổn định — dùng làm React key. */
  id: string;
  /** Tên đầy đủ: `aria-label` của ô và tiêu đề ô trong sheet "Thêm". */
  label: string;
  /** Nhãn NGẮN dưới icon (ô chỉ rộng ~64px); bỏ trống thì dùng `label`. */
  shortLabel?: string;
  icon: AppIconName;
  /** URL đích THẬT — ô là `<Link>` để chuột phải / giữ ngón tay mở được tab mới. */
  href: string;
  /** Gọi khi người dùng CÓ Ý ĐỊNH mở mục (focus, chạm) — vd nạp trước mã trang đích. Tuỳ chọn. */
  onIntent?: () => void;
}
