import {
  DISPLAY_INITIAL_STATE,
  DISPLAY_PARAM,
  SCALE_PARAM,
  UI_SCALE_VALUES,
} from './display.constants';
import type { DisplayMode, DisplayState, TvUiScale } from './display.types';

/**
 * Chuyển đổi chế độ hiển thị ↔ dữ liệu ngoài (URL, localStorage) — mọi giá trị đọc vào đều được kiểm.
 *
 *   readDisplayOverrides(location.search)         // URL → phần state hợp lệ
 *   nextDisplaySearch(location.search, display)   // state → query string URL phải mang (null = đã đúng)
 *
 * Lưu ý: giá trị không nhận diện được → `null` / bị bỏ, để KHÔNG ghi đè lựa chọn đã lưu bằng param rác.
 */

const parseDisplayMode = (raw: unknown): DisplayMode | null =>
  raw === 'tv' || raw === 'standard' ? raw : null;

const asTvUiScale = (value: unknown): TvUiScale | null =>
  UI_SCALE_VALUES.find((scale) => scale === value) ?? null;

/** `"1.2"` → `1.2`. Giá trị ngoài `UI_SCALE_VALUES` → `null`. */
export function parseUiScale(raw: string | null | undefined): TvUiScale | null {
  return raw ? asTvUiScale(Number(raw)) : null;
}

/**
 * Dựng `DisplayState` hợp lệ từ dữ liệu đọc ở localStorage (không tin được): field sai kiểu / ngoài dải
 * về mặc định từng field một, field lạ bị bỏ. Không bao giờ ném lỗi.
 */
export function sanitizeDisplayState(raw: unknown): DisplayState {
  const { mode, uiScale } = (typeof raw === 'object' && raw !== null ? raw : {}) as Partial<
    Record<keyof DisplayState, unknown>
  >;
  return {
    mode: parseDisplayMode(mode) ?? DISPLAY_INITIAL_STATE.mode,
    uiScale: asTvUiScale(uiScale) ?? DISPLAY_INITIAL_STATE.uiScale,
  };
}

/** `?display=` / `?scale=` hợp lệ trong query string; param thiếu hoặc rác thì không có trong kết quả. */
export function readDisplayOverrides(search: string): Partial<DisplayState> {
  const params = new URLSearchParams(search);
  const mode = parseDisplayMode(params.get(DISPLAY_PARAM));
  const uiScale = parseUiScale(params.get(SCALE_PARAM));
  return { ...(mode && { mode }), ...(uiScale && { uiScale }) };
}

/**
 * Query string URL phải mang cho `display` (`null` khi URL đã đúng): TV → `display=tv&scale=<mức>`,
 * `scale` luôn đi kèm; standard → gỡ cả hai param. Param khác giữ nguyên.
 */
export function nextDisplaySearch(search: string, { mode, uiScale }: DisplayState): string | null {
  const params = new URLSearchParams(search);
  const before = params.toString();

  if (mode === 'tv') {
    params.set(DISPLAY_PARAM, 'tv');
    params.set(SCALE_PARAM, String(uiScale));
  } else {
    params.delete(DISPLAY_PARAM);
    params.delete(SCALE_PARAM);
  }

  const after = params.toString();
  return after === before ? null : after;
}
