# Code Style & Conventions

## TypeScript

- **Strict mode**: KHÔNG dùng `any` — dùng `unknown` nếu cần
- **Path alias**: Dùng `@/` thay vì relative paths dài
- **Interfaces vs Types**: `interface` cho object shapes, `type` cho unions/intersections
- **`import type`**: Luôn dùng khi chỉ import types (`verbatimModuleSyntax` bật — import kiểu mà thiếu `type` là `tsc` đỏ)
- **Cú pháp xoá được** (`erasableSyntaxOnly`): KHÔNG `enum`, `namespace`, tham số-thuộc-tính (`constructor(private x)`) — dùng
  union literal / `as const` / khai trường tường minh
- **Kiểu route là kiểu toàn cục**: `PageProps<'/[locale]/about'>`, `LayoutProps<'/[locale]'>` do `next typegen` sinh vào
  `.next/types` — dùng thẳng, không import; thiếu kiểu này nghĩa là chưa chạy `npm run typecheck` (`quality-gates.md §2`)

## Đặt tên định danh

| Thứ | Quy ước | Ví dụ |
|---|---|---|
| Component | PascalCase | `FilterBar`, `UserTable` |
| Hook | camelCase, tiền tố `use` | `useDisclosure`, `useUserList` |
| Hàm | camelCase, động từ | `formatDate`, `cn`, `buildPageMetadata` |
| Kiểu / interface | PascalCase; props của component `XxxProps`, trục biến thể `XxxSize` / `XxxVariant` | `ButtonProps`, `ApiResponse` |
| Hằng | `SCREAMING_SNAKE_CASE`; bảng class `{COMPONENT}_{TRỤC}_CLASSES` | `DEFAULT_PAGE_SIZE`, `BUTTON_SIZE_CLASSES` |
| Store Zustand · selector | `useXxxStore` · `selectXxx` | `useSessionStore`, `selectUser` |

Tên **file** và **folder** (theo vai trò: `PascalCase.tsx`, `useXxx.ts`, `kebab-case.<vai>.ts`): nguồn duy nhất
`folder-structure.md §4`.

## `'use client'` — vị trí và khi nào

- **Dòng ĐẦU TIÊN của file**, trước mọi `import` (`comment-policy.md` không cho comment đứng trước imports), nháy đơn, một dòng
  trống phía sau. Directive ở giữa file là vô hiệu — chỉ là một chuỗi — nên Next coi file là Server Component và báo lỗi khi gặp `useState`.
- File nào chạm API chỉ-client PHẢI có — kể cả file `.ts` (hook, store, context); component thuần trình bày KHÔNG có. Bảng đầy đủ
  và lý do: `rules/structure/server-client-boundary.md` (test `use-client` giữ).
- `page.tsx` / `layout.tsx` KHÔNG bao giờ có `'use client'` — cần tương tác thì ghép một view client. Ngoại lệ do Next yêu cầu:
  `error.tsx` và `global-error.tsx` PHẢI có (ranh giới lỗi chạy ở client); `loading.tsx` / `not-found.tsx` thuần trình bày thì không.

## Mẫu export component (React 19)

```tsx
import { memo } from 'react';

interface UserRowProps {
  user: User;
  onSelect?: (id: string) => void;
}

/** UserRow — một dòng người dùng trong danh sách. … */
function UserRow({ user, onSelect }: UserRowProps) {
  …
}

export default UserRow;

// Cần memo (dòng của danh sách rất dài, cha re-render thường xuyên — code-optimization.md):
const UserRow = memo(function UserRow({ user, onSelect }: UserRowProps) { … });
export default UserRow;
```

- File component kết thúc bằng `export default Xxx`; phần con NỘI BỘ trong `parts/` export tên khớp tên file.
- **Route của Next** (`page.tsx`, `layout.tsx`, `error.tsx`, `not-found.tsx`…): `export default function XxxPage()` — hàm có tên, KHÔNG
  `memo`, KHÔNG arrow vô danh. Metadata là export có tên (`generateMetadata`, `metadata`, `viewport`, `generateStaticParams`); thứ
  duy nhất Next cho export thêm ngoài component. Page chỉ ghép MỘT view (`page-structure.md`).
- `memo` import tên từ `react`, hàm bên trong CÓ TÊN (`memo(function Xxx…)`) — DevTools, stack lỗi và chú thích khi
  rê chuột lấy tên từ đó, nên không cần `displayName`. React Compiler đã bật nên code MỚI mặc định không cần `memo`
  (`code-optimization.md`); code có sẵn `memo(function Xxx…)` giữ nguyên, không gỡ hàng loạt.
