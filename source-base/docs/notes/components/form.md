# Ghi chú component — form (`src/shared/ui/form/`)

> Lý do thiết kế KHÔNG hiển nhiên của nhóm `form/` (gốc · `fields/` · `hooks/` · `layout/` · `patterns/`),
> tách khỏi code theo `comment-policy.md §3`. Mỗi mục ≤ 6 gạch; chỉ ghi điều code không tự nói và rule
> chung chưa có.

## Form

- **`autoSave`: `onSubmit` xong không lỗi thì xoá nháp** (`clear()` của `useFormDraft`): caller không với tới hook
  bên trong `<Form>`, nháp cũ còn lại sẽ đè dữ liệu mới lưu ở lần mở sau (tới 7 ngày). `onSubmit` ném → giữ nháp.

## FormItem

- **id nối nhãn ↔ ô do FIELD cấp** (`useFieldA11y`), FormItem không tự sinh: control nằm ở `children`,
  chỉ field gắn được id lên nó. Bỏ trống vẫn chạy — dùng cho ô read-only không có control.
- **Có lỗi thì `description` lùi về `sr-only`** trong cùng khối `min-h-4` với dòng lỗi: không xếp chồng
  thêm một dòng, mà trình đọc màn hình vẫn đọc được gợi ý.
- **Dấu `*`:** `leading-none` + `translate-y-px` căn glyph ngang chữ (thiếu thì dính mép trên line-box
  20px); `select-none` để bôi đen nhãn không kéo theo dấu sao.
- **Nhãn `fg-subheading`, không `fg-heading`** (`text-contrast.md §5`): giá trị trong ô là `fg-heading`, nhãn lùi
  một bậc để mắt đọc giá trị trước.
- **Dòng lỗi có icon theo `errorColor`** (`aria-hidden`, nội dung đọc vẫn chỉ là câu lỗi) và `animate-chip-in` khi
  xuất hiện; đổi câu lỗi tại chỗ không chạy lại hiệu ứng (cùng phần tử). Theme tối: dấu `*` và dòng lỗi phát sáng nhẹ
  bằng `text-shadow` pha `currentColor` — một class cho cả 4 `errorColor`.

## FormActions

- **Nút cỡ `md` (h-9)** để khớp footer `FormModal` (`buttonSize` mặc định `md`): cùng một form mở
  inline hay trong modal phải ra cùng cỡ nút. Default `xl` của `<Button>` không bị đụng tới.
- **`sticky` cộng `--safe-b` vào đệm đáy** (`pb-[calc(1rem+var(--safe-b,0px))]` = đúng 16px ở laptop): hàng dính nằm ở mép
  vùng cuộn, tức đè lên vạch Home — nơi bọc (Drawer / Modal) KHÔNG tự đệm thêm cho nó, kẻo đệm đôi. Nhiều nút thì xuống dòng.
- **`sticky`: nền `bg-surface/90` + bóng đổ ngược lên** vì thanh nằm trên panel / trang (nền surface). `FormModal` có
  footer riêng nên không dùng `sticky` trong modal; thanh không tự đệm ngang — cha (hoặc `className`) lo.
- **`sticky` theme tối = "thanh lệnh"**: viền trên `primary-5/25` + ray `HUD_TOP_RAIL_AFTER` + rọi dốc từ đỉnh. Ray neo vào
  chính thanh (`sticky` đã là phần tử định vị, không cần `relative`); bản không sticky không có viền nên không ray.

## PasswordStrength

- **`password-strength.utils.ts` là file riêng** để `PasswordStrength.tsx` chỉ export component
  (`react-refresh/only-export-components`; không thì Fast Refresh gỡ cả module mỗi lần lưu).
- **4 vạch vuông, màu theo mức**: empty `bg-track` · weak `error` · moderate `warning` · strong `success`; số vạch
  sáng 0 / 1 / 2 / 4 — "trung bình" = nửa thước, "mạnh" = đầy.
