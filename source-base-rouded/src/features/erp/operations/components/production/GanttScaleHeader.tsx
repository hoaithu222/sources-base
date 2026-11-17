import { memo } from 'react';

import { OPS_TODAY } from '../../constants/operations.constants';
import { GANTT_WINDOW } from '../../constants/production.constants';
import { ganttWeeks, todayOffset } from '../../utils/gantt.utils';
import { GANTT_CLASSES } from './production.theme';

const WEEKS = ganttWeeks();
const WEEK_WIDTH = (7 / GANTT_WINDOW.days) * 100;
const TODAY_OFFSET = todayOffset(OPS_TODAY);

/**
 * GanttScaleHeader — header cột Gantt của bảng lệnh: nhãn từng tuần trong cửa sổ `GANTT_WINDOW` ("12/10 – 18/10"),
 * vạch ngăn tuần thẳng với vạch trong ô, gạch nhỏ đánh dấu hôm nay nối xuống vạch của các dòng.
 *
 * @example
 * { key: 'gantt', header: <GanttScaleHeader />, cell: (row) => <OrderGanttCell order={row} /> }
 */
const GanttScaleHeader = memo(function GanttScaleHeader() {
  return (
    <div className={GANTT_CLASSES.headRoot}>
      {WEEKS.map((label, i) => (
        <span
          key={label}
          className={GANTT_CLASSES.headWeek}
          style={{ left: `${i * WEEK_WIDTH}%`, width: `${WEEK_WIDTH}%` }}
        >
          {label}
        </span>
      ))}
      <span aria-hidden className={GANTT_CLASSES.headToday} style={{ left: `${TODAY_OFFSET}%` }} />
    </div>
  );
});

export default GanttScaleHeader;
