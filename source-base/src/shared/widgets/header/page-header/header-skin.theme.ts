import { useContext } from 'react';

import { cn } from '@/shared/utils/style/cn';

import { useHeaderSkin, type HeaderSkin } from '../header-skin.store';
import { HeaderSkinOverrideContext } from './shapes/skin-override.context';
import { CHIP_HEIGHT_VAR, PLATE_PLAIN, type HeaderSkinSpec } from './shapes/skin-parts.theme';
import { TRAY_SKIN_SPECS } from './shapes/tray-skins.theme';

export type {
  ChipMark,
  ChipShape,
  FrameLook,
  HeaderSkinSpec,
  PlateMark,
  PlateShape,
} from './shapes/skin-parts.theme';

/**
 * header-skin.theme.ts — BẢNG CẤU HÌNH DUY NHẤT của các kiểu khung header (`HeaderSkin`): hình chip, hình bảng tên, dấu nhấn
 * và mọi biến hình học. Thêm / sửa một kiểu = sửa MỘT mục ở `HEADER_SKIN_SPECS`; component chỉ đọc bảng này.
 *
 * Dùng:   const spec = useHeaderSkinSpec();  spec.vars → gắn lên `<header>` · spec.chip / spec.plate → hình + dấu nhấn
 * Biến:   chín biến chính (`--chip-cut` · `--chip-notch` · `--chip-gap` · `--plate-cut-sided|free` · `--plate-tuck` ·
 *         `--plate-notch` · `--plate-pad` · `--nav-pad`) + phụ `--chip-h` · `--chip-overlap` · `--plate-slope` · `--plate-inset` · `--header-h` · `--shelf-rise` · `--shelf-y` (các kiểu khay, ĐƠN VỊ REM như chiều cao thanh);
 *         nghĩa từng biến: docs/notes/code/widgets-header.md
 * Lưu ý:  ⛔ `--nav-pad` / `--plate-tuck` quyết định khe: vát = `--chip-cut` · bảng tên nghiêng + chip thẳng = `--chip-gap + ½ ×
 *            --plate-cut-sided` · thẳng = `--chip-gap` · lồng nhau (mũi tên, bậc thang) `--plate-tuck = độ sâu − khe + --nav-pad`.
 *         ⛔ MỌI kiểu khai ĐỦ chín biến chính (bài kiểm `header-skin.store.test.ts`); `--chip-h` KHỚP `PAGE_CHIP_HEIGHT` (22 · `wide:` 26px).
 *         ⛔ Class ghi LITERAL (Tailwind quét văn bản thuần); KHÔNG bo tròn, KHÔNG điểm sáng hình thoi xoay 45°.
 */

