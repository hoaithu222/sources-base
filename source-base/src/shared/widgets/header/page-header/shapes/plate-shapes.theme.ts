import type { PlateMark, PlateShape } from './skin-parts.theme';

/**
 * plate-shapes.theme.ts — đa giác `clip-path` của BẢNG TÊN (hình · dấu nhấn góc · núm sáng đáy) theo cấu hình kiểu khung
 * `header-skin.theme.ts`. Tách khỏi `page-header.theme.ts` (vượt 250 dòng).
 *
 * Dùng:   PLATE_SHAPE_CLASSES[shape] cho viền (`plateEdge`) + thân (`plateBg`) · PLATE_MARK_CLASSES[mark] · PLATE_HANDLE_CLASS
 * Lưu ý:  ⛔ Tọa độ ghi bằng biến của `<header>` / bảng tên (`--plate-cut` · `--plate-e` · `--plate-notch` · `--plate-slope` ·
 *            `--chip-h` · `--chip-cut` · `--chip-gap`) — class LITERAL (Tailwind quét văn bản thuần), dấu cách viết `_`.
 *         ⛔ Cạnh chéo của rãnh `chevron` / bậc `stair` phải song song cạnh chip kề (`shapes/chip-shapes.theme.ts`).
 */

/**
 * Đa giác từng hình bảng tên (viền `plateEdge` + thân `plateBg` dùng chung chuỗi): `--plate-e` điểm vát trên cạnh nghiêng (`--plate-cut × 0.22`),
 * `--plate-notch` cạnh vát góc. `keystone` vát hai góc TRÊN · `octagon` thêm vát góc DƯỚI · `chevron` đuôi én: hai rãnh V sâu `--plate-cut` có cạnh trên kéo dài lên mép trên (dốc `--plate-slope`), mũi chip lọt đúng rãnh ·
 * `stair` hai bậc thụt (tread cách chân chip `--chip-gap`) · `hang` treo dưới thanh khay: đầy tới `--shelf-y`, rồi cạnh chéo thẳng thu vào `--plate-inset` ở đáy · `lean` / `leanVee` = `hang` / `chevron` khi KHÔNG có thanh khay (trang không tab): cạnh chéo gốc KÉO THẲNG lên mép trên (lấn ra ngoài hộp `--plate-ext` mỗi bên — lớp viền / thân được nới đúng chừng đó) · `box` / `bare` không cắt.
 */
export const PLATE_SHAPE_CLASSES = {
  keystone:
    '[clip-path:polygon(calc(var(--plate-e)_+_var(--plate-notch))_0,calc(100%_-_var(--plate-e)_-_var(--plate-notch))_0,calc(100%_-_var(--plate-e))_var(--plate-notch),calc(100%_-_var(--plate-cut))_100%,var(--plate-cut)_100%,var(--plate-e)_var(--plate-notch))]',
  octagon:
    '[clip-path:polygon(calc(var(--plate-e)_+_var(--plate-notch))_0,calc(100%_-_var(--plate-e)_-_var(--plate-notch))_0,calc(100%_-_var(--plate-e))_var(--plate-notch),calc(100%_-_var(--plate-cut)_+_var(--plate-e))_calc(100%_-_var(--plate-notch)),calc(100%_-_var(--plate-cut)_-_var(--plate-notch))_100%,calc(var(--plate-cut)_+_var(--plate-notch))_100%,calc(var(--plate-cut)_-_var(--plate-e))_calc(100%_-_var(--plate-notch)),var(--plate-e)_var(--plate-notch))]',
  folder:
    '[clip-path:polygon(var(--plate-cut)_0,calc(100%_-_var(--plate-cut))_0,100%_100%,0_100%)]',
  chevron:
    '[clip-path:polygon(0_0,100%_0,100%_max(0px,calc(100%_-_var(--chip-h)_/_2_-_var(--plate-cut)_*_var(--plate-slope))),calc(100%_-_var(--plate-cut))_calc(100%_-_var(--chip-h)_/_2),calc(100%_-_max(0px,calc(var(--plate-cut)_-_var(--chip-cut))))_100%,max(0px,calc(var(--plate-cut)_-_var(--chip-cut)))_100%,var(--plate-cut)_calc(100%_-_var(--chip-h)_/_2),0_max(0px,calc(100%_-_var(--chip-h)_/_2_-_var(--plate-cut)_*_var(--plate-slope))))]',
  stair:
    '[clip-path:polygon(0_0,100%_0,100%_calc(100%_-_var(--chip-h)_+_var(--plate-cut)_/_2_-_var(--chip-gap)),calc(100%_-_var(--plate-cut)_/_2)_calc(100%_-_var(--chip-h)_+_var(--plate-cut)_/_2_-_var(--chip-gap)),calc(100%_-_var(--plate-cut)_/_2)_calc(100%_-_var(--chip-h)_+_var(--plate-cut)_-_var(--chip-gap)),calc(100%_-_var(--plate-cut))_calc(100%_-_var(--chip-h)_+_var(--plate-cut)_-_var(--chip-gap)),calc(100%_-_var(--plate-cut))_100%,var(--plate-cut)_100%,var(--plate-cut)_calc(100%_-_var(--chip-h)_+_var(--plate-cut)_-_var(--chip-gap)),calc(var(--plate-cut)_/_2)_calc(100%_-_var(--chip-h)_+_var(--plate-cut)_-_var(--chip-gap)),calc(var(--plate-cut)_/_2)_calc(100%_-_var(--chip-h)_+_var(--plate-cut)_/_2_-_var(--chip-gap)),0_calc(100%_-_var(--chip-h)_+_var(--plate-cut)_/_2_-_var(--chip-gap)))]',
  hang: '[clip-path:polygon(0_0,100%_0,100%_var(--shelf-y),calc(100%_-_min(var(--plate-inset),45%))_100%,min(var(--plate-inset),45%)_100%,0_var(--shelf-y))]',
  lean: '[clip-path:polygon(0_0,100%_0,calc(100%_-_var(--plate-ext))_var(--shelf-y),calc(100%_-_var(--plate-ext)_-_min(var(--plate-inset),45%))_100%,calc(var(--plate-ext)_+_min(var(--plate-inset),45%))_100%,var(--plate-ext)_var(--shelf-y))]',
  leanVee:
    '[clip-path:polygon(0_0,100%_0,calc(100%_-_var(--plate-ext)_-_var(--plate-cut))_calc(100%_-_var(--chip-h)_/_2),calc(100%_-_var(--plate-ext)_-_max(0px,calc(var(--plate-cut)_-_var(--chip-cut))))_100%,calc(var(--plate-ext)_+_max(0px,calc(var(--plate-cut)_-_var(--chip-cut))))_100%,calc(var(--plate-ext)_+_var(--plate-cut))_calc(100%_-_var(--chip-h)_/_2))]',
  box: '',
  bare: '',
} satisfies Record<PlateShape, string>;

