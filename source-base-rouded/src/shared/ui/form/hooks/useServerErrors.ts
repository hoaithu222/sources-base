import type { UseFormReturn, FieldValues, Path } from 'react-hook-form';

interface ServerErrorPayload {
  [field: string]: string | string[] | undefined;
}

const ROOT_FIELDS = ['__all__', 'non_field_errors', 'detail'];

function extractPayload(error: unknown): ServerErrorPayload {
  if (!error || typeof error !== 'object') return {};
  const source = error as {
    fieldErrors?: ServerErrorPayload;
    response?: { data?: ServerErrorPayload };
  };
  return source.fieldErrors ?? source.response?.data ?? {};
}

/**
 * useServerErrors — gắn lỗi validation do máy chủ trả về vào đúng ô của form; lỗi không thuộc ô nào thành
 * `rootError` (hiện bằng `<Form.Error>`).
 *
 * Gọi `applyServerErrors(err)` trong `catch` của hàm gửi. Đọc `err.fieldErrors` (`AppError`) hoặc
 * `err.response.data` (axios thô), dạng `{ tênField: 'câu lỗi' | ['câu lỗi', …] }` — lấy câu đầu tiên.
 * Khoá `__all__` / `non_field_errors` / `detail`, hoặc lỗi không có danh sách field, đi vào `rootError`.
 *
 * @param form - Kết quả `useZodForm()` / `useForm()`.
 * @returns `{ applyServerErrors, rootError }`.
 *
 * @example
 * const { applyServerErrors, rootError } = useServerErrors(form);
 * const save = async (values: Values) => {
 *   try { await api.save(values); } catch (err) { applyServerErrors(err); }
 * };
 */
export function useServerErrors<T extends FieldValues>(form: UseFormReturn<T>) {
  const applyServerErrors = (error: unknown) => {
    const payload = extractPayload(error);
    let hasRoot = false;

    for (const [field, raw] of Object.entries(payload)) {
      const message = Array.isArray(raw) ? raw[0] : raw;
      if (!message) continue;

      if (ROOT_FIELDS.includes(field)) {
        form.setError('root', { type: 'server', message });
        hasRoot = true;
      } else {
        form.setError(field as Path<T>, { type: 'server', message });
      }
    }

    if (!hasRoot && Object.keys(payload).length === 0) {
      const err = error as { message?: string };
      form.setError('root', { type: 'server', message: err?.message ?? 'Có lỗi xảy ra' });
    }
  };

  const rootError = form.formState.errors.root?.message;

  return { applyServerErrors, rootError };
}
