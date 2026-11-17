import { memo } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/core/i18n';

import { AppTile, Tooltip } from '@/shared/ui';
import { formatRelativeTime } from '@/shared/utils/format/format.utils';

import { WORK_TABS_RAIL_CLASSES as RAIL } from '../work-tabs.theme';
import type { WorkTab } from '../work-tabs.types';

export interface WorkTabsRailItemProps {
  tab: WorkTab;
  active: boolean;
}

/**
 * WorkTabsRailItem — MỘT ô của thanh dọc lịch sử thẻ: ô phân hệ 24px là `<Link>` thật (Ctrl / chuột giữa mở tab trình
 * duyệt mới), tên màn làm nhãn trợ năng; rê / focus hiện tooltip bên phải: tên · "Phân hệ · Màn" · lúc mở ("Đang mở" với
 * màn hiện tại). Màn đang mở có vạch chỉ báo 2px ở mép trái thanh (như chấm của Dock) + `aria-current`. Phần nội bộ của
 * `WorkTabsRail`.
 *
 * @param props.tab - Dữ liệu thẻ.
 * @param props.active - Thẻ của màn đang mở.
 *
 * @example
 * <WorkTabsRailItem active tab={tab} />
 */
const WorkTabsRailItem = memo(function WorkTabsRailItem({ tab, active }: WorkTabsRailItemProps) {
  const t = useTranslations('ui.widgets');
  const locale = useLocale();
  const meta = [
    tab.fullTitle !== tab.title ? tab.fullTitle : undefined,
    active ? t('workTabs.current') : formatRelativeTime(new Date(tab.visitedAt), locale),
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <Tooltip
      content={
        <>
          <span className={RAIL.tipTitle}>{tab.title}</span>
          <span className={RAIL.tipMeta}>{meta}</span>
        </>
      }
      side="right"
      sideOffset={10}
    >
      <Link
        aria-current={active ? 'page' : undefined}
        aria-label={tab.title}
        className={RAIL.item}
        href={tab.path + tab.search}
      >
        <AppTile
          className={RAIL.tile}
          icon={tab.icon ?? 'home'}
          size="xs"
          tone={tab.tone ?? 'neutral'}
        />
        {active && <span aria-hidden className={RAIL.indicator} />}
      </Link>
    </Tooltip>
  );
});

export default WorkTabsRailItem;
