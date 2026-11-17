import type { ReactNode } from 'react';

/** `tile` — ô ảnh thu nhỏ + nhãn dưới (Giao diện Sáng / Tối) · `swatch` — chấm màu tròn (Màu nhấn). */
export type ChoiceTilesVariant = 'tile' | 'swatch';

export interface ChoiceTileOption<V extends string = string> {
  value: V;
  /** Nhãn dưới ô (`tile`) · tên đọc / tooltip của chấm (`swatch`). */
  label: string;
  /** Ảnh thu nhỏ trong khung ô `tile` (vẽ bằng token, phủ kín khung). */
  preview?: ReactNode;
  /** Class nền của chấm `swatch` (LITERAL: `bg-blue-6`, `bg-linear-to-br from-… to-…`). */
  fill?: string;
  disabled?: boolean;
}
