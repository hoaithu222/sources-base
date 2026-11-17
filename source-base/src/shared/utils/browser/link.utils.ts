import type { MouseEvent } from 'react';

/**
 * link.utils — helper cho control ĐI TỚI TRANG: giữ SPA cho click thường, nhường trình duyệt mọi tổ hợp còn lại.
 *
 * Dùng:   onClick={(e) => { if (isModifiedClick(e)) return; e.preventDefault(); navigate(to); }}
 * Lưu ý:  ⛔ control bấm được phải là `<Link>` / `<a>` có `href` THẬT, không `<button>` + `navigate()` (mất chuột
 *         phải, Ctrl/⌘+click, chuột giữa, URL khi hover) — docs/rules/interaction/navigable-controls.md.
 */

/**
 * `true` khi click NÀY là "mở ở nơi khác": ⌘/Ctrl · Shift (cửa sổ mới) · Alt (tải xuống) · chuột giữa/phụ.
 * Handler PHẢI `return` sớm khi `true` — đừng `preventDefault()`, đừng `navigate()`.
 */
export function isModifiedClick(e: MouseEvent<Element>): boolean {
  return e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0;
}

/** Spread vào link LUÔN mở tab mới (`<a href={url} {...NEW_TAB_LINK_PROPS}>`); `noopener` chặn tabnabbing. */
export const NEW_TAB_LINK_PROPS = {
  target: '_blank',
  rel: 'noopener noreferrer',
} as const;

/**
 * Mở URL ở tab mới BẰNG CODE — CHỈ khi không có phần tử để bấm (context menu tự vẽ, phím tắt).
 * Control bấm được phải là `<Link>` có `href` thật: `window.open` không cho chuột phải,
 * không hiện URL khi hover và hay bị chặn popup.
 */
export function openInNewTab(href: string): void {
  window.open(href, '_blank', 'noopener,noreferrer');
}