- **Không có bậc `info`**: `PasswordStrengthLevel` (4 giá trị) và thang 3 của `getPasswordLevel` là API công khai;
  thêm bậc "khá" là đổi hợp đồng của mọi nơi gọi.
- **Theme tối = thước đo phát sáng**: vạch sáng dốc `<họ>-3` → màu mức + gờ 1px + quầng theo mức (bậc sáng lấy họ gốc
  `red/orange/green-3` vì alias chỉ có vài bậc); vạch tắt là rãnh `bg-subtle` viền trong `divider-strong`; nhãn mức phát sáng.
  Cao giữ `h-1` ở cả hai theme — không để đổi theme xô hàng.

## useFormField · FieldReadOnly

- **Một khung cho mọi field**: `useFormField(name, { label, description })` trả `{ field, error, a11y, readOnly }` —
  câu lỗi và id trợ năng lấy ở MỘT chỗ; field tự chép mấy dòng đó thì sớm muộn lệch nhau.
- **Nhánh `readOnly` vẽ bằng `FieldReadOnly`** (`form/field-read-only.tsx`, nội bộ), luôn giữ xuống dòng; field chỉ
  định dạng giá trị — kể cả giá trị không phải chữ (liên kết tệp, chấm màu, danh sách) cũng truyền node vào nó.
- **Hàng chỉ đọc cao bằng ô `md`**: `py-2` + dòng 20px = 36px nên đổi sửa ↔ xem không xô lệch hàng; giá trị rỗng
  hiện "—" `fg-faint` (không để hàng sụp còn 16px). Theme tối có gạch chân "ô đọc" mờ dần sang phải — vẽ bằng NỀN
  (`bg-[length:100%_1px] bg-bottom`), không `border`, để giữ đúng 36px.
- **Hook dựng field nằm ở `form/fields/hooks/`** (useFormField · useFieldA11y · useFormMeta), hook cấp form ở
  `form/hooks/` — mỗi folder ≤ 8 mục; `form.context.ts` chỉ giữ context.

## useFieldA11y

- **Vì sao cần:** `<FormItem>` vẽ `<label>`, control do field dựng nên hai bên không biết id nhau →
  trình đọc màn hình đọc "edit text" TRỐNG, bấm nhãn không nhảy vào ô, `getByLabelText()` không tìm ra ô.
- **`useId()`** cho id ổn định giữa các lần render, không đụng nhau khi một field xuất hiện nhiều bản
  trong `FieldArray`.
- **`input` ≠ `trigger`:** `<input>` / `<textarea>` thật nối nhãn bằng `htmlFor`; combobox Radix, switch,
  trigger popover nối bằng `aria-labelledby`.
- **Không có `label` thì KHÔNG phát `aria-labelledby`:** trỏ vào phần tử không tồn tại sẽ xoá trắng tên
  trợ năng, tệ hơn bỏ trống.
- **`aria-describedby` liệt kê lỗi TRƯỚC mô tả:** trình đọc màn hình đọc theo thứ tự đó, lúc đang sai
  cần nghe sai ở đâu trước.

## useZodForm

- **Ép đủ ba generic** `<T, unknown, T>` (RHF v7.71+) để chỗ khai `UseFormReturn<T>` (mặc định
  `<T, any, T>`) nhận kết quả sạch.
- **`zodResolver` v5 trả `Resolver<FieldValues, any, unknown>`** bất kể schema nên phải cast về
  `Resolver<T, unknown, T>`.
- **`TContext` là `unknown`, không `any`:** `any` trong chữ ký UI kit lan ra mọi form; chỗ khai
  `UseFormReturn<T>` vẫn chạy vì slot `any` của họ nuốt `unknown`.
- **`mode: 'onTouched'`, KHÔNG `onBlur`:** `reValidateMode` chỉ có hiệu lực SAU lần submit đầu; trước đó
  `onBlur` chỉ kiểm lại khi blur nên dòng đỏ treo tới lần blur kế dù đã gõ đủ.
- `onTouched` không làm lỗi hiện sớm hơn `onBlur` (vẫn phải chạm rồi rời ô mới báo), nên mở form
  không bị đỏ lòm.