/**
 * Dấu nhấn góc bảng tên (mỗi phần tử một nét sáng `--plate-tone`): `chamfer` = hai dải ~2px dọc hai cạnh vát góc TRÊN ·
 * `bracket` = bốn ngoặc chữ L (chân 8px, dày 2px) · `none`.
 */
export const PLATE_MARK_CLASSES = {
  chamfer: [
    '[clip-path:polygon(var(--plate-e)_var(--plate-notch),calc(var(--plate-e)_+_var(--plate-notch))_0,calc(var(--plate-e)_+_var(--plate-notch)_+_3px)_0,calc(var(--plate-e)_+_3px)_var(--plate-notch))]',
    '[clip-path:polygon(calc(100%_-_var(--plate-e))_var(--plate-notch),calc(100%_-_var(--plate-e)_-_var(--plate-notch))_0,calc(100%_-_var(--plate-e)_-_var(--plate-notch)_-_3px)_0,calc(100%_-_var(--plate-e)_-_3px)_var(--plate-notch))]',
  ],
  bracket: [
    '[clip-path:polygon(0_0,8px_0,8px_2px,2px_2px,2px_8px,0_8px)]',
    '[clip-path:polygon(100%_0,calc(100%_-_8px)_0,calc(100%_-_8px)_2px,calc(100%_-_2px)_2px,calc(100%_-_2px)_8px,100%_8px)]',
    '[clip-path:polygon(0_100%,8px_100%,8px_calc(100%_-_2px),2px_calc(100%_-_2px),2px_calc(100%_-_8px),0_calc(100%_-_8px))]',
    '[clip-path:polygon(100%_100%,calc(100%_-_8px)_100%,calc(100%_-_8px)_calc(100%_-_2px),calc(100%_-_2px)_calc(100%_-_2px),calc(100%_-_2px)_calc(100%_-_8px),100%_calc(100%_-_8px))]',
  ],
  none: [],
} satisfies Record<PlateMark, readonly string[]>;

/** Núm sáng hình thang ở giữa ray đáy (chỉ kiểu "Cắt góc", như mẫu thiết kế). KHÔNG dùng hình thoi xoay 45°: cỡ vài px bị răng cưa thành dấu "*" ở màn DPR 1. */
export const PLATE_HANDLE_CLASS =
  'bottom-0 h-1 w-10 bg-[var(--plate-tone)] [clip-path:polygon(0_100%,6px_0,calc(100%_-_6px)_0,100%_100%)]';
