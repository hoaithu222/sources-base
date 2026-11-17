import { memo } from 'react';

import { BoxPanel, Progress } from '@/shared/ui';
import { formatNumber, formatPercent } from '@/shared/utils/format/format.utils';
import { cn } from '@/shared/utils/style/cn';

import { OEE_TARGET, type WorkshopFilter } from '../../constants/production.constants';
import type { WorkshopSummary } from '../../utils/production.utils';
import { PRODUCTION_LAYOUT_CLASSES, WORKSHOP_ROW_CLASSES } from './production.theme';

interface WorkshopPerformancePanelProps {
  workshops: readonly WorkshopSummary[];
  active: WorkshopFilter;
}

const PARTS = [
  { key: 'availability', label: 'Khả dụng' },
  { key: 'performance', label: 'Hiệu suất' },
  { key: 'quality', label: 'Chất lượng' },
] as const;

const countsOf = (w: WorkshopSummary) =>
  `${w.running} lệnh chạy · ${w.late > 0 ? `${w.late} chậm` : 'không chậm'}`;

/**
 * WorkshopPerformancePanel — panel "Hiệu suất theo xưởng": mỗi xưởng hai dòng — tên · số lệnh chạy / chậm · OEE (chữ cam
 * khi dưới mục tiêu), rồi ba thành phần OEE (khả dụng · hiệu suất · chất lượng) dạng thanh. Luôn hiện đủ ba xưởng để so
 * sánh; xưởng đang lọc nhuộm nhạt, xưởng khác mờ đi.
 *
 * @param props.workshops - Số liệu từng xưởng (`summarizeWorkshops`).
 * @param props.active - Xưởng đang lọc trên header (`all` = không nhấn dòng nào).
 *
 * @example
 * <WorkshopPerformancePanel active={workshop} workshops={summaries} />
 */
const WorkshopPerformancePanel = memo(function WorkshopPerformancePanel({
  workshops,
  active,
}: WorkshopPerformancePanelProps) {
  return (
    <BoxPanel
      bodyOverflow="hidden"
      border="hairline"
      className={PRODUCTION_LAYOUT_CLASSES.workshops}
      headerDivider
      headerRight={
        <span className={PRODUCTION_LAYOUT_CLASSES.hint}>{`Mục tiêu OEE ${OEE_TARGET}%`}</span>
      }
      title={<h2 className={PRODUCTION_LAYOUT_CLASSES.title}>Hiệu suất theo xưởng</h2>}
    >
      <ul aria-label="Hiệu suất từng xưởng" className={WORKSHOP_ROW_CLASSES.list}>
        {workshops.map((w) => (
          <li
            key={w.key}
            aria-current={active === w.key || undefined}
            className={cn(
              WORKSHOP_ROW_CLASSES.row,
              active === w.key && WORKSHOP_ROW_CLASSES.selected,
              active !== 'all' && active !== w.key && WORKSHOP_ROW_CLASSES.dimmed,
            )}
          >
            <div className={WORKSHOP_ROW_CLASSES.head}>
              <span className={WORKSHOP_ROW_CLASSES.name}>{w.label}</span>
              <span className={WORKSHOP_ROW_CLASSES.counts}>{countsOf(w)}</span>
              <span
                className={cn(
                  WORKSHOP_ROW_CLASSES.oee,
                  w.oee < OEE_TARGET && WORKSHOP_ROW_CLASSES.oeeBelow,
                )}
                title={w.oee < OEE_TARGET ? 'Dưới mục tiêu OEE' : 'Đạt mục tiêu OEE'}
              >
                {formatNumber(w.oee, 1)}
                <span className={WORKSHOP_ROW_CLASSES.oeeUnit}> % OEE</span>
              </span>
            </div>
            <div className={WORKSHOP_ROW_CLASSES.parts}>
              {PARTS.map((part) => (
                <div key={part.key} className={WORKSHOP_ROW_CLASSES.part}>
                  <span className={WORKSHOP_ROW_CLASSES.partLabel}>
                    <span>{part.label}</span>
                    <span>{formatPercent(w[part.key], 1)}</span>
                  </span>
                  <Progress label={`${part.label} ${w.label}`} size="xs" value={w[part.key]} />
                </div>
              ))}
            </div>
          </li>
        ))}
      </ul>
    </BoxPanel>
  );
});

export default WorkshopPerformancePanel;
