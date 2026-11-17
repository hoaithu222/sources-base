# Ghi chú code — widgets / header (`src/shared/widgets/header/`)

> Lý do thiết kế KHÔNG hiển nhiên của `src/shared/widgets/header/`, tách khỏi code theo
> `comment-policy.md §3`. Mỗi mục ≤ 6 gạch; chỉ ghi điều code không tự nói và rule chung chưa có.

## header.theme.ts — vỏ thanh (HEADER_SLOT_CLASSES)

- **Cỡ gốc ở `wide` (≥ 1800px), không phải `3xl` (1920px)**: màn 24" FHD chỉ cho viewport ~1903–1910px
  nên `3xl` không bao giờ khớp, header tụt về bậc compact.
- **Canh giữa thật = 3 cột**: `left` + `right` cùng `grow basis-0`, `center` giữ bề rộng tự nhiên. Cho
  `center` `grow` thì canh giữa PHẦN DÔI (lệch nửa hiệu hai cụm) và thành khối rỗng cao trọn thanh.
- **`center` ≥ 1280px là `absolute`**: `max-w-*` phải nhỏ hơn khoảng trống giữa hai cụm mép (vượt là ĐÈ,
  không đẩy). `xl:w-full` đi cặp `max-w-*`: thiếu thì hộp co theo nội dung, `max-w` thành class chết.
- **`xl:overflow-visible`** ở `center` (`overflow-x-auto` ép `overflow-y` ≠ visible, cắt vạch sáng đáy của chip
  đang bật) và ở `pageSlot` (overflow cắt quầng `drop-shadow` của chip đang bật).
- **Máy chạm huỷ phần `absolute` của `center`, giữ `pageSlot` co + cuộn ở mọi bề ngang**: iPad 13" ngang =
  1366px nằm trong dải `xl` của laptop, vùng chạm nới làm hai cụm mép phình và cụm tâm đè lên.
- **`left` không `shrink-0` (để `pageSlot` cuộn); `right` giữ `shrink-0`, KHÔNG `min-w-0`**: bỏ sàn thì
  phần dôi tràn ngược sang trái đè `center`. `min-w-fit` ở `max-lg:` + `touch:` (`min-w-min` không đủ).

## header.theme.ts — sáng / tối

- **Sáng = `bg-surface` + bóng mảnh; tối = gradient `bg-header-from → bg-header-to`**: nền mint cũ ở sáng
  tô xanh cả thanh, cạnh nội dung trắng đọc như một dải màu lạc tông. Token header chỉ còn dùng ở `dark:`.
- **MỘT vạch đáy là `rail`**: sáng = nền `border-default` + gradient `primary-6/70` ở giữa (một nét vừa là
  viền vừa là nhấn); tối gradient `primary-5` + `railGlow`. Layout KHÔNG vẽ vạch thứ hai — hai vạch sát
  nhau đọc ra viền dày lệch màu.
- **hatch · corner · railGlow · ngoặc góc chỉ `dark:`**: tắt bằng màu trong suốt / `hidden` chứ không gỡ
  phần tử, nên cây DOM không đổi theo theme (không nháy khi lật sáng/tối).
- **`rail` nằm `bottom-0` TRONG thanh, không `border-b`**: viền ngoài lệch 1px so với ray của bảng tên
  (`plateRail` cũng `bottom-0`) và vạch sáng đáy của chip đang bật — các nét chồng khít thay vì song song.
- **`rail` viết `bg-linear-to-r` (tên Tailwind v4), không `bg-gradient-to-r`**: tailwind-merge 3 không biết tên
  cũ, xếp nó vào nhóm MÀU nền nên `cn()` nuốt mất `bg-border-default` đứng trước — vạch sáng biến mất câm.

## header.theme.ts — nút icon

- **Ngoặc góc ở `::before`, vùng chạm ở `::after`**: chung một pseudo-element thì `inset` của vùng chạm
  ghi đè `right/bottom` của ngoặc (nhảy lên góc trên-trái) và `pointer-events-none` giết luôn vùng chạm.
- **Đổi tông ngoặc bằng `before:text-*`, không `border-*`**: ngoặc vẽ bằng `background` +
  `currentColor`, nên `hover:before:border-*` sinh class chết.
- **Class viết LITERAL**: `hover:shadow-[…]` viết thẳng, không nội suy hằng (Tailwind quét văn bản
  thuần); `[&>svg]:size-4!` cần `!` vì `SystemIcon` set width/height bằng inline style.
- **`HEADER_FRAME_TRANSITION` · `HEADER_ICON_BUTTON_CLASS` dùng chung với nút user**: `user-menu.theme.ts`
  import hai hằng này thay vì giữ bản sao — sửa một chỗ là khung hai nút cùng đổi.
- **Sáng là nút trơn** (`border-transparent`, chữ `fg-on-nav-muted`, hover `text-link` — `primary-5` trên
  trắng chỉ ~2.3:1). PHẢI ghi `hover:border-transparent`: không có nó `hover:border-primary-5/40` sẵn trong
  `ThemeToggle` sống sót qua merge và hai nút cạnh nhau hover khác nhau.

## chrome/Logo.tsx

- **Wordmark (`LOGO_TEXT_CLASSES`) fill đặc, không `bg-clip-text`** (mất subpixel antialiasing, chữ nhoè ở
  12–14px); `-bold` chứ không `-medium`: chữ to làm cụm trái phình, đè `center` tuyệt đối.
- **Ô thương hiệu do app truyền qua `brandMark`** (`AppHeader` dựng từ `BRAND_MARK_*` của `auth-motifs.constants.ts`,
  cùng ô vát với AuthLayout): dưới `md` wordmark ẩn nên thiếu ô này logo chỉ còn một hộp bấm rỗng.

## page-header/page-header.theme.ts — cụm tâm (cluster · navCell)

- **`navCell` `flex-1 basis-0` (dưới `xl`) giữ bảng tên đúng tâm**: hai ô rộng bằng nhau, nên `PageHeader` render CẢ
  HAI ô kể cả khi một bên rỗng. Từ `xl` là `basis-auto` — mục "bảng tên keystone · dải tab".
- **Tab đứng trên ray đáy nhờ ô nav `items-end`**, không phải chip tự neo (selector hậu duệ `data-header-chip` +
  `self-end` đã gỡ, không còn prop `anchor`): nút quay lại nằm ở slot `start` nên vẫn `items-center` cùng hàng logo, bảng
  tên cao trọn thanh. Chip thấp hơn thanh mà KHÔNG sát đáy thì 'lơ lửng' giữa thanh — đọc ra lệch so với ray.
