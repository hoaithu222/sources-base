# React Base

Khung dự án React 19 + TypeScript + Vite 8 + Tailwind 4, tách ra từ một hệ PMS đã chạy thật (1000+ PR).
Giữ phần nền đã được kiểm chứng, bỏ toàn bộ nghiệp vụ. Đây là bản **SÁNG làm mặc định** cho ERP mang thương hiệu **VCI**
(dải xanh lá → ngọc → lam của logo + vàng kim, bo mềm, thanh header nổi đổi theo cấp, Dock kiểu macOS, bộ icon VCI);
theme tối HUD vẫn còn (nút đổi theme, chế độ TV) — ngôn ngữ giao diện: [`light-theme.md`](docs/rules/styling/light-theme.md).

**Trong hộp:** UI kit (design system riêng, `src/shared/ui`) · hệ form RHF + Zod 21 field · design token sinh từ
JSON (189 màu × 2 theme, 14 thang chữ, 377 icon hệ thống + bộ icon VCI) · auth JWT có refresh chống bão · module registry (khai route
một chỗ) · hook / util dùng chung · bộ quy tắc code có máy giữ (ESLint + test luật).

**Không có:** màn hình nghiệp vụ. Base có sẵn trang đăng nhập, đăng ký, quên / đặt lại mật khẩu, trang chủ, hồ sơ,
cài đặt, và **`/demo`** — thư viện giao diện in mọi token, icon và mọi nhóm component trên một trang.

