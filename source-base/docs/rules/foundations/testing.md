# Testing — cây `tests/`, đặt tên, helper, test luật

> Vitest (jsdom) + Testing Library; KHÔNG có Playwright / e2e (`known-issues.md`). Lệnh và cổng: `quality-gates.md`.
> Cách viết một test (AAA, query theo role, IME…): skill `web-testing`. File này giữ CẤU TRÚC và QUY ƯỚC.

---

## 1. Hai nhóm chạy

| Nhóm | Gồm | Lệnh | Ngân sách |
|---|---|---|---|
| `unit` | `tests/**/*.test.{ts,tsx}` trừ smoke | `npm run test:unit` (lúc code: `npm run test:unit -- <tên>`) | timeout mặc định 5 giây — chạm ngưỡng là có vấn đề thật |
| `smoke` | `tests/**/*.smoke.test.{ts,tsx}` — dựng CẢ cây app / cả trang | `npm run test:smoke` | 30 giây (thời gian chủ yếu là nạp hàng trăm module) |

`npm test` chạy cả hai (nằm trong `npm run check`). Cấu hình ở `test.projects` của `vite.config.ts`; test cố định
chế độ demo (`test.env`), CSS chỉ nạp cho `*.css?raw` (bài kiểm CSS cần nội dung thật). Coverage
(`npm run test:coverage`) có ngưỡng chỉ cho `src/core/**` và `src/domains/session/**`.

---

## 2. Cây `tests/` — phản chiếu `src/`

```
tests/
├── setup.ts          setup toàn cục: jest-dom, mock matchMedia / ResizeObserver / IntersectionObserver, cleanup
├── helpers/          tiện ích dùng chung cho test (§4) — import `@tests/helpers/<file>`
├── policy/           TEST LUẬT — đọc mã nguồn / tài liệu, giữ luật của docs/rules (§5)
│   └── <nhóm rule>/  cùng tên nhóm với docs/rules: foundations/ · structure/ · data/ · styling/ · display/
├── app/              ↔ src/app (router/ có guards/ · sync/ như src)
├── core/             ↔ src/core
├── domains/          ↔ src/domains
├── features/<f>/     ↔ src/features/<f>
└── shared/           ↔ src/shared: charts/ · hooks/ · utils/ (theo họ) · widgets/ · ui/
    └── ui/           hành vi theo cặp nhóm UI kit (form/ · data-display/ · selects-pickers/ · overlays-navigation/ ·
                      surfaces-media/ · actions-inputs · display-basics) + render/ (bộ "render nông mà rộng", §4)
```

- Test HÀNH VI đặt ở folder phản chiếu đúng file nguồn nó kiểm (`src/shared/utils/style/color-mix.utils.ts` →
  `tests/shared/utils/style/color-mix.utils.test.ts`). Test LUẬT (đọc nhiều file để giữ một quy ước) vào `policy/`.
- Máy giữ (`policy/foundations/tests-layout`): mọi test nằm dưới `tests/{policy,app,core,domains,features,shared,helpers}/`;
  hai cấp đầu của test hành vi trùng một folder có thật trong `src/`; file không phải test chỉ ở `helpers/` (và
  `setup.ts`); mỗi folder ≤ 8 mục như `src/`. Giới hạn số dòng file KHÔNG áp cho `tests/`.

---

## 3. Đặt tên

| Thứ | Quy ước | Ví dụ |
|---|---|---|
| File test của một file nguồn | tên file nguồn + `.test.ts(x)` | `format.utils.test.ts`, `dock-settings.store.test.ts` |
| File test của hook | kebab-case của tên hook | `use-latest-request.test.tsx` |
| File test theo chủ đề / màn | `kebab-case` mô tả chủ đề | `session-lifecycle.test.ts`, `auth-pages.test.tsx` |
| Smoke | `*.smoke.test.tsx` | `app-boot.smoke.test.tsx` |
| `describe` / `it` | tiếng Việt, nói HÀNH VI mong đợi ("nên làm gì khi nào"), không `it works` | `it('lượt về sau không ghi đè lượt mới hơn')` |
| Test luật | tên theo luật nó giữ; khối JSDoc đầu file trỏ rule (`docs/rules/<nhóm>/<file>.md §…`) và nói VÌ SAO cần máy giữ | `policy/foundations/file-size.test.ts` |

Thông báo lỗi của `expect` trong test luật nói LUẬT là gì + sửa thế nào + đường dẫn rule (`quality-gates.md §6`).