- **`navCell` chỉ cuộn từ `xl`** (`xl:overflow-x-auto`): dưới `xl` cuộn ngang đã ở `HEADER_SLOT_CLASSES.center` (ô
  `min-w-fit` nên không cuộn lồng); từ `xl` cụm tâm `absolute` + `overflow-visible`, ô nav là chỗ cuộn duy nhất.
- **`PAGE_HEADER_SIDE_CLASSES.left.navCell` PHẢI `justify-end-safe`**: `flex-end` thường đẩy phần tràn ra
  NGOÀI mép start mà chỉ cuộn được về phía end — chip đầu dải bị cắt, không vuốt tới; `safe` về `start` khi tràn.

## page-header/page-header.theme.ts — bảng tên (plate)

- **`plate` là `pointer-events-none`, chỉ `titleBlock` nhận chuột**: bảng tên chui vào ô nav bằng lề âm (`--plate-tuck` > `--nav-pad`) nên hộp chữ nhật của nó phủ vài px góc chip kề — để `auto` thì bấm sát mép chip cuối cánh trái trượt vào bảng tên (đo bằng `elementFromPoint`).
- **`plate` `h-full` cố ý** (hairline đáy nối liền `rail`; đừng gán `HEADER_CONTROL_HEIGHT`, bảng tên
  không phải nút). `--plate-cut` 8 → 14 → 20 → 25px (có hai ô nav thì suy từ `--chip-cut`); đệm mép = vát + 2px nên chữ
  không đâm vào cạnh vát.
- **`px-*` ≠ `gap-*`**: `px-*` = đệm mép (giữ siết), `gap-*` = khe giữa cánh `///` và chữ — hẹp quá thì
  vạch chéo đọc như ký tự lạ mọc thêm đầu tiêu đề.
