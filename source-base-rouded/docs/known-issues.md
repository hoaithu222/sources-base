# Known issues — việc còn treo

> Trạng thái: **mở** = lỗi rõ, cứ sửa · **cần chủ repo quyết** = có đánh đổi, chọn hướng rồi mới sửa.
> Đường dẫn không có tiền tố tính từ `src/`. Xử lý xong (sửa, hoặc chủ repo quyết giữ nguyên) thì XOÁ dòng — ghi
> quyết định vào commit, không ghi lịch sử ở đây. Kết quả đọc code + test jsdom, chưa kiểm trên trình duyệt thật.
> Rà với code gần nhất: 2026-10-17 (chuyển sang bản sáng mặc định).

## A. Lỗi hành vi

| Chỗ | Hiện tượng | Trạng thái |
|---|---|---|
| `features/auth/pages/ResetPasswordPage.tsx` | `defaultValues.token` chỉ đọc lúc mount; đổi `?token=` khi trang còn mount thì form gửi token cũ. | mở |
| `app/layouts/AuthLayout.tsx` · `app/layouts/auth/AuthBrandPanel.tsx` | Dưới `lg` khoang thương hiệu đệm `p-6` còn khoang form đệm `p-8`. | cần chủ repo quyết |

## B. Truy cập (a11y)

| Chỗ | Hiện tượng | Trạng thái |
|---|---|---|
| `features/auth/components/AuthPageHeading.tsx` | Trang xác thực chỉ có `<h3>` (`Heading size="medium"`), layout auth không có `h1` / `h2` → nhảy cấp heading. | mở |

## C. Bất đồng bộ / phiên / lưu trữ

Đối chiếu `docs/rules/data/async-safety.md`.

| Chỗ | Hiện tượng | Trạng thái |
|---|---|---|
| `shared/hooks/state/useDeleteWithConfirm.ts` | `confirm()` không chặn bấm lặp (bấm đúp → `onConfirm` hai lần), `setIsDeleting` trong `finally` chạy cả sau unmount, rejection nổi lên caller. | mở |
| `shared/hooks/dom/useCopyToClipboard.ts` | Timer đặt SAU `await`: copy xong sau unmount thì rò timer + `setCopied`; hai lần copy chồng nhau làm "đã chép" tắt sớm. | mở |
| `shared/widgets/progress-center/upload-queue/upload-queue.store.ts` | `clear()` không huỷ lượt đang chạy nên lô `enqueue` sau phải chờ nó (chờ mãi nếu handler không settle) — đúng như tài liệu, UI chỉ cho `clear` khi rảnh. | cần chủ repo quyết |
| `shared/hooks/browser/useMultiTabSync.ts` | Tin từ `BroadcastChannel` (`e.data`) và `JSON.parse(e.newValue)` đẩy thẳng vào handler, không kiểm hình dạng. | cần chủ repo quyết |
| `shared/ui/form/hooks/useFormDraft.ts` | Nháp khôi phục chỉ kiểm phong bì + lọc `fields`; KIỂU từng giá trị chỉ được kiểm khi caller truyền `validate`. | cần chủ repo quyết |
| `shared/hooks/url/useQueryParams.ts` | `setPage(-3)` ghi nguyên `?page=-3` lên URL (chỉ kẹp khi đọc, đọc lại ra 1). | mở |

## D. Tài liệu / test lệch code

