# Ghi chú code — widgets / header (`src/shared/widgets/header/`)

> Lý do thiết kế KHÔNG hiển nhiên của `src/shared/widgets/header/`, tách khỏi code theo
> `comment-policy.md §3`. Mỗi mục ≤ 6 gạch; chỉ ghi điều code không tự nói và rule chung chưa có.
> Hình thanh ở theme sáng (sơ đồ, kiểu, cấp, chiều cao, tab): `light-theme.md §6`.

## Header

- **MỘT dải trái → phải chứa mọi thứ của PHÂN HỆ** (logo · chip ngữ cảnh · cụm phân hệ · tên trang · tab | tìm · nút ·
  user): không sidebar (bảng ERP cần trọn bề ngang), không "bảng tên giữa thanh" + chip vát của bản HUD.
- **Sáng: thanh NỔI (island)** — vùng `<header>` `HEADER_HEIGHT_CLASS` = thanh 48 / 56px + khe 8px phía trên, thanh bo `2xl`
  cùng lề `SHELL_GUTTER_X` với `<main>`; mọi phép "viewport − header" vẫn lấy từ MỘT hằng. Tối: thanh phủ trọn, vuông (HUD).
- **Co giãn**: `left` `flex-1 min-w-0`, `right` `shrink-0` (tìm, theme, user luôn bấm được); trong `left`, ô `title`
  `shrink-[4]` teo "…" TRƯỚC cụm phân hệ (mất mục điều hướng là mất đường đi), ô `tabs` co sau tên trang và tự cuộn.
- **`tv:[--ui-scale:1]` ở `root`**: chế độ TV nhân cỡ chữ mà thanh cao cố định — chữ nở là tràn khỏi thanh 48 / 56px.
  Thanh giữ cỡ gốc, chỉ nội dung trang phóng (`tv-display-mode.md`).
- **Chỉ hai bậc chiều cao, cỡ gốc ở `wide` (≥ 1800px)** chứ không `3xl` — màn 24" FHD chỉ cho viewport ~1903–1910px
  nên `3xl` không bao giờ khớp.
- **Widget THUẦN, phân hệ + cấp vào qua prop** (`modules` · `activeModuleId` · `moduleNav` · `level` · `backHref` ·
  `moduleHref`): `src/app/shell/useHeaderModules.ts` đọc registry qua `useActiveModule`; widget không import router hay store của app.

## header.theme.ts

- **Mỗi kiểu chỉ khai biến `--hdr-*`** (`HEADER_APPEARANCE_CLASSES`), mọi phần con đọc biến: thêm kiểu = một dòng, không
  đụng phần con. `tests/shared/widgets/header/header-appearance.store.test.ts` giữ các biến phần con đọc.
- **Mục đang mở = VIÊN `--hdr-pill`**: `brand` viên TRẮNG chữ `primary-8` (trên gradient xanh, viên xanh chìm); `glass` viên
  `primary-6` ĐẶC chữ trắng (chọn kiểu macOS). Vòng focus `--hdr-ring` vàng kim ở `brand` — vòng xanh chìm trên gradient xanh.
- **`HEADER_ICON_DOT_CLASS` viền `ring` = màu NỀN thanh** (`bg-brand-via` · `glass` thì `bg-surface`): chấm đỏ "khoét"
  gọn vào nút; viền trắng cố định thành vòng lạc trên gradient. Viền `status` của avatar cùng lý do.
- **Biến thể theo kiểu đọc `data-appearance` trên `<header>`** (`group-data-[appearance=…]/header:`): lớp `aurora` (đường
  cong đồng tâm + hai quầng rất nhạt) chỉ bật ở `brand`, không có prop kiểu chạy xuống từng phần con.
- **Ô tìm là `CommandPaletteTrigger variant="field"` + `HEADER_SEARCH_FIELD_CLASS`**: ô thấy được cho người không biết ⌘K;
  màu / bề rộng do header truyền vì trigger không tự cho rằng mình nằm trên header. Dưới `md` co về nút icon.
- **Mọi control trên thanh là VIÊN cùng `HEADER_CONTROL_HEIGHT` (32 → 36px) + `HEADER_FRAME_TRANSITION`**: logo, chip ngữ
  cảnh, bộ chọn, user import hằng, không chép số — đổi một chỗ là cả hàng cùng đổi, cùng một đường tâm.

## chrome/header-appearance.store.ts

