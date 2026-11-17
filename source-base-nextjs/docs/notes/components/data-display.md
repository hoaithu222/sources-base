# Ghi chú component — data-display (`src/shared/ui/data-display/`, `bars/`, `tree/`)

> Lý do thiết kế KHÔNG hiển nhiên của từng component, tách khỏi code theo
> `comment-policy.md §3`. Mỗi mục ≤ 6 gạch; chỉ ghi điều code không tự nói và rule
> chung chưa có. Cụm Table (`data-display/table/`): `data-display-table.md`.

## Tree

- **Row renderer đứng NGOÀI `Tree`, đọc cấu hình qua `TreeRowConfigContext`**: đổi identity renderer là remount
  dòng giữa `pointerdown` ↔ `pointerup` → mất `click`. Chevron XOAY, không đổi icon, để `transition` chạy được.
- **Click trong dòng**: lọc click từ PORTAL (Menu / Modal dựng trong `renderNode`) bằng `currentTarget.contains`;
  sau `node.handleClick` phải `stopPropagation` vì `DefaultRow` của arborist cũng gắn nó (không thì chọn 2 lần).
- **Mở / đóng hàng loạt**: effect `expandAll` chỉ chạy khi giá trị ĐỔI (gọi lúc mount xoá trạng thái mở sẵn);
  `openAll` / `closeAll` bắn `onToggle` cho từng node nên Tree nuốt chúng — `onToggle` chỉ nghĩa "một node".
- **Chặn type-ahead của arborist ở capture** vì cây luôn đi kèm ô tìm riêng; `wheel` gắn native
  `{ passive: false }` (`useTreeWheelInDialog.ts`) vì scroll-lock của Radix Dialog chặn cuộn cây trong Popover.
- **HUD tối: dốc `HUD_ROW_HIGHLIGHT` vẽ ở `::after`** (`relative isolate` + `after:-z-10`: trên nền dòng, dưới chữ) vì
  `background-image` inline của vạch dẫn thắng mọi class nền; rê = 50%, chọn = 100% + vạch trái `primary-4` có quầng.
  Màu vạch dẫn đi qua `--tree-guide` (khung khai ở tối: pha 30% `primary-5`) — style inline không có `dark:`.

## tree/hooks — useTreeSelection · useTreeContainerHeight

- **Guard echo `onSelect`** (`useTreeSelection.ts`): arborist tự bắn `onSelect` lúc mount và sau `setSelection()`
  — cờ `isSyncingSelectionRef` nuốt chúng. `selection` chỉ set ở `single` vì arborist ghi đè còn 1 phần tử.
  Prop `selection` chỉ chọn được node ĐANG HIỆN (`api.select` bỏ qua node trong nhánh đóng) nên effect đồng bộ ghi
  `setSelection` theo id cho cả `single` — chọn sẵn một lá sâu vẫn hiện dòng chọn khi nhánh mở.
- **Chọn nhiều rời rạc: arborist nhận cả Ctrl lẫn ⌘** (`NodeApi.handleClick`), Shift chọn dải; checkbox ba trạng
  thái thì dựng trong `renderNode` (mẫu demo `DataTreeSection`), đừng sửa `Tree`.
- **Đo chiều cao** (`useTreeContainerHeight.ts`): layout effect KHÔNG dep array tự chữa khi ResizeObserver bắn hụt
  (list ảo hoá kẹt nhỏ = "mất thư mục"); container `overflow-hidden` vì px luôn trễ 1 nhịp render.

## TreeNodeRow (`tree/parts/tree-node-row.tsx`)

- **Vòng focus bám `[:focus-visible>&]`, không bám `node.isFocused`**: arborist gọi `.focus()` lên `[role=treeitem]` (cha
  trực tiếp của dòng) cả khi bấm chuột; `:focus-visible` của trình duyệt chỉ bật khi đi bằng bàn phím.
- **Vạch dẫn thụt lề vẽ bằng `background` của chính dòng** (`treeIndentGuideStyle`, `repeating-linear-gradient` chu kỳ
  `indent`): không thêm phần tử DOM theo cấp, không đổi chiều cao dòng nên `rowHeight` ảo hoá vẫn khớp.
