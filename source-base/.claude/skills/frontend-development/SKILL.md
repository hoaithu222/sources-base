---
name: frontend-development
description: React 19 + TypeScript component/page/hook patterns cho base-project — mẫu export component, lazy loading qua module registry, data fetching, memoization, tổ chức file. Dùng khi viết component/hook mới hoặc page mới.
---

# Frontend Development Patterns — base-project

Stack thật: React 19, TypeScript, React Router v7 (KHÔNG TanStack Router), TanStack Query (KHÔNG SWR), UI kit trên
Radix (KHÔNG MUI, KHÔNG shadcn, KHÔNG `tv()` — biến thể là bảng `*_CLASSES`), react-hook-form + zod, Zustand. Bỏ qua
mọi hướng dẫn ở nơi khác nói về stack khác.

## Một component chuẩn

```tsx
import { memo, useCallback } from 'react';

import { cn } from '@/shared/utils/style/cn';

interface FooCardProps {
  title: string;
  onSelect?: (title: string) => void;
  className?: string;
}

/**
 * FooCard — thẻ chọn một mục.
 *
 * @param props.title - Tiêu đề hiển thị, cũng là giá trị trả về khi chọn.
 * @param props.onSelect - Bấm thẻ → nhận `title`.
 * @param props.className - Class thêm cho khung ngoài.
 */
const FooCard = memo(function FooCard({ title, onSelect, className }: FooCardProps) {
  const handleClick = useCallback(() => onSelect?.(title), [onSelect, title]);
  return <Surface className={cn('p-2', className)} onClick={handleClick}>{title}</Surface>;
});

export default FooCard;
```

- Thứ tự trong thân: hook → giá trị dẫn xuất → handler → effect → early return → JSX.
- `memo` / `useCallback` / `useMemo` import tên từ `react`; hàm trong `memo` CÓ TÊN; không `React.FC`; React 19 không
  `forwardRef`. Mẫu đầy đủ: `docs/rules/foundations/code-style.md` §"Mẫu export component".
- Khối tài liệu sát trên component (`Tên — mô tả`, `@param props.*`, `@example` với component `shared/**`):
  `docs/rules/structure/component-structure.md §4`.
- Hằng / hàm phụ ở module-scope: `docs/rules/foundations/clean-code-standards.md §2`.

## Lazy loading — qua module registry, KHÔNG tự `React.lazy()` mỗi trang

Trang khai bằng `lazyPage(() => import(…))` ngay trong entry route (`src/app/router/modules/{id}.routes.ts` cho phân
hệ, `static.routes.ts` cho trang tĩnh); `buildRoutes()` tự bọc `<LazyLoad>` (`docs/rules/structure/routing-conventions.md
§7`). Thêm phân hệ: skill `new-feature`. `React.lazy` tay chỉ cho component NẶNG trong một trang (modal hiếm mở,
editor nặng).

## Loading state — giữ khung, hạn chế spinner thay cả trang

1. `Skeleton` của UI kit đúng khung layout cuối cùng thay vì một spinner giữa màn trống.
2. `isPending` (lần đầu, chưa có cache) khác `isFetching` (refetch nền, đã có dữ liệu cũ) — đừng che cả UI khi chỉ
   đang refetch.

## Data fetching — CHỈ qua TanStack Query

```tsx
// ❌ useEffect(() => { fetchFoo().then(setFoo); }, []);
// ✅ hook ở service/{feature}.queries.ts
const { data, isPending } = useFooList(filters);
```

Query key gồm mọi param phụ thuộc; `enabled: !!id` cho query có điều kiện; invalidate trong `onSuccess` của mutation
ở `service/`. Lỗi đã được báo tập trung — không tự toast trong `onError` (`docs/rules/data/api-patterns.md`). Filter /
search / trang sống trên URL (`useQueryParams`). Có `await` trong component / hook → `docs/rules/data/async-safety.md`.

## Memoization — có chủ đích

Chi tiết: `docs/rules/foundations/code-optimization.md`. Tóm tắt: `useMemo` cho tính toán O(n)+ hoặc tham chiếu mới
mỗi render; `useCallback` cho handler truyền xuống con ĐÃ `memo`; `memo()` cho component trong danh sách / cha
re-render thường xuyên. `key` là ID ổn định, không index. react-hook-form: `watch('field')` theo field cụ thể.
Debounce ô tìm: `useDebounce` (`@/shared/hooks`) 300–500ms.

## Tổ chức file

Cây folder feature: `docs/rules/structure/feature-structure.md` (nguồn duy nhất — folder mối quan tâm KHÔNG có
`index.ts`, import thẳng file). Tên file theo vai trò + giới hạn dòng: `docs/rules/foundations/folder-structure.md`
§1, §4.

## Thông báo người dùng — một kênh

```tsx
import { showErrorToast, showToast } from '@/shared/ui';

showToast('success', 'Đã lưu');
showErrorToast(error, { message: 'Không lưu được' }); // bỏ qua lỗi đã báo / request huỷ (claimErrorMessage)
```

## TypeScript

Strict, KHÔNG `any` (dùng `unknown` / generic), `import type` cho import chỉ có kiểu, alias `@/` thay đường tương đối
dài — `docs/rules/foundations/code-style.md`. Kiểm: `npm run typecheck` (⛔ không `npx tsc --noEmit`).
