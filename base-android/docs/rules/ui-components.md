# Dùng component (`@/shared/ui`)

File này nói cách **DÙNG** bộ component ở màn hình và feature.
Cách **DỰNG/SỬA** chúng nằm ở `src/shared/ui/AGENTS.md` — hai việc khác nhau,
đừng đọc nhầm file.

Xem tận mắt mọi component đang có: chạy app → `/demo` (Cài đặt → Nhà phát triển
→ Thư viện component).

---

## 0. Ba việc trước khi viết dòng JSX đầu tiên

1. **Tra `src/shared/ui/index.ts`.** Thứ bạn định viết gần như chắc chắn đã có.
2. **Tra tên token** trong `src/styles/colors/colors.json`, tên icon bằng
   `<Icon name="…" />` (`IconName` là union thật — gõ sai là `tsc` đỏ ngay).
3. **Đọc `styling-nativewind.md` + `mobile-ux.md`.** File này không lặp lại
   chúng.

⛔ Viết một control mới trong feature khi bộ chung đã có là cách chắc chắn nhất
để hai bản lệch nhau ở lần đổi token kế tiếp. Nếu buộc phải viết, **ghi rõ vì
sao** ngay trên đầu file.

---

## 1. Cần gì → dùng cái gì

| Cần                                        | Dùng                             | ⛔ Đừng                                       |
| ------------------------------------------ | -------------------------------- | --------------------------------------------- |
| Nút bấm                                    | `Button`                         | tự dựng `Pressable` + `Text`                  |
| Nút chỉ có icon                            | `Button iconOnly`                | tìm `IconButton` — **không có**               |
| Chữ bấm được, không khung                  | `LinkButton`                     | `Button variant="…"` rồi xoá nền              |
| Ô nhập trong form RHF                      | `FormInput`                      | `Input` + `Controller` viết tay               |
| Ô nhập ngoài form                          | `Input`                          |                                               |
| Ô tìm kiếm                                 | `SearchInput`                    | `Input` + icon kính lúp                       |
| Nhập PIN / OTP                             | `PinInput`                       | nhiều `TextInput` cạnh nhau                   |
| Chọn từ danh sách (tỉnh, chi nhánh…)       | `Select` + `SelectSheet`         | `Input readOnly onPress` — không có `onPress` |
| Ô chọn trong form RHF                      | `FormSelect`                     | `Select` + `Controller` viết tay              |
| Tăng/giảm số lượng                         | `Stepper`                        | hai `Button` + `<Text>` tự ghép               |
| Chọn ngày                                  | `DatePicker`                     | `Input` + lịch tự dựng                        |
| Lịch nằm sẵn trên màn (bộ lọc)             | `Calendar`                       | `DatePicker` rồi ép mở sẵn                    |
| Bật/tắt một thiết lập                      | `Toggle`                         | `Checkbox` cho thiết lập                      |
| Chọn nhiều trong danh sách                 | `Checkbox`                       |                                               |
| Chọn một trong nhiều                       | `RadioGroup` + `Radio`           | `Radio` đứng lẻ (mất `value` chung)           |
| Bộ lọc bấm được, chọn nhanh mệnh giá       | `Chip`                           | `Button size="sm"`                            |
| Nhãn trạng thái **không bấm được**         | `Badge`                          | `Chip` (Chip là control, Badge là nhãn)       |
| Chấm/số đè lên icon hay avatar             | `BadgeAnchor` + `Badge`          | định vị tuyệt đối bằng tay                    |
| Tiêu đề nhóm + khối nội dung               | `Section`                        | `<Text>` rồi tự căn khe                       |
| Hàng "nhãn — giá trị"                      | `ListItem`                       | `View` + hai `Text`                           |
| Ô ảnh trần / ảnh giữ chỗ                   | `Thumbnail`                      | `<Image>` trần — lỗi tải là vẽ trong suốt     |
| Thẻ có ảnh bìa                             | `MediaCard`                      | `Card` + `<Image>` tự ghép                    |
| Khối bao quanh nội dung                    | `Card`                           |                                               |
| Thẻ tài khoản nguồn                        | `AccountCard`                    | `Card` rồi tự bày lại                         |
| Thông báo **nằm trong** trang              | `Alert`                          | `Dialog` cho việc chỉ cần đọc                 |
| Thông báo **thoáng qua**                   | `toast` (`@/shared/ui/feedback`) | `Alert` rồi tự hẹn giờ ẩn                     |
| **Bắt** người dùng quyết định              | `Dialog`                         | `BottomSheet` cho việc chặn luồng             |
| Chọn trong danh sách dài, nhập thêm        | `BottomSheet`                    | `Dialog` (không cuộn, không cao)              |
| Giải thích ngắn cạnh một nhãn              | `Tooltip`                        |                                               |
| Giải thích dài (> 5 dòng)                  | `TooltipSheet`                   | nhồi vào `Tooltip` — bong bóng tràn màn       |
| Chuyển giữa vài nhóm nội dung              | `Tabs`                           |                                               |
| Danh sách rỗng / lỗi / chưa có dữ liệu     | `EmptyState`                     | `Text` "Không có dữ liệu"                     |
| Đang tải, giữ chỗ bố cục                   | `Skeleton*`                      | `ActivityIndicator` giữa màn                  |
| Tiến trình theo bước                       | `Progress` / `ProgressStep`      |                                               |
| Chấm trang của carousel                    | `SliderDot`                      |                                               |
| Ảnh đại diện / chữ viết tắt                | `Avatar`                         |                                               |
| Đường kẻ ngăn                              | `Divider`                        | `View className="h-px bg-…"`                  |
| Khung màn hình (safe area, cuộn, bàn phím) | `Screen`                         | `SafeAreaView` + `ScrollView` tự ghép         |
| Thanh tiêu đề                              | `AppBar`                         | `Stack.Screen options.header`                 |
| Thanh phụ trên bàn phím (nút "Xong")       | `KeyboardBar`                    | `InputAccessoryView` — chỉ chạy iOS           |
| Hàng nút cố định đáy màn                   | `BottomActionBar`                | `View` absolute đáy                           |
| Thanh tab dưới của app                     | `BottomNav` (qua `AppTabBar`)    | thanh tab mặc định của React Navigation       |

