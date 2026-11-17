# Ghi chú component — actions (`src/shared/ui/actions/`)

> Lý do thiết kế KHÔNG hiển nhiên của từng component, tách khỏi code theo
> `comment-policy.md §3`. Mỗi mục ≤ 6 gạch; chỉ ghi điều code không tự nói và rule
> chung chưa có.

## Button — màu theo theme

- **Sáng = control macOS, tối = HUD — hai bảng tách**: mỗi ô `BUTTON_SKIN_CLASSES` viết phần sáng trước, phần `dark:` sau.
  `dark:` là `:where(.dark …)` (không cộng specificity) nên `hover:` / `active:` sáng LỌT vào tối nếu ô không có
  `dark:hover:*` / `dark:active:*` riêng → đổi ô sáng thì thêm bản `dark:` giữ đúng giá trị HUD cũ (vd `active:border-accent-7`
  của nút đặc cố ý để chung, vì tối đang dùng nó khi nhấn). Kiểm bằng so computed style tối trước / sau, gồm cả rê + nhấn.
- **Quầng / dốc HUD theo tông = MỘT class đọc biến của ô** (`HUD_TONE_*`: `--btn-hud` màu, `--btn-hud-a` / `--btn-glow-a` / `--btn-hi*`
  độ đậm): mỗi ô chỉ khai biến, giá trị tính ra GIỮ NGUYÊN — thay 3–4 bản chép chỉ khác màu (ngân sách CSS tải đầu).
- **`primary` (nút mặc định)**: mặt đặc tông + rọi trên → dưới (trắng 12% → trong ở giữa → mực 6% ở đáy, chữ trắng vẫn
  ≥ 4,5:1 ở dải chữ) + `edge-hi` + viền mực `neutral-10/15` (sẫm CÙNG sắc mặt, đúng mọi Màu nhấn) + bóng nhuốm
  `--btn-tone`; rê `brightness-105` + bóng dài ra, nhấn `brightness-95` + `scale-98` + bóng thu sát.
- **`secondary` = viên nhuộm KHÔNG viền** + `edge-hi`: `base` `primary-5/12` chữ `action-base` · `accent` / `danger`
  nhuộm tông · `neutral` xám `bg-pressed` (nút phụ yên — Modal / FormActions / ConfirmDialog dùng). Rê / nhấn đậm tông dần.
- **`stroke` = mặt trắng `rim-soft` + bóng 1px** (nút thường macOS), chữ theo tông; rê / nhấn pha `--btn-tint` 6% / 12%
  VÀO `bg-surface` (đục — nút trên nền xám không ngả xám như `/6` trong suốt) + viền `border-strong`.
- **Chữ / viền nền trong là token semantic** (`action-*`, `error`), chữ trên nền ĐẶC không lật (`neutral-0`; vàng dùng
  `neutral-10` — trắng trên vàng ~1,9:1). Focus = `CONTROL_FOCUS_RING_CLASS` (quầng 3px `ring-focus` 35%, KHÔNG offset).
- **Khoá — sáng: mặt xám `bg-subtle` + viền `border-default` + chữ `fg-faint`**, không mờ (mờ mà còn màu trông như nút
  nhạt đang bật); `ghost` giữ trong suốt. Tối: mờ 50% + `saturate-[.35]`.

## Button — cỡ · hành vi

- **Cao khớp ô nhập cùng tên** (`FIELD_HEIGHT` sm 32 · md 36 · lg 40; nút thêm xs 28 · xl 44) để nút đứng cạnh ô thẳng
  hàng. Góc `rounded-md` mọi cỡ. `iconOnly` vuông (kể cả bậc `touch:`); tròn thì `rounded-2xl` (tối vẫn vuông).
- **`size` mặc định `xl`** ≠ field mặc định `md`: `<Button>` không truyền `size` ra cỡ lớn nhất; thanh công cụ dày
  truyền `size="sm"` / `"md"`.
- **`touch:` chỉ siết, không nới** (`ipad-responsive.md §1`, `§3.0`); hộp bấm ≥ 44px nhờ `::after` trong suốt
  (`touch:after:-inset-y-*`) nên nút luôn `relative` — `className` đè `absolute` / `fixed` vẫn thắng.
