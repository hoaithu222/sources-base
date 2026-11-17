# Feature Structure — cây folder của một feature (nguồn duy nhất)

> **Một tính năng = một folder; trong mỗi tính năng, mỗi mối quan tâm = một folder riêng.**
> Mở `src/features/{feature}/` là biết ngay: màn hình ở `pages/`, giao diện ở
> `components/`, logic ở `hooks/`, dữ liệu ở `service/` + `api/`, luật kiểm tra ở
> `schemas/` — không phải đọc từng file để đoán nó thuộc phần nào. Mục tiêu: dễ đọc,
> dễ tìm, dễ sửa, dễ bảo trì.
>
> Đây là nguồn DUY NHẤT của cây folder feature — rule / skill khác chỉ trỏ về đây, không chép cây.

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
├── pages/
│   ├── {Entity}Page.tsx          # List page
│   ├── {Entity}DetailPage.tsx    # Detail/Edit page
│   └── ...
├── schemas/
│   └── {feature}.schema.ts       # Zod validation schemas
├── constants/ · utils/ · types/  # khi cần: *.constants.ts · *.utils.ts · *.types.ts dùng ≥ 2 file
└── index.ts                       # CHỈ khi có nơi dùng ngoài feature (xem Quy tắc)
```

Folder mối quan tâm (`api/ service/ hooks/ components/ …`) KHÔNG có `index.ts` — import thẳng file bằng đường tương
đối (`../service/auth.queries`). Máy giữ: `tests/policy/foundations/folder-structure.test.ts`.

## Chia riêng — ba cấp

| Cấp | Chia theo | Ví dụ |
|---|---|---|
| 1 | **Tính năng** — mỗi feature một folder, `kebab-case`, khớp `id` module trong router registry | `features/auth/`, `features/order/` |
| 2 | **Mối quan tâm** — mỗi loại việc một folder; chỉ tạo folder đang có file (folder có 1 file vẫn được — tên folder là nhãn loại việc, `folder-structure.md §2`) | `pages/ components/ hooks/ service/ api/ schemas/ constants/ types/ utils/` |
| 3 | **Tính năng con** — CHỈ khi feature lớn (≥ 3 màn hình độc lập, hoặc > ~20 file) | `features/order/list/`, `features/order/detail/` |

Cấp 3 lặp lại cấp 2 ở quy mô nhỏ hơn:

```
src/features/order/
├── index.ts              # cổng ra duy nhất — chỉ khi có nơi dùng ngoài feature
├── list/                 # tính năng con: danh sách đơn
│   ├── pages/
│   ├── components/
│   └── hooks/
├── detail/               # tính năng con: chi tiết đơn
│   ├── pages/
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

`src/features/auth/` (`api/ service/ schemas/ pages/ components/` — feature có
gọi API thật, cấp 2) và `src/features/demo/` (ba màn tĩnh, mẫu của cấp 3) là hai
feature có sẵn trong base. `auth` không có `hooks/` vì chưa cần hook ghép — đừng tạo
thư mục rỗng "cho đủ template".

`demo/` — mỗi màn một tính năng con, dữ liệu dự án mẫu dùng chung ở `shared/`:

```
src/features/demo/
├── library/                  # /demo — thư viện giao diện
│   ├── sections.constants.ts # mục lục DEMO_SECTIONS: nối section vào trang (id · nhóm · nhãn)
│   ├── pages/                # DemoPage
│   ├── sections/<nhóm>/      # 8 nhóm theo UI kit: foundations · actions-inputs · feedback-overlays ·
│   │                         #   data-display · forms · surfaces-layout · media · widgets
│   ├── constants/<nhóm>/     # dữ liệu riêng của MỘT nhóm (cùng tên folder với sections/)
│   ├── constants/samples.constants.ts  # dữ liệu nhiều nhóm cùng dùng
│   ├── schemas/              # schema form mẫu
│   ├── components/           # shell/ (khung trang) · showcase/ (mẫu tự viết)
│   └── hooks/
├── composed/                 # /demo/ghep — màn danh sách ghép sẵn
│   └── pages/ · components/ · constants/
├── dashboard/                # /demo/tong-quan — dashboard một màn hình
│   └── pages/ · components/{panels/} · constants/ · utils/ · dashboard.theme.ts
└── shared/                   # dùng chung ≥ 2 màn: charts/ (đường S, cột chồng) · constants/ (gói thầu, đường dẫn)
```

Thêm khu vực cho `/demo`: tạo `library/sections/<nhóm>/<Tên>Section.tsx` rồi thêm một dòng vào
`DEMO_SECTIONS`; dữ liệu riêng đặt `library/constants/<nhóm>/`. `tests/features/demo/` giữ luật
nối và luật một trục (id = kebab(tên file), nhóm = folder, `constants/<nhóm>/` chỉ section cùng
nhóm import, tính năng con không import lẫn nhau).

## Quy tắc

- **KHÔNG** đặt business logic trong components — chuyển vào hooks
- **KHÔNG** gọi API trực tiếp trong components — qua service + React Query hooks
- **KHÔNG** import từ feature khác, **KHÔNG** import `@/app/...` — ESLint chặn. Dữ liệu
  dùng chung nhiều feature thì đưa xuống `src/domains/`; giao diện / tiện ích thì `src/shared/`
- Bên ngoài chỉ import feature qua `index.ts` của nó; trang KHÔNG export ở index
  (router lazy-load thẳng file trang bằng `import()` động)
- `index.ts` CHỈ có khi có nơi dùng NGOÀI feature import qua nó. Không có ai dùng ngoài (vd
  `demo/`: router chỉ lazy-load trang) thì không tạo; bên trong feature không tạo barrel cho
  `hooks/` `components/`… — import thẳng file bằng đường tương đối
- **Lazy load** tất cả pages trong router
- Một file một việc: 1 `.tsx` = 1 component (`clean-code-standards.md §1`); giới hạn dòng ở
  `folder-structure.md §1`. Đừng tạo folder rỗng "cho đủ template".
- Tên file theo vai trò: `folder-structure.md §4` (`{feature}.api.ts`, `{feature}.queries.ts`, `{feature}.schema.ts`…).