---

## 2. Nhập từ đâu

```tsx
import { Button, Input, ListItem } from '@/shared/ui'; // ✅ đường chính
import { Icon } from '@/shared/ui/icon'; // ✅ nhóm riêng cũng được
import { toast } from '@/shared/ui/feedback/toast-store'; // ✅ BẮT BUỘC đường đầy đủ
```

⛔ **`ToastHost` và `toast-store` cố ý KHÔNG nằm trong barrel.** `ToastHost` mount
đúng MỘT lần ở `AppProviders`. Gom vào barrel là mời người ta mount lần thứ hai,
và lúc đó mỗi toast hiện ra hai bản chồng lên nhau.

⛔ **Bên trong `src/shared/ui/` thì tuyệt đối không nhập từ `@/shared/ui`** — kể
cả khi component cần dùng lẫn nhau. Vòng nhập trên React Native hiện ra LÚC CHẠY
dưới dạng `undefined is not a function` ở một file không liên quan tới chỗ sai.
Nhập thẳng: `'../button/Button'`. ESLint chặn (`import/no-cycle`).

---

## 3. Tên prop KHÔNG đồng nhất — bảng tra

Đây là chỗ mất thời gian nhiều nhất khi dùng bộ này. Bốn tên khác nhau cho cùng
một khái niệm "kiểu hiển thị", và `tsc` chỉ báo sau khi bạn đã gõ sai.

| Component      | Prop chọn kiểu      | Giá trị                                                                                                                                                                                                                     |
| -------------- | ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Button`       | `variant`           | `primary` `secondary` `tertiary` `neutral` `neutral-secondary` `neutral-tertiary` `white` `white-secondary` `danger` `danger-secondary` `success` `success-secondary` `info` `info-secondary` `warning` `warning-secondary` |
| `LinkButton`   | **`tone`**          | `primary` `white` `danger` `success` `info` `warning`                                                                                                                                                                       |
| `Alert`        | **`tone`**          | `info` `success` `warning` `error` `brand`                                                                                                                                                                                  |
| `Badge`        | `variant`           | `info` `success` `warning` `error` `brand` `neutral` `disabled`                                                                                                                                                             |
| `Badge`        | **và** `appearance` | `soft` `solid` `text`                                                                                                                                                                                                       |
| `Chip`         | **`role`**          | `button` `checkbox` `radio`                                                                                                                                                                                                 |
| `Dialog`       | `variant`           | `default` `success` `warning` `error` `loading`                                                                                                                                                                             |
| `Tabs`         | `variant`           | `pill` `underline`                                                                                                                                                                                                          |
| `Divider`      | `variant`           | `solid` `dashed` — **và** `tone`: `default` `strong`                                                                                                                                                                        |
| `SearchInput`  | `variant`           | `stroke` `white`                                                                                                                                                                                                            |
| `ProgressStep` | **`status`**        | `done` `current` `pending` `error`                                                                                                                                                                                          |

⚠️ `Button` dùng **`danger`**, `Alert`/`Badge` dùng **`error`**. Cùng một ý,
hai chữ. Không có cách nhớ nào ngoài tra bảng này.

⚠️ **`Section` mang tiêu đề, `Card` mang nền.** Tiêu đề nhóm nằm NGOÀI thẻ
(`<Section title="…"><Card>…</Card></Section>`), không phải `Card.title`. Đây là
bố cục lặp nhiều nhất trong bản vẽ. `Section` lo khe 12 xuống nội dung; khe 24
giữa hai `Section` thì nơi gọi lo — gộp cả hai vào component là cộng dồn `gap`.

⚠️ **`FormSelect` nhận `format`, KHÔNG nhận `value`.** Form giữ MÃ, ô hiện TÊN.
Truyền `value` từ state riêng thì `reset()` / `setValue()` / điền từ server làm ô
hiện tên CŨ trong khi dữ liệu gửi đi là mã MỚI — sai lặng lẽ, không lỗi nào báo.

⚠️ **`Alert tone="info"` là TEAL, không phải xanh dương** — bản vẽ không có alert
xanh dương nào. `brand` là bí danh MÀU của `info`, khác duy nhất ở chỗ nó không
có icon mặc định (ứng với `Intent=None` của Figma).
⛔ Đừng "sửa" `Badge variant="info"` cho giống: badge `info` ĐÚNG là xanh dương
`#1043A9`. Khác biệt này có thật giữa hai component.

