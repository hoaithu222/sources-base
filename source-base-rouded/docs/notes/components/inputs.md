# Ghi chú component — inputs (`src/shared/ui/inputs/`)

> Lý do thiết kế KHÔNG hiển nhiên của từng component, tách khỏi code theo
> `comment-policy.md §3`. Mỗi mục ≤ 6 gạch; chỉ ghi điều code không tự nói và rule
> chung chưa có.

## field.theme — trạng thái

- **Focus (sáng) = viền 1px `primary-6` + quầng 3px `ring-focus` 35%** — vòng focus accent của macOS, CÙNG công thức
  `CONTROL_FOCUS_RING_CLASS` của nút / ô tích / công tắc: Tab qua form thấy một ngôn ngữ focus. Chỉ đổi viền 1px thì gần
  như vô hình; quầng mềm sát mép đọc ra ngay mà không thô. Dark thay ring bằng quầng HUD (mục dưới).
- **Hover nhẹ hơn focus** (`border-strong`, không ring, không ngả brand) để phân biệt "chuột đang ở trên" với "con trỏ đang
  trong ô"; hover = focus cùng một màu thì không phân biệt được.
- **Lỗi giữ đỏ cả khi hover / focus** (ring đỏ, không chuyển xanh) kẻo người dùng tưởng đã sửa xong; nên mỗi
  ô `invalid` của `FIELD_SURFACE_STATE_CLASSES` tự mang đủ class, không dựa vào ô `valid`.
- **`disabled` chọn ô tĩnh `FIELD_SURFACE_DISABLED_CLASSES`** (con trỏ cấm, KHÔNG hover / focus — viền sáng khi rê là mời
  bấm). Sáng `within`: nền `bg-subtle` + chữ `fg-muted` / icon `fg-faint`, KHÔNG mờ (mờ 60% nhoè chữ + viền + nền thành mảng
  bạc); `trigger` giữ MỘT lớp mờ 60% vì ruột (chip, chấm màu, chữ tông) do component riêng tô. Tối: mờ 50% + sọc.
- **`readOnly`** (chỉ `within`, ô không lỗi): nền `bg-subtle` PHẲNG (không lõm), rê không đậm viền, vẫn quầng focus vì chọn /
  chép được. Khác ô tắt ở chữ `fg-heading` + viền `rim-soft`; nền nhạt hơn (trộn 60%) thì trên thẻ trắng gần như không thấy.
- **`focusMode`**: `within` cho control có `<input>` thật bên trong (`focus-within`); `trigger` cho `<button>` mở
  panel (`focus-visible` + `data-[state=open]`). Khung là `group/field` để `FIELD_CHEVRON_CLASS` xoay khi mở (tối); sáng
  trigger chọn dùng chevron lên-xuống tĩnh của `SelectChevron` (`selects/select-chevron.tsx`) như nút pop-up macOS.

## field.theme — HUD (chỉ dark)

- **Mặt `HUD_LIT_FILL` ở khung** (mọi ô nhập / trigger / picker); `ghost` và `border: none | bottomLine` tắt nó
  (`dark:bg-none`) cùng mọi quầng — không còn khung để rọi sáng, và ô trong bảng không được phát sáng lẻ.
- **Tông qua biến**: ô state đặt `--field-tone` (primary | error), khung đặt `--field-glow` (= `HUD_FOCUS_GLOW`) →
  MỘT chuỗi shadow cho `focus-within` · `focus-visible` · `data-[state=open]` của cả ô hợp lệ lẫn ô lỗi. Hằng
  `HUD_*` không mang selector nên không ghép thẳng được vào state; rê = quầng trong 24% theo tông.
- **Tối bỏ `ring`** (`dark:…:ring-0`): vòng 1px 55% của quầng thay nó, viền lên `primary-4`.
- **`dark:` không cộng specificity** (`:where(.dark …)`): `dark:hover:` thắng `focus-within:` → cần thêm bản
  `dark:focus-within:hover:` (viền + quầng), không thì rê lên ô đang gõ làm quầng focus tắt.
- **Icon / mũi tên sáng `primary-4`** khi `<input>` bên trong focus (`group-has-[:focus-visible]`), trigger focus
  bàn phím hay panel mở; hàng tìm của panel (`FIELD_POPUP_SEARCH_*`) cũng mặt rọi + vạch đáy sáng khi gõ.

## field.theme — tiểu tiết khung (theme tối)

- **Khung phẳng**: không vạch góc, không vạch quét đáy — ô nhập là tầng control (`visual-hierarchy.md §0c`); trạng thái chỉ
  bằng viền + quầng `--field-glow` khi focus / mở. Bản có vạch góc đã gỡ (người dùng báo "rối").