export const HEADER_SKIN_SPECS = {
  ...TRAY_SKIN_SPECS,
  /** Vát chéo: chip + bảng tên cùng độ nghiêng, khe chéo đều. */
  slant: {
    vars: cn(
      '[--chip-cut:5px] xl:[--chip-cut:6px] wide:[--chip-cut:7px]',
      '[--chip-notch:6px] wide:[--chip-notch:7px] [--chip-gap:0px]',
      '[--plate-cut-sided:9px] xl:[--plate-cut-sided:12px] wide:[--plate-cut-sided:14px]',
      '[--plate-cut-free:8px] md:[--plate-cut-free:14px] xl:[--plate-cut-free:20px] wide:[--plate-cut-free:25px]',
      '[--plate-tuck:9px] xl:[--plate-tuck:12px] wide:[--plate-tuck:14px]',
      '[--plate-notch:5px] md:[--plate-notch:6px] xl:[--plate-notch:8px] wide:[--plate-notch:10px]',
      '[--plate-pad:2px] [--nav-pad:5px] xl:[--nav-pad:6px] wide:[--nav-pad:7px]',
    ),
    chip: { shape: 'slant', look: 'outline', mark: 'chamfer' },
    plate: { ...PLATE_PLAIN, shape: 'keystone', mark: 'chamfer', flank: true },
  },
  /**
   * Mũi tên: chip hình mũi tên chỉ về bảng tên, đuôi lõm nhận mũi chip trước (lồng nhau, khe chéo đều); bảng tên khuyết hai rãnh
   * chữ V đúng độ cao chip để nhận mũi chip cuối. Khe chéo ngang = 4 / 5 / 5px; độ sâu mũi = 6 / 7 / 8px.
   */
  chevron: {
    vars: cn(
      '[--chip-cut:6px] xl:[--chip-cut:7px] wide:[--chip-cut:8px]',
      '[--chip-notch:0px] [--chip-gap:0px]',
      '[--chip-overlap:-2px] wide:[--chip-overlap:-3px]',
      CHIP_HEIGHT_VAR,
      '[--plate-cut-sided:10px] xl:[--plate-cut-sided:11px] wide:[--plate-cut-sided:12px]',
      '[--plate-cut-free:0px] [--plate-slope:1.83] xl:[--plate-slope:1.57] wide:[--plate-slope:1.625]',
      '[--plate-tuck:10px] wide:[--plate-tuck:12px]',
      '[--plate-notch:0px] [--plate-pad:6px] xl:[--plate-pad:8px]',
      '[--nav-pad:4px] wide:[--nav-pad:5px]',
    ),
    chip: { shape: 'chevron', look: 'outline', mark: 'echo' },
    plate: { ...PLATE_PLAIN, shape: 'chevron', flank: true },
  },
  /** Cắt góc (theo mẫu thiết kế): chip bát giác, bảng tên đáy nấc + núm sáng, vạch sáng trên mép. */
  hex: {
    vars: cn(
      '[--chip-cut:0px] [--chip-notch:7px] xl:[--chip-notch:8px] wide:[--chip-notch:9px]',
      '[--chip-gap:4px] wide:[--chip-gap:6px]',
      '[--plate-cut-sided:10px] xl:[--plate-cut-sided:14px] wide:[--plate-cut-sided:18px]',
      '[--plate-cut-free:10px] md:[--plate-cut-free:12px] xl:[--plate-cut-free:16px] wide:[--plate-cut-free:20px]',
      '[--plate-tuck:10px] xl:[--plate-tuck:14px] wide:[--plate-tuck:18px]',
      '[--plate-notch:6px] xl:[--plate-notch:8px] wide:[--plate-notch:10px]',
      '[--plate-pad:10px] [--nav-pad:7px] xl:[--nav-pad:8px] wide:[--nav-pad:11px]',
    ),
    chip: { shape: 'octagon', look: 'outline', mark: 'diagonal' },
    plate: { ...PLATE_PLAIN, shape: 'octagon', mark: 'chamfer', handle: true, flank: true },
  },
  /** Nhãn: chip chữ nhật cắt MỘT góc trên phía ngoài (như nhãn giá), bảng tên chữ nhật cắt hai góc trên — khe thẳng đều. */
  tag: {
    vars: cn(
      '[--chip-cut:0px] [--chip-notch:6px] xl:[--chip-notch:7px] wide:[--chip-notch:8px]',
      '[--chip-gap:4px] wide:[--chip-gap:5px]',
      '[--plate-cut-sided:0px] [--plate-cut-free:0px] [--plate-tuck:0px]',
      '[--plate-notch:6px] xl:[--plate-notch:8px] wide:[--plate-notch:10px]',
      '[--plate-pad:14px] [--nav-pad:4px] wide:[--nav-pad:5px]',
    ),
    chip: { shape: 'tag', look: 'outline', mark: 'chamfer' },
    plate: { ...PLATE_PLAIN, shape: 'keystone', mark: 'chamfer', flank: true },
  },
  /**
   * Bậc thang: chip chữ nhật khuyết hai bậc vuông ở góc trên phía bảng tên; bảng tên thụt hai bậc ở hai bên, ôm đúng bậc của chip
   * (khe đều theo cả chiều ngang lẫn dọc). Mọi cạnh song song trục nên nét tuyệt đối ở DPR 1. Bậc = khe = 3px (`wide:` 4px).
   */
  stair: {
    vars: cn(
      '[--chip-cut:3px] wide:[--chip-cut:4px] [--chip-notch:0px]',
      '[--chip-gap:3px] wide:[--chip-gap:4px]',
      CHIP_HEIGHT_VAR,
      '[--plate-cut-sided:6px] wide:[--plate-cut-sided:8px] [--plate-cut-free:0px]',
      '[--plate-tuck:6px] wide:[--plate-tuck:8px]',
      '[--plate-notch:0px] [--plate-pad:12px]',
      '[--nav-pad:3px] wide:[--nav-pad:4px]',
    ),
    chip: { shape: 'stair', look: 'outline', mark: 'none' },
    plate: { ...PLATE_PLAIN, shape: 'stair', flank: true },
  },
  /** Vuông: chữ nhật thẳng, ngoặc chữ L ở góc — hợp luật "vuông góc" của dự án. */
  square: {
    vars: cn(
      '[--chip-cut:0px] [--chip-notch:0px]',
      '[--chip-gap:4px] wide:[--chip-gap:5px]',
      '[--plate-cut-sided:0px] [--plate-cut-free:0px] [--plate-tuck:0px] [--plate-notch:0px]',
      '[--plate-pad:12px] [--nav-pad:4px] wide:[--nav-pad:5px]',
    ),
    chip: { shape: 'box', look: 'outline', mark: 'bracket' },
    plate: { ...PLATE_PLAIN, shape: 'box', mark: 'bracket' },
  },
  /** Thẻ: tab thư mục hình thang rộng ở đáy, đứng trên ray như ngăn kéo; bảng tên là tab lớn ở giữa. */
  folder: {
    vars: cn(
      '[--chip-cut:5px] xl:[--chip-cut:6px] wide:[--chip-cut:7px]',
      '[--chip-notch:0px] [--chip-gap:4px] wide:[--chip-gap:5px]',
      '[--plate-cut-sided:9px] xl:[--plate-cut-sided:12px] wide:[--plate-cut-sided:14px]',
      '[--plate-cut-free:8px] md:[--plate-cut-free:12px] xl:[--plate-cut-free:16px] wide:[--plate-cut-free:20px]',
      '[--plate-tuck:0px] [--plate-notch:0px]',
      '[--plate-pad:10px] [--nav-pad:4px] wide:[--nav-pad:5px]',
    ),
    chip: { shape: 'folder', look: 'outline', mark: 'cap' },
    plate: { ...PLATE_PLAIN, shape: 'folder' },
  },
  /** Khối đặc: không viền, tab tô đặc có chân 2px đứng trên ray (bật = tô xanh đậm), bảng tên là khối đặc có vạch tông màu trên mép và chân. */
  solid: {
    vars: cn(
      '[--chip-cut:0px] [--chip-notch:0px]',
      '[--chip-gap:3px] wide:[--chip-gap:4px]',
      '[--plate-cut-sided:0px] [--plate-cut-free:0px] [--plate-tuck:0px] [--plate-notch:0px]',
      '[--plate-pad:12px] [--nav-pad:3px] wide:[--nav-pad:4px]',
    ),
    chip: { shape: 'box', look: 'solid', mark: 'none' },
    plate: { ...PLATE_PLAIN, shape: 'box', look: 'solid' },
  },
  /** Thang vạch: không khung — chân mỗi tab là bốn vạch ngắn sáng dần về phía bảng tên (như vạch sóng), đường kẻ dọc hai mép bảng tên. */
  gauge: {
    vars: cn(
      '[--chip-cut:0px] [--chip-notch:0px]',
      '[--chip-gap:2px] wide:[--chip-gap:3px]',
      '[--plate-cut-sided:0px] [--plate-cut-free:0px] [--plate-tuck:0px] [--plate-notch:0px]',
      '[--plate-pad:12px] [--nav-pad:6px] wide:[--nav-pad:8px]',
    ),
    chip: { shape: 'bare', look: 'outline', mark: 'ticks' },
    plate: { ...PLATE_PLAIN, shape: 'bare', rules: true },
  },
  /** Gạch chân: không khung — chữ, vạch sáng đáy, đường kẻ dọc hai mép bảng tên. */
  line: {
    vars: cn(
      '[--chip-cut:0px] [--chip-notch:0px]',
      '[--chip-gap:2px] wide:[--chip-gap:3px]',
      '[--plate-cut-sided:0px] [--plate-cut-free:0px] [--plate-tuck:0px] [--plate-notch:0px]',
      '[--plate-pad:10px] [--nav-pad:6px] wide:[--nav-pad:8px]',
    ),
    chip: { shape: 'bare', look: 'outline', mark: 'none' },
    plate: { ...PLATE_PLAIN, shape: 'bare', rules: true },
  },
} satisfies Record<HeaderSkin, HeaderSkinSpec>;

/** Cấu hình của kiểu khung ĐANG chọn (ghi đè của nhánh xem trước, không thì store cục bộ) — luôn hợp lệ, mặc định `tray`. */
export function useHeaderSkinSpec(): HeaderSkinSpec {
  const override = useContext(HeaderSkinOverrideContext);
  const stored = useHeaderSkin();
  return HEADER_SKIN_SPECS[override ?? stored];
}
