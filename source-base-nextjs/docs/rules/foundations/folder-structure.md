# Folder Structure — chia folder, đặt tên file, giới hạn đo được

> Mở một folder là thấy NGAY nó chứa gì: **≤ 8 mục, mỗi mục một ý.** Quá 8 thì gom theo chức năng, không để
> người đọc đếm từng file. File này là khung chung + những gì máy kiểm, và là **nguồn DUY NHẤT** của giới hạn
> số dòng và quy ước tên file. Chi tiết theo vùng: `component-structure.md §6` (UI kit) · `feature-structure.md`
> (feature, cây folder) · `widget-composition.md §9` (widget) · `server-client-boundary.md` (file nào `'use client'`).

---

## 1. Giới hạn đo được

| Hạng mục | Giới hạn | Máy giữ |
|---|---|---|
| Mục trong một folder (file `.ts/.tsx` + folder con có chứa `.ts/.tsx`, **không tính `index.ts`**; folder chỉ có CSS / JSON / asset không tính) | ≤ 8 | `folder-structure.test.ts` — toàn `src/` |
| Folder vai trò `hooks/ parts/ utils/ types/ shared/` (toàn `src`, trừ folder mối quan tâm của feature) | ≥ 2 mục; `hooks/` chỉ có `useXxx` | cùng test — toàn `src` |
| Folder nhóm / component của UI kit | có `index.ts` | cùng test — `src/shared/ui` |
| Độ lồng trong `src/shared/ui` | ≤ 5 cấp | cùng test |
| **Số dòng file** — `app/ core/ domains/ features/` + `shared/` ngoài UI kit (`hooks/ utils/ widgets/ charts/ constants/`) | `.tsx` ≤ 200 · `.ts` ≤ 250 (đếm như `wc -l`) | `file-size.test.ts` |
| **Số dòng file** — `shared/ui` | ≤ 300 dòng CODE (khối JSDoc không tính); mục tiêu ≤ 250 | `file-size.test.ts` |

File sinh tự động không tính (`*.generated.*`, `generated-*`, registry icon / ảnh). Đây là nguồn DUY NHẤT của các con số
trên — rule / skill khác chỉ trỏ về đây.

Ngoại lệ chỉ nằm trong `OVERSIZE_ALLOWED` của test, mỗi dòng có lý do; hết lý do thì test bắt buộc xoá dòng đó. Ngoại lệ
có sẵn do **hệ thống file của Next**: gốc `src/app/` (các file đặc biệt `robots.ts` · `sitemap.ts` · `manifest.ts` ·
`global-error.tsx` · `global-not-found.tsx`, folder `[locale]/` · `api/`, và tám folder lắp ráp `_*`) không thể gom thêm — tên và vị
trí các file đó do Next quy định. `docs/`, `scripts/` không áp các giới hạn trên. `tests/` áp ≤ 8 mục / folder (test
`tests-layout`) nhưng không áp giới hạn dòng — cây `tests/`: `testing.md`.

Vượt giới hạn dòng thì tách theo thứ tự: khối JSX lặp → phần con · nhiều `useState` + `useEffect` → hook
`useXxx` · biến đổi dữ liệu → `*.utils.ts` · bảng class dài → `*.theme.ts` · kiểu dài → `*.types.ts`.

---

## 2. Thứ tự gom khi một folder quá 8 mục

Thử từ trên xuống, dừng ở bước đầu tiên làm folder về ≤ 8:

| # | Điều kiện | Làm |
|---|---|---|
| 1 | ≥ 2 file cùng phục vụ MỘT component / module | Folder riêng, `kebab-case` theo tên của nó (`table/`, `lightbox/`) |
| 2 | ≥ 2 file cùng vai trò trong một component | Folder vai trò: `hooks/` · `parts/` · `utils/` · `types/` · `shared/` |
| 3 | Nhiều thứ cùng họ chức năng | Nhóm con theo danh từ chức năng (`selects/`, `browser/`, `url/`) — KHÔNG `misc/ common/ other/ helpers/` |
| 4 | Không gom được mà có lý do thật | Thêm vào `OVERSIZE_ALLOWED` kèm lý do |

