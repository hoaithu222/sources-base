# Ghi chú code — widgets (`src/shared/widgets/`: dock · tab-bar · command-palette · progress-center · work-tabs)

> Lý do thiết kế KHÔNG hiển nhiên của các widget, tách khỏi code theo `comment-policy.md §3`.
> Mỗi mục ≤ 6 gạch; chỉ ghi điều code không tự nói và rule chung chưa có. Header: `widgets-header.md`.

## dock/dock.theme.ts

- **`softHover` (theo cạnh) chỉ áp khi `!magnify`**: `scale-*`/`translate-*` của Tailwind v4 là thuộc
  tính CSS riêng, còn `dock-magnify.css` dùng `transform` — bật cả hai thì cộng dồn, lỗi câm.
- **`DOCK_ENTER_CLASS` gắn lên `<span>` bọc `AppTile`, không phải ô bấm**: ô bấm đã mang transform phóng
  lân cận, hai transform trên một phần tử đè nhau → giật. Chỉ chạy ở `data-dock-state="opening"`.
- **Hằng JS phải khớp `dock-magnify.css`**: `DOCK_DURATION.{shellOpen,iconEnter,iconStagger}` và
  `DOCK_TRIGGER_ZONE` (= `.dock-hint` sâu 22 · dài 2 × 72px). Lệch → icon giật hoặc thanh không lên.
- **`DOCK_MAGNIFY_*` chỉ là class móc**: `useDockMagnify` ghi biến, `dock-magnify.css` §1 dựng transform. Ô PHÓNG = con
  mang `DOCK_MAGNIFY_ITEM_CLASS` (mục + nút cài đặt, như Thùng rác macOS); vạch ngăn / `trailing` chỉ dời theo.
- **`concealed` (mọi cạnh) BẮT BUỘC `pointer-events-none`**: thanh vẫn ở DOM chỗ cũ, thiếu cờ là chắn click cả dải
  dọc mép neo. Vệt `DOCK_HINT_CLASS` cũng `pointer-events: none` vĩnh viễn.

## dock/dock.theme.ts — cạnh neo · chỗ chừa

- **Mọi khác biệt theo cạnh gom MỘT bảng `DOCK_POSITION_CLASSES`** (neo, chiều xếp, vạch ngăn, chấm, tay nắm, hover):
  thêm cạnh = thêm một khoá, `tsc` báo ô thiếu. CSS tay chỉ đọc `data-dock-position` + bốn hệ số trục.
- **Neo cộng `--safe-*` của ĐÚNG cạnh** (đáy `--safe-b`, trái `--safe-l`, phải `--safe-r`): tai thỏ / vạch Home khi xoay
  ngang (`ipad-responsive.md §6`). Tràn: đáy cuộn ngang dưới `xl`, trái / phải cuộn dọc khi màn cao ≤ 720px.
- **`DOCK_RESERVE_CLASSES` = đệm 80px của `<main>` ở cạnh neo** (ô 44 + đệm 2×6 + viền 2 + khoảng neo 12 + khe 10): đổi
  cỡ ô / đệm `root` / khoảng neo thì sửa cả đây. Ghép SAU `SHELL_*` để `cn()` cho đệm này thắng.
- **Chỉ GHIM mới chừa chỗ** (`useDockReserveClass`): tự ẩn / thu gọn / ẩn là Dock hiện TẠM nên nổi đè là đúng ý (như macOS
  bật "tự ẩn"); máy chạm bị ép `pinned` nên luôn chừa. Đệm, không spacer: cùng một công thức cho ba cạnh.
- **Tooltip + panel bung về phía TRONG màn** (`DOCK_POPUP_SIDE`: đáy → trên, trái → phải, phải → trái): bung ra phía mép
  là bị cắt.

## dock/dock.theme.ts — bề mặt

