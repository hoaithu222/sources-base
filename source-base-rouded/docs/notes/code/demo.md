# Ghi chú code — demo (`src/features/demo/`)

> Lý do thiết kế KHÔNG hiển nhiên của `src/features/demo/` (thư viện `/demo` và các màn mẫu `/demo/ghep`,
> `/demo/tong-quan`, `/demo/nhap-lieu`, `/demo/xuong`), tách khỏi code theo `comment-policy.md §3`.
> Mỗi mục ≤ 6 gạch; chỉ ghi điều code không tự nói và rule chung chưa có. Cây folder: `feature-structure.md` (mục Feature mẫu).

## Một màn — các tên của nó

Path đã phát hành nên giữ nguyên; tra bảng này khi chỉ biết một trong các tên.

| Path              | Route id         | Tính năng con | Trang               | Nhãn menu / tab                                                     |
| ----------------- | ---------------- | ------------- | ------------------- | ------------------------------------------------------------------- |
| `/demo`           | `demo` (index)   | `library/`    | `DemoPage`          | phân hệ "Thư viện UI" · mục "Thành phần" · tab "Thư viện giao diện" |
| `/demo/ghep`      | `demo.composed`  | `composed/`   | `ComposedDemoPage`  | "Ghép thực tế"                                                      |
| `/demo/tong-quan` | `demo.dashboard` | `dashboard/`  | `DashboardDemoPage` | "Tổng quan dự án"                                                   |
| `/demo/nhap-lieu` | `demo.entry`     | `entry/`      | `EntryDemoPage`     | "Bảng nhập liệu"                                                    |
| `/demo/xuong`     | `demo.factory`   | `factory/`    | `FactoryDemoPage`   | "Điều hành xưởng"                                                   |

- **Link giữa các màn đi qua `DEMO_SCREEN_PATHS`** (`shared/constants/screens.constants.ts`): feature
  không import được `@/app` nên không gọi `getRoutePath`; `demo-sections-wired` so hằng này với router.

## DemoPage · sections.constants (mục lục)

- **`DEMO_SECTIONS` là nơi DUY NHẤT nối section vào trang**: `DemoPage` chỉ `map`, `DemoSideNav` dựng mục lục từ
  cùng mảng — thêm section = tạo file + một dòng. `id` = kebab(tên file bỏ `Section`), `group` = folder chứa file.
- **Import tĩnh, KHÔNG `lazy()` từng section**: lazy làm neo `#id` xuất hiện muộn và cao dần → mục lục nhảy tới
  khu vực cuối đáp sai. Không dùng `import.meta.glob`: knip / madge / "Go to definition" không thấy.
- **`PageBody` chứa HAI khối (mục lục + vùng cuộn thật là div bên trong)** — cột ở `lg`, dải trên đầu ở hẹp hơn —
  nên `overflow="hidden"` `stack={false}`; `flex` phải ghi tường minh vì `stack={false}` cố ý KHÔNG bật `display: flex`.

## Neo khu vực (`<section id>` trong DemoPage)

- **`content-visibility: auto`, KHÔNG hoãn GẮN nội dung bằng `IntersectionObserver`**: khu vực chưa
  gắn thì thấp, gắn xong cao lên → bấm mục lục nhảy tới khu vực cuối sẽ đáp trượt, đích trôi đi.
- **`contain-intrinsic-size` đặt trước chiều cao ước lượng** nên bố cục không xê dịch và neo `#hash`
  đáp đúng chỗ; trình duyệt chưa hỗ trợ thì bỏ qua cả hai thuộc tính, trang vẫn đúng.
- **`scroll-mt-4` bù header dính**: thiếu nó tiêu đề khu vực chui dưới thanh header, người dùng
  tưởng nhảy sai chỗ.
- **Viền `hairline` + `headerDivider`**: 38 khu vực xếp liền nhau trên `bg-page`; ở theme tối
  `bg-surface` chỉ sáng hơn nền trang một bậc nên khu vực không viền dính thành một mảng.

## DemoRow

- **`width` chỉ có nghĩa cùng `stacked`**: `flex-col` kéo con ra hết bề ngang khung chứa (cả nghìn
  px trên màn lớn) nên nút và ô nhập phình thành thanh dài, không còn đọc ra là nút / ô nhập.
