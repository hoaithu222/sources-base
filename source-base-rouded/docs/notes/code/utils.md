# Ghi chú code — utils (`src/shared/utils/`)

> Lý do thiết kế KHÔNG hiển nhiên của `src/shared/utils/` (browser · format · style · validation),
> tách khỏi code theo `comment-policy.md §3`. Mỗi mục ≤ 6 gạch; chỉ ghi điều code không tự nói và rule
> chung chưa có. Cách DÙNG từng hàm nằm ở JSDoc / khối hướng dẫn đầu file.

## Cách import

- **Import THEO FILE** (`@/shared/utils/format/format.utils`), không có barrel nhóm nào: barrel gốc kéo UI kit vào mọi
  file chỉ cần `cn()`; barrel nhóm cạnh import theo file là hai đường cho một việc.

## browser/debounce.utils.ts

- **Thay `lodash.debounce`**: lodash là CJS nên không tree-shake — một `import { debounce } from 'lodash'`
  kéo cả ~3,1 MB vào bundle. Chỉ giữ API đang dùng (`cancel`, `flush`); không thêm `leading`/`trailing`/`maxWait`.
- **Trả `void`, không trả giá trị lần chạy trước**: giá trị đó thuộc đối số cũ (gần như luôn lỗi thời)
  và mọi nơi gọi đều bỏ qua nó.
- **`invoke` xoá `timer`/`pendingArgs` TRƯỚC khi gọi `fn`**: `fn` có thể gọi lại chính hàm debounce
  (validate → setState → validate); dọn sau thì timer vừa hẹn lại bị lần dọn muộn xoá mất.
- **`pendingArgs` giữ đối số của lần gọi gần nhất** để `flush()` chạy đúng dữ liệu mới nhất.

## browser/field-nav.utils.ts

- **`FIELD_SELECTOR` chỉ lấy ô CHỨA DỮ LIỆU**: không `<button>` thường (vẫn tới được bằng Tab). Checkbox/radio
  cũng loại — UI kit render chúng thành `<button role="checkbox">`, và tick chọn dòng không phải dữ liệu của form.
- **`caretOf` / `setCaret` bọc try/catch**: đọc/ghi `selectionStart`, `setSelectionRange` ném lỗi với input
  `number`, `email`… trên một số trình duyệt → coi như "được rời" và bỏ qua đặt con trỏ (focus là đủ).
- **Chấm điểm ô đích** = khoảng cách theo hướng + `CROSS_AXIS_PENALTY` (2) × lệch trục phụ → ưu tiên ô
  thẳng hàng; `AXIS_TOLERANCE` (4px) bỏ qua lệch 1–2px do border/padding của cell.
- **Tách khỏi hook** vì toàn bộ là hàm thuần (chỉ đọc toạ độ ô + vị trí con trỏ, không React) nên test
  riêng được — `clean-code-standards.md §4`.

## browser/entry-grid.utils.ts

- **"Cùng cột" theo `cellIndex` của `<td>`, không theo toạ độ** như `field-nav`: dòng bảng nhập cùng cao, cột thẳng
  hàng nên đếm ô là đủ và không lệch khi cuộn ngang / cột ghim; đổi lại thân bảng có `colSpan` thì không dùng được.
- **Chỉ bắt Enter từ `<input>`**: Enter trên trigger (`<button>` của Dropdown / DatePicker) là MỞ panel, trong
  `<textarea>` là xuống dòng — cướp phím ở đó là mất hành vi gốc. Đích thì nhận cả nút (ô chọn).
- **`preventDefault` chỉ khi đã chuyển được**: ở dòng cuối Enter rơi về hành vi mặc định (vd submit form bọc ngoài).
- **Bỏ qua `isComposing` / keyCode 229**: Telex / VNI chốt chữ bằng Enter (`ime-safe-input.md`).

## browser/image-size.utils.ts

