import type { AppIconName, AppTileTone } from '@/shared/ui';

/**
 * work-tabs.types.ts — dữ liệu của LỊCH SỬ THẺ LÀM VIỆC (多页签 kiểu ERP Kingdee / Yonyou): mỗi màn hình đã mở là một thẻ.
 */

export interface WorkTab {
  /** `pathname` — khoá duy nhất của thẻ. */
  path: string;
  /** Query lần cuối đứng ở màn này (bộ lọc, tab trong trang…) — bấm thẻ là quay lại đúng chỗ. */
  search: string;
  /** Tên ngắn của thẻ (tiêu đề route sâu nhất), vd "Sổ cái". */
  title: string;
  /** Tên đầy đủ — dòng phụ trong bảng lịch sử, vd "Tài chính · Sổ cái". */
  fullTitle?: string;
  icon?: AppIconName;
  tone?: AppTileTone;
  pinned?: boolean;
  /** Lần mở gần nhất (ms, tăng ngặt theo từng lần mở) — 3 thẻ gần nhất lên đầu lịch sử; đủ thẻ thì bỏ thẻ CŨ nhất. */
  visitedAt: number;
}

/** Thông tin màn đang mở do tầng app đẩy vào (`visit`). */
export type WorkTabVisit = Omit<WorkTab, 'pinned' | 'visitedAt'>;

/** Lệnh trên một thẻ (nút ghim / × của dòng, "Đóng các thẻ khác" của bảng lịch sử) — `path` của thẻ đi kèm. */
export type WorkTabCommand = 'close' | 'close-others' | 'close-right' | 'pin';

/** Hướng chuyển thẻ bằng phím tắt: thẻ trước / thẻ sau theo thứ tự mở. */
export type WorkTabStep = 'prev' | 'next';

/** Phần mép màn bị Dock chiếm (px) — bảng lịch sử thẻ né ra (vd Dock đáy `{ bottom: 80 }`). */
export interface WorkTabsEdgeInset {
  right?: number;
  bottom?: number;
}