- **Sáng = kính mờ macOS** (`bg-glass` + `backdrop-blur-2xl` + viền bắt sáng `rim-glass` — `border-glass` chỉ ở tối, `rounded-2xl`): gờ sáng đỉnh `inset` +
  vòng 1px `border-strong` 55% + hai lớp `shadow-glass` — kính trắng trên nền trang sáng cần vòng mảnh mới thấy mép.
- **"Giảm trong suốt" → mặt đặc `bg-surface`** (`dock-magnify.css` §4, móc `dock-shell`): chữ / icon trên kính đọc kém với
  người bật tuỳ chọn này; Tailwind không có biến thể `prefers-reduced-transparency` nên viết CSS tay.
- **Ô = `AppTile` 44px theo tông phân hệ (`NavModuleDef.tone`)**: cùng tông với bộ chọn / launcher trên header nên nhận ra phân hệ
  bằng màu ở mọi chỗ. Nút bánh răng cũng là `AppTile` (`neutral`) — như ô Thùng rác cuối Dock macOS.
- **Đang mở = CHẤM 4px màu mực (`fg-subheading`) cạnh ô, không tô ô**: tông ô đã chiếm màu, thêm nền / viền màu thương hiệu là hai
  tín hiệu màu chồng nhau. Vị trí chấm theo cạnh (`indicator`); quầng chỉ `dark:`.
- **Tooltip đè `dark:ring-0`**: biến thể `hint` của `Tooltip` có `dark:ring-1`, cộng `border` của ô thành hai viền
  chồng ở theme tối.

## dock/dock.theme.ts — vỏ khay HUD

- **Không `clip-path` cho vỏ thanh**: ô phóng lân cận trồi lên KHỎI viền thanh, clip là cụt đầu icon — góc "vát" thay bằng
  ngoặc 2 góc (trên-trái · dưới-phải) ở `::after`, ray sáng đỉnh ở `::before`, vệt sáng đáy bằng `inset` shadow.
- **Chỉ VỎ có lớp HUD (`DOCK_HUD_SHELL_CLASS`, toàn `dark:`), ô thì không**: ô là `AppTile` ở cả hai theme; `rounded-2xl`
  tự vuông ở tối vì thang `--radius-*` = 0 dưới `.dark` — không viết `dark:rounded-none`.

## dock/Dock.tsx

- **Máy chạm ép `pinned` chỉ ở giá trị VẼ, không ghi ngược vào store**: chế độ ẩn chỉ gọi lại được
  bằng con trỏ (cảm ứng không có `mousemove`), nên `hidden` chọn trên PC sẽ mất Dock trên tablet.
- **`edgeTriggered` suy từ `mode` đã bị máy chạm ép**, không từ `storedMode`: cảm ứng không có
  `mousemove`, nên `useDockReveal` phải được gọi SAU `useIsCoarsePointer` và nhận giá trị đã ép.
- **Panel cấu hình tự đọc store** (`magnify`, `position` — `dock-settings-panel.tsx`), `Dock` chỉ truyền `mode` ĐANG VẼ +
  `modeLocked`: truyền object `{ mode, magnify }` mới mỗi lần render qua 3 tầng làm `memo` vô nghĩa.
- **`data-dock-position` trên `<nav>`, không truyền hướng xuống từng ô**: CSS tay (phóng, bay vào) tự chọn hệ số trục theo
  cạnh; JS chỉ truyền `position` cho thứ CSS không làm được (vùng gọi ra, trục đo phóng, phía tooltip).
- **`DockItemConfig.onIntent` chạy ở `pointerenter` + `focus` của `<Link>`** (không `mouseenter`): cảm ứng có
  `pointerenter` ngay lúc chạm, sớm hơn `click`. Widget không biết nạp trước là gì — `src/app/_shell` truyền vào (base Next chưa nối: `<Link>` của Next tự prefetch khi vào tầm nhìn, `AppDock` không truyền `onIntent`).

## dock/hooks/useDockMagnify.ts · utils/dock-magnify.utils.ts · dock-magnify.css §1

