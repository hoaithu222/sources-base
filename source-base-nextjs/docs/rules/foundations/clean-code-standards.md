# Clean Code Standards — một file một việc

> Áp cho **mọi file `.ts` / `.tsx`** trong `src/`. Mục tiêu: một file = một trách nhiệm rõ, Fast Refresh không vỡ,
> đọc - sửa nhanh. Giới hạn số dòng và tên file: `folder-structure.md §1`, `§4`. Cây folder feature:
> `feature-structure.md`. Ranh giới server / client: `server-client-boundary.md`. Vi phạm mục đánh dấu ⛔ → chặn merge khi review.

---

## 1. ⛔ Một file `.tsx` = một component

```
1 file .tsx CHỈ export 1 React component. KHÔNG khai component thứ 2 ở module-scope để export.
```

Máy giữ: `react-refresh/only-export-components` (cấu hình `next`). Vì sao: Fast Refresh (Next / Turbopack) chỉ giữ state khi hot-reload nếu file chỉ export component — thêm một export không phải
component là các nơi import nó bị nạp lại và mất state; hai component một file thì khó tìm, khó test, khó memo riêng.
**Ngoại lệ do Next quy định:** `page.tsx` / `layout.tsx` / `error.tsx`… export thêm `generateMetadata`, `generateStaticParams`,
`metadata`, `viewport`, `dynamic` — những export có tên đó là một phần của file đặc biệt, không phải "component thứ hai".

**Phần con nội bộ — nguồn DUY NHẤT của ngưỡng DRY trong một file:** khối JSX lặp **≥ 2 lần trong cùng file** → tách
thành phần con nội bộ đặt NGAY TRÊN component chính, kèm đủ điều kiện:

- KHÔNG export; viết hàm có tên (`function Ten(…) {…}` hoặc `memo(function Ten(…) {…})`); ≤ 30 dòng JSX;
- dùng ≥ 2 chỗ trong file (một chỗ → để inline);
- dùng ở file khác → tách thành file riêng (`components/` của feature, `parts/` của UI kit / widget).

```tsx
function Row({ item }: RowProps) {
  return <tr>…</tr>;
}

function UserTable({ items }: UserTableProps) {
  return <table>{items.map((item) => <Row key={item.id} item={item} />)}</table>;
}

export default UserTable;
```

`memo(function Row…)` vẫn đúng khi dòng đó nằm trong danh sách rất dài (`code-optimization.md`); code có sẵn dùng `memo` giữ nguyên.

Lặp giữa NHIỀU file / feature (tách ra dùng chung) là ngưỡng khác: `development-rules.md` §DRY.

---

## 2. Module-scope: được gì, không được gì

Thứ tự file component: (`'use client'` nếu cần →) imports → kiểu / props → **hằng & hàm phụ riêng của file** → phần con nội bộ →
khối tài liệu + component → `export default`. Ở module-scope chỉ được có:

| Được ở module-scope | Điều kiện | Vượt điều kiện → |
|---|---|---|
| `interface XxxProps` / kiểu chỉ file này dùng | — | dùng ≥ 2 file → `*.types.ts` (feature: `api/{f}.types.ts` / `types/`) |
| Hằng riêng của file (`SCREAMING_SNAKE_CASE`: giá trị mặc định form, object style tĩnh, mảng KHOÁ lựa chọn) | chỉ file này dùng, ngắn (~≤ 10 dòng); object / mảng tĩnh PHẢI hoist ra đây, không dựng lại mỗi render | dùng ≥ 2 file hoặc dài → `*.constants.ts` |
| Bảng class `*_CLASSES` (UI kit, widget, layout) | thứ tự `component-structure.md §1–§2` | dùng ≥ 2 component → `*.theme.ts` |
| Hàm thuần nhỏ của riêng file | ≤ 15 dòng | dài / dùng lại → `*.utils.ts` |
| Phần con nội bộ | §1 | — |

KHÔNG ở module-scope của file component:

| ❌ | Đặt ở |
|---|---|
| Schema Zod | `schemas/{name}.schema.ts` (thông báo lỗi đã dịch: hook `useXxxSchemas` đọc `useTranslations`) |
| Query key, hook React Query | `service/{name}.queries.ts` |
| Hàm gọi API | `api/{name}.api.ts` |
| Cột bảng có JSX trong `cell` dùng ở ≥ 2 file | file `.tsx` riêng trong `components/` |
| State / `let` thay đổi được | trong component, hook hoặc store |
| Chuỗi hiển thị cho người dùng (nhãn, mô tả, thông báo, `placeholder`) | khoá ở `messages/<locale>/<namespace>.json`; dịch bằng `useTranslations` / `getTranslations` TRONG thân component (hằng module chỉ giữ KHOÁ hoặc giá trị không có chữ) — `rules/i18n/i18n.md` |

```tsx
// src/features/auth/views/LoginView.tsx — hằng riêng của view, ngắn, chỉ file này dùng
const DEFAULTS: LoginFormValues = { email: '', password: '' };
```

---

## 3. Giới hạn số dòng

Con số và vùng áp: nguồn duy nhất `folder-structure.md §1` (máy giữ bằng test `file-size`). Vượt thì tách theo
thứ tự ghi ở đó — không nới ngưỡng, không xé một component thành hai file chỉ để lọt trần.

---

## 4. Mỗi loại file chỉ chứa đúng loại của nó