---

## 4. Helper (`tests/helpers/`)

| File | Dùng khi |
|---|---|
| `http-mock.ts` — `mockHttp(handler)`, `bearerOf(config)` | Test có gọi API: thay `adapter` của axios nên interceptor, hàm API và React Query THẬT vẫn chạy. KHÔNG `vi.mock('@/core/http')` |
| `deferred.ts` — `createDeferred()`, `createGate()` | Dựng đúng THỨ TỰ về của các request (A gọi trước, về sau B) mà không ngủ thật — hợp đồng của `async-safety.md` |
| `render.tsx` — `renderInRouter(ui)`, `renderInForm(ui)` | Component cần data router (`useBlocker`, `<Link>`) hoặc cần nằm trong `<Form>` thật |
| `render-suite.tsx` — `describeRenderSuite`, `RENDER_SUITES` | Bộ "render nông mà rộng" của UI kit (`tests/shared/ui/render/<bộ>.test.tsx`): mỗi component công khai một lượt render tối thiểu; thêm component vào barrel mà quên ca là đỏ |
| `ui-kit-exports.ts` | Danh sách export của UI kit đọc từ chuỗi barrel — nguồn duy nhất cho mọi test cần "mọi component" |
| `source-files.ts` — `SOURCE_CODE`, `SOURCE_CSS`, `HANDWRITTEN_CODE`, `DOC_FILES`, `lineCount`… | Nội dung file của repo dạng chuỗi cho test luật (đọc bằng `import.meta.glob`, KHÔNG `fs` — `tsconfig.app` không nạp type Node) |
| `doc-blocks.ts` | Đọc khối tài liệu component bằng TypeScript compiler API (kiểu props thật) |

Đổi `appConfig` (vd bật kiểm đăng nhập): `vi.mock('@/core/config', …)` như `tests/app/router/guards/guards.test.tsx`.

---

## 5. Test luật (`tests/policy/**`)

Một luật chỉ nằm trong tài liệu là một luật sẽ bị quên. Luật đo được bằng máy → thêm test ở `tests/policy/<nhóm>/`,
cùng nhóm với rule nó giữ, rồi thêm một dòng vào bảng dưới.

| Test | Giữ luật |
|---|---|
| `foundations/file-size` | Giới hạn dòng — `folder-structure.md §1` |
| `foundations/naming` | Tên file theo vai trò: `PascalCase.tsx` = default export, `useXxx.ts`, `kebab-case.<vai>.ts` hoặc `kebab-case.ts` = kebab của MỘT export trong file, `utils/` → `*.utils.ts`, zustand → `*.store.ts`, `createContext` → `*.context.ts` — `folder-structure.md §4` |
| `foundations/folder-structure` | ≤ 8 mục / folder; folder vai trò; `index.ts` (UI kit bắt buộc · feature chỉ ở gốc); độ lồng UI kit — `folder-structure.md`, `feature-structure.md` |
| `foundations/ui-kit-docs` | Khối tài liệu sát trên component, `@param props.*` khớp props thật, có `@example` — `comment-policy.md §1`, `component-structure.md §4` |
| `foundations/docs-blocks` | Như `ui-kit-docs` cho component công khai của `shared/widgets` · `shared/charts`; component `app` / `features` có khối sát khai báo + `@param` — `comment-policy.md §1` |
| `foundations/docs-links` | Link `.md`, đường `@/…` / `src/…` / `tests/…` trong docs tồn tại; lệnh nguy hiểm (`tsc --noEmit` thiếu `-b`, `generate:icons`) phải có ⛔; không còn tên cũ của bộ UI — `documentation-management.md` |
| `foundations/tests-layout` | Cây `tests/` phản chiếu `src/`, ≤ 8 mục / folder (§2) |
| `structure/ui-kit-props-types` | Component công khai xuất kèm `XxxProps` — `ui-kit-architecture.md §1` |
| `structure/widgets` | Khuôn widget: không barrel gốc, có `*.theme.ts`, không import chéo widget — `widget-composition.md §9–§10` |
| `data/persist-stores` | Store `persist`: hằng `XXX_STORAGE = { key, version }`, `createSafeJSONStorage()`, `sanitize…` ở cả `migrate` lẫn `merge`, có `partialize` — `state-management.md` |
| `styling/color-tokens` | Class màu trỏ tới token có thật; token nào cũng có nơi dùng — `color-system.md` |
| `styling/font-tokens` | Chữ chỉ qua `text-{scale}-{weight}` (TV phóng đúng) — `font-system.md` |
| `styling/interactive-state` | Không `transition-[transform]` với `translate/rotate/scale` (Tailwind 4); hover của Callout ✕ · SegmentToggle · tiêu đề cột sắp xếp · FormSection không quay lại xám — `interactive-state.md` |
| `styling/spacing-policy` | Thang khoảng cách, chủ sở hữu mép, số trong rule khớp code — `spacing-system.md` |
| `styling/css-structure` | `globals.css` chỉ là entry, thanh cuộn, độ nét chữ, autofill — `css-architecture.md`, `scrollbar.md` |
| `display/responsive-foundation` | Nền responsive: `phone:` khai dạng khối + `@slot`, `wide` 1800 / `3xl` 1920, bản JS (`media-query.constants.ts`) khớp CSS, bảng thiết bị rơi đúng bậc + đúng `phone:`, viewport không khoá phóng to, `:hover` tay bọc `(hover: hover)`, không `h-screen` — `ipad-responsive.md`, `responsive-screens.md §1–§2` |
| `display/responsive-docs` | `responsive-screens.md` có thật + `docs/README.md` trỏ tới; mốc `wide` và điều kiện `phone:` trong tài liệu khớp CSS; mọi biến thể ở `variants.css` có trong bảng §2.2 — `documentation-management.md §3` |

