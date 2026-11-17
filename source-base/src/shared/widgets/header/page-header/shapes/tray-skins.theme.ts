import { cn } from '@/shared/utils/style/cn';

import { CHIP_HEIGHT_VAR, PLATE_PLAIN, type HeaderSkinSpec } from './skin-parts.theme';

/**
 * tray-skins.theme.ts — năm kiểu của họ "khay" (`tray` · `tray-flip` · `tray-slant` · `command` · `facet`): dải nền ngang bẻ ra trên đầu nhóm tab (`nav.shelf`).
 * Tách khỏi `header-skin.theme.ts` (vượt 250 dòng). Công thức khe + lý do thiết kế: docs/notes/code/widgets-header.md.
 *
 * Dùng:   `HEADER_SKIN_SPECS` trải `TRAY_SKIN_SPECS` vào bảng chung.
 * Lưu ý:  ⛔ `--header-h` / `--chip-h` / `--shelf-rise` tính theo REM, KHỚP `HEADER_HEIGHT_CLASS` (40 · 44 · 52px) và `PAGE_CHIP_HEIGHT`.
 */

/**
 * Ba chiều cao đứng của kiểu khay — tính theo REM như `HEADER_HEIGHT_CLASS` / `PAGE_CHIP_HEIGHT` (đổi cỡ chữ gốc trình duyệt thì
 * cả đa giác lẫn thanh khay co giãn cùng): cao thanh, cao chip, khoảng từ đường khay tới đỉnh chip; `--shelf-y` = cao thanh − chip − rise.
 */
const TRAY_HEIGHT_VARS = cn(
  CHIP_HEIGHT_VAR,
  '[--header-h:2.5rem] xl:[--header-h:2.75rem] wide:[--header-h:3.25rem]',
  '[--shelf-rise:0.375rem] xl:[--shelf-rise:0.5rem]',
  '[--shelf-y:calc(var(--header-h)_-_var(--chip-h)_-_var(--shelf-rise))]',
);

/** Biến của hai kiểu tab bình hành bám cạnh vát bảng tên: khe chip ↔ bảng tên = `--nav-pad`, `--plate-inset` = `--chip-cut × (cao chip + rise) / cao chip`. */
const SLANT_TRAY_VARS = cn(
  '[--chip-cut:5px] xl:[--chip-cut:6px] wide:[--chip-cut:7px]',
  '[--chip-notch:6px] wide:[--chip-notch:7px] [--chip-gap:0px]',
  TRAY_HEIGHT_VARS,
  '[--plate-cut-sided:6px] xl:[--plate-cut-sided:8px] wide:[--plate-cut-sided:9px]',
  '[--plate-cut-free:10px] xl:[--plate-cut-free:12px] wide:[--plate-cut-free:14px]',
  '[--plate-inset:6px] xl:[--plate-inset:8px] wide:[--plate-inset:9px]',
  '[--plate-ext:2.6px] xl:[--plate-ext:3.7px] wide:[--plate-ext:4.8px]',
  '[--plate-tuck:6px] xl:[--plate-tuck:8px] wide:[--plate-tuck:9px]',
  '[--plate-notch:0px] [--plate-pad:10px]',
  '[--nav-pad:5px] xl:[--nav-pad:6px] wide:[--nav-pad:7px]',
);

