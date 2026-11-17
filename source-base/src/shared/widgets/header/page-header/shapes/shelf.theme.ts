import { cn } from '@/shared/utils/style/cn';

import type { PageHeaderChipSlant } from '../page-nav.theme';

/**
 * shelf.theme.ts — bảng class của THANH KHAY (họ kiểu "khay": `HEADER_SKIN_SPECS[skin].nav.shelf`) và vật trang trí của nó: dải nền
 * + đường ngang bẻ ra từ bảng tên phủ trên đầu nhóm tab, dài theo số tab. Tách khỏi `page-nav.theme.ts` (vượt 250 dòng khi thêm biến thể).
 *
 * Dùng:   cn(PAGE_NAV_SHELF_CLASSES.root, PAGE_NAV_SHELF_CLASSES[slant], PAGE_NAV_SHELF_LINE_CLASSES[line]) · vật trang trí: PAGE_NAV_SHELF_ORNAMENT_CLASSES
 * Lưu ý:  ⛔ Class ghi LITERAL (Tailwind quét văn bản thuần) — các chuỗi dài bên dưới được sinh một lần rồi dán nguyên, đừng dựng bằng nội suy.
 *         ⛔ Đỉnh thanh = mép trên header, đáy cách đỉnh chip `--shelf-rise` (`--shelf-y` = cao thanh − cao chip − rise); đầu trong chồng 3px
 *            dưới bảng tên, đầu NGOÀI mờ dần (không nét đứng). Kiểu đường: `solid` · `dashed` (gạch đứt) · `double` (hai đường song song).
 *         ⛔ Phía (`--shelf-out` hướng bảng tên → đầu ngoài, `--shelf-in` ngược lại, `--shelf-end` mép đầu trong) và nền sáng / tối
 *            (`--shelf-wash`) là BIẾN để MỘT class gradient dùng chung hai phía + hai chế độ — viết thẳng thì mỗi kiểu đường thành 4 class
 *            ~1.4 kB (đã làm vượt ngân sách CSS tải đầu, `scripts/check-bundle.mjs`).
 */

export const PAGE_NAV_SHELF_CLASSES = {
  root: cn(
    'pointer-events-none absolute bottom-[calc(100%+var(--shelf-rise))] h-[var(--shelf-y)] ms-0! bg-no-repeat',
    '[mask-image:linear-gradient(var(--shelf-in),transparent,#000_28px)]',
    '[--shelf-wash:color-mix(in_srgb,var(--plate-tone)_10%,var(--header-bg))]',
    'dark:[--shelf-wash:color-mix(in_srgb,var(--plate-tone)_14%,var(--color-bg-header-from))]',
  ),
  left: cn(
    'left-0 right-[calc(var(--plate-tuck)-var(--nav-pad)-3px)]',
    '[--shelf-out:to_left] [--shelf-in:to_right] [--shelf-end:right]',
  ),
  right: cn(
    'right-0 left-[calc(var(--plate-tuck)-var(--nav-pad)-3px)]',
    '[--shelf-out:to_right] [--shelf-in:to_left] [--shelf-end:left]',
  ),
} satisfies Record<'root' | PageHeaderChipSlant, string>;

/** Kiểu đường ngang của thanh khay — `nav.dashed` → `dashed`, `nav.double` → `double`, còn lại `solid`. Lớp nền cuối luôn là `--shelf-wash`. */
export const PAGE_NAV_SHELF_LINE_CLASSES = {
  solid: cn(
    'bg-size-[100%_1px,100%_var(--header-h)] bg-position-[bottom,top]',
    'bg-[linear-gradient(var(--shelf-out),var(--plate-tone),color-mix(in_srgb,var(--plate-tone)_50%,transparent)),linear-gradient(to_bottom,var(--shelf-wash),var(--header-bg))]',
  ),
  dashed: cn(
    'bg-size-[26px_1px,100%_1px,100%_var(--header-h)] bg-position-[var(--shelf-end)_bottom,bottom,top]',
    'bg-[linear-gradient(var(--plate-tone),var(--plate-tone)),repeating-linear-gradient(var(--shelf-in),color-mix(in_srgb,var(--plate-tone)_80%,transparent)_0_6px,transparent_6px_10px),linear-gradient(to_bottom,var(--shelf-wash),var(--header-bg))]',
  ),
  double: cn(
    'bg-size-[100%_1px,100%_1px,100%_var(--header-h)] bg-position-[bottom,center_bottom_5px,top]',
    'bg-[linear-gradient(var(--shelf-out),var(--plate-tone),color-mix(in_srgb,var(--plate-tone)_50%,transparent)),linear-gradient(var(--shelf-out),color-mix(in_srgb,var(--plate-tone)_80%,transparent),color-mix(in_srgb,var(--plate-tone)_20%,transparent)),linear-gradient(to_bottom,var(--shelf-wash),var(--header-bg))]',
  ),
} as const;