- **Ô khoá có sọc chéo mờ** thay mặt rọi sáng: nhìn là biết "không gõ được", không chỉ dựa vào độ mờ 50%.
- **Pseudo của khung để trống** — component gọi `fieldSurface` được dùng `before:` / `after:` nếu thật cần (hiện không ai dùng).

## field.theme — lõm · icon · control · cỡ

- **Lõm `FIELD_RECESS_CLASS` (chỉ sáng)**: bóng trong `0 1px 2px shadow-popup` dưới mép trên — ô "chìm" như text field macOS,
  cả ô nhập lẫn trigger cho lưới form đều. `inset-shadow-*` có biến riêng nên cộng với `ring` focus; `filled` / `ghost` /
  `border` none | bottomLine / chỉ đọc / tắt đều phẳng.
- **Icon `FIELD_ICON_CLASS`**: `fg-muted`; ô đang nhập / trigger focus bàn phím / panel mở → `text-(--field-tone)` (accent,
  ô lỗi đỏ) — CÙNG selector với bản tối `primary-4`; ô có `<input>` tắt → `fg-faint`.
- **✕ `FIELD_CLEAR_BUTTON_CLASS`**: sáng vòng rê 24px (`size-6 -mx-0.5`) mà vẫn chiếm 20px — hộp bấm chuột rộng hơn, không
  xô chữ / icon cạnh nó (Input, picker, NumberField dùng chung).
- **`FIELD_CONTROL_CLASS`**: caret + selection brand (nền tối con trỏ mặc định gần như vô hình), placeholder `fg-faint`
  (`fg-muted` ở dark sát màu chữ thật). KHÔNG utility `autofill:` — `overrides/autofill.css` lo (`css-architecture.md`).
- **`FieldSize` khai NGAY cạnh `FIELD_HEIGHT`**; kiểu cỡ của mọi ô một dòng (`InputSize`, `DropdownSize`, `UploadSize`…)
  là bí danh của nó — thêm bậc cỡ là sửa MỘT chỗ. Vì sao gom một nguồn: `ui-kit-architecture.md §5b`.

## Input

- **`className` vào `<input>` bên trong, KHÔNG vào khung**: `className="max-w-md"` thì khung vẫn dài cả trang
  mà test đo `<input>` vẫn xanh. `w-*` / `mx-*` / `flex-1` → `wrapperClassName`.
- **`disabled` / `readOnly` truyền vào `fieldSurface`, không `has-[:read-only]`**: `:read-only` khớp MỌI phần tử không sửa
  được (`<div>`, `<span>`, cả `<input disabled>`) nên khung nào cũng thành "chỉ đọc".
- **Không có prop `debounce`, đừng thêm**: biến Input thành controlled nội bộ, React ghi `value` sau mỗi phím,
  cắt chuỗi tổ hợp tiếng Việt → mất dấu (`ime-safe-input.md §3`).
- **`border: none | bottomLine`** xoá viền + nền + ring ở mọi state (không còn khung để ring ôm); `bottomLine` gạch
  chân `border-strong` khi hover, `primary-5` khi focus. Ô lỗi còn MỘT gạch chân đỏ, kẻo lỗi trong ô bảng vô hình.
- **`FIELD_VARIANT_CLASSES` / `FIELD_BORDER_CLASSES` có hai ô `valid | invalid`, dùng chung với NumberInput**:
  `filled` / `ghost` chỉ làm trong suốt viền khi KHÔNG lỗi, để viền đỏ của `fieldSurface` vẫn hiện.
- **Nút ✕** gán `''` qua native setter + phát `input` event để React `onChange` nhận chuỗi rỗng (gán `.value`
  trực tiếp thì React không thấy); ref nội bộ để xoá được cả controlled lẫn uncontrolled. `<input>` cao `h-full` (cả
  khung 36px là vùng nhập; trước đây chỉ dòng chữ ~20px nhận chạm) và ✕ nới hộp bấm `::after` trên cảm ứng. Ẩn khi `readOnly`.

## Textarea

- **Bộ đếm `absolute` đè lên dải đáy ô, sát mép trái**: khe kéo cỡ ô thuộc chính `<textarea>` ở góc
  phải-dưới, bộ đếm thành hàng riêng sẽ so le một tầng. Chỗ trống là `pb-4` thêm vào `<textarea>`.
- **Bộ đếm `pointer-events-none`, không kéo ngang hết bề rộng**: cú bấm vẫn rơi xuống ô nhập, không phủ
  khe kéo (div đếm nằm TRÊN textarea); nền `bg-inherit` (nền khung: trắng / chỉ đọc / tắt) che chữ cuộn qua dải đáy.
  Chạm `maxLength` → `text-warning`.
