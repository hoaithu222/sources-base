import { GANTT_WINDOW } from '../constants/production.constants';
import { dayIndex, formatDayMonth, weekdayOf } from './ops-date.utils';
import type { OrderView } from './production.utils';

/**
 * Hình học dải Gantt 3 tuần của bảng lệnh sản xuất: mọi vị trí tính theo % bề rộng cửa sổ `GANTT_WINDOW` để ô và
 * header thẳng hàng ở mọi bề ngang. Thanh vượt mép cửa sổ bị cắt và đánh dấu `clipStart` / `clipEnd`.
 */

export interface GanttSpan {
  /** Mép trái theo % bề rộng cửa sổ Gantt. */
  left: number;
  /** Bề rộng theo % cửa sổ Gantt. */
  width: number;
  /** Thanh bắt đầu trước / kết thúc sau cửa sổ (bị cắt ở mép) — vẽ mép đó phẳng. */
  clipStart: boolean;
  clipEnd: boolean;
}

/** Đoạn [từ, tới] (ngày ISO, chỉ số ngày; tính cả hai đầu) → vị trí % trong cửa sổ; `null` khi nằm ngoài. */
function ganttSpan(fromIso: string, toIndexInclusive: number): GanttSpan | null {
  const windowStart = dayIndex(GANTT_WINDOW.start);
  const rawFrom = dayIndex(fromIso) - windowStart;
  const rawTo = toIndexInclusive - windowStart + 1;
  const from = Math.max(rawFrom, 0);
  const to = Math.min(rawTo, GANTT_WINDOW.days);
  if (to <= from) return null;
  return {
    left: (from / GANTT_WINDOW.days) * 100,
    width: ((to - from) / GANTT_WINDOW.days) * 100,
    clipStart: rawFrom < 0,
    clipEnd: rawTo > GANTT_WINDOW.days,
  };
}

/** Thanh kế hoạch của lệnh. */
export function planSpan(view: OrderView): GanttSpan | null {
  return ganttSpan(view.planStart, dayIndex(view.planEnd));
}

/**
 * Thanh thực tế: từ ngày bắt đầu thật tới ngày hoàn thành (lệnh xong) hoặc tới điểm "đã làm được" quy ra ngày kế hoạch
 * (% thực tế × số ngày kế hoạch) — thanh dừng trước vạch hôm nay là lệnh đang chậm.
 */
export function actualSpan(view: OrderView): GanttSpan | null {
  const start = dayIndex(view.actualStart);
  const end = view.finishedOn
    ? dayIndex(view.finishedOn)
    : start + Math.max(Math.round((view.actualPct / 100) * view.planDays) - 1, 0);
  return ganttSpan(view.actualStart, end);
}

/** Vị trí % của đầu ngày `today` (ISO) trên dải. */
export function todayOffset(today: string): number {
  return ((dayIndex(today) - dayIndex(GANTT_WINDOW.start)) / GANTT_WINDOW.days) * 100;
}

/** Vị trí % mép trái của các ngày Chủ nhật trong cửa sổ. */
export function ganttSundayOffsets(): number[] {
  const start = dayIndex(GANTT_WINDOW.start);
  return Array.from({ length: GANTT_WINDOW.days }, (_, i) => i).flatMap((i) =>
    weekdayOf(start + i) === 0 ? [(i / GANTT_WINDOW.days) * 100] : [],
  );
}

/** Vị trí % các vạch ngăn tuần (giữa các tuần, không tính hai mép). */
export function ganttWeekOffsets(): number[] {
  return Array.from(
    { length: Math.ceil(GANTT_WINDOW.days / 7) - 1 },
    (_, i) => (((i + 1) * 7) / GANTT_WINDOW.days) * 100,
  );
}

/** Nhãn tuần của cửa sổ ("12/10 – 18/10"), mỗi tuần 7 ngày. */
export function ganttWeeks(): string[] {
  const start = dayIndex(GANTT_WINDOW.start);
  return Array.from(
    { length: Math.ceil(GANTT_WINDOW.days / 7) },
    (_, w) => `${formatDayMonth(start + w * 7)} – ${formatDayMonth(start + w * 7 + 6)}`,
  );
}
