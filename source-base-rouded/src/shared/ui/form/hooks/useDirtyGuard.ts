import { useBlocker } from 'react-router-dom';
import type { FieldValues, UseFormReturn } from 'react-hook-form';

interface UseDirtyGuardOptions<T extends FieldValues> {
  form: UseFormReturn<T>;
  enabled?: boolean;
}

/**
 * useDirtyGuard — chặn chuyển trang (React Router) khi form còn thay đổi chưa lưu; trả trạng thái để hiện
 * hộp xác nhận.
 *
 * `<Form dirtyGuard>` đã gọi sẵn kèm `ConfirmDialog` — chỉ gọi trực tiếp khi tự dựng hộp xác nhận riêng.
 * Chỉ chặn khi đổi `pathname` (đổi query / hash không chặn).
 * Lưu ý: dùng `useBlocker` nên chỉ chạy trong data router (`createBrowserRouter`); không chặn đóng tab /
 * tải lại trang.
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
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      enabled && form.formState.isDirty && currentLocation.pathname !== nextLocation.pathname,
  );

  return {
    isBlocked: blocker.state === 'blocked',
    proceed: () => blocker.proceed?.(),
    cancel: () => blocker.reset?.(),
  };
}