- **Store CỤC BỘ của widget, không qua prop**: mỗi nơi gọi `<Header>` truyền một kiểu là ghi đè lựa chọn của người dùng.
  Chỉ `Header` + `useUserMenuOptions` đọc / ghi (`widget-composition.md` §10).
- **Hai kiểu (`brand` · `glass`) thay 15 skin HUD**: cùng bố cục, chỉ khác CHẤT LIỆU — nên xem trước chỉ cần một dải màu
  thu nhỏ (`HeaderAppearanceOption`), không phải dựng lại lát thanh.
- **Đổi kiểu MẶC ĐỊNH phải tăng `version`**: persist ghi cả giá trị mặc định ở lần mở đầu, máy đã mở app giữ kiểu cũ và
  mặc định mới không bao giờ hiện. Khoá mới `header-appearance-storage` nên lựa chọn skin cũ tự bị bỏ.
- **Nắn ở MỌI lần khôi phục** (`sanitizeHeaderAppearance` trong cả `merge` lẫn `migrate`): zustand chỉ gọi `migrate` khi
  lệch `version`; giá trị lạ làm `HEADER_APPEARANCE_CLASSES[x]` ra `undefined` — thanh mất màu, lỗi câm.

## modules/ModulePlate.tsx · useHeaderModuleState.ts · header-curves.css

- **Tiêu đề GIỮA, tab HAI BÊN** (2026-10-19, người dùng yêu cầu — mẫu màn điều hành Trung Quốc): thanh là lưới
  `1fr · auto · 1fr` nên khối tiêu đề luôn đúng giữa. Khối CHỈ có tên trang — người dùng thấy vệt "phân hệ › màn ▾" ở giữa
  là rối; ‹ dời sang trái cạnh logo, màn hình phân hệ là tab hai bên, đổi phân hệ qua ⊞.
- **Tên trang đi qua CONTEXT, không portal** (`HeaderPageMeta` trong `HeaderSlotsProvider`): `Header` phải biết tên để dựng
  khối + biết trang có tab hay không để chọn nội dung hai bên. Chỉ báo giá trị NGUYÊN THUỶ (title · subtitle chuỗi · tone ·
  hasTabs) trong `useLayoutEffect` — báo cả object `nav` (đổi identity mỗi render) là vòng lặp set state.
- **Khay cong bằng mask SVG trong CSS** (`header-curves.css`, 2026-10-19 thay "giọt chảy" rủ dưới thanh — người dùng muốn
  bố cục khay + tab trên ray của `vci-sbc-confluent/fe` nhưng uốn lượn): đường cong chữ S cần bezier thật (radial-gradient chỉ
  ra cung tròn, ghép cung + góc bo lộ mẩu gãy). Hai lớp mask: gradient cho đoạn thẳng (giãn theo số tab) + SVG cho đoạn cong
  cố định `--hdr-tray-s`; khay phải = khay trái lật `scale: -1 1`, chân tab phải = chân trái lật — một bộ mask cho cả hai.
  Ô bên chừa `pr-7` / `pl-7` (= `--hdr-tray-s`) để đoạn cong không đè tiêu đề.
- **Tab đang mở dùng `!` cho biến** (`[--tab-fill:…]!`): `hover:[--tab-fill:…]` cùng độ ưu tiên, thiếu `!` thì rê lên tab đang
  mở làm thân trắng thành mờ, chữ ngọc trên nền mờ mất tương phản. Chân loe đọc cùng `--tab-fill` nên đổi màu theo thân; tab
  KHÔNG transition nền (chân là gradient — không chuyển động được, thân mờ dần còn chân bật ngay sẽ lộ lệch).
- **CSS thường thay class tuỳ biến Tailwind cho giá trị dài** (khay, chân, `.hdr-aurora`): ở `bg-[…]` giá trị lặp lại lần
  nữa trong tên selector (đã escape) — gần gấp đôi dung lượng; ngân sách CSS tải đầu đã sát (`scripts/check-bundle.mjs`).
- **Cấp tính ở tầng app** (`useActiveModule`): thiếu `backHref` / `moduleHref` thì không có ‹ — app nối chưa đủ không ra
  nút trỏ vào đâu không biết. ‹ là `<Link>` tới cấp TRÊN (không `navigate(-1)`); Ctrl/⌘ + ↑ cùng đích, `capture` +
  `ignoreWhileTyping`. `useHeaderModuleState` ghi "Gần đây" (`recent-modules.store`) khi phân hệ đang mở đổi.

## modules/ModuleSwitcher.tsx · parts/module-launcher-panel.tsx · recent-modules.store.ts

