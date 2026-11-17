# Clean Code Standards — một file một việc

> Áp cho **mọi file `.ts` / `.tsx`** trong `src/`. Mục tiêu: một file = một trách nhiệm rõ, Fast Refresh không vỡ,
> đọc - sửa nhanh. Giới hạn số dòng và tên file: `folder-structure.md §1`, `§4`. Cây folder feature:
> `feature-structure.md`. Vi phạm mục đánh dấu ⛔ → chặn merge khi review.

---

## 1. ⛔ Một file `.tsx` = một component

```
1 file .tsx CHỈ export 1 React component. KHÔNG khai component thứ 2 ở module-scope để export.
```

Vì sao: `react-refresh/only-export-components` cần file chỉ export component để hot-reload đúng; hai component
một file thì khó tìm, khó test, khó memo riêng (precedent: `setup/app-routes.tsx` từng làm hỏng husky vì khai `HomeRedirect`
cạnh hằng `routes`).

**Phần con nội bộ — nguồn DUY NHẤT của ngưỡng DRY trong một file:** khối JSX lặp **≥ 2 lần trong cùng file** → tách
thành phần con nội bộ đặt NGAY TRÊN component chính, kèm đủ điều kiện:

- KHÔNG export; viết `memo(function Ten(…) {…})` có tên; ≤ 30 dòng JSX;
- dùng ≥ 2 chỗ trong file (một chỗ → để inline);
- dùng ở file khác → tách thành file riêng (`components/` của feature, `parts/` của UI kit / widget).

```tsx
const Row = memo(function Row({ item }: RowProps) {
  return <tr>…</tr>;
});

function UserTable({ items }: UserTableProps) {
  return <table>{items.map((item) => <Row key={item.id} item={item} />)}</table>;
}

export default UserTable;
```

Lặp giữa NHIỀU file / feature (tách ra dùng chung) là ngưỡng khác: `development-rules.md` §DRY.

---

## 2. Module-scope: được gì, không được gì

Thứ tự file component: imports → kiểu / props → **hằng & hàm phụ riêng của file** → phần con nội bộ → khối tài liệu
+ component → `export default`. Ở module-scope chỉ được có:

| Được ở module-scope | Điều kiện | Vượt điều kiện → |
|---|---|---|
| `interface XxxProps` / kiểu chỉ file này dùng | — | dùng ≥ 2 file → `*.types.ts` (feature: `api/{f}.types.ts` / `types/`) |
| Hằng riêng của file (`SCREAMING_SNAKE_CASE`: giá trị mặc định form, object style tĩnh, mảng lựa chọn) | chỉ file này dùng, ngắn (~≤ 10 dòng); object / mảng tĩnh PHẢI hoist ra đây, không dựng lại mỗi render | dùng ≥ 2 file hoặc dài → `*.constants.ts` |
| Bảng class `*_CLASSES` (UI kit, widget, layout) | thứ tự `component-structure.md §1–§2` | dùng ≥ 2 component → `*.theme.ts` |
| Hàm thuần nhỏ của riêng file | ≤ 15 dòng | dài / dùng lại → `*.utils.ts` |
| Phần con nội bộ `memo` | §1 | — |

KHÔNG ở module-scope của file component:

| ❌ | Đặt ở |
|---|---|
| Schema Zod | `schemas/{name}.schema.ts` |
| Query key, hook React Query | `service/{name}.queries.ts` |
| Hàm gọi API | `api/{name}.api.ts` |
| Cột bảng có JSX trong `cell` dùng ở ≥ 2 file | file `.tsx` riêng trong `components/` |
| State / `let` thay đổi được | trong component, hook hoặc store |

```tsx
// src/features/auth/pages/LoginPage.tsx — hằng riêng của trang, ngắn, chỉ file này dùng
const DEFAULTS: LoginFormValues = { email: '', password: '' };
const FOOTER = { prefix: 'Chưa có tài khoản?', label: 'Đăng ký', to: PATHS.REGISTER } as const;
```