- Hook: `export function useXxx` (không default; file có `'use client'`). Store Zustand: `export const useXxxStore = create<…>()(…)`.

| ❌ KHÔNG | Vì sao |
|---|---|
| `export const Xxx = memo(…)` (file component) | Lệch mẫu chung — test `ui-kit-docs` tìm khối tài liệu theo tên mà file `export default` |
| `export default memo(Xxx)` | Biểu thức không tên ở chỗ export — rê chuột lên `<Xxx` mất chú thích |
| `memo(() => …)` vô danh | Mất tên trong DevTools / stack lỗi |
| `React.memo()`, `React.FC<Props>` | Import tên từ `react`; props khai thẳng ở tham số |
| `forwardRef`, `React.ElementRef` | React 19: `ref` là prop thường; dùng `React.ComponentRef` |
| `Link` của `next/link`; `useRouter` / `usePathname` của `next/navigation` | Dùng bản của `@/core/i18n` — tự thêm tiền tố ngôn ngữ (`/en/…`). Giữ ở `next/navigation`: `useSearchParams`, `notFound`, và nơi cần router nhận URL ĐÃ có tiền tố (`useDirtyGuard`) — `rules/i18n/i18n.md` |
| `'use client'` thêm "cho chắc" vào component thuần trình bày | Biến nó thành JS gửi xuống trình duyệt và làm hằng / hàm cùng file mất khả năng gọi từ Server Component — `server-client-boundary.md` |

## Cấu trúc file & comment

- Component trong `src/shared/ui`: thứ tự file cố định (`'use client'` nếu cần → imports → types → bảng class →
  khối tài liệu + component → export) — `component-structure.md`.
- Comment: mặc định KHÔNG có; chỉ khối tài liệu ngay trên component (mô tả, `@param props.*`,
  `@example`) + JSDoc ngắn — `comment-policy.md`
  (ESLint `local/comment-policy` giữ). Tên biến và cấu trúc phải tự nói; lý do thiết kế đi vào
  `docs/rules/` hoặc `docs/notes/`, không vào code.

## Imports Order

Máy chỉ giữ thứ tự **NHÓM** (`perfectionist/sort-imports`, `src/**`; sai thì `npm run lint:fix` hoặc
lint-staged lúc commit tự xếp lại):

1. Thư viện ngoài + module Node — `react`, `next/*`, `next-intl`, `@radix-ui/*`, `dayjs`, `zod`, `node:fs`…
2. Alias nội bộ — `@/…`
3. Tương đối — `../`, `./`

```tsx
'use client';

import { memo, useCallback } from 'react';
import { useTranslations } from 'next-intl';

import { errorMessageOf } from '@/core/http';
import { PATHS } from '@/shared/constants/paths.constants';
import { Button, Callout, Form, useZodForm } from '@/shared/ui';

import AuthPageFrame from '../components/AuthPageFrame';
import type { LoginFormValues } from '../schemas/auth.schema';
import { useLogin } from '../service/auth.queries';
```

- Trong một nhóm KHÔNG sắp theo tên — giữ thứ tự có nghĩa. Quy ước nhóm 1: `react` đứng đầu, rồi `next/*`, rồi `next-intl`,
  rồi thư viện khác (máy không kiểm); tầng thấp `@/core` → `@/shared` trước tầng cao ở nhóm 2.
- `import type` đứng trong nhóm của NGUỒN nó (`import type { ReactNode } from 'react'` thuộc nhóm 1). Thứ chỉ
  dùng làm kiểu phải đánh dấu `type` — `import type { … }` hoặc `import { a, type B }`
  (`@typescript-eslint/consistent-type-imports`).
- Import chỉ để chạy (`import '@/styles/globals.css'` ở root layout) đứng nguyên chỗ, không bị xếp lại.
- Dòng trống giữa các nhóm như ví dụ là khuyến nghị, máy không kiểm.

## Class Name Composition

```tsx
// ✅ ĐÚNG — Dùng cn() cho conditional classes
import { cn } from '@/shared/utils/style/cn';

<div className={cn(
  "flex items-center gap-2 p-4",
  "bg-bg-surface border border-border-default",
  isActive && "bg-primary-5/15 border-primary-5",
  className
)} />
```
