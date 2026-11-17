# Ghi chú component — overlays (`src/shared/ui/overlays/`)

> Lý do thiết kế KHÔNG hiển nhiên của từng lớp nổi, tách khỏi code theo
> `comment-policy.md §3`. Mỗi mục ≤ 6 gạch; chỉ ghi điều code không tự nói và rule
> chung chưa có. Giao diện dùng chung của Modal · FormModal · Drawer · ConfirmDialog · CommandPalette:
> mục `## modal.theme`.

## Modal

- **Panel chặn nổi bọt `click` / `keydown` / `pointer` / `submit`** ra cây React cha: portal vẫn bubble theo
  cây React (type-ahead của Tree cướp focus, form ngoài submit theo form trong).
- **Footer mặc định bọc `w-full`** vì wrapper footer căn phải, thiếu thì 2 nút `flex-1` co lại. Mô tả
  `pl-[21px]` = dấu `//` 11px + `gap-2.5` để thẳng cột với chữ tiêu đề.
- **Không header thì body bọc `Description`**: Radix cần Description truy cập được khi thiếu Title.
- **`frame="hud"`**: vát 18px, viền 2px → đỉnh trong 18.83px (2√2; làm tròn thì viền chỗ vát dày mỏng khác); `frameEdge` +
  `frameFill` hai lớp, bóng `drop-shadow` (`border` không theo `clip-path`). Viền sáng 55/22/55%, tối 95/40/95% + quầng.
- **Body KHÔNG `[scrollbar-gutter:stable]`**: gutter chỉ chừa cạnh phải nên body lệch so với header + footer.
  Cần chống jitter thì truyền `[scrollbar-gutter:stable_both-edges]` qua `bodyClassName`.
- **Điện thoại (`phone:`) gần toàn màn**: rộng `100vw − 16px`, cao `100dvh − 16px − vùng an toàn`, thân `overflow-auto` tự cuộn,
  footer cộng `--safe-b`; tiêu đề KHÔNG `truncate` (xuống dòng) và `items-center` để ✕ canh giữa khối tiêu đề.

## ModalCloseButton

- **Một nút cho mọi lớp nổi** (Modal · FormModal · ConfirmDialog · Drawer · CustomModalLayout · CommandPalette): mỗi nơi
  chép một chuỗi class thì cỡ, vòng focus, vùng chạm trôi khác nhau.
- **Không `onClick` → `Dialog.Close`**: đóng chính Dialog đang bọc, kể cả khi uncontrolled; có `onClick` thì là nút thường
  dùng ngoài Dialog.
- **`forced` = `hidden max-lg:flex touch:flex`**: `showClose={false}` chỉ ẨN ở máy tính; tablet / chạm ngón không có Esc nên
  luôn có ✕. Hộp thoại khoá cứng / tự vẽ nút đóng tắt hẳn bằng `forceCloseOnTouch={false}` của Modal.
- **Vùng chạm 44px nới bằng `::after`** (`-inset-1.5` quanh ô 32px; ô 40px ở tablet cho ~50px), không nới hình: `touch:` chỉ
  siết. Icon 20px trong ô 40px phải `[&>svg]:size-5!` vì `SystemIcon` ghi cỡ bằng inline style.
- **`floating`** khi panel không có header: nổi góc phải-trên (`my-0` bỏ `-my-1` của nút chung), nền đặc `max-lg:bg-bg-dialog`
  để đọc được trên mọi nội dung; panel chừa `max-lg:pt-12` cho nút khỏi đè nội dung.

## CustomModalLayout

- **Header là hai lớp cùng hình vát** (`headerBand` = màu viền, `headerBandFill` thụt 1.5px) vì `border` không đi
  theo `clip-path`; chamfer 16px ↔ 15px đi đôi, fill dùng màu ĐẶC (alpha thì lớp accent bên dưới lộ hết).
- **Tiêu đề chữ thường `body-16-semibold` + `titleBar` = dấu `//` (`HUD_TITLE_MARK`, đồng bộ BoxPanel)**: hàng `items-start` +
  dấu `mt-1` (16px giữa dòng 24px) → tiêu đề dài xuống dòng (điện thoại) thì dấu vẫn đứng ở dòng ĐẦU, không trôi giữa khối.
