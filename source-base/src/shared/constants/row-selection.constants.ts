/**
 * Hằng cho luật "bấm ra ngoài dòng đang chọn thì bỏ chọn" của MỌI bảng cây có con trỏ dòng
 * (Hạng mục và công việc, Nghiệm thu…).
 *
 * Dùng:   gắn `KEEP_ROW_SELECTION_ATTR` lên khối thao tác TRÊN dòng đang chọn; hook
 *         `useClearRowSelectionOnOutsideClick` đọc hai selector bên dưới.
 * Lưu ý:  ⛔ module mới import bộ selector này, KHÔNG khai lại — thiếu một nhóm (portal Radix,
 *         `[role="dialog"]`) là bỏ chọn ngay lúc bấm vào dropdown đang mở, và lỗi đó im lặng.
 *         Lý do thiết kế: docs/notes/code/constants.md.
 */

/**
 * Attribute đánh dấu vùng KHÔNG coi là "bấm ra ngoài": toolbar soạn cây, thanh thao tác hàng
 * loạt, panel chi tiết của chính dòng đó.
 */
export const KEEP_ROW_SELECTION_ATTR = 'data-keep-row-selection';

const DATA_ROW_SELECTORS = ['tbody tr', 'thead'];

const PORTAL_SELECTORS = [
  '[data-radix-popper-content-wrapper]',
  '[role="dialog"]',
  '[role="alertdialog"]',
  '[role="menu"]',
  '[role="listbox"]',
];

const CONTROL_SELECTORS = [
  'button',
  'input',
  'textarea',
  'select',
  '[role="combobox"]',
  '[role="checkbox"]',
  '[contenteditable="true"]',
];

/**
 * Bấm trúng thứ khớp selector này thì GIỮ dòng đang chọn: dòng dữ liệu, vùng tự đánh dấu, portal
 * Radix, control tương tác.
 */
export const KEEP_ROW_SELECTION_SELECTOR = [
  ...DATA_ROW_SELECTORS,
  `[${KEEP_ROW_SELECTION_ATTR}]`,
  ...PORTAL_SELECTORS,
  ...CONTROL_SELECTORS,
].join(', ');

/** Đang mở modal → treo luật bỏ chọn (bấm lớp phủ để đóng không phải là "bỏ chọn"). */
export const OPEN_DIALOG_SELECTOR = '[role="dialog"], [role="alertdialog"]';