- **`flex-initial` thay `flex-1` của `FIELD_CONTROL_CLASS`**: khung ở đây là `flex-col`, còn `flex-1`
  (basis 0) nuốt chiều cao do `rows` / `minHeight` quy định.
- **Prop `minHeight` thắng `style.minHeight`** của nơi gọi (đặt sau `...style`).

## NumberInput

- **LUÔN `setText(raw)` khi emit, kể cả controlled**: nếu không, gõ `"1."` (parse → 1) không đổi `value`,
  bước đồng bộ theo `value` (so trong lúc render, không effect) không chạy → mất dấu `.` → không gõ được `"1.1"`.
- **Buffer `text` giữ chuỗi thô** để sống sót giá trị dở dang (`"-"`, `"1."`); `thousandSeparator` (vi-VN `.` nghìn ·
  `,` thập phân, khớp `formatNumber`) + controlled không dùng buffer để hiển thị nên lấy số thẳng từ `value`.
- **`NumericFormat` LUÔN nhận `value`** (kể cả khi NumberInput tự quản): để nó tự quản thì nút +/-, ↑ ↓ và
  kẹp khi blur không đổi được số đang hiển thị.
- **Bước tăng/giảm làm tròn theo số lẻ của `max(base, step)`**: tránh lỗi float (`1.1 + 0.1`) mà không
  nống thêm số 0 (`1.2` chứ không `1.20`).
- **`onValueChange` của `NumericFormat` bỏ qua `source !== 'event'`** (chỉ phản hồi user gõ); nút +/- phải
  `preventDefault` ở `onMouseDown` để input không mất focus.
- **Variant / border là `FIELD_*` của field.theme (chung Input)**; `none` / `bottomLine` bỏ vách ngăn stepper. Nút ở
  biên min / max tắt bằng `opacity-50` + con trỏ cấm, KHÔNG `pointer-events-none` (nó nuốt luôn con trỏ cấm). Số CĂN
  PHẢI mặc định (hàng đơn vị thẳng cột như bảng nhập liệu); stepper sáng mảnh: icon `fg-faint` → `fg-muted` khi rê / focus
  ô, rê nút nền `bg-subtle`, nhấn `bg-pressed`, không vạch ngang giữa.
- **Stepper ▲▼ xếp chồng nên mỗi nút chỉ ~18px cao**, không nới được mà không chồng nhau — cảm ứng nhập số bằng bàn
  phím; `<input>` cũng `h-full` như `Input`. `readOnly` khoá cả nút +/- lẫn ↑ ↓ (`<input>` chỉ tự chặn gõ).

## Checkbox — màu · trạng thái

- **Fill `primary-6` + dấu `neutral-0`, focus `CONTROL_FOCUS_RING_CLASS`** (+ viền `primary-6`) — cùng Radio / Toggle / Button
  primary; `primary-6` đạt 3.7:1 (light) / 4.6:1 (dark), còn `primary-5` chỉ 2.7:1 (< 3:1 cho non-text).
- **Chưa tick: viền `border-strong` + nền `bg-input`**; rê ô HOẶC nhãn (`group/checkbox`) → viền `primary-5`, có
  `error` thì `CHECKBOX_STATE_CLASSES.invalid` giữ đỏ cả khi hover.
- **Ring không `ring-offset`** (offset trắng → vành trắng 1px ở dark). Tắt (sáng, `not-dark:`): hộp `bg-subtle`, đã tick =
  khối `fg-faint` + tick trắng — lớp mờ 50% cũ để lại mảng xanh bạc màu trông như đang bật; tối giữ mờ 50%. Nhãn `fg-faint`.
- **Dark = HUD, chung Radio / Toggle / vòng radio của Dropdown**: chưa tick viền `primary-5/40` + `HUD_LIT_FILL`, rê viền
  `primary-4`; đã tick dốc `primary-5 → 7` + gờ sáng 1px + quầng; ô tắt bỏ quầng (mờ 50% mà còn sáng = như đang bật).

## Checkbox — tick · `indeterminate`

- **`<input>` native, không Radix**: bớt một dependency, tự submit theo form, bấm nhãn tự toggle. Cảm ứng: `::after`
  `-inset-3` nới hộp bấm lên ≥ 36px (cùng Radio / Toggle) — `appearance-none` cho phép cả `::before` lẫn `::after`. Rút
  `children` khỏi `...props` vì `<input>` là void element — có children là React ném lỗi, trắng cả màn.
- **`indeterminate` chỉ là property DOM, trình duyệt XOÁ nó khi bấm** → `onChange` đặt lại theo prop, vì effect
  `[checked]` không chạy lại khi prop không đổi.