- **Phóng LIÊN TỤC theo khoảng cách con trỏ** (cosine, đỉnh 1,5× ngay dưới con trỏ, lan 2,5 bước ô), không theo bậc
  `:hover +`: bậc thang nhảy theo từng ô nên chuyển động giật, và chỉ đẩy ô kề 8px trong khi ô giữa nở ~11px mỗi bên → chồng.
- **Tính trên vị trí GỐC đo lúc `pointerenter`** (`offsetLeft/Top`, tương đối tâm `<nav>` — bất biến khi vỏ nở đều hai
  đầu), không đo lại mỗi khung: đo vị trí đã phóng tạo vòng phản hồi, ô rung.
- **Dời = Σ phần nở các ô trước + nửa phần nở của nó − nửa tổng; chỉ làm mượt HỆ SỐ** (τ 70ms, không vọt lố), dời tính lại
  từ hệ số đang vẽ → khe giữa hai ô giữ ĐÚNG bề rộng gốc ở MỌI khung, kể cả lúc trôi (`dock-magnify.utils.test.ts`).
- **Vỏ nở bằng margin của con đầu + con cuối** (`--dock-grow / 2` mỗi đầu): Dock căn giữa nên nở đều hai bên, mép trên đứng
  yên (`useDockOverlap` của vỏ app đo `.dock-shell`). Tổng nở bị chặn để vỏ cách mép màn 8px (đáy) / 40px (dọc).
- **Ô phóng `z-index ≥ 2`** (lớn dần theo hệ số): `rim-glass` của vỏ là `::after` z-index 1 — thấp hơn là vạch viền vỏ cắt
  ngang ô đang nở và glyph. Panel cài đặt mở → giữ nguyên độ phóng (popover neo vào nút, nút trôi về là mũi tên lệch).
- **Không React state mỗi khung**: ghi `style.setProperty` lên con của `<nav>`; `data-dock-magnify="live"` tắt transition
  (rAF đã làm mượt) + bỏ cắt tràn `overflow-x-auto` dưới `xl`. Máy chạm / giảm chuyển động / thanh đang tràn → không phóng.

## dock/hooks/useDockReveal.ts · utils/dock-reveal.utils.ts

- **Theo dõi con trỏ bằng toạ độ** (`mousemove` trên `window`, gộp mỗi khung hình), không dùng phần
  tử vô hình + `onMouseEnter`: nó đè đáy trang nên nuốt click của nút nổi, toast, phân trang.
- **Ba vùng, không chồng nhau**: A dải kích hoạt giữa MÉP NEO → `revealArmed` (chờ `armDelay`); B khung thanh +
  8px → giữ; C còn lại → hẹn thu. B không gọi lên kẻo thanh vừa thu đã bị đánh thức lại.
- **`conceal` KHÔNG đặt lại hẹn giờ đang chạy** (`mousemove` bắn liên tục, huỷ rồi hẹn lại thì không
  bao giờ tới hạn) và giữ thanh khi panel cấu hình mở (popover neo vào nút bánh răng trên thanh).
- **`phaseRef` / `settingsOpenRef` là bản sao state** để `reveal*` / `conceal` không phụ thuộc
  `phase`: đổi identity làm effect `mousemove` tháo ra gắn lại, thanh chớp tắt.
- **Pha vẽ `stowed | opening | shown` tách hẳn khỏi chế độ `mode`** (`stowed` = "chưa được gọi ra").
  `revealDurationMs` chờ icon cuối bay xong mới sang `shown`, sớm hơn là icon giật.

## dock/parts/dock-settings-panel.tsx

- **Hàng `locked` mờ chứ không ẩn, kèm một dòng giải thích**: ẩn thì người dùng tưởng phần mềm thiếu
  chức năng; mờ mà không giải thích thì bấm không thấy gì và tưởng là lỗi.

## dock/parts/dock-option-tile.tsx

