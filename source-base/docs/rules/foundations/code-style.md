# Code Style & Conventions

## TypeScript

- **Strict mode**: KHÔNG dùng `any` — dùng `unknown` nếu cần
- **Path alias**: Dùng `@/` thay vì relative paths dài
- **Interfaces vs Types**: `interface` cho object shapes, `type` cho unions/intersections
- **`import type`**: Luôn dùng khi chỉ import types

## Đặt tên định danh

| Thứ | Quy ước | Ví dụ |
|---|---|---|
| Component | PascalCase | `FilterBar`, `UserTable` |
| Hook | camelCase, tiền tố `use` | `useDisclosure`, `useUserList` |
| Hàm | camelCase, động từ | `formatDate`, `cn`, `getRoutePath` |
| Kiểu / interface | PascalCase; props của component `XxxProps`, trục biến thể `XxxSize` / `XxxVariant` | `ButtonProps`, `ApiResponse` |
| Hằng | `SCREAMING_SNAKE_CASE`; bảng class `{COMPONENT}_{TRỤC}_CLASSES` | `DEFAULT_PAGE_SIZE`, `BUTTON_SIZE_CLASSES` |
| Store Zustand · selector | `useXxxStore` · `selectXxx` | `useSessionStore`, `selectUser` |

Tên **file** và **folder** (theo vai trò: `PascalCase.tsx`, `useXxx.ts`, `kebab-case.<vai>.ts`): nguồn duy nhất
`folder-structure.md §4`.

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

// Cần memo (component trong danh sách, cha re-render thường xuyên — code-optimization.md):
const UserRow = memo(function UserRow({ user, onSelect }: UserRowProps) { … });
export default UserRow;
```

- File component kết thúc bằng `export default Xxx`; phần con NỘI BỘ trong `parts/` export tên khớp tên file.
- `memo` import tên từ `react`, hàm bên trong CÓ TÊN (`memo(function Xxx…)`) — DevTools, stack lỗi và chú thích khi
  rê chuột lấy tên từ đó, nên không cần `displayName`.
- Hook: `export function useXxx` (không default). Store Zustand: `export const useXxxStore = create<…>()(…)`.

| ❌ KHÔNG | Vì sao |
|---|---|
| `export const Xxx = memo(…)` (file component) | Lệch mẫu chung — test `ui-kit-docs` tìm khối tài liệu theo tên mà file `export default` |
| `export default memo(Xxx)` | Biểu thức không tên ở chỗ export — rê chuột lên `<Xxx` mất chú thích |
| `memo(() => …)` vô danh | Mất tên trong DevTools / stack lỗi |
| `React.memo()`, `React.FC<Props>` | Import tên từ `react`; props khai thẳng ở tham số |
| `forwardRef`, `React.ElementRef` | React 19: `ref` là prop thường; dùng `React.ComponentRef` |

## Cấu trúc file & comment

- Component trong `src/shared/ui`: thứ tự file cố định (imports → types → bảng class →
  khối tài liệu + component → export) — `component-structure.md`.
- Comment: mặc định KHÔNG có; chỉ khối tài liệu ngay trên component (mô tả, `@param props.*`,
  `@example`) + JSDoc ngắn — `comment-policy.md`
  (ESLint `local/comment-policy` giữ). Tên biến và cấu trúc phải tự nói; lý do thiết kế đi vào
  `docs/rules/` hoặc `docs/notes/`, không vào code.

## Imports Order

Máy chỉ giữ thứ tự **NHÓM** (`perfectionist/sort-imports`, `src/**`; sai thì `npm run lint:fix` hoặc
lint-staged lúc commit tự xếp lại):

1. Thư viện ngoài + module Node — `react`, `@radix-ui/*`, `dayjs`, `zod`, `node:fs`…
2. Alias nội bộ — `@/…`
3. Tương đối — `../`, `./`

```tsx
import { memo, type ReactNode } from 'react';
import { useForm } from 'react-hook-form';

import { usePermission } from '@/domains/session';
import { Button } from '@/shared/ui';

import { AuthPageFrame } from '../components';
import { loginSchema, type LoginFormValues } from '../schemas/auth.schema';
```

- Trong một nhóm KHÔNG sắp theo tên — giữ thứ tự có nghĩa (thường `react` đứng đầu nhóm 1, tầng thấp
  `@/core` → `@/shared` trước tầng cao).
- `import type` đứng trong nhóm của NGUỒN nó (`import type { ReactNode } from 'react'` thuộc nhóm 1). Thứ chỉ
  dùng làm kiểu phải đánh dấu `type` — `import type { … }` hoặc `import { a, type B }`
  (`@typescript-eslint/consistent-type-imports`).
- Import chỉ để chạy (`import './styles/globals.css'`) đứng nguyên chỗ, không bị xếp lại.
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
