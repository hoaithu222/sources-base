# Code Optimization Rules

## 1. Performance — React Rendering

### React Compiler đã BẬT (`reactCompiler: true` ở `next.config.ts`)

Compiler tự memo hoá component, giá trị dẫn xuất và hàm tạo trong thân component lúc build — nên code MỚI viết thẳng,
**KHÔNG rải `memo` / `useMemo` / `useCallback` "cho chắc"**: chúng thêm dòng cần bảo trì mà không thêm lợi ích, và khai sai
`deps` còn làm compiler bỏ qua cả component (kiểm `eslint-plugin-react-hooks`). DevTools hiện huy hiệu ✨ cạnh component đã được tối ưu.

```tsx
// ✅ Code mới: viết thẳng
function UserList({ items, status }: UserListProps) {
  const filtered = items.filter((item) => item.status === status);
  const handleSelect = (id: string) => onSelect?.(id);
  return <List items={filtered} onSelect={handleSelect} />;
}
```

Code CÓ SẴN dùng `memo(function Xxx…)` / `useMemo` / `useCallback` là đúng và an toàn — KHÔNG gỡ hàng loạt (rủi ro đổi hành vi,
không có lợi). Khi sửa file đó, giữ phong cách của file. Import `memo` / `useMemo` / `useCallback` từ `react` — KHÔNG
`React.memo()`, `React.useMemo()`, `React.useCallback()`; mẫu khai component có `memo`: `code-style.md` §"Mẫu export component".

### Khi nào VẪN cần memo thủ công

Compiler chỉ làm việc TRONG component / hook nó biên dịch được. Giữ (hoặc viết) memo thủ công ở các chỗ sau:

| Tình huống | Làm |
|---|---|
| **Nhận dạng ổn định cho thư viện ngoài** so sánh theo tham chiếu ngoài vòng render React — danh sách cột của bảng, `sensors` của dnd-kit, tuỳ chọn / dữ liệu truyền vào Recharts, schema Zod cho `zodResolver`, hàm đăng ký `addEventListener` trong hook tự viết | Tĩnh → hoist ra module-scope (rẻ nhất, chắc nhất). Phụ thuộc props / ngôn ngữ → `useMemo` (vd `useAuthSchemas` dựng schema từ chuỗi dịch, chỉ dựng lại khi đổi ngôn ngữ) |
| **Dependency của `useEffect` cần kiểm soát CHÍNH XÁC** khi nào effect chạy lại | `useCallback` / `useMemo` với `deps` đầy đủ — hoặc `useEventCallback` (`@/shared/hooks`) khi chỉ cần đọc giá trị mới nhất mà không chạy lại effect |
| **Tính toán thuần tốn kém** (> O(n) trên danh sách lớn) | Compiler chỉ cache theo đầu vào — đầu vào đổi liên tục thì vẫn tính lại. Lọc / sắp xếp ở nơi dữ liệu vào (`select` của React Query, server), chia trang, hoặc `useDeferredValue`; `useMemo` chỉ khi đầu vào ổn định |
| **Dòng của danh sách rất dài** (hàng trăm dòng trở lên) mà cha re-render thường xuyên | `memo(function Row…)` có tên — bảo hiểm rẻ, code hiện có đã dùng |
| **Code NGOÀI vùng compiler**: hàm ở module-scope, selector Zustand, callback của store, và component vi phạm Rules of React (compiler bỏ qua im lặng; `react-hooks` báo) | Tự giữ nhận dạng ổn định; sửa chỗ vi phạm thay vì che bằng memo |

### KHÔNG memo khi không cần

```tsx
// ❌ Không memo primitive values
const count = useMemo(() => items.length, [items]); // Không cần, .length rẻ

// ❌ Không memo component gốc chỉ render 1 lần (và không bao giờ `memo(() => …)` vô danh)
const App = memo(function App() { ... }); // không prop, cha không re-render

// ❌ Không bọc `useCallback` cho handler chỉ dùng ở DOM của chính component
const onClick = useCallback(() => setOpen(true), []); // compiler đã lo
```