| Chỗ | Hiện tượng | Trạng thái |
|---|---|---|
| `tests/shared/ui/form/form-draft.test.tsx` | `vi.spyOn(localStorage, 'setItem')` / `'getItem'` không chặn được `Storage` thật của jsdom (cần `Storage.prototype`) nên test quota / đọc bị chặn đang vô hiệu. | mở |
| `tests/setup.ts` | Comment "jsdom … KHÔNG có `setItem`" đã sai — `localStorage` của jsdom trong Vitest có đủ `setItem`. | mở |
| `tests/policy/styling/font-tokens.test.ts` | Comment nói nhãn `subtle` của `SegmentToggle` "kế thừa cỡ chữ từ cha", thực tế nhãn `subtle` có cỡ riêng (`SEGMENT_TOGGLE_LABEL_VARIANT_CLASSES` trong `segment-toggle.theme.ts`). | mở |
| `docs/rules/display/chart-conventions.md` | Quy ước vẫn là `margin.left = -20` (cắt tick trục Y ≥ 3 chữ số khi `yAxisWidth` 36–42), trong khi chart demo đã dùng `left: 0`. | mở |
| `docs/rules/display/ipad-responsive.md §4.3` · `features/demo/dashboard/` | Rule khuyên dải KPI dùng `<BoxGrid min>`, demo (`DASHBOARD_KPI_STRIP_CLASSES`) và `chart-conventions.md §5.3` tự khai `grid-cols-*` theo breakpoint — chọn một cách. | cần chủ repo quyết |
| `docs/rules/interaction/interaction-ux.md §3.1` · `docs/rules/data/security-checklist.md` | Rule đòi ConfirmDialog autofocus nút Huỷ; thực tế focus rơi vào nút ✕ (phần tử đầu khi `showClose` mặc định) — sửa rule hay thêm `onOpenAutoFocus`. | cần chủ repo quyết |
| `features/demo/library/sections/surfaces-layout/LayoutHeadersSection.tsx` | Truyền `summary={<div>}` trái hướng dẫn "slot nhận Fragment" của `TitleScreen`. | mở |
| `features/demo/library/sections/media/MediaSection.tsx` | Ghi chú hiển thị đã sai (recipe `rounded` "RỖNG" — `Image` đã bo theo `IMAGE_ROUNDED_CLASSES`) và còn chữ "xem báo cáo". | mở |

## E. Cấu hình · build · công cụ

| Chỗ | Hiện tượng | Trạng thái |
|---|---|---|
| `scripts/generate-icons.mjs` | ⛔ KHÔNG chạy `generate:icons`: generator lệch registry đã commit (`assets/icons/index.tsx` 7534 dòng + `shared/ui/icons/index.ts`) và sẽ ghi đè cả hai — sinh lại + commit rồi mới thêm bước CI "generate rồi `git diff --exit-code`". | cần chủ repo quyết |
| `shared/ui/icons/Icons.tsx` | Registry 377 icon nằm trọn trong tải ban đầu (~57 kB gzip) vì `<SystemIcon>` tra theo `name` lúc chạy; registry dạng dữ liệu chỉ bớt ~5 kB, muốn bớt thật phải SVG sprite tải riêng (kiểm trên trình duyệt thật). | cần chủ repo quyết |
| `public/manifest.webmanifest` | Chưa có icon PWA (`icons: []`, chưa có thư mục icon) nên iOS lấy ảnh chụp màn hình làm biểu tượng — `docs/rules/display/ipad-responsive.md §9`. | mở |
| `package.json` | Chưa có Playwright (chỉ Vitest + jsdom); chụp UI headless bằng `--screenshot` + `--virtual-time-budget` dừng giữa hoạt ảnh, phải dùng CDP `Page.captureScreenshot` sau khi chờ thật. Hệ quả: ma trận viewport của `docs/rules/display/responsive-screens.md §6` chạy TAY bằng Playwright cài ngoài repo, không có cổng máy nào chặn tràn ngang / vùng chạm khi `npm run check` xanh — thêm Playwright + script (vd `check:responsive`) vào CI không. | cần chủ repo quyết |
| `docs/rules/display/responsive-screens.md §6` | Ma trận viewport mới chạy trên giả lập (Chromium / WebKit của Playwright, `isMobile` + `hasTouch`), chưa kiểm trên thiết bị thật: `dvh` và thanh công cụ co giãn của Safari iOS, safe-area / tai thỏ, kéo-để-đóng của sheet, tooltip chart bằng ngón tay, bàn phím ảo che ô nhập. | mở |
| `styles/theme/variants.css` (`phone:`) | Mốc `phone:` = 768px nên iPad mini dọc (744×1133) và mọi cửa sổ iPad Split View / Slide Over hẹp hơn 768 nhận bố cục ĐIỆN THOẠI (top bar + thanh tab đáy, sheet) dù là máy tablet — giữ (một mốc, dễ nhớ) hay hạ xuống 640 / thêm vế `pointer` để iPad mini giữ bố cục tablet. | cần chủ repo quyết |
| `index.html` | Tên app ghi cứng "Base App" (`<title>`, `description`, `apple-mobile-web-app-title`) thay vì `%VITE_APP_NAME%`. | cần chủ repo quyết |
| `main.tsx` | Đã bật `<StrictMode>` (effect chạy hai lần ở dev); hành vi lạ chỉ ở dev thì nghi effect thiếu cleanup trước. | cần chủ repo quyết |
| `app/router/modules/demo.routes.ts` | Path `ghep` (màn "Ghép thực tế") khó đoán nghĩa — có đổi không. | cần chủ repo quyết |
| `shared/widgets/` | 11 file dùng `<button>` trần (CommandPaletteTrigger, palette-row, Dock, dock-option-tile, dock-position-picker, dock-settings-button, Logo, ModuleSwitcher, module-nav-group, nav-element, UserMenuTrigger) thay vì `Button` của UI kit, đang giữ có lý do. | cần chủ repo quyết |
| `shared/widgets/command-palette/parts/palette-row.tsx` · `shared/widgets/dock/parts/dock-option-tile.tsx` | `memo` không có tác dụng: `onRun` / `onClick` / `trailing` tạo mới mỗi render. | cần chủ repo quyết |
| `scripts/check-bundle.mjs` (`initialCss`) | Tailwind sinh MỘT file CSS cho toàn app — class của trang demo lazy-load vẫn vào chung file đó nên tính vào "tải ban đầu". Ngân sách CSS vì vậy tăng đều (46 → 60 kB ở lần thêm trang Factory + OpsKit/HudRecipes; 60 → 64 kB ở lần thêm ảnh xem trước kiểu header; 64 → 68 kB sau đợt shell + UI kit mới, JS cũng 320 → 340 kB). Đo lần nâng 64 kB (gán class cho thư mục dùng nó): class CHỈ `features/demo` dùng ≈ 1.9 kB gzip, nên tách ngân sách demo KHÔNG giải quyết được. Khoản lớn thật: polyfill Tailwind (`@supports color-mix` + lớp `@property`) ≈ 7.8 kB, mà `@tailwindcss/vite` không cho tắt (khoản widget header ≈ 6.4 kB của 15 kiểu khung HUD đã mất khi header chỉ còn hai kiểu `brand` / `glass` — chưa đo lại). Câu hỏi: cứ nâng ngân sách theo từng lần, hay có cách khác. | cần chủ repo quyết |

