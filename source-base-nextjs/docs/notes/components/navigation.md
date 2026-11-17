# Ghi chú component — navigation (`src/shared/ui/navigation/`)

> Lý do thiết kế KHÔNG hiển nhiên của từng component, tách khỏi code theo
> `comment-policy.md §3`. Mỗi mục ≤ 6 gạch; chỉ ghi điều code không tự nói và rule
> chung chưa có.

## Pagination

- **Dải LUÔN `shrink-0`**: là con cuối của flex column dưới vùng cuộn, khung thấp thì trình duyệt bóp ĐÚNG dải
  này (nút bị xén). Phần dôi phải trừ vào VÙNG CUỘN (`min-h-0 flex-1`).
- **`tabular-nums` khai tường minh** (`visual-hierarchy §3.3`) để dãy nút trang không nhảy bề rộng khi 9 → 10;
  `styles/base/document.css` đã đặt trên `body`, khai lại là chốt chặn.
- **`maxPageButtons` là NGƯỠNG thu gọn, không phải trần số nút**: `pageCount` ≤ ngưỡng thì hiện hết;
  vượt thì chỉ còn đầu · cuối · hiện tại · hai trang kề + `…` (tối đa 7 phần tử, bất kể ngưỡng).
- **Điện thoại: hai hàng, KHÔNG bớt trang**: [Kết quả · cỡ trang] rồi [‹ trang ›] canh giữa (`phone:`); nút trang
  `min-w-7` + khe 4px để 9 phần tử vừa 320px, dư thì tự xuống dòng (`flex-wrap`) — không cuộn, không ẩn.
- **Mọi nút là `Button secondary`, trang đang xem là `primary`**; theme tối phủ HUD qua `PAGINATION_PAGE_STATE_CLASSES`
  (nghỉ: mặt rọi + rê sáng · đang xem: `HUD_ACTIVE_FILL`) — phải khai `dark:bg-bg-surface` + `dark:hover:/active:` vì nền
  ĐẶC của `primary` che mất dốc. `touch:px-*` đè đệm nới của Button `sm` ở máy chạm để giữ ô vuông.
- **Root là `<nav aria-label>` với nhãn `ui.navigation.pagination.label`**; nút số dòng = mặt ô chọn (`fieldSurface({ focusMode: 'trigger' })` + `w-auto`
  bỏ `w-full` của field) nên đổi cùng Dropdown, mang `data-[state=open]` của Menu để viền + mũi tên báo đang mở.

## ScrollEdgeNav

- **KHÔNG `return null` khi chưa tràn ngang**: unmount là mất `ResizeObserver`, khung hẹp lại (mở
  panel bên cạnh) thì nút không bao giờ hiện lại. Ẩn bằng opacity, giữ hook sống.
- **Máy chạm hiện thường trực** (`touch:opacity-100`): iPad không có "rê chuột vào" (`ipad-responsive §7`).
  KHÔNG dùng `touch:group-hover:*` — `:hover` iPadOS dính, nút chớp tắt.
- **Nút DẸT cao đúng một dòng bảng**, không thành dải dọc trông như bộ nút hành động thứ hai. Lớp bọc tắt
  pointer để không cướp click, nút `pointer-events-auto`; `z-30` để nằm trên ô GHIM (sticky).
- **HUD tối: `dark:hover:shadow-[…]` gộp CẢ bóng đổ lẫn quầng** trong một chuỗi — tailwind-merge giữ một `shadow` mỗi
  trạng thái, tách ra thì rê chuột mất bóng đổ (nút nổi trên nội dung cuộn phía sau).

## useScrollEdgeNav

- **Nối nhịp (`STEP_CHAIN_MS`)**: giữa lúc cuộn `smooth`, `scrollLeft` đang ở giữa đường — lấy làm gốc thì cú
  bấm thứ hai ra ĐÚNG mốc đang chạy tới. Bấm liên tiếp tính từ ĐÍCH nhịp trước; quá hạn thì đo lại thật.
