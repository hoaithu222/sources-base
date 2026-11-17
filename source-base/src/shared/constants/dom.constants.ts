/**
 * Selector "đang có hộp thoại MỞ" — nguồn DUY NHẤT; dùng với `document.querySelector(OPEN_DIALOG_SELECTOR)`.
 * Radix Dialog / AlertDialog (và Popover — cũng mang `role="dialog"`) gắn `data-state="open"` khi mở.
 */
export const OPEN_DIALOG_SELECTOR =
  '[role="dialog"][data-state="open"], [role="alertdialog"][data-state="open"]';
