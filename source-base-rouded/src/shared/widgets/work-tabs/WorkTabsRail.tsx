import { memo, useCallback, useMemo, useRef, useState, type MouseEvent } from 'react';
import { createPortal } from 'react-dom';
import { useLocation } from 'react-router-dom';

import { Popover } from '@/shared/ui';
import { SystemIcon } from '@/shared/ui/icons/Icons';
import { cn } from '@/shared/utils/style/cn';

import { useHoverIntent } from './hooks/useHoverIntent';
import { usePublishRailBottom } from './hooks/usePublishRailBottom';
import { useWorkTabCommands } from './hooks/useWorkTabCommands';
import { useWorkTabsRailVisible } from './hooks/useWorkTabsRailVisible';
import { useWorkTabsShortcuts } from './hooks/useWorkTabsShortcuts';
import WorkTabsPanel from './parts/work-tabs-panel';
import WorkTabsRailItem from './parts/work-tabs-rail-item';
import { WORK_TABS_PANEL_CLASSES } from './work-tabs-panel.theme';
import { useWorkTabsStore } from './work-tabs.store';
import { WORK_TABS_RAIL_CLASSES as RAIL } from './work-tabs.theme';
import type { WorkTabsEdgeInset } from './work-tabs.types';
import { splitHistory } from './work-tabs.utils';

export interface WorkTabsRailProps {
  homeHref?: string;
  edgeInset?: WorkTabsEdgeInset;
  className?: string;
}

const NO_INSET: WorkTabsEdgeInset = {};

/** Đệm va chạm tối thiểu của bảng (px): đỉnh bảng không trồi lên che thanh header (cao tối đa 64px). */
const PANEL_MIN_CLEARANCE = 72;

/** Khe từ nút "+N" tới bảng (px) = đệm `p-1` của thanh + 8px — bảng cách MÉP THANH 8px. */
const PANEL_OFFSET = 12;

/**
 * WorkTabsRail — LỊCH SỬ THẺ LÀM VIỆC (多页签 của ERP Kingdee / Yonyou, gọn kiểu macOS) dạng THANH DỌC 32px nổi sát mép
 * trái cửa sổ (cách 6px, ngay dưới header): ô phân hệ 24px của 3 màn mở gần nhất xếp dọc (mỗi ô là liên kết thật — quay lại đúng chỗ, giữ cả query;
 * tooltip bên phải) + nút "+N / ⋯" mở bảng đầy đủ SANG PHẢI (ô lọc, "Đã ghim", "Trước đó", ghim / đóng, "Trang chủ",
 * "Đóng các thẻ khác", ↑↓ Enter Esc). Rê chuột lên nút ~150ms cũng mở, rời chuột là đóng; bấm / Enter thì ghim mở (chỉ
 * Esc / bấm ra ngoài mới đóng, tiêu điểm vào bảng). Phím: Ctrl/⌘ + Shift + `[` / `]` sang thẻ trước / sau theo thứ tự mở.
 *
 * Tầng app đẩy màn đang mở vào store (`useWorkTabsStore().visit` — `AppWorkTabs`) và tính `edgeInset` từ vị trí Dock;
 * layout chừa mép trái cho `<main>` khi `useWorkTabsRailVisible()` (`WORK_TABS_RAIL_WIDTH`). Vị trí thanh KHÔNG đổi theo
 * Dock; mép dưới công bố ở `--work-tabs-rail-bottom` (`:root`) để Dock trái xếp bên dưới. Chưa có thẻ nào /
 * `setEnabled(false)` → không dựng gì.
 * Lưu ý: `position: fixed`, portal ra `body` (gắn ở đâu cũng không bị transform / `backdrop-filter` của cha kéo lệch) —
 * chỉ máy tính / tablet (điện thoại có top bar + thanh tab đáy). Lý do: notes/code/widgets.md.
 *
 * @param props.homeHref - Đích dòng "Trang chủ" (và khi đóng thẻ cuối của màn đang mở). Mặc định `/`.
 * @param props.edgeInset - Phần mép màn bị Dock chiếm (px, vd `{ bottom: 80 }`): bảng giữ cách đáy / mép phải ngần ấy
 *   (không chui dưới Dock). Mặc định `{}`.
 * @param props.className - Class thêm cho thanh.
 *
 * @example
 * <WorkTabsRail homeHref="/" edgeInset={{ bottom: 80 }} />
 */
const WorkTabsRail = memo(function WorkTabsRail({
  homeHref = '/',
  edgeInset = NO_INSET,
  className,
}: WorkTabsRailProps) {
  const tabs = useWorkTabsStore((state) => state.tabs);
  const enabled = useWorkTabsStore((state) => state.enabled);
  const visible = useWorkTabsRailVisible();
  const railRef = useRef<HTMLElement>(null);
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const [sticky, setSticky] = useState(false);
  const runCommand = useWorkTabCommands(homeHref);
  const hover = useHoverIntent({ enabled: !sticky, onOpenChange: setOpen });
  const recent = useMemo(() => splitHistory(tabs, pathname).recent, [pathname, tabs]);
  const stepRow = useMemo(() => [{ path: homeHref, search: '' }, ...tabs], [homeHref, tabs]);
  useWorkTabsShortcuts(stepRow, pathname, enabled);
  usePublishRailBottom(railRef, visible);

  const setPinnedOpen = useCallback((next: boolean) => {
    setOpen(next);
    setSticky(next);
  }, []);
  const close = useCallback(() => setPinnedOpen(false), [setPinnedOpen]);
  const pinOpen = (event: MouseEvent<HTMLButtonElement>) => {
    if (!open || sticky) return;
    event.preventDefault();
    setSticky(true);
  };
  const focusOnOpen = (event: Event) => {
    event.preventDefault();
    if (!sticky) return;
    const content = event.currentTarget as HTMLElement | null;
    content?.querySelector<HTMLElement>('[data-autofocus]')?.focus({ preventScroll: true });
  };

  if (!visible) return null;
  const extra = tabs.length - recent.length;

  return createPortal(
    <nav ref={railRef} aria-label="Thẻ đã mở gần đây" className={cn(RAIL.root, className)}>
      {recent.map((tab) => (
        <WorkTabsRailItem key={tab.path} active={tab.path === pathname} tab={tab} />
      ))}
      <span aria-hidden className={RAIL.divider} />
      <Popover
        align="start"
        className={WORK_TABS_PANEL_CLASSES.surface}
        collisionPadding={Math.max(
          PANEL_MIN_CLEARANCE,
          (edgeInset.bottom ?? 0) + 8,
          (edgeInset.right ?? 0) + 8,
        )}
        content={
          <div {...hover.content}>
            <WorkTabsPanel
              activePath={pathname}
              homeHref={homeHref}
              tabs={tabs}
              onCommand={runCommand}
              onDone={close}
            />
          </div>
        }
        open={open}
        side="right"
        sideOffset={PANEL_OFFSET}
        variant="solid"
        onOpenAutoFocus={focusOnOpen}
        onOpenChange={setPinnedOpen}
      >
        <button
          {...hover.trigger}
          aria-label={`Tất cả thẻ đã mở (${tabs.length})`}
          className={RAIL.more}
          type="button"
          onClick={pinOpen}
        >
          {extra > 0 ? `+${extra}` : <SystemIcon name="ellipsis-outline" size={14} />}
        </button>
      </Popover>
    </nav>,
    document.body,
  );
});

export default WorkTabsRail;
