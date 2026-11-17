# Ghi chú component — surfaces (`src/shared/ui/surfaces/panels/`, `surfaces/splitter/`, `surfaces/inset-group/`)

> Lý do thiết kế KHÔNG hiển nhiên của từng component, tách khỏi code theo
> `comment-policy.md §3`. Mỗi mục ≤ 6 gạch; chỉ ghi điều code không tự nói và rule
> chung chưa có. Thẻ KPI / tóm tắt: `surfaces-cards.md`; khung HUD: `surfaces-hud.md`.

## Surface

- **Một nguồn cho bộ ba `border border-border-default bg-bg-surface`** và đệm ép về đúng 4 bậc: gõ tay
  mỗi chỗ một kiểu đệm thì các hộp cạnh nhau lệch nhịp.
- **Cố ý chỉ 4 bậc đệm**: cần số ngoài thang thì truyền `className` — việc phải viết ra là tín hiệu
  để soát lại xem có thật cần không.
- **`tone="sunken"` (`bg-subtle`)** dùng khi hộp nằm TRÊN một `bg-surface` khác, cần tách lớp. Góc mặc định
  `rounded-lg` (tầng bề mặt — tối về 0); `rounded` ép bo 8px ở CẢ HAI theme. `sunken` không đổ bóng nghỉ (mặt lõm).
- **`interactive` chỉ đổi phản hồi hình** (viền `primary-5/60` + bóng mềm khi rê, vòng `ring-focus`): hộp bấm được
  phải là `<button>` / `<a>` thật (`as="button"`) thì bàn phím và trình đọc màn hình mới với tới.
- **Cần tiêu đề thì dùng `BoxPanel`**, đừng dựng hàng tiêu đề tay bằng `Surface`.
- **Theme tối = mặt panel HUD**: `HUD_PANEL_FILL` + viền `sky-5/30` (ánh xanh trung tính, không ám màu thương hiệu) + quầng TRONG rất
  nhẹ; rê → `HUD_HOVER_GLOW` (`dark:hover:` thắng `hover:` vì variant tuỳ biến `dark` xếp sau). PanelCard `plain`,
  FilterDisclosure, ô ảnh lỗi dùng cùng mặt này.

## BoxPanel

- **`bodyOverflow="hidden"` PHẢI kèm `flex flex-col`**: thiếu nó thân là khối `block`, con cao đúng bằng
  nội dung; có rồi thì con chỉ cần `min-h-0 flex-1` là giãn hết phần dôi.
- **Slot `headerRight` — `shrink-0` ở ≥ 1024px**; dưới 1024px hoặc `touch:` lật thành co + `overflow-x-auto`
  để dư thì CUỘN, không bị `overflow-hidden` của panel cắt cụt nút cuối (`ipad-responsive.md §4`).
- **`overscroll-x-contain` bắt buộc đi kèm** cuộn ngang: thiếu nó, vuốt hết thanh là Safari hiểu
  thành "lùi trang" và đẩy người dùng ra khỏi màn (`ipad-responsive.md §4.1`).
- **`description` không `truncate`** (cắt đi là mất phần giải thích) và chỉ hiện ở `variant="default"`:
  `cyber` uỷ quyền header cho `DetailPanelHeader`, không có chỗ cho nó.
- **`border`**: `hairline` 1px cho panel danh sách / panel lồng trong trang; `strong` 2px cho panel
  ĐỨNG RIÊNG là khối ngoài cùng của trang (`visual-hierarchy.md §2`). Theme tối: mọi panel có viền được mặt rọi; CHỈ
  `strong` có ngoặc 4 góc (`before:-inset-0.5`) + ray sáng đỉnh header — `hairline` nằm lặp trong lưới, ngoặc mỗi ô là nhiễu (§0c).
