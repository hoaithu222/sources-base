/**
 * dropdown.utils — đổi giá trị Dropdown ↔ giá trị Radix Select chấp nhận.
 *
 * Lưu ý:  ⛔ Radix cấm item có value `''` nên dùng EMPTY_SENTINEL; caller vẫn nhận / truyền `''`.
 */

const EMPTY_SENTINEL = '__empty__';

export const toRadix = (value: string) => (value === '' ? EMPTY_SENTINEL : value);

export const fromRadix = (value: string) => (value === EMPTY_SENTINEL ? '' : value);
