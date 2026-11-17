import { memo, useMemo } from 'react';
import { useLocation } from 'react-router-dom';

import { cn } from '@/shared/utils/style/cn';

import TabCell from './parts/tab-cell';
import TabMoreSheet from './parts/tab-more-sheet';
import './tab-bar.css';
import { TAB_BAR_SLOT_CLASSES } from './tab-bar.theme';
import type { TabBarItem } from './tab-bar.types';
import { findActiveId, layoutTabBar } from './tab-bar.utils';

interface TabBarProps {
  items?: readonly TabBarItem[];
  moreLabel?: string;
  sheetTitle?: string;
  ariaLabel?: string;
  className?: string;
}

/**
 * TabBar — thanh điều hướng ĐÁY của điện thoại: ≤ 5 ô đều nhau (icon trên, nhãn một dòng dưới), ô đang mở đổi màu
 * (icon `duo` + nhãn ngọc). Quá 5 mục thì 4 mục đầu nằm trên thanh, ô "Thêm" mở sheet đáy liệt kê TẤT CẢ mục.
 *
 * Nằm TRONG luồng (không `fixed`): đặt làm anh em cuối của vùng cuộn trong khung `h-dvh flex-col` thì vùng nội dung
 * tự co lại, không bị che. Widget KHÔNG đọc registry — tầng `app/shell/AppTabBar.tsx` dựng `items`; chỉ mount khi
 * `useIsPhone()` (laptop / tablet dùng `Dock`).
 * Sửa giao diện: class → `tab-bar.theme.ts` · chiều cao thanh (`--tab-bar-h`, `--tab-bar-reach`) → `tab-bar.css`.
 * Lưu ý: ô là `<Link>` thật + `aria-current="page"`; xoay ngang thấp (`max-height: 540px`) thu thanh còn 44px, ô xếp
 * ngang. Nhãn một dòng, KHÔNG `truncate` (gọt dấu tiếng Việt).
 *
 * @param props.items - Các mục `TabBarItem` (`id`, `label`, `shortLabel?`, `icon`, `href`, `onIntent?`). Rỗng / thiếu → `null`.
 * @param props.moreLabel - Nhãn ô "Thêm". Mặc định "Thêm".
 * @param props.sheetTitle - Tiêu đề sheet của ô "Thêm". Mặc định "Tất cả phân hệ".
 * @param props.ariaLabel - Tên vùng điều hướng cho trình đọc màn hình. Mặc định "Điều hướng chính".
 * @param props.className - Class thêm cho `<nav>`.
 *
 * @example
 * <TabBar items={[{ id: 'home', label: 'Trang chủ', icon: 'house-outline', href: '/' }]} />
 */
const TabBar = memo(function TabBar({
  items,
  moreLabel = 'Thêm',
  sheetTitle = 'Tất cả phân hệ',
  ariaLabel = 'Điều hướng chính',
  className,
}: TabBarProps) {
  const { pathname } = useLocation();
  const layout = useMemo(() => layoutTabBar(items ?? []), [items]);
  const overflowIds = useMemo(() => new Set(layout.overflow.map((item) => item.id)), [layout]);

  if (!items?.length) return null;

  const activeId = findActiveId(pathname, items);

  return (
    <nav aria-label={ariaLabel} className={cn(TAB_BAR_SLOT_CLASSES.root, className)}>
      <div className={TAB_BAR_SLOT_CLASSES.list}>
        {layout.primary.map((item) => (
          <TabCell key={item.id} active={item.id === activeId} item={item} />
        ))}
        {layout.overflow.length > 0 && (
          <TabMoreSheet
            activeId={activeId}
            items={items}
            moreLabel={moreLabel}
            overflowIds={overflowIds}
            sheetTitle={sheetTitle}
          />
        )}
      </div>
    </nav>
  );
});

export default TabBar;
