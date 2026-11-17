/**
 * skin-parts.theme.ts — kiểu dữ liệu của bảng cấu hình kiểu khung header (`HeaderSkinSpec` + các hình chip / bảng tên / dấu nhấn) và
 * hai hằng dùng chung của nhiều kiểu. Tách khỏi `header-skin.theme.ts` (vượt 250 dòng); nơi khác vẫn import type từ file gốc.
 *
 * Dùng:   import type { HeaderSkinSpec, ChipShape } from '../header-skin.theme'  (file gốc re-export)
 * Lưu ý:  ⛔ Thêm hình mới = thêm vào union ở đây + đa giác ở `chip-shapes.theme.ts` / `plate-shapes.theme.ts`.
 */

/**
 * Hình chip: `slant` bình hành vát góc ngoài · `chevron` mũi tên chỉ về bảng tên · `octagon` cắt bốn góc · `tag` nhãn cắt MỘT góc ·
 * `stair` khuyết hai bậc ở góc trên phía bảng tên · `box` chữ nhật · `folder` hình thang rộng ở đáy · `skew` bình hành TRỌN (hai đầu
 * cùng vát, xếp khít song song) · `bare` không khung.
 */
export type ChipShape =
  'slant' | 'chevron' | 'octagon' | 'tag' | 'stair' | 'box' | 'folder' | 'skew' | 'bare';
/** Mặt khung: `outline` viền 1px + thân đặc nhạt (bật = sáng xanh) · `solid` KHÔNG viền, thân tô đặc (bật = tô xanh đậm). */
export type FrameLook = 'outline' | 'solid';
/**
 * Dấu nhấn chip: `chamfer` dọc cạnh vát ngoài · `diagonal` hai góc chéo · `bracket` ngoặc L chéo góc · `ticks` bốn vạch dưới chân ·
 * `cap` vạch 2px mép trên · `echo` nét lặp hình mũi tên (cả hai CHỈ chip bật) · `facet` dải sáng thứ hai song song cạnh vát phía
 * bảng tên (khung vát hai lớp) · `none`.
 */
export type ChipMark =
  'chamfer' | 'diagonal' | 'bracket' | 'ticks' | 'cap' | 'echo' | 'facet' | 'none';
/**
 * Hình bảng tên: `keystone` hình thang vát góc trên · `octagon` thêm vát góc dưới · `chevron` hai rãnh chữ V nhận mũi chip ·
 * `stair` hai bậc thụt vào ở hai bên · `hang` treo dưới thanh khay (thu vào ở đáy) · `lean` / `leanVee` bản của `hang` / `chevron` cho trang KHÔNG tab
 * (cạnh nghiêng thẳng từ mép trên) · `folder` hình thang rộng ở đáy · `box` chữ nhật · `bare` không khung.
 */
export type PlateShape =
  | 'keystone'
  | 'octagon'
  | 'chevron'
  | 'stair'
  | 'hang'
  | 'lean'
  | 'leanVee'
  | 'folder'
  | 'box'
  | 'bare';
/** Dấu nhấn ở góc bảng tên: `chamfer` hai góc trên · `bracket` bốn ngoặc chữ L · `none`. */
export type PlateMark = 'chamfer' | 'bracket' | 'none';

/** Vật trang trí trong thanh khay: `hatch` bảy vạch xiên mờ dần · `wedge` một cánh hình bình hành. */
export type NavOrnament = 'hatch' | 'wedge';

export interface HeaderSkinSpec {
  /** Class đặt biến hình học lên `<header>` — con thừa kế. */
  vars: string;
  chip: { shape: ChipShape; look: FrameLook; mark: ChipMark };
  plate: {
    shape: PlateShape;
    /** Hình khi bảng tên đứng MỘT MÌNH (trang không tab, không thanh khay): cạnh nghiêng thẳng từ mép trên. Thiếu = dùng `shape`. */
    solo?: PlateShape;
    /** `solid`: KHÔNG viền, thân tô đậm hơn + vạch tông màu ở mép trên và chân. */
    look: FrameLook;
    mark: PlateMark;
    /** Núm sáng hình thang ở giữa ray đáy (kiểu "Cắt góc" như mẫu thiết kế). */
    handle: boolean;
    /** Cụm vạch gạch–chấm (▬▬ ▬ ▪) hai bên bảng tên, nằm ở dải trên đầu hai nhóm tab — nét gạch trang trí của bảng tên. */
    flank: boolean;
    /** Hai đường kẻ dọc mảnh ở hai mép bảng tên (thay cho khung ở kiểu không khung). */
    rules: boolean;
  };
  /**
   * Trang trí ô nav (tuỳ chọn, thiếu = không có): `shelf` vẽ thanh ngang trên nhóm tab, dài theo bề ngang nhóm; `dashed` đường gạch đứt ·
   * `double` hai đường song song · `ornament` vật trang trí sát bảng tên (`hatch` bảy vạch xiên · `wedge` cánh hình bình hành).
   */
  nav?: { shelf: boolean; dashed?: boolean; double?: boolean; ornament?: NavOrnament };
}

/** Phần bảng tên mặc định (không dấu nhấn, không trang trí) để kiểu nào cần thì ghi đè. */
export const PLATE_PLAIN = {
  look: 'outline',
  mark: 'none',
  handle: false,
  flank: false,
  rules: false,
} as const;

/** Cao chip theo bậc — dùng chung cho mọi kiểu mà đa giác bảng tên phải biết (`--chip-h`). */
export const CHIP_HEIGHT_VAR = '[--chip-h:1.375rem] wide:[--chip-h:1.625rem]';
