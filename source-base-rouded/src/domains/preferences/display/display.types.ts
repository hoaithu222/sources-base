/**
 * Chế độ hiển thị của toàn app: `standard` (desktop/laptop, mặc định) hoặc `tv` (màn lớn nhìn từ
 * xa — chữ phóng theo `--ui-scale`, khung giữ nguyên). Header và Dock hiện ở cả hai chế độ.
 */
export type DisplayMode = 'standard' | 'tv';

/**
 * Mức phóng CỠ CHỮ người dùng chọn cho chế độ TV (lưu ở store, mang trên URL `?scale=`). Trần 1.3 vì
 * khung không giãn — chữ to hơn sẽ tràn nút/chip/ô bảng (docs/rules/display/tv-display-mode.md).
 */
export type TvUiScale = 1.1 | 1.2 | 1.3;

/** Hệ số chữ ĐANG ÁP thật (`selectEffectiveUiScale`): `1` ở standard, mức TV khi đang ở TV. */
export type EffectiveUiScale = 1 | TvUiScale;

export interface DisplayState {
  mode: DisplayMode;
  /** Mức TV đã chọn — vẫn được nhớ khi ở standard, nên đừng đọc thẳng để nhân cỡ chữ. */
  uiScale: TvUiScale;
}

interface DisplayActions {
  setMode: (mode: DisplayMode) => void;
  setUiScale: (uiScale: TvUiScale) => void;
  /** Ghi một lần các giá trị đọc từ URL (`readDisplayOverrides`); rỗng thì không làm gì. */
  applyDisplayOverrides: (overrides: Partial<DisplayState>) => void;
}

export type DisplayStoreType = DisplayState & DisplayActions;
