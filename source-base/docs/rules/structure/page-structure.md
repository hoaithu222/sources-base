# Page Structure — trang, layout, shell (`src/app` và `src/features/*/pages`)

> Trang chỉ **GHÉP**: lấy dữ liệu qua hook, lắp component UI kit, nối sự kiện. Mọi thứ khác
> có chỗ riêng. Bổ sung `component-structure.md` (thứ tự file, bảng class, comment) và
> `feature-structure.md` (folder của feature). Công thức bố cục trang (`PageShell` →
> `TitleScreen` → `Toolbar` → `PageBody`) và vì sao trang không tự đệm: `docs/architecture.md §3`.

---

## 1. Trang làm gì — và không làm gì

| Trang LÀM                                                                                                                                           | Trang KHÔNG làm → đặt ở                                                   |
| --------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| Ghép UI kit theo công thức bố cục                                                                                                                   | Gõ tay lề / đệm / `min-h-dvh` ngoài khung → `PageShell`, `AppShellLayout` |
| Gọi hook dữ liệu / form / store (`useXxx`)                                                                                                          | Gọi API, `useEffect` fetch → `service/*.queries.ts`                       |
| Nối handler bằng `useCallback`                                                                                                                      | Logic nghiệp vụ, biến đổi dữ liệu → `hooks/`, `utils/`                    |
| Trạng thái loading / lỗi / rỗng bằng UI kit (`Spinner`, `Callout`, `EmptyState`)                                                                    | Schema Zod, hằng dài, cột bảng → `schemas/`, `constants/`, `columns.tsx`  |
| Một route = một file `XxxPage.tsx`, `export default`, lazy-load qua `lazyPage()` (trừ trang dự phòng 403 / 404: nạp sẵn để hiện được khi mạng hỏng) | Hai trang trong một file; trang khai route ở chỗ khác ngoài registry      |
|                                                                                                                                                     | `<button>/<input>/<table>` thô, hex màu, `text-sm` → UI kit + token       |

---

## 2. Thứ tự trong file trang (cố định)

| #   | Mục                             | Ghi chú                                                                                                                                                                                                                                                                                                         |
| --- | ------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Imports                         | thứ tự theo `code-style.md`                                                                                                                                                                                                                                                                                     |
| 2   | Types / Props                   | trang do router dựng không nhận prop; chỉ có `interface` của phần con nội bộ (mục 4). KHÔNG JSDoc trên từng dòng của `XxxProps`                                                                                                                                                                                 |
| 3   | Hằng của riêng trang            | theo `clean-code-standards.md §2` (`SCREAMING_SNAKE_CASE`, chỉ file này dùng, ~≤ 10 dòng; dài / dùng ≥ 2 file → `constants/`). Object style / mảng tĩnh PHẢI hoist ở đây, không dựng lại mỗi render                                                                                                             |
| 4   | Phần con nội bộ                 | khối / hàng JSX lặp ≥ 2 lần trong file → phần con `memo` đặt NGAY TRÊN trang (điều kiện: `clean-code-standards.md §1`). Lặp ở ≥ 2 file → `components/` (ở `src/app/pages`: folder nhóm trang, vd `pages/status/StatusPage.tsx`). Mỗi phần con có khối tài liệu riêng sát khai báo của nó                        |
| 5   | Khối tài liệu + component trang | khối tài liệu SÁT ngay trên dòng khai báo (không dòng trống ở giữa, `comment-policy.md §1`): dòng đầu `Tên — mô tả`, thêm điều không hiển nhiên về route / quyền / dữ liệu; `@param props.<tên>` cho từng prop nếu có (trang do router dựng thì không có); KHÔNG bắt `@example`. Thân component theo luồng ở §3 |
| 6   | Export                          | `export default Xxx`                                                                                                                                                                                                                                                                                            |

Mục nào không có thì bỏ, KHÔNG đảo thứ tự các mục còn lại.

---

## 3. Luồng trong component trang

Từ trên xuống, không đảo:

1. Hook route / URL (`useParams`, `useNavigate`, `useQueryParams`)
2. Hook dữ liệu (`useXxxQuery`, `useXxxMutation`), hook form (`useZodForm`), store
3. Giá trị dẫn xuất (`useMemo` chỉ khi đo được cần)
4. Handler (`useCallback`)
5. Early return trạng thái đặc biệt: loading → lỗi → rỗng
6. JSX

- JSX chỉ **mô tả**: `.map` dài > 10 dòng, ternary lồng, IIFE → tách phần con hoặc biến.
- Hàng cấu hình giống nhau (nhãn + mô tả + control) → một phần con `SettingRow`, KHÔNG chép
  ba lần.
- Chuỗi class > một dòng hoặc dùng lại → hằng / bảng `*_CLASSES` + `cn()` (`component-structure.md §2`).
- Điều hướng có URL đích là `<Link>` (`navigable-controls.md`); tìm kiếm dùng
  `useImeSafeSearchInput` (`ime-safe-input.md`).

---

## 3b. Tầng tên của trang — đã có `PageHeader` thì không `TitleScreen`

Một trang chỉ có MỘT tầng tên. Hai kiểu, chọn một:

| Trang                                                                          | Tầng tên                                                                         | Hành động của trang                                                                                       |
| ------------------------------------------------------------------------------ | -------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| Có `<PageHeader>` (tên dự án / phân hệ + dòng phụ + tab nằm trên thanh header) | CHỈ bảng tên của header. **KHÔNG** dựng `<TitleScreen>` — nó lặp lại đúng tên đó | Cùng hàng với dải thẻ KPI, ở cuối hàng, **căn giữa theo chiều dọc** (`KpiActionRow`, dựng trên `Toolbar`) |
| Không có `PageHeader` (trang đứng riêng, vd 403 / hồ sơ)                       | `<TitleScreen>`                                                                  | Slot `actions` của `TitleScreen`                                                                          |