- **Ảnh gửi NGUYÊN BẢN, không thu nhỏ trước khi upload** (ảnh chụp màn hình tài liệu bị mất chữ). Hàm này
  chỉ đọc `width/height` để bong bóng chừa sẵn chỗ, không giật bố cục lúc ảnh tải xong.

## browser/storage.utils.ts

- **MỘT lớp `localStorage` không ném lỗi** (`safeStorage`) cho mọi nơi đọc / ghi kho (`useLocalStorage`, `useFormDraft`,
  `useMultiTabSync`). Chữ ký trùng `StateStorage` của zustand nên dùng thẳng cho `persist`.
- **`createSafeJSONStorage()` cho store `persist`**: `createJSONStorage(() => localStorage)` chỉ bắt lỗi lúc LẤY kho;
  `setItem` hết quota vẫn ném ra khỏi `set()` của store — action đổi state xong thì vỡ ngay sau đó.
- **`setItem` / `removeItem` trả `boolean`** (ghi được hay không) cho nơi cần biết, vd `useFormDraft` chỉ báo "đã lưu
  nháp" khi ghi thật.

## browser/jwt.utils.ts

- **KHÔNG `JSON.parse(atob(...))` thẳng**: `atob` trả chuỗi latin1 (mỗi ký tự = MỘT byte) nên claim tiếng Việt
  đọc sai từng byte — và `JSON.parse` KHÔNG ném lỗi nên hỏng hoàn toàn im lặng.
- **Cách đúng**: dựng lại mảng byte rồi để `TextDecoder('utf-8')` giải UTF-8. Có test hồi quy ở
  `tests/shared/utils/browser/jwt.utils.test.ts`.

## format/format.utils.ts

- **Bộ định dạng dựng MỘT LẦN** (hằng module + `NUMBER_CACHE`): dựng `Intl.NumberFormat` không rẻ mà `formatNumber`
  chạy trên từng ô bảng, từng nhãn biểu đồ — nên `money.utils`, nhãn chart, `formatPercent` đều đi qua nó.
- **`formatPercent(v, decimals)` thay cho tự ghép `${formatNumber(v, 1)}%`**: ghép tay mỗi nơi một số lẻ, một dấu.
  Ký hiệu tiền chưa thống nhất: `formatCurrency` in `₫`, `money.utils` in `đ` — đổi là đổi giao diện, chờ quyết.
- **`Intl.NumberFormat` của trình duyệt, KHÔNG thêm thư viện định dạng số**: có sẵn ở mọi môi trường, hiểu
  quy ước dấu phân tách từng locale và xử lý đúng số âm — ba thứ mà hàm tự viết hay làm sai.
- **`formatRelativeTime` rẽ mốc TƯƠNG LAI (`diff` âm) sang `formatDate`**: không chặn thì hạn còn 3 ngày
  nữa lại hiện "Vừa xong" (−4320 < 1).

## format/number.utils.ts · money.utils.ts

- **`NaN` lọt qua mọi guard quen tay** (`NaN == null`, `NaN === 0`, `NaN > 0` đều `false`) nên ô tiền `NaN`
  in ra chữ "NaN tỷ" giữa bảng số — guard phải là `!isFiniteNumber(...)`, không phải `== null`.
- **Nguồn `NaN` hay gặp**: `Number(undefined)` khi Recharts gọi tooltip formatter lúc chưa có payload, chia
  cho mẫu số rỗng/0 (`±Infinity`), trường số BE trả `null` trong khi type khai `number`.
- **Money — đơn vị gốc là TỶ** (VND × 10^9, BE trả sẵn). Nơi cầm số đồng dùng `formatMoneyCompactRaw`: nó
  ỦY QUYỀN cho cùng một hàm nên chỉ có MỘT luật về ngưỡng scale và làm tròn, không ai tự chia `1e9` (hay chia nhầm `1e6`).
