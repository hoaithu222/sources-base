# Ghi chú component — pickers (`src/shared/ui/pickers/`)

> Lý do thiết kế KHÔNG hiển nhiên của nhóm `pickers/`, tách khỏi code theo `comment-policy.md §3`.
> Mỗi mục ≤ 6 gạch; chỉ ghi điều code không tự nói và rule chung chưa có.

## PickerTrigger

- **`id` / `aria-*` bám phần tử NHẬN FOCUS**: ở `editable` là `<input>` (gắn lên wrapper thì ô nhập KHÔNG TÊN);
  không `editable` thì wrapper tự thành `role="button"` + bàn phím — `Popover.Trigger asChild` không tự có.
- **Các `*Field` của form truyền `aria-labelledby` trỏ vào nhãn NGOÀI**: phần tử tương tác là
  `<button>` / `<div>` chứ không phải `<input>` thật nên `<label htmlFor>` một mình không đủ.
- **`truncate` BẮT BUỘC**: trigger cao cố định nên chuỗi dài (range ở size `sm`) xuống 2 dòng sẽ tràn
  khung, phá hàng toolbar; có ellipsis thì xấu nhất chỉ cụt đuôi, `title` cho xem đủ khi hover.
- **`onInputCommit` phải trả `string` khi Enter**: lúc đó ô VẪN focus nên `useEffect` đồng bộ
  `displayText` cố tình bỏ qua; không trả chuỗi chuẩn thì ô kẹt ở chữ thô dù giá trị đã chốt đúng.
- **`icon` đọc từ prop ở CẢ HAI nhánh** (`editable` lẫn không): TimePicker truyền `clock-outline` /
  `null`; cắm cứng calendar ở nhánh gõ tay thì time picker hiện ra cái lịch.
- **`data-state` đặt SAU `{...rest}`** để `open` của picker thắng giá trị Radix inject; `fieldSurface`
  (focusMode `trigger`) bắt `data-[state=open]` cho viền + ring. Blur vào popover thì KHÔNG chốt.

## CalendarPanel

- **Body cao CỐ ĐỊNH 248px** = hàng T2..CN 24 + 6 hàng × 36 + `pb-2` 8; lưới luôn 42 ô
  (`buildCalendarDays`) nên popup không nhảy khi đổi tháng hay chuyển day ↔ month view.
- **Caret cạnh tiêu đề chỉ bấm được khi truyền `onJump`** (chọn nhanh tháng / năm); bỏ trống thì caret
  tĩnh, chỉ còn hai nút tháng trước / sau.
- **Nút điều hướng** `size-6` + icon 14px, xoá viền / nền mặc định của `<button>` để không ra khung hộp nặng
  (Figma 974:19209 / 974:19016); ring CHỈ khi dùng phím (`focus-visible`) — `ring-0` trần thì mất dấu focus.
- **Ô ngày có `aria-label` DD/MM/YYYY** (đọc "15" không đủ nghĩa). "Hôm nay" / "tháng này" = viền trong 1px `primary-5` +
  chữ `link`; ô `selected` (nền đặc) thắng khi trùng. Ngoài tháng `fg-faint` (`fg-muted` ở dark sát chữ thật).
- **Hàng T2..CN có vạch xanh đáy (tối) vẽ bằng `background` 1px**, không `border-b`: thân cao CỐ ĐỊNH 248px, thêm 1px
  viền là tràn xuống chân panel.

## picker-cell.theme

- **Mảnh HUD (chỉ `dark:`) chung cho MỌI ô chọn của nhóm** (ngày, tháng của lịch + MonthGrid, giờ / phút, nút ‹ ›): đổi
  ngôn ngữ ánh sáng một chỗ thì ô ngày, ô tháng, ô giờ đổi cùng nhau.
- **Ghép SAU class sáng**: sáng giữ nền đặc `bg-primary-6` / `bg-primary-5/15` (test MonthGrid khoá chuỗi này); tối
  `dark:bg-transparent` gỡ nền đặc để `HUD_ACTIVE_FILL` dâng từ đáy. Rê ô đang chọn PHẢI có `dark:hover:bg-*` — `hover:`
  (0,2,0) thắng `dark:` (0,1,0) nên thiếu nó thì nền `primary-7` đặc hiện lại khi rê.
