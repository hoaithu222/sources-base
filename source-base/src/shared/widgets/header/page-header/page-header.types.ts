import type { SystemIconName } from '@/shared/ui';

/**
 * page-header.types.ts — dữ liệu `nav` của `<PageHeader>`: tab + action ghim hai bên bảng tên.
 */

/** Chip tab chỉ có chữ — không icon (đồng bộ bảng tên); đừng thêm field `icon`. */
export interface PageHeaderNavItem {
  key: string;
  label: string;
  /**
   * Nhãn RÚT GỌN cho màn < 1024px / máy chạm; bỏ trống → dùng `label`. ĐIỀN cho tab nhãn dài (> ~12
   * ký tự): chip `shrink-0` không co, iPad dễ hết biên. KHÔNG rút xuống icon-only.
   */
  shortLabel?: string;
  /**
   * URL thật của tab — BẮT BUỘC khi state tab nằm trên URL (`?tab=…` / route riêng) để chuột phải /
   * Ctrl+click mở được tab mới. Tab sống trong `useState` / store là sai — đẩy state lên URL.
   */
  href?: string;
}

/**
 * Action ghim NGAY SAU chip tab cuối (vd "Cài đặt"): bấm là chạy lệnh, không đổi `active`, không
 * sáng lên. Render icon-only + tooltip (`label` cũng là tên cho trình đọc màn hình).
 */
export interface PageHeaderNavAction {
  key: string;
  label: string;
  icon: SystemIconName;
  /** Đi tới trang → có `href` (chip thành `<a>`); mở modal / lệnh tại chỗ → bỏ trống. */
  href?: string;
  newTab?: boolean;
  onSelect: () => void;
}

export interface PageHeaderNavConfig {
  items: readonly PageHeaderNavItem[];
  /** `key` của mục đang mở. */
  active: string;
  onSelect: (key: string) => void;
  /** Action phụ đứng sau chip cuối. Bỏ trống → không render gì. */
  actions?: readonly PageHeaderNavAction[];
  /** Số chip ghim ở cụm TRÁI bảng tên. Bỏ trống → chia đôi danh sách. */
  splitAt?: number;
  /**
   * Khoá CẢ CỤM khi lý do khoá chung cho mọi chip. Khoá ở ĐÂY, đừng chỉ `return` sớm trong
   * `onSelect`: chip vẫn sáng mà bấm không phản hồi, người dùng đọc ra như app treo.
   */
  disabled?: boolean;
}
