# Ghi chú component — actions (`src/shared/ui/actions/`)

> Lý do thiết kế KHÔNG hiển nhiên của từng component, tách khỏi code theo
> `comment-policy.md §3`. Mỗi mục ≤ 6 gạch; chỉ ghi điều code không tự nói và rule
> chung chưa có.

## Button — màu theo theme

- **Chữ/viền nền trong (`secondary` · `stroke` · `ghost`) là token semantic** (`action-*`, `error`), KHÔNG bậc
  số: thang `-1..-10` không lật theme (`primary-7` 3.40:1 trên surface dark, `primary-5` 2.28:1 trên trắng).
- **Chữ trên nền ĐẶC không lật**: `text-neutral-0` trên xanh / đỏ / slate; `accent.primary` dùng `text-neutral-10`
  vì `fg-heading` lật thành trắng ở dark — chữ trắng trên vàng chỉ ~1.9:1.
- **`secondary` theo skin**: `base` viền nhạt `border-default` + bóng mảnh (ít viền, rõ lớp), hover ngả primary + bóng
  dài ra · `neutral` nền xám `bg-pressed` · `accent` / `danger` nền `/10` + viền `/50` · `ghost` có
  `border-transparent` cho cùng bề ngang.
- **Nền hover trung tính là `bg-pressed` → active `bg-track`**, không `bg-subtle`: `bg-subtle` trùng `bg-dialog` ở
  dark và gần như trắng ở light. Focus `ring-2 ring-ring-focus`, KHÔNG `ring-offset` (dải trắng ở dark).
- **Nút đặc có chiều sâu** (`BUTTON_SOLID_DEPTH`): sáng = gờ trắng 1px đỉnh + bóng nhuốm `--btn-tone` (bậc 7–8),
  rê bóng dài ra (nhấc), nhấn bóng thu vào trong (lún; tối cũng lún, tắt quầng). HUD (`hud.theme.ts`, chỉ dark):
  `primary` = dốc sáng đỉnh → đậm đáy + gờ 1px + quầng tone (`base` dùng `HUD_SOLID_PRIMARY`, tông khác chép cùng
  công thức) + bóng chữ mảnh; rê chỉ nâng đáy dốc + quầng to hơn, KHÔNG sáng đỉnh (chữ trắng trên `primary-4` < 2:1).
  `secondary` / `stroke` = mặt rọi sáng theo tone
  (`neutral` dùng `HUD_PANEL_FILL` ngả `sky`), rê viền sáng + quầng trong; `ghost` rê = dốc nhạt.
- **Khoá = mờ 50% + ngả xám (`saturate-[.35]`) + tắt bóng** ở cả hai theme: mờ mà còn đủ màu / còn quầng trông như
  nút nhạt đang bật. `loading` trả lại `saturate-100` (đang chạy, không bị cấm). `dark:` là `:where(.dark …)` — KHÔNG
  cộng specificity nên mỗi `hover:` / `active:` sáng phải có bản `dark:hover:` riêng.

## Button — cỡ · hành vi

- **`size` mặc định `xl`** (cao 44px, đệm ngang 20px) ≠ field mặc định `md` (36px): `<Button>` không truyền `size`
  ra cỡ lớn nhất; trong thanh công cụ dày truyền `size="sm"` hoặc `"md"`.
- **`touch:` chỉ siết, không nới** (đệm ngang chỉ tốn chỗ, không giúp bấm trúng; `xs` đã là sàn). Dùng `touch:`
  thay `max-xl:` vì nó bắt nhầm desktop thu nhỏ và sót iPad Pro ngang (`ipad-responsive.md §1`, `§3.0`).
  Hộp bấm ≥ 44px nhờ `::after` trong suốt (`touch:after:-inset-y-*` theo `size`) nên nút luôn `relative`;
  `className` đè `absolute` / `fixed` vẫn thắng.
- **`type` mặc định `'button'`**, không phải `'submit'` của HTML: nút phụ trong `<form>` sẽ gửi form, bôi đỏ
  khắp nơi và gọi mutation 2 lần. Nút gửi thật khai `type="submit"` (xem `FormActions`).
- **`loading`**: `<Spinner color="inherit">` theo `text-*` của nút, `size-full` theo ô icon (không tràn ở `xs`);
  `aria-busy:opacity-80` thắng `disabled:opacity-50` (variant `aria-*` sinh sau) — khác nút khoá.

## Button — tiểu tiết (`button.theme.ts`)

- **Nút PHẲNG ở mọi kiểu** (không vạch góc, không vệt sáng quét): nút là tầng control — trang trí ở từng nút làm cả màn rối
  (`visual-hierarchy.md §0c`). Bản 2026-10-05 có vạch góc + vệt quét đã gỡ sau khi người dùng báo "rối".
