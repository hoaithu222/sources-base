# Ghi chú code — widgets (`src/shared/widgets/`: dock · tab-bar · command-palette · progress-center)

> Lý do thiết kế KHÔNG hiển nhiên của các widget, tách khỏi code theo `comment-policy.md §3`.
> Mỗi mục ≤ 6 gạch; chỉ ghi điều code không tự nói và rule chung chưa có. Header: `widgets-header.md`.

## dock/dock.theme.ts

- **`DOCK_SOFT_HOVER_CLASSES` chỉ áp khi `!magnify`**: `scale-*`/`translate-*` của Tailwind v4 là thuộc
  tính CSS riêng, còn `dock-magnify.css` dùng `transform` — bật cả hai thì cộng dồn, lỗi câm.
- **`DOCK_ENTER_CLASS` gắn lên `<span>` bọc glyph, không phải ô bấm**: ô bấm đã mang transform phóng
  lân cận, hai transform trên một phần tử đè nhau → giật. Chỉ chạy ở `data-dock-state="opening"`.
- **Hằng JS phải khớp `dock-magnify.css`**: `DOCK_DURATION.{shellOpen,iconEnter,iconStagger}` và
  `DOCK_TRIGGER_ZONE` (= `.dock-hint` 120×22). Lệch → icon giật hoặc thanh không lên.
- **`DOCK_MAGNIFY_*` chỉ là class móc**: rule thật ở `dock-magnify.css` vì `:hover +` /
  `:has(+ :hover)` không là utility. Vạch ngăn KHÔNG mang class item — làm đứt chuỗi anh em.
- **`DOCK_ROOT_STATE_CLASSES.concealed` BẮT BUỘC `pointer-events-none`**: thanh vẫn ở DOM chỗ cũ, thiếu
  cờ là chắn click cả dải ngang đáy trang. Vệt `DOCK_HINT_CLASS` cũng `pointer-events: none` vĩnh viễn.
- **`DOCK_SLOT_CLASSES.glyph` là `<span>` riêng + hậu tố `!`**: `[&>svg]` chỉ khớp con trực tiếp (giữa
  `<a>` và `<svg>` có `<span>` này), và `SystemIcon` đặt width/height bằng inline style nên phải `!`.

## dock/dock.theme.ts — bề mặt · chỗ chừa

- **`DOCK_RESERVE_CLASS` = chỗ chừa trong LUỒNG khi `pinned`**: thanh `fixed` không chiếm chỗ nên trang cao trọn
  `<main>` nằm dưới thanh. Cao = đáy 16px + ô 44px + `py-2` + viền 2px — đổi cỡ ô / đệm `root` thì sửa cả đây.
- **Chỉ `pinned` chừa chỗ, không đụng `SHELL_GUTTER_Y`**: `autohide` / `collapsed` / `hidden` chỉ hiện thanh TẠM nên
  phủ lên là đúng ý; máy chạm bị ép `pinned` nên luôn có chỗ chừa (cỡ `touch:` nhỏ hơn).
- **Kính `bg-surface/85` + `backdrop-blur`**: sáng viền `border-default` + bóng mềm; tối viền `border-popup`, quầng
  primary 14% và ray đỉnh `::before` — chỉ `dark:`.
- **Ô đang mở = nút bánh răng đang mở** (`border-primary-5/50 bg-nav-active text-link`): một bộ cho "đang bật";
  glyph `primary-5` trên nền sáng chỉ ~2.3:1. Vạch `indicator` sáng `primary-6`, quầng chỉ `dark:`.
- **Tooltip đè `dark:ring-0`**: biến thể `hint` của `Tooltip` có `dark:ring-1`, cộng `border` của ô thành hai viền
  chồng ở theme tối.

## dock/dock.theme.ts — vỏ khay HUD

