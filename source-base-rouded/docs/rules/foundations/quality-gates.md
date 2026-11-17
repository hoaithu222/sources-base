# Quality Gates — cổng kiểm chất lượng (đọc trước khi commit / mở PR)

> Một rule chỉ nằm trong tài liệu là một rule sẽ bị quên. Mọi luật của repo đều có MỘT cổng
> máy giữ; bảng dưới là bản đồ "luật nào do cổng nào bắt, chạy khi nào".

---

## 1. Chạy gì, khi nào

| Lúc | Chạy | Gồm |
|---|---|---|
| Đang code | `npm run test:unit -- <tên>` · editor báo ESLint | vòng lặp nhanh |
| `git commit` (husky `pre-commit`) | `lint-staged` → `scripts/verify-commit.mjs` | prettier + eslint --fix trên file đã stage; rồi kiểm BẢN STAGE build được: package-lock khớp, file sinh style khớp nguồn, `typecheck` → `check:imports` → `check:cycles` → build demo + ngân sách → build chế độ app (như job `build-app`) + ngân sách. Commit chỉ docs thì bỏ qua; thư mục làm việc khác bản stage thì kiểm trên bản sao của index |
| `git push` (husky `pre-push`) | `npm run check` | toàn bộ cổng §2 trừ build (lint toàn repo, test…) |
| `git commit` (husky `commit-msg`) | `commitlint` | Conventional Commits |
| `npm run dev` (`predev`) · đầu `npm run check` | `check:hooks` | cảnh báo khi hook husky CHƯA cài (`core.hooksPath` ≠ `.husky/_`) |
| Trước khi mở PR | **`npm run check:all`** (= `check` + `build` + `check:bundle`) | toàn bộ cổng bên dưới |
| Trước khi mở PR đổi giao diện | Chụp ma trận viewport bằng Playwright (thủ công, KHÔNG nằm trong `check`) | bố cục thật ở mọi cỡ màn — §4 · `responsive-screens.md §6` |
| CI (`.github/workflows/ci.yml`) | job `check` (demo): cùng bộ như trên, từng bước riêng, test đơn vị chạy kèm coverage, thêm `test:smoke` · job `build-app`: build + ngân sách ở chế độ sản phẩm thật | PR và đẩy lên `main` / `master` |

`npm run check` = `check:hooks` → `typecheck` → `lint` → `check:eslint-config` → `format:check` → `check:imports` → `check:cycles` →
`check:unused-files` → `test` (unit + smoke). Đỏ ở đâu thì sửa ở đó, không bỏ qua bước.

---

## 2. Cổng → luật nó giữ

| Cổng | Lệnh | Bắt | Luật |
|---|---|---|---|
| **Kiểu** | `npm run typecheck` (`tsc -b`: `tsconfig.app` = `src` · `tsconfig.test` = `tests` + type vitest · `tsconfig.node`) | lỗi type, biến thừa, `import type` | ⛔ KHÔNG `tsc --noEmit`: tsconfig kiểu solution nên lệnh đó kiểm 0 file |
| **Lint** | `npm run lint` (`--max-warnings 0`: cảnh báo cũng đỏ) | kiến trúc tầng, Promise, ô tìm kiếm, khoảng cách, thứ tự props, comment | `eslint.config.js` — xem §3 |
| **Định dạng** | `npm run format:check` | lệch Prettier | `.prettierrc.json`, `code-style.md` |
| **Gói chưa khai** | `npm run check:imports` | import gói không có trong `package.json` | `scripts/check-imports.mjs` |
| **Import vòng** | `npm run check:cycles` | vòng phụ thuộc TĨNH (madge; `import()` động của `lazyPage` không tính — `.madgerc`) | `ui-kit-architecture.md §8`, `folder-structure.md §5` |
| **File / gói thừa** | `npm run check:unused-files` | file không ai nạp, gói không dùng (knip) | `reuse-first.md` |
| **Test đơn vị** | `npm run test:unit` (CI: `npm run test:coverage` — unit kèm coverage) | hành vi + các bài kiểm luật ở §4; ngưỡng coverage của `core` và `domains/session` | `security-checklist.md`, `vite.config.ts` |
| **Test smoke** | `npm run test:smoke` | dựng cả cây app trong jsdom | `vite.config.ts` (timeout riêng) |
| **Build** | `npm run build` | sinh style + `tsc -b tsconfig.app.json` (CHỈ `src` — test hỏng kiểu không chặn build) + vite build; env sai là dừng | `core/config/env.schema.ts` — xem §2b |
| **Ngân sách tải đầu** | `npm run check:bundle` | chunk nặng bị preload, vượt ngân sách | `scripts/check-bundle.mjs` |
| *Tham khảo* | `npm run report:unused-exports` | export thừa (knip đầy đủ) | không chặn, không nằm trong `check` |

