import type { ReactNode } from 'react';

import type { SystemIconName } from '@/shared/ui';

/**
 * page-header.types.ts — dữ liệu `nav` của `<PageHeader>`: nhóm tab segmented + action đứng sau tên trang.
 */

/** Tab chỉ có chữ — không icon (nhóm segmented đọc gọn); đừng thêm field `icon`. */
export interface PageHeaderNavItem {
  key: string;
  label: string;
  /**
   * Nhãn RÚT GỌN cho màn < 1280px / máy chạm; bỏ trống → dùng `label`. ĐIỀN cho tab nhãn dài (> ~12
   * ký tự): tab `shrink-0` không co. KHÔNG rút xuống icon-only.
   */
  shortLabel?: string;
  /**
   * URL thật của tab — BẮT BUỘC khi state tab nằm trên URL (`?tab=…` / route riêng) để chuột phải /
   * Ctrl+click mở được tab mới. Tab sống trong `useState` / store là sai — đẩy state lên URL.
   */
  href?: string;
}

/**
 * Action đứng NGAY SAU nhóm tab (vd "Cài đặt"): bấm là chạy lệnh, không đổi `active`, không
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

/** Nút HÀNH ĐỘNG của trang trên thanh header (`PageHeader actions`): xuất, tạo mới, làm mới… */
export interface PageHeaderAction extends PageHeaderNavAction {
  /** Hành động CHÍNH (≤ 1 mỗi trang): viên đặc có chữ; còn lại là nút icon tròn. */
  primary?: boolean;
  /** Nội dung tooltip thay `label` (vd giờ cập nhật chạy theo đồng hồ). */
  hint?: ReactNode;
  disabled?: boolean;
}

export interface PageHeaderNavConfig {
  items: readonly PageHeaderNavItem[];
  /** `key` của mục đang mở. */
  active: string;
  onSelect: (key: string) => void;
  /** Action phụ đứng sau chip cuối. Bỏ trống → không render gì. */
  actions?: readonly PageHeaderNavAction[];
  /**
   * Khoá CẢ CỤM khi lý do khoá chung cho mọi chip. Khoá ở ĐÂY, đừng chỉ `return` sớm trong
   * `onSelect`: chip vẫn sáng mà bấm không phản hồi, người dùng đọc ra như app treo.
   */
  disabled?: boolean;
}

/** Một lựa chọn của bộ lọc dạng DANH SÁCH (`PageHeaderFilter.options`). */
export interface PageHeaderFilterOption {
  value: string;
  label: string;
  /** Dòng phụ dưới tên ("Năm 2026 · lũy kế đến 19/10"). */
  description?: string;
  /** Số / chữ ngắn canh phải ("12 lô"). */
  meta?: string;
  icon?: SystemIconName;
}

/**
 * Một BỘ LỌC của trang (`PageHeader filters`): máy tính = một icon nhỏ trên CỘT DỌC sát mép phải (bấm mở bảng nổi chứa
 * `content` hoặc danh sách `options`); điện thoại = một dòng trong bảng của nút phễu trên top bar.
 */
export interface PageHeaderFilter {
  key: string;
  /** Tên bộ lọc — tiêu đề bảng nổi + tooltip ("Kỳ kế toán"). */
  label: string;
  icon: SystemIconName;
  /** Giá trị đang chọn, đọc nhanh trong tooltip mà không cần mở ("Tháng 10/2026"). */
  value?: string;
  /** Khác mặc định → chấm báo trên icon (và cộng vào số trên nút phễu). */
  active?: boolean;
  /** Điều khiển lọc tự dựng (Dropdown, SegmentToggle…) — tự giãn đủ bề ngang bảng nổi. */
  content?: ReactNode;
  /** Thay `content`: DANH SÁCH chọn dọc dựng sẵn — bấm một dòng là chọn + đóng bảng (một chạm, không dropdown lồng). */
  options?: readonly PageHeaderFilterOption[];
  /** `value` của lựa chọn đang chọn trong `options`. */
  selected?: string;
  onSelect?: (value: string) => void;
}