- **Không `clip-path` cho vỏ thanh**: ô phóng lân cận trồi lên KHỎI viền thanh, clip là cụt đầu icon — góc "vát" thay bằng
  ngoặc 4 góc ở `::after` (8 lớp gradient một pseudo), ray sáng đỉnh ở `::before`, vệt sáng đáy bằng `inset` shadow.
- **Ô = tile viền mảnh, ô đang mở = xanh lá pha ngọc dâng từ đáy + quầng** (cùng sắc chip tab header / tab `folder`); tất
  cả CHỈ `dark:` — sáng giữ hộp kính trắng + ô `bg-nav-active` như cũ.

## dock/Dock.tsx

- **Máy chạm ép `pinned` chỉ ở giá trị VẼ, không ghi ngược vào store**: chế độ ẩn chỉ gọi lại được
  bằng con trỏ (cảm ứng không có `mousemove`), nên `hidden` chọn trên PC sẽ mất Dock trên tablet.
- **`edgeTriggered` suy từ `mode` đã bị máy chạm ép**, không từ `storedMode`: cảm ứng không có
  `mousemove`, nên `useDockReveal` phải được gọi SAU `useIsCoarsePointer` và nhận giá trị đã ép.
- **Panel cấu hình tự đọc store** (`dock-settings-panel.tsx`), `Dock` chỉ truyền `mode` ĐANG VẼ +
  `modeLocked`: truyền object `{ mode, magnify }` mới mỗi lần render qua 3 tầng làm `memo` vô nghĩa.
- **`DockItemConfig.onIntent` chạy ở `pointerenter` + `focus` của `<Link>`** (không `mouseenter`): cảm ứng có
  `pointerenter` ngay lúc chạm, sớm hơn `click`. Widget không biết nạp trước là gì — `app/shell` truyền vào.

## dock/useDockReveal.ts · dock-reveal.utils.ts

- **Theo dõi con trỏ bằng toạ độ** (`mousemove` trên `window`, gộp mỗi khung hình), không dùng phần
  tử vô hình + `onMouseEnter`: nó đè đáy trang nên nuốt click của nút nổi, toast, phân trang.
- **Ba vùng, không chồng nhau**: A dải kích hoạt → `revealArmed` (chờ `armDelay`); B khung thanh +
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

## dock/dock-settings.store.ts · dock-settings.constants.ts

- **Mặc định `pinned`, không phải `collapsed`**: base chỉ có MỘT phân hệ mẫu — `collapsed` lần đầu
  mở chỉ thấy tay nắm ba chấm, không ai đoán ra đó là thanh điều hướng.
- **`hidden` có HAI lối về**: rê vào dải kích hoạt giữa mép dưới, và mục "Hiện thanh Dock" của menu người dùng
  (`toggleHidden` về `DEFAULT_DOCK_SETTINGS.mode`). Chế độ không có đường quay lại là bẫy.
- **`sanitizeDockSettings` chạy trong cả `merge` lẫn `migrate`**: zustand chỉ gọi `migrate` khi `version` lệch,
  cùng version thì trộn thẳng JSON. Đổi tên / bỏ một chế độ: tăng `version`.
- **Nhãn UI ở `dock-settings.constants.ts`, store chỉ mượn danh sách `value` để kiểm**: thêm chế độ = thêm
  một hàng `DOCK_MODE_OPTIONS` + khoá vào `DockDisplayMode`, store tự nhận.

## tab-bar/ — TabBar.tsx · tab-bar.css · tab-bar.theme.ts

- **Ghép HUD từ `@/shared/ui` (`HUD_*`)**, không chép chuỗi: ray sáng đỉnh thanh `HUD_TOP_RAIL_AFTER`, ô sheet `HUD_LIT_FILL` /
  đang mở `HUD_ACTIVE_FILL`. Ô đang mở của THANH dốc xanh-ngọc từ ĐỈNH xuống (vạch chỉ báo ở mép trên) + icon `drop-shadow`.

- **Widget riêng, không nhét vào `dock/`**: Dock là launcher nổi kiểu macOS (hover, phóng lân cận, chế độ ẩn); điện thoại
  cần thanh PHẲNG trong luồng — hai thứ không chung hành vi nào, và `dock/` đã đủ 8 mục.