- **Thân xếp dọc `items-stretch`, KHÔNG `items-start`**: `items-start` co ô nhập không mang `w-full`
  về bề ngang chữ gợi ý; bề ngang đã được `max-w-md` / `max-w-2xl` chặn sẵn.
- **Riêng `<button>` con trực tiếp `self-start`**: kéo giãn thì nút lẻ thành thanh dài 28rem. Nút
  nằm trong `div` bọc (cụm nút) đã có hàng `flex` riêng nên không bị ảnh hưởng.
- **Nhãn hàng chữ sans `caption-12-medium`, không mono 10px**: nhãn phần lớn là câu tiếng Việt có
  dấu; mono cỡ 10 nhoè dấu và trông như mã lỗi. Mono chỉ còn cho tên token / đường import.
- **Hàng chứa cả ô nhập lẫn lưới/cây** không dùng được `width`: bó riêng ô nhập bằng
  `wrapperClassName="max-w-md"`; `fullWidth` của picker lấp khung CHỨA nên đặt trong `DemoGrid`.

## DemoSideNav

- **Mục "đang xem" dùng `rootMargin: '0px 0px -75% 0px'`**: dải hẹp gần đỉnh, nên đó là mục vừa
  chạm mép trên chứ không phải mục chiếm nhiều diện tích nhất (khu vực dài sẽ luôn thắng).
- **Giữ TẬP khu vực trong dải, chọn khu vực CUỐI**: bấm mục lục thì mép dưới khu vực trước vẫn lấn
  vài px vào dải (`scroll-mt-4` > `gap-3`); chỉ đọc `entries` của lượt đó thì cuộn ngược không về mục cũ.
- **Mỗi nhóm là MỘT rail 2px liền** (mục không có khe dọc): rail xám là thanh trượt, mục đang xem
  tô primary — đọc ra vị trí trong cả nhóm chứ không chỉ một ô sáng; `aria-current="location"`.
- **`IntersectionObserver` chứ không nghe `scroll`** (trình duyệt tự gộp nhịp); `root` = `scrollRef`
  vì vùng cuộn thật là div bên trong, không phải viewport.
- **`max-h-full overflow-y-auto overscroll-contain`**: mục lục `sticky` dài hơn màn hình, thanh cuộn
  của trang không với tới nhóm cuối; `overscroll-contain` không kéo cả trang cuộn theo.

## DemoSideNav · DemoSectionChips

- **Hai component, không MỘT `<nav>` đổi dạng bằng CSS**: `spacing-policy` cấm đổi `gap` / `px` theo breakpoint ở code
  trang, mà cột dọc và dải chip cần nhịp khác nhau. Mỗi dạng là một cây DOM, khoảng cách hằng; `DemoPage` chọn bằng `useIsBelowLg`.
- **Cuộn chip bằng `nav.scrollTo`, KHÔNG `scrollIntoView`**: `scrollIntoView` kéo cả `<main>` (`overflow-x-hidden`
  vẫn cuộn được bằng script) trượt ngang; chỉ cuộn khi chip sát mép < 24px để lúc mới vào trang dải không bị đẩy lệch.
- **Màn hẹp: header + dải chip nằm TRONG vùng cuộn** (header trôi đi, chip `sticky top-0` nền mờ) — điện thoại ngang chỉ còn
  ~250px cao; neo `#id` chừa `scroll-mt-16` cho chip. Chip cao 32px, `::after` nới hộp bấm lên 44px; hai dạng chung `useActiveSection`.

## DemoPage · DemoScrollTopButton

- **Header `/demo` luôn đi qua `TitleScreen` như thiết kế**: liên kết sang màn mẫu khác ở `right`, hẹp thì KIT tự cho xuống hàng
  riêng. Demo không vá vòng quanh `TitleScreen` — ghép thực tế chính là chỗ soi kit, lỗi ở kit thì sửa ở kit.
- **Chọn cột dọc ↔ dải chip và header ngoài ↔ trong vùng cuộn bằng `useIsBelowLg`** (một cây DOM mỗi lần, không hai bản ẩn
  bằng CSS): ca "hai cây DOM" của `responsive-screens.md §2.4`; hook tự gõ query `< lg` vì chưa có preset.