- **Dấu `//` nghiêng trước tiêu đề** (hai vạch `-skew-x-[24deg]`, vạch sau nhạt 55%, MỘT gradient) + `body-14-semibold` chữ
  thường; quầng `drop-shadow` + dải chuyển sắc header + vạch ngăn ánh xanh CHỈ ở theme tối. Vạch ghim dòng đầu (`items-start`).

## BoxInfo

- **8 tone cách nhau ΔE(Lab) ≥ 22** thì chấm 8px mới phân biệt được: `accent` dùng `orange-5` vì `yellow-5`
  trùng `warning`; `primary` dùng `primary-3` để tách khỏi `success` bằng độ sáng.
- **Một nguồn màu `BOX_INFO_TONE_TOKENS`** cho chấm · thanh tiến độ · quầng sáng (chỉ khai bậc giữa,
  gradient suy ra ở ± 1): thêm tone mới là thêm MỘT dòng ở đó.
- **Root không khai `border-*`**: viền do `<HudCorners frame>` vẽ cùng gốc toạ độ với ngoặc góc
  (`surfaces-hud.md`); border của root là hai nét lệch 2px.
- **Viền 1px nên MÀU gánh tương phản**: `--hud-frame-c` là teal-7 (sáng) / teal-5 (tối) để qua ngưỡng 3.0
  của thành phần phi-chữ; teal pha loãng ở theme sáng là mất viền.
- **Nền pha teal vào `bg-surface`/`bg-subtle`** (một gradient khác hue với viền teal là lệch sắc). Sọc chéo
  header, quầng chấm / thanh tiến độ CHỈ ở tối; nút đóng hover `bg-nav-hover` (`bg-subtle` chìm trong dialog tối).
- **Cột % dùng `text-fg-muted`, không `text-warning`**: cam là màu TRẠNG THÁI. Số dùng `formatNumber`
  (vi-VN), không `toLocaleString()` (đọc locale trình duyệt).

## PanelCard

- **Gói header + khung + trạng thái tải / rỗng + nút phóng to / đóng vào MỘT hợp đồng API**: 6-8 box một màn
  dựng tay sẽ lệch nhau. KHÔNG thêm trục "màu" — màu đi qua `tone` của `HudFrame`.
- **`title` là `string`**: `aria-label` của nút đóng / phóng to ghép câu từ nó; chữ thường semibold như `BoxPanel`.
  `titleNote` là prop riêng (`fg-muted`, bé một bậc): nối vào `title` thì con số ăn cỡ + nét chữ của tên.
- **Header LUÔN nhận `title` dạng ReactNode**: nhánh `string` của `DetailPanelHeader` dồn `flex-1` + `truncate`
  vào CÙNG một span không co → cụm nút bị cắt cụt ở màn hẹp.
