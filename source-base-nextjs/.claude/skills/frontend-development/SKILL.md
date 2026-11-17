---
name: frontend-development
description: Next.js 16 (App Router) + React 19 + TypeScript component/page/hook patterns cho base-project — Server vs Client Component, route `page.tsx` mỏng + view, `generateMetadata`, data fetching, next-intl, memoization, tổ chức file. Dùng khi viết component/hook mới hoặc page mới.
---

# Frontend Development Patterns — base-project

Stack thật: Next.js 16 App Router + React 19 (KHÔNG Vite, KHÔNG React Router), next-intl, TanStack Query (KHÔNG SWR), UI kit
trên Radix (KHÔNG MUI, KHÔNG shadcn, KHÔNG `tv()` — biến thể là bảng `*_CLASSES`), react-hook-form + Zod 4, Zustand. Bỏ qua mọi
hướng dẫn ở nơi khác nói về stack khác.

## Server hay Client? — quyết định đầu tiên cho MỖI file

| File làm gì                                                                                                           | Loại                                                                                                     |
| --------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| `page.tsx` / `layout.tsx`                                                                                             | Server, MỎNG: metadata + ghép một view                                                                   |
| Chỉ trình bày (props → JSX; Skeleton, Callout, view tĩnh)                                                             | Server — KHÔNG thêm `'use client'` "cho chắc"                                                            |
| `useState` / `useEffect` / handler / `createContext` / Radix · RHF · Zustand · Recharts · dnd-kit / `next/navigation` | `'use client'` — kể cả hook, store, context `.ts`                                                        |
| Hằng, bảng class, hàm thuần                                                                                           | File riêng `*.theme.ts` · `*.constants.ts` · `*.utils.ts` (không directive) để Server Component gọi được |

Luật + vì sao (barrel `@/shared/ui` kéo hook vào đồ thị server): `docs/rules/structure/server-client-boundary.md`. Phần tương tác
nhỏ trong một trang tĩnh → tách thành Client Component LÁ, đừng đánh dấu cả view. Client Component không import
`@/core/i18n/server`, `@/core/seo`, `serverConfig`.

## Route mỏng + view

```tsx
// src/app/[locale]/(workspace)/(app)/dashboard/page.tsx — Server Component
import { generatePageMetadata } from '@/app/_seo/page-metadata';
import DashboardView from '@/app/_views/DashboardView';
import { PATHS } from '@/shared/constants/paths.constants';

export const generateMetadata = ({ params }: PageProps<'/[locale]/dashboard'>) =>
  generatePageMetadata({ params, key: 'dashboard', path: PATHS.DASHBOARD });

export default function DashboardPage() {
  return <DashboardView />;
}
```

- View của trang tĩnh / vùng làm việc ở `src/app/_views/`; view của feature ở `src/features/<x>/views/` (xuất qua `index.ts`
  của feature). `PageProps<'/[locale]/…'>` / `LayoutProps` do `next typegen` sinh (chạy trong `npm run typecheck`); đường dẫn bỏ
  tên route group.
- Trang cần JSON-LD / tiêu đề tuyệt đối → `buildPageMetadata` + `<JsonLd>` (mẫu: `src/app/[locale]/(public)/about/page.tsx`). Trang
  công khai → `noIndex: false` + dòng ở `PUBLIC_ROUTES`; đúng MỘT `<h1>`. Chi tiết: `docs/rules/seo/seo.md`, `docs/guides/seo.md`.
- `useSearchParams` (kể cả qua `useQueryParams`) → bọc `<Suspense>` quanh view, nếu không route mất SSG
  (`(auth)/reset-password/page.tsx`). Không `cookies()` / `headers()` ở route công khai.

## Một component chuẩn

```tsx
'use client';

import { useTranslations } from 'next-intl';

import { Button, Surface, Text } from '@/shared/ui';
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
 * @param props.onSelect - Bấm "Chọn" → nhận `title`.
 * @param props.className - Class thêm cho khung ngoài.
 */
export default function FooCard({ title, onSelect, className }: FooCardProps) {
  const t = useTranslations('foo.card');
  return (
    <Surface className={cn('p-2', className)}>
      <Text>{title}</Text>
      <Button onClick={() => onSelect?.(title)}>{t('select')}</Button>
    </Surface>
  );
}
```

- Thứ tự trong thân: hook → giá trị dẫn xuất → handler → effect → early return → JSX. Không `React.FC`; React 19 không `forwardRef`.
  Mẫu đầy đủ: `docs/rules/foundations/code-style.md` §"Mẫu export component".
- Khối tài liệu sát trên component (`Tên — mô tả`, `@param props.*`, `@example` với component `shared/**`):
  `docs/rules/structure/component-structure.md §4`. Hằng / hàm phụ ở module-scope: `clean-code-standards.md §2`.
- Component KHÔNG có hook / handler (thuần trình bày) → bỏ dòng `'use client'`; nó render được ở server.

## Chữ hiển thị — next-intl, không hard-code