- **Bộ chọn phân hệ thay sidebar** (app switcher của Odoo / SAP Fiori): Dock là LỐI TẮT (có thể đang ẩn, máy chạm không
  hover), launcher là danh mục ĐẦY ĐỦ có tìm + nhóm. Chưa ở phân hệ nào → icon lưới + "Phân hệ", không ẩn nút; danh sách
  rỗng (không quyền nào) → `null`.
- **Tìm bỏ dấu (`normalizeSearch`), ô KHÔNG controlled** (`useImeSafeSearchInput`): gõ "ke toan" ra "Kế toán"; so khớp cả
  `title` · `subtitle` · `group`. **Enter mở phân hệ đầu tiên khớp** — bỏ qua khi `isComposing` (Enter của Telex chốt chữ).
- **Hàng "Gần đây"**: ≤ 4 phân hệ vừa mở (mới nhất trước), trừ phân hệ đang mở, ẩn khi đang tìm. Store lưu ID, KHÔNG lưu
  tên / quyền: launcher đối chiếu id với danh sách đã lọc quyền nên phân hệ mất quyền tự biến khỏi hàng.
- **Nhóm giữ thứ tự xuất hiện đầu tiên** (`groupModules`): registry đã sắp theo `meta.order`, sắp lại A→Z là phá thứ tự
  chủ repo chọn; thiếu `group` → "Khác". `sm:columns-2` + `break-inside-avoid` để nhóm không bị cắt đôi.
- **Launcher nằm trong popover (bề mặt sáng) nên dùng token `fg-*` thường, KHÔNG biến `--hdr-*`**: chữ trắng của kiểu
  `brand` sẽ biến mất trên panel trắng. Mỗi ô / chip là `<Link>` thật + `onIntent` nạp trước trang.
- **Nhãn nút ẩn dưới `lg`**: tablet dọc chỉ còn ô `AppTile` + mũi tên, nhường chỗ cho dải điều hướng; tên đủ vẫn ở
  `aria-label` ("Chuyển phân hệ — đang ở …").

## modules/ModuleNav.tsx · module-nav.theme.ts

- **Mục dựng từ module registry, không có danh sách thứ hai** (`toModuleNav` ở `src/app/router/menu/build-menu.utils.ts`):
  route con có `meta.title` thành mục — thêm trang vào phân hệ là thanh tự có; hai danh sách thì sớm muộn lệch.
- **Bỏ `meta.hideInNav` và path động (`:id`)**: trang chi tiết không có URL đứng riêng để bấm tới. Layout có con thành
  NHÓM — menu thả xuống (`parts/module-nav-group.tsx`), đúng một cấp.
- **Mục sáng = route SÂU NHẤT khớp URL** (tính ở `useActiveModule`, tầng app): trang index `/tai-chinh` là tiền tố của
  mọi trang con, so "chứa" thôi thì hai mục cùng sáng. Khớp theo PHÂN ĐOẠN (`/a` khớp `/a/b`, không khớp `/ab`).
- **< 2 mục → `null`**: phân hệ một trang thì dải chỉ nhắc lại tên đã có ở khối tiêu đề.
- **CHIA ĐÔI quanh khối tiêu đề** (`half`): nửa đầu (làm tròn lên) bên trái dồn về giữa, nửa sau bên phải; mỗi nửa tự co
  trong ô `[data-header-side]` của mình. Trang có tab riêng (`HeaderPageMeta.hasTabs`) → hai bên là tab của TRANG.
- **Mục đang mở = TAB CONG ĐẶC đứng trên mép đáy** (`HEADER_SIDE_TAB_CLASSES` + `.hdr-tab`: góc trên bo, chân loe lõm) trong
  KHAY cong (2026-10-19 thay vạch "nụ cười"): người dùng muốn tham khảo header `vci-sbc-confluent/fe` (chip đặc đứng trên
  ray) nhưng uốn lượn — tab đặc đọc rõ hơn vạch mảnh, chân loe nối tab vào mép đáy thay góc vát.
- **Mục là CHỮ TRƠN** (không rãnh, không viền, không icon — 2026-10-18): người dùng thấy header "rối" vì viên lồng viên
  (logo, chip, bộ chọn, rãnh, crumb, rãnh tab, ô tìm). Học app sản xuất (`vci-sbc-confluent/fe`: một hàng mỏng, ít khung)
  và console Trung Quốc: đúng MỘT thứ được nhấn (viên mục đang mở), icon dời vào menu / bảng "Tất cả phân hệ".