export const TRAY_SKIN_SPECS = {
  /**
   * Khay: chip mũi tên như `chevron`; nền bảng tên "bẻ ngang" ra phủ trên đầu cả hai nhóm tab (thanh khay `data-shelf`, dài
   * theo số tab), viền bảng tên chỉ bắt đầu từ đường ngang xuống (KHÔNG nét đứng lên mép trên) rồi quặt VÀO TRONG: một cạnh chéo thẳng
   * từ đường ngang tới đáy (`--plate-inset`), song song cạnh trên của mũi chip — đáy bảng tên hẹp hơn đỉnh, không xoè ra góc ngoài.
   */
  tray: {
    vars: cn(
      '[--chip-cut:6px] xl:[--chip-cut:7px] wide:[--chip-cut:8px]',
      '[--chip-notch:0px] [--chip-gap:0px]',
      '[--chip-overlap:-2px] wide:[--chip-overlap:-3px]',
      TRAY_HEIGHT_VARS,
      '[--plate-cut-sided:9px] xl:[--plate-cut-sided:12px] wide:[--plate-cut-sided:13px]',
      '[--plate-cut-free:10px] xl:[--plate-cut-free:12px] wide:[--plate-cut-free:14px]',
      '[--plate-inset:15px] xl:[--plate-inset:19px] wide:[--plate-inset:21px]',
      '[--plate-ext:6.4px] xl:[--plate-ext:8.9px] wide:[--plate-ext:11.1px]',
      '[--plate-tuck:9px] xl:[--plate-tuck:11px] wide:[--plate-tuck:13px]',
      '[--plate-notch:0px] [--plate-pad:6px] xl:[--plate-pad:8px]',
      '[--nav-pad:4px] wide:[--nav-pad:5px]',
    ),
    chip: { shape: 'chevron', look: 'outline', mark: 'echo' },
    plate: { ...PLATE_PLAIN, shape: 'hang', solo: 'lean' },
    nav: { shelf: true },
  },
  /**
   * Khay ngược: cùng khung khay (chip mũi tên + dải ngang bẻ ra trên nhóm tab, không nét đứng lên mép trên) nhưng bảng tên đi NGƯỢC:
   * từ đường ngang cạnh chéo xuống mũi chip rồi XOÈ RA lại ở đáy (rãnh chữ V như `chevron`). Thêm nét gạch: đường ngang là chuỗi
   * gạch đứt (đoạn đặc 26px gần bảng tên, rồi gạch 6px cách 4px mờ dần) (nét gạch).
   */
  'tray-flip': {
    vars: cn(
      '[--chip-cut:6px] xl:[--chip-cut:7px] wide:[--chip-cut:8px]',
      '[--chip-notch:0px] [--chip-gap:0px]',
      '[--chip-overlap:-2px] wide:[--chip-overlap:-3px]',
      TRAY_HEIGHT_VARS,
      '[--plate-cut-sided:9px] xl:[--plate-cut-sided:12px] wide:[--plate-cut-sided:13px]',
      '[--plate-cut-free:0px] [--plate-slope:1.83] xl:[--plate-slope:1.57] wide:[--plate-slope:1.625]',
      '[--plate-ext:6.9px] xl:[--plate-ext:9px] wide:[--plate-ext:11px]',
      '[--plate-tuck:9px] xl:[--plate-tuck:11px] wide:[--plate-tuck:13px]',
      '[--plate-notch:0px] [--plate-pad:6px] xl:[--plate-pad:8px]',
      '[--nav-pad:4px] wide:[--nav-pad:5px]',
    ),
    chip: { shape: 'chevron', look: 'outline', mark: 'echo' },
    plate: { ...PLATE_PLAIN, shape: 'chevron', solo: 'leanVee' },
    nav: { shelf: true, dashed: true },
  },
  /**
   * Khay vát: khung khay như `tray` nhưng tab KHÔNG phải mũi tên — hình bình hành vát song song cạnh chéo của bảng tên (như `slant`),
   * cạnh chéo bảng tên thu vào `--plate-inset` = `--chip-cut × (cao chip + rise) / cao chip` (6 · 8 · 9px) từ đường ngang xuống đáy.
   */
  'tray-slant': {
    vars: SLANT_TRAY_VARS,
    chip: { shape: 'slant', look: 'outline', mark: 'chamfer' },
    plate: { ...PLATE_PLAIN, shape: 'hang', solo: 'lean' },
    nav: { shelf: true },
  },
  /**
   * Chỉ huy (mẫu BigDataView 106): tab hình bình hành TRỌN xếp khít song song (khe ngang đều `--nav-pad`, chồng `--chip-overlap = −(cut − khe)`),
   * bảng tên treo dưới thanh khay, cạnh chéo thu vào `--plate-inset` = `--chip-cut × (cao chip + rise) / cao chip` (7,6 · 9,5 · 10,5px) song
   * song cạnh tab; sát đầu trong thanh khay có bảy vạch xiên mờ dần (`nav.ornament: 'hatch'`).
   */
  command: {
    vars: cn(
      '[--chip-cut:6px] xl:[--chip-cut:7px] wide:[--chip-cut:8px]',
      '[--chip-notch:0px] [--chip-gap:0px]',
      '[--chip-overlap:-2px] xl:[--chip-overlap:-3px]',
      TRAY_HEIGHT_VARS,
      '[--plate-cut-sided:8px] xl:[--plate-cut-sided:10px] wide:[--plate-cut-sided:11px]',
      '[--plate-cut-free:10px] xl:[--plate-cut-free:12px] wide:[--plate-cut-free:14px]',
      '[--plate-inset:7.6px] xl:[--plate-inset:9.5px] wide:[--plate-inset:10.5px]',
      '[--plate-ext:3.3px] xl:[--plate-ext:4.4px] wide:[--plate-ext:5.6px]',
      '[--plate-tuck:7.6px] xl:[--plate-tuck:9.5px] wide:[--plate-tuck:10.5px]',
      '[--plate-notch:0px] [--plate-pad:10px]',
      '[--nav-pad:4px] wide:[--nav-pad:5px]',
    ),
    chip: { shape: 'skew', look: 'outline', mark: 'none' },
    plate: { ...PLATE_PLAIN, shape: 'hang', solo: 'lean' },
    nav: { shelf: true, ornament: 'hatch' },
  },
  /**
   * Vát sáng (mẫu BigDataView 061): hình học như `tray-slant`; tab có khung vát HAI LỚP (dải sáng thứ hai song song cạnh vát phía bảng
   * tên, thân sáng dần về phía bảng tên), thanh khay có HAI đường song song và một cánh hình bình hành sát bảng tên.
   */
  facet: {
    vars: SLANT_TRAY_VARS,
    chip: { shape: 'slant', look: 'outline', mark: 'facet' },
    plate: { ...PLATE_PLAIN, shape: 'hang', solo: 'lean' },
    nav: { shelf: true, double: true, ornament: 'wedge' },
  },
} satisfies Record<'tray' | 'tray-flip' | 'tray-slant' | 'command' | 'facet', HeaderSkinSpec>;