Không tạo folder cho **một** file; không tạo folder rỗng "cho đủ template". **Ngoại lệ:** folder mối quan
tâm của feature (`api/ service/ schemas/ utils/ constants/ types/`) được có 1 file — tên folder là nhãn "loại
việc" giúp mở feature là thấy ngay dữ liệu / luật kiểm nằm đâu (`features/auth/service/auth.queries.ts`); và
các folder lắp ráp `_xxx/` của `src/app` — mỗi folder là MỘT module của tầng `app` (kể cả `_seo/`, hiện chỉ có `page-metadata.ts`).

---

## 3. Bố cục theo vùng

| Vùng | Gom theo | Chi tiết |
|---|---|---|
| `shared/ui` | nhóm chức năng → component → vai trò | `component-structure.md §6`, `ui-kit-architecture.md §2` |
| `shared/widgets` | MỘT widget = MỘT folder (`header/`, `dock/`, `command-palette/`, `progress-center/`, `tab-bar/`, `work-tabs/`); trong widget: `index.ts` + `*.theme.ts` + component công khai + `parts/` (nội bộ) + nhóm con có `index.ts`; KHÔNG có barrel gốc | `widget-composition.md §9` |
| `shared/hooks` | họ hook: `state/ timing/ url/ dom/ browser/ input/ table/`; mỗi hook một file `useXxx.ts` (`export function`, có `'use client'`); mỗi họ có `index.ts`, import qua `@/shared/hooks` | `notes/code/hooks.md` |
| `shared/utils` | họ `format/ validation/ style/ browser/ url/`, file `*.utils.ts` (+ `style/cn.ts`); KHÔNG barrel — import THEO FILE | `notes/code/utils.md` |
| `shared/charts` | gốc: barrel + `useChartMetrics` · `ChartScaleProvider` · `ProgressDonutChart`; `constants/` · `utils/`; import qua `@/shared/charts` | `chart-conventions.md` |
| `shared/constants` | phẳng, mỗi nhóm hằng một file `*.constants.ts`, import theo file; không có `shared/types` (kiểu sống cạnh module sở hữu) | `notes/code/constants.md` |
| `features/{f}` | tính năng → mối quan tâm → tính năng con; màn hình của feature ở `views/` | `feature-structure.md` (cây folder) |
| `app` | **Route** do hệ thống file của Next: `[locale]/…` (`(public)/` · `(workspace)/(auth)/` · `(workspace)/(app)/`), `api/`, `robots.ts` · `sitemap.ts` · `manifest.ts` · `global-*.tsx`; `page.tsx` / `layout.tsx` MỎNG. **Lắp ráp** ở folder private `_providers/ _layouts/ _shell/ _views/ _navigation/ _guards/ _components/ _seo/` (Next bỏ qua `_` đầu tên khi định tuyến) | `page-structure.md`, `routing-conventions.md`, `docs/architecture.md §1` |
| `core` | một mối quan tâm = một folder: `config/ http/ query/ i18n/ seo/`. `core/seo` chỉ chạy ở server (`server-only`) | `notes/code/core.md` |
| `domains` | một miền = một folder | `notes/code/domains.md` |
| `messages` | `<locale>/<namespace>.json` + `index.ts` ghép có kiểu mỗi ngôn ngữ; `vi/` là NGUỒN. Đứng ngoài bốn tầng, không có logic | `rules/i18n/i18n.md`, `guides/i18n.md` |
| `proxy.ts` | MỘT file ở gốc `src/` (Next 16 yêu cầu cạnh `app/`); đứng ngoài tầng như `messages/` | `docs/architecture.md §3` |

---

## 4. Đặt tên file — theo vai trò