- **`close` có `relative`**: `headerBand` (absolute) đứng trước trong DOM sẽ phủ lên nút nếu thiếu.
- **Footer hairline `before:`** thay `border-t` phẳng: sáng `divider-strong` mờ hai đầu, tối xanh 40%; tắt bằng
  `before:hidden` khi `showDividerFooter={false}`.
- **Màu chữ phải là token tự đảo theme** (`fg-heading`): `text-neutral-0` là trắng, vô hình trên nền
  trắng của light theme.

## FormModal

- **Thang `size` riêng, rộng hơn Modal** (sm 560 · md 800 · lg 960 · xl 1200 so với 400 · 520 · 640 · 768): form xếp
  nhãn + ô theo 2 cột. `max-h-[90dvh]` vì `90vh` trên Safari iPad đẩy hàng nút ra ngoài màn (`ipad-responsive.md §5`); tablet / điện thoại thân
  `overflow-y-auto` — form dài cuộn trong thân, nút Lưu không bị cắt.
- **`submit` bắt lỗi ở CẢ hai nhánh** vì ném lỗi là API có chủ đích (`form-validation.md §4`): không bắt thì
  unhandled rejection hoặc mất thông tin lỗi. Bắt xong KHÔNG đóng modal.
- **Lượt gửi gắn với PHIÊN mở** (`async-safety.md` luật 1 · 3): `useLatestRequest` vô hiệu khi `open` về `false`
  nên kết quả về muộn không đóng modal đã mở lại; chặn gửi đúp bằng ref vì state chưa kịp render.
- **Tự giữ `open` khi uncontrolled + id form bằng `useId`**: đóng SAU `await` nên không dùng `Dialog.Close`
  được; nút submit ở footer gắn `form` theo id — id cố định làm FormModal lồng nhau submit nhầm form ngoài.
- **Tiêu đề hiển thị CHÍNH LÀ `Dialog.Title`** (`asChild`, giữ nguyên hoa / thường) — không có bản `sr-only` song song
  phải giữ đồng bộ. `aria-describedby={undefined}`: không có vùng mô tả, khai rõ để Radix khỏi cảnh báo mỗi lần mở.
- **`autoFocusFirst` mặc định `true`** (Modal thì `false`): Radix mặc định focus nút đóng nên người dùng phải
  bấm ra ô nhập; `preferForm` bỏ qua nút footer để Enter không submit nhầm.

## ConfirmDialog

- **Phân vai màu — đừng đảo**: KHUNG = brand green cố định (`--hud`); màu ngữ nghĩa CHỈ ở gem + nút hành động +
  quầng sau gem, qua `--accent`. Cho màu lái cả khung thì nền navy mất, chữ và gem tụt tương phản.
- **Bố cục CỐ Ý khác FormModal**: FormModal là màn nhập liệu (tiêu đề trái, khung chữ nhật); ConfirmDialog là
  khoảnh khắc quyết định nên dồn về trục giữa, khung vát — hai hệ phải nhìn ra ngay là khác nhau.
- **Nền xếp ba lớp**: `aura` (quầng sau gem; sáng `opacity-30` — alpha trên trắng đọc mạnh hơn trên navy) · `counterGlow`
  (chống chết nền nửa dưới) · `sheen` (vệt chéo giả kính); hai lớp sau + bóng màu quanh nút chính CHỈ ở dark.
- **Nút đặc tự khai đi từ bậc -7** (success green-7→9, warning yellow-7→9): chữ trắng trên green-6 chỉ
  2.6:1, yellow-6 2.1:1; bậc -7 đạt 4.3:1 / 3.5:1. Gem + `--accent` vẫn bậc -5, cánh gem 2px (1px đọc ra vết xước).
- **Đóng bằng `DialogPrimitive.Close`, không tự `onOpenChange(false)`**: ở chế độ uncontrolled prop đó là
  `undefined`; `Close` hạ cờ nội bộ VÀ vẫn bắn `onOpenChange(false)` cho caller controlled.