- **Money — `fractionDigits` áp cho CẢ `ty` lẫn `tr`** (floor, không round lên): xin 1 số lẻ vẫn giữ phần lẻ
  khi giá trị tụt xuống thang triệu (0,4005 tỷ → "400,5 tr"); `dong` luôn nguyên đồng.
- **Money — `padFraction` bật cho BẢNG**: cột lẫn "15" và "12,7" có hai độ dài nên hàng số hết thẳng cột; tắt
  cho nhãn chart / KPI vì đuôi ",0" chỉ tốn chỗ. Số `0` cũng phải đủ chữ số, không thì đúng dòng 0 là dòng lệch.
- **Money — `formatMoneyDetail` + `forceScale`** giữ đúng đơn vị kể cả khi giá trị là 0 ("0 tỷ" / "0 triệu")
  để tooltip đồng bộ với số hiển thị.

## style/cn.ts

- **Phải đăng ký token chữ cho `tailwind-merge`**: nó coi `text-*` lạ là MÀU nên `cn('text-h3', 'text-neutral-0')` rụng
  font-size. Token lấy từ `styles/font/font.json`, hậu tố khớp `scripts/generate-font.mjs` (`tailwind-conventions.md`).
- **Không dùng `tv()` (`tailwind-variants`)**: nó có instance twMerge RIÊNG không biết token chữ nên nuốt âm thầm
  class màu chữ đi cùng `text-body-*`; `cn()` là nơi DUY NHẤT gộp class — `component-structure.md §2`.

## style/color-mix.utils.ts

- **MỘT hàm `colorMix()`, MỘT quy ước `(màu, alpha 0–1, nền = transparent, không gian = srgb)`**: nhiều helper với
  thang 0–1 lẫn 0–100 thì chép qua lại là lệch 100 lần. `tokenVarAlpha` / `tokenVarOver` của chart gọi lại hàm này.
- **Tham số là MÀU CSS, không phải tên token**: nhận được cả `var(--…)`, hex, `transparent`; tên token đi qua
  `tokenVar()` trước. Phần trăm làm tròn nguyên nên `0.29` vẫn ra `29%` (không `28.999…%`).
- **Chữ ăn màu tone: pha với `var(--color-fg-heading)`**, không dùng tone nguyên chất (trên nền sáng chỉ ~1.7:1).
  Viền đặc pha `var(--color-border-strong)`; `oklab` khi bắc cầu 2 hue xa nhau (`srgb` dễ ra xám bùn).

## style/task-progress.utils.ts

- **Hai thang % cố ý khác nhau, tên khác hẳn nhau**: `taskProgress*` (100 / 70 / 30) cho tiến độ MỘT việc — chỉ 100%
  mới là "xong"; `kpiHealthToken` của chart (90 / 60 / 30) cho sức khoẻ CHỈ TIÊU. Đặt tên giống nhau là bị gộp nhầm.
- **Chỉ MỘT thang màu cho tiến độ việc** (bậc `-5`), không biến thể đổi bậc cho chữ %: chữ khó đọc trên panel nổi
  là lỗi của NỀN (`bg-track`) — hạ nền mặt đó xuống `bg-subtle` thay vì thêm thang màu thứ hai.
- **`import type { ProgressVariant } from '@/shared/ui'`** phải giữ là `import type`: không có phụ thuộc RUNTIME `utils → ui`.

## validation/file.utils.ts

- **Nguồn DUY NHẤT kiểm tệp tải lên** (`getExtension`, `matchesAccept`, `validateFile`): UI kit `upload.utils.ts` chỉ
  xuất lại. Đặt ở `shared/utils` (không trong UI kit) để code ngoài UI kit dùng được mà không phụ thuộc ngược `utils → ui`.
- **Chỉ giữ luật đang được gọi** (dung lượng, `accept`); không dựng guard đuôi nguy hiểm / quét script ở FE — chặn
  đuôi nguy hiểm là việc BẮT BUỘC của server.