- **Hai gốc ngữ nghĩa**: `<button>` (chọn chế độ) và `<label>` (công tắc): bọc `<button>` quanh
  `<button>` là HTML không hợp lệ, trình đọc màn hình đọc sai.

## dock/parts/dock-position-picker.tsx

- **Ba "màn hình thu nhỏ" có vạch Dock ở đúng cạnh** (như System Settings của macOS): đọc ra vị trí không cần đọc nhãn;
  thứ tự trái · đáy · phải theo vị trí THẬT trên màn (`DOCK_POSITION_OPTIONS`), không theo độ phổ biến.
- **`radiogroup` + `role="radio"` / `aria-checked`**: chọn MỘT trong ba nên trình đọc màn hình phải đọc ra "đang chọn",
  điều `<button>` trơn không nói được.

## dock/dock-settings.store.ts · dock-settings.theme.ts

- **Mặc định `pinned` ở đáy, không phải `collapsed`**: `collapsed` lần đầu mở chỉ thấy tay nắm ba chấm, không ai đoán ra
  đó là thanh điều hướng; đáy là chỗ người dùng macOS tìm Dock trước.
- **`hidden` có HAI lối về**: rê vào dải kích hoạt giữa mép neo, và mục "Hiện thanh Dock" của menu người dùng
  (`toggleHidden` về `DEFAULT_DOCK_SETTINGS.mode`). Chế độ không có đường quay lại là bẫy.
- **`sanitizeDockSettings` chạy trong cả `merge` lẫn `migrate`**: zustand chỉ gọi `migrate` khi `version` lệch,
  cùng version thì trộn thẳng JSON. v2 (khoá `dock-storage`) thêm `position`: bản v1 về `bottom`, giữ `mode` / `magnify`.
- **Nhãn chế độ / vị trí (`DOCK_MODE_OPTIONS` · `DOCK_POSITION_OPTIONS`) nằm NGAY trong store** (đã gộp file constants cũ):
  store dùng chính danh sách đó để kiểm giá trị khôi phục — thêm chế độ = một hàng + khoá vào `DockDisplayMode`.
- **`useDockReserveClass` sống cạnh store, CHỈ `AppShellLayout` gọi**: luật "ghim / máy chạm mới chừa" + cạnh neo nằm một
  chỗ; layout không phải biết Dock có bao nhiêu chế độ.
- **Class panel bánh răng tách sang `dock-settings.theme.ts`**: `dock.theme.ts` cũ đã 239 dòng, thêm bảng cạnh neo là vượt
  250; panel (hàng chọn, công tắc, ô vị trí) là cụm riêng chỉ `parts/` đọc.

## tab-bar/ — TabBar.tsx · tab-bar.css · tab-bar.theme.ts

- **Ghép HUD từ `@/shared/ui` (`HUD_*`)**, không chép chuỗi: ray sáng đỉnh thanh `HUD_TOP_RAIL_AFTER`, ô sheet `HUD_LIT_FILL` /
  đang mở `HUD_ACTIVE_FILL`. Ô đang mở của THANH dốc xanh-ngọc từ ĐỈNH xuống (vạch chỉ báo ở mép trên) + icon `drop-shadow`.

- **Widget riêng, không nhét vào `dock/`**: Dock là launcher nổi kiểu macOS (hover, phóng lân cận, chế độ ẩn); điện thoại
  cần thanh PHẲNG trong luồng — hai thứ không chung hành vi nào, và `dock/` đã đủ 8 mục.
- **Chiều cao khai MỘT chỗ ở `tab-bar.css`** (`--tab-bar-h` 56px · xoay ngang thấp 44px, `--tab-bar-reach` = +1px viền):
  thanh nằm trong luồng nên vỏ không đọc; chỉ phần tử neo đáy khác (rail tiến trình) đọc `--tab-bar-reach`.
