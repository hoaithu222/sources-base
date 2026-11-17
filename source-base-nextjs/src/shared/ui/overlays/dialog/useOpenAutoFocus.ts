'use client';

import { useCallback } from 'react';

const FOCUSABLE_SELECTOR = [
  'input:not([type="hidden"]):not([disabled]):not([aria-hidden="true"])',
  'textarea:not([disabled]):not([aria-hidden="true"])',
  'select:not([disabled]):not([aria-hidden="true"])',
  '[role="combobox"]:not([disabled]):not([aria-hidden="true"])',
  '[data-radix-collection-item]:not([disabled])',
  'button[aria-haspopup]:not([disabled]):not([aria-hidden="true"])',
].join(',');

const SKIP_ATTR = 'data-modal-autofocus-skip';

/**
 * Focus ô nhập đầu tiên trong `container`: `data-autofocus="true"` thắng, rồi tới ô đầu tiên đang hiện.
 * Bỏ qua `data-modal-autofocus-skip`, nút submit và mọi thứ trong `data-modal-footer` (tránh Enter submit nhầm).
 */
function focusFirstFormInput(container: HTMLElement | null): boolean {
  if (!container) return false;

  const explicit = container.querySelector<HTMLElement>('[data-autofocus="true"]:not([disabled])');
  if (explicit) {
    explicit.focus();
    return true;
  }

  const candidates = Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
  for (const el of candidates) {
    if (el.getAttribute(SKIP_ATTR) === 'true') continue;
    if (el.getAttribute('type') === 'submit') continue;
    if (el.closest('[data-modal-footer="true"]')) continue;
    if (el.offsetParent === null && getComputedStyle(el).position !== 'fixed') continue;
    el.focus();
    if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) {
      const len = el.value?.length ?? 0;
      try {
        el.setSelectionRange(len, len);
        // eslint-disable-next-line no-empty -- input type=number/date không hỗ trợ setSelectionRange
      } catch {}
    }
    return true;
  }
  return false;
}

/**
 * useOpenAutoFocus — handler `onOpenAutoFocus` cho Radix Dialog của Modal · FormModal · Drawer.
 *
 * Callback `onOpenAutoFocus` của caller thắng; không có thì `enabled` → focus ô nhập đầu tiên trong panel
 * (`preferForm`: tìm trong `<form>` trước). Tắt → để Radix tự focus như mặc định.
 *
 * @param contentRef - Ref tới `<Dialog.Content>`.
 * @param options.enabled - `true` → tự focus ô nhập đầu tiên khi mở.
 * @param options.onOpenAutoFocus - Handler riêng của caller; có thì gọi nó và bỏ qua phần còn lại.
 * @param options.preferForm - `true` → tìm ô nhập trong `<form>` của panel trước. Mặc định `false`.
 * @returns Handler gắn vào `onOpenAutoFocus` của `<Dialog.Content>`.
 *
 * @example
 * const handleOpenAutoFocus = useOpenAutoFocus(contentRef, { enabled: autoFocusFirst, onOpenAutoFocus });
 */
export function useOpenAutoFocus(
  contentRef: React.RefObject<HTMLElement | null>,
  {
    enabled,
    onOpenAutoFocus,
    preferForm = false,
  }: {
    enabled: boolean;
    onOpenAutoFocus?: (event: Event) => void;
    preferForm?: boolean;
  },
) {
  return useCallback(
    (event: Event) => {
      if (onOpenAutoFocus) {
        onOpenAutoFocus(event);
        return;
      }
      if (!enabled) return;
      event.preventDefault();
      requestAnimationFrame(() => {
        const container = contentRef.current;
        if (!container) return;
        const target = preferForm
          ? (container.querySelector<HTMLElement>('form') ?? container)
          : container;
        focusFirstFormInput(target);
      });
    },
    [contentRef, enabled, onOpenAutoFocus, preferForm],
  );
}