- **Chừa đáy theo cỡ**: Dock nổi (tablet) đè ~72px cuối vùng cuộn nên có `spacer` + nút "Lên đầu" neo trên Dock; điện thoại
  có thanh tab do VỎ chừa chỗ nên không cộng thêm (đệm đôi). Nút chỉ dưới `lg` và chỉ khi đã cuộn quá một khu vực.
- **Ô đầu của Hệ form KHÔNG `autoFocus`**: focus lúc mount kéo vùng cuộn thẳng xuống khu vực form — mở `/demo` ở điện thoại
  thấy giữa trang thay vì đầu trang (mục lục dính cũng tô nhầm).

## ResponsiveLabSection · `library/components/responsive-lab/`

- **Khung là `<iframe>` thật thu bằng `transform: scale`, không phải `div` co bề rộng**: `div` không đổi viewport nên
  `md:` / `phone:` bên trong vẫn đọc cỡ cửa sổ thật. Cái giá: `touch:` / `hover` vẫn là của máy thật (ghi dưới khung).
- **Trong khung khu vực tự rút gọn (`useIsEmbeddedFrame`)**: trang nạp lại chính nó mà vẫn dựng khung thì lồng vô hạn.
  Mục "Số đo trong khung" nạp `/demo#responsive-lab` để đọc chip ở đúng cỡ khung.
- **`--safe-*` đo qua phần tử thăm dò** có `padding: var(--safe-*)`: biến là chuỗi `env(...)` thô, `getPropertyValue`
  không ra px. **Chip nằm ở CHỮ `khớp` / `không`**, màu chỉ là phụ (mù màu); `useMatchedQueries` nghe cả danh sách query.
- **Nhóm màn xếp theo `touch:` + bậc, không riêng bề rộng** (`classifyViewport`): iPad Pro ngang và laptop 14" cùng 1366.
- **Bảng lệch cổng ở hai ca có chủ ý**: 744×1133 (iPad mini dọc) khớp `phone:` vì rộng < 768; 1536×864 vào cổng `2xl:`
  dù bảng xếp ở 14". Lab hiện đúng thứ code đọc — đừng "sửa" cho khớp tên nhóm (`demo-viewport-group.test` khoá).

## DemoStatTile

- **Giữ `flex-col`**: `<Text>` render `<span>` (inline), bỏ ra thì nhãn và con số dính liền thành
  "mặc định128.450".

## ButtonMatrixSection · PrimitivesSection

- **Ma trận dùng cột `max-content` + `w-fit`, không `1fr`**: `1fr` chia đều cả khung thành ô rất
  rộng, nút nép trái còn nhãn cột canh giữa ô → nhãn trôi xa mẫu, bảng đọc ra như bị vỡ.

## ActionsSection (`library/constants/actions-inputs/actions.constants.ts`)

- **Option có icon khai `iconName`, không JSX**: file `constants` không chứa phần tử React (đổi đuôi
  `.tsx` chỉ để nhét JSX là trộn loại file); section dựng `<SystemIcon>` một lần ở cấp module.

## TypographySection

- **`text-{thang}-{độ đậm}` gói CẢ cỡ, giãn dòng và độ đậm**: mỗi thang là cặp cỡ/giãn dòng đã cân;
  tách thành `text-sm` + `font-medium` mất nhịp dọc và không nhân `--ui-scale` ở chế độ TV.
- **`caption-9` KHÔNG dành cho chart**: Recharts nhận cỡ chữ bằng px trong JS và có sàn 11px
  (`chart-conventions.md §1.5`); bậc 9 chỉ cho chữ cái avatar 2xs và nhãn đuôi tệp.

## DemoTokenSwatch · ColorTokensSection

- **Token chữ trình bày bằng chữ "Aa" trên `bg-surface`, token nét bằng khung viền 2px**: mảng màu
  đặc của một token chữ không cho biết nó có đọc được trên nền hay không — đúng thứ người xem cần soi.
- **Thang màu ghi BẬC thay vì tên token đầy đủ**: hàng đã ghi tên họ; chín tên lặp lại họ bị cắt cụt
  mà không thêm thông tin. Tên đầy đủ + giá trị vẫn có ở tooltip (`title`).