- **Ô không có `border`** → viền sáng khi rê / "hôm nay" vẽ bằng `inset` shadow. Ô `off` tự tắt bằng `dark:hover:shadow-none`.
- **Khoảng giữa = MỘT dải phẳng `primary-5/12`, không ray** (ray trên / dưới mỗi hàng thành nhiều vạch ngang — người dùng chê
  rối 2026-10-06). **"Hôm nay" = viền mảnh sky** (`hud-4` 75% tối · `hud-6` sáng), KHÔNG `primary`: `primary` (xanh thương hiệu) = đang chọn.

## SingleDatePicker

- **Mở panel nhảy lịch về tháng của `value`**; chưa chọn thì tháng hiện tại KẸP trong [`minDate`, `maxDate`]
  (`resolveOpenMonth`, dùng chung với Range / DateTime) — khỏi bấm mũi tên tìm tháng chọn được.
- **"Hôm nay" bị khoá hẳn** (`disabled`) khi hôm nay ngoài khoảng cho phép, thay vì để bấm mà không có gì xảy ra;
  `title` đặt ở `<span>` bọc nút vì `<Button>` tắt mang `pointer-events-none`, tự nó không hiện tooltip.
- **Gõ tay chỉ đồng bộ tháng đang xem và cờ lỗi**; giá trị chỉ chốt ở Enter / rời ô (xem
  `PickerTrigger`).

## RangeDatePicker

- **Rộng ≤ màn − 1.5rem** (`max-w-[calc(100vw-1.5rem)]`): panel có cột chọn nhanh 540px ở điện thoại thu lại, lịch `flex-1 min-w-0` co theo;
  cùng luật cho `DateTimePicker` 320px. Phần còn lại do `Popover` (`collisionPadding`, `max-h`) lo.
- **`align="end"` khi ô nhập sát mép PHẢI màn hình**: lịch rộng 288px (540px khi có cột chọn nhanh)
  bung sang phải sẽ ra ngoài khung nhìn.
- **Chọn 2 nhịp**: bấm mốc đầu gọi `onRangeChange({ from, to: null })` ngay, mốc cuối chốt + đóng;
  bấm ngày NHỎ HƠN mốc đang chờ = bắt đầu lại.
- **Cờ lỗi gõ tay được xoá bằng so `prevDisplayText` ngay lúc render**, không dùng effect — tránh
  render lan truyền và rule `react-hooks/set-state-in-effect`.
- **Gõ tay tách riêng ở `useRangeDateInput.ts`**: gõ chỉ cập nhật cờ lỗi + tháng đang xem, chỉ Enter /
  rời ô mới gọi `onRangeChange`.
- **Chân panel `flex-wrap`, cụm nút `ml-auto`**: panel 288px không chứa nổi tóm tắt + 2 nút trên một hàng (nút rộng cố
  định thì tràn và bị `overflow-hidden` của popup cắt) → nút xuống dòng, căn phải; panel 540px vẫn một hàng.
- **Mở panel đồng bộ lại theo `range`**: mốc đang chờ = `range.from` khi chưa có `to`, ngược lại xoá —
  `range` đổi từ ngoài lúc panel đóng thì không ghép với mốc cũ.

## DateTimePicker

- **Cột Giờ / Phút RIÊNG** (`date-time-picker-column.tsx`), cố ý không dùng `time-column.tsx`: cột của
  TimePicker rời, cao 200px, ô thưa; ở đây cột cao bằng lịch kề bên và có tiêu đề dính — hai thiết kế.
- **Hai hành vi PHẢI giống `time-column.tsx`**: kéo ô đang chọn vào giữa bằng `scrollTop` (không
  `scrollIntoView`) và listener `wheel` tự cuộn (xem `## TimeColumn`).
- **Trong Modal, popover portal vào `DialogContent`** (`container`, lấy dialog đang mở lúc mở panel):
  portal ra `body` thì nằm ngoài vùng `RemoveScroll` cho phép nên wheel bị chặn.