- **Chọn phân hệ = nút ⊞ đầu thanh** (`ModuleSwitcher` + `parts/module-launcher-panel.tsx` + `module-launcher-card.tsx`):
  bảng 全部菜单 liệt kê MỌI phân hệ kèm MỌI màn hình (`HeaderModule.screens`), ô tìm khớp cả tên màn — hai chạm tới bất kỳ
  chức năng nào.
- **Hết chỗ → "Thêm ▾"** (`useFitCount` + `parts/module-nav-more.tsx`): đo bề rộng từng mục trên một hàng ẨN (`inert`,
  `invisible absolute`, đủ mục với class thật), chỗ có = bề rộng dải + chỗ trống còn dư trong ô bên của nó
  (`HEADER_SIDE_SELECTOR`). Mục đang mở luôn ở lại (đổi chỗ với mục vừa cuối). Đo lại khi ô / hàng đo đổi cỡ
  (`ResizeObserver`); jsdom không đo được → hiện đủ. Nút nhóm là `<button>` (chỉ
  MỞ menu), mọi trang con là `<Link>` (`navigable-controls.md`).

## page-header/PageHeader.tsx · parts/page-header-tabs.tsx

- **Tab của trang lên THANH từ `xl`, dưới `xl` về dải gạch chân trong luồng** (ngay chỗ đặt `<PageHeader>`): ≥ 1280px thanh
  đủ chỗ nên nội dung lên sát header, không tốn một hàng; dưới đó thanh không chứa nổi cụm phân hệ + crumb + tab. Hai bản
  cùng render, CSS chọn đúng MỘT mốc (`max-xl:hidden` / `xl:hidden`) — không media query JS (nháy lúc mount / xoay máy).
- **Trên thanh là nhóm SEGMENTED** (rãnh `--hdr-field`, mục mở = viên `--hdr-pill`), cùng ngôn ngữ với dải phân hệ cấp 1 —
  hai dải không đứng cùng lúc vì từ cấp 2 dải phân hệ thành vệt ‹. ← / → chuyển tiêu điểm vòng tròn giữa các tab — không phải Tab qua từng mục.
- **Hai tầng điều hướng, hai chỗ**: trang con của PHÂN HỆ ở `ModuleNav`; `PageHeader nav` chỉ cho tab TRONG một trang
  (`?tab=`). Đưa trang con vào `nav` là cùng một đích hiện hai lần.
- **Tên trang là crumb `/ ● Tên · dòng phụ` nối tiếp cụm phân hệ, render `<h1>`**: một tầng tên — trang có `PageHeader`
  KHÔNG dựng `TitleScreen` (`page-structure.md §3b`, máy kiểm `tests/policy/structure/page-title-layer.test.ts`).
- **Tên không `truncate`, dùng `overflow-x-clip overflow-y-visible text-ellipsis`**: `overflow: hidden` gọt dấu chữ HOA
  tiếng Việt. Trần `max-w-72` (`wide:` `max-w-96`) để tên dài không đẩy tab và ô tìm.
- **Dòng phụ chỉ từ `wide`** (`max-wide:hidden`): dưới 1800px bề ngang dành cho cụm phân hệ + tab. `nav` không có tab lẫn
  action → không dựng gì (dải rỗng là một đường viền thừa).

## page-header/PageHeaderActions.tsx · parts/page-header-filter-options.tsx

- **Hành động trang do WIDGET dựng** (`PageHeader actions`, 2026-10-19): trang tự đặt `<Button secondary>` vào `end` thì ra nút
  xám / trắng của UI kit lạc tông trên thanh màu (người dùng chỉ ra ở Đơn mua). Widget đọc `--hdr-*` nên đúng mọi kiểu thanh;
  `primary` = viên `--hdr-pill` có chữ, còn lại icon tròn + tooltip (`hint` thay nội dung tooltip, vd đồng hồ cập nhật).
  Nằm ở gốc `page-header/` vì `parts/` đã đủ 8 file.
- **Bộ lọc dạng danh sách** (`PageHeaderFilter.options`): bộ lọc ít lựa chọn (kỳ, kho, xưởng, trạng thái) — dropdown lồng
  trong bảng nổi của cột là 3 lần bấm, danh sách dọc là 2 và thấy hết lựa chọn + số đi kèm. Dòng = `MODULE_NAV_CLASSES.menuLink`
  (cùng menu của thanh, không thêm CSS), `role="radio"` + `aria-checked`; chọn xong cột đóng bảng, bảng phễu điện thoại giữ mở.

