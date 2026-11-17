'use client';

import { memo, useCallback, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/core/i18n';

import { Button } from '@/shared/ui';
import { SystemIcon } from '@/shared/ui/icons/Icons';

import { usePanelKeyNav } from '../hooks/usePanelKeyNav';
import { WORK_TABS_PANEL_CLASSES as PANEL } from '../work-tabs-panel.theme';
import { WORK_TABS_LIMIT } from '../work-tabs.store';
import type { WorkTab, WorkTabCommand } from '../work-tabs.types';
import { WORK_TABS_FILTER_FROM, workTabStepLabel } from '../work-tabs.utils';
import WorkTabsPanelList from './work-tabs-panel-list';

export interface WorkTabsPanelProps {
  tabs: readonly WorkTab[];
  activePath: string;
  homeHref: string;
  onCommand: (command: WorkTabCommand, path: string) => void;
  onDone: () => void;
}

/**
 * WorkTabsPanel — bảng "TẤT CẢ THẺ ĐÃ MỞ" bung sang phải từ nút "+N / ⋯" của thanh dọc: đầu bảng (số thẻ / giới hạn +
 * phím chuyển thẻ) · thân `WorkTabsPanelList` (lọc · Gần đây · Đã ghim · Trước đó; mỗi dòng ghim / đóng) · chân bảng
 * "Trang chủ" + "Đóng các thẻ khác". ↑↓ / Enter / Home / End qua mọi mục (`usePanelKeyNav`); đóng một dòng thì bảng vẫn
 * mở, tiêu điểm sang dòng kế. Phần nội bộ của `WorkTabsRail`.
 * Lưu ý: tiêu điểm lúc mở bằng bấm / phím đặt vào `[data-autofocus]` (ô lọc, không có thì khung bảng) — `WorkTabsRail` lo.
 *
 * @param props.tabs - Mọi thẻ đang mở (thứ tự store).
 * @param props.activePath - `pathname` đang mở.
 * @param props.homeHref - Đích dòng "Trang chủ" ở chân bảng.
 * @param props.onCommand - Lệnh trên thẻ (`useWorkTabCommands`).
 * @param props.onDone - Đóng bảng (sau khi mở một thẻ / "Đóng các thẻ khác").
 *
 * @example
 * <WorkTabsPanel activePath={pathname} homeHref="/" tabs={tabs} onCommand={runCommand} onDone={close} />
 */
const WorkTabsPanel = memo(function WorkTabsPanel({
  tabs,
  activePath,
  homeHref,
  onCommand,
  onDone,
}: WorkTabsPanelProps) {
  const t = useTranslations('ui.widgets');
  const panelRef = useRef<HTMLDivElement>(null);
  const { onKeyDown, onPointerMove, focusNeighbour } = usePanelKeyNav(panelRef);
  const activeIsTab = tabs.some((tab) => tab.path === activePath);
  const closable = tabs.some((tab) => !tab.pinned && tab.path !== activePath);

  const handleRowCommand = useCallback(
    (command: WorkTabCommand, path: string) => {
      if (command === 'close') focusNeighbour(path);
      onCommand(command, path);
    },
    [focusNeighbour, onCommand],
  );
  const closeOthers = () => {
    onCommand('close-others', activePath);
    onDone();
  };

  return (
    <div
      ref={panelRef}
      aria-label={t('workTabs.panel.label')}
      className={PANEL.panel}
      data-autofocus={tabs.length > WORK_TABS_FILTER_FROM ? undefined : true}
      role="group"
      tabIndex={-1}
      onKeyDown={onKeyDown}
      onPointerMove={onPointerMove}
    >
      <div className={PANEL.head}>
        <span className={PANEL.headTitle}>
          {t('workTabs.panel.title')}
          <span className={PANEL.count}>
            {tabs.length}/{WORK_TABS_LIMIT}
          </span>
        </span>
        <span className={PANEL.hint} title={t('workTabs.panel.stepHint')}>
          <kbd className={PANEL.kbd}>{workTabStepLabel('prev')}</kbd>
          <kbd className={PANEL.kbd}>{workTabStepLabel('next')}</kbd>
        </span>
      </div>
      <WorkTabsPanelList
        activePath={activePath}
        tabs={tabs}
        onCommand={handleRowCommand}
        onNavigate={onDone}
      />
      <div className={PANEL.footer}>
        <Link
          aria-current={activePath === homeHref ? 'page' : undefined}
          className={PANEL.home}
          data-nav-item
          href={homeHref}
          onClick={onDone}
        >
          <SystemIcon name="house-outline" size={14} />
          {t('workTabs.panel.home')}
        </Link>
        <Button disabled={!closable} size="xs" variant="ghost" onClick={closeOthers}>
          {activeIsTab ? t('workTabs.panel.closeOthers') : t('workTabs.panel.closeUnpinned')}
        </Button>
      </div>
    </div>
  );
});

export default WorkTabsPanel;