Test giữ luật nhưng nằm cạnh vùng nó kiểm: `features/demo/demo-coverage` (mọi export UI kit có trên `/demo`) ·
`features/demo/demo-sections-wired` (section nối vào `DEMO_SECTIONS`, một trục phân loại) · `app/router/app-routes`
+ `app/router/validate-modules` (route ↔ `PATHS` ↔ registry) · `shared/ui/render/*` (mọi component công khai render
được; `suites.test.ts` buộc mỗi nhóm UI kit thuộc đúng một bộ render).

---

## 6. Checklist khi viết test

- [ ] Đúng folder phản chiếu (§2), đúng tên (§3); `describe` / `it` tiếng Việt nói hành vi
- [ ] Gọi API qua `mockHttp`; thứ tự bất đồng bộ qua `createDeferred` / `createGate` — không `setTimeout` ngủ thật
- [ ] Query theo role / label; ô tìm kiếm IME mô phỏng `compositionStart` / `compositionEnd` (skill `web-testing`)
- [ ] Bug đã sửa có regression test đỏ khi bỏ bản sửa
- [ ] Đổi giao diện → đã chụp ma trận viewport (§7), không chỉ chạy Vitest
- [ ] `npm run check` xanh (`quality-gates.md`)

---

## 7. Kiểm bằng viewport — trình duyệt thật, ngoài Vitest

Vitest chạy trên jsdom: KHÔNG có bố cục thật (không đo được tràn ngang, chồng lấn, vùng chạm, `dvh`, safe-area) và
`matchMedia` bị mock ở `tests/setup.ts`. Bài kiểm luật khoá cấu hình + tài liệu (`display/responsive-*` ở §5) nhưng không
khoá bố cục — bố cục kiểm bằng ảnh chụp từ trình duyệt thật (Playwright chạy ngoài repo — `known-issues.md`).

| Khi nào | Bắt buộc chụp |
|---|---|
| Mọi thay đổi UI hiển thị | Ma trận tối thiểu: 360×800 · 390×844 · 844×390 · 768×1024 · 1024×768 · 1280×720 · 1440×900 · 1920×1080 |
| Đụng vỏ ứng dụng, lớp nổi, bảng, form, chart, khoảng cách | Toàn bộ 36 cỡ ở `responsive-screens.md §1`, sáng + tối |
| Sửa giá trị ở `xl` / `2xl` / `wide` hoặc token toàn cục | 1920×1080 trước / sau, so pixel = 0 |

Máy chạm phải giả lập `isMobile` + `hasTouch` (không thì `touch:` không khớp). Ma trận chi tiết, script đo (tràn ngang,
vùng chạm bằng `elementFromPoint`, so pixel) và checklist: **`responsive-screens.md §6`** — không chép lại ở đây.
Trang để chụp: `/demo/ghep` · `/demo/tong-quan` · `/demo` (chế độ demo, không cần đăng nhập — `architecture.md §13`).