- **Sheet "Thêm" dựng bằng `Drawer side="bottom"`**: nút X, kéo-để-đóng, Esc, bấm nền, số đo chuẩn (tay nắm 20 · header 52 ·
  thân `p-4`) do kit lo; widget không có sheet riêng nên không lệch chuẩn khi kit đổi.
- **Quá 5 mục thì 4 + "Thêm"** (`layoutTabBar`); ô "Thêm" mượn icon + nhãn của mục đang mở nằm trong sheet kèm dấu "…" để
  thanh luôn nói đúng chỗ đang đứng. Mục đang mở khớp theo href DÀI NHẤT (`/reports/create` thắng `/reports`).
- **Nhãn một dòng, KHÔNG `truncate`**: `overflow-x-clip overflow-y-visible text-ellipsis` — `truncate` + `leading-4` gọt dấu
  chữ HOA tiếng Việt. Mốc `max-height: 540px` trong theme khớp `tab-bar.css` và vế xoay ngang của `phone:`.

## command-palette/CommandPalette.tsx

- **Lọc + đánh số vị trí phẳng trong MỘT `useMemo`**, không dùng biến `let` bị sửa giữa lúc render
  JSX (không thuần, vỡ dưới React Compiler). Không còn mục nào khớp → `<EmptyState>`.
- **`activeIndex` kẹp ngay trong render** (không effect): từ khoá mới làm danh sách ngắn lại, `rawActiveIndex` cũ
  trỏ ra ngoài. ↑/↓ tính từ chỉ số đã kẹp, `scrollIntoView({block:'nearest'})` trong rAF; Enter bỏ qua khi `isComposing`.
- **Reset ô tìm kiếm + vị trí trỏ khi mở lại** theo mẫu "adjust state while rendering" (so với
  `wasOpen`, không `useEffect`) — react.dev/learn/you-might-not-need-an-effect.
- **Focus vào / ra do hộp tự lo**: `onOpenAutoFocus` chặn mặc định, focus ô nhập và nhớ `document.activeElement`; `onCloseAutoFocus`
  trả focus về đó — mở qua store nên không có `Dialog.Trigger`, thiếu bước này Esc làm focus rơi về `<body>` (e2e bắt).
- **Mục đi tới trang có `href`, hàng là `<Link>`** (`parts/palette-row.tsx`) để Ctrl+click mở tab mới; click
  thường và Enter đi qua `runItem`. `CommandPaletteItem` là union `href` | `onSelect` — không thiếu / thừa cả hai.
- **`onIntent` chạy trong effect theo MỤC đang tô sáng** (`activeItem`), không theo `activeIndex`: gõ thêm chữ
  làm `flatItems` mới nhưng mục cũ vẫn sáng thì không gọi lại. Hàng nhận focus cũng thành mục sáng.

## command-palette/command-palette.theme.ts

- **Mượn `surface` (nền · viền · bóng; sáng sạch, tối quầng) + `texture` · `corner` · `topRail` của `MODAL_SLOT_CLASSES`**:
  thiếu chúng panel trông "phẳng" (`COMMAND_PALETTE_DECOR_CLASSES` / `_CORNER_CLASSES`). KHÔNG dùng `.panel` (canh giữa).
- **Điện thoại phủ TOÀN MÀN** (`phone:` — không viền, không ngoặc góc, đệm `--safe-t` / `--safe-b`); tablet vẫn hộp nổi
  nhưng thay huy hiệu Esc bằng nút X (`ModalCloseButton forced`), ẩn dải gợi ý phím (`max-lg:` + `touch:`), dòng ≥ 48px.
- **Panel neo gần đỉnh** (`top-[10dvh]`), không canh giữa như Modal — đúng quy ước spotlight, mắt
  không phải rời vùng đang thao tác.
- **`overflow-visible` ở `panel` BẮT BUỘC** (giống Modal): 4 ngoặc góc vẽ bằng margin ÂM nằm ngoài
  biên, `overflow-hidden` cắt mất. Danh sách dài đã có `overflow-y-auto` riêng ở slot `list`.