## useModalDateDefaults

- **Chỉ set khi giá trị hiện tại rỗng** và chỉ ở lần chuyển đóng → mở (hoặc mount đã mở): không đè
  ngày user đã sửa hay `defaultValues` của edit mode.
- **Effect chỉ phụ thuộc `open`:** `fields` / `value` / `format` hiếm đổi, thêm `form` vào deps chỉ gây
  chạy thừa.

## useAsyncValidation

- **`validate` vô hiệu NGAY lượt đang chạy**, kể cả khi lượt mới còn đang debounce: blur sang giá trị khác mà lỗi
  của giá trị cũ vẫn hiện thêm vài trăm ms là sai. `isValidating` giữ `true` suốt khoảng đó tới khi lượt mới xong.
- **`validate('')` ≡ `reset()`:** huỷ cả lượt đang debounce, không thì ô đã xoá trắng vẫn bị kiểm theo giá trị cũ.
- **`fn` / `errorMessage` đọc qua `useEventCallback`:** luôn là bản mới nhất lúc timer chạy, và `validate` / `reset`
  giữ identity. `debounceMs` đổi thì debounce tạo lại — lượt đang chờ lúc đó bị huỷ.
- **`fn` ném lỗi → coi như hợp lệ:** mất mạng không được chặn người dùng; ràng buộc thật vẫn do server kiểm lúc submit.

## SelectField

- **Ép giá trị form về chuỗi:** `DropdownOption.value` là string, Radix so khớp bằng `===`; form cầm số 5
  (prefill từ API) không khớp option '5', ô lặng lẽ rơi về placeholder dù giá trị đúng.
- **Giữ `''` nguyên:** nhiều bộ lọc dùng option `{ value: '' }` làm "Tất cả" (`Dropdown` có
  `EMPTY_SENTINEL` cho ca này); đổi `''` thành `undefined` là hỏng chúng.
- **`contentClassName`:** panel không có trần bề rộng nên nở bằng option rộng nhất (option có `meta`
  dài) — ghim `w-*` / `max-w-*` ở đây.
- **`metaClassName`:** mặc định cột `meta` không co và không cắt; muốn cắt "…" phải tự ghim bề rộng
  (vd `w-[280px] truncate`).

## AsyncSelectField

- **Lượt tìm kiếm MỚI NHẤT thắng** (`useLatestRequest`): gõ `a` rồi `ab`, kết quả của `a` về muộn không ghi đè;
  cờ đang tải chỉ tắt khi chính lượt mới nhất xong.
- **API lỗi → xoá danh sách + dòng "Không tải được danh sách":** danh sách cũ thuộc từ khoá khác, giữ lại dễ bị
  hiểu là kết quả của từ khoá hiện tại. Lượt tìm kiếm kế tiếp tự gỡ dòng lỗi; không toast.
- **`fetchOptions` đi qua `useEventCallback`, debounce tạo lại theo `debounceMs`:** luôn gọi bản mới nhất; đổi
  `debounceMs` giữa chừng thì lượt đang chờ bị huỷ. Unmount huỷ debounce và vô hiệu lượt đang chạy.
- **Nhãn trên nút luôn tra theo giá trị form hiện tại:** dòng vừa chọn được nhớ cả cặp `{ value, label }`, chỉ dùng
  khi `value` còn khớp; rồi tới danh sách đã tải, `valueLabel`, giá trị thô — `form.reset()` từ ngoài không còn để lại nhãn cũ.
- **`valueLabel` là nhãn của giá trị ĐANG giữ**, không gắn với một id cụ thể: UI kit không có API "lấy nhãn theo id",
  nên form điền sẵn phải truyền nhãn kèm (và đổi theo khi tự `reset` sang giá trị khác).
- **Dòng tuỳ chọn tự lo trạng thái** (`hover` · `focus-visible` · `aria-current`, không phải `data-highlighted` của Radix) nên
  theme tối tự gắn dốc `HUD_ROW_HIGHLIGHT` theo từng trạng thái — sửa công thức chung thì sửa cả 3 dòng ở đây.