- **Cao `h-[128px]`** của cặp cột = nhãn dính ~20px + 3 hàng ~36px nhìn thấy.
- **Chỉ `onChange` khi bấm Xác nhận**: ngày / giờ / phút chỉ đổi `draft`, mở panel đặt lại `draft` theo `value`.
  Nháp mặc định = bây giờ có thể ngoài [`minDate`, `maxDate`] → "Xác nhận" khoá tới khi chọn ngày hợp lệ.

## TimePicker

- **Chọn từ 2 cột hoặc gõ thẳng**; gõ đọc số theo độ dài như bàn phím số (`1530` → 15:30, `930` →
  09:30, `15` → 15:00) — luật ở `## parse-time.utils`. Giá trị là chuỗi "HH:mm" 24h.
- **Ngừng gõ `commitDelay` ms (mặc định 500) là tự validate + lưu**, khỏi cần Enter; `0` tắt, chỉ Enter
  / rời ô mới chốt. Ba đường chốt: `## useTimeInput`.
- **Trong Modal portal vào `DialogContent`**: portal ra `body` nằm ngoài subtree Radix Dialog nên
  `RemoveScroll` (scroll-lock của Modal) chặn wheel, cột giờ / phút không cuộn được.
- **`minuteStep` chỉ là bước trong DANH SÁCH**, không ràng buộc giá trị gõ tay.
- **`onParseError`**: giá trị hỏng (vd "2400") không commit nên RHF không thấy gì để báo; `TimeField`
  giữ message này để người dùng biết vì sao ô đỏ mà giá trị cũ còn nguyên.

## useTimeInput

- **Đang gõ**: chỉ báo lỗi không thể cứu bằng cách gõ thêm; không lưu, không đóng panel; chỉ ghi lại
  chữ trong ô khi đủ 4 chữ số (chèn `:`).
- **Ngừng gõ (debounce)**: validate ĐẦY ĐỦ + lưu; KHÔNG ghi lại chữ trong ô, không đóng panel.
- **Enter / rời ô**: validate đầy đủ + lưu + ghi lại dạng chuẩn + đóng panel; sai cú pháp thì giữ panel
  mở để người dùng đọc lỗi và sửa tiếp.
- ⛔ **Nhánh debounce không được ghi lại chữ trong ô**: gõ `9`, ngập ngừng, ô tự thành `09:00` thì `30`
  gõ tiếp rơi vào `09:0030`. Lưu thì cứ lưu, chữ trong ô giữ nguyên tới khi rời ô.
- **Im lặng với lỗi còn cứu được khi đang gõ**: gõ `930` bắt buộc đi qua `93` (= 93 giờ), báo đỏ ở đó
  là nháy đỏ giữa lúc đang gõ đúng (`shouldReportWhileTyping`).
- **Callback đọc qua ref `latest`**: hẹn giờ bắn SAU nhiều lần render, phải luôn gọi bản mới nhất thay
  vì closure của lần render lúc đặt hẹn.

## parse-time.utils

- **Chỉ nhận số hoặc số + `:`** (không `h`, `.`, khoảng trắng giữa, `-`). Số thuần đọc theo độ dài:
  1–2 chữ số = giờ (`9` → 09:00), 3 chữ số = H + mm (`930` → 09:30), 4 chữ số = HH + mm (`1530`).
- **Dạng có `:`**: `7:5` → 07:05 (thiếu số 0 vẫn hiểu); `15:` → 15:00 (đang gõ dở, phút mặc định 00);
  thiếu giờ (`:30`), nhiều `:` hoặc > 2 chữ số mỗi vế là lỗi.
- **Rỗng = XOÁ giá trị** (`{ ok: true, value: null }`), không phải lỗi.
- **Chữ số / dấu `:` FULLWIDTH được đổi về ASCII** (`foldFullwidth`): bộ gõ Nhật–Trung–Hàn hay sinh
  `１５３０`; không đổi thì bị báo "ký tự không hợp lệ" dù người dùng thấy đúng là số.
- **`isCompleteDigitEntry` chỉ chốt ở ĐÚNG 4 chữ số**: `153` đọc ra 01:53, tự chèn `:` sớm thì ký tự
  kế rơi vào `01:530`; `930` không tự đổi lúc gõ mà để dành tới Enter / rời ô.
