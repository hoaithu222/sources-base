# Feature Structure — cây folder của một feature (nguồn duy nhất)

> **Một tính năng = một folder; trong mỗi tính năng, mỗi mối quan tâm = một folder riêng.**
> Mở `src/features/{feature}/` là biết ngay: màn hình ở `views/`, giao diện ở
> `components/`, logic ở `hooks/`, dữ liệu ở `service/` + `api/`, luật kiểm tra ở
> `schemas/` — không phải đọc từng file để đoán nó thuộc phần nào. Mục tiêu: dễ đọc,
> dễ tìm, dễ sửa, dễ bảo trì.
>
> Đây là nguồn DUY NHẤT của cây folder feature — rule / skill khác chỉ trỏ về đây, không chép cây.
>
> Với Next, **route nằm ở `src/app/[locale]/…`** (không phải trong feature): feature chỉ giữ **view** (`views/`); `page.tsx` mỏng ở tầng
> `app` import view qua `index.ts` của feature (`import { LoginView } from '@/features/auth'`). Feature thiên về **client**
> (form, query, tương tác) nên view thường là `'use client'` — `server-client-boundary.md`.

## Cấu trúc feature

```
src/features/{feature-name}/
├── api/
│   ├── {feature}.api.ts          # Endpoint + hàm async thuần (xem api-patterns.md)
│   └── {feature}.types.ts        # Kiểu request / response
├── service/
│   └── {feature}.queries.ts      # React Query hooks
├── hooks/
│   └── use{Feature}.ts           # Combined feature hook
├── components/
│   ├── {Entity}Table.tsx         # Table component
│   ├── {Entity}Form.tsx          # Form component
│   ├── {Entity}Filter.tsx        # Filter component
│   └── ...
├── views/
│   ├── {Entity}View.tsx          # List view
│   ├── {Entity}DetailView.tsx    # Detail/Edit view
│   └── ...
├── schemas/
│   └── {feature}.schema.ts       # Zod validation schemas
├── constants/ · utils/ · types/  # khi cần: *.constants.ts · *.utils.ts · *.types.ts dùng ≥ 2 file
└── index.ts                       # exports views cho `page.tsx` + API công khai khác (xem Quy tắc)
```

Folder mối quan tâm (`api/ service/ hooks/ components/ views/ …`) KHÔNG có `index.ts` — import thẳng file bằng đường tương
đối (`../service/auth.queries`). Máy giữ: `tests/policy/foundations/folder-structure.test.ts`.

## Chia riêng — ba cấp

| Cấp | Chia theo | Ví dụ |
|---|---|---|
| 1 | **Tính năng** — mỗi feature một folder, `kebab-case`, khớp `id` phân hệ ở `NAV_MODULES` (`src/app/_navigation/navigation.config.ts`) và tên thư mục route | `features/auth/`, `features/order/` |
| 2 | **Mối quan tâm** — mỗi loại việc một folder; chỉ tạo folder đang có file (folder có 1 file vẫn được — tên folder là nhãn loại việc, `folder-structure.md §2`) | `views/ components/ hooks/ service/ api/ schemas/ constants/ types/ utils/` |
| 3 | **Tính năng con** — CHỈ khi feature lớn (≥ 3 màn hình độc lập, hoặc > ~20 file) | `features/order/list/`, `features/order/detail/` |

Cấp 3 lặp lại cấp 2 ở quy mô nhỏ hơn:

```
src/features/order/
├── index.ts              # cổng ra duy nhất — export view cho các `page.tsx`
├── list/                 # tính năng con: danh sách đơn
│   ├── views/
│   ├── components/
│   └── hooks/
├── detail/               # tính năng con: chi tiết đơn
│   ├── views/
│   ├── components/
│   ├── hooks/
│   └── schemas/
└── shared/               # chỉ dùng giữa các tính năng con của `order`
    ├── api/
    ├── service/
    └── types/
```

- Tính năng con KHÔNG import lẫn nhau. Thứ dùng chung ≥ 2 tính năng con đặt ở
  `shared/` của CHÍNH feature đó (khác `src/shared/`).
- Dùng chung giữa nhiều feature → `src/domains/` (dữ liệu / logic) hoặc `src/shared/`
  (giao diện / tiện ích) — xem mục Quy tắc.
- Mỗi folder chỉ chứa đúng loại file của nó (`clean-code-standards.md §4`):
  `components/` không có hook ghép, `hooks/` không có JSX, `constants/` không có hàm.
- Component có file đi kèm (types / theme / hook / phần con) thì có folder riêng, cùng
  quy tắc folder của `component-structure.md §6`.

