'use client';

import { memo, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';

import { useImeSafeSearchInput } from '@/shared/hooks';
import { Input } from '@/shared/ui';
import { SystemIcon } from '@/shared/ui/icons/Icons';

import { WORK_TABS_PANEL_CLASSES } from '../work-tabs-panel.theme';
import type { WorkTab, WorkTabCommand } from '../work-tabs.types';
import { filterHistory, splitHistory, WORK_TABS_FILTER_FROM } from '../work-tabs.utils';
import WorkTabsPanelRow from './work-tabs-panel-row';

export interface WorkTabsPanelListProps {
  tabs: readonly WorkTab[];
  activePath: string;
  onCommand: (command: WorkTabCommand, path: string) => void;
  onNavigate: () => void;
}

/**
 * WorkTabsPanelList — thân bảng lịch sử thẻ: ô lọc (khi > 6 thẻ — bỏ dấu, an toàn IME, Enter mở dòng khớp đầu tiên) ·
 * nhóm "Gần đây" (3 thẻ mở gần nhất, mới nhất trước) · "Đã ghim" (thứ tự mở) · "Trước đó" (mới nhất trước); đang lọc thì
 * một nhóm "Kết quả lọc" gồm MỌI thẻ khớp. Mỗi thẻ nằm đúng một nhóm; dòng bay vào lần lượt khi bảng mở. Phần nội bộ của
 * `WorkTabsPanel`.
 *
 * @param props.tabs - Mọi thẻ đang mở (thứ tự store).
 * @param props.activePath - `pathname` đang mở.
 * @param props.onCommand - Lệnh trên thẻ.
 * @param props.onNavigate - Gọi khi bấm mở thẻ (đóng bảng).
 *
 * @example
 * <WorkTabsPanelList activePath={pathname} tabs={tabs} onCommand={runCommand} onNavigate={close} />
 */
const WorkTabsPanelList = memo(function WorkTabsPanelList({
  tabs,
  activePath,
  onCommand,
  onNavigate,
}: WorkTabsPanelListProps) {
  const t = useTranslations('ui.widgets');
  const [query, setQuery] = useState('');
  const { inputProps } = useImeSafeSearchInput(query, setQuery);
  const withFilter = tabs.length > WORK_TABS_FILTER_FROM;
  const groups = useMemo(() => splitHistory(tabs, activePath), [activePath, tabs]);
  const results = useMemo(
    () => (withFilter && query.trim() ? filterHistory(tabs, query) : null),
    [query, tabs, withFilter],
  );
  const sections = results
    ? [{ label: t('workTabs.list.filtered'), items: results, offset: 0 }]
    : [
        { label: t('workTabs.list.recent'), items: groups.recent, offset: 0 },
        { label: t('workTabs.pinned'), items: groups.pinned, offset: groups.recent.length },
        {
          label: t('workTabs.list.earlier'),
          items: groups.earlier,
          offset: groups.recent.length + groups.pinned.length,
        },
      ];

  return (
    <>
      {withFilter && (
        <div className={WORK_TABS_PANEL_CLASSES.filter}>
          <Input
            {...inputProps}
            aria-label={t('workTabs.list.filterLabel')}
            data-autofocus
            data-nav-item
            placeholder={t('workTabs.list.filterPlaceholder')}
            size="sm"
            startIcon={<SystemIcon name="magnifying-glass-outline" size={14} />}
          />
        </div>
      )}
      <div className={WORK_TABS_PANEL_CLASSES.scroll}>
        {results?.length === 0 && (
          <p className={WORK_TABS_PANEL_CLASSES.empty}>{t('workTabs.list.empty', { query })}</p>
        )}
        {sections
          .filter((section) => section.items.length > 0)
          .map((section) => (
            <section
              key={section.label}
              aria-label={section.label}
              className={WORK_TABS_PANEL_CLASSES.section}
            >
              <h3 className={WORK_TABS_PANEL_CLASSES.sectionLabel}>{section.label}</h3>
              {section.items.map((tab, index) => (
                <WorkTabsPanelRow
                  key={tab.path}
                  active={tab.path === activePath}
                  order={section.offset + index}
                  tab={tab}
                  onCommand={onCommand}
                  onNavigate={onNavigate}
                />
              ))}
            </section>
          ))}
      </div>
    </>
  );
});

export default WorkTabsPanelList;