- **3 nút `gap-2` + `whitespace-nowrap`**: nhãn nhiều từ tự ngắt dòng làm nút lệch cao. Nút phụ giữ skin `base` (hai
  nút cùng màu ngữ nghĩa triệt tiêu điểm nhấn); `busy = loading || secondaryLoading` khoá cả hàng nút + ✕.

## Drawer

- **Mép quay vào trang**: tối = `border-*-2` 45% + ray `inset 2px` 55% = 4px, CỐ Ý — ĐỪNG xoá ray (nhận diện hệ lớp
  nổi), thấy dày thì hạ ĐÚNG MỘT lớp. Sáng = viền 1px `border-default` + cùng ray 2px + bóng đổ VỀ PHÍA TRANG.
- **Shadow ghi đủ chuỗi tĩnh ở từng side** (4 ô `DRAWER_SIDE_CLASSES`, mỗi ô một chuỗi sáng + một chuỗi `dark:`):
  Tailwind chỉ quét văn bản, không resolve template `${…}`. Đổi shadow chung là sửa 4 chỗ.
- **Đồng bộ Modal**: overlay `MODAL_OVERLAY_CLASS`; tối thêm ngoặc góc `::before` + ray đỉnh `::after` (`z-20`, trên header) +
  span vân lưới `MODAL_SLOT_CLASSES.texture` (body / footer / tay nắm `relative` để vân nằm DƯỚI chữ); tiêu đề có dấu `//`
  ở cột riêng nên mô tả tự thẳng chữ tiêu đề. Body không `scrollbar-gutter` — lý do ở mục `Modal`.
- **✕ thêm `-mr-1`** (cùng `-my-1` của nút chung): sát mép phải, tâm nút 32px trùng tâm dòng tiêu đề 24px. Tablet / điện thoại
  `-mr-0.5 my-0` để ✕ 40px cách mép phải 14px.
- **Bottom-sheet ở tablet / điện thoại = số đo CHUẨN**: tay nắm 20px · header 52px (tiêu đề canh GIỮA ✕ 40px, ✕ cách mép phải
  14px) · thân `p-4` ⇒ lề trái nội dung = lề tiêu đề = 16px · đáy 16px + `--safe-b` · cao THEO NỘI DUNG (`max-lg:h-auto`, trần
  = màn − `--safe-t` − 24px). Nơi dùng KHÔNG tự cộng padding — đã từng đệm đôi 16 + 12px.
- **Tay nắm kéo-xuống-đóng nằm NGOÀI vùng cuộn + `touch-none`** (`useDrawerDragClose`): chỉ vuốt xuống, thả quá 80px thì
  đóng — không tranh với cuộn thân; ✕ ở header vẫn là lối đóng chính. Header chỉ canh giữa khi KHÔNG có `description`.

## DrawerSection

- **Vì sao có**: các khối trong ngăn kéo từng dựng tay cùng một class (`border + bg-dialog-raised`) → mọi vùng giống hệt nhau,
  người dùng không tách được "tiến độ" với "thông tin" (báo 2026-10-06). Mỗi vùng giờ một `tone` riêng.
- **Một tông = 2 biến CSS**: `--section-tone` (vạch nhấn trái 2px, viền pha 30%, vạch dưới tiêu đề, dốc nền tối) · `--section-ink`
  (icon + tiêu đề in hoa — đậm hơn ở sáng, sáng hơn ở tối để đọc rõ). Thêm tông = thêm MỘT dòng `DRAWER_SECTION_TONE_CLASSES`.
- **Class màu qua biến ghi rõ kiểu** `text-[color:var(…)]` / `bg-[color:var(…)]`: `text-[var(…)]` Tailwind không biết là màu hay cỡ
  chữ, tailwind-merge có thể xoá nhầm `text-caption-12-semibold` đứng cùng.
- **Danh sách tự có đệm dòng** (InfoRow `py-2.5`) → `bodyClassName="py-0"` để khỏi đệm đôi.

## Popover