## Feature mẫu

`src/features/auth/` — feature có gọi API thật, cấp 2, là bản mẫu sống của base:

```
src/features/auth/
├── api/          auth.api.ts · auth.types.ts                    # 4 endpoint (login, register, forgot, reset), kiểu request
├── service/      auth.queries.ts                                 # useLogin · useRegister · useForgotPassword · useResetPassword (React Query)
├── schemas/      auth.schema.ts · useAuthSchemas.ts              # Zod (createAuthSchemas) + hook dịch thông báo theo ngôn ngữ
├── views/        LoginView · RegisterView · ForgotPasswordView · ResetPasswordView   # view client (form, mutation)
├── components/   AuthPageFrame · AuthPageHeading · AuthLink      # khung chung bốn trang xác thực
└── index.ts      export 4 view + schema + hook query + kiểu request
```

- **Nối với route:** mỗi trang là một `page.tsx` mỏng ở `src/app/[locale]/(workspace)/(auth)/<trang>/page.tsx`
  (`generateMetadata` + `<LoginView />`; `reset-password` bọc thêm `<Suspense>` vì view đọc `?token=`). Layout nhóm `(auth)` lo
  `GuestGate` + `AuthLayout` — view không tự điều hướng (`notes/code/auth.md`).
- **Chữ hiển thị** ở `messages/{vi,en}/auth.json`; view lấy bằng `useTranslations('auth.login')`; thông báo Zod đã dịch nhờ `useAuthSchemas`
  (hook nằm cạnh schema vì chỉ phục vụ schema). Không có chuỗi tiếng Việt cứng trong feature.
- `auth` không có `hooks/` vì chưa cần hook ghép — đừng tạo thư mục rỗng "cho đủ template". Bản Vite còn có feature `demo/` (ba màn tĩnh, mẫu
  của cấp 3); base Next chỉ giữ một view demo nhỏ ở `src/app/_views/demo/` (thư viện UI đầy đủ chưa chuyển sang — `docs/known-issues.md`).

`src/features/customers/` — feature mẫu cho một màn **CRUD** (danh sách lọc trên URL · tạo · sửa · xoá; thêm `hooks/ constants/ utils/` vì có file thật). Chạy được ở chế độ demo không cần backend; nhân bản từng bước: [`guides/crud-feature.md`](../../guides/crud-feature.md), lý do thiết kế: `notes/code/customers.md`.

## Quy tắc

- **KHÔNG** đặt business logic trong components — chuyển vào hooks
- **KHÔNG** gọi API trực tiếp trong components — qua service + React Query hooks
- **KHÔNG** import từ feature khác, **KHÔNG** import `@/app/...` — ESLint chặn. Dữ liệu
  dùng chung nhiều feature thì đưa xuống `src/domains/`; giao diện / tiện ích thì `src/shared/`. Hệ quả: feature không biết path của `app` —
  link sang trang tĩnh dùng `PATHS` (`@/shared/constants/paths.constants`), trong nội bộ phân hệ dùng hằng path đặt trong feature
  (`routing-conventions.md §9`)
- Bên ngoài chỉ import feature qua `index.ts` của nó: `index.ts` **export các view** để `page.tsx` import (`@/features/auth`) — không với vào
  `@/features/auth/views/LoginView`. Next tự tách mã theo route nên không còn "lazy-load trang" — đừng `React.lazy` view; muốn nạp lười
  một khối nặng dùng `next/dynamic` (`server-client-boundary.md §7`)
- `index.ts` có khi feature có nơi dùng NGOÀI import qua nó — với feature có route thì luôn có (view). Bên trong feature không tạo barrel cho
  `hooks/` `components/`… — import thẳng file bằng đường tương đối
- View là **Client Component** khi có form / query / store (đầu file `'use client'`); `page.tsx` bọc nó là Server Component mỏng. Hằng / hàm
  thuần của feature ở `*.constants.ts` / `*.utils.ts` (không directive) để `page.tsx` hoặc `generateMetadata` dùng được
- Chữ hiển thị qua `useTranslations('<feature>.<nhóm>')`, thêm khoá vào CẢ `messages/vi` lẫn `messages/en`; không default tiếng Việt cứng
  (`../i18n/i18n.md`)
- Một file một việc: 1 `.tsx` = 1 component (`clean-code-standards.md §1`); giới hạn dòng ở
  `folder-structure.md §1`. Đừng tạo folder rỗng "cho đủ template".
- Tên file theo vai trò: `folder-structure.md §4` (`{feature}.api.ts`, `{feature}.queries.ts`, `{feature}.schema.ts`…).