⚠️ `Chip role` không phải dáng vẻ — nó là **vai trợ năng**. `role="checkbox"`
làm trình đọc màn hình đọc "hộp kiểm, đã chọn". Chọn theo hành vi thật của chip,
đừng để mặc định nếu chip của bạn là bộ lọc bật/tắt.

### Thang cỡ cũng không chung một bộ

| Component               | `size`                 |
| ----------------------- | ---------------------- |
| `Button`                | `lg` `md` `sm` `xs`    |
| `LinkButton`, `Chip`    | `lg` `md` `sm`         |
| `Checkbox`, `Toggle`    | `md` `sm`              |
| `Icon`                  | tên bậc **hoặc số** dp |
| `Skeleton`, `SliderDot` | **số dp trần**         |

⚠️ `Toggle busy` (tuỳ chọn): công tắc đang lưu lên máy chủ — giữ nguyên dáng, chặn
bấm đôi, báo `busy` cho trình đọc màn hình. Khác `disabled` (không được đổi). Giữ
`value` ở nơi gọi và chỉ đổi sau khi máy chủ xác nhận; hoàn lại khi lỗi thì núm tự
trượt về.

---

## 4. Bốn API dễ dùng sai

### 4.1 `SearchInput` là UNCONTROLLED, và đó là ràng buộc cứng

```tsx
<SearchInput defaultValue={q} onChangeText={setQ} />   {/* ✅ */}
<SearchInput value={q} onChangeText={setQ} />          {/* ❌ tsc đỏ — `value` bị Omit */}
```

Lý do không phải sở thích: ghi đè state giữa lúc bộ gõ đang ghép dấu làm **mất
dấu** hoặc nhảy con trỏ về đầu trên Android + Telex. Người dùng gõ "mét khối" ra
"met khoi" rồi kết luận app hỏng. Cần đọc/đặt giá trị thì dùng `useSearchInput()`
hoặc `ref` (`SearchInputHandle`).

Mọi component còn lại đều **controlled** bình thường.

### 4.2 Ba component báo lỗi bằng ba API khác nhau

```tsx
<Input message="Số tài khoản không hợp lệ" messageTone="error" />  // chuỗi + tông riêng
<PinInput error="Mã PIN sai" />                                     // boolean | string
<DatePicker error="Chọn ngày trong quá khứ" />                      // chuỗi
```

⚠️ `Input` **không** có prop `error`. Truyền vào là `tsc` đỏ — nhớ `message` +
`messageTone`.

⚠️ Trong form thì để `FormInput` lo: nó đã nối `control` + `name` vào
`message`/`messageTone` đúng nhịp. ⛔ Đừng tự truyền `message` đè lên nó.

### 4.3 Icon: chỗ nhận TÊN, chỗ nhận NODE

```tsx
<Button iconLeft="arrow-left" />                          // ✅ tên (IconName)
<Chip leading={<Icon name="filter" size="sm" />} />       // ✅ node
<Alert icon={<Icon name="alert-warning" />} />            // ✅ node
<Avatar fallbackIcon="user" />                            // ✅ tên
```

