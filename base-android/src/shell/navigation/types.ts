import type { Href } from 'expo-router';

import type { IconName, IconVariant } from '@/shared/ui/icon';

/** Quyền cần có để nhìn thấy và vào một phân hệ. */
export interface ModulePermission {
  resource: string;
  action: string;
}

export interface ModuleConfig {
  /**
   * Định danh phân hệ. Cũng dùng làm `resource` mặc định khi kiểm quyền, nên
   * đặt theo danh từ nghiệp vụ (`report`, `contract`) chứ không phải theo màn
   * hình (`report-screen`).
   */
  id: string;

  /**
   * Tên file route trong `app/(app)/`, KHÔNG kèm đuôi.
   * ⛔ Sai tên thì tab hiện ra nhưng bấm không vào đâu cả — xem `module-registry.ts`.
   */
  name: string;

  /** Đường dẫn để điều hướng tới. Được kiểm kiểu nhờ `experiments.typedRoutes`. */
  href: Href;

  /** Nhãn trên thanh tab và trên tiêu đề màn hình. */
  title: string;

  /**
   * Biểu tượng, lấy từ bộ icon của repo (`@/shared/ui/icon`).
   *
   * ⛔ KHÔNG dùng `@expo/vector-icons` nữa. Nét của Ionicons lệch hẳn với bản
   * thiết kế, và để hai bộ icon song song thì thanh tab là chỗ lộ ra rõ nhất:
   * icon tab một kiểu, icon trong màn hình một kiểu.
   *
   * Gõ sai tên là `tsc` đỏ ngay — `IconName` là union thật của 303 tên sinh ra
   * từ `assets/icons/` (`npm run generate:icons`). ⛔ Đừng chép con số này đi
   * chỗ khác: thêm/bớt một file `.svg` là nó đổi, và
   * `src/shared/ui/icon/icon-names.generated.ts` mới là nguồn duy nhất.
   */
  icon: IconName;

  /**
   * Kiểu nét lúc tab ĐANG MỞ. Mặc định `twotone` — icon được TÔ ĐẶC thêm một tầng.
   *
   * Đây không phải trang trí. Trên màn hình nhỏ, khác biệt MÀU giữa tab đang mở
   * và tab thường là quá tinh tế dưới nắng ngoài trời (và với người mù màu thì
   * gần như không thấy). Đổi hẳn hình khối rỗng → đặc là tín hiệu đọc được
   * trong mọi điều kiện.
   *
   * ⚠️ Không phải icon nào cũng đủ bốn nét. Thiếu thì `<Icon>` tự rơi về
   * `linear` — lúc đó tab đang mở chỉ khác nhau ở màu, nên hãy tra
   * `assets/icons/system` trước khi chọn tên cho một phân hệ mới.
   */
  activeVariant?: IconVariant;

  /**
   * Quyền cần có. Bỏ trống ⇒ ai đăng nhập cũng vào được.
   * Người có vai trò `admin` luôn qua — xem `hasPermission` ở auth store.
   */
  permission?: ModulePermission;

  /**
   * Ẩn khỏi thanh tab nhưng VẪN vào được bằng đường dẫn hoặc deep link.
   * Dùng cho màn hình phụ mà tab dưới đã đủ chật.
   */
  hiddenInTabBar?: boolean;
}