- **Không có `rounded-*`, cố ý**: UI kit dùng ngôn ngữ góc vuông / vát 45° (`modal.theme.ts`).

## command-palette/command-palette.store.ts · useCommandPaletteShortcut.ts

- **Store toàn cục thay vì `useDisclosure()`**: nút mở (Header) và hộp thoại (`AppShellLayout`) là
  hai cây component riêng, không state cha-con nào bắc cầu; giống `showToast()`.
- **Ctrl/⌘+K chỉ có MỘT nghĩa trong app: bật / tắt palette** (`/` cũng vậy, nhưng `ignoreWhileTyping` — gõ "/" trong ô
  nhập vẫn ra chữ); hook dựng trên `useKeyboardShortcut` và Ctrl/⌘+K luôn
  `preventDefault()` vì trình duyệt / extension cũng dùng Ctrl+K — không chặn thì cả hai cùng mở.
- **Mã phím + nhãn ở `command-palette.constants.ts`**: tooltip nút mở và listener đọc cùng một nguồn.

## progress-center/ — ProgressCenter.tsx · progress-center.types.ts

- **Rail neo đáy cộng `--safe-b`; ở điện thoại nâng lên trên thanh tab đáy** bằng `--tab-bar-reach` (biến toàn cục của
  `tab-bar.css`): tải lên đang chạy mà rail đè lên thanh tab thì người dùng mất đường điều hướng.

- **Một rail neo MỘT lần cho cả góc**, xếp con bằng `flex-col` + `gap`: thẻ tự neo thì phải ĐOÁN chiều cao
  thẻ kia và sớm muộn đè nhau.
- **`z-1000`**: overlay modal của app ở `z-50`; thấp hơn thì thông báo bị che đúng lúc người dùng
  cần nhìn nhất.
- **`pointer-events-none` ở rail + `*:pointer-events-auto` ở thẻ**: rail chiếm cột 384px dọc mép
  màn, bắt chuột thì nuốt click vào nội dung phía sau kể cả khi RỖNG.
- **Rail cộng `--safe-b` / `--safe-r` vào mép 1rem**: neo đáy + góc thì phải tránh vạch Home và vùng an toàn khi
  xoay ngang (`ipad-responsive.md §6`).
- **MỘT bộ trạng thái `ProgressStatus`** cho mục con, thẻ và tác vụ máy chủ (thẻ dùng tập con `ProgressCardStatus`).
  Chỉ `UploadFile.status` của UI kit được dịch — đúng một bảng ở `UploadQueueCard.tsx`.
- **Đổi / mất tài khoản → `resetProgressCenter()`** (`progress-center.lifecycle.ts`, `src/app/_providers/bootstrap.ts` gọi):
  huỷ upload đang chạy (`cancel`) + gỡ thẻ tác vụ máy chủ (việc phía máy chủ vẫn chạy tiếp).

## progress-center/card — ProgressCard.tsx · progress-card.theme.ts

- **Thẻ XONG tự đóng, thẻ LỖI ở lại**: lỗi mà tự biến mất thì người dùng quay lại không biết tệp nào chưa lên.
  `ServerTaskList` chỉ cho thẻ lỗi tự đóng khi tác vụ tự khai `autoDismissMs`.
- **Rê chuột HOẶC focus trong thẻ → dừng đếm, rời ra thì chạy TIẾP phần còn lại** (`useAutoDismiss`): thẻ không
  được biến mất lúc người dùng đang đọc / sắp bấm; focus đổi chỗ giữa các nút TRONG thẻ không tính là rời.
- **Vạch đáy thẻ = một chỉ báo, hai nghĩa**: đang chạy là tiến độ, hết chạy là thời gian còn lại trước khi tự
  đóng (`animation-play-state` khớp đồng hồ JS). Vạch `aria-hidden`; số cho trình đọc màn hình ở `ProgressCircle`.