- **Giữ nút**: cộng thẳng `scrollLeft` theo giây (`scrollBy` smooth mỗi khung hình chồng animation và giật).
  Cờ nuốt cú `click` khi nhả reset ở ĐẦU mỗi lượt — nhả ngoài nút thì `click` không bắn, cờ treo nuốt oan.
- **`getStops` gọi lại ở MỖI lần bấm** (không cache) nên cột kéo giãn ra mốc đúng ngay; cuộn tới toạ độ
  TUYỆT ĐỐI (`scrollTo`). Phải ổn định reference (`useCallback`) vì `<ScrollEdgeNav>` là `memo`.
- **Chỉ `setEdges` khi kết luận đổi** (so `prev` trước khi set): set object mới mỗi nhịp `scroll` là
  render lại cả bảng.
- **rAF gom tín hiệu cùng khung hình về MỘT lần đo**: đọc `scrollWidth` ép trình duyệt tính lại
  layout, mà sự kiện `scroll` bắn liên tục.
- **Quan sát CẢ vùng cuộn lẫn lớp nội dung** (`ResizeObserver`); `MutationObserver` bám sang phần tử mới khi
  lưới đổi HẲN lớp nội dung (empty-state ↔ thân bảng), không thì đo cái đã gỡ.

## scroll-snap.utils

- **MỘT hằng `SCROLL_EDGE_EPSILON`** cho cả việc so mép (`useScrollEdgeNav`) lẫn so mốc (`resolveScrollStop`):
  hai ngưỡng lệch nhau thì nút báo còn cuộn được mà bấm không nhích.
- **Đo bằng `getBoundingClientRect()` chứ KHÔNG `offsetLeft`**: ô ghim là `position: sticky` nên
  `offsetLeft` đã cộng cả phần trượt theo cuộn, lấy ra lệch đúng bằng `scrollLeft`.
- **Khối cột ghim nằm `sticky left-0`** nên `scrollLeft` = tổng bề rộng các cột cuộn ĐÃ đi qua: không cộng
  khối ghim vào mốc, nhưng trừ nó khỏi vị trí ô đo được vì cột cuộn đầu tiên nấp ngay sau khối.
- **`resolveScrollStop` kẹp mốc vào `[0, max]` rồi bỏ trùng**: cột nằm ngoài tầm cuộn đều rơi về đúng mép
  nên nhịp cuối KHÔNG bị "chết" tại chỗ.
- **`measureColumnStops` xuất qua `scroll-edge-nav/index.ts`**: `<Table>` (nhóm khác) lấy từ cổng công khai
  của ScrollEdgeNav, không chui vào file utils.

## Stepper

- **Mỗi bước tự mang đoạn nối PHÍA SAU nó** (`role="listitem"`, bước active có `aria-current="step"`).
  `horizontal-center`: cột chia đều `flex-1`, nối `absolute` từ mép chấm tới mép chấm kế (`calc(±50% + nửa chấm + 8px)`).
- **`horizontal-inline`**: nối là flex item `flex-1` sau tiêu đề, `relative top-* -translate-y-1/2` về tâm chấm.
  `vertical`: nối `absolute` dưới tâm chấm, kéo tới đáy bước; khoảng giữa hai bước là `pb-6` của khối chữ.
- **Toạ độ = nửa cỡ chấm**: `sm` 20px → `top-2.5` / `left-2.5`, `md` 24px → `top-3` / `left-3`; dòng tiêu đề cao
  20px nên khối chữ `md` có `pt-0.5` để ngang tâm chấm. Đổi cỡ chấm phải đổi cả ba chỗ.
- **Màu theo trạng thái, đọc được ở nền trắng**: tiêu đề `fg-heading` (done / active) · `fg-muted` (pending) ·
  `text-error`. Chữ bậc `-3` (`primary-3` / `red-3`) chỉ ~1.5:1 trên trắng — chỉ dành cho nền tối.