Memo thủ công chỉ có giá trị khi một ca ở bảng trên áp dụng. Không chắc thì đo (React DevTools Profiler, `npm run analyze` cho
bundle) trước khi thêm.

---

## 2. Component Design

### Single Responsibility

```tsx
// ❌ SAI — Component làm quá nhiều việc
const UserPage = () => {
  // fetch data + filter logic + form logic + table logic + modal logic
  // 200+ lines
};

// ✅ ĐÚNG — Tách concerns
const UserPage = () => {
  return (
    <>
      <UserFilter />
      <UserTable />
      <UserFormModal />
    </>
  );
};
```

### Custom Hooks cho logic phức tạp

```tsx
// ❌ SAI — Logic trong component (và page / search giữ bằng useState thay vì URL)
const ListPage = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const { data } = useQuery({ queryKey: ['items', page, debouncedSearch], ... });
  // 20+ lines logic...
};

// ✅ ĐÚNG — Extract vào hook; page / pageSize / search sống trên URL (`useQueryParams`, api-patterns.md)
function useItemList() {
  const { page, pageSize, search, setPage, setSearch } = useQueryParams();
  const debouncedSearch = useDebounce(search, 300);
  const { data, isLoading } = useQuery({
    queryKey: ['items', { page, pageSize, search: debouncedSearch }],
    queryFn: () => itemService.getList({ page, pageSize, search: debouncedSearch }),
  });
  return { items: data?.items ?? [], total: data?.total ?? 0, isLoading, page, setPage, search, setSearch };
}
```

(Hook dùng `useQueryParams` → trang chứa nó PHẢI bọc `<Suspense>` — §10.)

---

## 3. API & Data Fetching

### React Query — BẮT BUỘC cho API calls

Trong base này dữ liệu nghiệp vụ được gọi từ TRÌNH DUYỆT: access token chỉ ở bộ nhớ (`architecture.md` §11) nên server không có
token để gọi API thay, và `page.tsx` không `fetch` dữ liệu nghiệp vụ. Server Component chỉ nạp chữ dịch / metadata / JSON-LD.

```tsx
// ❌ SAI — useEffect + useState
const [data, setData] = useState([]);
const [loading, setLoading] = useState(false);
useEffect(() => {
  setLoading(true);
  fetchData().then(setData).finally(() => setLoading(false));
}, []);

// ✅ ĐÚNG — React Query
const { data, isLoading } = useQuery({
  queryKey: ['entity-list', params],
  queryFn: () => entityService.getList(params),
});
```

### Query Keys phải chứa dependencies

```tsx
// ❌ SAI — Static key, không refetch khi params đổi
queryKey: ['items']

// ✅ ĐÚNG — Params trong key
queryKey: ['items', { page, search, status }]
```

### Invalidate sau mutation

```tsx
const queryClient = useQueryClient();
const t = useTranslations('entity');
const mutation = useMutation({
  mutationFn: entityService.create,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['entity-list'] });
    showToast('success', t('created'));
  },
  // Không cần `onError` để toast: bộ báo lỗi tập trung đã lo (api-patterns.md §3).
  // Muốn câu riêng: meta: { silentError: true }, onError: (e) => showErrorToast(e, { message: t('createFailed') })
});
```

---

## 4. Khi phát sinh code mới — Tư duy chung (DRY)

### Trước khi viết bất kỳ function/component nào:

1. **Kiểm tra xem có dùng được ở 2+ nơi không?**
   - Nếu CÓ → Đặt vào `src/shared/` (`hooks/`, `utils/`, hoặc `ui/` — UI kit)
   - Nếu KHÔNG → Đặt trong feature module

2. **Kiểm tra pattern tương tự đã tồn tại?**
   - Search codebase cho function/component tương tự
   - Mở rộng cái có sẵn thay vì tạo mới