- **Cụm nút `shrink-0` là thứ duy nhất không co** (cột ~260-300px ở laptop 14"): nút giữ `size="xs"`, chỉ icon
  co theo `density`; vùng chạm nới bằng `::after` ở `touch:` (`ipad-responsive.md §3.3`).
- **`notch=false` mặc định** vì card chứa chart / bảng vuông. `overlay` nền ĐỤC pha `bg-surface`, bóng token
  `shadow-popup`, KHÔNG `backdrop-blur`: layer composited rơi vào nửa pixel thiết bị làm chữ "chưa nét". `plain` theme
  tối cùng mặt `Surface` (`HUD_PANEL_FILL` + viền `sky-5/30`).
- **Thân `overflow-hidden`**: `auto` sẵn thì chart tính cao lệch 1px là mọc thanh cuộn (cần cuộn →
  `bodyClassName="overflow-auto"`). `flushBody` bỏ đệm thân nhưng ô trạng thái giữ đệm.

## Splitter

- **Đo khung bằng `ResizeObserver` tới khi có kích thước** (mount trong tab ẩn → pane dùng `flex-basis`);
  đo được rồi thì KHÔNG tự co theo khung — cỡ người dùng đã kéo được giữ, chỉ kẹp khi kéo.
- **Vùng chạm**: tay nắm giữ ĐÚNG 4px, `::after` trong suốt ở `touch:` nới ra 24px (`-inset-*-2.5`); nới bề dày vạch thì
  giao diện trông bị phóng to (`ipad-responsive.md §3.2`, `§3.3`).
- **`aria-orientation` là hướng của VẠCH** (chia ngang ⇒ vạch dọc); hover / kéo / focus cùng tô `primary-5`, focus
  thêm vòng `ring-focus`. Theme tối: nghỉ `divider-strong` (`divider-default` chìm hẳn trên nền navy), rê / kéo / đường
  xem trước = `primary-4` + quầng.
- **`sizedSide="second"`**: pane chốt ở bên phải nên đảo dấu `delta`; pane còn lại `flex-1` nuốt khoảng dôi —
  dùng khi thứ GIỮA là nội dung chính (`[cây | bảng | chi tiết]`).
- **Style inline của pane khai `flexGrow: 0` tường minh** vì `paneSecond` mang sẵn `flex-1`. `offscreen` giữ
  nguyên kích thước: canvas WebGL co về 0 sẽ sinh lỗi framebuffer.

## useSplitterDrag

- **Kéo bằng POINTER events, không phải mouse**: Safari iPad không giả lập chuỗi chuột cho thao tác kéo;
  `PointerEvent` kế thừa `MouseEvent` nên desktop không đổi gì.
- **`setPointerCapture` + `touch-none` + `pointercancel`**: capture giữ sự kiện khi ngón tay trượt ra ngoài,
  `touch-none` để trình duyệt không cướp cử chỉ cuộn; thiếu `pointercancel` thì `dragging` kẹt `true`.
- **Bàn phím**: tay nắm `tabIndex=0` nhận ← → (dọc: ↑ ↓) bước 10px, Shift 50px, đảo dấu theo `sizedSide="second"`.
- **Class `splitter-resizing-x|y` trên `<body>`** giữ cursor resize cho cả trang trong lúc kéo (không nhảy về
  default khi qua phần tử khác) và chặn bôi đen chữ; gỡ khi thả.

## InsetGroup · InsetGroupRow

- **Hộp nhóm kiểu System Settings của macOS, KHÔNG phải panel**: tiêu đề nằm NGOÀI hộp, dòng = ô `AppTile` xs · tên +
  dòng phụ · giá trị / điều khiển — đọc nhanh "có gì, bao nhiêu, bấm vào đâu". Khi nào dùng thay `Table` / `BoxPanel`:
  `reuse-first.md` §3.3.
- **Vạch ngăn THỤT VÀO vẽ bằng `::before` + biến `--inset-group-divider`** (48px khi có ô icon, 12px khi không): bắt đầu
  sau ô icon, dừng trước lề phải, dòng đầu không vạch — `divide-y` kẻ mép tới mép nên không dùng được.
- **Dòng bấm được (`href` → `<Link>`, `onSelect` → `<button>`) KHÔNG nhận `control`**: nút / công tắc lồng trong liên kết
  là lỗi a11y và cú bấm rơi nhầm đích. Dòng tĩnh mới đặt `control`.
- **`role="list"` / `listitem`** cho hộp và dòng: trình đọc màn hình báo "danh sách n mục" như System Settings; có
  `title` thì hộp gắn `aria-labelledby`.
- **Ba mặt theo NỀN chứa nó**: `raised` (trắng + viền + `rim-soft`) trên nền trang · `sunken` (xám nhạt, không viền) trong
  một bề mặt trắng · `glass` (kính + `rim-glass`) CHỈ trên nền có màu — kính trên nền trơn thành hộp xám bẩn.
- **Dòng cao tối thiểu 44px** (`min-h-11`): đủ vùng chạm trên máy chạm mà không cần `touch:` riêng.