- **Đoạn sau bước `done` là lớp tô MOUNT khi bước vừa xong**, nên `animate-grow-x` chạy đúng lúc đó (chỉ trục
  ngang; `motion-reduce` tắt). Tối: đoạn dốc `primary-6 → primary-3` + quầng; rãnh chưa qua `sky-5/20`.
- **HUD chấm (chỉ `dark:`)**: `done` / `error` quầng tone trong + ngoài; `active` đặc dốc + gờ đỉnh + VÒNG sáng cách 3px
  (`0 0 0 3px` tone nhạt rồi `0 0 0 4px` tone sáng — một chuỗi `shadow`) + chữ tiêu đề phát sáng (`HUD_TEXT_GLOW`).

## Tabs

- **Gradient đảo chiều theo `indicator`**: `top` đổ xuống (`to-b`), `bottom` đổ lên (`to-t`) để vệt
  sáng bám theo vạch; list đổi `items-start` → `items-end` để vạch luôn nằm ở mép ngoài.
- **`headerClassName` chỉ có tác dụng khi truyền `right`**: không có `right` thì list render trần,
  không có hàng bọc. Dùng cho toolbar cần gạch chân / padding riêng (vd modal chi tiết công văn).
- **Dải tab CUỘN ngang khi hẹp** (`min-w-0 max-w-full overflow-x-auto overscroll-x-contain scrollbar-hidden`): không tràn
  trang, không ẩn tab. `overflow` cắt ring ngoài nên focus vẽ `ring-inset`; cảm ứng đệm dọc 4px bù `-my-1` để `::after` (nới hộp bấm) của tab nằm trong dải — nằm ngoài thì sinh thanh cuộn dọc.
- **`TabOption.trailing`** là khe sau nhãn (badge đếm). `FormTabs` dùng nó để gắn số lỗi thay vì tự dựng nút
  tab — một bảng class cho mọi thanh tab; `tests/shared/ui/form/form-tabs.test.tsx` so class hai bên.
- **Tab chọn = chữ + vạch `action-base`** (lật theo theme) + vệt `primary-5` 14%; KHÔNG đổi nét chữ khi chọn (hàng
  tab xô lệch). Bậc `primary-1` / `-7` bị test chặn: ra khối gần trắng, chữ mất hút ở dark.
- **HUD `line` (chỉ `dark:`, nằm ở `TABS_TRIGGER_INDICATOR_CLASSES` — KHÔNG ở base, base dùng chung với `folder`)**: vạch
  `primary-4` + quầng `inset` sát vạch (dải `overflow-x-auto` cắt quầng ngoài), vệt pha `primary` 26%, chữ phát sáng; tab nghỉ
  `enabled` rê thì hiện vạch mờ `primary-5/35`.

## Tabs — variant folder

- **Viền 1px = NỀN của trigger đã `clip-path`**, thân = `::before` thụt 1px cùng đa giác: `border` không chạy theo
  `clip-path` (cạnh vát mất nét). `isolate` + `before:-z-10` để thân nằm TRÊN nền trigger nhưng DƯỚI chữ.
- **Tab đang mở**: thân `primary-5` pha 28% `teal-5` (`color-mix`, `HUD_HOT`) dâng từ đáy — cùng sắc ô Dock (tối) — + vạch sáng
  đỉnh bằng `inset` shadow (shadow ngoài bị clip cắt); `text-shadow` quầng chỉ `dark:`.
- **Không nới vùng chạm bằng `::after`**: `clip-path` cắt luôn hit-test ngoài đa giác, nên `touch:min-h-10` giữ ≥ 40px
  bằng chính chiều cao tab. `indicator` vô nghĩa với `folder` (list luôn `items-end`, vạch đáy là `border-b` của list).