- **Bậc `-5` là bậc "nhận diện" của họ màu**: dùng cho nét và mảng nhỏ; `-6` / `-7` cho mảng lớn trên nền tối.
- **Cùng một bậc ở các họ khác nhau có độ sáng tương đương**: đổi họ màu không làm vỡ tương phản.

## ComposedDemoPage

- **Không `TitleScreen`; hành động đứng CÙNG HÀNG dải KPI (`KpiActionRow`)**: trang đã có `PageHeader` thì tên dự án +
  tên màn hình ở crumb trên header, tab ở dải gạch chân ngay dưới — thêm hàng tiêu đề là lặp đúng tên đó
  (`page-structure.md §3b`, máy kiểm `page-title-layer.test.ts`). `KpiActionRow` dựng trên `Toolbar` (cụm trái nở, cụm phải
  ghim, `items-center`) nên nút tự căn giữa dọc theo thẻ KPI; nhãn "Cập nhật lúc" của `/demo/tong-quan` đứng đầu cụm hành động.
- **Bảng lấp hết chiều cao là một chuỗi, đứt một mắt xích là hỏng**: `PageBody overflow="hidden"` →
  `BoxPanel bodyOverflow="hidden"` → `Table fill`; `EmptyState` rỗng (`min-h-0 flex-1`) cũng vậy.
- **Mỗi tầng một tên**: crumb header = DỰ ÁN (`DEMO_PROJECT_NAME`) + tên màn hình (`subtitle`), dải tab = góc nhìn,
  panel = khối. Số đếm chỉ ở dải KPI — thêm `SummaryPill` ở hàng hành động là lặp y hệt dải KPI.
- **Hàng lọc là đầu thân panel bảng** (`Toolbar border="bottom"`), không nổi trên nền trang: lọc
  thuộc về bảng; rỗng thì `EmptyState` có nút "Xoá bộ lọc" thay vì bắt người dùng tự dò lại.

## ComposedKpiStrip · SmartLiveSection

- **Số đếm (`valueFormat` / `format`): đơn vị ("tỷ" / "triệu") nằm TRONG chuỗi trả về**, không tách
  sang `unit` — `formatMoneyCompactRaw` chọn bậc theo từng giá trị lúc đếm, `unit` cố định sẽ sai.
- **Truyền SỐ THẬT + `formatMoneyKpi` (bọc `formatMoneyCompactRaw(n, 1)`), không chuỗi đã format**:
  chuỗi thì thẻ in thẳng, mất hiệu ứng đếm; 1 số lẻ để các khung liền nhau không in cùng một chuỗi.
- **Số ĐẾM (gói) thì `unit` cố định được** — đơn vị không đổi theo độ lớn như tiền.

## ComposedFilterBar

- **`<Dropdown>` cần bề rộng tường minh (`w-45` = 180px)**: trigger là `w-full min-w-[180px]`, để
  trống `className` thì `w-full` ăn cả dòng `<Toolbar>` và đẩy ô tìm xuống hàng dưới.

## ComposedDetailDrawer

- **`<Badge>` phải nằm trong hàng `flex items-center`**: đặt thẳng vào `flex flex-col` thì bị kéo
  giãn hết bề ngang (flex item mặc định `align-items: stretch`, `inline-flex` bị blockify).