- **`anchorOnly`**: `Popover.Trigger` gắn toggle vào `onClick` nên combobox tự mở theo focus bị toggle ngược
  ("nháy"); bật thì `open` do caller sở hữu, click vào anchor chặn ở `onInteractOutside`.
- **`container`**: trong Modal (Radix Dialog) truyền node DialogContent, nếu không content portal
  ra body, nằm ngoài vùng `RemoveScroll` nên wheel-scroll bị chặn.
- **`collisionBoundary`**: panel nổi trên pane con thì viewport còn trống nên Radix tưởng thừa chỗ. `null` phải
  thành `undefined` — Radix coi `null` là một biên hợp lệ (rỗng).
- **`onCloseAutoFocus`**: `preventDefault()` rồi `focus({ preventScroll: true })` để trình duyệt
  không cuộn vùng chứa trigger vào tầm nhìn (hay gặp ở panel `overflow-y-auto`).
- **Viền 1px như mọi lớp nổi** (bỏ `border-2` 2026-10-06 — dày trông nặng; độ NÉT đến từ màu sky sáng + gờ sáng mép trong +
  đường tối ngoài cùng + bóng sâu của `popup-surface.theme.ts`). `solid` = không blur,
  viền `border-strong` (sáng) / xanh lá 60% + quầng (tối). `arrow` bật `overflow-visible`: bề mặt `relative` +
  `overflow-hidden` (và `backdrop-filter` của `glass`) làm khung chứa của mũi tên → mũi tên nằm ngoài hộp bị cắt mất.
- **Điện thoại**: `collisionPadding` mặc định 8px (Radix mặc định 0 = dính mép) và panel `max-h` = chỗ còn lại do Radix đo
  rồi cuộn. `sheetOnPhone` đổi hẳn sang ngăn kéo đáy có ✕ — chỉ cho nội dung KHÔNG mở lớp nổi lồng (ngăn kéo là Dialog
  modal nên Select / lịch portal ra `body` bị khoá chuột).

## Tooltip

- **`data` dựng đúng bề mặt tooltip biểu đồ** (`buildChartStyles().tooltip` của `@/shared/charts`) để rê lên
  dòng danh sách và cột biểu đồ ra CÙNG một hộp. Sửa bề mặt ở đây thì sửa cả hai nơi.
- **`data` TẮT `backdrop-filter`**: nó ép panel thành composited layer riêng, mà hộp số liệu bám
  con trỏ nên toạ độ luôn lẻ → chữ bị nội suy, mờ đúng lúc người dùng đọc số.
- **Nền tooltip ĐẶC hoàn toàn** (`hint`: sáng `neutral-9`, tối `bg-dialog` + `ring-1 hud-5/45`): nền 60% / 97% đều để chữ
  phía sau lộ qua (người dùng báo 2026-10-06). **Mũi tên CÓ VIỀN**: `Arrow asChild` → khung cắt 14×7 + ô vuông xoay 45° viền
  cùng màu viền hộp; là con của hộp nên đè lên viền → chân mũi tên liền (`data` viền nằm trong hộp nên dịch lên 1px).
- **`data-state` của Radix Tooltip là `delayed-open` | `instant-open` | `closed`** (KHÔNG có `open`) —
  viết `data-[state=open]:` thì animation không bao giờ chạy.
- **Tối = HUD nhẹ, hai biến thể vẫn khác nhau**: `hint` nền `bg-dialog` + vòng 1px xanh + `HUD_LIT_FILL`; `data` nền popup +
  viền xanh 40% + `HUD_PANEL_FILL`; cả hai ray đỉnh `::after` + quầng. ⚠️ `data` (tối) lệch `CHART_TOOLTIP_SURFACE` (style
  inline, không có `dark:`) — chờ chủ `shared/charts` đồng bộ.

## Toast

- **`select-text cursor-text` ở vùng chữ** đè `user-select: none` mà Radix gắn inline lên `<li>`
  gốc, để người dùng bôi đen và copy được nội dung thông báo.
- **`stopMouseSwipe`**: Radix lệch 2px là cướp pointer (`setPointerCapture`) → mất vùng chọn. Chặn nổi bọt ở
  vùng chữ cho CHUỘT là đủ; chạm / pen vẫn vuốt được.
