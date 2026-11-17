# Form Validation Rules (BẮT BUỘC)

> Quy tắc này áp dụng cho **mọi Zod schema** trong `src/` định nghĩa field bắt buộc nhập text.
> Vi phạm → whitespace-only pass validation mà không hiển thị lỗi → **block merge**.
> Thông báo lỗi của schema là chữ hiển thị cho người dùng nên **cũng phải dịch được** — xem §6 (`rules/i18n/i18n.md`).

---

## 1. ⛔ LUÔN `.trim()` trước `.min(1)` cho text field bắt buộc

**Vấn đề:** `z.string().min(1, msg)` chấp nhận `"   "` (toàn khoảng trắng) vì `length > 0`.

**Giải pháp:** thêm `.trim()` trước `.min(1)` — Zod transform cắt trắng trước, rồi mới check độ dài.

```ts
// ❌ SAI — "   " vượt qua validation
code: z.string().min(1, messages.codeRequired),
name: z.string().min(1, messages.nameRequired).max(200),

// ✅ ĐÚNG — "   " bị trim → "" → fail min(1)
code: z.string().trim().min(1, messages.codeRequired),
name: z.string().trim().min(1, messages.nameRequired).max(200),
```

> `messages.*` là bộ câu ĐÃ DỊCH do factory nhận vào (§6) — không phải chuỗi tiếng Việt / Anh viết cứng trong schema.

> **Side-effect có ích:** giá trị submit sẽ được trim tự động — không cần `values.name.trim()` ở service layer.

---

## 2. KHÔNG trim — Danh sách trường hợp ngoại lệ

| Loại field | Lý do KHÔNG trim |
|-----------|-----------------|
| `password`, `confirmPassword` | Khoảng trắng là ký tự hợp lệ trong mật khẩu |
| `token`, `refreshToken` | Giá trị programmatic — trim có thể làm hỏng |
| `unitId`, `accountId`, dropdown ID | Select/programmatic value — không phải text tự nhập |
| Date picker fields (`startDate`, `endDate`, `date`) | Giá trị từ picker, không phải text input |
| Color picker values | Giá trị từ picker |
| `timezone`, `dateFormat`, `weekStart`... | Dropdown-selected, không tự nhập |

```ts
// ✅ OK — giữ nguyên không trim
password: z.string().min(PASSWORD_MIN_LENGTH, messages.passwordMin),
token: z.string().min(1, messages.tokenInvalid),
unitId: z.string().min(1, messages.unitRequired),
startDate: z.string().min(1, messages.dateRequired),
```

---

## 3. Pattern chuẩn cho từng loại field

> ✅ **Có sẵn helper — ưu tiên dùng thay vì gõ tay chuỗi `.trim().min(1)`:**
> `src/shared/utils/validation/validators.utils.ts` export
> `requiredText` · `optionalText` · `emailField` · `optionalEmailField` ·
> `phoneField` · `optionalPhoneField` · `ipv4Field` · `ipv4WithPortField` ·
> `urlField` · `passwordField` · `strongPasswordField` · `percentField` ·
> `positiveIntField` · `ensureRangeOrder` · `buildCodeSet`.
> `requiredText()` = `z.string().trim().min(1, …)`; `emailField()` dùng
> regex chặt hơn `.email()` mặc định của Zod. **Không truyền `msg` thì câu lỗi mặc định đã DỊCH theo ngôn ngữ đang hiển thị**
> (đọc lười lúc parse — §6). Các mẫu dưới đây là dạng khai tường minh — cùng ngữ nghĩa, dùng khi cần chuỗi bất thường.

### Text input bắt buộc
```ts
code: z.string().trim().min(1, messages.codeRequired).max(50, messages.codeMax),
name: requiredText(messages.nameRequired).max(200, messages.nameMax),
```

### Email input
```ts
email: emailField(), // câu mặc định theo ngôn ngữ (`validation.email` / `validation.emailMax`)
// hoặc tường minh: z.string().trim().min(1, messages.emailRequired).email(messages.emailInvalid)
```

### Text area bắt buộc
```ts
content: z.string().trim().min(1, messages.contentRequired),
summary: z.string().trim().min(1, messages.summaryRequired),
```

### Text input tùy chọn (optional — trim nhưng không min)
```ts
description: z.string().trim().max(500).optional().default(''),
phoneNumber: z.string().trim().optional().default(''),
```

### KHÔNG dùng `.refine` thủ công để check whitespace
```ts
// ❌ SAI — dài dòng, không nhất quán
name: z.string().min(1, msg).refine(v => v.trim().length > 0, msgWhitespaceOnly),

// ✅ ĐÚNG — ngắn gọn, đủ
name: z.string().trim().min(1, msg),
```

---

## 4. Check trùng mã (duplicate code) — dùng `handleConfirm` + `form.setError`

Khi cần validate trùng mã với danh sách đã có (server-side hoặc FE-side):

```tsx
// ── Trong component ──────────────────────────────────────────
const t = useTranslations('unit');

const existingCodes = useMemo(
  () =>
    new Set(
      allItems
        .filter((u) => u.id !== editingItem?.id) // loại trừ chính nó khi edit
        .map((u) => u.code.trim().toUpperCase())
    ),
  [allItems, editingItem?.id]
);

const handleConfirm = async (values?: FormValues) => {
  if (!values) return;
  if (existingCodes.has(values.code.trim().toUpperCase())) {
    form.setError('code', { message: t('validation.codeTaken') });
    throw new Error('duplicate_code'); // ngăn FormModal đóng — mã nội bộ, KHÔNG hiển thị nên không cần dịch
  }
  await onConfirm(values);
};
```