- **Tô chữ khớp bằng `splitTreeMatch` (`tree/tree.utils.ts`)**: cây lọc bỏ dấu ("ban ve" ra "Bản vẽ") nên phép cắt cũng
  bỏ dấu — gấp TỪNG ký tự, giữ bảng vị trí gốc ↔ đã gấp để cắt đúng chỗ trên chuỗi có dấu.
- **Màu icon theo loại, chọn thì đè**: cha `action-accent` (hổ phách như `folder-fill`), lá `fg-muted`, dòng đang chọn
  `action-base`. Hai token này tự lật theo theme — bậc `-5` cố định thì chói ở tối, mờ ở sáng.
- **Chevron `transition-transform`, KHÔNG `transition-[transform,…]`**: `rotate-90` của Tailwind v4 ghi thuộc tính `rotate`
  riêng; chỉ `transition-transform` (= `transform, translate, scale, rotate`) mới nội suy được cú xoay.
- **Vạch trái dòng chọn = `shadow-[inset_2px_0_0_…]`, không `border-l-2`**: viền đẩy nội dung lệch 2px (vỡ thẳng hàng thụt
  lề); bóng inset không chiếm chỗ và cộng được với vòng focus (`--tw-ring-shadow` ≠ `--tw-shadow`).

## AnimatedNumber

- **Vẽ bằng DOM, không phải `<canvas>`**: DOM giữ token màu tự lật theo theme, thang chữ `text-*`, mức phóng
  `--ui-scale` ở chế độ TV và khả năng bôi đen để chép số.
- **Vì sao số cần chạy**: màn hình 20 con số mà số nhảy phịch thì mắt không bắt được ô nào vừa đổi; chuyển
  động kéo chú ý về đúng ô có tin mới mà không cần nhấp nháy hay đổi màu.
- **`tabular-nums` bắt buộc, không tắt được**: bề ngang chữ số khác nhau nên lúc chạy con số co giãn
  từng khung hình và kéo cả hàng bên cạnh nhảy theo.
- **A11y**: phần số đang chạy `aria-hidden`, bản `sr-only` chốt ở `value`; thiếu cặp này trình đọc màn hình
  đọc liên tục hàng chục con số trung gian.
- **`format` chạy MỖI khung hình**: giữ thuần và rẻ, không gọi API, không dựng `Intl.NumberFormat` mới.
- **Số trong bảng dài → `disabled`**: 200 con số cùng chạy là nhiễu thị giác, không ai theo dõi nổi.

## CapsuleChart

- **Nằm giữa `Progress` và `RankingBoard`**: `Progress` là 1 giá trị / 100; `RankingBoard` chỉ so các giá trị với
  NHAU; `CapsuleChart` nhiều giá trị CÓ TRỤC nên đọc được cả tỉ lệ lẫn con số.
- **Mốc trục làm tròn LÊN 1·2·5×10ⁿ** (`niceCeil`) rồi mới chia: chia đều từ 0 tới max ra số lẻ không đọc nổi.
- **`max` truyền tay khi đo theo CHỈ TIÊU** (vd quý 5.000): "chưa ai đạt" nhìn ra ngay thay vì người cao nhất luôn chạm mép.
- **Hàng trục thụt đúng bằng cột nhãn và cột giá trị**: đổi bề rộng cột ở hàng thanh thì đổi cả hàng trục,
  nếu không mốc 0 và mốc cuối lệch hai đầu thanh.
- **Thanh vẽ 2 pha** (`grown`): CSS không nội suy giá trị khởi tạo nên khung đầu đặt 0%. Pha 0% khoá theo NỘI DUNG
  (`id:value`), không theo reference `items` — cha render lại cùng số liệu thì thanh không co về 0.
- **Màu `tone` đi qua CSS var trong `style`** (`var(--color-${tone}-5)`), không phải class: ghép chuỗi trong
  `className` thì Tailwind không sinh class.

## RankingBoard

- **Thanh đo theo giá trị LỚN NHẤT của bộ dữ liệu, không theo 100**: hạng nhất luôn chạm mép phải nên so được
  tỉ lệ giữa các hạng; muốn so với chỉ tiêu thì dùng `Progress` / `CapsuleChart max`.
