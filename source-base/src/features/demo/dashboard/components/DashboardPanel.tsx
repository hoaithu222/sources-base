import { memo, type ReactNode } from 'react';

import { BoxPanel, HudFrame } from '@/shared/ui';
import { cn } from '@/shared/utils/style/cn';

import {
  DASHBOARD_PANEL_BASE_CLASSES,
  DASHBOARD_PANEL_SLOT_CLASSES,
  DASHBOARD_PANEL_TITLE_CLASSES,
  type DashboardPanelSlot,
} from '../dashboard.theme';

interface DashboardPanelProps {
  slot: DashboardPanelSlot;
  title: string;
  headerRight?: ReactNode;
  bodyOverflow?: 'hidden' | 'scroll';
  bodyClassName?: string;
  accent?: boolean;
  children: ReactNode;
}

/**
 * DashboardPanel — khung chung của sáu panel màn `/demo/tong-quan`: `BoxPanel` viền mảnh, vạch ngăn dưới tiêu
 * đề, tiêu đề là `<h2>` thật nhưng mang ĐÚNG kiểu tiêu đề chuỗi của `BoxPanel` (`DASHBOARD_PANEL_TITLE_CLASSES`).
 *
 * Lưu ý: đệm thân theo nội dung (`spacing-system.md §4.2`): biểu đồ / chữ `p-2`, bảng và danh sách dòng tràn mép.
 *
 * @param props.slot - Ô trong lưới (bề ngang + chiều cao) — bảng `DASHBOARD_PANEL_SLOT_CLASSES` của `dashboard.theme.ts`.
 * @param props.title - Tiêu đề panel (render thành `<h2>`).
 * @param props.headerRight - Nội dung góc phải header (badge, số đếm) — chỉ chứa thông tin KHÔNG có ở thân panel
 *   và dải KPI (số có `tabular-nums`).
 * @param props.bodyOverflow - `hidden` (con tự lấp `min-h-0 flex-1`: biểu đồ, bảng) | `scroll` (danh sách dài).
 *   Mặc định `hidden`.
 * @param props.bodyClassName - Class của thân panel (thường là đệm).
 * @param props.accent - `true` → bọc `HudFrame` thay viền mảnh — CHỈ cho MỘT panel PRIMARY của màn
 *   (`visual-hierarchy.md §0`). Mặc định `false`.
 * @param props.children - Nội dung panel.
 *
 * @example
 * <DashboardPanel bodyClassName="p-2" slot="work" title="Khối lượng theo hạng mục">…</DashboardPanel>
 */
const DashboardPanel = memo(function DashboardPanel({
  slot,
  title,
  headerRight,
  bodyOverflow = 'hidden',
  bodyClassName,
  accent = false,
  children,
}: DashboardPanelProps) {
  const slotClassName = cn(DASHBOARD_PANEL_BASE_CLASSES, DASHBOARD_PANEL_SLOT_CLASSES[slot]);

  const panel = (
    <BoxPanel
      bodyClassName={bodyClassName}
      bodyOverflow={bodyOverflow}
      border={accent ? 'none' : 'hairline'}
      className={accent ? DASHBOARD_PANEL_BASE_CLASSES : slotClassName}
      headerDivider
      headerRight={headerRight}
      title={<h2 className={DASHBOARD_PANEL_TITLE_CLASSES}>{title}</h2>}
    >
      {children}
    </BoxPanel>
  );

  if (!accent) return panel;

  return (
    <HudFrame className={slotClassName} tone="sky" weight="hairline">
      {panel}
    </HudFrame>
  );
});

export default DashboardPanel;