- **Chiều cao khai MỘT chỗ ở `tab-bar.css`** (`--tab-bar-h` 56px · xoay ngang thấp 44px, `--tab-bar-reach` = +1px viền, giữ cho
  code cũ): thanh nằm trong luồng nên vỏ không đọc. Phần tử neo đáy khác (toast, rail tiến trình) đọc `--bottom-chrome` — chiều cao THẬT (cả vạch Home)
  do `useBottomChromeInset` đo bằng ResizeObserver, gỡ khi thanh không dựng (danh sách mục rỗng, laptop dùng Dock).
- **Sheet "Thêm" dựng bằng `Drawer side="bottom"`**: nút X, kéo-để-đóng, Esc, bấm nền, số đo chuẩn (tay nắm 20 · header 52 ·
  thân `p-4`) do kit lo; widget không có sheet riêng nên không lệch chuẩn khi kit đổi.
- **Quá 5 mục thì 4 + "Thêm"** (`layoutTabBar`); ô "Thêm" mượn icon + nhãn của mục đang mở nằm trong sheet kèm dấu "…" để
  thanh luôn nói đúng chỗ đang đứng. Mục đang mở khớp theo href DÀI NHẤT (`/demo/ghep` thắng `/demo`).
- **Nhãn một dòng, KHÔNG `truncate`**: `overflow-x-clip overflow-y-visible text-ellipsis` — `truncate` + `leading-4` gọt dấu
  chữ HOA tiếng Việt. Mốc `max-height: 540px` trong theme khớp `tab-bar.css` và vế xoay ngang của `phone:`.

## command-palette/CommandPalette.tsx

- **Lọc + đánh số vị trí phẳng trong MỘT `useMemo`**, không dùng biến `let` bị sửa giữa lúc render
  JSX (không thuần, vỡ dưới React Compiler). Không còn mục nào khớp → `<EmptyState>`.
- **`activeIndex` kẹp ngay trong render** (không effect): từ khoá mới làm danh sách ngắn lại, `rawActiveIndex` cũ
  trỏ ra ngoài. ↑/↓ tính từ chỉ số đã kẹp, `scrollIntoView({block:'nearest'})` trong rAF; Enter bỏ qua khi `isComposing`.
- **Reset ô tìm kiếm + vị trí trỏ khi mở lại** theo mẫu "adjust state while rendering" (so với
  `wasOpen`, không `useEffect`) — react.dev/learn/you-might-not-need-an-effect.
- **`focusSearchInput` (`onOpenAutoFocus`) gọi `preventDefault` rồi tự focus ô nhập**: Radix tự focus
  phần tử đầu tiên là đúng ý, chỉ cần chặn scroll-into-view giật cục trên panel neo cố định.
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
- **Ctrl/⌘+K chỉ có MỘT nghĩa trong app: bật / tắt palette**; hook dựng trên `useKeyboardShortcut` và luôn
  `preventDefault()` vì trình duyệt / extension cũng dùng Ctrl+K — không chặn thì cả hai cùng mở.
- **Mã phím + nhãn ở `command-palette.constants.ts`**: tooltip nút mở và listener đọc cùng một nguồn.

## progress-center/ — ProgressCenter.tsx · progress-center.types.ts

- **Rail neo đáy cộng `max(--bottom-chrome, --safe-b)`**: ở điện thoại nằm trên thanh
  tab đáy (chiều cao thật do `TabBar` đo) — tải lên đang chạy mà rail đè lên thanh tab thì người dùng mất đường điều hướng.

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
- **Đổi / mất tài khoản → `resetProgressCenter()`** (`progress-center.lifecycle.ts`, `app/bootstrap.ts` gọi):
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
- **`running` dùng token `info` (lật theo theme), không `primary`**: primary của app là xanh lá, trùng `success` nên
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