3. **Extract shared logic khi thấy pattern lặp lại:**

```tsx
// ❌ SAI — Copy-paste cùng logic ở 3 features
// Feature A
const handleDelete = async (id: string) => {
  const confirmed = await showConfirm('Bạn chắc chắn?');
  if (confirmed) { await deleteA(id); refetch(); showToast('success', 'Đã xóa'); }
};
// Feature B — copy y hệt...
// Feature C — copy y hệt...

// ✅ ĐÚNG — dùng hook shared ĐÃ CÓ: src/shared/hooks/state/useDeleteWithConfirm.ts
import { useDeleteWithConfirm } from '@/shared/hooks';

const del = useDeleteWithConfirm({
  onConfirm: async (id) => {
    await deleteItem(id);
    queryClient.invalidateQueries({ queryKey: ['item-list'] });
    showToast('success', t('deleted'));
  },
});

<Button onClick={() => del.requestDelete(row.id, row.name)}>{t('delete')}</Button>
<ConfirmDialog
  variant="delete"
  open={del.isOpen}
  description={t('confirmDelete', { name: del.pendingName })}
  onCancel={del.cancel}
  onConfirm={del.confirm}
/>
```

> ⚠️ Bước 2 ở trên tồn tại vì đúng ca này: đừng viết `useDeleteAction` mới khi
> `useDeleteWithConfirm` đã có sẵn.

Ngưỡng tách ra dùng chung giữa nhiều nơi: `development-rules.md` §DRY. Khối JSX lặp trong CÙNG một file:
`clean-code-standards.md §1`.

---

## 5. TypeScript Strict

```tsx
// ❌ SAI
const data: any = response.data;
const items = data?.items || [];
function process(input) { ... } // implicit any

// ✅ ĐÚNG
const data = response.data as ApiResponse<EntityList>;
const items: EntityItem[] = data?.items ?? [];
function process(input: ProcessInput): ProcessOutput { ... }
```

### Type Reuse

```tsx
// ❌ SAI — Duplicate types
// File A: interface User { id: string; name: string; email: string; }
// File B: interface User { id: string; name: string; email: string; }

// ✅ ĐÚNG — Single source
// src/features/{feature}/api/{feature}.types.ts
export interface User { id: string; name: string; email: string; }
// Import everywhere: import type { SessionUser } from '@/domains/session';
```

---

## 6. Import Best Practices

```tsx
// ✅ ĐÚNG — Path alias + UI kit
import { Button, Modal, type ButtonVariant } from '@/shared/ui';
import { SystemIcon } from '@/shared/ui/icons/Icons';
import { useDisclosure } from '@/shared/hooks';
import { cn } from '@/shared/utils/style/cn';
import type { ApiResponse } from '@/core/http';
import { Link, useRouter } from '@/core/i18n';

// ❌ SAI — Relative paths dài
import { Button } from '../../../shared/ui/actions/Button';

// ❌ SAI — điều hướng của Next trần (mất tiền tố ngôn ngữ)
import Link from 'next/link';

// ✅ ĐÚNG — import type khi chỉ dùng type
import type { UserFormValues } from './types';
```

---

## 7. Conditional Rendering

```tsx
// ❌ SAI — Ternary lồng nhau
{isLoading ? <Spinner /> : error ? <Callout intent="error" /> : data ? <Table /> : null}

// ✅ ĐÚNG — Early returns rõ ràng
if (isLoading) return <Spinner />;
if (error) return <Callout intent="error" description={error.message} />;
if (!data?.length) return <EmptyState />;
return <Table data={data} />;
```

---

## 8. Event Handlers

```tsx
// ✅ ĐÚNG — Inline arrow là bình thường: compiler lo nhận dạng, không cần over-optimize
<Button onClick={() => handleDelete(item.id)} />

// ✅ OK — `useCallback` chỉ khi hàm là dependency của effect / đưa cho thư viện ngoài (§1)
const onDelete = useCallback((id: string) => handleDelete(id), [handleDelete]);
```

