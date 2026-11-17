import { useMemo } from 'react';

import { useAuthStore } from '@/shell/store/slices/auth';
import { userHasPermission } from '@/shell/store/slices/auth/permissions';
import { appConfig } from '@/core/config/env.config';

import { MODULE_REGISTRY } from './module-registry';
import type { ModuleConfig } from './types';

/**
 * Danh sách phân hệ người dùng hiện tại được vào.
 *
 * ⛔ ĐÂY LÀ NƠI DUY NHẤT lọc phân hệ theo quyền.
 *
 * Thanh tab, menu bên, ô tìm nhanh — mọi nơi hiển thị danh sách phân hệ đều
 * phải gọi hook này. Chỗ nào tự lọc riêng thì sớm muộn hai bộ luật sẽ lệch
 * nhau, và triệu chứng là: tab không hiện ra nhưng ô tìm nhanh vẫn liệt kê, bấm
 * vào thì màn hình trắng. Loại bug đó không ai báo vì trông như "app hơi lạ".
 *
 * ⚠️ Đây là lọc để HIỂN THỊ, không phải hàng rào bảo mật. Người dùng vẫn gõ
 * được đường dẫn hoặc mở deep link tới màn hình bị ẩn. Hàng rào thật nằm ở
 * backend — nó phải từ chối mọi request không đủ quyền, bất kể client vẽ gì.
 */
export function useAccessibleModules(): ModuleConfig[] {
  /**
   * Lấy chính `user` chứ KHÔNG lấy hàm `hasPermission` của store.
   *
   * `hasPermission` là tham chiếu CỐ ĐỊNH (zustand không tạo lại action), nên
   * nếu `useMemo` chỉ phụ thuộc vào nó thì danh sách sẽ KHÔNG tính lại khi quyền
   * của người dùng đổi — vd sau khi quản trị viên đổi vai trò và app làm mới hồ
   * sơ. Người dùng phải khởi động lại app mới thấy phân hệ mới.
   *
   * Phụ thuộc vào `user` thì tính lại đúng lúc, và `userHasPermission` là hàm
   * thuần nên vẫn dùng chung MỘT bộ luật với store.
   */
  const user = useAuthStore((state) => state.user);

  return useMemo(() => {
    // Tắt xác thực ⇒ hiện hết. Đây là chế độ dựng giao diện khi chưa có backend;
    // lọc theo quyền lúc này sẽ giấu sạch mọi phân hệ vì không có `user` nào.
    if (!appConfig.authEnabled) return MODULE_REGISTRY;

    return MODULE_REGISTRY.filter(
      (module) =>
        !module.permission ||
        userHasPermission(user, module.permission.resource, module.permission.action),
    );
  }, [user]);
}

/** Phân hệ hiện trên thanh tab (đã lọc quyền, đã bỏ mục ẩn). */
export function useTabModules(): ModuleConfig[] {
  const modules = useAccessibleModules();
  return useMemo(() => modules.filter((module) => !module.hiddenInTabBar), [modules]);
}