- **Cùng ngôn ngữ `Toast` của UI kit**: vạch trái 3px, nền đục `color-mix(<trạng thái> 14%, bg-popup)`, viền màu +
  quầng CHỈ `dark:`. Icon trạng thái cùng bộ `FileCard` (`loader-outline` · `circle-check-bold` · `circle-xmark-bold`).
- **`running` dùng token `info` (lật theo theme), không `primary`**: primary của app là dải xanh VCI (đầu xanh lá), sát `success` nên
  "đang chạy" và "xong" trông như nhau. `ProgressCircle` có variant `info` để vòng % cùng màu viền thẻ.

## progress-center/upload-queue/UploadQueueCard.tsx · server-tasks/ServerTaskList.tsx

- **Vòng % của `UploadQueueCard` là tiến độ CẢ LÔ** (`(xong + lỗi) × 100 + % tệp đang tải`) / tổng:
  lấy % của từng tệp thì vòng chạy tới 100 rồi nhảy về 0 ở mỗi tệp, không ai đoán được còn bao lâu.
- **Danh sách tệp nằm sau nút mở rộng, chỉ mở SẴN khi có lỗi**: lô chạy êm thì thẻ vẫn một dòng, có lỗi thì câu lỗi
  từng tệp hiện ngay. Người dùng đã tự thu gọn thì giữ ý họ (`userExpanded ?? defaultExpanded`).
- **Nút trong thẻ cỡ `xs`, × và mũi tên là nút icon**: nút `primary` cỡ thường nặng hơn cả thông điệp. Chỉ "Thử
  lại" là `primary` — hành động duy nhất đáng kéo mắt.
- **Đang chạy KHÔNG có ×**: đóng thẻ khi tệp còn tải là mất chỗ theo dõi + huỷ; muốn dừng thì bấm "Huỷ tải lên"
  (nói đúng hậu quả).

## progress-center/upload-queue/upload-queue.store.ts · server-tasks/server-task.store.ts

- **Chạy tuần tự, không song song**: tệp nặng, mở 10 kết nối thì mỗi tệp bò một ít, không biết bao
  giờ xong tệp nào. Bộ điều phối `drain` (`runner`, `handlers`) nằm NGOÀI store.
- **Handler gắn theo TỪNG task** (`handlers`), không có handler chung: enqueue lô B khi A đang chạy không được
  làm tệp xếp hàng của A chạy bằng handler B. `retryFailed` cũng dùng handler gốc của từng tệp.
- **`cancel` sinh lượt chạy mới** (`runner = null` rồi abort): `drain` cũ còn treo ở `await` thấy mình
  không còn là `runner` thì bỏ kết quả + tiến độ muộn; handler lờ `signal` không chặn lô sau.
- **`clear` không abort, không sinh lượt mới**: upload đang chạy vẫn giữ chỗ (lô sau chờ nó xong, giữ
  "tuần tự"); `update` bỏ qua task đã xoá nên kết quả muộn không hồi sinh gì.
- **Dùng LẠI `UploadFile` / `UploadHandler` của UI kit**, không tự định nghĩa bộ trạng thái thứ hai. Khác
  `useUpload` của UI kit (state trong component, mất khi đóng modal / đổi route): store sống ngoài cây React.
- **Tác vụ máy chủ chỉ được THEO DÕI** (`useServerTasks`): store không dính SSE / WebSocket / REST — luồng
  gọi API tự bơm `update` / `finishSuccess` / `finishError`; id đã gỡ thì lời gọi muộn bị bỏ qua.

## work-tabs/ — WorkTabsRail.tsx · work-tabs.store.ts · work-tabs.utils.ts

- **Vì sao có thẻ** (2026-10-18): người dùng muốn "không phải thao tác nhiều cho mỗi chức năng phân hệ" (Kingdee / Yonyou —
  多页签); thẻ giữ chỗ đang làm (cả query) nên quay lại là MỘT chạm, không mở phân hệ → tìm màn → đặt lại bộ lọc.
