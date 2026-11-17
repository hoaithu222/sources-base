import type { ChipMark, ChipShape } from './skin-parts.theme';
import type { PageHeaderChipSlant } from '../page-nav.theme';

/**
 * chip-shapes.theme.ts — đa giác `clip-path` của khung chip + các dấu nhấn sáng (bảng tra, không logic hiển thị). Tọa độ ghi bằng
 * biến hình học của `<header>` (`--chip-cut` · `--chip-notch`, cấu hình ở `header-skin.theme.ts`) nên đổi cỡ theo bậc màn hình.
 *
 * Dùng:   chipClip(shape, slant) → chuỗi `polygon(…)` | undefined (không cắt) · chipMarks(mark, slant) → các đa giác dấu nhấn
 * Lưu ý:  ⛔ Hướng `slant` là DẢI chip đứng (`left` = bên trái bảng tên, `right` = bên phải) — mọi đa giác lật gương theo đó, phía
 *            "trong" luôn là phía bảng tên. ⛔ Cạnh chéo ở bảng này phải song song cạnh bảng tên (`page-header.theme.ts`).
 */

/** Điểm vát ngược ở góc ngoài kiểu vát: `E` nằm trên cạnh nghiêng (cách đỉnh `--chip-notch`), `A` nằm trên mép trên. */
const E = 'calc(var(--chip-cut) * 0.3)';
const A = 'calc(var(--chip-cut) * 0.3 + var(--chip-notch))';
const N = 'var(--chip-notch)';
const C = 'var(--chip-cut)';
const C2 = 'calc(var(--chip-cut) * 2)';
/** Bề dày NGANG của nét sáng dọc cạnh vát (~2px vuông góc). */
const BAND = '3px';
/** Ngoặc chữ L (kiểu vuông): chân dài 6px, dày 2px. */
const LEG = '6px';
const BRACKET = '2px';

const SLANT_CLIP = {
  left: `polygon(${A} 0, calc(100% - ${C}) 0, 100% 100%, ${C} 100%, ${E} ${N})`,
  right: `polygon(${C} 0, calc(100% - ${A}) 0, calc(100% - ${E}) ${N}, calc(100% - ${C}) 100%, 0 100%)`,
} satisfies Record<PageHeaderChipSlant, string>;

/** Kiểu "Mũi tên": mũi nhọn (sâu `--chip-cut`) chỉ về bảng tên, đuôi lõm cùng độ sâu nhận mũi chip đứng trước. */
const CHEVRON_CLIP = {
  left: `polygon(0 0, calc(100% - ${C}) 0, 100% 50%, calc(100% - ${C}) 100%, 0 100%, ${C} 50%)`,
  right: `polygon(${C} 0, 100% 0, calc(100% - ${C}) 50%, 100% 100%, ${C} 100%, 0 50%)`,
} satisfies Record<PageHeaderChipSlant, string>;

/** Kiểu "Bậc thang": chữ nhật khuyết hai bậc vuông (mỗi bậc `--chip-cut`) ở góc TRÊN phía bảng tên. */
const STAIR_CLIP = {
  left: `polygon(0 0, calc(100% - ${C2}) 0, calc(100% - ${C2}) ${C}, calc(100% - ${C}) ${C}, calc(100% - ${C}) ${C2}, 100% ${C2}, 100% 100%, 0 100%)`,
  right: `polygon(${C2} 0, 100% 0, 100% 100%, 0 100%, 0 ${C2}, ${C} ${C2}, ${C} ${C}, ${C2} ${C})`,
} satisfies Record<PageHeaderChipSlant, string>;

/** Kiểu "Nhãn": chữ nhật cắt MỘT góc trên phía NGOÀI (xa bảng tên) `--chip-notch`, như nhãn giá. */
const TAG_CLIP = {
  left: `polygon(${N} 0, 100% 0, 100% 100%, 0 100%, 0 ${N})`,
  right: `polygon(0 0, calc(100% - ${N}) 0, 100% ${N}, 100% 100%, 0 100%)`,
} satisfies Record<PageHeaderChipSlant, string>;

/** Kiểu "Chỉ huy": hình bình hành TRỌN — hai đầu cùng nghiêng `--chip-cut`, nên hai chip kề nhau có cạnh song song (khe đều). */
const SKEW_CLIP = {
  left: `polygon(0 0, calc(100% - ${C}) 0, 100% 100%, ${C} 100%)`,
  right: `polygon(${C} 0, 100% 0, calc(100% - ${C}) 100%, 0 100%)`,
} satisfies Record<PageHeaderChipSlant, string>;

/** Kiểu "Cắt góc": chữ nhật vát CẢ BỐN góc `--chip-notch`, hai đầu nhọn nhẹ như mẫu thiết kế. */
const OCTAGON_CLIP = `polygon(${N} 0, calc(100% - ${N}) 0, 100% ${N}, 100% calc(100% - ${N}), calc(100% - ${N}) 100%, ${N} 100%, 0 calc(100% - ${N}), 0 ${N})`;

/** Kiểu "Thẻ": hình thang RỘNG Ở ĐÁY (hai cạnh bên loe ra dưới), đứng trên ray như tab thư mục — đối xứng, không phân dải. */
const FOLDER_CLIP = `polygon(${C} 0, calc(100% - ${C}) 0, 100% 100%, 0 100%)`;