## page-header/parts/nav-element.tsx · page-header-back.tsx

- **`NavElement` là NƠI DUY NHẤT chọn `<a>` hay `<button>`** cho tab / action / nút quay lại (cả bản điện thoại): có
  `href` → `<Link>` (Ctrl+click mở tab mới), lệnh tại chỗ → `<button>`; `disabled` luôn là `<button disabled>`.
- **Nút quay lại ĐƯA USER RỜI trang**: không bao giờ `active`, không `aria-current`. Nằm ở ô `start`, khung
  `HEADER_ICON_BUTTON_CLASS` như mọi nút icon trên thanh — không còn hướng vát để chọn.

## slots/ — HeaderSlotsProvider · HeaderSlotPortal · header-slots.context.ts

- **PORTAL, không lưu ReactNode vào store**: portal giữ node trong cây React của page nên context của
  page (router, query…) vẫn dùng được; qua store thì `<Header>` render mất context và crash.
- **Ô `nav` chỉ top bar điện thoại đăng ký**: Header laptop không có ô này nên `HeaderSlotPortal slot="nav"` render `null`
  — trang không phải biết đang ở dạng nào. Ngược lại ô `tabs` chỉ Header máy tính có.
- **Tab máy tính: bản ≥ `xl` đi qua ô `tabs`, bản < `xl` render ngay chỗ đặt `<PageHeader>`** (trong `<main>`); slot chỉ cho
  thứ nằm TRÊN thanh (`start` · `title` · `tabs` · `end`).
- **Hai context riêng (setter ổn định · bản đồ node)**: callback ref của `<Header>` chỉ phụ thuộc setter;
  gộp thì ref đổi theo node → detach → attach → set state → vòng lặp vô tận.

## phone/PhoneTopBar.tsx · phone-topbar.theme.ts · page-header/parts/page-header-phone.tsx

- **Top bar thay Header, KHÔNG chạy cùng nó**: cả hai đăng ký cùng ô slot (`useHeaderSlotRef`) nên mount đồng thời là tranh
  nhau node; vỏ chọn bằng `useIsPhone()` (hai CÂY DOM khác nhau — ca hợp lệ của JS).
- **Trang vẫn chỉ gọi `<PageHeader>`**: ở điện thoại nó rẽ sang `PageHeaderPhone` — tên + dòng phụ vào ô `title`, quay lại
  vào `start`, tab vào ô `nav` (dải cuộn ngang dưới top bar). Mất crumb và dải gạch chân, KHÔNG mất chức năng.
- **Top bar không theo kiểu header** (nền `bg-surface` phẳng, không đọc `--hdr-*`): sheet tài khoản bỏ mục "Kiểu header".
- **Cao 52px; xoay ngang thấp ≤ 44px**: `row` thành `display: contents` rồi xếp `lead · tên · dải tab · nút` trên MỘT hàng
  bằng `order` — tab cùng hàng nên không tốn thêm 36px chiều cao.
- **Tên dự phòng ẩn bằng CSS** (`peer-[:not(:empty)]/title:hidden`) khi ô `title` có nội dung — không đợi JS, nên không
  nháy tên route rồi mới thành tên trang.
- **Nút `HEADER_PHONE_BUTTON_CLASS` 36px (32px < 360px / xoay ngang), vùng chạm 44px / 40px bằng `::after`**: khe 8px giữa
  hai nút nên hai vùng chạm vừa chạm mép, không chồng.

## user-menu/UserMenuSheet.tsx

- **Điện thoại: avatar mở sheet đáy (`Drawer`), không popover**: popover bám nút 36px góc phải-trên, hẹp, không có X, dòng
  ~40px. Danh sách + handler dùng chung `useUserMenuOptions` (chỉ bỏ "Kiểu header").
- **Chọn mục đóng sheet RỒI mới báo app**: chuyển trang / đăng xuất không bị sheet còn mở chắn. Tablet vẫn popover nhưng dòng
  `min-h-11`; xoay ngang thấp xếp 2 cột để khỏi cuộn dài.

## user-menu/user-menu.theme.ts

- **Nhóm con có theme riêng** (như `page-header/`, `modules/`): mọi slot ở đây chỉ cụm user đọc; trigger đọc biến `--hdr-*`
  nên đúng ở cả `brand` lẫn `glass` mà không cần biết kiểu.
- **`avatar` PHẢI đè bằng `className` (`size-6 wide:size-7`)**: `<Avatar size>` chỉ nhận MỘT giá trị, mà `sm` (32px) bằng
  trọn trigger 32px; `initialsCount={1}` vì ô 24px chứa hai chữ cái dính nhau.
