import { memo, type ReactNode } from 'react';

import { BoxPanel } from '@/shared/ui';
import { cn } from '@/shared/utils/style/cn';

import { SUPPLY_PANEL_CLASSES } from '../supply.theme';

interface SupplyPanelProps {
  title: string;
  note?: string;
  headerRight?: ReactNode;
  bodyOverflow?: 'hidden' | 'scroll';
  bodyClassName?: string;
  className?: string;
  children: ReactNode;
}

/**
 * SupplyPanel — khung chung của các khối màn "Đơn mua" / "Tồn kho": `BoxPanel` viền mảnh bắt sáng, góc squircle, vạch
 * ngăn dưới tiêu đề; tiêu đề là `<h2>` thật (kèm ghi chú mờ) mang đúng kiểu tiêu đề chuỗi của `BoxPanel`. Bộ lọc của
 * khối (ô tìm, luồng trạng thái, công tắc) nằm CUỐI HÀNG TIÊU ĐỀ qua `headerRight` — không thêm hàng công cụ riêng.
 * Lưu ý: đệm thân theo nội dung — biểu đồ / danh sách `p-2`, bảng tràn mép (`bodyClassName` bỏ trống). Hàng tiêu đề
 * không đủ chỗ (điện thoại) thì cụm `headerRight` xuống dòng dưới tên khối và vuốt ngang được.
 *
 * @param props.title - Tiêu đề khối (render thành `<h2>`).
 * @param props.note - Ghi chú ngắn sau tiêu đề, chữ mờ (đơn vị, phạm vi), vd "triệu đồng".
 * @param props.headerRight - Cụm cuối hàng tiêu đề (bộ lọc, số đếm).
 * @param props.bodyOverflow - `hidden` (con tự lấp `min-h-0 flex-1`: bảng, biểu đồ) | `scroll`. Mặc định `hidden`.
 * @param props.bodyClassName - Class của thân khối (thường là đệm).
 * @param props.className - Class của khung ngoài — thường là ô lưới (`SUPPLY_SLOT_CLASSES`).
 * @param props.children - Nội dung khối.
 *
 * @example
 * <SupplyPanel bodyClassName="p-2" className={SUPPLY_SLOT_CLASSES.side} note="tỷ đồng" title="Theo tháng">…</SupplyPanel>
 */
const SupplyPanel = memo(function SupplyPanel({
  title,
  note,
  headerRight,
  bodyOverflow = 'hidden',
  bodyClassName,
  className,
  children,
}: SupplyPanelProps) {
  return (
    <BoxPanel
      bodyClassName={bodyClassName}
      bodyOverflow={bodyOverflow}
      border="hairline"
      className={cn(SUPPLY_PANEL_CLASSES.root, className)}
      headerClassName={SUPPLY_PANEL_CLASSES.header}
      headerDivider
      headerRight={headerRight}
      title={
        <h2 className={SUPPLY_PANEL_CLASSES.title}>
          {title}
          {note ? <span className={SUPPLY_PANEL_CLASSES.note}>{note}</span> : null}
        </h2>
      }
    >
      {children}
    </BoxPanel>
  );
});

export default SupplyPanel;
