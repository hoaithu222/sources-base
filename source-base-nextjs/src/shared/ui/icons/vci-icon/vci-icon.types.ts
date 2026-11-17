/**
 * vci-icon.types.ts — dữ liệu và trục biến thể của bộ icon VCI (`VciIcon`).
 */

/** Chấm nhấn tròn — chấm đỏ của logo VCI, đầu người ở icon nhân sự / khách hàng. */
export interface VciIconDot {
  cx: number;
  cy: number;
  r: number;
}

/** Nhóm: `brand` mốc thương hiệu · `module` phân hệ · `business` chứng từ / đối tượng nghiệp vụ · `action` thao tác. */
export type VciIconGroup = 'brand' | 'module' | 'business' | 'action';

/**
 * Một icon = 3 lớp trên lưới 24: mảng tô nhạt · nét thân · chấm nhấn (chuỗi = path `d`).
 * `labelKey` là khoá thông điệp `vciIcons.<tên>` trong namespace `ui.primitives` — chữ nhãn (đổi theo ngôn ngữ) nằm ở
 * `src/messages/<ngôn ngữ>/ui.primitives.json`, không ở dữ liệu sinh.
 */
export interface VciIconData {
  labelKey: string;
  group: VciIconGroup;
  duo: readonly string[];
  line: readonly string[];
  dot: readonly (string | VciIconDot)[];
}

/** `line` nét đơn sắc (mặc định, như icon chrome) · `duo` thêm mảng tô nhạt + chấm nhấn màu (icon nhận diện). */
export type VciIconVariant = 'line' | 'duo';

/** `regular` nét 1.75 (≥ 16px) · `bold` nét 2.25 (glyph nhỏ trên nền màu: ô `AppTile` xs / sm). */
export type VciIconWeight = 'regular' | 'bold';