`useTranslations('auth.login')` ở component (client lẫn server không async); hàm async server (`generateMetadata`, page) dùng
`getTranslations({ locale, namespace })` từ `@/core/i18n/server`. Khoá có kiểu — gõ sai là `tsc` đỏ. Thêm khoá vào CẢ
`src/messages/vi/<ns>.json` và `en/<ns>.json`; namespace mới gắn vào `vi/index.ts` + `en/index.ts` (+ `CLIENT_NAMESPACES` nếu
client dùng). `Link` · `useRouter` · `usePathname` · `redirect` từ `@/core/i18n`, prop `href` (KHÔNG `next/link`). Hàm thuần
(format tiền, validator) nhận `locale` / lấy chữ qua registry — không gọi hook. Luật: `docs/rules/i18n/i18n.md`; làm từng bước:
`docs/guides/i18n.md`.

## Loading / lỗi — giữ khung, hạn chế spinner thay cả trang

1. Chuyển trang: `loading.tsx` (Next tự bọc `<Suspense>` quanh `page.tsx`) và `error.tsx` của nhóm route; lỗi gốc `global-error.tsx`.
2. Trong trang: `Skeleton` của UI kit đúng khung layout cuối cùng thay vì một spinner giữa màn trống.
3. `isPending` (lần đầu, chưa có cache) khác `isFetching` (refetch nền, đã có dữ liệu cũ) — đừng che cả UI khi chỉ đang refetch.

## Data fetching

| Dữ liệu                                            | Cách                                                                                                                                                                     |
| -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Công khai / SEO (trang marketing, không cần phiên) | `async` Server Component gọi `fetch` trực tiếp; request độc lập → `Promise.all`; KHÔNG `useEffect`. Đổi chính sách cache / revalidate ảnh hưởng SSG → `brainstorm` trước |
| Theo phiên (sau đăng nhập)                         | Client Component + TanStack Query: hàm thuần ở `api/<f>.api.ts` (`apiClient` + `readData`) → hook ở `service/<f>.queries.ts`                                             |

```tsx
// ❌ useEffect(() => { fetchFoo().then(setFoo); }, []);
// ✅ hook ở service/{feature}.queries.ts
const { data, isPending } = useFooList(filters);
```

Query key gồm mọi param phụ thuộc; `enabled: !!id` cho query có điều kiện; invalidate trong `onSuccess` của mutation ở `service/`.
Lỗi đã được báo tập trung — không tự toast trong `onError` (`docs/rules/data/api-patterns.md`). Filter / search / trang sống trên
URL (`useQueryParams`). Access token nằm trong bộ nhớ trình duyệt nên Server Component KHÔNG gọi được API cần phiên. Có `await`
trong component / hook → `docs/rules/data/async-safety.md`.

## Lazy loading — Next tự tách mã theo route

KHÔNG có module registry / `lazyPage`. Widget NẶNG chỉ-client (editor, biểu đồ lớn, modal hiếm mở) → `next/dynamic` (`ssr: false`
chỉ được dùng trong Client Component) hoặc `React.lazy` + `<Suspense>`. Đừng import `recharts` / dnd-kit vào layout hay barrel dùng chung.

## Memoization — React Compiler đang bật

Compiler tự memo hoá component / hook theo luật React, nên KHÔNG thêm `memo` / `useMemo` / `useCallback` "cho chắc"; chỉ khi có lý do
đo được hoặc theo `docs/rules/foundations/code-optimization.md` (mẫu có chủ đích: `const Xxx = memo(function Xxx(…) {…})`). Đổi lại phải
giữ Rules of React: không đọc `ref.current` / mutate props, state lúc render; hook không đặt trong điều kiện — vi phạm thì Compiler bỏ qua
component đó. `key` là ID ổn định, không index. react-hook-form: `watch('field')` theo field cụ thể. Debounce ô tìm: `useDebounce`
(`@/shared/hooks`) 300–500ms.

## Tổ chức file

Cây folder feature: `docs/rules/structure/feature-structure.md` (nguồn duy nhất — folder mối quan tâm KHÔNG có `index.ts`, import thẳng file).
Tên file theo vai trò + giới hạn dòng: `docs/rules/foundations/folder-structure.md` §1, §4. Thêm trang / phân hệ: skill `new-feature`,
`docs/guides/app-layer.md`.

## Thông báo người dùng — một kênh

```tsx
import { showErrorToast, showToast } from '@/shared/ui';

showToast('success', t('saved'));
showErrorToast(error, { message: t('saveFailed') }); // bỏ qua lỗi đã báo / request huỷ (claimErrorMessage)
```

## TypeScript

Strict, KHÔNG `any` (dùng `unknown` / generic), `import type` cho import chỉ có kiểu, alias `@/` thay đường tương đối dài —
`docs/rules/foundations/code-style.md`. Kiểm: `npm run typecheck` (= `next typegen && tsc --noEmit`; ⛔ không `tsc --noEmit` trần).