- Tên màn hình (vd "Tổng quan dự án") đi vào `subtitle` của `PageHeader`, không thành một hàng riêng. Bảng tên render `<h1>`
  — trang vẫn có heading cấp 1 cho trình đọc màn hình.
- Trang không có dải KPI: hành động đặt ở `Toolbar` ngay đầu thân trang (`right` = hành động), cũng căn giữa dọc.
- Hành động của trang = xuất, thêm, đổi khoảng thời gian, làm mới, nhãn "Cập nhật lúc…". Bộ lọc của MỘT panel nằm ở
  header panel đó, không kéo lên hàng này.
- Hẹp (điện thoại): cụm hành động rớt xuống hàng riêng, canh phải — không bóp dải KPI.
- Máy kiểm: `tests/policy/structure/page-title-layer.test.ts` — file ngoài kit chứa cả `<PageHeader` lẫn `<TitleScreen`
  là lỗi.

---

## 4. Layout, shell, provider (`src/app`)

| Loại                            | Việc của nó                                                                 | KHÔNG làm                                                              |
| ------------------------------- | --------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| **Layout** (`layouts/`)         | Dựng khung quanh `<Outlet />`; cấp lề / nền MỘT lần                         | Nghiệp vụ, dữ liệu, quyền                                              |
| **Shell** (`shell/`)            | Nối widget (Header, Dock, bảng lệnh) với registry route                     | Danh sách path / tên thứ hai ngoài registry (`routing-conventions.md`) |
| **Provider** (`providers/`)     | Dựng context toàn cục, mount phần tử gắn một lần (toast, đồng bộ giao diện) | Render nội dung trang                                                  |
| **Trang dùng chung** (`pages/`) | Trang tĩnh: chủ, hồ sơ, cài đặt, giữ chỗ phân hệ, 403, 404, mất kết nối     | Trang nghiệp vụ → `features/{f}/pages/`                                |

- Hai trang trở lên cùng khung toàn màn (403, 404, mất kết nối…) → MỘT khung dùng chung
  (`StatusPage`), mỗi trang chỉ truyền nội dung; các trang cùng khung gom vào một folder
  nhóm (`pages/status/`).
- Layout / shell / provider theo `component-structure.md` §1–§5 (khối tài liệu, class
  thành hằng khi dài, luồng code); không cần bảng `skin × variant` nếu không có trục. Layout
  nhiều vùng gom class vào MỘT bảng `XXX_SLOT_CLASSES` khoá theo tên vùng (`AuthLayout`,
  `AppShellLayout`); phần con có trục (vd `level`) dùng `XXX_{TRỤC}_CLASSES`.
- CSS riêng của một layout (nền, gradient, mask — Tailwind không diễn đạt được) đặt CẠNH
  file layout và do chính layout import (`layouts/app-shell-layout.css`, `layouts/auth-layout.css`)
  — `css-architecture.md` §"Thêm CSS mới". Ngoại lệ có chủ đích: `pages/status/StatusPage.tsx` cũng
  import `@/app/layouts/app-shell-layout.css` để có nền `.app-background` khi render ngoài
  `AppShellLayout` (403 / 404 / mất phiên).

---

## 5. Folder

```
src/app/
├── components/     # màn dùng chung không phụ thuộc router: LoadingScreen · ErrorScreen · ErrorBoundary (import qua @/app/components)
├── pages/          # trang tĩnh; các trang cùng khung là folder nhóm riêng (pages/status/)
├── layouts/        # RootLayout · AppShellLayout · AuthLayout (+ CSS cạnh layout) + nhóm con theo layout (auth/)
├── shell/          # AppHeader · AppDock · AppCommandPalette
├── providers/      # AppProvider · AppOverlays · …
├── router/         # xem routing-conventions.md
└── …
src/features/{f}/pages/   # trang nghiệp vụ — cấu trúc feature: feature-structure.md
```

Mỗi folder ≤ 8 mục (`folder-structure.md`). Trang nghiệp vụ lớn có nhiều file đi kèm thì
thành tính năng con (`features/{f}/{con}/pages|components|hooks`).

---

## 6. Checklist khi viết / sửa trang

- [ ] Một route = một file, `export default`, lazy-load
- [ ] Đúng thứ tự §2; khối tài liệu sát khai báo trang (và từng phần con); không comment nào khác (`comment-policy.md`)
- [ ] Không gọi API / `useEffect` fetch / logic nghiệp vụ trong trang
- [ ] Không tự thêm lề; không raw HTML control; không hex, không `text-sm`
- [ ] Khối JSX lặp ≥ 2 lần đã thành phần con; object style tĩnh đã hoist
- [ ] Trạng thái loading / lỗi / rỗng dùng UI kit
- [ ] Trang đứng riêng (KHÔNG có `PageHeader`) có hàng tiêu đề màu (`TitleScreen`); trang CÓ `PageHeader` thì không `TitleScreen` và hành động nằm cùng hàng dải KPI, căn giữa (§3b)
- [ ] Mỗi khối có `SectionHeader accent` và thân có viền thấy được — công thức ở `color-usage-guide.md` §15
- [ ] `npm run check` xanh (`quality-gates.md`)

---

## 7. Cross-references

`component-structure.md` · `comment-policy.md` · `feature-structure.md` ·
`routing-conventions.md` · `folder-structure.md` · `reuse-first.md` · `visual-hierarchy.md`