| Loại | Quy ước | Ví dụ |
|---|---|---|
| Folder | `kebab-case`, danh từ chức năng | `date-time-picker/`, `scroll-edge-nav/` |
| Folder route của Next | tên segment URL (`about/`), tham số `[locale]/`, nhóm `(public)/` — không đặt theo quy ước trên; folder private `_xxx/` chỉ ở `src/app` | `[locale]/(public)/about/`, `_views/` |
| File đặc biệt của Next | tên do Next quy định, chỉ ở `src/app/**`: `page.tsx` · `layout.tsx` · `loading.tsx` · `error.tsx` · `not-found.tsx` · `route.ts` · `opengraph-image.tsx` · `robots.ts` · `sitemap.ts` · `manifest.ts` — KHÔNG đổi tên | `about/page.tsx`, `api/health/route.ts` |
| Component / view | `PascalCase.tsx` = đúng tên export; 1 file = 1 component | `Table.tsx`, `LoginView.tsx`, `AboutView.tsx` |
| Phần con NỘI BỘ (`parts/`) | `kebab-case.tsx`, export tên khớp tên file | `parts/table-footer.tsx` → `TableFooter` |
| Hook | `useXxx.ts`, không JSX | `useClickOutside.ts` |
| File không phải component / hook | `kebab-case.<vai>.ts`, vai ∈ `utils · types · constants · theme · store · context · schema · api · queries · selectors · lifecycle · sync · config` | `table.types.ts`, `session.store.ts`, `auth.queries.ts`, `navigation.config.ts` |
| File làm MỘT việc, đặt theo export | `kebab-case.ts(x)` KHÔNG hậu tố vai, tên = kebab của MỘT export (giá trị hoặc kiểu) trong file — camelCase · PascalCase · `SCREAMING_SNAKE` đều quy về kebab. Không áp trong `parts/` và `utils/` | `create-query-client.ts` ↔ `createQueryClient`, `describe-error.ts` ↔ `describeError`, `app-error.ts` ↔ `AppError`, `public-routes.ts` ↔ `PUBLIC_ROUTES` |
| File trong `utils/` | luôn `*.utils.ts` | `utils/table-sort.utils.ts` |
| Store Zustand · `createContext` | `*.store.ts` · `*.context.ts` (chỉ context + provider; hook đọc ở `useXxx.ts`) | `toast.store.ts`, `form.context.ts` |
| Thông điệp dịch | `src/messages/<locale>/<namespace>.json`; namespace `camelCase` / có chấm cho UI kit (`ui.form.json`) | `messages/vi/auth.json`, `messages/vi/ui.dataDisplay.json` |
| Barrel | `index.ts`, chỉ `export … from` | — |

Tên file KHÔNG lặp tên folder cha không cần thiết (`table/Table.tsx` đúng; `table/table-table.tsx` sai). Tên định
danh trong code (component, hook, hằng, kiểu): `code-style.md`. Máy giữ: test `policy/foundations/naming`.

Chọn giữa hai dạng của file không phải component / hook: file gom NHIỀU hàm / hằng cùng một vai → hậu tố vai
(`build-menu.utils.ts`, `navigation.types.ts`); file chỉ để công bố MỘT thứ (một hàm, một class, một singleton) → tên
theo chính thứ đó, không cần hậu tố (`describe-error.ts` ↔ `describeError`). Không khớp dạng nào (vd `format.ts` export
`formatDate`) là sai — đổi tên file. Ngoại lệ có lý do (`app/_providers/bootstrap.ts`, `utils/style/cn.ts`) nằm trong
`NAMING_ALLOWED` của test.

---

## 5. Barrel (`index.ts`) và import public API — máy giữ: ESLint (`guard/barrel-only`, import sâu), test `policy/foundations/folder-structure`

- **Có `index.ts`:** mọi folder **nhóm** và **component** của UI kit; mỗi widget và nhóm con của widget; mỗi họ của
  `shared/hooks` (và `shared/hooks/index.ts`); gốc mỗi domain; gốc feature KHI có nơi ngoài feature dùng; gốc mỗi module
  của `core/` (`@/core/http`, `@/core/i18n`, `@/core/seo`…); folder lắp ráp của `app/` mà nơi khác dùng (`@/app/_providers`,
  `@/app/_guards`, `@/app/_shell`, `@/app/_navigation`, `@/app/_components` — ESLint ép đi qua barrel; `_layouts/` cũng có `index.ts` nhưng
  không ép; `routing-conventions.md`).
