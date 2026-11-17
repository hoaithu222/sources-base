/** Màu bút, đỏ đứng đầu (ca dùng chính là khoanh vi phạm); trùng preset của ColorPickerField. */
export const ANNOTATION_COLORS = [
  '#F43F5E',
  '#F59E0B',
  '#22C55E',
  '#3B82F6',
  '#8B5CF6',
  '#FFFFFF',
] as const;

/** Tên đọc được của từng màu bút — nhãn trợ năng của ô chọn màu. */
export const ANNOTATION_COLOR_NAMES = {
  '#F43F5E': 'đỏ',
  '#F59E0B': 'cam',
  '#22C55E': 'xanh lá',
  '#3B82F6': 'xanh dương',
  '#8B5CF6': 'tím',
  '#FFFFFF': 'trắng',
} satisfies Record<(typeof ANNOTATION_COLORS)[number], string>;

export const DEFAULT_COLOR = ANNOTATION_COLORS[0];

/** Hệ số nhân quanh cỡ mặc định: 3 nấc mảnh / vừa / dày, cho cả nét vẽ lẫn cỡ chữ. */
export const SIZE_STEPS = [0.6, 1, 1.6] as const;
export const DEFAULT_SIZE_STEP = 1;

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

export const baseLineWidth = (naturalWidth: number) => clamp(naturalWidth / 300, 3, 24);

export const baseFontSize = (naturalWidth: number) => clamp(naturalWidth / 28, 16, 96);

export const FONT_FAMILY = 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';

export const LINE_HEIGHT_RATIO = 1.25;