## CascadeSelectField

- **Option của mỗi cấp lưu kèm khoá giá trị các cấp cha** (`parentKey`); chỉ hiện khi khớp chuỗi giá trị hiện tại,
  "Đang tải..." suy ra từ chỗ chưa khớp — đổi cấp cha tự ẩn option + cờ tải của MỌI cấp sâu hơn, không cần xoá tay.
- **Nạp theo GIÁ TRỊ, không theo sự kiện đổi:** effect chạy lại khi chuỗi giá trị đổi (chọn, điền sẵn lúc mount, hay
  `form.reset()` sau mount trong modal sửa) và nạp mọi cấp có đủ cha mà chưa có option đúng khoá.
- **Mỗi lượt effect một đời `useLatestRequest`, cleanup `invalidate()`:** chuỗi đổi thì kết quả của lượt cũ bị bỏ, cấp
  còn thiếu được nạp lại ở lượt mới; StrictMode / unmount cũng vô hiệu. Không setState đồng bộ trong effect.
- **Giá trị đọc qua `useWatch({ name: [tên các cấp] })`**, không `watch()` (bắt cả form host render lại mỗi lần đổi).
  Nạp lỗi → cấp đó rỗng + placeholder "Chọn", không toast, không thử lại; đổi cấp cha để nạp lại.
- **`levels` đọc qua `useEventCallback`, không nằm trong deps:** mảng literal mới mỗi render không làm nạp lại; đổi
  số / tên cấp là đổi hình dạng form, phải remount.
- **Một `useId()` chung:** `useFieldA11y` là hook, không gọi được trong vòng lặp cấp; mỗi cấp gọi hàm thuần
  `buildFieldA11y(uid + level.name + "-", …)` (`fields/field-a11y.utils.ts`) — cùng bộ id / aria với mọi field khác.

## CheckboxField

- **Truyền cả `label` và `checkboxLabel`** thì tên trợ năng là chuỗi NỐI của hai nhãn (`FormItem` nối
  `htmlFor` + `<label>` do `Checkbox` bọc ô). Cố ý giữ: cả hai đều có thật trên màn.
- **`onBlur` / `onChange` / `ref` destructure khỏi `field` trước JSX:** lint `react-hooks/refs` cấm đọc property
  của `field` (chứa ref) ngay trong JSX. Cùng cách ở mọi field chọn.
- **`ref` của RHF phải tới control focus được** (ô tích, nút switch / trigger, radio đang chọn hoặc radio bật đầu
  tiên): thiếu nó `form.setFocus` và "focus ô lỗi đầu tiên khi gửi" bỏ qua field.

## TimeField

- **`parseError` giữ riêng ở field:** giá trị gõ tay hỏng (vd "2400") thì `TimePicker` không commit nên RHF không
  có gì để báo — giữ ở đây để ô vẫn báo đỏ.
- **Tự gọi `useFieldA11y`** thay vì lấy `a11y` của `useFormField`, vì câu lỗi là bản gộp (form + gõ dở).

## DictionaryField

- **Các dòng là state riêng, giá trị form chỉ là phần đã có khoá:** `Record` không giữ được khoá rỗng nên dòng mới
  phải sống ngoài form, không thì bấm "Thêm" không thấy gì.
- **Đồng bộ ngược bằng so NỘI DUNG** (`toRecord(rows)` vs giá trị form), không so tham chiếu: `useController` có thể
  trả bản sao; nội dung khác (reset từ ngoài) thì dựng lại các dòng.
- **Nút "Thêm thuộc tính" rộng hết khung, viền đứt**: viền đứt + dấu "+" đọc ra "thêm dòng" (mẫu Form.List), không
  lẫn với ô nhập; dòng mới tự focus ô khoá.

## IPAddressField

- **Không dùng `PatternFormat` (`###.###.###.###`):** giá trị nó trả bỏ hết ký tự hằng của mẫu → form nhận
  `192168001001`, không bao giờ khớp `ipv4Field()`; mẫu cố định 3 số mỗi octet cũng bắt gõ `001`.