## F. UI kit — cần quyết (API / hành vi)

| Chỗ | Hiện tượng | Trạng thái |
|---|---|---|
| `shared/ui/icons/Icons.tsx` | `SystemIcon` đặt cỡ + `display:block` bằng inline style nên class `size-*` / `h-*` / `hidden` vô tác dụng (Toast `size-5`, Stepper `size-full`… thực tế 16px); sửa gốc sẽ đổi hình nhiều nút. | cần chủ repo quyết |
| `shared/ui/feedback/Skeleton.tsx` | Mỗi khối là một `role="status"` — 10 khối thì trình đọc màn hình đọc 10 lần. | cần chủ repo quyết |
| `shared/ui/feedback/EmptyState.tsx` | Cấp heading đi theo `size` (h6 / h5 / h4), không có prop chọn cấp theo ngữ cảnh trang. | cần chủ repo quyết |
| `shared/ui/primitives/Divider.tsx` | Nhãn giữa (vd "hoặc") nằm trong `role="separator"` nên không được đọc. | cần chủ repo quyết |
| `shared/ui/primitives/Text.tsx` | Nhóm `primitives/` định nghĩa "không state, không hành vi" nhưng `Text` có state (đo tràn) và import `overlays/Tooltip` — sửa định nghĩa hay dời `Text`. | cần chủ repo quyết |
| `shared/ui/actions/segment-toggle/` | `size` chỉ ăn ở `pill` / `glass` / `wave` (cho 6 variant còn lại ăn sẽ đổi giao diện thanh công cụ của image-annotator); `role="group"` chưa có prop đặt tên. | cần chủ repo quyết |
| `shared/ui/actions/Menu.tsx` · `ContextMenu.tsx` | Có dời sang `overlays/` không; `Menu` chưa nhận `href` nên "Hồ sơ / Cài đặt" của menu người dùng là button + `navigate` (`app/shell/AppHeader.tsx`). | cần chủ repo quyết |
| `shared/ui/inputs/number-input/number-input.types.ts` | `NumberInputVariant` / `NumberInputBorder` lặp nguyên union `InputVariant` / `InputBorder` của `inputs/Input.tsx` (bảng class đã chung `FIELD_*` của `field.theme.ts`) — dùng chung một kiểu? | cần chủ repo quyết |
| `shared/ui/selects/dropdown-tree-select/` | Chế độ `single` chọn bằng bàn phím không có tác dụng (chưa nối `onSelect` của `Tree`, chỉ bắt click). | mở |
| `shared/ui/selects/multi-select/` · `dropdown-tree-select/` | Giữ từ khoá tìm sau khi đóng panel (`Dropdown` thì xoá). | cần chủ repo quyết |
| `shared/ui/pickers/date/date-time-picker/DateTimePicker.tsx` · `shared/ui/selects/dropdown-tree-select/` | Không nhận `id` / `aria-*` nên không nối được với nhãn ngoài. | mở |
| `shared/ui/pickers/time/TimePicker.tsx` · `pickers/date/date-time-picker/DateTimePicker.tsx` | `minuteStep={0}` làm crash (`Array.from` độ dài vô hạn); số âm cho cột Phút rỗng. | mở |
| `shared/ui/data-display/tree/Tree.tsx` | `onToggle` chỉ báo khi MỘT node đổi, không bắn khi mở / đóng hàng loạt — xác nhận đúng ý. | cần chủ repo quyết |
| `shared/ui/data-display/table/parts/header/render-header-cell.tsx` | Tay cầm giãn cột chỉ kéo bằng chuột / chạm, không dùng được bằng bàn phím. | cần chủ repo quyết |
| `shared/ui/data-display/table/utils/table.utils.ts` | Cột `frozen` đứng sau cột ghim thiếu `width` số thì mất ghim, chỉ có `console.warn` khi DEV. | cần chủ repo quyết |
| `shared/ui/navigation/scroll-edge-nav/scroll-snap.utils.ts` | `measureColumnStops` đọc `thead > tr` đầu nên bảng header 2 tầng nhảy theo nhóm cột thay vì từng cột. | mở |
| `shared/ui/data-display/boards/ScrollBoard.tsx` | Dựng bằng `div` grid, thiếu ngữ nghĩa bảng (`role="table"` / hàng / ô). | cần chủ repo quyết |
| `shared/ui/data-display/TrendBadge.tsx` | Thay đổi âm rất nhỏ (dưới ngưỡng phẳng) in ra "-0%". | mở |
| `shared/ui/data-display/boards/CapsuleChart.tsx` | `ticks={0}` → mốc trục `NaN` (chia cho 0). | mở |
| `shared/ui/overlays/dialog/confirm-dialog/ConfirmDialog.tsx` | Đang `loading` vẫn đóng được bằng Esc / bấm nền (nút và ✕ đã khoá). | cần chủ repo quyết |
| `shared/ui/overlays/dialog/Modal.tsx` | Nút Huỷ của footer mặc định chỉ gọi `onCancel`, không tự đóng (FormModal thì tự đóng). | cần chủ repo quyết |
| `shared/ui/overlays/dialog/FormModal.tsx` | Có `form` mà `onConfirm` treo thì nút xác nhận khoá cả sau khi đóng / mở lại, tới khi `form.reset()` (đọc `form.formState.isSubmitting`). | mở |
| `shared/ui/overlays/dialog/FormModal.tsx` · `Modal.tsx` | Hai thang `size` khác nhau (`md` = 800px ở FormModal, 520px ở Modal). | cần chủ repo quyết |
| `shared/ui/form/Form.tsx` · `shared/ui/overlays/dialog/FormModal.tsx` | Hai luồng submit riêng (khoá gửi đúp, bỏ kết quả muộn) — có gộp về một không. | cần chủ repo quyết |
| `shared/ui/form/fields/choice/AsyncSelectField.tsx` | Chỉ có bản gắn form — có tách `AsyncSelect` độc lập ra `selects/` không. | cần chủ repo quyết |
| `shared/ui/surfaces/cards/CardScreenshot.tsx` | `onClick` của cả thẻ chỉ bấm được bằng chuột. | cần chủ repo quyết |
| `shared/ui/surfaces/panels/Surface.tsx` | Kiểu props chỉ là của `<div>` (`as="a"` không có `href` về kiểu, không có `ref`). | cần chủ repo quyết |
| `shared/ui/surfaces/panels/BoxInfo.tsx` | Chữ % in thẳng `item.percent` nên dữ liệu `NaN` ra "NaN%" (thanh thì đã kẹp). | mở |
| `shared/ui/media/upload/Dropzone.tsx` | Thả lẫn thư mục + tệp lẻ thì `kind="folder"` và bỏ tệp lẻ. | cần chủ repo quyết |
| `shared/ui/media/image/lightbox/ImageLightbox.tsx` | Con lăn chuột luôn là zoom. | cần chủ repo quyết |
| `shared/ui/form/fields/text/MaskedField.tsx` · `PhoneField.tsx` | Ký tự hằng trong `format` bị bỏ khỏi giá trị: mẫu `+##…` mất dấu `+` nên không qua `phoneField()` E.164. | cần chủ repo quyết |
| `shared/ui/form/fields/FileField.tsx` | Danh sách tệp chỉ đọc lúc mount, không theo `form.reset()`. | cần chủ repo quyết |
| `shared/ui/form/layout/FormSection.tsx` | Thu gọn thì field bên trong bị gỡ khỏi DOM nên lỗi của chúng bị che. | cần chủ repo quyết |
| `shared/ui/form/fields/` | `form.setFocus` / focus ô lỗi chưa tới `DateField`, `TimeField`, `DateRangeField`, `FileField`, `CascadeSelectField` (chưa nối `field.ref`). | mở |
| `shared/ui/form/fields/password-strength/PasswordStrength.tsx` | Thang 3 mức: truyền hơn 3 điều kiện thì đạt 3 bất kỳ đã "mạnh". | cần chủ repo quyết |
| `shared/utils/format/format.utils.ts` · `shared/utils/format/money.utils.ts` | Ký hiệu tiền lệch: `formatCurrency` / `MaskedField` dùng "₫", `money.utils` / ví dụ của `NumberInput` dùng "đ". | cần chủ repo quyết |
| `shared/ui/inputs/field.theme.ts` | Ô nhập mặc định `text-body-14` (14px) nên iOS Safari tự phóng trang khi focus ô < 16px và không thu lại; chuẩn đích của `docs/rules/display/responsive-screens.md §3.1` là ≥ 16px ở `phone:` (đổi cỡ chữ ô nhập ở điện thoại sẽ đổi nhịp mọi form). | cần chủ repo quyết |
| `shared/ui/surfaces/hud/hud-frame/HudFrame.tsx` · `shared/ui/surfaces/cards/hud-kpi-card/HudKpiCard.tsx` · `PanelCard variant="hud"` · `features/demo/factory/` (sơ đồ xưởng 2.5D `FactoryScene`) | `HudFrame` / `HudKpiCard` / `PanelCard` biến thể `hud`, sơ đồ xưởng 2.5D (isometric) của màn demo Gia công: ở theme sáng dùng được nhưng vẫn mang dáng HUD trong các màn demo (sàn lưới nghiêng, ô viền sáng theo tone, khung kiểu màn điều hành) — ứng viên cho một lượt làm riêng theo `docs/rules/styling/light-theme.md`. | mở |
| `shared/ui/data-display/table/` | `Table` ở điện thoại chỉ cuộn ngang; chưa có dạng cards theo dòng (`responsive-screens.md §4.5`) cho bảng nhiều cột + nhiều hành động theo dòng — dựng ở feature hay thêm prop vào `Table`. | cần chủ repo quyết |