/** Hướng sáng dần của kiểu mũi tên: về phía MŨI (phía bảng tên) — dải trái sáng sang phải, dải phải sáng sang trái. */
export const CHEVRON_TOWARD = { left: 'to right', right: 'to left' } satisfies Record<
  PageHeaderChipSlant,
  string
>;

/** Khung của hình `shape`; `box` / `bare` không cắt (chữ nhật trần, hoặc không vẽ khung). */
export function chipClip(shape: ChipShape, slant: PageHeaderChipSlant): string | undefined {
  if (shape === 'slant') return SLANT_CLIP[slant];
  if (shape === 'skew') return SKEW_CLIP[slant];
  if (shape === 'chevron') return CHEVRON_CLIP[slant];
  if (shape === 'stair') return STAIR_CLIP[slant];
  if (shape === 'tag') return TAG_CLIP[slant];
  if (shape === 'octagon') return OCTAGON_CLIP;
  return shape === 'folder' ? FOLDER_CLIP : undefined;
}

const CHAMFER_MARK = {
  left: `polygon(${E} ${N}, ${A} 0, calc(${A} + ${BAND}) 0, calc(${E} + ${BAND}) ${N})`,
  right: `polygon(calc(100% - ${E}) ${N}, calc(100% - ${A}) 0, calc(100% - ${A} - ${BAND}) 0, calc(100% - ${E} - ${BAND}) ${N})`,
} satisfies Record<PageHeaderChipSlant, string>;

/** Dải sáng thứ hai của khung vát hai lớp: song song cạnh vát phía bảng tên, cách viền 2px, dày `BAND` — suốt chiều cao chip. */
const FACET_MARK = {
  left: `polygon(calc(100% - ${C} - 3px - ${BAND}) 0, calc(100% - ${C} - 3px) 0, calc(100% - 3px) 100%, calc(100% - 3px - ${BAND}) 100%)`,
  right: `polygon(calc(${C} + 3px) 0, calc(${C} + 3px + ${BAND}) 0, calc(3px + ${BAND}) 100%, 3px 100%)`,
} satisfies Record<PageHeaderChipSlant, string>;

/** Hai nét sáng CHÉO GÓC (trên-trái + dưới-phải) dọc cạnh vát của bát giác. */
const DIAGONAL_MARKS = [
  `polygon(0 ${N}, ${N} 0, calc(${N} + ${BAND}) 0, ${BAND} ${N})`,
  `polygon(100% calc(100% - ${N}), calc(100% - ${N}) 100%, calc(100% - ${N} - ${BAND}) 100%, calc(100% - ${BAND}) calc(100% - ${N}))`,
] as const;

/** Hai ngoặc chữ L CHÉO GÓC (trên-trái + dưới-phải) của khung chữ nhật. */
const BRACKET_MARKS = [
  `polygon(0 0, ${LEG} 0, ${LEG} ${BRACKET}, ${BRACKET} ${BRACKET}, ${BRACKET} ${LEG}, 0 ${LEG})`,
  `polygon(100% 100%, calc(100% - ${LEG}) 100%, calc(100% - ${LEG}) calc(100% - ${BRACKET}), calc(100% - ${BRACKET}) calc(100% - ${BRACKET}), calc(100% - ${BRACKET}) calc(100% - ${LEG}), 100% calc(100% - ${LEG}))`,
] as const;

/** Nắp tab (kiểu "Thẻ"): vạch 2px dọc mép trên, hai đầu bám đúng cạnh loe của hình thang. */
const CAP_MARK = `polygon(${C} 0, calc(100% - ${C}) 0, calc(100% - ${C} + ${C} * 0.09) 2px, calc(${C} - ${C} * 0.09) 2px)`;

/** Nét lặp hình mũi tên bên trong mũi chip (kiểu "Mũi tên"): cách mũi 2px, dày 2px, chạy song song hai cạnh mũi. */
const ECHO_MARK = {
  left: `polygon(calc(100% - ${C} - 4px) 0, calc(100% - ${C} - 2px) 0, calc(100% - 2px) 50%, calc(100% - ${C} - 2px) 100%, calc(100% - ${C} - 4px) 100%, calc(100% - 4px) 50%)`,
  right: `polygon(calc(${C} + 2px) 0, calc(${C} + 4px) 0, 4px 50%, calc(${C} + 4px) 100%, calc(${C} + 2px) 100%, 2px 50%)`,
} satisfies Record<PageHeaderChipSlant, string>;

/**
 * Các đa giác dấu nhấn của kiểu `mark`; rỗng = không dấu nhấn. `ticks` do `ChipTicks` vẽ bằng phần tử riêng; `cap` / `echo`
 * chỉ hiện ở chip BẬT (chip nghỉ để trơn — dấu nhấn rải lên mọi control là rối).
 */
export function chipMarks(
  mark: ChipMark,
  slant: PageHeaderChipSlant,
  active: boolean,
): readonly string[] {
  if (mark === 'chamfer') return [CHAMFER_MARK[slant]];
  if (mark === 'facet') return [FACET_MARK[slant]];
  if (mark === 'diagonal') return DIAGONAL_MARKS;
  if (mark === 'bracket') return BRACKET_MARKS;
  if (!active) return [];
  if (mark === 'cap') return [CAP_MARK];
  return mark === 'echo' ? [ECHO_MARK[slant]] : [];
}