- **`type` mặc định `'button'`**: nút phụ trong `<form>` không tự gửi form. Nút gửi thật khai `type="submit"`.
- **`loading` (sáng)**: spinner tuyệt đối GIỮA nút; nội dung vẫn dựng nhưng trong suốt (`-webkit-text-fill-color` cho
  chữ — giữ `currentColor` cho spinner — + `opacity-0` cho icon) → nút không đổi bề ngang, `iconOnly` không tràn, tên
  truy cập còn nguyên; giữ màu đầy đủ (đang chạy ≠ khoá). Tối giữ kiểu HUD cũ: spinner thay icon đầu, mờ 80%.

## Button — tiểu tiết (`button.theme.ts`)

- **Nút KHÔNG trang trí** (không vạch góc, không vệt sáng quét): nút là tầng control (`visual-hierarchy.md §0c`).
- **Phản hồi bằng chuyển động nhỏ**: sáng nhấn `scale-98` · tối lún 1px; icon CUỐI nhích 2px khi rê. Chuyển động
  gắn `motion-safe:` / `motion-reduce:` — tắt khi giảm chuyển động (màu vẫn đổi).
- **`::after` = vùng chạm `touch:`**, `::before` để trống — đừng gắn pseudo trang trí (`rim-glass` / `rim-tile`) lên nút.
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
- **Sáng = menu macOS** (`menu.theme.ts`): dòng 32px bo `md`, dòng đang trỏ nền ĐẶC `primary-6` + chữ / icon / phím tắt trắng
  (`danger` → nền `error-6`) — nhìn là biết Enter chạy dòng nào; KHÔNG sửa `POPUP_ITEM_CLASS` vì panel select dùng chung. Mỗi lệnh
  sáng có bản `dark:` trả lại dòng HUD; lệnh tối không có gì để trả viết `not-dark:`. `shortcut` chỉ là chữ gợi ý (menu không
  bắt phím), `separatorBefore` kẻ vạch nhóm thụt hai đầu.
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
  toolbar gọn · `tab` / `tab-v2` filter có badge · `tab-hud` khớp `HudFrame` · `underline` cạnh dải tab gạch chân ·
  `wave` dải tab "uốn lượn" (khung nhìn của trang, cả trên thanh header — mục kế tiếp).
- **`skin` chỉ có tác dụng ở `subtle` và `pill` + `primary`.** `pill` + `primary` khoanh viền `ring-inset`
  (KHÔNG `border`, để segment không lệch 1px) vì mảng đặc trên bộ lọc hút mắt hơn nội dung nó đang lọc.
- `primary-solid`: fill xanh đặc + chữ trắng cho thanh công cụ CHỈ-ICON cần trạng thái đang chọn đọc được ngay.
- **`title` đặt trên chính `<button>`** nên phủ CẢ vùng bấm (kể cả đệm quanh icon), khác bọc `title` quanh riêng icon.
- **Cả nhóm là MỘT điểm Tab** (roving `tabIndex`): ←/→/↑/↓ đi vòng, Home/End; CHỌN theo focus (đổi chế độ xem rẻ, như
  radio) và bỏ qua đoạn khoá. Điểm Tab = đoạn đang chọn, đoạn đó khoá thì đoạn bật đầu tiên.
- **Đoạn khoá riêng**: sáng chỉ `opacity-50` (gọn kiểu macOS); tối = sọc chéo + chữ `fg-body/40`, không `fg-faint` (2.2:1
  trên rãnh `solid` sáng, 6.4:1 ở tối — lúc chìm mất, lúc sáng như đoạn thường). Cả nhóm `disabled` → root `opacity-50`.
- **Badge = chip LUÔN có nền, cao cố định** (18px · `subtle` 16px — thẳng giữa đoạn ở mọi cỡ; số trần đọc dính chữ:
  "Tháng 12" ≈ tháng Mười Hai): chưa chọn = mực pha trong `neutral-9/14`; đang chọn ở tối = GIẾNG tối `neutral-10/55`
  chữ trắng (đĩa trắng đặc "chói" hơn cả nhãn); số 0 / đoạn khoá → chip chìm.

## SegmentToggle — variant `wave` (tab uốn lượn)

- **Hình**: vạch nền mảnh (`--seg-wave-track`) võng thành đường cong mềm 6px dưới đoạn đang chọn (giữa dày 2px, hai đầu
  1px, dốc màu track → nhấn → track nên nối liền); rê = viên nền nhạt `rounded-2xl` (sáng tròn, tối vuông như HUD).