| Nhận **tên** (`IconName`)                                                | Nhận **node** (`ReactNode`)                                                                    |
| ------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------- |
| `Button` / `LinkButton` `iconLeft` `iconRight` · `Avatar` `fallbackIcon` | `Chip` / `ListItem` / `Input` / `AccountCard` `leading` `trailing` · `Alert` / `Dialog` `icon` |

Có **303** tên icon (152 hệ thống · 44 chức năng `fn/…` · 107 logo `bank/…`).
⚠️ Tên theo bộ của ngân hàng, không theo thói quen phương Tây: `cancel` chứ không
`close`, `view`/`hide` chứ không `eye`, `arrow-down-small` chứ không
`chevron-down`, `add`/`delete` chứ không `plus`/`trash`.

⛔ Đừng vẽ `<Svg><Path>` tay và đừng dùng `@expo/vector-icons` — gói đã bị gỡ.

### 4.4 `className` đi vào lớp nào

`className` luôn nhận được, nhưng nó **không phải lúc nào cũng tới lớp bạn nghĩ**.

| Component     | `className` rơi vào                                               | Muốn chỉnh lớp trong thì dùng             |
| ------------- | ----------------------------------------------------------------- | ----------------------------------------- |
| `Screen`      | khung ngoài                                                       | `contentClassName`                        |
| `Input`       | khối cả cụm                                                       | `inputClassName`                          |
| `SearchInput` | khối cả cụm                                                       | `inputClassName`                          |
| `Button`      | khối **nhìn thấy** bên trong, ⛔ không phải `Pressable` bọc ngoài | bọc `<View className="flex-1">` bên ngoài |

⚠️ Vì thế `<Button className="flex-1" />` **không** làm nút giãn trong hàng —
`Pressable` bọc ngoài vẫn ôm sát chữ. Đúng cách:

```tsx
<View className="flex-1">
  <Button fullWidth label="Xác nhận" onPress={submit} />
</View>
```

---

## 5. Ghép component — năm cạm bẫy đã đo được

### `Screen gradient` + `AppBar`

```tsx
<Screen gradient header={<AppBar title="Chuyển tiền" />}>   {/* ✅ AppBar để MẶC ĐỊNH */}
```

⛔ Đừng truyền `opaque` cho `AppBar` khi `Screen` đang bật `gradient`. Thanh tiêu
đề nằm TRÊN dải màu; cho nó nền riêng là thành hai mảng màu chồng nhau và mép nối
hiện ra thành một đường ngang không có trong bản vẽ.

### `Screen footer` + `BottomActionBar` → cộng đúp vùng an toàn

`Screen` KHÔNG đệm vùng an toàn cho khe `footer` — chính `BottomActionBar` tự cộng
`max(insets.bottom, 16)`. Tự đệm thêm `insets.bottom` quanh `footer` là thừa tới
**68dp** trống trên iPhone. Dùng `<Screen footer={<BottomActionBar>…</BottomActionBar>}>`
và để nguyên.

⚠️ Màn nằm TRONG `<Tabs>` (trên `BottomNav`): `BottomActionBar` tự nhận ra qua
`BottomTabBarHeightContext` và chỉ chừa khe **16dp** tới thanh tab — thanh tab đã ăn
vạch gạt ngang rồi. Cộng `insets.bottom` nữa là dải trống 34dp giữa nút và thanh tab.

### Khe dưới thanh tiêu đề — MỘT chủ

`Screen` có `header` KHÔNG tự đệm trên. Khe 8dp tới nội dung là của **khối đầu của
màn** (`<View className="gap-md py-xs">`, như Home/Settings/Profile). Màn nào bỏ
`py-xs` thì nội dung dính sát thanh tiêu đề; màn nào thêm `pt-*` nữa thì thành 16dp.

### Ba lớp phủ, đừng nhầm

| Dùng           | Khi                                                           |
| -------------- | ------------------------------------------------------------- |
| `Dialog`       | BẮT người dùng quyết định — ngắn, 1–2 nút, không cuộn         |
| `BottomSheet`  | Chọn trong danh sách, nhập thêm, nội dung dài                 |
| `TooltipSheet` | Riêng cho tooltip cấp 3 — đã dựng sẵn tiêu đề + gạch đầu dòng |

### `Tooltip` có NGƯỠNG, vượt thì phải đổi component

Nội dung tooltip chia 4 cấp theo đúng ghi chú thiết kế. Dùng hằng số đã xuất sẵn
thay vì đếm tay:

```tsx
import { resolveTooltipLevel } from '@/shared/ui';

const level = resolveTooltipLevel(content); // 1–2 → <Tooltip>, 3 → <TooltipSheet>, 4 → màn riêng
```