- **Mẫu số = đỉnh dương, không có thì `1`**: `Math.max()` trên mảng rỗng ra `-Infinity` → `NaN%` và thanh biến
  mất không lỗi. Không kẹp sàn `1` lên đỉnh: bộ số lẻ (0,5 · 0,25) sẽ mất "hạng nhất chạm mép".
- **Màu huy hiệu khai bảng LITERAL** (`RANKING_BADGE_TONE_CLASSES`): ghép `border-${tone}-5` thì im lặng mất màu. Quầng
  thanh là MỘT class (`RANKING_BAR_GLOW_CLASS`) đọc `--hud-bar-tone` mà thanh tự khai inline — không cần bảng theo tông. Chữ huy hiệu sáng `-8` / tối `-4` (`-5` trên nền nhạt ~1.5:1); quầng CHỈ ở tối.
- **Ba hạng đầu cố định vàng · lam · cam** (bục trao giải), KHÔNG theo `tone` vì đó là ý nghĩa thứ hạng;
  `highlightTop={false}` để cả bảng dùng một tông.
- **Thanh vẽ ra từ 0** (2 pha như `CapsuleChart`) trong cùng thời lượng với `useCountUp` nên thanh và con số
  dừng CÙNG LÚC, mắt đọc ra một chuyển động.
- **`key` = `id` ổn định, không dùng chỉ số mảng**: thứ hạng đổi thì chỉ số đổi, key đổi theo và dòng bị remount.

## ScrollBoard

- **Bài toán**: màn hình không ai bấm (sảnh, phòng điều hành) phải cho xem 40 dòng trong khoảng cao đủ 8 dòng —
  bảng tự đưa dòng tiếp theo lên. Chỉ để NGẮM: cần sắp xếp / chọn / phân trang thì dùng `<Table>`.
- **Khi nào đứng yên**: vừa khung (`data.length ≤ rowCount`), rê chuột vào, `prefers-reduced-motion` (đổi sang
  cuộn tay), tab ẩn (`document.hidden` — không "nhảy cóc" khi quay lại).
- **`rowHeight` CỐ ĐỊNH**: mỗi nhịp dịch đúng một `rowHeight`, dòng cao thấp khác nhau sẽ trôi lệch dần và cắt
  ngang chữ; nội dung dài phải `truncate`.
- **Lấy `rowCount + 1` dòng khi tràn** để dòng kế đã nằm sẵn dưới mép; chốt `offset` ở `transitionend` của CHÍNH
  khung trượt với `propertyName` `transform` — sự kiện nổi từ ô con sẽ nhích dòng ngoài nhịp.
- **Sọc chẵn / lẻ bám CHỈ SỐ THẬT của dòng** (`index % 2`), không vị trí đang hiện (bám vị trí thì mỗi nhịp cả bảng
  đổi sọc). Sọc pha `azure-8` CHỈ ở theme tối (kiểu DataV); theme sáng tách dòng bằng vạch `divider-soft`.
- **Header + rê dòng cùng ngôn ngữ header `Table`** (tối: dải dốc + ray 1px `primary-4` có quầng hắt lên; rê = dốc
  `HUD_ROW_HIGHLIGHT` + vạch trái 2px). Rê dùng `background-image` nên hiện cả trên dòng sọc (màu sọc `dark:` thắng `hover:`).

## StackBar · CellBar

- **`StackBar` tự vẽ phần chồng:** xếp hai thanh một-đoạn lên nhau thì rãnh của thanh sau che thân thanh trước.
  Mặt trên của hai đoạn liền nhau khít cạnh chéo → đọc ra MỘT khối; chỉ đoạn cuối có mặt đầu.
- **Độ sâu theo bề dày** (`stackBarDepth`): thanh mỏng lấy ~½ bề dày, không thì mặt trên to ngang mặt trước,
  đọc ra một tấm nằm ngửa. Hộp cao `height + độ sâu`, component tự đặt.