- **Cơ chế**: đường cong là SVG `preserveAspectRatio="none"` (cao đúng 10px = viewBox → chỉ giãn NGANG) nằm TRONG mặt
  trượt; hai cánh vạch nền là `before:` / `after:` dài `w-screen`, khung `overflow-x-clip` cắt ở mép → một đường liền.
- **Màu** (đặt trên khung qua `className` hoặc trên tổ tiên): `--seg-wave-color` · `--seg-wave-fg` · `--seg-wave-fg-muted` ·
  `--seg-wave-hover` · `--seg-wave-track` (`transparent` = chỉ còn nét cười) · `--seg-wave-ring` · `--seg-wave-badge(-fg)`.
- **Trên thanh header tự đọc `--hdr-*`** (chuỗi `var(--seg-wave-x, var(--hdr-y, token))` → `brand`: nét + chữ trắng, vạch
  `--hdr-divider`; `glass`: nét `primary-6`) — không cần `data-appearance`. Panel KHÔNG portal nằm trong header thì
  đặt lại `--seg-wave-*` (không sẽ ăn màu của thanh).
- **Cao**: đoạn 28 · 32 · 36px (`size`) + 10px dải sóng (`pb-2.5` ⇄ `SEGMENT_TOGGLE_GLIDE_BLEED_PX.wave`, đổi một thì đổi
  cả hai). Thanh 48px: `size="sm"` + `self-end` → nhãn đúng giữa thanh, sóng nằm 10px đáy. Không còn đoạn chọn → ẩn cả vạch.

## segment-toggle.theme.ts

- **Bốn file theme**: `segment-toggle.theme.ts` khung / đoạn / nhãn · `segment-toggle-tone.theme.ts` skin + badge ·
  `segment-toggle-glide.theme.ts` mặt trượt + chip trắng + biến `wave` · đoạn con ở `parts/` (item, sóng).
- **Hai theme, một ô**: class trần cho sáng — rãnh `bg-pressed` + bóng lõm `inset 0 1px 1.5px shadow-popup` + viền trong
  `divider-soft`; chip `bg-surface` + `edge-hi` + bóng 2 lớp + viền 0.5px. `dark:` giữ HUD (`dark:shadow-none` trên rãnh).
- **Cao = Button / ô nhập cùng cỡ**: `pill` / `glass` đoạn 28 · 32 · 36px (đệm dọc, segment `h-auto` — KHÔNG thêm `h-*`
  vào bảng cỡ) + rãnh 2px mỗi phía = 32 · 36 · 40px. `solid` 36 · `tab*` 32 · `subtle` 28 tự định.
- **Nhãn: chọn semibold, nghỉ medium `fg-muted`** (tối giữ medium). Đổi nét không xô hàng nhờ BÓNG MA: nhãn chuỗi / số chép
  vào `data-label`, `::after` vô hình cao 0 nét semibold giữ sẵn bề ngang (`dark:after:hidden`); nhãn JSX không có.
- **Mặt trượt** (`useSegmentGlide`) ở `pill` · `solid` · `glass` · `underline` · `wave`: span con đầu của root, toạ độ ghi
  thẳng vào style; trượt 220ms `cubic-bezier(0.2,0.8,0.2,1)` (≈70% quãng trong 70ms đầu), `motion-safe:` only.
- **Focus `ring-3` `ring-focus/35`** (như ô nhập; tối `ring-2` đặc) + `z-10`; `subtle` `ring-inset`. Hộp bấm `::after`
  cảm ứng ở mọi variant trừ `tab-hud` (ngoặc góc) và `subtle` (`overflow-hidden`); hover luôn `enabled:hover:`.

## ThemeToggle

- **Điều khiển từ ngoài (controlled)**: UI kit KHÔNG đọc `@/domains/preferences` — biết tới store là lôi cả cây
  store vào mọi nơi dùng UI kit (showcase, test). `src/app/shell/AppHeader.tsx` nối với store.
- **Icon, tooltip và `aria-label` chỉ chế độ ĐÍCH**, KHÔNG `aria-pressed`: nút có `aria-pressed` thì tên phải cố
  định (WAI-ARIA APG) — tên đổi + pressed đọc thành "Chuyển sang chế độ sáng, đã nhấn", người nghe hiểu ngược.
- **Cỡ icon đi qua prop `size` của `SystemIcon`** (style inline thắng mọi `[&>svg]:size-*` không có `!`); Header ép
  về 16px bằng `[&>svg]:size-4!`. Icon mang `key` theo tên nên đổi theme là remount + `animate-pop-in`.