- Lỗi trả sẵn tiếng Việt (`TIME_PARSE_MESSAGES`) để component chỉ việc hiển thị; `TimeParseErrorCode`
  dùng khi cần phân nhánh.

## TimeColumn

- **Panel unmount khi đóng** nên effect cuộn chạy đúng mỗi lần MỞ: kéo ô đang chọn vào giữa tầm nhìn
  bằng `scrollTop`, KHÔNG `scrollIntoView` — nó cuộn cả tổ tiên cuộn được nên trang phía sau nhảy chỗ.
- **Listener `wheel` tự cộng `deltaY` vào `scrollTop`** vì scroll-lock của Modal có thể chặn wheel; phải non-passive
  có `preventDefault` — `onWheel` của React là passive nên cuộn gốc + tự cộng = cuộn GẤP ĐÔI.
- **`CELL_H` (36) PHẢI khớp `h-9` của ô** vì dùng để tính `scrollTop`.

## MonthGrid

- **Một nguồn cho phần HÌNH của lưới tháng** (nhãn, nút ◀ ▶ năm, class ô) dùng chung cho 3 picker
  THÁNG; phần NGHĨA (tháng nào là đầu / cuối / giữa) do caller tính rồi truyền `startKey` / `endKey`.
- **Chỉ gộp giao diện, không gộp logic**: ba picker hiểu "khoảng" khác nhau (xuyên năm / cửa sổ N tháng
  / trong 1 năm).
- **Tên tháng lấy từ `pickers/month-labels.constants.ts`** (`MONTH_LABELS`) — một bảng cho cả nhóm. `slotKey` ở
  `month-window.utils.ts` vì `month-grid.tsx` chỉ được xuất component (hàm / hằng nằm file `.utils.ts` riêng — Fast Refresh giữ state, Server Component gọi được).
- **`slotKey = year*12 + monthIdx`**: so số nguyên nên "T12/2025 < T1/2026" luôn đúng; so từng cặp
  (year, month) bằng tay là chỗ sinh lỗi ở khoảng vắt giao thừa.
- **Ô tháng có `touch:h-10`**: đích chạm chính, ô thấp bấm bằng ngón tay dễ trượt sang ô bên. ⚠️ Nới ở bậc
  `touch:` lệch `ipad-responsive.md §3.0` (chỉ được siết) — cần chủ repo quyết định giữ hay bỏ.
- **Bốn trạng thái ô, ưu tiên `edge` > `inRange` > `current`** (`monthCellStateOf`): "tháng này" viền trong 1px như
  "hôm nay" của lịch, nhường cho mốc / khoảng đang chọn.

## MonthRangeFilter

- **Khác hai anh em cùng họ**: `MonthYearRangePicker` khoảng VẮT nhiều năm, năm tự do;
  `MonthYearStartPicker` chọn mốc đầu, cửa sổ N tháng suy ra; `MonthRangeFilter` khoảng gọn trong 1 năm.
- **Năm lấy từ DANH SÁCH là điểm khác biệt thật sự**: bộ lọc báo cáo chỉ có dữ liệu vài năm nên ◀ ▶
  phải TẮT ở đầu / cuối danh sách thay vì cho đi mãi tới những năm rỗng.
- **Đổi năm GIỮ NGUYÊN khoảng tháng** — người dùng đang so cùng kỳ giữa các năm.
- **Chọn 2 nhịp**: bấm tháng NHỎ HƠN mốc đang chờ coi như bắt đầu lại từ tháng vừa bấm. Khi chờ nhịp 2,
  đuôi khoảng chạy theo con trỏ (xem trước); rê ngược lên trên mốc thì không xem trước gì.
- **Trigger của 3 picker THÁNG là `PickerTrigger`** (chỉ đọc, `role="button"`, `iconSide="end"`: lịch ở CUỐI ô, 14px) —
  cùng cỡ `md`, cùng `fieldSurface`, cùng hành vi bàn phím với picker ngày / giờ; không tự dựng `<button>`.
- **Popover là bề mặt `glass` mặc định** như mọi picker (`solid` mang viền + quầng teal cả ở light).