- **KHÔNG có `index.ts`:** folder vai trò (`hooks/ parts/ utils/ types/ shared/`) bên trong một component / widget;
  folder mối quan tâm bên trong feature (`components/ views/ service/ …` — import thẳng file bằng đường tương
  đối); `shared/utils`; `app/_views/`, `app/_seo/` (thư mục lá — `page.tsx` ghép MỘT view nên import thẳng file:
  `@/app/_views/marketing/AboutView`). Riêng `form/hooks/` của UI kit là folder NHÓM (hook công khai của nhóm `form`) nên có `index.ts`.
- Barrel chỉ `export … from`. Nhóm UI kit viết `export * from './con'` cho folder con và từng dòng
  `export { default as X } from './X'` cho component phẳng (`ui-kit-architecture.md §8`).
- **Import từ ngoài vùng:** UI kit qua `@/shared/ui` · hook qua `@/shared/hooks` · widget qua
  `@/shared/widgets/<widget>` · util THEO FILE (`@/shared/utils/format/format.utils`) · domain / feature qua
  `index.ts` của nó (ESLint chặn import sâu) · core qua `@/core/<module>`. Core có điểm vào sâu có tên cho thứ không an toàn ở
  mọi nơi: `@/core/i18n/server` và `@/core/config/server-config` (chỉ server) và các file thuần mà `proxy.ts` / `next.config.ts` phải nạp
  ngoài đồ thị React (`@/core/i18n/locales`, `@/core/i18n/routing`, `@/core/i18n/messages`, `@/core/config/env.schema`). Trong cùng vùng import theo đường file, không
  chui vào `hooks/ parts/ utils/` của component khác.
- Barrel gốc của vùng không bị file bên trong chính vùng đó nạp lại (vòng import — `npm run check:cycles`).
- Barrel là nơi `'use client'` hay bị quên nhất: barrel KHÔNG có directive, nhưng từng file nó re-export thì có hoặc
  không theo `server-client-boundary.md` — đừng thêm directive vào barrel.

---

## 6. Chuyển file / đổi tên folder

1. `git mv` (giữ lịch sử); không sửa nội dung trong cùng lượt với di chuyển.
2. Sửa MỌI import trỏ tới đường cũ: alias `@/…`, đường tương đối, `import()` động, `vi.mock('…')`, và glob
   `import.meta.glob` trong `tests/`.
3. Tìm đường cũ còn sót trong `docs/`, `README.md`, `.claude/`, `eslint.config.js`, `next.config.ts`, `vitest.config.ts`,
   `knip.json`.
4. Cập nhật barrel của nhóm, rồi chạy `npm run check`.
5. Danh sách export công khai trước và sau phải giống nhau — di chuyển không được thêm hay mất API.
6. **Dời / đổi tên THƯ MỤC ROUTE là đổi URL**: cập nhật `PATHS`, `navigation.config.ts`, `public-routes.ts`, khoá
   `metadata.<trang>` ở `messages/*/metadata.json`, và thêm `redirects()` ở `next.config.ts` từ URL cũ sang URL mới (để giữ
   xếp hạng và link đã chia sẻ) — `git mv` thôi chưa đủ. Đổi tên thư mục `_xxx` / file view thì không đổi URL.

---

## 7. Checklist

- [ ] Không folder nào > 8 mục (hoặc có dòng trong `OVERSIZE_ALLOWED` kèm lý do)
- [ ] Folder vai trò có ≥ 2 mục; `hooks/` chỉ `useXxx`
- [ ] `index.ts` đúng chỗ theo §5; không có `misc/ common/ other/`
- [ ] Tên file theo vai trò (§4); một file một việc; trong giới hạn dòng (§1)
- [ ] File mới ở `src/app`: route là `page.tsx` mỏng, phần còn lại ở folder `_*` đúng vai (§3)
- [ ] Docs trỏ đường dẫn mới
- [ ] `npm run check` xanh (`quality-gates.md`)

---

## 8. Cross-references

`component-structure.md §6` · `feature-structure.md` · `widget-composition.md §9` · `page-structure.md` ·
`server-client-boundary.md` · `ui-kit-architecture.md` · `clean-code-standards.md` · `code-style.md` · `quality-gates.md`