export type PageNavShelfLine = keyof typeof PAGE_NAV_SHELF_LINE_CLASSES;

/**
 * Vật trang trí đặt TRONG thanh khay, sát đầu trong (cách bảng tên ~6px), cao hơn đáy thanh 3px: `hatch` = bảy vạch xiên song song vai bảng tên, mờ dần
 * ra ngoài (mẫu BigDataView 106); `wedge` = một cánh hình bình hành có vạch sáng dưới chân (mẫu 061). Vạch nằm trong `--shelf-y` nên thấp ở màn nhỏ.
 */
export const PAGE_NAV_SHELF_ORNAMENT_CLASSES = {
  root: 'pointer-events-none absolute bottom-[3px] flex items-end gap-1',
  left: 'right-[9px] flex-row-reverse',
  right: 'left-[9px]',
  hatch: {
    left: [
      'h-[calc(var(--shelf-y)-0.375rem)] w-[3px] skew-x-[17deg] bg-[var(--plate-tone)]',
      'h-[calc(var(--shelf-y)-0.375rem)] w-[3px] skew-x-[17deg] bg-[color-mix(in_srgb,var(--plate-tone)_85%,transparent)]',
      'h-[calc(var(--shelf-y)-0.375rem)] w-[3px] skew-x-[17deg] bg-[color-mix(in_srgb,var(--plate-tone)_70%,transparent)]',
      'h-[calc(var(--shelf-y)-0.375rem)] w-[3px] skew-x-[17deg] bg-[color-mix(in_srgb,var(--plate-tone)_55%,transparent)]',
      'h-[calc(var(--shelf-y)-0.375rem)] w-[3px] skew-x-[17deg] bg-[color-mix(in_srgb,var(--plate-tone)_40%,transparent)]',
      'h-[calc(var(--shelf-y)-0.375rem)] w-[3px] skew-x-[17deg] bg-[color-mix(in_srgb,var(--plate-tone)_28%,transparent)]',
      'h-[calc(var(--shelf-y)-0.375rem)] w-[3px] skew-x-[17deg] bg-[color-mix(in_srgb,var(--plate-tone)_16%,transparent)]',
    ],
    right: [
      'h-[calc(var(--shelf-y)-0.375rem)] w-[3px] -skew-x-[17deg] bg-[var(--plate-tone)]',
      'h-[calc(var(--shelf-y)-0.375rem)] w-[3px] -skew-x-[17deg] bg-[color-mix(in_srgb,var(--plate-tone)_85%,transparent)]',
      'h-[calc(var(--shelf-y)-0.375rem)] w-[3px] -skew-x-[17deg] bg-[color-mix(in_srgb,var(--plate-tone)_70%,transparent)]',
      'h-[calc(var(--shelf-y)-0.375rem)] w-[3px] -skew-x-[17deg] bg-[color-mix(in_srgb,var(--plate-tone)_55%,transparent)]',
      'h-[calc(var(--shelf-y)-0.375rem)] w-[3px] -skew-x-[17deg] bg-[color-mix(in_srgb,var(--plate-tone)_40%,transparent)]',
      'h-[calc(var(--shelf-y)-0.375rem)] w-[3px] -skew-x-[17deg] bg-[color-mix(in_srgb,var(--plate-tone)_28%,transparent)]',
      'h-[calc(var(--shelf-y)-0.375rem)] w-[3px] -skew-x-[17deg] bg-[color-mix(in_srgb,var(--plate-tone)_16%,transparent)]',
    ],
  },
  wedge: {
    left: [
      'h-[calc(var(--shelf-y)-0.5rem)] w-8 [clip-path:polygon(0_0,calc(100%_-_8px)_0,100%_100%,8px_100%)] bg-[linear-gradient(to_top,var(--plate-tone)_0,var(--plate-tone)_1px,color-mix(in_srgb,var(--plate-tone)_30%,transparent)_1px)]',
    ],
    right: [
      'h-[calc(var(--shelf-y)-0.5rem)] w-8 [clip-path:polygon(8px_0,100%_0,calc(100%_-_8px)_100%,0_100%)] bg-[linear-gradient(to_top,var(--plate-tone)_0,var(--plate-tone)_1px,color-mix(in_srgb,var(--plate-tone)_30%,transparent)_1px)]',
    ],
  },
} as const;