- **`Input` + lọc ký tự** (`\d` `.` và `:` khi `withPort`): giá trị lưu đúng chuỗi người dùng thấy; khoảng hợp lệ
  để Zod kiểm.

## DateField · DateRangeField

- **Đọc giá trị bằng `dayjs()` (`date-value.utils.ts`), không `new Date('YYYY-MM-DD')`:** chuỗi chỉ có ngày bị JS
  hiểu là nửa đêm UTC → ở múi giờ âm ô hiện lùi một ngày. Chuỗi hỏng → `null` thay vì `Invalid Date`.

## FormSection

- **Tiêu đề thu gọn là `<button aria-expanded>` nằm TRONG `<h3>`** (mẫu disclosure của WAI-ARIA): giữ được vai trò
  heading cho trình đọc màn hình mà vẫn Tab / Enter / Space được. Mô tả ở ngoài nút, nối bằng `aria-describedby`.
- **Nút thu gọn cao 20px nên nới hộp bấm `::after`** (`TOUCH_HIT_CLASSES.row`, +8px mỗi phía) trên cảm ứng — hình giữ nguyên.
- **`aria-controls` chỉ gắn khi đang mở:** nội dung bị gỡ khỏi DOM khi đóng, trỏ vào id không tồn tại là sai.
- **Thu gọn là gỡ thân khỏi DOM**: field giữ giá trị (RHF `shouldUnregister: false`) nhưng lỗi bên trong không hiện
  và RHF không focus được — section chứa field bắt buộc nên mở sẵn.
- **Dấu `//` (`HUD_TITLE_MARK`, cùng BoxPanel) thay vạch dọc** — đứng NGOÀI `<h3>` (`aria-hidden`), cột chữ (tiêu đề + mô tả)
  bên cạnh nên mô tả tự thẳng hàng chữ tiêu đề, không phải canh `pl` theo bề rộng dấu. Đường kẻ dưới chỉ có vệt dốc
  `primary-4` → trong suốt (2/3 bề ngang, quầng `drop-shadow` bám theo alpha) ở theme tối — theme sáng giữ kẻ 1px sạch.

## FormStepper

- **Enter trong ô gõ chữ = "Tiếp theo"** (bước cuối = "Hoàn tất"): để `<form>` bao ngoài tự gửi thì nó validate CẢ
  form — field của bước chưa mở bị đánh lỗi trước khi người dùng thấy.
- **Chấm đỏ chỉ cho bước ≤ bước đang mở**; "Hoàn tất" hỏng vì lỗi ở bước khác → nhảy về bước đầu có lỗi (bước ẩn
  không có trên DOM nên RHF không focus được — cùng lý do với FormTabs).
- **"Tiếp theo" chỉ sang bước kế của bước LÚC BẤM:** ghi `from` trước `await form.trigger()`, sau đó chỉ
  `setCurrent` khi vẫn đứng ở `from` — bấm đúp lúc kiểm chậm không nhảy cóc.
- **`useLatestRequest`:** lượt kiểm mới vô hiệu lượt cũ; "Quay lại" `invalidate()` để kết quả về muộn không đẩy đi.
- **`onSubmit` bọc try/catch như `<Form>`:** `void handleSubmit()` mà `onSubmit` ném thì thành unhandled rejection.
- **Style riêng chỉ ở hàng nút** (thanh tiến trình là `Stepper`): theme tối vạch ngăn trên = nét dốc sáng giữa như
  `Toolbar border="top"`, bộ đếm "Bước n/m" `fg-body` + quầng nhẹ.

## FormGrid

- **`1fr` không có trần:** modal ~700px thì `cols={2}` ra 2 cột 340px nên lỗi ẩn; trang full-width màn
  ngoài (~1670px) thì mỗi cột phình ~800px, nhãn ở mép trái còn con trỏ ở mép phải.
