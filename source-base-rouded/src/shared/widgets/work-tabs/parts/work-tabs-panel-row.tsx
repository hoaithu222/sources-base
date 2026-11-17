import { memo } from 'react';
import { Link } from 'react-router-dom';

import { AppTile } from '@/shared/ui';
import { SystemIcon } from '@/shared/ui/icons/Icons';
import { formatRelativeTime } from '@/shared/utils/format/format.utils';
import { cn } from '@/shared/utils/style/cn';

import {
  WORK_TABS_PANEL_ROW_CLASSES as ROW,
  WORK_TABS_PANEL_STAGGER_MS,
} from '../work-tabs-panel.theme';
import type { WorkTab, WorkTabCommand } from '../work-tabs.types';

export interface WorkTabsPanelRowProps {
  tab: WorkTab;
  active: boolean;
  order: number;
  onCommand: (command: WorkTabCommand, path: string) => void;
  onNavigate: () => void;
}

const STAGGER_CAP = 10;

const enterDelay = (order: number) => ({
  animationDelay: `${Math.min(order, STAGGER_CAP) * WORK_TABS_PANEL_STAGGER_MS}ms`,
});

/**
 * WorkTabsPanelRow — MỘT dòng của bảng lịch sử thẻ: ô phân hệ · tên màn (+ ghim nếu đã ghim) · dòng phụ `fullTitle` (phân
 * hệ · màn) · lúc mở gần nhất ("Vừa xong", "5 phút trước"; màn đang mở → "Đang mở"). Rê / có tiêu điểm thì chỗ giờ đổi
 * thành nút ghim / bỏ ghim + × đóng (thẻ ghim không đóng); máy chạm luôn hiện nút. Tên màn là `<Link>` thật
 * (`data-row-link` — đích của phím ↑↓; Ctrl / chuột giữa mở tab trình duyệt mới). Phần nội bộ của `WorkTabsPanel`.
 *
 * @param props.tab - Dữ liệu thẻ.
 * @param props.active - Thẻ của màn đang mở (`aria-current`, chữ đậm, nhãn "Đang mở").
 * @param props.order - Thứ tự dòng trong nhóm đang bay vào — độ trễ khi bay vào.
 * @param props.onCommand - Lệnh `pin` / `close` cho thẻ.
 * @param props.onNavigate - Gọi khi bấm mở thẻ (đóng bảng).
 *
 * @example
 * <WorkTabsPanelRow active={false} order={2} tab={tab} onCommand={runCommand} onNavigate={close} />
 */
const WorkTabsPanelRow = memo(function WorkTabsPanelRow({
  tab,
  active,
  order,
  onCommand,
  onNavigate,
}: WorkTabsPanelRowProps) {
  return (
    <div className={ROW.row} data-panel-row style={enterDelay(order)}>
      <Link
        aria-current={active ? 'page' : undefined}
        className={ROW.link}
        data-nav-item
        data-path={tab.path}
        data-row-link
        to={tab.path + tab.search}
        onClick={onNavigate}
      >
        {tab.icon && <AppTile className={ROW.tile} icon={tab.icon} size="xs" tone={tab.tone} />}
        <span className={ROW.text}>
          <span className={ROW.titleLine}>
            <span className={cn(ROW.title, active && ROW.titleActive)}>{tab.title}</span>
            {tab.pinned && (
              <SystemIcon
                aria-label="Đã ghim"
                className={ROW.pinMark}
                name="thumbtack-angle-bold"
                role="img"
              />
            )}
          </span>
          {tab.fullTitle && tab.fullTitle !== tab.title && (
            <span className={ROW.meta}>{tab.fullTitle}</span>
          )}
        </span>
      </Link>
      <span className={ROW.trail}>
        <span className={cn(ROW.time, active && ROW.timeActive)}>
          {active ? 'Đang mở' : formatRelativeTime(new Date(tab.visitedAt))}
        </span>
        <span className={ROW.actions}>
          <button
            aria-label={tab.pinned ? `Bỏ ghim ${tab.title}` : `Ghim ${tab.title}`}
            aria-pressed={Boolean(tab.pinned)}
            className={cn(ROW.action, tab.pinned && ROW.actionOn)}
            type="button"
            onClick={() => onCommand('pin', tab.path)}
          >
            <SystemIcon
              name={tab.pinned ? 'thumbtack-angle-bold' : 'thumbtack-angle-outline'}
              size={14}
            />
          </button>
          {!tab.pinned && (
            <button
              aria-label={`Đóng ${tab.title}`}
              className={ROW.action}
              type="button"
              onClick={() => onCommand('close', tab.path)}
            >
              <SystemIcon name="xmark-outline" size={14} />
            </button>
          )}
        </span>
      </span>
    </div>
  );
});

export default WorkTabsPanelRow;