Handler là prop sự kiện JSX nên file chứa nó phải có `'use client'` (`server-client-boundary.md`) — Server Component không có handler.

---

## 9. Form Patterns

```tsx
// ✅ ĐÚNG — UI kit `useZodForm` (đã bọc sẵn zodResolver + mode 'onTouched')
import { z } from 'zod';
import { useZodForm } from '@/shared/ui';
import { emailField, requiredText } from '@/shared/utils/validation/validators.utils';

const schema = z.object({
  name: requiredText(),   // = z.string().trim().min(1, …) — câu lỗi mặc định theo ngôn ngữ đang hiển thị
  email: emailField(),
});

type FormValues = z.infer<typeof schema>;

const form = useZodForm<FormValues>(schema, { defaultValues: { name: '', email: '' } });

// ⛔ KHÔNG tự gọi useForm + zodResolver — xem `form-validation.md`
// Câu lỗi riêng của feature: schema dựng từ chuỗi dịch qua hook `useXxxSchemas` (mẫu: features/auth/schemas/useAuthSchemas.ts)
```

---

## 10. Tải trang, lazy loading và bundle

- **Tách mã theo route do Next làm** — không khai trang lazy bằng tay (không `React.lazy` cho route). Server
  Component không gửi JS nên thứ giữ bundle nhỏ là **kỷ luật `'use client'`** (đừng thêm directive "cho chắc") và provider chia hai
  tầng (`architecture.md` §3, §16).
- **Thư viện nặng chỉ dùng sau tương tác** (canvas chú thích ảnh…): `lazy(() => import(…))` ở **module-scope** của file client
  + `<Suspense>` quanh chỗ dùng — mẫu ở `shared/ui/media/image/lightbox/parts/image-lightbox-viewport.tsx`. KHÔNG gọi `lazy()` trong
  thân component (mỗi lượt render là một component mới → mất state).
- **`useSearchParams` (kể cả qua `useQueryParams`) PHẢI nằm trong `<Suspense>`** ở cấp trang — thiếu nó Next hoặc báo lỗi build
  hoặc làm cả route thành render động. Mẫu: `app/[locale]/(workspace)/(auth)/reset-password/page.tsx`.
- **Đừng import `recharts` / cây / dnd-kit vào layout hay barrel dùng chung**: chúng chỉ nên vào bundle của trang import chúng.
  `next.config.ts` bật `optimizePackageImports` cho `recharts`, `dayjs`, `@dnd-kit/*`.
- **Đo thay vì đoán:** `npm run analyze` (bundle, Turbopack); sau mỗi lần thêm route đọc bảng `Route (app)` của `npm run build` —
  không có `ƒ` (render động) ngoài `[...rest]` và `/api/*` (`quality-gates.md` §2).

---

## Checklist trước khi submit code

- [ ] Không có hardcoded colors (hex, rgb, named colors)
- [ ] Không duplicate component/hook/utility đã có sẵn
- [ ] Không có `any` type
- [ ] Không có `useEffect` + `useState` cho data fetching (dùng React Query)
- [ ] Không thêm `memo` / `useMemo` / `useCallback` "cho chắc" — chỉ khi một ca ở §1 áp dụng (code có sẵn giữ nguyên)
- [ ] Danh sách cột bảng / `sensors` / tuỳ chọn thư viện ngoài có nhận dạng ổn định (module-scope hoặc `useMemo`)
- [ ] Trang dùng `useSearchParams` / `useQueryParams` có `<Suspense>`
- [ ] Import dùng path alias `@/`; điều hướng qua `@/core/i18n`
- [ ] Types được import với `import type`
- [ ] Logic dùng ở 3+ nơi đã được extract vào shared (`development-rules.md` §DRY)
- [ ] `npm run check` xanh (`quality-gates.md`)