- **Khối thông tin nền `bg-dialog-raised`, KHÔNG `bg-subtle`**: ở theme tối `bg-subtle` trùng nền
  ngăn kéo (`bg-dialog` #05223F) nên khối chỉ còn cái viền; `/30` ở theme sáng thì gần như trắng.
- **Vạch giữa các dòng `divider-strong`**: `divider-default` (#1E3A56) trên `bg-dialog-raised` tối
  (#1B3B5C) gần như trùng màu, các dòng nhãn–giá trị dính vào nhau.

## Ảnh mẫu SVG (`library/constants/media/upload.constants.ts` · `foundations/primitives.constants.ts`)

- **Ảnh mẫu là SVG nội tuyến (data URI), không gọi mạng**: trang thư viện phải xem được khi offline;
  ảnh hỏng đọc ra như component hỏng. Đừng thay bằng picsum / placehold.
- **Hex trong SVG là DỮ LIỆU ảnh, không phải màu giao diện** (`color-system.md`, mục ngoại lệ): chuỗi
  nằm trong `src`, trình duyệt phân giải như tài liệu riêng nên `var(--color-*)` không với tới.

## PanelCardSection · HudSection

- **Mẫu `PanelCard` bọc `<div className="h-40">`**: card cao `h-full` theo khung chứa (sinh ra để
  nằm trong ô lưới dashboard); thả trần vào khung `auto` thì cao đúng bằng header.
- **Không lồng hai `HudFrame`**: nó là lớp trang trí NGOÀI CÙNG; hai quầng sáng cộng lại thành vệt
  mờ và mất cạnh khung.

## FeedbackSection · WidgetsSection

- **`ToastContainer` và `ProgressCenter` KHÔNG mount lại ở demo**: cả hai là singleton đã gắn ở
  `AppOverlays`, đọc chung một store toàn app — bản thứ hai nhân đôi MỌI toast / thẻ tiến trình.

## SCurveChart · WorkVolumeChart (`shared/charts/`)

- **MỘT component cho cả mục "Biểu đồ" của `/demo` lẫn `/demo/tong-quan`**: mẫu `chart-conventions.md`
  mà khác bản chạy thật thì sửa quy ước ở một nơi, nơi kia trôi đi. Khác biệt đi qua prop (`nowLabel`).
- **`margin.left = 0`, không `-20`**: lề âm ăn nửa bề rộng trục Y (42 → 22px) nên tick từ 3 chữ số
  ("100", "80%") bị cắt. Trục Y đường S co theo dữ liệu (`sCurveAxis`): tuần 50–70%, tháng 30–80%, quý 0–100%.
- **`Legend itemSorter={null}`** ở cột chồng: Recharts mặc định sắp A→Z nên chú giải lệch thứ tự chồng.

## DashboardDemoPage · dashboard/ (`/demo/tong-quan`)

- **Lưới chia chiều cao bằng `grid-rows-[minmax(0,11fr)_minmax(0,9fr)]` từ `xl`**, không `calc(100vh-…)`: `minmax(0, …)`
  để ô không phình theo nội dung. `xl:min-h-120` là sàn (thấp hơn thì `PageBody` cuộn); dưới `xl` panel cao cố định.
- **`<PageBody className="relative">` là bắt buộc**: `AnimatedNumber` in `sr-only` (`position: absolute`); không `relative` thì nó
  neo vào `<main>` và kéo `scrollHeight` của `<main>` dài ra → hai thanh cuộn lồng nhau khi trang xếp cột.
- **`ScrollBoard` cao cố định `(rowCount + 1) × rowHeight`** nên `DashboardAlertsPanel` đo khung chứa rồi tính `rowCount`;
  đủ chỗ thì bảng đứng yên, dữ liệu dài hơn khung thì tự cuộn.
- **Bảng cảnh báo ở TÂM hàng dưới** (đổi chỗ với thiết bị bằng `order` ở `xl`): Dock tự ẩn / thu gọn khi bung ra đè dải giữa
  đáy màn, danh sách tự cuộn chịu che tốt hơn thanh đếm. Ghim thì `<main>` mất 80px đáy — màn treo tường nên đặt `autohide`.
- **Số KPI dẫn xuất từ `DEMO_PACKAGE_ROWS`** (`shared/constants/packages.constants.ts`) nên đổi một gói ở `/demo/ghep` là
  cả hai màn đổi theo; đường S khớp thẻ Tiến độ tổng thể — `tests/features/demo/demo-dashboard-data.test.ts` giữ.
- **Dòng phụ thẻ / tiêu đề panel KHÔNG lặp số đã có chỗ khác**: lặp là hai nơi phải sửa khi lệch.

## DashboardPanel · DashboardStatusDonut · WorkVolumeChart

- **Tiêu đề là `<h2>` tự dựng mang ĐÚNG class tiêu đề chuỗi của `BoxPanel`**: truyền node thì `BoxPanel` không áp kiểu
  chữ nào, còn `Text` chỉ có nét normal / medium nên không ra được semibold như các panel khác.
- **Gradient cung donut `userSpaceOnUse` neo ở tâm vòng**: `objectBoundingBox` tính theo khung TỪNG lát nên tâm dốc lệch
  khỏi tâm vòng, mỗi lát sáng một kiểu. Lần vẽ đầu (chưa đo, `r = 0`) SVG tô màu stop cuối — đúng bậc `-5`.
- **Cột % của chú giải ẩn khi chú giải < 11rem** (`@container`): ô 3/12 cột ở màn 1280 chỉ còn ~130px, badge + số + % đè
  lên nhau; tỉ lệ vẫn có ở tooltip của cung. Badge bọc nhãn trong `span.truncate` để co bằng dấu "…" thay vì tràn.
- **Tooltip donut `zIndex: 1`**: nhãn tâm là lớp HTML `absolute` đứng SAU khung chart trong DOM nên vẽ đè lên tooltip
  (con số "6" in xuyên qua hộp số liệu).
- **Tooltip cột chồng xếp theo thứ tự series (`itemSorter`)**: mặc định `'name'` của Recharts xếp theo chữ cái nên "Chậm"
  lên đầu, lệch với chú giải và thứ tự chồng.

## FactoryDemoPage · factory/ (`/demo/xuong`)

- **Màn mẫu "Gia công" theo mẫu Precast MES**: kiểm tab của trang với 6 tab (≥ `xl` nhóm trên header, dưới đó dải gạch
  chân; chật thì cuộn ngang), dải KPI, sơ đồ
  xưởng có nhãn ghim, `NoticeBoard` · `StatusBoard` trong `PanelCard` — dựng 100% bằng UI kit, không ảnh.
- **Sơ đồ 2.5D**: sàn + các khu nằm trong lớp `perspective`; nhãn ghim + dải tổng quan nằm NGOÀI để chữ không méo. Toạ độ
  nhãn (`factory-scene.constants.ts`) đo từ `getBoundingClientRect` của từng khu sau khi nghiêng — đổi góc nghiêng thì đo lại.
- **Hằng tách hai file** (`factory-metrics` · `factory-scene`): một file vượt 250 dòng.

## EntryDemoPage · entry/ (`/demo/nhap-lieu`)

- **Màn chạy THẬT của `data-entry-table.md`**: control phẳng tới khi chạm dòng, tam giác vàng kim ở ô đã sửa, lỗi tại chỗ,
  dòng nháp, dòng tổng dính đáy, mật độ 32 · 40 · 48px — mọi luật bảng nhập liệu có một chỗ để soi; sửa kit thì nhìn ở đây.
- **"Đã sửa" so với BẢN ĐÃ LƯU (`saved`), không với cờ "đã chạm"**: gõ rồi trả về giá trị cũ thì ô hết dấu sửa; `save()`
  thay cả `rows` lẫn `saved` nên mọi dấu sửa tắt cùng lúc.
- **Kiểm hợp lệ chạy trên CẢ bảng mỗi lần đổi** (`validateRow(row, rows)`): lỗi "mã trùng" phải đỏ ở MỌI dòng trùng, kiểm
  từng ô thì chỉ dòng vừa gõ đỏ. Lỗi KHÔNG xoá chữ đã gõ — người dùng sửa tại chỗ.
- **Dòng nháp còn trống hẳn không tính là thay đổi, không chặn lưu** (`isBlankDraft`): bấm "Thêm dòng" rồi đổi ý thì
  `EntrySaveState` vẫn "Đã lưu ✓" (không đỏ ô bắt buộc); khi lưu dòng đó bị bỏ. Trạng thái lưu một chỗ:
  `data-entry-table.md` §7.1.
- **Phím trong bảng qua MỘT `onKeyDown` ở khung bọc**: `handleEntryGridKeyDown` (Enter / Shift+Enter theo cột) chạy trước,
  chưa `preventDefault` mới tới `useArrowFieldNav` (← →) — hai bộ nghe riêng là một phím chạy hai việc.
- **Dữ liệu chỉ trong state trang, không API** (demo không có backend): phiếu thật thay `useEntrySheet` bằng query / mutation
  của feature, giữ nguyên cột (`useEntryColumns`) và ô (`EntryCell`).

## OpsKitSection (mục "Bộ điều hành")

- **Mảnh ghép của `/demo/xuong` trình bày riêng**: `Badge shape="tag"` · `Tabs variant="folder"` · `NoticeBoard` ·
  `StatusBoard` · `HudCallout`; các section cũ đều đã sát 200 dòng nên không nhét thêm vào.
