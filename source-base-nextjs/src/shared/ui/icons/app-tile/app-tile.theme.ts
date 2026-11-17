import { cn } from '@/shared/utils/style/cn';

import type { VciIconWeight } from '@/shared/ui/icons/vci-icon';

import type { AppTileSize, AppTileTone } from './app-tile.types';

/**
 * app-tile.theme.ts — bảng class của `AppTile`: khung squircle · cỡ · tông.
 *
 * Dùng:   cn(APP_TILE_BASE_CLASSES, APP_TILE_SIZE_CLASSES[size], APP_TILE_TONE_CLASSES[tone])
 * Sửa:    thêm tông → thêm khoá vào `AppTileTone` + một dòng ở `APP_TILE_TONE_CLASSES` (họ màu phải có đủ bậc dùng tới)
 * Lưu ý:  ⛔ Class là chuỗi LITERAL. Dốc màu từ bậc sáng xuống bậc đậm + lớp kính `app-tile-gloss` (`app-tile.css`: gờ sáng,
 *         bóng nhuốm tông — icon app kiểu macOS), CÙNG một diện mạo ở cả hai theme (ô luôn rực màu, glyph luôn trắng).
 *         `primary` = dốc 3 bậc xanh lá → ngọc → lam như vòng cung logo VCI. Chấm nhấn icon VCI trên ô = vàng kim (ghi
 *         đè `--color-icon-accent` — đỏ logo chìm trên nền xanh). Bóng kính `::before` dốc NHIỀU NẤC tan dần (không có
 *         mép — phóng 1,5× ở Dock không lộ vạch ngang), glyph nằm TRÊN lớp bóng (`isolate` giữ z-index trong ô).
 */

export const APP_TILE_BASE_CLASSES = cn(
  'relative isolate inline-flex shrink-0 items-center justify-center overflow-hidden text-neutral-0',
  '[--color-icon-accent:var(--color-yellow-4)] rim-tile squircle app-tile-gloss',
  'bg-linear-to-b',
  "before:pointer-events-none before:absolute before:inset-0 before:rounded-[inherit] before:content-['']",
  '[&>svg]:relative [&>svg]:z-1',
);

/** Cạnh ô · bán kính (lồng nhau: icon app ~27% cạnh) · cỡ glyph. */
export const APP_TILE_SIZE_CLASSES = {
  xs: 'size-6 rounded-sm [&>svg]:size-3.5!',
  sm: 'size-8 rounded-md [&>svg]:size-4!',
  md: 'size-10 rounded-lg [&>svg]:size-5!',
  lg: 'size-11 rounded-lg [&>svg]:size-5.5!',
  xl: 'size-14 rounded-xl [&>svg]:size-7!',
} satisfies Record<AppTileSize, string>;

export const APP_TILE_GLYPH_PX = { xs: 14, sm: 16, md: 20, lg: 22, xl: 28 } satisfies Record<
  AppTileSize,
  number
>;

/** Glyph VCI ≤ 16px trên nền màu dày nét lên 2.25 để không mảnh / nhoè. */
export const APP_TILE_GLYPH_WEIGHT = {
  xs: 'bold',
  sm: 'bold',
  md: 'regular',
  lg: 'regular',
  xl: 'regular',
} satisfies Record<AppTileSize, VciIconWeight>;

/** Dốc màu (bậc sáng → bậc đậm) + `--app-tile-tone` cho bóng nhuốm tông của lớp kính. */
export const APP_TILE_TONE_CLASSES = {
  primary: 'from-primary-5 via-primary-6 to-primary-8 [--app-tile-tone:var(--color-primary-6)]',
  blue: 'from-blue-4 to-blue-6 [--app-tile-tone:var(--color-blue-6)]',
  indigo: 'from-indigo-4 to-indigo-6 [--app-tile-tone:var(--color-indigo-6)]',
  purple: 'from-purple-4 to-purple-6 [--app-tile-tone:var(--color-purple-6)]',
  pink: 'from-pink-4 to-pink-6 [--app-tile-tone:var(--color-pink-6)]',
  orange: 'from-orange-4 to-orange-6 [--app-tile-tone:var(--color-orange-6)]',
  yellow: 'from-yellow-6 to-yellow-7 [--app-tile-tone:var(--color-yellow-7)]',
  green: 'from-green-5 to-green-7 [--app-tile-tone:var(--color-green-7)]',
  teal: 'from-teal-5 to-teal-7 [--app-tile-tone:var(--color-teal-7)]',
  sky: 'from-sky-5 to-sky-7 [--app-tile-tone:var(--color-sky-7)]',
  red: 'from-red-4 to-red-6 [--app-tile-tone:var(--color-red-6)]',
  neutral: 'from-neutral-5 to-neutral-7 [--app-tile-tone:var(--color-neutral-7)]',
} satisfies Record<AppTileTone, string>;
