import { memo } from 'react';

import { HEADER_PLATE_CLASSES } from '../header.theme';
import type { HeaderPageMeta } from '../slots/header-slots.context';
import type { HeaderModule, HeaderNavItem } from './module-nav.types';

interface ModulePlateProps {
  module?: HeaderModule;
  activeItem?: HeaderNavItem;
  page: HeaderPageMeta | null;
}

/**
 * ModulePlate — KHỐI TIÊU ĐỀ giữa thanh header (thung lũng giữa hai khay cong, vạch vàng kim ở đáy): CHỈ tên trang `<h1>` — không vệt
 * phân hệ, không nút (‹ quay lại nằm bên trái thanh, màn hình của phân hệ là tab hai bên). Tên do `PageHeader` báo lên
 * (`page`, dòng phụ thành tooltip); trang không có `PageHeader` → tên màn hình đang mở, rồi tên phân hệ.
 *
 * @param props.module - Phân hệ đang mở (tên dự phòng cuối cùng).
 * @param props.activeItem - Màn hình đang mở (tên dự phòng khi trang không báo tên).
 * @param props.page - Thông tin trang từ `PageHeader` (`title` · `subtitle`).
 *
 * @example
 * <ModulePlate activeItem={screen} module={finance} page={page} />
 */
const ModulePlate = memo(function ModulePlate({ module, activeItem, page }: ModulePlateProps) {
  const title = page?.title ?? activeItem?.label ?? module?.title;
  if (!title) return null;
  const tooltip = page?.subtitle ? `${title} — ${page.subtitle}` : title;

  return (
    <div className={HEADER_PLATE_CLASSES.root}>
      <span aria-hidden className={HEADER_PLATE_CLASSES.glow} />
      <span aria-hidden className={HEADER_PLATE_CLASSES.accent} />
      <h1 className={HEADER_PLATE_CLASSES.title} title={tooltip}>
        {title}
      </h1>
    </div>
  );
});

export default ModulePlate;