- **`CellBar` dùng mask `repeat: round`:** ô tự co giãn cho vừa SỐ NGUYÊN ô trong từng đoạn, không có ô bị
  cắt đôi thành hai màu ở chỗ nối. Mỗi đoạn là một "bể" riêng (khung + ô cùng màu); phần dư là ô tắt.
- **Vệt sáng của `CellBar` chỉ chạy khi rê chuột** (`group/cell-bar` hoặc `group/kpi` của `HudKpiCard`), không
  thành chuyển động nền liên tục cạnh con số.
- **Màu đoạn là giá trị CSS do nơi gọi đưa vào** (dữ liệu, không phải style của UI) — dùng `var(--color-*)`.
- **Quầng CHỈ ở theme tối**, màu động qua biến riêng (`--stack-bar-glow`, `--cell-bar-tone`) để class `dark:` LITERAL dùng
  được; `dark:drop-shadow-[…]` của `StackBar` kê lại cả bóng nền vì mọi `drop-shadow-*` ghi chung `--tw-drop-shadow`.

## TrendBadge

- **Có mũi tên thì bỏ dấu +/−** ("▲ 14,2%"); đứng yên (< 0,5%) không có mũi tên nên giữ dấu.
  `positive="down"` cho chỉ số mà giảm mới là tốt. Số tròn in "80%", không "80,0%".

## boards/ — ScrollBoard · RankingBoard · CapsuleChart · NoticeBoard · StatusBoard

- **Một họ "bảng màn lớn"** (số liệu tự chạy, danh sách điều hành) gom vào `boards/` vì `data-display/` đã đủ 8 mục; import
  vẫn qua `@/shared/ui` — đường dẫn file đổi không ảnh hưởng nơi dùng.

## NoticeBoard

- **Mỗi mục là MỘT việc cần để ý** (tồn lớn, chậm kế hoạch, máy dừng), không phải nhật ký — nhật ký dài là `ScrollBoard`.
- **Ba dạng hàng theo hành vi**: có `href` → `<Link>` (Ctrl+click mở tab mới — `navigable-controls.md`), chỉ `onSelect`
  → `<button>`, không có gì → `<div>` tĩnh và KHÔNG có mũi tên (mũi tên hứa hẹn bấm được).
- **Tone qua biến `--notice-tone`** (một class literal mỗi tone) cho vạch trái / viền / nền dốc; icon và con số dùng class
  chữ literal theo bậc (sáng `-7` / `-8` ≥ 4.5:1 trên trắng, tối bậc sáng + quầng).

## StatusBoard

- **Lưới cột tỉ lệ cố định cho MỌI hàng** (icon · tên · trạng thái · thanh · số): cột thẳng hàng mà không cần `<table>`;
  tên / trạng thái dài cắt "…" bằng `TEXT_ELLIPSIS_CLASSES` (không `truncate` — gọt dấu chữ hoa) kèm `title`.
- **Thanh là `role="meter"` 0–100**, màu trạng thái độc lập với `tone` của thanh (tone chỉ tô thanh) — "Bảo trì" vẫn cam
  dù thanh xanh. Chấm + quầng thanh chỉ phát sáng ở theme tối.
- **Thanh đồng bộ `Progress` (tối)**: rãnh lõm trơn + điểm sáng 2px ở đầu thanh (`::after`); rãnh `overflow-hidden` nên
  điểm đầu của thanh 0% tự bị cắt.

## Họ thanh — RankingBoard · CapsuleChart · (BoxInfo, Progress, StatusBoard)

- **Một hình cho mọi thanh** (`HUD_TRACK` · `HUD_BAR_GLOW` · `HUD_BAR_HEAD_AFTER`): rãnh lõm trơn + điểm sáng 2px ở ĐẦU thanh.
  KHÔNG vạch chia 10%: thanh nằm dày trong bảng / danh sách, vạch chia thành nhiễu (`visual-hierarchy.md §0c`).
- **Tone qua biến `--hud-bar-tone`** đặt ở `style` cùng chỗ với nền dốc (màu do prop `tone` quyết định lúc chạy); thanh cần `relative`
  vì điểm đầu là `::after`. Gắn điểm đầu CHỈ khi giá trị > 0 — thanh 0% mà còn một vạch sáng đọc ra "có chút ít".