- **Hai cánh đối xứng gương**: chiều nghiêng vạch do trục `side` quyết định (`PAGE_HEADER_SIDE_CLASSES`:
  vai TRÁI `/`, vai PHẢI `\`) cho khớp hai vai vát của nền — không đặt cứng ở `wingBar`.
- **Sàn bề rộng bảng tên (`PAGE_HEADER_SIDED_CLASSES.sided`) chỉ bật khi có tab hai bên (`layout: 'sided'`)**: co 1 × basis 0 nên
  100% phần co dồn vào nó, không sàn thì tiêu đề teo "…"; sàn chỉ chống sập, để cao thì tiêu đề ngắn bị ép rộng.
- **`sm` không còn đè `--plate-cut`**: đệm mép tính từ chính độ vát (`px-[calc(var(--plate-cut)+4px)]`) nên bậc
  nào cũng không ăn lẹm vào tên bản ghi; `sm` chỉ siết `gap`.
- **Dòng phụ chỉ từ `xl` (`max-xl:hidden`)**: thanh 40px dưới `xl` không đủ hai hàng chữ; bảng tên cao trọn thanh nên khối
  tên + dòng phụ tự canh giữa, không cần đệm riêng. Dòng phụ dưới `xl` vẫn đọc được ở `title` của tên.
- **Hai góc TRÊN vát ngược 45° + nét sáng = ngôn ngữ của chip** ở kiểu `slant` (mẫu BigDataView 054 / 061 +
  087 / 106; điểm kim cương trên ray đã gỡ — xoay 45° răng cưa ở DPR 1): người đọc thấy tab và bảng tên là MỘT bộ. Viền (`plateEdge`) và thân (`plateBg`) dùng chung một đa giác (`PLATE_SHAPE_CLASSES`); điểm
  vát nằm trên cạnh nghiêng nhờ `--plate-e = --plate-cut × 0.22` (≈ `cạnh vát / cao thanh`, lệch dốc < 4% ≈ 0.5px — không
  nhìn ra). Nét sáng `PLATE_MARK_CLASSES.chamfer` là dải ~2px dọc cạnh vát, màu `--plate-tone`; KHÔNG vẽ quầng bằng
  `box-shadow` vì `clip-path` cắt (quầng nằm ở ray + chấm). Ray đáy chạy `hud-sweep` đã cân nhắc rồi bỏ: keyframe dịch theo
  CHÍNH bề rộng vệt (28%) nên chỉ quét được nửa trái, và thêm một chuyển động nền cho thanh vốn đã đủ sáng là thừa.
- **Chữ tên TỰ HẠ CỠ theo độ dài (`pageHeaderTitleFit`: ≤ 16 · ≤ 26 · dài hơn → `base` · `snug` · `tight`)** thay vì cắt "…"
  ngay: bảng cỡ chữ ghi ĐỦ từng ô (cỡ × bậc) ở `PAGE_HEADER_SIZE_CLASSES`, không ghi đè bằng class phụ (tailwind-merge
  không phân biệt `text-*` tuỳ biến nên ghi đè thành hai cỡ cùng bật). Đếm theo `normalize('NFC')` + `Array.from`: chữ
  tách dấu (NFD) hay dựng sẵn cùng một bậc. Hết bậc `tight` vẫn dài thì mới cắt "…", đủ chữ ở `title`.
- **Dòng phụ có vạch mảnh hai bên (`subtitleRule`, `shrink-20`)**: vạch co TRƯỚC chữ nên dòng phụ dài là vạch tự biến mất, ngắn
  ("DEMO", "Tuần 32") thì khung được như nhãn; hai vạch đối xứng bằng biến `--rule-dir` của trục `side`. Dòng phụ dạng chữ có
  `title` để đọc đủ khi bị cắt.

## page-header/page-nav.theme.ts — chip (PAGE_NAV_*)

- **Chip không có `border`**: `clip-path` cắt mất `border` + `box-shadow`, nên viền 1px = hai lớp `edge` +
  `face` (`inset-px`), quầng = `drop-shadow` trên `surface` (`inset-0`). `face` phải ĐẶC: thân xuyên thấu lộ viền bên
  dưới làm viền 1px lem thành vệt mờ. Viền nghỉ là MỘT màu đặc `hud-5/60` (hover `hud-4`), không dốc mờ dần về một đầu.
- **Cao `PAGE_CHIP_HEIGHT` 22 · 22 · 26px, đứng trên ray đáy** (~50% thanh, thấp hơn nút 28 · 32 · 36px).
- **Vát SONG SONG cạnh bảng tên**: dải trái `left`, dải phải `right` (`PAGE_HEADER_NAV_SLANT`) — vát ngược thì khe giữa
  chip và bảng tên loe hình chữ V, đọc ra LỆCH. `--chip-cut` 5 · 6 · 7px; bảng tên cắt `--chip-cut × cao thanh / cao chip`
  (1.82 · 2 · 2) nên hai cạnh song song TUYỆT ĐỐI.
- **Khe chéo chip ↔ chip = chip ↔ bảng tên = `--chip-cut`**: chip KHÔNG có `gap` (hai hình bình hành song song cách nhau
  đúng `--chip-cut` theo phương ngang), ô nav đệm `--chip-cut` (với cạnh song song, khe tới bảng tên = đệm này, bất kể
  chip cao bao nhiêu). Đo ở 11 bề rộng × 2 trang: chênh < 0.3px. Cộng thêm `gap` cho chip là khe tab↔tab rộng gấp đôi khe
  tab↔bảng tên. KHÔNG thu khe bằng margin âm: `clip-path` nằm ở lớp con, hộp bấm của `<a>` vẫn là cả hình chữ nhật nên chip
  sau ăn vùng bấm của chip trước. `HEADER_SKIN_SPECS[skin].vars` là nguồn duy nhất của `--chip-cut` / `--chip-notch`.
- **Góc NGOÀI trên vát ngược 45° + nét sáng `corner`** (mẫu BigDataView 054 / 061, góc vát của tab): `\` ở dải trái vát
  góc trên-trái, `/` ở dải phải vát góc trên-phải; nét sáng chỉ là dải ~2px dọc cạnh vát, sáng hơn khi rê / bật. Điểm nhấn
  ở MỌI chip nhưng nhỏ — control không rải ngoặc / sọc (visual-hierarchy.md §0c).
- **Vạch đáy**: chip bật = `bar` 2px sáng đậm dần về giữa (không còn chấm kim cương); chip nghỉ = `barIdle` thu về
  `scale-x-0`, rê chuột nở ra từ tâm — chuyển động nhỏ cho biết chip bấm được. Kiểu `solid` thay `barIdle` bằng chân `foot`,
  kiểu `gauge` thay cả hai bằng bốn vạch `ChipTicks`.
- **State phân cấp bằng nền + độ mờ CẢ HÌNH, `hover:` chỉ ở ô `idle` của `PAGE_NAV_STATE_CLASSES`**: `hover:`
  nằm chung ô với `active` thì tailwind-merge không loại nhau và chip ĐANG MỞ tụt về mức hover khi rê chuột.
- **Màu chip luôn `primary`, không theo `tone` bảng tên** (chip bấm được, cùng hệ màu nút icon header).
  Không dùng `HEADER_ICON_BUTTON_CLASS`: khung vuông + viền là ngôn ngữ cụm utility vế phải.
- **Một bộ bảng cho cả dải lẫn từng chip** (`pageNavItemClassName`): tab, action, icon-only phải y hệt nhau,
  chỉ khác state — tách hai bộ là kiểu gì cũng lệch một bậc đệm hoặc một nấc cỡ chữ.
- **Cỡ chữ không hạ dưới 10px** (`uppercase` dưới 10px trên nền gradient đọc không ra — hết chỗ thì
  CUỘN); **không `ring-offset`** (`--tw-ring-offset-color` mặc định TRẮNG, vẽ vành trắng ở dark theme).
- **Ô `active` dùng `fg-on-chrome`, không trắng cứng**: nền trong dần lên trên nên nửa trên chip ≈ nền
  header, mà `fg-on-chrome` ở light là navy đậm; `text-shadow` tối tách chữ khỏi nền xanh ở theme tối.

## page-header/parts/chip/ — page-header-chip.tsx · chip-surface.tsx

Bề mặt chip (`chipClip` · `ACTIVE_FACE` · `faceBackground`) nằm ở `parts/chip/chip-surface.tsx` + `shapes/chip-shapes.theme.ts`; `page-header-chip.tsx` chỉ ghép.

- **`ACTIVE_FACE` nhạt dần về NỀN THANH (`--header-bg` khai ở `HEADER_SLOT_CLASSES.root`: sáng `bg-surface`, tối
  `bg-header-to`), không về `transparent`**: `edge` nằm DƯỚI `face`, face trong suốt thì lộ nguyên mảng `edge` —
  mất viền 1px, nửa trên đậm gấp đôi. Đậm hơn bảng tên vì là state BẬT.
- **`edge` khi bật giữ 55% ở đỉnh, không về 0** (mất viền trên là hình bình hành hở nóc); **bevel chỉ
  cho idle** (nền active đã trong dần lên trên, thêm vạch trắng 1px là nét thừa).
- **`chipClip` đọc `--chip-cut`** (khai ở `HEADER_SKIN_SPECS[skin].vars`, 5 → 6 → 7px ở `slant`) nên co theo bậc màn mà không
  cần nhiều clip-path; độ vát phải ≤ đệm ngang, không thì chữ đâm vào phần vát.
- **Quầng chip bật ở `PAGE_NAV_ACTIVE_GLOW_CLASS` (`dark:drop-shadow-*`), không ở `style`**:
  inline không có biến thể theme, quầng xanh luôn bật trên thanh trắng đọc ra neon.
- **Hai trục tên khác nhau, đừng gộp**: `side` (`left | right`) = VỊ TRÍ ô nav / cánh so với bảng tên;
  `slant` (`right | left`) = HƯỚNG NGHIÊNG của chip. Dải nav nghiêng VỀ PHÍA bảng tên (`PAGE_HEADER_NAV_SLANT`).

## page-header/parts/page-header-title.tsx

- **Chữ tiêu đề fill ĐẶC + `text-shadow`**, không `background-clip: text` (mất subpixel antialiasing,
  viền nhoè trên nền tối) và không `filter: drop-shadow` (rasterize cả phần tử, kể cả nét chữ).
- **Quầng (chữ · ray · cánh) chỉ `dark:`, tone vào class qua `--plate-tone`** đặt trên `plate`: bóng đen dưới
  chữ navy trên nền trắng đọc như nhoè. Nền + màu nét vẫn inline vì phụ thuộc `tone` lúc chạy.

## page-header/parts/page-header-back.tsx

- **`slant` mặc định `left` dù nút ở bên trái**: chip đổ RA NGOÀI, đúng hướng đưa user đi (`right` nghiêng
  vào tiêu đề, đọc thành "đi tới"). Chip ghim cạnh nó ngược chiều thì hở khe V — đổi ở call-site (`backSlant`).
- **Không còn `anchor`**: vị trí dọc do ô cha quyết định (slot `start` canh giữa, ô nav `items-end`). Nút này vẫn khác tab
  ở chỗ ĐƯA USER RỜI trang (không bao giờ `active`, không có `aria-current`).

## page-header/PageHeader.tsx · parts/page-header-nav.tsx

- **`hasSides` là MỘT cờ chung cho cả hai ô nav**, không tách cờ từng bên: lẻ một ô là bảng
  tên lệch đúng bằng ô thiếu; ô rỗng gần như không tốn chỗ (`basis-0`; từ `xl` chỉ còn đệm mép) nên `PageHeaderNav`
  LUÔN vẽ ô — giữ khe đệm đối xứng hai bên bảng tên — chỉ bỏ dải chip.
- **Trang KHÔNG có tab: bảng tên cùng HÌNH như trang có tab, viền VẼ LIỀN thẳng lên mép trên** (`PageHeaderLayout` = `sided` | `free`, `PAGE_HEADER_SIDED_CLASSES`): trước đây `free`
  dùng `--plate-cut-free` (hình khác hẳn — `tray-flip` thành khối vuông, `chevron` / `hex` mất rãnh vát). Giờ cả hai dùng `--plate-cut-sided`. Họ khay: viền bảng tên bị che từ
  `--shelf-y` (`plateEdgeCapped`) vì phía trên là thanh khay nối tiếp — KHÔNG có tab thì không có thanh khay, che đi là bảng tên hở nóc, nên `PlateDecor` nhận `shelved` (`PageHeaderTitle`:
  `layout === 'sided'`) và bỏ lớp che khi không tab: viền của từng kiểu (`hang` thẳng đứng rồi thu vào đáy · `chevron` rãnh V · …) chạy LIỀN lên tới mép trên header. Hình viền khi không tab (`plate.solo`): `hang` → `lean`, `chevron` → `leanVee` — đoạn chéo gốc KÉO THẲNG lên mép trên (không còn đoạn thẳng đứng rồi mới gập — nét như user vẽ): đỉnh bảng tên rộng hơn hộp `--plate-ext` mỗi bên, nên lớp viền / thân của hình solo được NỚI
  ra đúng `--plate-ext` (`PlateDecor`, `inset-x-[calc(var(--plate-ext)*-1)]`; thân thụt thêm 1px). `lean`: `--plate-ext = --plate-inset × --shelf-y / (cao chip + rise)`; `leanVee` (`tray-flip`): `--plate-ext = (cao thanh − ½ cao chip) / --plate-slope − --plate-cut-sided` (test giữ ≤ 1px). Không dựng ô giả / thanh khay
  ngắn (đã thử ở bản trước, bỏ: cạnh dọc + đường ngang chụm một góc nhìn rối). Một bên rỗng còn bên kia có tab (`splitAt: 0`) vẫn `sided` như cũ.
- **Action bám theo dải CUỐI CÙNG có mặt** (`actionsOnEnd`), không phải một mép cố định — neo sai thì
  nút action văng khỏi nav.
- **Dải TRÁI vẫn render khi hết chip nhưng còn action** (`hasNavStart`): ca thật là user bị ẩn hết tab
  vì thiếu quyền xem mà vẫn được vào Cài đặt; thiếu nhánh này nút action biến mất theo tab.

## slots/ — HeaderSlotsProvider · HeaderSlotPortal · header-slots.context.ts

- **PORTAL, không lưu ReactNode vào store**: portal giữ node trong cây React của page nên context của
  page (router, query…) vẫn dùng được; qua store thì `<Header>` render mất context và crash.
- **Ô `nav` chỉ top bar điện thoại đăng ký**: Header laptop không có ô này nên `HeaderSlotPortal slot="nav"` render `null`
  — trang không phải biết đang ở dạng nào.
- **Hai context riêng (setter ổn định · bản đồ node)**: callback ref của `<Header>` chỉ phụ thuộc setter;
  gộp thì ref đổi theo node → detach → attach → set state → vòng lặp vô tận.

## phone/PhoneTopBar.tsx · phone-topbar.theme.ts · page-header/parts/page-header-phone.tsx

- **Top bar thay Header, KHÔNG chạy cùng nó**: cả hai đăng ký cùng ô slot (`useHeaderSlotRef`) nên mount đồng thời là tranh
  nhau node; vỏ chọn bằng `useIsPhone()` (hai CÂY DOM khác nhau — ca hợp lệ của JS).
- **Trang vẫn chỉ gọi `<PageHeader>`**: ở điện thoại nó rẽ sang `PageHeaderPhone` — tên + dòng phụ vào ô `title`, quay lại
  vào `start`, tab vào ô `nav` (dải cuộn ngang dưới top bar). Mất bảng tên vát và chip bình hành, KHÔNG mất chức năng.
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

## header-skin.store.ts

- **Store CỤC BỘ của widget, không qua prop**: mỗi nơi gọi `<Header>` truyền một kiểu là ghi đè lựa chọn của
  người dùng. Chỉ `Header` + `useUserMenuOptions` + các phần dựng khung (`useHeaderSkinSpec`) đọc (`widget-composition.md`
  — Store cục bộ của widget).
- **Không còn lựa chọn BỐ CỤC** (đã gỡ `header-layout.store.ts`): cụm tâm luôn ở GIỮA thanh (từ 1280px tuyệt đối giữa; dưới đó
  chạy trong luồng); bảng tên chỉ lệch khi hai cánh tab không cân. Menu người dùng chỉ còn MỘT submenu "Kiểu header" (radio) — chọn kiểu khung, không chọn chỗ đặt.
- **`skin` lạ bị nắn về `'tray'` (kiểu mặc định — "Khay")** (đổi tên kiểu, kiểu đã gỡ như `pill` / `bracket`, hoặc sửa tay trong DevTools): giá trị lạ
  làm `HEADER_SKIN_SPECS[skin]` ra `undefined`, cả thanh mất hình lúc vẽ — lỗi câm khó truy.
- **Đổi kiểu MẶC ĐỊNH phải tăng `version` (v2, 2026-10-07: `tray-flip` → `tray`)**: persist ghi cả giá trị mặc định lần đầu mở, nên máy đã mở app giữ `skin: 'tray-flip'` trong
  localStorage và mặc định mới không bao giờ hiện. `migrate` bản cũ (< 2) bỏ lựa chọn đã lưu → về mặc định mới; từ v2 trở đi lựa chọn của người dùng được giữ như thường.
- **Nắn ở MỌI lần khôi phục** (`sanitizeHeaderSkinState` trong cả `merge` lẫn `migrate`): zustand chỉ gọi `migrate` khi
  `version` lệch, nên cùng version mà `skin` rác thì trộn thẳng vào store nếu chỉ nắn ở `migrate`.

## page-header/header-skin.theme.ts — 15 kiểu khung

- **MỘT bảng cấu hình (`HEADER_SKIN_SPECS`), component chỉ đọc**: mỗi kiểu = `vars` (chín biến hình học đặt lên `<header>`) +
  `chip` `{shape, look, mark}` + `plate` `{shape, look, mark, handle, flank, rules}` (+ `nav` tuỳ chọn cho họ khay). Thêm kiểu = thêm
  MỘT mục (+ nhãn ở `HEADER_SKIN_LABEL`); đa giác mới thì thêm vào `shapes/chip-shapes.theme.ts` (chip) / `shapes/plate-shapes.theme.ts`
  (bảng tên). Kiểu dữ liệu + hai hằng chung ở `shapes/skin-parts.theme.ts`, năm kiểu họ khay ở `shapes/tray-skins.theme.ts`, bảng class thanh khay + vật trang trí ở `shapes/shelf.theme.ts` (tách vì
  file gốc vượt 250 dòng; file gốc re-export type nên chỗ khác vẫn import từ `header-skin.theme`).
- **Mười lăm kiểu, mỗi kiểu một hình khác hẳn** (tham khảo ảnh mẫu + BigDataView 001–119 + DataV): họ khay `tray` (mặc định) · `tray-flip` ·
  `tray-slant` · `command` · `facet`; `slant` bình hành song song bảng tên · `chevron` mũi tên lồng nhau chỉ về bảng tên · `hex` bát giác + núm sáng · `tag` nhãn
  cắt MỘT góc · `stair` hai bậc vuông · `square` ngoặc L · `folder` tab thư mục · `solid` khối đặc có chân · `gauge` bốn vạch sáng dần ·
  `line` gạch chân. Đã gỡ `pill` (bo tròn — trái luật vuông góc) và `bracket` (ngoặc `[ ]` — người dùng chê rối).
- **Chế độ DÀY (`PageHeader`: từ 5 tab)**: bảng tên bỏ hai cánh `///` ở md..2xl (`PAGE_HEADER_SLOT_CLASSES.wingDense`) — nhường ~44px cho dải tab; từ 2xl cánh quay lại. Cùng
  trần 832px và đệm gọn, đủ để mọi kiểu lọt 4 + 2 tab ở 1280px (hex phải bớt thêm `--plate-pad` 14 → 10, `--chip-gap` 5 → 4 và `--nav-pad` theo công thức).
- **Cụm vạch gạch–chấm hai bên bảng tên (`plate.flank`)** — nét gạch của mẫu `image (2)` ("▬▬ ▬ ▪" phát sáng cạnh bảng tên): ba đoạn 2px (dài · vừa · chấm, mờ dần ra
  ngoài) nằm ở 22% chiều cao thanh, đầu trong cách góc trên của bảng tên 4px (`right/left-[calc(100% − --plate-e − --plate-notch + 4px)]` nên bám đúng
  điểm vát của từng hình). Bật ở `slant` · `chevron` · `hex` · `tag` · `stair` (kiểu có bảng tên rõ hình, dải trên đầu hai nhóm tab vốn trống); họ khay đã có thanh khay
  nên không cần. Thay hai vạch lẻ lơ lửng của `hex` trước đây (cách bảng tên ~40px, nhìn như rác).
- **Đường khay KHÔNG có đoạn xanh "active" phía trên chip đang bật** (đã bỏ theo yêu cầu 2026-10-07): trước đây chip bật có thêm đoạn 2px `primary` đè lên đường khay (`shelfMark`, chip `z-[1]`) — nét xanh lá
  lạc giữa đường ngang màu phân hệ. Chip bật vẫn sáng bằng thân + vạch đáy; đường khay chỉ một màu (màu phân hệ).
- **Ảnh xem trước từng kiểu ở menu "Kiểu header"** (`user-menu/skin-preview/`): lát thanh header thu 50% (150×20-26px) dựng bằng chính `PageHeaderChip` / `PlateDecor` /
  `NavShelf` — kiểu được ghi đè bằng `HeaderSkinOverrideContext` (`shapes/skin-override.context.ts`; `useHeaderSkinSpec()` đọc nó TRƯỚC store) nên cấu hình đổi
  là ảnh đổi theo, kể cả theo cỡ màn hình hiện tại (biến `xl:` / `wide:` của kiểu). Chữ thay bằng vạch; `aria-hidden` + `inert` (chip bên trong là `<button>`) nên tên truy
  cập của dòng vẫn chỉ là tên kiểu; click xuyên xuống dòng menu.
- **Khe đều ở MỌI kiểu**: khe ngang chip ↔ chip = chip ↔ bảng tên (đo bằng `getBoundingClientRect`: `slant` · `tag` · `chevron` · `stair`
  · họ khay chênh ≤ 0.11px ở 3 bậc cỡ). Công thức `--nav-pad` / `--plate-tuck` ghi ở JSDoc đầu file — đổi một số là phải đổi cả hai. Kiểu
  lồng nhau (`chevron`, `stair`, `tray`, `tray-flip`): chip sau đè lên chip trước bằng margin ÂM (`--chip-overlap` ở
  `PAGE_NAV_SLOT_CLASSES.root`, vì `gap` không âm được) và bảng tên chui vào ô nav đúng `độ sâu − khe + --nav-pad`.
- **Đa giác bảng tên cần cao chip (`--chip-h`)**: rãnh chữ V của `chevron` nằm đúng độ cao chip, tread của `stair` cách chân chip đúng
  `--chip-gap`. `--chip-h` (1.375rem / `wide:` 1.625rem) PHẢI khớp `PAGE_CHIP_HEIGHT` — lệch là rãnh khuyết sai chỗ. Các chiều đứng của
  họ khay (`--chip-h` · `--header-h` · `--shelf-rise`) khai bằng REM như `HEADER_HEIGHT_CLASS`: đổi cỡ chữ gốc trình duyệt thì đa giác và
  thanh khay co giãn cùng thanh, không lệch như khi viết px (đo ở root 20px).
- **Họ khay — nền bảng tên "bẻ ngang" ra phủ trên đầu nhóm tab, DÀI THEO SỐ TAB**: mỗi nhóm tab có thêm MỘT thanh `data-shelf` (con tuyệt đối
  của chính dải chip, `relative`) từ mép trên thanh header xuống tới đường ngang cách đỉnh chip `--shelf-rise` (6px; từ `xl` 8px), tức cao
  `--shelf-y = cao thanh − cao chip − rise` (12 · 14 · 18px). Thanh KHÔNG có độ dài tự khai: `left-0` + `right` =
  `--plate-tuck − --nav-pad − 3px` (đầu trong chồng 3px dưới bảng tên cho khỏi hở đường nối ở toạ độ lẻ), nên bề ngang = dải chip (tab +
  action) — nhiều tab thì dài (đo 1920px: `/demo/ghep` 2 tab trái ≈ 163px · `/demo/xuong` 4 tab ≈ 374px). Nền = cùng gradient bảng tên
  (`--plate-tone` đặt ở CỤM TÂM bằng `plateToneStyle` để bảng tên và thanh cùng đọc) + đường ngang 1px ở đáy; đầu NGOÀI mờ dần bằng
  `mask-image` 28px — KHÔNG có nét đứng đi lên. Viền bảng tên (`plateEdge`) bị che từ `--shelf-y` trở lên (`plateEdgeCapped`, và theme sáng
  đổi sang `--plate-tone` cho cùng màu đường ngang) nên không còn cạnh dọc lên mép trên → nét liền: đường ngang → cạnh chéo bảng tên.
- **Năm kiểu họ khay** (ba kiểu đầu + hai kiểu dựng từ ảnh mẫu BigDataView, xem mục kế): `tray` ("Khay") — chip mũi tên + bảng tên `hang`: một cạnh chéo THẲNG từ đường ngang tới đáy, QUẶT VÀO TRONG
  (`--plate-inset` 15 · 19 · 21px, cùng dốc cạnh trên mũi chip; `min(…, 45%)` giữ không vỡ chữ V khi bảng tên bị ép hẹp). `tray-flip`
  ("Khay ngược") — bảng tên đi NGƯỢC: cạnh chéo xuống tới mũi chip rồi XOÈ RA ở đáy (rãnh V như `chevron`, `--plate-cut-sided ×
--plate-slope ≈ cao thanh − cao chip/2 − rise`), đường ngang là GẠCH ĐỨT (`nav.dashed`: đoạn đặc 26px sát bảng tên rồi gạch 6px cách
  4px). `tray-slant` ("Khay vát") — tab KHÔNG phải mũi tên: hình bình hành vát như `slant`, cạnh chéo bảng tên song song cạnh vát chip
  (`--plate-inset = --chip-cut × (cao chip + rise) / cao chip`, `--plate-tuck = --plate-inset`, `--nav-pad = --chip-cut`). Test
  (`header-skin.store.test.ts`) giữ các đẳng thức trên ở 3 bậc cỡ.
- **`command` ("Chỉ huy", mẫu 106) và `facet` ("Vát sáng", mẫu 061)** — hai kiểu khay dựng từ `BigDataView/web/106` · `061` (ảnh `top.png` · `bnt.png` · `bg.jpg`):
  - `command`: chip `skew` = hình bình hành TRỌN (cả hai đầu cùng nghiêng `--chip-cut`) nên hai chip kề nhau có cạnh SONG SONG; khe ngang đều
    `--nav-pad` nhờ margin âm `--chip-overlap = −(cut − nav-pad)` (flex `gap` không âm được) và bảng tên `hang` song song cạnh chip
    (`--plate-inset = --plate-tuck = --chip-cut × (cao chip + rise) / cao chip` = 7,6 · 9,5 · 10,5px). Khe đo bằng đa giác THẬT: chip ↔ chip 4 / 4 / 5px, chip ↔ bảng tên chênh ≤ 0,03px.
  - `facet`: cùng hình học `tray-slant` (dùng chung `SLANT_TRAY_VARS`); chip có dấu nhấn `facet` (dải sáng thứ hai cách viền 2px, song song cạnh vát phía bảng tên — khung vát hai lớp như `bnt.png`) và thân sáng dần về phía bảng tên (dùng lại `chevronFace`); thanh khay có HAI đường song song (`nav.double`, đường thứ hai cách đáy 5px, mờ hơn).
  - **Vật trang trí `nav.ornament`** nằm TRONG `NavShelf` (`data-ornament`, sát đầu trong, cách bảng tên ~6px): `hatch` (command) = bảy vạch xiên 17° (CÙNG dốc cạnh chip / vai bảng tên — mẫu 106 xếp vạch song song vai bảng tên), mờ dần ra ngoài; `wedge` (facet) = một cánh hình bình hành có vạch sáng chân (mẫu 061). Không đặt ở bảng tên vì ô nav phải (DOM sau) vẽ đè lên mọi trang trí của bảng tên. Vạch cao `--shelf-y − 6px` nên thấp ở màn nhỏ; ở < 1280px thanh khay chỉ cao 12px nên vạch rất mảnh.
- **Nét kẻ thanh khay CÙNG MÀU PHÂN HỆ (`--plate-tone`)**: đường ngang (đặc · gạch đứt · đường đôi) và vật trang trí (`hatch` · `wedge`) dùng `--plate-tone` (cụm tâm đặt qua `plateToneStyle`) —
  không dùng `hud` xanh nữa, nên nối LIỀN màu với viền chéo bảng tên (tối: gradient tone; sáng: `plateEdgeCapped` = tone). Phân hệ Đúc dầm (đỏ) cho đường ngang đỏ, không
  còn nét xanh lạc giữa hai cạnh đỏ. Không còn đoạn xanh "active" đè lên đường khay (xem mục dưới).
- **Ràng buộc họ khay**: `--header-h` PHẢI khớp `HEADER_HEIGHT_CLASS` (2.5 · 2.75 · 3.25rem) vì `--shelf-y` và nền thanh dùng nó. Thanh là
  `<span aria-hidden>` thuần trang trí (`pointer-events-none`, `ms-0!` vì selector `[&>*+*]:ms-[--chip-overlap]` của dải chip cũng nhắm vào
  nó) nên đọc màn hình bỏ qua, không cản bấm sát mép chip. Chỉ ô CÓ tab / action mới có thanh; bật bằng `HEADER_SKIN_SPECS[skin].nav.shelf`
  (trường tuỳ chọn, kiểu cũ không khai). Điện thoại (<768px) dựng `PageHeaderPhone`, không đi qua `PageHeaderNav` nên không có thanh. Hết chỗ
  thì ô nav cuộn ngang — thanh cuộn cùng tab. Đo `/demo/xuong` (4 + 2 tab) ở 1280 · 1366px: KHÔNG kiểu nào còn tràn (nhờ trần cụm tâm 832px + chế độ DÀY bên dưới).
- **Chip có cạnh vát / mũi / đuôi (`chevron` · `slant` · `skew` · `tag` · `folder`, tức cả họ khay) dùng đệm ngang GỌN** (`TIGHT_SHAPES` ở
  `page-header-chip.tsx`: như chip action, −2px mỗi phía → 6 · 10 · 12px; vẫn ≥ độ vát 5–8px): phần vát đã chiếm chỗ nên bớt đệm mà chữ
  không đọc chật; đổi lại dải 4 tab không còn tràn ô nav ở 1280–1366px (`/demo/xuong`, đo bằng ảnh: tab thứ tư lọt đủ mũi). Kiểu có đệm lớn
  (`hex` · `stair` · `square` · `solid`) giữ nguyên vì dấu nhấn góc / ngoặc cần chỗ.
- **Vùng bấm của chip theo HÌNH chip** (`hit` ở `PAGE_NAV_SLOT_CLASSES`): chip (`<a>` / `<button>`) là `pointer-events-none`, lớp `hit` bên trong
  (`pointer-events-auto`, cùng `clip-path` với khung) bắt chuột thay. Hai chip mũi tên chồng 2–3px nên hộp chữ nhật của chip sau từng phủ chóp mũi chip
  trước (bấm sát chóp trúng tab kế bên — đo `elementFromPoint`); giờ chóp mũi, đuôi, góc vát đều trả đúng chip. Click / `:hover` / `:active` /
  focus bàn phím vẫn chạy vì sự kiện nổi lên anchor, `group-hover` khớp khi con bị rê. `touch:after` (nới vùng chạm) giữ `pointer-events-auto`.
  Hệ quả: góc ngoài hình bình hành / bát giác không còn bấm được (đúng nét vẽ).
- **Viền chéo dày mỏng khác nhau theo độ dốc** (`face` thụt 1px mỗi phía nên cạnh chéo ≈ 1.2–1.4px, cạnh dọc 1px): chấp nhận được;
  rãnh V của bảng tên `chevron` dùng thân chạm đáy (`bgFlush`) để hai cạnh chéo của rãnh dày bằng nhau (thụt dọc làm một cạnh
  1.4px, cạnh kia 0.4px). `stair` toàn cạnh song song trục nên nét tuyệt đối ở DPR 1.
- **`chevron`**: thân chip sáng dần về MŨI (gradient ngang, chiều theo dải) + nét `echo` lặp hình mũi tên bên trong mũi (chỉ chip
  bật). **`folder`**: thân sáng từ mép trên xuống + nắp `cap` 2px dọc mép trên (chỉ chip bật). Dấu nhấn `cap` / `echo` KHÔNG hiện ở chip
  nghỉ — rải dấu nhấn lên mọi control là rối.
- **`solid` có CHÂN 2px**: chip nghỉ luôn có chân `foot` (đứng chắc trên ray, không đọc như khối lơ lửng) và bảng tên có vạch tông
  màu phủ trọn bề ngang ở đáy (`plateRailSolid`) thay cho ray mờ dần + quầng — tránh hai vạch (ray bảng tên + `railGlow` của thanh)
  chồng sát nhau thành một đường kép ở đáy bảng tên.
- **`gauge`**: bốn vạch 2px (`ChipTicks`) neo ở mép TRONG chip (phía bảng tên), cách ray 1px; chip bật sáng đủ bốn, chip nghỉ mờ
  theo bậc 0.3 → 0.9, rê chuột sáng lên. Thay cho vạch đáy `bar` của các kiểu khác.
- **Không điểm sáng hình thoi xoay 45°** (3px xoay ra dấu `*` ở DPR 1) và không bo tròn; `header-bar.test.tsx` giữ bằng
  `it.each(HEADER_SKIN_ORDER)`.
- **Tên màn hình là `<h1>`**: bảng tên (`PageHeaderTitle`, và `PageHeaderPhone` ở điện thoại) render `<h1>` nên trang có
  `PageHeader` không cần `TitleScreen` để có heading cấp 1 (`page-structure.md §3b`).

## user-menu/user-menu.theme.ts

- **Là nhóm con thứ hai của `header/` có theme riêng** (như `page-header/`, vì file theme gốc quá lớn):
  mọi slot ở đây chỉ cụm user đọc, không nhóm nào khác dùng.
- **`avatar` PHẢI đè bằng `className` (`size-6 xl:size-7 wide:size-8`)**: `<Avatar size>` chỉ nhận MỘT giá trị, mà
  `sm` (32px) bằng trọn trigger 32px (hết chỗ viền); `initialsCount={1}` vì ô 24px chứa hai chữ cái dính nhau.
- **`info` (tên + vai trò) ẩn dưới `lg`**: ăn ~100px, bằng một chip nav; không mất thông tin vì avatar
  vẫn mở menu và panel hiện đủ tên · vai trò · email. `max-w` chỉ là trần, tên ngắn tự co.
- **Vai trò là micro-label viết hoa giãn chữ, không phải pill `<Badge>`**: trong thanh cao 30px pill làm
  khối chật và phá nhịp chữ; pill chỉ ở panel (`panelRole`), nơi đủ chỗ thở.
- **`panel` `min-w-[264px]`** (`<Menu>` mặc định 220px) để email công ty không `truncate` sớm; `max-w`
  giữ panel khỏi phình. `status` viền `bg-surface` (sáng) / `bg-header-to` (tối) — đúng màu nền thanh nên
  chấm "khoét" gọn ở cả hai theme.
- **Cùng bẫy với `HEADER_ICON_BUTTON_CLASS`** (mục `header.theme.ts — nút icon`):
  `hover:before:text-*` chứ không `border-*`, `size-3!` cần `!`, `shadow-[…]` viết LITERAL.

## user-menu/user-menu.constants.ts

- **Mục tĩnh chỉ có `profile` · `settings` · `logout`**: base chưa có chức năng đổi mật khẩu nên không có mục đó.
- **Icon `logout` là `arrow-right-to-line-outline`** vì registry icon chưa có `right-from-bracket`. ⛔ KHÔNG chạy
  `generate:icons` — generator lệch registry đã commit, xem `docs/known-issues.md`.

## user-menu/useUserMenuOptions.ts

- **Mục widget KHÔNG biết tới widget khác**: "Ẩn / Hiện thanh Dock" do `app/shell/AppHeader.tsx` gắn qua
  `extraMenuOptions` (mỗi mục mang `onSelect` riêng). `onUserMenuSelect` chỉ nhận `UserMenuStaticKey`.
- **Selector có `?.` + fallback** (`s?.skin` trong `useHeaderSkin`, `s?.mode` ở `AppHeader`): lúc HMR /
  persist rehydrate selector có thể tạm trả `undefined` và cả mục menu mất nhãn — đừng "dọn" thành `s.skin`.
- **Mục "Kiểu header" là SUBMENU radio** (`MenuOption.children` + `checked`, khoá lá `skin:<giá trị>`): mười lăm kiểu nên không thể
  lật vòng như hai theme sáng / tối; kiểu đang dùng có dấu chọn. Điện thoại không có mục này (top bar không có khung bảng tên).
  Nhãn mục đổi theme ở nơi khác (`<ThemeToggle>`, bảng lệnh) nói ĐÍCH ĐẾN, không nói trạng thái hiện tại.
- **`logout` luôn là mục CUỐI, mục app gắn thêm + "Kiểu header" nằm giữa**: tách theo key nên thêm mục tĩnh
  mới không phải sửa lại thứ tự.
- **"Hồ sơ" / "Cài đặt" là `<button>` + `navigate()`** — ngoại lệ có ghi ở `navigable-controls.md §5`
  (`Menu` UI kit chưa có mục dạng liên kết).

## header.theme.ts — hình khối HUD

- **Cao 40 → `xl` 44 → `wide` 52px, control ~70% (`HEADER_CONTROL_HEIGHT` 28 · 32 · 36px, đệm dọc 6 · 6 · 8px)**: một hàng
  mỏng; chữ hai hàng (tên + dòng phụ) chỉ từ `xl`, ở 44px khớp với tên 16px + dòng phụ 10px.
- **Gap nhỏ nhất đọc được**: khe giữa các cụm `gap-1` (`wide` 8px), chip ↔ chip ↔ bảng tên 5 · 6 · 7px (= `--chip-cut`, ĐỀU), logo ↔
  chữ `gap-1.5`; bỏ các bậc `md:gap-1.5` · `wide:gap-4` cũ. Viền nút icon · khối user · chip ngữ cảnh ở `dark:` là `hud-5/65`
  (trước 35% — đọc như vệt mờ); viền bảng tên dày 1px nguyên (`inset-x-px`), không 1.5px lẻ (nhoè ở màn DPR 1).
- **Tick `|` chỉ đứng sau ô `end` của trang khi ô đó CÓ nội dung** (`peer-empty:hidden`); nút toàn cục + menu người dùng
  không còn tick riêng — mỗi nút đã có viền, thêm vạch ngăn là hai lớp ngăn cho một khe.
- **`HEADER_FRAME_CLASS` (logo, chip ngữ cảnh) vẽ bằng `background` nhiều lớp + `inset` shadow, không `border`**: cùng
  ngôn ngữ với các khối có `clip-path`; tam giác nhấn góc TL + BR là 2 lớp gradient. Chỉ `dark:`.
- **`glint` + `glintBar` (vệt sáng mép trên + cụm `////`) chỉ `dark:`**, đặt ở 3% / 17% bề ngang để không đè logo và
  cụm nút; DOM không đổi theo theme (chỉ `hidden dark:block`).
- **Trần cụm tâm mỗi bậc = `100vw − 2 × cụm mép đo thật`** (`xl` 31rem · `2xl` 44rem · `wide` 54rem; trần cứng `xl` 832px = trần `2xl` tại 1536px nên không giật ở mốc 1536 — trước là 780px, thừa chỗ ở 1316–1535px), đo ở `/demo/xuong`
  (logo + chip ngữ cảnh; đã bỏ đồng hồ nên cụm phải hẹp hơn cụm trái, cụm trái quyết định trần). App đổi nội dung cụm
  mép thì đo lại — vượt là bảng tên / tab đè lên chip ngữ cảnh.
- **`HEADER_ICON_DOT_CLASS` viền `ring` đúng màu nền thanh** (sáng `bg-surface`, tối `bg-header-to`) để chấm "khoét"
  gọn trên nút ở cả hai theme; quầng đỏ chỉ `dark:`.

## chrome/ — Logo · HeaderContextChip

- **Thư mục con vì `header/` đã đủ 8 mục**; hai thứ cùng là phần cố định của APP ở mép trái thanh, không theo trang.
- **Không có đồng hồ trên thanh** (đã gỡ `HeaderClock` + prop `clock`): giờ là thông tin của TRANG (bảng điều hành tự đặt
  `useNowTick`), không phải của vỏ; thanh càng ít thứ chuyển động càng dễ đọc.
- **Chip ngữ cảnh là của APP** (công trường / nhà máy đang xem), không phải của trang — node theo trang dùng
  `<PageHeader start>`. Chip chỉ để ĐỌC; đổi nơi làm việc thì app bọc nút riêng.
- **Nhãn đầy đủ của chip từ `2xl`, dòng phụ logo từ `wide`**: laptop 14" chỉ thấy chấm + mã (đo: cụm trái ≤ 206px ở
  1280px mới chừa đủ chỗ cho 4 + 2 tab quanh bảng tên).

