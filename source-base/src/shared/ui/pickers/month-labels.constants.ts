/** Tên 12 tháng theo chỉ số 0..11: `long` "Tháng 7" (lịch ngày) · `short` "Th.7" (lưới chọn tháng). */
export const MONTH_LABELS = Array.from({ length: 12 }, (_, i) => ({
  long: `Tháng ${i + 1}`,
  short: `Th.${i + 1}`,
}));