| File | Chỉ chứa | KHÔNG chứa |
|---|---|---|
| `app/**/page.tsx` · `layout.tsx` | `generateMetadata` / `generateStaticParams`, dữ liệu SEO (JSON-LD), ghép MỘT view / provider | `'use client'`, `useState`, handler, logic nghiệp vụ (`page-structure.md`, `server-client-boundary.md`) |
| `app/_views/*.tsx` · `features/{f}/views/*.tsx` | Ghép component + hook dữ liệu / form (view tương tác có `'use client'`; view tĩnh thì không) | Logic nghiệp vụ, formatter, schema (`page-structure.md`) |
| `components/*.tsx` | Một component + props | Gọi API, logic nghiệp vụ dài |
| `hooks/useXxx.ts` | State + side effect, trả hình dạng ổn định; có `'use client'` | JSX |
| `service/*.queries.ts` | Hook React Query + query key | Component, schema |
| `api/*.api.ts` | Hàm async gọi `apiClient` + `readData` | Hook, state |
| `*.utils.ts` | Hàm thuần (không React, không hook) — không `'use client'`, Server Component gọi được | State, side effect |
| `*.schema.ts` | Schema Zod + kiểu suy ra | Logic khác |
| `*.constants.ts` | Hằng `as const` | Hàm, component |
| `*.types.ts` | `interface` / `type` | Giá trị chạy |

---

## 5. ⛔ KHÔNG "mixed export" trong `.tsx`

```
File .tsx → CHỈ export component (default) — kiểu (`export type`) thì được.
File .ts  → export hằng / hàm / kiểu tuỳ ý. Có JSX → phải là .tsx.
```

```tsx
// ❌ DemoCard.tsx — export hằng cạnh component: sửa hằng là Fast Refresh nạp lại cả cây, test phải nạp cả component
export const CARD_CLASSES = 'rounded-lg border border-border-default p-4';
export default function DemoCard() { return <div className={CARD_CLASSES}>…</div>; }

// ✅ hằng KHÔNG export; cần dùng chung ≥ 2 component → `demo-card.theme.ts`
const CARD_CLASSES = 'rounded-lg border border-border-default p-4';
export default function DemoCard() { return <div className={CARD_CLASSES}>…</div>; }
```

Bảng class trong file `.tsx` KHÔNG export (cần dùng chung → `*.theme.ts`). File không JSX (cấu hình, hằng, hàm thuần) đuôi `.ts`.
Với Server Component còn một lý do nữa: Next chỉ cho dùng export của file `'use client'` như COMPONENT — hằng / hàm export cạnh nó
mà Server Component gọi thì lỗi (`server-client-boundary.md`).

---

## 6. Khuôn chuẩn

**Component** — thứ tự trong thân: hook → giá trị dẫn xuất → handler → effect → early return → JSX
(`component-structure.md §5`). Export theo `code-style.md` §"Mẫu export component".

Ví dụ `features/user/components/UserCard.tsx` (feature `user` chỉ để minh hoạ):

```tsx
'use client';

import { useTranslations } from 'next-intl';

import { Button, Text } from '@/shared/ui';
import { SystemIcon } from '@/shared/ui/icons/Icons';

import type { User } from '../api/user.types';

interface UserCardProps {
  user: User;
  onEdit?: (id: string) => void;
}

/**
 * UserCard — thẻ tóm tắt một người dùng, có nút sửa.
 *
 * @param props.user - Người dùng cần hiển thị.
 * @param props.onEdit - Bấm nút sửa → nhận `user.id`.
 */
function UserCard({ user, onEdit }: UserCardProps) {
  const t = useTranslations('user.card');

  return (
    <div className="flex items-center gap-2">
      <Text>{user.name}</Text>
      <Button onClick={() => onEdit?.(user.id)} startIcon={<SystemIcon name="pen-bold" />}>
        {t('edit')}
      </Button>
    </div>
  );
}

export default UserCard;
```

(`'use client'` vì prop sự kiện `onClick` + `useTranslations` ở nhánh client; React Compiler tự memo hoá nên không cần `memo` /
`useCallback` — `code-optimization.md`. Component thuần hiển thị, không handler, không hook thì bỏ directive.)

**Hook** — `export function useXxx`, không default, không JSX, có `'use client'`:

Ví dụ `features/user/hooks/useUserActions.ts`:

```ts
'use client';

import { useTranslations } from 'next-intl';

export function useUserActions() {
  const t = useTranslations('user.actions');
  const deleteUser = useDeleteUser();

  const handleDelete = async (id: string) => {
    await deleteUser.mutateAsync(id);
    showToast('success', t('deleted'));
  };

  return { handleDelete };
}
```

Invalidate sau mutation đặt trong `service/*.queries.ts` (`onSuccess` của `useMutation`), không rải ở hook gọi.

---

## 7. Checklist

- [ ] File `.tsx` chỉ export **một component** (phần con nội bộ không export)
- [ ] Khối JSX lặp ≥ 2 lần trong file đã thành phần con nội bộ (§1)
- [ ] Module-scope chỉ có thứ ở bảng §2; schema / query / API đã ở đúng file; không còn chuỗi hiển thị cứng
- [ ] Trong giới hạn dòng (`folder-structure.md §1`)
- [ ] `.ts` cho file không JSX, `.tsx` cho file có JSX
- [ ] `'use client'` đúng chỗ theo `server-client-boundary.md` (có khi chạm API client, KHÔNG có ở `page.tsx` / `layout.tsx` / component thuần)
- [ ] `npm run check` xanh (`quality-gates.md`)

---

## 8. Cross-references

`code-style.md` (tên, mẫu export, `'use client'`) · `component-structure.md` (thứ tự file, bảng class) · `comment-policy.md` ·
`code-optimization.md` · `feature-structure.md` · `folder-structure.md` · `server-client-boundary.md` · `api-patterns.md`