- **Phản hồi bằng chuyển động nhỏ, không bằng trang trí**: nhấn lún 1px (`active:translate-y-px`), icon CUỐI nhích 2px khi rê
  (báo trước hướng "Tiếp ›"); cả hai tắt khi giảm chuyển động.
- **`::after` = vùng chạm `touch:`**, `::before` để trống — đừng gắn pseudo trang trí lên nút.
- **Kiểu trục ở `button.types.ts`** (barrel xuất từ đó): `button.theme.ts` khoá bảng class theo kiểu mà không import ngược `Button.tsx`.

## Menu

- **Chỉ chặn `click` nổi lên cha, KHÔNG chặn `pointerdown`**: portal bubble theo cây React nên chọn mục kích
  hoạt luôn `onClick` của row chứa menu; Radix đóng lớp nổi bằng `pointerdown` — chặn nó thì lớp nổi chồng nhau.
- **`modal={false}` khi một mục mở tiếp Dialog**: menu modal khoá `pointer-events` của body, đóng Dialog
  bằng click ngoài thì body kẹt `pointer-events: none`.
- **`onCloseAutoFocus`** `(e) => e.preventDefault()` khi mục mở input focus riêng (đổi tên inline), để
  input `autoFocus` giữ được focus.
- **`open` / `onOpenChange`**: Radix chỉ tự đóng khi chọn một `Item`, không đóng khi bấm nút trong `header`
  (hàng emoji thả cảm xúc) — điều khiển `open` từ ngoài.
- **Mục disabled dùng `title` gốc (`hint`), không bọc `Tooltip`**: Tooltip phá focus/keyboard của menu Radix.
- **Bề mặt, dòng, icon từ `overlays/popup-surface.theme`** (chung `Popover`); `menu.theme.ts` thêm `min-w-[220px] py-1`,
  trần `max-h` theo `--radix-popper-available-height` + `max-w` màn − 1rem (menu dài cuộn, `collisionPadding={8}`),
  icon sáng `action-base` theo `group` của dòng; `danger` đổi CẢ chữ, vạch `before:` và nền highlight sang `error`
  (dải sáng tối = `::before` của dòng nên đổi `before:bg-*` là đổi theo). Dark: icon dòng đang trỏ có quầng
  `drop-shadow`; `header` mặt rọi sáng, vạch ngăn mờ hai đầu (`MENU_HEADER` / `MENU_SEPARATOR_CLASSES`).
- **Submenu (`MenuOption.children`) + lựa chọn đơn (`checked`) — dựng trên thứ kit ĐÃ CÓ, không tự vẽ lại**: dòng đang chọn =
  `POPUP_ITEM_CHECKED_CLASS` + dấu ✓ `POPUP_ITEM_CHECK_CLASS` (icon `check-outline` 12) — nguồn DUY NHẤT ở `popup-surface.theme.ts`,
  `Dropdown` cũng ghép đúng hằng này; mũi tên → cuối dòng dùng `POPUP_ITEM_ICON_CLASS`; khung submenu = `MENU_CONTENT_CLASSES`.
  Radix cần `RadioGroup` bọc `RadioItem`, nên mọi mục `checked` trong CÙNG một danh sách gom thành một nhóm (`renderMenuOptions`).
  Mở submenu bằng phím → / Enter hoặc rê chuột; mục cha KHÔNG phát `onSelect`. `ContextMenu` (chung kiểu `MenuOption`) bỏ qua
  `children` / `checked` — menu chuột phải trên dòng bảng không cần cài đặt kiểu chọn.

## ContextMenu

- Chung `MenuOption[]` với `Menu`; lý do `click` / `modal` / `onCloseAutoFocus` y hệt `Menu`.
- `children` bọc Trigger `display:contents` → không tạo box, không phá flex/grid của hàng chứa nó. Cần
  merge lên đúng element (`<tr>` trong bảng, span bọc làm hỏng cấu trúc bảng) thì dùng `asChild`.

## SegmentToggle

- **Chọn variant theo ngữ cảnh**: `pill` cấp trang · `glass` trong header panel · `solid` đầu trang · `subtle`
  toolbar gọn · `tab` / `tab-v2` filter có badge · `tab-hud` khớp `HudFrame` · `underline` cạnh dải tab gạch chân.
- **`skin` chỉ có tác dụng ở `subtle` và `pill` + `primary`.** `pill` + `primary` khoanh viền `ring-inset`
  (KHÔNG `border`, để segment không lệch 1px) vì mảng đặc trên bộ lọc hút mắt hơn nội dung nó đang lọc.
