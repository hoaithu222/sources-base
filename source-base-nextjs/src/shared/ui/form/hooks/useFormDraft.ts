'use client';

import { useCallback, useEffect, useReducer, useRef } from 'react';
import type { FieldValues, UseFormReturn } from 'react-hook-form';

import { debounce } from '@/shared/utils/browser/debounce.utils';
import { safeStorage } from '@/shared/utils/browser/storage.utils';
import type { DebouncedFunction } from '@/shared/utils/browser/debounce.utils';

const STORAGE_PREFIX = 'form-draft:';
const DEFAULT_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

type DraftData = Record<string, unknown>;

export interface UseFormDraftOptions<T extends FieldValues> {
  key: string;
  form: UseFormReturn<T>;
  debounceMs?: number;
  enabled?: boolean;
  fields?: readonly (keyof T & string)[];
  version?: number;
  maxAgeMs?: number;
  validate?: (data: DraftData) => boolean;
}

interface DraftEnvelope {
  v: number;
  t: number;
  data: DraftData;
}

interface DraftRules {
  version: number;
  maxAgeMs: number;
  validate?: (data: DraftData) => boolean;
}

const isPlainObject = (value: unknown): value is DraftData =>
  value !== null && typeof value === 'object' && !Array.isArray(value);

function parseJson(raw: string): unknown {
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/** Nội dung nháp nếu còn dùng được; `null` khi hỏng / sai version / quá hạn / không qua kiểm. */
function parseDraft(raw: string | null, rules: DraftRules): DraftData | null {
  if (raw === null) return null;
  const envelope = parseJson(raw);

  const usable =
    isPlainObject(envelope) &&
    envelope.v === rules.version &&
    typeof envelope.t === 'number' &&
    Date.now() - envelope.t <= rules.maxAgeMs &&
    isPlainObject(envelope.data) &&
    (rules.validate?.(envelope.data) ?? true);

  return usable ? (envelope as unknown as DraftEnvelope).data : null;
}

/** Đọc nháp của `storageKey`; dữ liệu có mà không dùng được thì xoá khỏi storage. */
function loadDraftOrDiscard(storageKey: string, rules: DraftRules): DraftData | null {
  const raw = safeStorage.getItem(storageKey);
  const draft = parseDraft(raw, rules);
  if (!draft && raw !== null) safeStorage.removeItem(storageKey);
  return draft;
}

function pickFields(values: DraftData, fields: readonly string[] | undefined): DraftData {
  if (!fields) return values;
  return Object.fromEntries(fields.filter((f) => f in values).map((f) => [f, values[f]]));
}

/**
 * useFormDraft — tự lưu giá trị form vào localStorage khi người dùng sửa (debounce) và đổ lại vào form khi
 * mở lại; nháp được khôi phục tính là "đã sửa, chưa lưu" (`isDirty`).
 *
 * `<Form autoSave={{ key }}>` đã gọi sẵn hook này và tự xoá nháp khi `onSubmit` xong — chỉ gọi trực tiếp khi
 * cần `hasDraft` / `clear()` (vd nút "Bỏ nháp").
 * Lưu ý: `key` phải riêng cho từng người dùng + bản ghi (localStorage dùng chung cho mọi tài khoản trên máy);
 * form có mật khẩu / OTP / số thẻ phải khai `fields`. Nháp đọc về chỉ được kiểm phong bì (version, hạn, là
 * object thuần) và lọc theo `fields`; KIỂU từng giá trị chỉ được kiểm khi truyền `validate` — form có ràng
 * buộc chặt nên truyền `(d) => schema.partial().safeParse(d).success`. Lý do thiết kế:
 * docs/notes/components/form.md.
 *
 * @param options.key - Khoá nháp, vd `` `project-edit:${userId}:${projectId}` ``; chuỗi rỗng = tắt.
 * @param options.form - Kết quả `useZodForm()` / `useForm()`.
 * @param options.debounceMs - Ngừng sửa bao lâu (ms) thì lưu. Mặc định `3000`.
 * @param options.enabled - `false` → không lưu, không khôi phục. Mặc định `true`.
 * @param options.fields - Chỉ lưu và chỉ khôi phục những field này; bỏ trống = tất cả.
 * @param options.version - Tăng khi đổi hình dạng form — nháp ghi bằng version khác bị bỏ. Mặc định `1`.
 * @param options.maxAgeMs - Nháp cũ hơn ngần này (ms) bị bỏ. Mặc định 7 ngày.
 * @param options.validate - Kiểm nội dung nháp trước khi đổ vào form; trả `false` → nháp bị bỏ và xoá.
 * @returns `{ clear, hasDraft }` — `clear()` xoá nháp (kể cả lượt lưu đang chờ); `hasDraft` cho biết đang có
 *   nháp dùng được.
 *
 * @example
 * const { clear, hasDraft } = useFormDraft({ key: `project-edit:${userId}:${projectId}`, form, fields: ['name'] });
 */
export function useFormDraft<T extends FieldValues>({
  key,
  form,
  debounceMs = 3000,
  enabled = true,
  fields,
  version = 1,
  maxAgeMs = DEFAULT_MAX_AGE_MS,
  validate,
}: UseFormDraftOptions<T>) {
  const active = enabled && key !== '';
  const storageKey = `${STORAGE_PREFIX}${key}`;

  const optionsRef = useRef({ fields, validate, version, maxAgeMs });
  useEffect(() => {
    optionsRef.current = { fields, validate, version, maxAgeMs };
  });

  const pendingSaveRef = useRef<DebouncedFunction<[DraftData]> | null>(null);
  const [, rerender] = useReducer((n: number) => n + 1, 0);

  useEffect(() => {
    if (!active) return;
    const draft = loadDraftOrDiscard(storageKey, optionsRef.current);
    if (!draft) return;
    const allowed = pickFields(draft, optionsRef.current.fields);
    form.reset({ ...form.getValues(), ...allowed } as T, { keepDefaultValues: true });
  }, [active, form, storageKey]);

  useEffect(() => {
    if (!active) return;

    const save = debounce((values: DraftData) => {
      const { fields: only, version: v } = optionsRef.current;
      const envelope: DraftEnvelope = { v, t: Date.now(), data: pickFields(values, only) };
      if (safeStorage.setItem(storageKey, JSON.stringify(envelope))) rerender();
    }, debounceMs);
    pendingSaveRef.current = save;

    const unsubscribe = form.subscribe({
      formState: { values: true, isDirty: true },
      callback: ({ values, isDirty }) => {
        if (isDirty) save(values as DraftData);
      },
    });

    return () => {
      save.cancel();
      unsubscribe();
      if (pendingSaveRef.current === save) pendingSaveRef.current = null;
    };
  }, [active, debounceMs, form, storageKey]);

  /** Xoá nháp, kể cả lượt lưu đang chờ debounce. Gọi sau khi lưu thành công. */
  const clear = useCallback(() => {
    pendingSaveRef.current?.cancel();
    safeStorage.removeItem(storageKey);
    rerender();
  }, [storageKey]);

  const hasDraft =
    key !== '' &&
    parseDraft(safeStorage.getItem(storageKey), { version, maxAgeMs, validate }) !== null;

  return { clear, hasDraft };
}
