/**
 * app-tile.types.ts — trục biến thể của `AppTile`.
 */

/** Tông nhận diện của một phân hệ / ứng dụng — mỗi tông là một họ màu trong `colors-theme.json`. */
export type AppTileTone =
  | 'primary'
  | 'blue'
  | 'indigo'
  | 'purple'
  | 'pink'
  | 'orange'
  | 'yellow'
  | 'green'
  | 'teal'
  | 'sky'
  | 'red'
  | 'neutral';

/** `xs` 24 · `sm` 32 · `md` 40 · `lg` 44 (Dock) · `xl` 56px (lưới launcher). */
export type AppTileSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
