import type { ModuleConfig } from './types';

/**
 * Danh mục PHÂN HỆ của app — nguồn duy nhất cho thanh tab dưới và cho việc
 * kiểm quyền vào từng phân hệ.
 *
 * ── Chia việc với Expo Router thế nào ────────────────────────────────────────
 * Expo Router đã lo phần "đường dẫn nào mở màn hình nào" bằng chính cây thư mục
 * `app/`. Bảng này lo phần mà cây thư mục KHÔNG nói được:
 *
 *   · nhãn và biểu tượng trên thanh tab,
 *   · thứ tự các tab,
 *   · quyền cần có để nhìn thấy phân hệ đó,
 *   · phân hệ nào ẩn khỏi thanh tab (vẫn vào được bằng đường dẫn).
 *
 * Đây cũng là điểm nối để sau này thêm ô tìm nhanh (⌘K) hay menu bên: chúng đọc
 * CÙNG bảng này, nên một phân hệ mới hiện ra ở mọi nơi mà không phải sửa thêm chỗ.
 *
 * ── Thêm phân hệ mới = 1 file route + 1 mục ở đây ───────────────────────────
 *
 *   1. Tạo `app/(app)/reports.tsx`
 *   2. Thêm vào mảng dưới:
 *
 *        {
 *          id: 'report',                 // cũng là `resource` khi kiểm quyền
 *          name: 'reports',              // PHẢI trùng TÊN FILE ở bước 1
 *          href: '/reports',
 *          title: 'Báo cáo',
 *          icon: 'chart-1',              // tên THẬT trong `assets/icons/system`
 *          permission: { resource: 'report', action: 'view' },
 *        }
 *
 * ⛔ `name` phải trùng ĐÚNG tên file (không đuôi). Sai một ký tự thì Expo Router
 * không tìm thấy màn hình cho khai báo `<Tabs.Screen>` đó, và tab hiện ra nhưng
 * bấm vào không có gì — không có lỗi nào báo.
 */
export const MODULE_REGISTRY: ModuleConfig[] = [
  {
    id: 'home',
    name: 'index',
    href: '/',
    title: 'Trang chủ',
    icon: 'home',
    // Trang chủ ai đăng nhập cũng vào được — không gắn quyền.
  },
  {
    id: 'profile',
    name: 'profile',
    href: '/profile',
    title: 'Cá nhân',
    icon: 'user',
  },
  {
    id: 'settings',
    name: 'settings',
    href: '/settings',
    title: 'Cài đặt',
    icon: 'setting',
  },
];