Mã sinh tự động (`generate:font · colors · icons · images`) được theo dõi trong git và
Prettier bỏ qua (`.prettierignore`) — sửa nguồn rồi chạy `npm run generate:styles`, không sửa tay. ⛔ KHÔNG chạy `generate:icons` / `generate:images` — generator lệch registry đã commit, xem `docs/known-issues.md`.
`knip.json` bỏ qua gói `tailwindcss` vì nó chỉ được nạp qua `@import 'tailwindcss'` trong CSS.

### 2b. Môi trường: CI không dựa vào `.env` của máy

- `.env` của repo đặt `VITE_APP_MODE=demo` (mặc định dùng chung, được commit) nhưng **checkout sạch có thể không có nó** — nên cả CI lẫn test KHÔNG được phụ thuộc vào nó.
- CI khai env ngay trong workflow: job `check` → `VITE_APP_MODE=demo`; job `build-app` → `VITE_APP_MODE=app` + `VITE_API_BASE_URL` (dự án thật thay bằng URL của mình). Thiếu / sai thì `vite.config.ts` dừng build — đúng chủ đích.
- Test cố định chế độ demo bằng `test.env` trong `vite.config.ts`: kết quả không đổi theo `.env` / `.env.local` của từng máy.
- `madge` in "4 warnings": đó là các import không phải TS (`*.svg?url`, `tailwindcss`) bị bỏ qua — vô hại.

---

## 3. ESLint — các luật riêng của repo

Mỗi luật có MỘT cổng. Luật xét được trong MỘT file → ESLint (báo ngay trong editor); luật cần đọc nhiều file
(cây thư mục, tên file, tài liệu) → bài kiểm `tests/policy/**` (`testing.md §5`).

**Kiến trúc & public API** (`no-restricted-imports`, bảng vùng ở `scripts/eslint/architecture.mjs`)

| Luật | Vùng | Tài liệu |
|---|---|---|
| Tầng `app → features → domains → shared → core`; không gói `tailwind-variants` | từng tầng | `folder-structure.md`, `component-structure.md §2` |
| Domain / feature chỉ qua `index.ts`; demo `library` · `composed` · `dashboard` không import lẫn nhau | domains, features | `feature-structure.md` |
| Core chỉ qua `@/core/<module>` | ngoài `core/` | `api-patterns.md` |
| UI kit chỉ qua `@/shared/ui` (+ `icons/Icons`, `media/image-annotator`; widget thêm `overlays/{modal,popup-surface}.theme`); UI kit không import widget | ngoài `shared/ui` | `ui-kit-architecture.md §1` |
| Widget: không barrel gốc, không với sâu, không import widget khác | `shared/widgets`, nơi dùng | `widget-composition.md §9–§10` |
| `@/app/components/*` cấm (dùng barrel); `@/app/router/<x>/<file>` cấm ngoài router; barrel `@/app/router` chỉ ở `App.tsx` | `src/app` | `routing-conventions.md` |
| `hooks` · `utils` · `constants` · `charts` chỉ `import type` từ ui / widgets | `src/shared` | `folder-structure.md` |
| `local/relative-in-module` — import tương đối không leo ra khỏi module | `src/` | `folder-structure.md` |

**Gác cú pháp** (`guard/*` — mỗi gác một rule riêng, có `files` / `ignores` riêng; `eslint-disable-next-line guard/<tên> -- lý do`)

| Gác | Bắt | Vùng | Tài liệu |
|---|---|---|---|
| `guard/search-input` | ô tìm kiếm controlled / `debounce` trên `Input` / `toLowerCase().includes` | `src/` | `ime-safe-input.md`, `search-matching.md` |
| `guard/spacing` | khoảng cách tuỳ ý, đệm ≥ 5, `PageShell` tự đệm | `features/`, `app/pages/` | `spacing-system.md` |
| `guard/react-19` | `export default memo`, `memo` vô danh, `forwardRef`, `React.memo/FC/ElementRef` | `src/` | `code-style.md` |
| `guard/ui-kit-elements` | `<button>` `<input>` `<select>` `<textarea>` `<table>` `<svg>` thô | app, features, domains | `reuse-first.md` (widget miễn — `widget-composition.md §2`) |
| `guard/store-write` | `use*Store.setState(` ngoài domain và `*.store.ts` | `src/` | `state-management.md` |
| `guard/store-files` · `guard/context-files` | zustand chỉ trong `*.store.ts`; `createContext` chỉ trong `*.context.ts` | `src/` | `folder-structure.md §4` |
| `guard/barrel-only` · `guard/named-exports` · `guard/ui-kit-barrel` | `index.ts` chỉ `export … from`; core / domains không `export *`; file UI kit không re-export | `src/` | `folder-structure.md §5` |
| `guard/theme-tables` | hàm `*Styles` trong `*.theme.ts` (di sản `tv()`) | `src/shared` | `component-structure.md §2` |
| `guard/login-redirect` | `navigate(PATHS.LOGIN` ngoài `router/guards` | `src/` | `routing-conventions.md §10` |
| `guard/error-messages` · `guard/error-claim` | câu lỗi literal trong `new AppError` ở core; gán `.notified` ngoài `claim-error-message.ts` | `src/core`, `src/` | `api-patterns.md` |
| `guard/storage` | `localStorage` / `sessionStorage` ngoài `storage.utils.ts` | `src/` | `state-management.md` |
| `guard/number-format` | `toLocaleString` / `toLocaleDateString` ngoài `utils/format` | `src/` | `chart-conventions.md` |