## G. Giới hạn thấy khi ghép màn (`/demo/tong-quan`)

| Chỗ | Hiện tượng | Trạng thái |
|---|---|---|
| `shared/charts/utils/chart-center-label.utils.ts` | `centerLabelFont` tính chiều cao chữ bằng cỡ chữ, bỏ qua `line-height` của token → nhãn phụ của donut đè vành ở cỡ chữ lớn. | mở |
| `shared/ui/surfaces/panels/BoxPanel.tsx` | `title` chuỗi render `<span>`, không phải heading (muốn heading phải truyền `<Text as="h2">`). | cần chủ repo quyết |
| `shared/widgets/header/page-header/index.ts` | Chỉ xuất `PageHeader`; kiểu `PageHeaderNavItem` / `PageHeaderNavAction` chưa đi qua barrel nên feature không khai kiểu được cho `nav`. | mở |
| `shared/ui/layout/BoxGrid.tsx` | Lưới `auto-fill` theo `min` nên không ghim được 6 cột ở 1366px (ra 5 + 1). | cần chủ repo quyết |
| `shared/ui/surfaces/cards/SummaryCard.tsx` | `description` chỉ là chuỗi một dòng, cắt `…`. | cần chủ repo quyết |
| `shared/ui/data-display/boards/ScrollBoard.tsx` | Cao cố định `rowCount × rowHeight` px, không lấp được ô co giãn. | cần chủ repo quyết |
| `features/demo/shared/charts/SCurveChart.tsx` · panel của `features/demo/dashboard/` | Chế độ TV ×1.3: nhãn trục Y "30%" chạm nhãn X "T3/26" ở góc dưới trái đường S; badge dạng viên có thể xuống 2 dòng ở panel hẹp (1366px). | mở |
| `features/demo/shared/charts/BarCompareChart.tsx` | Panel "Kế hoạch & thực hiện" của `/demo/xuong` (24 cột trong ~560px): nhãn số của hai series sát nhau, đọc khó ở cột thấp. | mở |