- `primary-solid`: fill xanh đặc + chữ trắng cho thanh công cụ CHỈ-ICON cần trạng thái đang chọn đọc được ngay.
- **`title` đặt trên chính `<button>`** nên phủ CẢ vùng bấm (kể cả đệm quanh icon), khác bọc `title` quanh riêng icon.
- **Cả nhóm là MỘT điểm Tab** (roving `tabIndex`): ←/→/↑/↓ đi vòng, Home/End; CHỌN theo focus (đổi chế độ xem rẻ, như
  radio) và bỏ qua đoạn khoá. Điểm Tab = đoạn đang chọn, đoạn đó khoá thì đoạn bật đầu tiên.
- **Đoạn khoá riêng = sọc chéo + chữ `fg-body/55` (tối `/40`)**, không `opacity`, không `fg-faint` (`fg-faint` ra 2.2:1
  trên rãnh `solid` sáng, 6.4:1 ở tối — lúc chìm mất, lúc sáng như đoạn thường; pha `fg-body` giữ ~3:1 mọi rãnh). Cả
  nhóm `disabled` → root `opacity-50`, không sọc. Badge = chip LUÔN có nền (số trần đọc dính chữ: "Tháng 12" ≈ tháng
  Mười Hai): chưa chọn = mực pha trong `neutral-9/14` (thấy trên mọi rãnh, kể cả lúc rê); đang chọn ở tối = GIẾNG tối
  `neutral-10/55` chữ trắng — đĩa trắng đặc sáng hơn cả nhãn (người dùng khoanh "chói"); số 0 / đoạn khoá → chip chìm.

## segment-toggle.theme.ts

- **Hai theme, một ô**: class trần cho nền sáng (rãnh `bg-subtle` / `bg-pressed`, thumb `bg-surface` + bóng
  `shadow-popup` + chữ `action-base`); `dark:` = rãnh `bg-input` + `HUD_LIT_FILL` + viền `primary-5/30`, mục bật
  `HUD_ACTIVE_FILL` (nền màu cũ PHẢI về `transparent`, không thì dốc mờ nằm trên khối đặc). Skin màu của `subtle`
  cùng dáng theo `--segment-tone`; `neutral` chỉ vạch đáy `fg-muted` (không ngả brand); `primary-solid` = `HUD_SOLID_PRIMARY`.
- **`pill` và `glass` CÙNG hình học** (rãnh viền `ring-inset` 1px — KHÔNG `border`; cao 28 / 32 / 36px ở `sm` / `md` /
  `lg`), khác thumb: `pill` primary đặc, `glass` mặt `bg-surface`.
- **`size` chỉ đổi đệm của `pill` / `glass`** (segment `h-auto`, KHÔNG thêm `h-*` vào bảng cỡ — sẽ đè đệm); variant
  khác tự định chiều cao theo Figma. Chữ màu trên nền sáng dùng token theo theme (`action-base`, `info`…), không `-5`.
- **Nhãn một nét cho cả hai trạng thái** (`SEGMENT_TOGGLE_LABEL_VARIANT_CLASSES`): đổi nét khi chọn làm segment
  co giãn 1–2px và cả hàng xô lệch. Hover của segment chưa chọn viết `enabled:hover:` để segment disabled đứng yên.
- **Mặt trượt** (`segment-toggle-glide.theme.ts` + `useSegmentGlide`) ở `pill` · `solid` · `glass` · `underline`: MỘT span
  con đầu của root, toạ độ ghi thẳng vào style (không re-render); lần đo đầu ép tính style rồi mới bật `data-ready` →
  không trượt từ góc trái. Ô `active` của 4 variant này CHỈ màu chữ. `underline` cao thêm 1px (`*_GLIDE_BLEED_PX`)
  để vạch đáy đè `border-b` của root. `subtle` (vạch chia) · `tab*` (đoạn rời / khung riêng) không trượt.
- **Hộp bấm `::after` trên cảm ứng** ở mọi variant trừ `tab-hud` (ngoặc góc là `::before` / `::after`) và `subtle`
  (`overflow-hidden`); nới dọc 6px mỗi phía. Focus `ring-2` + `z-10`; `subtle` dùng `ring-inset`.

## ThemeToggle

- **Điều khiển từ ngoài (controlled)**: UI kit KHÔNG đọc `@/domains/preferences` — biết tới store là lôi cả cây
  store vào mọi nơi dùng UI kit (showcase, test). `src/app/shell/AppHeader.tsx` nối với store.
- **Icon, tooltip và `aria-label` chỉ chế độ ĐÍCH**, KHÔNG `aria-pressed`: nút có `aria-pressed` thì tên phải cố
  định (WAI-ARIA APG) — tên đổi + pressed đọc thành "Chuyển sang chế độ sáng, đã nhấn", người nghe hiểu ngược.
- **Cỡ icon đi qua prop `size` của `SystemIcon`** (style inline thắng mọi `[&>svg]:size-*` không có `!`); Header ép
  về 16px bằng `[&>svg]:size-4!`. Icon mang `key` theo tên nên đổi theme là remount + `animate-pop-in`.
