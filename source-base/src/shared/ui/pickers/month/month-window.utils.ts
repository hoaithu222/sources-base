/**
 * month-window.utils — cửa sổ N tháng liên tiếp (vắt năm), nhãn và khoá của các picker THÁNG.
 *
 * Dùng:   buildMonthWindow(7, 2025).slots · formatSlotLabel(slot) → "T7/2026" · slotKey(monthIdx, year)
 * Lưu ý:  `slotKey` = year*12 + monthIdx: so số nguyên để so khoảng vắt năm (T12/2025 < T1/2026).
 */

interface MonthSlot {
  monthIdx: number;
  year: number;
}

interface MonthWindow {
  startMonth: number;
  startYear: number;
  span: number;
  slots: MonthSlot[];
}

const MAX_SPAN = 36;

export function buildMonthWindow(startMonth: number, startYear: number, span = 12): MonthWindow {
  const sm = Math.min(12, Math.max(1, Math.floor(startMonth)));
  const sy = Math.floor(startYear);
  const sp = Math.min(MAX_SPAN, Math.max(1, Math.floor(span)));

  const slots: MonthSlot[] = [];
  for (let i = 0; i < sp; i += 1) {
    const absoluteIdx = sm - 1 + i;
    const year = sy + Math.floor(absoluteIdx / 12);
    const monthIdx = ((absoluteIdx % 12) + 12) % 12;
    slots.push({ monthIdx, year });
  }

  return { startMonth: sm, startYear: sy, span: sp, slots };
}

/** Nhãn ngắn của một ô tháng: "T7/2026". */
export function formatSlotLabel(slot: MonthSlot): string {
  return `T${slot.monthIdx + 1}/${slot.year}`;
}

export const slotKey = (monthIdx: number, year: number) => year * 12 + monthIdx;
