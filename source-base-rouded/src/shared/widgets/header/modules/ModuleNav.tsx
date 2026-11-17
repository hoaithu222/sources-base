import { memo } from 'react';
import { Link } from 'react-router-dom';

import { useFitCount } from '@/shared/hooks';
import { SystemIcon } from '@/shared/ui/icons/Icons';
import { cn } from '@/shared/utils/style/cn';

import { HEADER_SIDE_SELECTOR, HEADER_SIDE_TRAY_CLASSES, type HeaderSide } from '../header.theme';
import { MODULE_NAV_CLASSES } from './module-nav.theme';
import type { HeaderNavItem } from './module-nav.types';
import ModuleNavGroup from './parts/module-nav-group';
import ModuleNavMore from './parts/module-nav-more';

interface ModuleNavProps {
  items: readonly HeaderNavItem[];
  half: HeaderSide;
}

/** Khe giữa hai mục (`gap-1` — chừa chỗ cho chân loe của tab), px. */
const TRACK_GAP = 4;

const itemClass = (item: HeaderNavItem) =>
  cn(MODULE_NAV_CLASSES.link, item.active && MODULE_NAV_CLASSES.linkActive);

/** Mục vừa chỗ + mục bị dồn; mục ĐANG MỞ luôn ở lại thanh (đổi chỗ với mục vừa cuối cùng). */
function splitByFit(items: readonly HeaderNavItem[], count: number) {
  const activeIndex = items.findIndex((item) => item.active);
  if (count >= items.length) return { shown: items, hidden: [] as HeaderNavItem[] };
  if (activeIndex < count) return { shown: items.slice(0, count), hidden: items.slice(count) };
  const shown = [...items.slice(0, count - 1), items[activeIndex]];
  return { shown, hidden: items.filter((item) => !shown.includes(item)) };
}

/**
 * ModuleNav — dải MÀN HÌNH của phân hệ đang mở, CHIA ĐÔI ra hai bên khối tiêu đề giữa thanh (`half`: nửa đầu bên trái, nửa
 * sau bên phải) trong KHAY cong: mỗi trang con một TAB CONG đứng trên mép đáy, nhóm (layout có con) bung menu thả xuống;
 * mục đang mở = tab đặc. Header dựng khi trang KHÔNG có tab riêng (có thì hai bên là tab của trang).
 *
 * Tầng `app/shell/AppHeader.tsx` dựng `items` từ route con của phân hệ (`meta.title`, bỏ `hideInNav` / path động) —
 * thêm trang vào phân hệ là thanh tự có mục, không có danh sách thứ hai.
 * Hết chỗ: mục không vừa dồn vào nút "Thêm ▾" (`useFitCount` đo hàng ẩn) — không cắt chữ, không cuộn mù; mục đang mở luôn
 * ở lại. Sửa giao diện: `MODULE_NAV_CLASSES`.
 * Lưu ý: mọi mục là `<Link>` thật (`navigable-controls.md`); nút nhóm / "Thêm" là `<button>` vì chỉ MỞ menu.
 *
 * @param props.items - ĐỦ mục điều hướng (`HeaderNavItem[]`); ít hơn 2 mục → `null` (một trang thì không cần dải).
 * @param props.half - `left` = nửa đầu (làm tròn lên) · `right` = phần còn lại.
 *
 * @example
 * <ModuleNav half="left" items={nav} />
 */
const ModuleNav = memo(function ModuleNav({ items: allItems, half }: ModuleNavProps) {
  const cut = Math.ceil(allItems.length / 2);
  const items = half === 'left' ? allItems.slice(0, cut) : allItems.slice(cut);
  const { wrapperRef, measureRef, count } = useFitCount({
    itemCount: items.length,
    gap: TRACK_GAP,
    hostSelector: HEADER_SIDE_SELECTOR[half],
  });
  if (allItems.length < 2 || items.length === 0) return null;
  const { shown, hidden } = splitByFit(items, count);

  return (
    <div ref={wrapperRef} className={MODULE_NAV_CLASSES.fit}>
      <nav
        aria-label={half === 'left' ? 'Điều hướng phân hệ' : 'Điều hướng phân hệ (tiếp)'}
        className={cn(MODULE_NAV_CLASSES.root, HEADER_SIDE_TRAY_CLASSES[half])}
      >
        {shown.map((item) => (
          <div key={item.key} className={MODULE_NAV_CLASSES.item}>
            {item.children?.length ? (
              <ModuleNavGroup item={item} />
            ) : (
              <Link
                aria-current={item.active ? 'page' : undefined}
                className={itemClass(item)}
                to={item.href}
                onFocus={item.onIntent}
                onPointerEnter={item.onIntent}
              >
                {item.label}
              </Link>
            )}
          </div>
        ))}
        {hidden.length > 0 && (
          <div className={MODULE_NAV_CLASSES.item}>
            <ModuleNavMore items={hidden} />
          </div>
        )}
      </nav>
      <div ref={measureRef} aria-hidden className={MODULE_NAV_CLASSES.measure} inert>
        {items.map((item) => (
          <span key={item.key} className={itemClass(item)}>
            {item.label}
            {item.children?.length ? (
              <SystemIcon className={MODULE_NAV_CLASSES.caret} name="angle-down-bold" />
            ) : null}
          </span>
        ))}
        <span className={MODULE_NAV_CLASSES.link} data-fit-more>
          Thêm
          <SystemIcon className={MODULE_NAV_CLASSES.caret} name="angle-down-bold" />
        </span>
      </div>
    </div>
  );
});

export default ModuleNav;
