import { memo } from 'react';

import { cn } from '@/shared/utils/style/cn';

import { TIMESHEET_CODES } from '../../constants/timesheet.constants';
import { TIMESHEET_CODE_CLASSES, TIMESHEET_LEGEND_CLASSES } from './timesheet.theme';

interface TimesheetLegendProps {
  placement: 'header' | 'strip';
}

/**
 * TimesheetLegend — chú giải ký hiệu của bảng công (cùng màu với ô): X đi làm · T tăng ca · ½ nửa công · P phép · KP
 * không phép · L lễ · Chủ nhật (ô nền xám) · chấm cam = đi muộn. Hai chỗ đặt, mỗi lúc chỉ hiện một: header panel
 * bảng công (máy tính, tablet) hoặc dải cuộn ngang đầu thân panel (điện thoại — header hẹp không đủ chỗ cho tiêu đề).
 *
 * @param props.placement - `header` (ẩn trên điện thoại) | `strip` (chỉ hiện trên điện thoại).
 *
 * @example
 * <BoxPanel headerRight={<TimesheetLegend placement="header" />} title="Bảng công">…</BoxPanel>
 */
const TimesheetLegend = memo(function TimesheetLegend({ placement }: TimesheetLegendProps) {
  return (
    <ul
      aria-label="Chú giải ký hiệu chấm công"
      className={cn(TIMESHEET_LEGEND_CLASSES.root, TIMESHEET_LEGEND_CLASSES[placement])}
    >
      {TIMESHEET_CODES.map((meta) => (
        <li key={meta.code} className={TIMESHEET_LEGEND_CLASSES.item}>
          {meta.code === 'CN' ? (
            <span aria-hidden className={TIMESHEET_LEGEND_CLASSES.sunday} />
          ) : (
            <span
              aria-hidden
              className={cn(TIMESHEET_LEGEND_CLASSES.swatch, TIMESHEET_CODE_CLASSES[meta.code])}
            >
              {meta.glyph}
            </span>
          )}
          {meta.label}
        </li>
      ))}
      <li className={TIMESHEET_LEGEND_CLASSES.item}>
        <span aria-hidden className={TIMESHEET_LEGEND_CLASSES.lateDot} />
        Đi muộn
      </li>
    </ul>
  );
});

export default TimesheetLegend;