- **Vì sao thành thanh dọc** (2026-10-19): người dùng muốn lịch sử "dọc, tuyệt đối, không tốn chỗ", rồi "3 icon xếp dọc + nút
  thêm, sát mép trái, gọn". Dải ngang ăn một hàng của mọi trang; 3 thẻ gần nhất đủ cho phần lớn lần quay lại.
- **Store cục bộ, app đẩy dữ liệu vào** (`visit` trong `useLayoutEffect` của `AppWorkTabs` — ô trên thanh đúng ngay khung
  hình đầu). Khoá thẻ = `pathname`; `search` lưu lần cuối để bấm thẻ về đúng bộ lọc / tab trong trang.
- **`visitedAt` tăng NGẶT** (`nextVisitStamp`): hai lần mở trong cùng ms vẫn phân được thẻ nào gần hơn — "3 thẻ gần nhất"
  và luật bỏ thẻ CŨ nhất (giới hạn 12) mới xác định. Thẻ ghim không bao giờ bị bỏ.
- **Đóng thẻ đang mở → điều hướng TRƯỚC (thẻ mở gần nhất còn lại) rồi mới xoá khỏi store**: xoá trước thì có một khung hình
  không có thẻ của màn đang đứng và `AppWorkTabs` có thể `visit` lại nó.
- **Không keep-alive**: chuyển thẻ là điều hướng thường (cuộn khôi phục bởi `useRouteScrollRestoration`); trạng thái cần giữ
  phải nằm trên URL (bộ lọc, tab) — đúng luật `navigable-controls.md`.

## work-tabs/ — thanh dọc + bảng (WorkTabsRail · parts/ · hooks/)

- **Thanh portal ra `body`, vị trí CỐ ĐỊNH 6px mép trái** (không dời theo Dock — người dùng: "luôn sát trái, không nhảy"):
  gắn ở đâu cũng không bị `backdrop-filter` / transform của cha kéo lệch. Dock trái xếp dưới nhờ `--work-tabs-rail-bottom`.
- **Mép dưới đo bằng `offsetTop + offsetHeight`**, không `getBoundingClientRect`: thanh bung bằng `scale` (`animate-pop-in`)
  nên rect lúc đầu bị co; ResizeObserver + `resize` giữ biến đúng, gỡ biến khi thanh ẩn (`usePublishRailBottom`).
- **Mở bằng rê ≠ mở bằng bấm** (`sticky`): rê (`useHoverIntent`, chỉ `pointerType: mouse`) không cướp tiêu điểm, rời chuột
  là đóng; bấm lúc đang mở-bằng-rê chỉ "ghim mở" (`preventDefault` để Radix không đảo), không đóng ngay dưới tay.
- **Bảng né Dock bằng `collisionPadding` = max(72, đáy + 8, phải + 8)** + cỡ theo `--radix-popover-content-available-*`:
  bảng mở sang phải nên đệm trái không có tác dụng — một số là đủ (kit chỉ nhận số); 72 giữ đỉnh bảng dưới header.
- **Nền ép `bg-surface` đục**: `Popover solid` (97%, không blur) vẫn lộ chữ dashboard phía sau — danh sách chữ cần đọc nhanh.
  ↑↓ dời TIÊU ĐIỂM THẬT (dòng là `<Link>`, Enter mở như bấm); rê lên dòng khác khi đang ở một dòng → tiêu điểm theo chuột.
- **Phím Ctrl + Shift + `[` / `]`**: Chrome Windows không gán; macOS ⇧⌘[ ] là phím reserved của Chrome (trang không nhận) →
  nhãn ⌃⇧ (`mod` khớp cả `ctrlKey`). Đi theo THỨ TỰ MỞ — theo độ gần đây thì bấm liên tục chỉ đảo qua lại giữa hai thẻ.