- **`info` (tên + vai trò) ẩn dưới `lg`**: ăn ~100px bề ngang của dải phân hệ; không mất thông tin vì avatar vẫn mở menu
  và panel hiện đủ tên · vai trò · email. `max-w` chỉ là trần, tên ngắn tự co.
- **Vai trò là micro-label viết hoa giãn chữ, không phải pill `<Badge>`**: trong khối 32px pill làm chật và phá nhịp chữ;
  pill chỉ ở panel (`panelRole`), nơi đủ chỗ thở.
- **`panel` `min-w-[264px]`** (`<Menu>` mặc định 220px) để email công ty không `truncate` sớm; `max-w` giữ panel khỏi phình.

## user-menu/user-menu.constants.ts

- **Mục tĩnh chỉ có `profile` · `settings` · `logout`**: base chưa có chức năng đổi mật khẩu nên không có mục đó.
- **Icon `logout` là `arrow-right-to-line-outline`** vì registry icon chưa có `right-from-bracket`. ⛔ KHÔNG chạy
  `generate:icons` — generator lệch registry đã commit, xem `docs/known-issues.md`.

## user-menu/useUserMenuOptions.ts

- **Mục widget KHÔNG biết tới widget khác**: "Ẩn / Hiện thanh Dock" do `src/app/shell/AppHeader.tsx` gắn qua
  `extraMenuOptions` (mỗi mục mang `onSelect` riêng). `onUserMenuSelect` chỉ nhận `UserMenuStaticKey`.
- **Selector có `?.`** (`s?.setAppearance` ở đây, `s?.mode` ở `AppHeader`): lúc HMR / persist rehydrate selector có thể
  tạm trả `undefined` — đừng "dọn" thành `s.setAppearance`.
- **"Kiểu header" là SUBMENU radio** (`MenuOption.children` + `checked`, khoá lá `appearance:<giá trị>`): thêm kiểu là
  thêm dòng, mỗi dòng có dải xem trước. Nhãn đổi theme ở nơi khác (`<ThemeToggle>`, bảng lệnh) nói ĐÍCH ĐẾN.
- **`appearanceFromKey` chỉ nhận giá trị trong `HEADER_APPEARANCE_ORDER`**: khoá lạ (mục app trùng tiền tố) không bao giờ
  chạm store.
- **`logout` luôn là mục CUỐI, mục app gắn thêm + "Kiểu header" nằm giữa**: tách theo key nên thêm mục tĩnh
  mới không phải sửa lại thứ tự.
- **"Hồ sơ" / "Cài đặt" là `<button>` + `navigate()`** — ngoại lệ có ghi ở `navigable-controls.md §5`
  (`Menu` UI kit chưa có mục dạng liên kết).

## chrome/ — Logo · HeaderContextChip

- **Phần cố định của APP ở mép trái**, không theo trang / phân hệ — cùng chỗ với kiểu thanh (`header-appearance.store.ts`),
  cũng là lựa chọn của app chứ không của trang.
- **Wordmark fill đặc, không `bg-clip-text`** (mất subpixel antialiasing, chữ nhoè ở 14px). Logo TRẦN: khung ở cụm này
  chỉ là chip ngữ cảnh.
- **Ô thương hiệu do app truyền qua `brandMark`** (`AppHeader`: logo VCI đầy đủ trên VIÊN trắng, `brandLabel=""`): logo
  nhiều màu (cung xanh lá → lam, chữ đỏ) chỉ giữ đúng màu trên nền trắng — đặt thẳng lên gradient `brand` là chìm. `compact`
  (cấp ≥ 2) chỉ ẩn wordmark; thiếu ô này logo chỉ còn một hộp bấm rỗng.
- **Không có đồng hồ trên thanh** (đã gỡ `HeaderClock`): giờ là thông tin của TRANG (bảng điều hành tự đặt `useNowTick`),
  không của vỏ; thanh càng ít thứ chuyển động càng dễ đọc.
- **Chip ngữ cảnh chỉ để ĐỌC, là của APP** (công ty / chi nhánh đang xem): node theo trang dùng `<PageHeader start>`; đổi
  nơi làm việc thì app bọc nút riêng.
- **Nhãn đủ của chip từ `2xl`, dòng phụ logo từ `xl`**: laptop 14" chỉ thấy chấm + mã — bề ngang nhường cho dải phân hệ;
  tên đủ vẫn đọc được qua `title`.
