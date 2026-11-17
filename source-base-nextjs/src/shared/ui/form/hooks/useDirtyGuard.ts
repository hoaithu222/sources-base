'use client';

import { useCallback, useEffect, useState } from 'react';
// eslint-disable-next-line no-restricted-imports -- đích đã có tiền tố ngôn ngữ: phải dùng router trần, router của @/core/i18n sẽ thêm tiền tố lần nữa
import { useRouter } from 'next/navigation';
import type { FieldValues, UseFormReturn } from 'react-hook-form';

interface UseDirtyGuardOptions<T extends FieldValues> {
  form: UseFormReturn<T>;
  enabled?: boolean;
}

const isModifiedClick = (event: MouseEvent): boolean =>
  event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey;

/** Đích của một click vào `<a>` nội bộ khác trang hiện tại; `null` khi click không phải điều hướng nội bộ. */
function internalTargetOf(event: MouseEvent): string | null {
  if (event.defaultPrevented || isModifiedClick(event)) return null;

  const anchor = (event.target as Element | null)?.closest?.('a[href]');
  if (!(anchor instanceof HTMLAnchorElement)) return null;
  if (anchor.target === '_blank' || anchor.hasAttribute('download')) return null;

  const url = new URL(anchor.href, window.location.href);
  if (url.origin !== window.location.origin) return null;
  if (url.pathname === window.location.pathname) return null;
  return url.pathname + url.search + url.hash;
}

/**
 * useDirtyGuard — chặn chuyển trang khi form còn thay đổi chưa lưu; trả trạng thái để hiện hộp xác nhận.
 *
 * `<Form dirtyGuard>` đã gọi sẵn kèm `ConfirmDialog` — chỉ gọi trực tiếp khi tự dựng hộp xác nhận riêng.
 * Chặn: click vào `<Link>` / `<a>` nội bộ đổi `pathname` (đổi query / hash không chặn) + đóng tab / tải lại
 * (hộp thoại của trình duyệt).
 * Lưu ý: App Router KHÔNG có `useBlocker`. Nút Back của trình duyệt và `router.push()` gọi tay không bị chặn —
 * muốn chặn chúng thì kiểm `isDirty` trước khi gọi. `proceed()` điều hướng bằng URL ĐÃ CÓ tiền tố ngôn ngữ nên
 * dùng router của `next/navigation`, không phải của `@/core/i18n`.
 *
 * @param options.form - Kết quả `useZodForm()` / `useForm()`; đọc `formState.isDirty`.
 * @param options.enabled - `false` → tắt chặn. Mặc định `true`.
 * @returns `{ isBlocked, proceed, cancel }` — `isBlocked` đang có lượt chuyển trang bị giữ; `proceed()` cho
 *   đi tiếp; `cancel()` ở lại.
 *
 * @example
 * const { isBlocked, proceed, cancel } = useDirtyGuard({ form });
 * <ConfirmDialog open={isBlocked} title="Bỏ thay đổi?" onCancel={cancel} onConfirm={proceed} />
 */
export function useDirtyGuard<T extends FieldValues>({
  form,
  enabled = true,
}: UseDirtyGuardOptions<T>) {
  const router = useRouter();
  const [pendingHref, setPendingHref] = useState<string | null>(null);
  const active = enabled && form.formState.isDirty;

  useEffect(() => {
    if (!active) return;

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
    };
    const handleClick = (event: MouseEvent) => {
      const target = internalTargetOf(event);
      if (target === null) return;
      event.preventDefault();
      event.stopPropagation();
      setPendingHref(target);
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('click', handleClick, true);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('click', handleClick, true);
    };
  }, [active]);

  const proceed = useCallback(() => {
    const href = pendingHref;
    setPendingHref(null);
    if (href) router.push(href);
  }, [pendingHref, router]);

  const cancel = useCallback(() => setPendingHref(null), []);

  return { isBlocked: pendingHref !== null, proceed, cancel };
}