- **`minmax(0,28rem)`** giữ nguyên SỐ CỘT nhưng chặn trần; 28rem/448px là TRẦN chứ không phải cỡ cố định
  — khung hẹp hơn thì cột tự co, bố cục trong modal không đổi.
- **Cận dưới `0` là bắt buộc:** thiếu nó cột lấy `min-content` làm sàn, field có chữ dài đẩy lưới tràn
  khỏi khung.
- **`fieldWidth="fill"`** trả về `1fr` (không trần): chỉ dùng khi CỐ Ý cần field trải hết khung — ô soạn
  thảo dài, bảng nhúng trong form.
- Class phải LITERAL, không ghép bằng biến — `component-structure.md §2`.

## ConditionalField

- **Chỉ `unregister` ở bước hiện → ẩn** (so `prevVisibleRef`): `unregisterNames` viết literal là mảng
  MỚI mỗi render, `unregister` theo deps sẽ chạy lại mỗi render → vòng lặp vô hạn.

## DynamicSchemaField

- **Bỏ qua lần render đầu:** `defaultValues` đã đặt discriminant thì validate lúc mount hiện lỗi "bắt buộc"
  trước khi người dùng gõ. Chỉ `trigger()` khi giá trị đổi SAU đó.

## useFormDraft

- **`key` bắt buộc và phải cụ thể**: nháp trong localStorage dùng chung cho mọi tài khoản trên máy, khoá chung
  chung là người sau thấy nháp của người trước. `<Form autoSave>` vì thế chỉ nhận `{ key }`, không nhận `true`.
- **Hàm lưu debounce sống TRONG effect, tạo lại theo `storageKey`.** Tạo một lần bằng `useRef` thì
  nó giữ khoá của lần render đầu — sửa bản ghi A rồi chuyển sang B vẫn ghi vào nháp của A.
- **`clear()` huỷ lượt lưu đang chờ trước khi xoá**, nếu không lượt đó chạy sau và tạo lại đúng bản
  nháp vừa xoá.
- **`form.subscribe` chứ không `watch(cb)` + `formState.isDirty`:** `formState` là ảnh chụp lần render trước,
  callback chạy trước khi render — lần sửa ĐẦU TIÊN luôn thấy `isDirty: false` và không được lưu.
- **Mọi lời gọi localStorage đều bọc try/catch** (Safari riêng tư, hết dung lượng): nháp là tiện
  ích, hỏng thì bỏ qua chứ không kéo sập form.
- **Khôi phục dùng `keepDefaultValues`** để nháp được tính là "đã sửa, chưa lưu"; nháp sai `version`, quá
  `maxAgeMs` hoặc không qua `validate` bị xoá; khoá ngoài `fields` bị bỏ. Kiểu từng giá trị chỉ kiểm khi có `validate`.

## useServerErrors

- **Đọc lỗi bằng duck-typing** (`error.fieldErrors` của `AppError`, rồi `error.response.data` của
  axios thô) để UI kit không import tầng HTTP.

## FormTabs

- **Không có style nút tab riêng — dựng trên `Tabs`**: tự tô bằng palette `primary-*` thì không lật theo theme,
  tab đang chọn thành khối gần trắng trên nền tối. Badge lỗi đi qua `TabOption.trailing`.
- **Đếm lỗi bằng `get(errors, name)`**, không `hasOwnProperty`: field lồng (`address.city`) nằm ở
  `errors.address.city`, không phải khoá phẳng.
- **`useFormState({ control })`** để tự nghe `errors` / `submitCount`; đọc `form.formState` từ prop thì
  chỉ render lại khi cha render lại.
- **Gửi hỏng mà tab đang mở không có lỗi → nhảy sang tab đầu tiên có lỗi**: panel ẩn bị gỡ khỏi DOM nên RHF không
  focus được ô lỗi ở đó. So `submitCount` ngay lúc render (không effect) để không có khung hình sai tab.
- **Badge đọc là ", N lỗi"** (số hiển thị `aria-hidden` + chữ `sr-only`): nối trần thì tên tab thành
  "Cá nhân2".
