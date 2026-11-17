/**
 * text-ellipsis.theme — cắt chữ một dòng bằng "…" mà KHÔNG gọt dấu tiếng Việt.
 *
 * Dùng:   cn(TEXT_ELLIPSIS_CLASSES, …) thay cho `truncate`; `truncate` đặt `overflow: hidden` cắt luôn dấu mũ / dấu
 *         thanh (Ố, Ế, Ắ) nằm ngoài hộp dòng. Đứng trong flex thì giữ `min-w-0` (đã gồm) để chữ co được.
 */

export const TEXT_ELLIPSIS_CLASSES =
  'min-w-0 overflow-x-clip overflow-y-visible text-ellipsis whitespace-nowrap';