- **Màu loại = token trạng thái** (`warning` cam, không vàng): nền `<loại>` 14% pha `bg-popup` → `bg-popup` 65% + vạch
  trái 3px `before:`. Tối: dốc 24% → 6% → `bg-popup`, vạch trái + icon phát sáng, ray đỉnh `::after` CÙNG TONE loang từ
  vạch (ray xanh lá chung lệch nghĩa với toast lỗi). Chữ token tự đảo (`fg-heading`) — `text-neutral-0` vô hình ở light.
- **Căn hàng**: icon tròn 28px, action + ✕ `h-7`, thân chữ `py-1` → tâm tiêu đề 20px trùng tâm icon / nút.
- **Viewport neo góc dưới-phải đã cộng `--safe-b` / `--safe-r`**; toast trượt vào từ phải, đóng mờ dần. Điện thoại: rộng ≤ màn −
  16px (`w-full` + `right-4` từng tràn trái 16px), neo `max(--bottom-chrome, --safe-b)` + 12px (`--bottom-chrome` = chiều cao thật của thanh tab, do `TabBar` đo) để nằm TRÊN thanh tab đáy; nút ✕
  32px + vùng chạm 44px ở tablet / chạm (`::after`).

## toast.store · toast.api

- **Dedup 500ms theo `type + title + description`**: hai nơi cùng toast một câu trong nháy mắt chỉ hiện một.
  `add` trả `''` khi bị dedup — caller không được dùng nó làm `id` để dismiss.
- **`showToast` là API mệnh lệnh của chính component Toast nên nằm trong UI kit** (`@/shared/ui`), không
  ở `shared/utils`: đặt ở utils là chiều `utils → ui` duy nhất, với sâu vào ruột UI kit.
- **`showErrorToast` không tự quyết lỗi nào được báo** — nó gọi `claimErrorMessage` của `@/core/http`,
  cùng hàm bộ báo lỗi tập trung dùng, nên một lỗi không bao giờ thành hai toast (`notes/code/core.md`).

## modal.theme

- **Nằm ở gốc `overlays/`, không trong folder Modal**: Modal · FormModal · CustomModalLayout · Drawer · ConfirmDialog
  và widget CommandPalette cùng dùng — helper dùng chung lên cấp nhóm (`component-structure.md §6`).
- **Bảng hằng `MODAL_SLOT_CLASSES` + `MODAL_HUD_SLOT_CLASSES`**, không hàm sinh class: `Modal` chọn bộ theo
  `frame`, FormModal / CommandPalette đọc thẳng bộ mặc định.
- **Lớp phủ kính mờ — 3 tham số cân nhau, đừng chỉnh lẻ**: `bg-black/45` giữ ngữ cảnh · `blur-[12px]` bù độ phủ
  thấp · `saturate-125` cứu màu xỉn. `MODAL_OVERLAY_CLASS` (nền + fade) dùng chung mọi lớp phủ toàn màn.
- **Nút ✕ trung tính** (`MODAL_CLOSE_CLASSES` qua `ModalCloseButton`, chung Modal · CustomModalLayout · Drawer · ConfirmDialog): hover
  `bg-nav-hover` (tối thêm viền trong + quầng xanh), không đỏ / không phóng — ✕ là đóng, không phải xoá; `enabled:` để nút
  đang khoá (`busy`) không sáng.
- **✕ `-my-1`**: nút 32px không đẩy cao header (Modal = CustomModalLayout = 48px) và tâm nút trùng tâm dòng tiêu đề
  24px; ConfirmDialog (✕ `absolute`) trả lại `my-0`.

## modal.theme — bề mặt panel

- **Sáng sạch, tối HUD**: sáng = viền 1px `border-default` + 2 drop shadow `shadow-popup`, vân lưới ẩn, ray / ngoặc
  không bóng; `border-2` xanh, halo, inset glow chỉ qua `dark:`.
- **Slot `surface`** (nền + viền + bóng, không canh giữa) để CommandPalette mặc đúng bề mặt Modal mà không chép
  chuỗi shadow.
