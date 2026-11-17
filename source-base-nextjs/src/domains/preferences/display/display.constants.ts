import type { DisplayState, TvUiScale } from './display.types';

/** Các mức phóng chữ cho phép ở chế độ TV — nguồn cho UI chọn mức. */
export const UI_SCALE_VALUES = [1.1, 1.2, 1.3] as const satisfies readonly TvUiScale[];

/** Mức mặc định khi BẬT chế độ TV lần đầu: mức thấp nhất, cố ý — user tự nâng lên khi cần. */
const DEFAULT_TV_UI_SCALE: TvUiScale = 1.1;

export const DISPLAY_INITIAL_STATE: DisplayState = {
  mode: 'standard',
  uiScale: DEFAULT_TV_UI_SCALE,
};

/** Khoá + bản dữ liệu ở localStorage (zustand `persist`) — đổi hình dạng state thì tăng `version`. */
export const DISPLAY_STORAGE = { key: 'next-base:display', version: 2 } as const;

/** Tên query param trên URL: `?display=tv&scale=1.2`. */
export const DISPLAY_PARAM = 'display';
export const SCALE_PARAM = 'scale';