`Tooltip` có `onExceedsBubble` để bạn bắt ca tràn và chuyển sang tấm trượt.

---

## 6. Trợ năng — phần NƠI GỌI phải lo

Component đã lo `accessibilityRole` và `accessibilityState`. Ba thứ còn lại chỉ
nơi gọi mới biết:

- **Nút chỉ có icon PHẢI có `accessibilityLabel`.** `ButtonProps` là union nên
  `tsc` ÉP: thiếu nhãn khi `iconOnly` là đỏ ngay, không cần ai nhắc.
  ```tsx
  <Button iconOnly iconLeft="cancel" accessibilityLabel="Đóng" onPress={close} />
  ```
- **Huy hiệu phải đọc ra nghĩa**, không chỉ đọc con số: `Badge` có
  `accessibilityLabel` — dùng nó (`"3 thông báo chưa đọc"`), đừng để trình đọc
  màn hình phát ra mỗi chữ "3".
- **Khoá nút khi đang gửi**: `Button loading` đã thay nhãn bằng vòng quay và giữ
  nguyên bề rộng. ⛔ Đừng tự dựng `{isPending ? <Spinner/> : 'Gửi'}` — bố cục sẽ
  giật đúng lúc người dùng đang nhìn vào nút.

---

## 7. Khi nào ĐƯỢC viết component cục bộ

Chỉ khi cả ba điều đúng:

1. Bộ chung thật sự không có thứ tương đương (đã tra barrel **và** `/demo`).
2. Nó chỉ dùng trong một feature. Dùng ở feature thứ hai ⇒ chuyển lên
   `src/shared/ui/` và đọc `src/shared/ui/AGENTS.md` trước.
3. Bạn ghi được **vì sao** ngay trên đầu file.

Đặt tại `src/features/<feature>/components/`. Vẫn phải theo mọi luật của
`styling-nativewind.md`: token, `tv()` + `twMergeConfig`, không hex thô.

---

## 8. Còn thiếu — đừng tưởng mình gọi sai

Đợt đối chiếu Figma gần nhất đã vá hết các lỗi HIỂN THỊ. Phần còn lại đều bị
chặn vì **thiếu asset chưa xuất từ Figma**, chứ không phải vì code sai. Gặp đúng
những ca này thì đừng đi tìm lỗi ở phía mình:

| Chỗ            | Còn thiếu gì                                                                                                                      |
| -------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `EmptyState`   | Prop `illustration` chưa dùng được — bộ **5 hình minh hoạ** chưa có trong `assets/`                                               |
| `Dialog`       | Icon vẫn nét `bulk`; bản vẽ là `solid` — thiếu `alert-warning.solid.svg` và `alert-warning-circle.solid.svg`                      |
| `BottomNav`    | Icon tab đang mở vẫn `twotone` — thiếu `home.solid.svg`, `user.solid.svg`. Chưa có mục giữa "Quét QR", chưa có 2 lớp ảnh hoạ tiết |
| `Avatar`       | Mới 3/7 kiểu ruột. Thiếu kiểu logo ngân hàng và kiểu Invoice/NCC — cần thêm prop, không chỉ thêm asset                            |
| Ô nhập số tiền | Dựng bằng `Input labelInside`. `MoneyInput` riêng còn trong backlog                                                               |
| `PinInput`     | Có `box` và `dot`. Thiếu kiểu "một ô dài 8 gạch" — chưa màn hình nào cần                                                          |

⛔ Đừng "vá tại chỗ" bằng cách chèn class đè ở nơi gọi — sửa ở `src/shared/ui/`
để mọi màn hình cùng được vá.

⚠️ Hai chỗ trùng lặp đã biết, **đừng tự gộp**: `TooltipSheet` gần như là bản sao
thứ hai của `BottomSheet` (Figma xác nhận cùng một component), và hai cái tính
đệm đáy theo hai công thức khác nhau. Gộp là đổi API và ảnh hưởng cả
`DatePicker` — việc đó cần lên kế hoạch riêng.

---

## 9. Trước khi commit

```bash
npm run check     # typecheck → lint → check:imports → check:classes → test
```

⚠️ `check:classes` là bước **duy nhất** bắt được class Tailwind không sinh CSS.
NativeWind bỏ qua class sai hoàn toàn im lặng: không cảnh báo, không lỗi, giao
diện chỉ đơn giản là sai.

⛔ Trong test đừng `expect(el).toHaveStyle(...)` — NativeWind không biên dịch
trong Jest nên `style` luôn rỗng. Test hành vi: render được, `onPress` được gọi,
`disabled` chặn được, nhãn trợ năng có mặt.