- **Ngân sách ánh sáng xanh (tối)**: chỉ một quầng mảnh + MỘT lớp inset, độ nổi do drop shadow trung tính — nhiều
  lớp xanh chồng nhau đọc ra dải phát sáng dày thay vì viền sắc.
- **Canh giữa bằng `inset-0 m-auto h-fit`, KHÔNG `left-1/2 -translate-x-1/2`**: Tailwind v4 phát `translate` thành thuộc tính riêng nên
  panel thành phần tử bị dịch — viền màn lẻ (1495px) + panel 1400px ⇒ x = 47,5px, Chrome vẽ cả panel ở nửa pixel, chữ và
  đường kẻ nhoè. `h-fit` bắt buộc (có `inset-0` mà cao `auto` thì panel kéo kín màn); `size="auto"` là `w-fit` vì `w-auto` cũng bị kéo kín.
- **Panel `overflow-visible`, ngoặc góc dùng `-m-2`**: absolute tính từ padding box nên ngoặc nằm hẳn ngoài viền (khe
  5px sáng / 4px tối); `overflow-hidden` ở panel làm ngoặc biến mất (cắt nội dung đã có ở tầng dưới).
- **`texture` lấy alpha qua `text-primary-5` + `opacity-*`**, không `color-mix` trong gradient: Lightning CSS
  sinh fallback màu đặc → lưới xanh chói. `topRail` có `z-10` vì `headerBand` đứng sau trong DOM.

## useOpenAutoFocus

- **Radix mặc định focus vào chính panel** nên người dùng phải bấm / Tab thêm một nhịp mới gõ được;
  hook `preventDefault()` rồi tự tìm ô nhập đầu tiên.
- **Chờ một khung hình** (`requestAnimationFrame`): Radix dựng thân panel TRƯỚC khi bắn sự kiện,
  nhưng field của react-hook-form có thể mount bất đồng bộ (`defaultValues` là promise).
- **`preferForm`** (FormModal) tìm bên trong `<form>` để bỏ qua nút đóng ở header; nút submit KHÔNG nằm
  trong selector — tránh rơi vào "Xác nhận" ngay lúc mở (Enter submit nhầm).

## popup-surface.theme

- **Gom Menu · ContextMenu · Popover (+ panel select qua `FIELD_POPUP_*`) vào một nguồn** (`popup-surface.theme.ts`):
  chép tay thì viền và màu quầng trôi khỏi palette. Tối: viền `hud-4/55` + gờ sáng mép trong đỉnh + đường tối 1px ngoài cùng
  (tách khỏi nền) + quầng sky nhẹ + bóng đổ sâu — CHỈ ở `dark:`.
- **Bề mặt chỉ có `::after` = ray đỉnh** (`relative`, `z-10` để dòng đang trỏ không che); KHÔNG ngoặc góc — lớp nổi nhỏ là tầng
  dưới khung (`visual-hierarchy.md §0c`), `::before` để trống. Ngoặc góc chỉ ở Modal / Drawer.
- **Dòng ĐANG CHỌN dùng chung: `POPUP_ITEM_CHECKED_CLASS` + dấu ✓ `POPUP_ITEM_CHECK_CLASS`**: `Dropdown` (`DROPDOWN_ITEM_CLASSES`) và `Menu`
  (`MENU_RADIO_ITEM_CLASSES`, lựa chọn đơn `checked`) ghép cùng một hằng — chép tay thì hai nơi trôi khỏi nhau (chữ đậm, quầng, vạch trái).
- **Vạch trái của `POPUP_ITEM_CLASS` là `before:` `w-0.5` co giãn `scale-y`**, không `border-l`: dòng không nhảy.
  Tone khác (menu `danger`) đổi CẢ `before:bg-*`, nền và chữ `data-[highlighted]:`.
- **Tối: pseudo kéo hết dòng + `mask-image`** → vạch 2px đặc + dải sáng loang sang phải lấy ĐÚNG màu nền pseudo, nên `danger`
  tự ra dải đỏ mà menu.theme không phải khai gì; dòng `isolate` + `before:-z-10` để dải nằm SAU chữ / icon.