- **Tick là `::before` + `clip-path`**: `appearance-none` mới cho render pseudo-element; tick PHẢI `absolute`
  (grid item thì `width:70%` phụ thuộc vòng → 0×0, tàng hình); `translate` / `rotate` cộng hưởng chứ không đè.
- **`clip-path` chỉ nội suy giữa hai polygon CÙNG SỐ ĐỈNH**: mọi trạng thái (chưa tick, tick, gạch ngang) đều
  6 đỉnh. Nền / viền và tick cùng `duration-100 ease-out` để hai chuyển động khớp — đổi tốc độ phải sửa cả hai chỗ.

## Radio

- **Cùng công thức Checkbox / Toggle**: nền + viền `primary-6`, chấm `neutral-0` 6px (`size-1.5`) — chấm 10px trong
  vòng 16px chỉ chừa vành xanh mảnh, nhìn như ô CHƯA chọn có viền xanh.
- **Ring không `ring-offset`** (vành trắng ở dark — xem Checkbox).
- **Hộp bấm cảm ứng**: `TOUCH_HIT_CLASSES.icon` (`::after` `-inset-2.5`, kèm `relative`) — vòng 16px không phóng to.
- **Tắt (sáng) = vòng `bg-subtle` / đang chọn khối `fg-faint` + chấm trắng; tối `opacity-50`**, nhãn `fg-faint` (`peer-disabled`); rê nhãn = rê vòng (`group/radio`).
- **Viền dark viết `dark:data-[state=unchecked]:…`**, không `dark:border-*` trần: `dark:` là `:where()` (không cộng
  specificity) nên thua `data-[state=unchecked]:border-border-strong`; tắt quầng ô chọn cũng phải `dark:disabled:data-[…]:`.

## Toggle

- **`primary-6` chứ không `green-6`**: `green-6` là màu STATUS (success), làm "bật" trông như badge trạng
  thái và lệch Checkbox / Radio; cả ba dùng chung `primary-6` + `neutral-0` + `CONTROL_FOCUS_RING_CLASS`.
- **Sáng kiểu công tắc macOS**: `md` 38×22px, rãnh tắt `bg-track` lõm nhẹ, núm trắng bóng mềm 2 lớp, trượt 200ms; khoá =
  rãnh xám (tắt `bg-pressed`, bật `neutral-4`). Rãnh tắt `neutral-7` ở dark (ở light là khối xám nặng hơn cả bật). HUD CHỈ ở dark: rãnh tắt lõm (bóng trong), rãnh bật dốc + gờ + quầng, núm dốc trắng → `neutral-3` có quầng khi
  bật; bóng núm qua `color-mix` token, không `shadow-sm`.
- **`<label>` bọc thẳng nút switch (không `htmlFor`)**: bấm nút kích hoạt 2 lần (nút + label) → bật rồi tắt
  lại; `onClick` của label chặn khi target nằm trong `[role="switch"]`, bấm CHỮ vẫn chuyển tiếp bình thường.
- **Hộp bấm cảm ứng nới bằng `::after`** (`-inset-x-1 -inset-y-3` → 44px dọc cho cỡ `md`): công tắc 20px đứng một mình
  trong ô bảng khó bấm trúng; hình KHÔNG đổi.
- **Không `label` → PHẢI có `aria-label` / `aria-labelledby`**: công tắc đứng một mình trong ô bảng chỉ đọc
  "switch, on", không biết bật/tắt cái gì.
- **`ref` là prop thường** (React 19) trỏ tới chính `<button role="switch">`: cần cho focus bằng mã và điều
  hướng bàn phím giữa các ô nhập — 5 ô nhập còn lại trong nhóm đều chuyển tiếp ref.

## ColorPalettePanel

- **Ô hex là bản nháp riêng** (giữ chuỗi gõ dở `#12`), chỉ đẩy `onChange` khi đủ `#RRGGBB`; `value` đổi từ
  ngoài (reset form, đổi dòng) thì nháp đặt lại ngay trong render (so với `value` đã đồng bộ lần trước).
- **Tách khỏi `ColorPickerField`** để dùng NGOÀI react-hook-form: cùng một bảng màu cho field trong form
  (màu thẻ đơn vị) và cho từng dòng danh sách (màu mũi thi công) — nơi không có RHF context.
- **Ô màu `size-6` CỐ ĐỊNH**: panel dùng ở popover rộng hẹp khác nhau, `w-full` làm ô màu phình theo vật chứa.
- **Ô đang chọn = viền trong trắng + `ring-2 primary-5`; rê = phóng 110%**: chỉ đổi viền trắng thì trên nền trắng
  của light không thấy gì; dark thêm quầng `primary-5` quanh ô đang chọn. Mã hex trong file là DỮ LIỆU người dùng
  (preset), không phải màu giao diện.