## page-header — bảng tên keystone · dải tab

- **Bảng tên keystone (rộng trên, hẹp dưới) cao TRỌN thanh; chip hai dải thấp hơn, đứng trên ray đáy**: `--plate-cut` lấy từ
  bảng cấu hình kiểu khung (`--plate-cut-sided` khi có hai ô nav) + `md:-mx-[--plate-tuck]` kéo bảng tên chui vào ô nav; ô nav
  đệm `--nav-pad` nên khe chéo tới bảng tên bằng khe giữa hai chip, đều dọc theo cạnh vì hai cạnh song song. `--wing-cut` đã gỡ.
- **Không có máng nền (tấm cánh) sau tab**: máng bắt đầu ở 28% chiều cao thanh thì chip canh giữa 'nhô' khỏi máng và thêm
  một lớp viền — bỏ cho ít viền, rõ lớp (`wingFrame` · `wingEdge` · `wingFace` · `wingDash` đã gỡ).
- **Từ `xl` ô nav `basis-auto`**: cánh nhiều tab đẩy bảng tên lệch về cánh ít tab (đúng mẫu MES 4 + 2 tab); hai cánh
  cân nhau thì vẫn đúng tâm. Ép `basis-0` như cũ là chip thừa chui DƯỚI bảng tên — mất luôn vùng bấm.
- **Hết chỗ thì ô nav cuộn ngang (ẩn thanh cuộn), không đè**: ma trận đo `/demo/xuong` sạch ở 1280–1799 và ≥ 1816px; riêng
  1800–1815px (mốc đầu `wide`, chữ to lên) chip thứ 4 nằm trong vùng cuộn.
- **Dòng phụ `block truncate text-center`, không flex**: flex container không có "…" — chữ tràn bị cắt cụt hai đầu.

## page-nav.theme.ts · chip-surface.tsx — chip đang bật

- **Tách khỏi `page-header.theme.ts`** (vượt 250 dòng): file này = chip; file kia = cụm tâm, bảng tên.
- **Mặt chip đang bật = xanh lá pha 28% ngọc (`HOT`)** — vẫn đọc ra màu thương hiệu nhưng "công nghệ" hơn; cùng sắc
  với tab `folder` và ô Dock đang mở. Vạch sáng `bar` nằm NGOÀI lớp clip để quầng toả được, chạy theo cạnh đáy lệch
  của hình bình hành (`PAGE_NAV_BAR_CLASSES`).