**Lý do throw:** trong `FormModal`, lệnh `onOpenChange?.(false)` chạy **sau**
`await onConfirm?.(data)`. Ném lỗi ở `onConfirm` là dòng đóng modal không bao
giờ tới → modal giữ nguyên, `setError` hiển thị lỗi dưới field.

---

## 5. Checklist trước khi submit schema mới

- [ ] Mọi required text field người dùng tự nhập đều có `.trim().min(1, ...)`
- [ ] Password / token / programmatic ID — KHÔNG trim
- [ ] Optional text field — dùng `.trim().optional().default('')` nếu muốn clean data
- [ ] KHÔNG dùng `.refine(v => v.trim().length > 0)` — thay bằng `.trim().min(1)`
- [ ] Check trùng mã → dùng `form.setError` + `throw` trong `handleConfirm`
- [ ] Thông báo lỗi lấy từ message key (helper dùng câu mặc định, hoặc factory + `useXxxSchemas`), KHÔNG chuỗi viết cứng (§6)
- [ ] Khoá mới có ở MỌI ngôn ngữ (`npm run typecheck` + `npm run check:i18n`)

---

## 6. Thông báo lỗi dịch được (đa ngôn ngữ)

Validator là hàm thuần chạy NGOÀI React (không gọi được `useTranslations`), nên câu lỗi đi qua **registry lười** — cùng cơ chế với lỗi HTTP
(`rules/i18n/i18n.md` §7). Ba trường hợp, chọn theo nguồn của câu:

| Câu lỗi thuộc | Làm | Ví dụ thật |
|---|---|---|
| **Chung** (bắt buộc, email, độ dài, SĐT, URL…) | Dùng helper ở `validators.utils.ts`, KHÔNG truyền `msg` — câu đọc LƯỜI lúc parse từ `validationMessages()` | `emailField()` → `validation.email`; `passwordField(8)` → `validation.passwordMin` điền `{min}` |
| **Riêng của một feature** | Factory thuần `createXxxSchemas(messages)` + hook `useXxxSchemas()` ghép `useTranslations('<feature>.validation')` + `useMemo` | `features/auth/schemas/auth.schema.ts` (`createAuthSchemas`) + `useAuthSchemas.ts` |
| **Mặc định của Zod** (`min(1)` không `msg`, kiểu sai…) | Không làm gì — `configureZodLocale` đã nối: `string.min(1)` → `validation.required`, `array.min(1)` → `validation.selectAtLeastOne`, còn lại theo `z.locales.<locale>()` | — |

```ts
// features/{feature}/schemas/{feature}.schema.ts — THUẦN: nhận câu đã dịch, test được không cần React
export interface ItemValidationMessages { nameRequired: string; codeRequired: string; /* … */ }

export function createItemSchemas(messages: ItemValidationMessages) {
  return {
    itemSchema: z.object({
      name: z.string().trim().min(1, messages.nameRequired),
      code: z.string().trim().min(1, messages.codeRequired).max(50),
    }),
  };
}

// features/{feature}/schemas/useItemSchemas.ts — 'use client'; tạo lại schema khi đổi ngôn ngữ
export function useItemSchemas() {
  const t = useTranslations('item.validation');
  return useMemo(() => createItemSchemas({ nameRequired: t('nameRequired'), codeRequired: t('codeRequired') }), [t]);
}
```

Quy tắc:

1. ⛔ **Schema dựng ở module-level KHÔNG chốt chuỗi lúc dựng.** Helper dùng `{ error: () => … }` (hàm, đọc lúc parse) nên schema module-level vẫn đổi theo ngôn ngữ.
   Tự viết helper mới: truyền hàm, đừng truyền chuỗi đã tra sẵn từ `validationMessages()` — chuỗi đó đóng băng ở ngôn ngữ lúc nạp module.
2. **Câu có tham số dùng `{tên}` và điền bằng `fillValidationMessage(template, { max })`** (`@/core/config`) — không đưa qua `t()` vì validator chạy ngoài React.
   Câu feature (qua `t()`) dùng ICU `{min}` như mọi chuỗi next-intl.
3. **`configureZodLocale(locale, messages.validation)` chỉ gọi ở trình duyệt** — duy nhất `LocaleSync` (`app/_providers`) gọi nó. Zod giữ cấu hình ở MỘT biến toàn cục:
   gọi trong Server Component thì ngôn ngữ của request này rò sang request khác. Server (Server Action, route handler) KHÔNG dựa vào nó — trả mã lỗi / khoá, client dịch.
4. **Thêm câu chung mới** → thêm khoá PHẲNG vào `src/messages/<locale>/validation.json` ở MỌI ngôn ngữ (kiểu `ZodValidationMessages` suy từ bản `vi`; `en` thiếu là `tsc` đỏ).
   **Thêm câu feature** → khoá trong `<feature>.json` (namespace của feature, mục `validation`). Hướng dẫn: `guides/i18n.md`.
5. Chưa gọi `configureZodLocale` (test, code chạy sớm) → mặc định tiếng Việt để câu vẫn đọc được.
6. Test schema dùng factory + object câu giả (hoặc `validationMessages()` mặc định) — không cần `NextIntlClientProvider` cho schema thuần.

---

## 7. Cross-references

- Form component UI kit → `reuse-first.md §3.7` (Form system)
- Schema location → `feature-structure.md` (folder `schemas/` của feature)
- API patterns → `api-patterns.md`
- Quy tắc đa ngôn ngữ → `rules/i18n/i18n.md` · hướng dẫn thêm chuỗi → `guides/i18n.md`
