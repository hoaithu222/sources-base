import type { DisplayState, EffectiveUiScale } from './display.types';

export const selectDisplayMode = (state: DisplayState) => state.mode;

/** `true` khi đang ở chế độ TV. */
export const selectIsTv = (state: DisplayState) => state.mode === 'tv';

/**
 * Hệ số scale ĐANG CÓ HIỆU LỰC — luôn `1` ở chế độ standard dù store còn nhớ mức TV cũ.
 * Mọi nơi nhân cỡ chữ (chart metrics…) PHẢI dùng selector này, KHÔNG đọc thẳng `state.uiScale`.
 */
export const selectEffectiveUiScale = (state: DisplayState): EffectiveUiScale =>
  state.mode === 'tv' ? state.uiScale : 1;