**Rule chuẩn**

| Rule | Vùng | Tài liệu |
|---|---|---|
| `local/comment-policy` — chỉ comment hướng dẫn dùng | `src/` | `comment-policy.md` |
| `no-console` (trừ `warn` / `error`) · `no-restricted-globals` (API test vitest lọt vào `src`) | `src/` | `security-checklist.md`, `testing.md` |
| `no-floating-promises` · `no-misused-promises` | `src/`, `tests/` | `async-safety.md` |
| `complexity` 15 · `max-depth` 4 · `max-params` 4 · `max-lines-per-function` 120 · `no-nested-ternary` | app, core, domains, features | `clean-code-standards.md` |
| `@typescript-eslint/naming-convention` · `consistent-type-imports` · `no-restricted-exports` (default, `shared/hooks`) | `src/` | `code-style.md` |
| `perfectionist/sort-imports` (thứ tự NHÓM) · `perfectionist/sort-jsx-props` — tự sửa `npm run lint:fix` | `src/` | `code-style.md` |
| `js.recommended` + `globals.node` | `scripts/**`, file cấu hình gốc | — |

**Bẫy**: ESLint flat config GHI ĐÈ options của cùng một rule khi nhiều block khớp một file.
Block sau của `no-restricted-imports` phải mang LẠI đủ danh sách của block trước (bảng vùng ở
`scripts/eslint/architecture.mjs`); gác cú pháp tách thành rule riêng `guard/*` nên không dính bẫy này.
`npm run check:eslint-config` kiểm từng vùng vẫn nhận đủ luật.

---

## 4. Bài kiểm luật — cây `tests/`, đặt tên, helper: `testing.md`

Danh sách test luật (`tests/policy/**` và vài test luật đặt cạnh vùng nó kiểm) cùng luật mỗi test giữ: nguồn duy
nhất `testing.md §5`. Hợp đồng bất đồng bộ của `async-safety.md §1` (thứ tự về ngược, huỷ / reset, phiên, dữ liệu
lưu trữ) do test hành vi giữ: `async-forms` · `upload-queue` · `use-upload` · `use-latest-request` · `session-*` ·
`preferences-persist` · store của widget.

Muốn thêm một luật đo được → thêm test ở `tests/policy/<nhóm>/` (đọc file qua `@tests/helpers/source-files`, KHÔNG
dùng `fs` — `tsconfig.app` không nạp type Node), rồi thêm một dòng vào bảng `testing.md §5`.

**Bố cục responsive KHÔNG có cổng máy trong `npm run check`.** jsdom không có bố cục thật nên `check` xanh không nói gì
về tràn ngang, chồng lấn hay vùng chạm ở điện thoại / tablet / laptop. Bài kiểm luật chỉ khoá cấu hình và tài liệu
(`display/responsive-foundation` · `display/responsive-docs`); đổi giao diện thì chụp ma trận viewport bằng trình duyệt
thật theo `responsive-screens.md §6` (khi nào chụp cỡ nào: `testing.md §7`) rồi mới mở PR.

---

## 5. Khi một cổng đỏ

- Sửa **nguyên nhân**; không `eslint-disable`, `@ts-ignore`, `it.skip`, không nới
  `OVERSIZE_ALLOWED` / ngưỡng cho qua.
- Ngoại lệ thật sự → khai tại chỗ với lý do một dòng (`eslint-disable-next-line <rule> -- lý do`,
  `@ts-expect-error <lý do>`) hoặc dòng có lý do trong danh sách ngoại lệ của bài kiểm.
- Cổng đỏ do việc chưa commit của người khác → báo lại, không sửa đè.

---

## 6. Thêm một cổng mới

1. Luật đo được bằng máy → test luật `tests/policy/<nhóm>/*.test.ts` hoặc rule ESLint (gác `guard/*` ở `scripts/eslint/syntax-guards.mjs`, rule tự viết ở `scripts/eslint/rules/`).
2. Chạy được bằng `npm run check` (và CI) mà không cần bước thủ công.
3. Thông báo lỗi nói LUẬT là gì và sửa thế nào, kèm đường dẫn rule trong `docs/rules/`.
4. Ghi vào bảng §2–§3 của file này (cổng / rule ESLint) hoặc `testing.md §5` (test luật); rule mới thêm dòng ở `docs/README.md`.

---

## 7. Cross-references

`development-rules.md` · `folder-structure.md` · `comment-policy.md` · `component-structure.md` ·
`security-checklist.md` · `documentation-management.md`