> ⚠️ **Base xuất xưởng ở chế độ DEMO** (`VITE_APP_MODE=demo` trong `.env`): kiểm đăng nhập tắt, có phân hệ
> "Thư viện UI", `npm run dev` vào thẳng mọi trang khi chưa có backend. **Dự án thật phải đổi sang
> `VITE_APP_MODE=app`** — kiểm đăng nhập bật, build production dừng nếu thiếu cấu hình. Xem
> [Dựng dự án thật](#dựng-dự-án-thật) và [`docs/architecture.md` §10](docs/architecture.md).

📚 **Tài liệu: [`docs/README.md`](docs/README.md)** — mục lục duy nhất: sắp làm gì thì đọc gì, theo thứ tự.

---

## Bắt đầu

```bash
git init                       # ⛔ TRƯỚC khi cài — xem ghi chú bên dưới
npm ci                         # cài ĐÚNG package-lock (Node ≥ 22.12, xem .nvmrc)
cp .env.example .env.local     # tuỳ chọn: giá trị riêng của máy bạn
npm run dev                    # http://localhost:5173
```

`.env` (được commit) giữ mặc định dùng chung; `.env.local` (không commit) ghi đè cho máy bạn. Backend chạy ở cổng
khác `5000` thì đặt `API_PROXY_TARGET` trong `.env.local` — dev server chuyển tiếp `/api/*` tới đó. Biến sai định
dạng làm `npm run dev` / `build` dừng ngay kèm tên biến sai.

> ⛔ **`git init` phải chạy TRƯỚC `npm ci`.** Hook `prepare` cài husky, mà husky cần thư mục `.git`. Thiếu nó
> husky in `.git can't be found` rồi **thoát 0** — cài vẫn "thành công" nhưng pre-commit không được gắn, mọi guard
> im lặng không chạy. Lỡ rồi thì `git init && npm run prepare`.

## Lệnh hằng ngày

| Lệnh | Việc |
|---|---|
| `npm run dev` | Máy chủ phát triển |
| `npm run test:unit -- <tên>` | Test đơn vị (nhanh, dùng lúc code); `npm run test:smoke` — test dựng cả cây app |
| `npm run typecheck` | `tsc -b --noEmit` — ⛔ KHÔNG dùng `npx tsc --noEmit` (kiểm 0 file, luôn pass giả) |
| `npm run lint` / `lint:fix` | ESLint (`--max-warnings 0`) |
| `npm run format` / `format:check` | Prettier — ghi lại / chỉ kiểm (không phủ `.md`) |
| **`npm run check`** | **Trước khi đẩy code:** typecheck → lint → cấu hình ESLint → định dạng → kiểm import → kiểm vòng → file thừa → test |
| `npm run check:all` | Như CI: `check` + build + ngân sách tải đầu |
| `npm run build` · `npm run check:bundle` | Sinh style → typecheck → build · ngân sách tải đầu (chạy SAU build) |
| `npm run test:coverage` | Độ phủ — có ngưỡng cho `core/` và `domains/session/` |
| `npm run check:unused-files` · `npm run report:unused-exports` | File / gói thừa (chặn, nằm trong `check`) · export thừa (chỉ báo cáo) |
| `npm run generate:styles` | Sinh lại CSS màu + chữ từ JSON (tự chạy trong `build`) |
| `npm run generate:vci-icons` | Sinh dữ liệu bộ icon VCI từ `src/assets/vci-icons/*.svg` (`vci-icon-system.md`) |
| `npm run generate:icons` · `generate:images` | ⛔ **KHÔNG chạy** — generator lệch registry đã commit, xem [`docs/known-issues.md`](docs/known-issues.md) |

Cổng nào bắt luật nào, đỏ thì làm gì: [`docs/rules/foundations/quality-gates.md`](docs/rules/foundations/quality-gates.md).

## Cấu trúc `src/`

```
src/
├── main.tsx            Điểm vào: bootstrapApp() → <App />
├── app/                Lắp ráp — biết về ứng dụng CỤ THỂ này
│   ├── bootstrap.ts    Nối các tầng: HTTP ↔ phiên ↔ cache ↔ thông báo
│   ├── components/     Màn chờ / màn lỗi / ranh giới lỗi toàn app
│   ├── layouts/        RootLayout · AppShellLayout (lề, header, dock, ⌘K) · AuthLayout
│   ├── pages/          Trang tĩnh: chủ, hồ sơ, cài đặt, trang chủ phân hệ, giữ chỗ, status/ (403, 404, mất kết nối)
│   ├── providers/      AppProvider · AppOverlays (toast, thẻ tiến trình) · appearance/
│   ├── router/         static.routes.ts · modules/ (registry) · definition/ · setup/ · guards/ · menu/ · sync/
│   └── shell/          Nối widget với store: AppHeader · AppDock · AppCommandPalette
├── features/           Một nghiệp vụ một folder — base có auth/ và demo/
├── domains/            Dữ liệu dùng chung nhiều feature: session/ (phiên, quyền) · preferences/ (theme, TV)
├── shared/             Dùng chung, KHÔNG biết nghiệp vụ
│   ├── ui/             UI kit — 14 nhóm theo chức năng, import qua @/shared/ui
│   ├── widgets/        header/ · dock/ · tab-bar/ · command-palette/ · progress-center/ (import @/shared/widgets/<widget>)
│   ├── charts/         Hạ tầng Recharts: mật độ, bảng màu, trục, nhãn
│   ├── hooks/          state/ · timing/ · url/ · dom/ · browser/ · input/ · table/
│   ├── utils/          format/ · style/ · browser/ · validation/ (import THEO FILE, không barrel)
│   ├── constants/      *.constants.ts: PATHS, APP_NAME, layout, phân trang…
│   └── theme/          colors.generated.ts (SINH TỰ ĐỘNG)
├── core/               Nền tảng, KHÔNG biết store / router / giao diện: config/ · http/ · query/
├── styles/             globals.css (entry, chỉ @import) + theme/ base/ utilities/ overrides/ modes/ + font/
└── assets/             icons/ (377 SVG) · vci-icons/ (bộ icon VCI) · image/ (logo-vci.svg…) — kèm registry sinh tự động
```

Chiều phụ thuộc (ESLint chặn cứng): `app → features → domains → shared → core`. Mỗi folder ≤ 8 mục — luật:
[`folder-structure.md`](docs/rules/foundations/folder-structure.md).

## Những quyết định đáng biết

| Quyết định | Vì sao (1 câu) | Chi tiết |
|---|---|---|
| Tầng một chiều, tầng dưới nhận hành vi qua tham số ở `bootstrap.ts` | Tầng nào cũng thay / test được độc lập, không thể có vòng import giữa tầng | `architecture.md` §1 |
| UI kit chia theo chức năng, import qua barrel `@/shared/ui` | Người ta nhớ component _làm gì_, không nhớ nó "atomic" hay "composite" | `ui-kit-architecture.md` |
| Biến thể = bảng `*_CLASSES` `satisfies Record<…>` + `cn()`, không `tv()` | Thiếu ô là `tsc` đỏ; `tv()` nuốt class màu chữ khi gặp token font | `component-structure.md` §2 |
| Trang ghép `PageShell` → `TitleScreen` → `Toolbar` → `PageBody`, không tự đệm | Lề cấp một lần ở `AppShellLayout` nên header và nội dung nằm trên một lưới | `architecture.md` §3 |
| Màu / chữ / icon sinh từ JSON / SVG | Một nguồn cho CSS lẫn TS; test chặn class không tồn tại (Tailwind im lặng bỏ qua) | `architecture.md` §4 |
| Hiệu ứng tự chạy nhảy thẳng tới cuối khi giảm chuyển động | Chuyển động không mong muốn gây chóng mặt thật | `architecture.md` §5 |
| Access token chỉ trong bộ nhớ, một đường refresh ba nhánh | Không mở cửa cho XSS; refresh xoay vòng bắn song song là phiên chết oan | `architecture.md` §6 |
| Lỗi HTTP là `AppError`, báo một lần ở tầng query | Không toast trùng, chỉ báo sau khi đã thử lại xong | `api-patterns.md` |
| Route khai MỘT chỗ (module registry) | Route, guard, Dock, header (bộ chọn + điều hướng phân hệ), ⌘K, tên tab cùng dựng từ một khai báo — không có danh sách thứ hai để lệch | `routing-conventions.md` |
| Sáng mặc định; trang trí HUD và góc vuông chỉ ở theme tối (`dark:`, thang `rounded-*` về 0) | Một bộ component cho hai ngôn ngữ, không hai bộ class phải giữ khớp | `architecture.md` §15 · `light-theme.md` |
| ESLint chặn ô tìm kiếm controlled và `toLowerCase().includes` | Hai lỗi tiếng Việt đã gây bug thật: mất dấu khi gõ, tìm không dấu không ra | `ime-safe-input.md` · `search-matching.md` |
| `VITE_APP_MODE` demo / app, env qua schema Zod | Chạy được khi chưa có backend mà không lọt bản demo lên production | `architecture.md` §10 |
| Ngân sách tải đầu kiểm sau build | Lazy route không tự ngăn thư viện nặng lọt vào preload | `architecture.md` §11 |
| `tsc -b`; TypeScript ghim 5.9 | `npx tsc --noEmit` kiểm 0 file; TS 7 làm sập typescript-eslint | `architecture.md` §12 |

Nợ kỹ thuật và việc còn treo (có trạng thái): [`docs/known-issues.md`](docs/known-issues.md).

## Dựng dự án thật

1. **Đổi chế độ:** `VITE_APP_MODE=app` và khai `VITE_API_BASE_URL` trong `.env` (CI: biến của job `build-app` trong
   `.github/workflows/ci.yml`). Kiểm đăng nhập tự bật.
2. **Gỡ demo** (khi đã có màn hình thật):
   - bỏ `demoModule` và `...erpSampleModules` khỏi `MODULE_REGISTRY` trong `src/app/router/modules/module-registry.ts`;
   - xoá `src/app/router/modules/demo.routes.ts`, `src/app/router/modules/erp-sample.routes.ts` và `src/features/demo/`;
   - xoá `tests/features/demo/`;
   - sửa test route còn nhắc path demo (`grep -rn "/demo" tests/`).
   Chạy `npm run check` — knip (`check:unused-files`) báo phần còn sót.
3. **Thêm phân hệ đầu tiên:** skill `new-feature`, hoặc chép `demo.routes.ts` theo `routing-conventions.md` §3
   (`meta.tone` + `meta.group` + route con có `meta.title` là đủ để Dock, launcher và dải điều hướng header tự có mục;
   route index `LazyModuleHomePage` + `navIcon` / `navDescription` cho trang chủ phân hệ).
4. Đổi tên app (`VITE_APP_NAME`), logo (`src/assets/image/logo-vci.svg`), favicon, manifest PWA (`public/`) — icon PWA chưa
   có, xem `known-issues.md`.
# source-base-light
# source-base-rouded