---

## 3. Giới hạn số dòng

Con số và vùng áp: nguồn duy nhất `folder-structure.md §1` (máy giữ bằng test `file-size`). Vượt thì tách theo
thứ tự ghi ở đó — không nới ngưỡng, không xé một component thành hai file chỉ để lọt trần.

---

## 4. Mỗi loại file chỉ chứa đúng loại của nó

| File | Chỉ chứa | KHÔNG chứa |
|---|---|---|
| `pages/*.tsx` | Ghép component + hook dữ liệu / form | Logic nghiệp vụ, formatter, schema (`page-structure.md`) |
| `components/*.tsx` | Một component + props | Gọi API, logic nghiệp vụ dài |
| `hooks/useXxx.ts` | State + side effect, trả hình dạng ổn định | JSX |
| `service/*.queries.ts` | Hook React Query + query key | Component, schema |
| `api/*.api.ts` | Hàm async gọi `apiClient` + `readData` | Hook, state |
| `*.utils.ts` | Hàm thuần (không React, không hook) | State, side effect |
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
// ❌ app-routes.tsx — khai component cạnh hằng không phải component (từng làm hỏng husky)
const HomeRedirect = () => <Navigate to="/dashboard" replace />;
export const routes: RouteObject[] = [{ path: '/', element: <HomeRedirect /> }];

// ✅ inline JSX, không khai component cạnh hằng
export const routes: RouteObject[] = [{ path: '/', element: <Navigate to="/dashboard" replace /> }];
```

Bảng class trong file `.tsx` KHÔNG export (cần dùng chung → `*.theme.ts`). File không JSX (registry, cấu hình) đuôi `.ts`.

---

## 6. Khuôn chuẩn

**Component** — thứ tự trong thân: hook → giá trị dẫn xuất → handler → effect → early return → JSX
(`component-structure.md §5`). Export theo `code-style.md` §"Mẫu export component".

```tsx
// src/features/user/components/UserCard.tsx
import { memo, useCallback } from 'react';

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
const UserCard = memo(function UserCard({ user, onEdit }: UserCardProps) {
  const handleEdit = useCallback(() => onEdit?.(user.id), [onEdit, user.id]);

  return (
    <div className="flex items-center gap-2">
      <Text>{user.name}</Text>
      <Button onClick={handleEdit} startIcon={<SystemIcon name="pen-bold" />}>Sửa</Button>
    </div>
  );
});

export default UserCard;
```

**Hook** — `export function useXxx`, không default, không JSX:

```ts
// src/features/user/hooks/useUserActions.ts
export function useUserActions() {
  const deleteUser = useDeleteUser();
  const handleDelete = useCallback(
    async (id: string) => {
      await deleteUser.mutateAsync(id);
      showToast('success', 'Đã xoá');
    },
    [deleteUser],
  );
  return { handleDelete };
}
```

Invalidate sau mutation đặt trong `service/*.queries.ts` (`onSuccess` của `useMutation`), không rải ở hook gọi.

---

## 7. Checklist

- [ ] File `.tsx` chỉ export **một component** (phần con nội bộ không export)
- [ ] Khối JSX lặp ≥ 2 lần trong file đã thành phần con nội bộ (§1)
- [ ] Module-scope chỉ có thứ ở bảng §2; schema / query / API đã ở đúng file
- [ ] Trong giới hạn dòng (`folder-structure.md §1`)
- [ ] `.ts` cho file không JSX, `.tsx` cho file có JSX
- [ ] `npm run check` xanh (`quality-gates.md`)

---

## 8. Cross-references

`code-style.md` (tên, mẫu export) · `component-structure.md` (thứ tự file, bảng class) · `comment-policy.md` ·
`code-optimization.md` · `feature-structure.md` · `folder-structure.md` · `api-patterns.md`
