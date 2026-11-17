/**
 * dock-magnify.utils.ts — toán THUẦN của phóng lân cận Dock (không đụng DOM): hệ số phóng theo khoảng cách con trỏ,
 * độ dời từng ô để hai ô kề nhau KHÔNG BAO GIỜ chồng, độ nở của vỏ và bước làm mượt mỗi khung hình.
 *
 * Dùng:   const radius = dockMagnifyRadius(slots)
 *         const target = dockMagnifyFit(dockMagnifyTargets(slots, pointer, radius), slots, maxGrow)
 *         current[i] = dockMagnifyEase(current[i], target[i], dtMs)        // mỗi khung hình, không vọt lố
 *         const { shifts, grow } = dockMagnifyLayout(slots, current)      // dời dọc trục + vỏ nở thêm `grow` px
 * Lưu ý:  Toạ độ là vị trí GỐC (chưa phóng) dọc trục thanh, tính từ TÂM thanh. Dời luôn tính từ hệ số ĐANG VẼ (không
 *         làm mượt riêng) nên bất biến "không chồng" đúng ở MỌI khung hình, kể cả lúc đang trôi.
 */

/** Một phần tử con của thanh, đo ở trạng thái gốc. */
export interface DockMagnifySlot {
  /** Tâm gốc (px) dọc trục thanh, tính từ tâm thanh (âm = nửa đầu). */
  center: number;
  /** Bề dài gốc (px) dọc trục thanh. */
  size: number;
  /** `true` = ô phóng (mục, nút cài đặt); `false` = vạch ngăn / phần phụ — không phóng, chỉ dời theo. */
  magnifies: boolean;
}

/** Thông số phóng: `peak` hệ số ở ngay dưới con trỏ · `reach` bán kính ảnh hưởng (số bước ô) · `tauMs` hằng số trôi. */
export const DOCK_MAGNIFY = {
  peak: 1.5,
  reach: 2.5,
  tauMs: 70,
  settle: 0.001,
} as const;

/** Mức ảnh hưởng 0…1 theo khoảng cách (px): dạng cosine — bằng 1 ngay dưới con trỏ, trơn về 0 ở mép `radius`. */
export function dockMagnifyFalloff(distance: number, radius: number): number {
  const d = Math.abs(distance);
  if (radius <= 0 || d >= radius) return 0;
  return (1 + Math.cos((Math.PI * d) / radius)) / 2;
}

/** Bán kính ảnh hưởng (px) = `DOCK_MAGNIFY.reach` × bước giữa hai ô phóng liền nhau (ô + khe). */
export function dockMagnifyRadius(slots: readonly DockMagnifySlot[]): number {
  const items = slots.filter((slot) => slot.magnifies);
  if (items.length === 0) return 0;
  const pitch = items.length > 1 ? Math.abs(items[1].center - items[0].center) : items[0].size;
  return DOCK_MAGNIFY.reach * pitch;
}

/** Hệ số phóng ĐÍCH của từng phần tử khi con trỏ ở `pointer` (px từ tâm thanh); phần tử không phóng luôn `1`. */
export function dockMagnifyTargets(
  slots: readonly DockMagnifySlot[],
  pointer: number,
  radius: number,
  peak: number = DOCK_MAGNIFY.peak,
): number[] {
  return slots.map((slot) =>
    slot.magnifies ? 1 + (peak - 1) * dockMagnifyFalloff(pointer - slot.center, radius) : 1,
  );
}

/** Thu nhỏ đều phần phóng khi tổng độ nở vượt `maxGrow` px (thanh đã gần chạm mép màn) — macOS cũng vậy. */
export function dockMagnifyFit(
  scales: readonly number[],
  slots: readonly DockMagnifySlot[],
  maxGrow: number,
): number[] {
  const grow = scales.reduce((sum, scale, i) => sum + (scale - 1) * slots[i].size, 0);
  if (grow <= 0 || grow <= maxGrow) return [...scales];
  const k = Math.max(0, maxGrow) / grow;
  return scales.map((scale) => 1 + (scale - 1) * k);
}

/**
 * Độ dời (px, dọc trục) của từng phần tử + độ nở `grow` của vỏ. Phần dư `(s − 1) × size` của mỗi ô dồn về hai phía,
 * chia đều quanh tâm thanh: khe giữa hai ô giữ nguyên bề rộng gốc, vỏ nở thêm đúng `grow` (mỗi đầu `grow / 2`).
 */
export function dockMagnifyLayout(
  slots: readonly DockMagnifySlot[],
  scales: readonly number[],
): { shifts: number[]; grow: number } {
  const extras = slots.map((slot, i) => (scales[i] - 1) * slot.size);
  const grow = extras.reduce((sum, extra) => sum + extra, 0);
  let before = 0;
  const shifts = extras.map((extra) => {
    const shift = before + extra / 2 - grow / 2;
    before += extra;
    return shift;
  });
  return { shifts, grow };
}

/** Một bước trôi `current → target` sau `dtMs` (làm mượt hàm mũ, không vọt lố); đủ gần thì chốt bằng `target`. */
export function dockMagnifyEase(
  current: number,
  target: number,
  dtMs: number,
  tauMs: number = DOCK_MAGNIFY.tauMs,
): number {
  const alpha = 1 - Math.exp(-Math.max(0, dtMs) / tauMs);
  const next = current + (target - current) * alpha;
  return Math.abs(target - next) < DOCK_MAGNIFY.settle ? target : next;
}
