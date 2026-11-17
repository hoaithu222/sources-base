# Bộ component giao diện (`src/shared/ui/`)

Dựng theo design system **BIDV SmartBanking v2.0** (Figma
`JKRCweXTvHehczYn87NOWK`, section "Bản update mới").

Đọc `docs/rules/styling-nativewind.md`, `docs/rules/mobile-ux.md` và
`docs/rules/code-style.md` trước. File này chỉ nói phần RIÊNG của bộ component.

## Nguyên tắc số một

> **Số đo lấy từ Figma. Màu lấy từ token.**

Bản thiết kế đưa ra cỡ chữ, bo góc, giãn cách, chiều cao — chép đúng.
Nhưng mã màu trong Figma thì **KHÔNG chép vào code**: mọi màu đã có token tương
ứng, và chỉ token mới đổi được theo chế độ sáng/tối. Thấy `#00453C` trong Figma
thì viết `bg-action-base`, không viết `bg-[#00453C]`.

## Cấu trúc thư mục

```
src/shared/ui/
  <nhóm>/            kebab-case: button/ · input/ · bottom-sheet/
    <Tên>.tsx        PascalCase, 1 file = 1 component export
    index.ts         cửa ngõ public của nhóm
```

✅ **Thêm một nhóm mới thì PHẢI nối vào `src/shared/ui/index.ts`** — cùng lượt,
không để lại sau.

⚠️ Luật cũ ở đây là "đừng đụng vào barrel tổng", có lý do của nó lúc nhiều
nhánh dựng song song. Nhưng cái giá đã hiện ra: `DatePicker` dựng xong, có
`index.ts` riêng, mà **không ai nối vào barrel** — nên nó vô hình với người
dùng bộ component suốt một thời gian, và ai cần chọn ngày thì tự viết lấy. Giai
đoạn dựng song song đã xong; giờ nhóm nào thêm thì nhóm đó nối.

## Biến thể → luôn dùng `tv()`

```ts
import { tv } from 'tailwind-variants';

import { twMergeConfig } from '@/shared/utils/style/cn';

const button = tv(
  {
    slots: { root: 'flex-row items-center justify-center', label: 'text-label-lg' },
    variants: {
      variant: {
        primary: { root: 'bg-action-base', label: 'text-action-fg' },
        outline: { root: 'border-hairline border-border-brand', label: 'text-fg-brand' },
      },
      size: {
        md: { root: 'h-control-md rounded-2xs px-md' },
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  },
  { twMergeConfig }, // ⛔ BẮT BUỘC, xem docs/rules/styling-nativewind.md
);
```

Prop `className` luôn nhận từ ngoài và gộp bằng `cn()` hoặc truyền vào slot —
component nào cũng phải cho phép nơi gọi chỉnh vài lớp mà không phải fork.

## Token có sẵn (dùng ĐÚNG tên này)

> ⛔ **Tên token ≠ tên class.** Tiện ích là `<thuộc tính>-<tên token>`, nên token
> `bg-1` viết thành **`bg-bg-1`**, `bg-nav` → **`bg-bg-nav`**, `fg-1` →
> `text-fg-1`, `border-1` → `border-border-1`. Viết `bg-nav` là đòi một màu tên
> `nav` — không có, và NativeWind bỏ qua ÂM THẦM (mất nền, không lỗi nào báo).

**Nền**: `bg-base` `bg-1`…`bg-4` `bg-input` `bg-input-2` `bg-chart` `bg-popup`
`bg-nav` `bg-dialog` `bg-dialog-2` `bg-skeleton` `bg-ink-light` `bg-ink-medium`

**Nền phủ nhạt theo ngữ cảnh** (đặc, cho alert/badge/chip):
`surface-primary` `surface-secondary` `surface-tertiary` `surface-success`
`surface-info` `surface-warning` `surface-error` `surface-neutral`

**Nền phủ có độ trong** (nhìn xuyên được, 10% — đúng nấc `Opacity/*/Op10` của
thiết kế): `bg-primary` `bg-secondary` `bg-tertiary` `bg-accent` `bg-success`
`bg-info` `bg-warning` `bg-error` `bg-neutral`; nấc 20%:
`bg-primary-strong` `bg-tertiary-strong`; lớp phủ lúc nhấn: `press-overlay`.
⛔ Nhóm này KHÔNG dùng được modifier `/50`.

**Chữ**: `fg-1` (chính) `fg-2` (phụ) `fg-3` (mờ — chỉ cho placeholder, tương
phản 2.96:1 nên ⛔ không dùng cho nội dung) `fg-4` `fg-5` `fg-inverse`
`fg-inverse-muted` `fg-brand` `fg-brand-muted` `fg-accent` `fg-on-brand`
`fg-on-nav` `fg-on-nav-muted` `fg-on-popup` `fg-on-dialog`

**Ngữ nghĩa** (một màu, cho chữ + icon): `success` `info` `warning` `error` `link`

**Hành động** (nút, control — bám đúng token `Background/*` của thiết kế):

- Thương hiệu: `action-base` `action-hover` `action-press` `action-fg`
  `action-tint` `action-tint-strong`
- Vàng/nâu: `action-accent` `action-accent-press` `action-accent-fg`
- Mực / xám / trắng: `action-ink` `action-ink-hover` `action-ink-press`
  `action-ink-fg` `action-grey` `action-grey-hover` `action-grey-press`
  `action-white` `action-white-hover` `action-white-press` `action-white-light`
- Ngữ cảnh: `action-error` `action-error-hover` `action-error-press`
  `action-error-fg` · `action-warning` `action-warning-press`
  `action-warning-fg` · `action-success` `action-success-hover`
  `action-success-press` `action-success-fg` · `action-info` `action-info-hover`
  `action-info-press` `action-info-fg`
- Khoá: `action-disabled` `action-disabled-ink` `action-disabled-fg`

⛔ Chữ trên nền hành động phải dùng token `*-fg` tương ứng, đừng mặc định
`fg-inverse`. Trắng trên nền vàng `action-accent` chỉ đạt 3.35:1 — đó là lý do
`action-accent-fg` là màu MỰC. Ở chế độ tối, nền nút là màu SÁNG và chữ là màu
TỐI (đảo chiều), nên viết cứng `text-white` là hỏng chế độ tối.

⛔ **Cùng cái bẫy đó cho HÌNH VẼ, không chỉ chữ.** Đặt `neutral-0` / `white-10`
lên bất kỳ nền `action-*` nào — lõi chấm tròn, dấu tick, núm công tắc — thì ở
chế độ tối đo được **1.95:1** trên `action-base`, và không tông `action-*` nào
vượt **2.8:1**: hình biến mất hoàn toàn. Nền `action-*` là màu SÁNG ở chế độ
tối. Luôn dùng `action-*-fg`.

### Luật khi thiết kế và tương phản đá nhau

Bản thiết kế của ngân hàng có vài chỗ không đạt AA. Cách xử ở đây tách làm hai,
và ranh giới là **màu** hay **cặp màu**:

- **Một MÀU do thiết kế chỉ định thì giữ nguyên.** `warning` = `#D35801` đúng
  `Foreground/Warning/Default`, đo được 4.06:1 trên nền trắng và 3.61:1 trên
  `surface-warning` — dưới ngưỡng 4.5 của chữ thường. Vẫn giữ: đổi màu nhận
  diện của ngân hàng là việc của ngân hàng, không phải của lập trình viên. Bù
  bằng cách dùng: cỡ chữ ≥ 16 + `font-semibold`, và luôn kèm biểu tượng — đừng
  để MÀU là dấu hiệu duy nhất.
- **Một CẶP màu (chữ đặt lên nền) thì đổi phần CHỮ.** Thiết kế vẽ chữ trắng
  trên nền vàng `action-accent`, đo được 3.35:1 — nên `action-accent-fg` ở đây
  là màu MỰC (5.20:1). Nền giữ đúng màu thương hiệu, chỉ chữ đổi.

Toàn bộ chế độ TỐI là suy ra (thiết kế không định nghĩa), nên ở đó không có
ràng buộc này — mọi cặp đều đã kéo lên ≥ 6:1 (thấp nhất: `surface-error` +
`error` = 6.21:1). Nguyên tắc của bảng màu tối: `docs/rules/styling-nativewind.md`.

⛔ **Đừng thêm ngoại lệ mới bằng cách nới ngưỡng.** `npm run check:contrast`
tính lại mọi cặp từ `colors.json` ở CẢ hai chế độ mỗi lần chạy; ngoại lệ khai
trong `scripts/contrast-manifest.json`, mỗi mục bắt buộc có `why` và một `floor`
— tụt dưới `floor` thì ngoại lệ tự hết hiệu lực. Đó là chỗ giữ cho những con số
đo tay rải trong chú thích khỏi mục lặng lẽ khi ai đó sửa bảng màu.

Hiện có đúng **ba** ngoại lệ thật, và cả ba đều theo luật trên:

| Cặp                                    | Sáng | Vì sao giữ                                                                                                                                                                                 |
| -------------------------------------- | ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `surface-warning` + `warning`          | 3.61 | Màu do thiết kế chỉ định. Bù bằng cỡ ≥ 16 + semibold + icon.                                                                                                                               |
| `action-warning` + `action-warning-fg` | 4.06 | Cùng lý do.                                                                                                                                                                                |
| `surface-success` + `success`          | 4.45 | Thiếu 0.05. `info` (7.45) và `error` (5.29) đều đạt ⇒ đây là ca RIÊNG của `success`, không phải chính sách chung. Bù: `Alert` luôn có icon theo tông, `Badge` soft luôn có viền `-subtle`. |

⚠️ Còn một ca đặc biệt: nhãn thanh tab dưới. `nav-from` là TÂM dải toả tròn nên
tab GIỮA nằm trên chỗ sáng nhất; trắng 80% chỉ đo 3.41:1. Nhãn đã chuyển sang
**trắng 100%** (4.35:1) — đó là TRẦN, không có màu chữ nào sáng hơn. Icon giữ
trắng 80% vì hình phi văn bản chỉ cần 3:1. ⛔ Đừng trả nhãn về 80% "cho đúng bản
vẽ": trạng thái vẫn phân biệt bằng độ ĐẬM của font.

**Viền**: `border-1` `border-2` `border-strong` `border-brand`
`border-brand-hover` `border-brand-press` `border-brand-subtle` `border-ink`
`border-ink-hover` `border-ink-press` `border-ink-disabled` `border-white`
`border-white-medium` `border-white-light` `border-error` `border-error-subtle`
`border-warning` `border-warning-subtle` `border-info` `border-info-subtle`
`border-success` `border-success-subtle` `divider-1` `divider-2`

⚠️ Bậc `-subtle` là viền NHẠT (bậc 300 của thang) — alert và badge dùng nó, đừng
lấy `border-error` đậm cho viền của khối cảnh báo.

**Khác**: `overlay` `disabled-1` `disabled-2` `ring-focus` `ring-focus-neutral`
`nav-border` `nav-divider` `nav-active-bg` `nav-from` `nav-to` `header-from`
`header-to` `header-border` `popup-border` `popup-shadow`

**Thang màu** (khi cần bậc cụ thể): `primary-1`…`primary-10` và tương tự cho
`secondary` (nâu) `tertiary` (vàng) `success` `info` `warning` `error` `ink`
`gray` · `neutral-0`…`neutral-10` · `white-1`…`white-10` · `black-1`…`black-10`.
⚠️ Thang màu GIỐNG NHAU ở hai chế độ — cái đổi theo sáng/tối là token vai trò ở
trên. Nút bấm, nền thẻ, chữ: dùng token vai trò. Thang màu chỉ cho những chỗ
thiết kế gọi đích danh một bậc (ví dụ đường viền `error-3` của ô nhập lỗi).

## Cỡ chữ (thang BIDV)

`text-display` (36/47) · `text-header-lg` (28/37) · `text-header-md` (24/32) ·
`text-header-sm` (18/24) · `text-body-lg` (16/24) · `text-body-md` (14/20) ·
`text-label-lg` (16/24) · `text-label-md` (14/20) · `text-label-sm` (12/16) ·
`text-label-xs` (10/16) · `text-caption-lg` (13/17) · `text-caption-sm` (12/16) ·
`text-link-lg` (16/21) · `text-link-md` (14/20) · `text-overline` (12/18, IN HOA)

Độ đậm: `font-regular` `font-medium` `font-semibold` `font-bold`.

⚠️ Bốn `lineHeight` nhích lên **1–7px** so với Figma (28/36 → 28/37, 13/16 →
13/17, 16/20 → 16/21, và 36/40 → 36/47 — riêng `display` nhích 7px). Không phải sai sót: dưới 1.3× thì Android **cắt
cụt dấu tiếng Việt**, và trình sinh thang chữ chặn cứng. Cỡ chữ thì đúng y bản
thiết kế.

## Hình học

- Bo góc: `rounded-none` (0) `rounded-3xs` (4) `rounded-2xs` (8) `rounded-xs` (12)
  `rounded-sm` (16) `rounded-md` (24) `rounded-lg` (32) `rounded-full`.
  ⚠️ Thang mặc định của Tailwind đã bị THAY — `rounded-sm` ở đây là **16dp**.
- Giãn cách: dùng thang số quen thuộc (`p-4` = 16dp) hoặc tên token
  (`gap-3xs` 2 · `2xs` 4 · `xs` 8 · `sm` 12 · `md` 16 · `lg` 20 · `xl` 24 ·
  `2xl` 28 · `3xl` 32 · `4xl` 40 · `5xl` 48 · `6xl` 64).
- Chiều cao control: `h-control-xs` (32) `h-control-sm` (40) `h-control-md` (48)
  `h-control-lg` (56).
- Nét viền: `border-hairline` (1dp) · `border-medium` (1.5dp) ·
  `border-thick` (2dp).
- Số đo thô cho prop không nhận className: `RADIUS`, `SPACING`, `CONTROL_HEIGHT`,
  `ICON_SIZE` từ `@/shared/theme`.

⚠️ Ba cái bẫy đã đo được, đừng mất thời gian phát hiện lại:

1. **`rounded-lg` giờ là 32dp**, không phải 8dp như Tailwind gốc. Class vẫn hợp
   lệ nên nó sai ÂM THẦM. Muốn 8dp thì viết `rounded-2xs`.
2. **`min-h-control-*` KHÔNG tồn tại.** `tailwind.config.js` chỉ nối
   `height: layout.height`, mà Tailwind 3.4 lấy `minHeight`/`maxHeight` từ
   `theme('spacing')` chứ không kế thừa từ `height`. Dùng `min-h-12`/`min-h-14`,
   hoặc `h-control-md` khi chiều cao cố định.
3. **`bg-white` / `bg-black` không sinh ra class.** Hai họ `white-*`/`black-*`
   ghi đè `white`/`black` mặc định của Tailwind và không có bậc `DEFAULT`. Cố ý:
   màu trắng đen cứng không đổi theo theme. Cần trắng thì dùng `fg-inverse`,
   `action-white`, hoặc `white-10`.

## Icon

```tsx
import { Icon } from '@/shared/ui/icon';

<Icon name="arrow-right" />                        // 24dp, màu fg-1
<Icon name="alert-warning" color="error" size="sm" />
<Icon name="setting" variant="twotone" />
<Icon name="bank/bidv" size={32} />                // logo, không nhuộm
```

Tên icon nằm trong `IconName` (`src/shared/ui/icon/icon-names.generated.ts`) nên
gõ sai là `tsc` đỏ. ⛔ Đừng dùng `@expo/vector-icons` trong bộ component mới —
nét của Ionicons lệch hẳn với bản thiết kế.

⚠️ **Tên icon theo bộ của ngân hàng, không theo thói quen đặt tên phương Tây.**
Tra danh sách thật bằng `ls assets/icons/system` trước khi đoán. Vài ca hay gõ
nhầm:

| Định gõ            | Tên thật                                |
| ------------------ | --------------------------------------- |
| `close` · `x`      | `cancel` (hoặc `clear-circle`)          |
| `check`            | `checkmark-circle` · `checkmark-square` |
| `plus` · `trash`   | `add` · `delete`                        |
| `eye` · `eye-off`  | `view` · `hide`                         |
| `chevron-down`     | `arrow-down-small`                      |
| `info` · `warning` | `alert-information` · `alert-warning`   |

Icon cần mà chưa có: dùng tên gần nhất và **ghi vào báo cáo**; ⛔ đừng tự vẽ
`<Path>`, đừng tự thêm file `.svg` — bộ icon xuất từ Figma, thêm tay là lần xuất
sau ghi đè mất.

## React Native không có `:hover`

Thiết kế có 5 trạng thái (Default · Hover · Press · Disable · Active). Trên di
động:

| Figma   | Ở đây                                                      |
| ------- | ---------------------------------------------------------- |
| Default | trạng thái thường                                          |
| Hover   | ⛔ BỎ — không có con trỏ chuột                             |
| Press   | `<Pressable>` + `({ pressed })`                            |
| Disable | prop `disabled` + token `action-disabled`                  |
| Active  | trạng thái chọn/bật của chính component (`selected`, `on`) |

⛔ **`className` KHÔNG nhận hàm.** `Pressable` cho prop `style` nhận
`({ pressed }) => …`, nhưng NativeWind chỉ nhận CHUỖI ở `className` — viết hàm
vào đó là `tsc` đỏ (`Type '({ pressed }) => string' is not assignable to type
'string'`). Lấy `pressed` ở **children** thay vì ở `className`:

```tsx
<Pressable
  accessibilityRole="button"
  accessibilityState={{ disabled }}
  className={styles.pressable()}
  disabled={disabled}
  onPress={onPress}
>
  {({ pressed }) => <View className={styles.root({ pressed })}>{/* … */}</View>}
</Pressable>
```

⚠️ Bản `useState` + `onPressIn`/`onPressOut` cũng CHẠY ĐÚNG — đã đọc lại máy
trạng thái trong `node_modules/react-native/Libraries/Pressability/Pressability.js`:
`LEAVE_PRESS_RECT` chuyển sang `RESPONDER_ACTIVE_PRESS_OUT` và `_deactivate()`
vẫn gọi `onPressOut`, kể cả khi ngón tay trượt ra ngoài rồi mới nhấc. Lý do dùng
render-prop nhẹ hơn thế: bớt một state + hai handler cho mỗi component, và
`pressed` luôn đồng bộ với chính `Pressable` chứ không phải một bản sao.

### Màu và hình của trạng thái nhấn

Nhấn là **màu chủ đạo NHẠT**, ⛔ không phải khối xám trung tính phẳng (token
`press-overlay` là xám/mực — chỉ dùng khi thật sự cần lớp phủ trung tính). Mỗi
component tự lo trong style của chính nó, không có component dùng chung:

| Component                         | Khi nhấn                                                                                        |
| --------------------------------- | ----------------------------------------------------------------------------------------------- |
| `ListItem` có `onPress`           | Lớp `bg-bg-primary` (10%) — `inset-y-0 -inset-x-xs rounded-2xs`, vẽ DƯỚI chữ                    |
| `Card` có `onPress` / `MediaCard` | Lớp `bg-bg-primary` `inset-0 rounded-md` (bo đúng 24dp), vẽ TRÊN nội dung (thấy được trên ảnh)  |
| `AccountCard` có `onPress`        | Nền đặc `action-press` (thẻ nền `action-base`; lớp mờ trên nền đặc gần như không thấy)          |
| `Tabs` (pill / underline)         | Tab chưa chọn `action-tint`; viên đang chọn `action-press` (⛔ không còn `opacity-60`)          |
| `Button` nền đặc                  | Bậc `*-press` riêng như cũ                                                                      |
| `Button` viền (`*-secondary`)     | Thêm nền NHẠT cùng tông (`action-tint` / `surface-*`) — đổi mỗi màu viền thì gần như không thấy |

- **`pressed` lấy từ render-prop của `Pressable`** (children), ⛔ không tự giữ
  `useState`: RN tự đặt về `false` khi nhả tay, khi cuộn cướp cú chạm và khi huỷ ⇒
  lớp nhấn KHÔNG thể kẹt. Hàng/thẻ `disabled` không bao giờ `pressed`.
- **Không che đường kẻ**: lớp nhấn của `ListItem` là con tuyệt đối `inset-y-0`,
  Yoga định vị nó trong mép TRONG của viền ⇒ `divider` (`border-b` của hàng) vẫn
  hiện trọn. Lớp nở 8dp ra hai bên: trong `Card` có lề nó bo tròn và chữ có chỗ
  thở; hàng chạy hết bề ngang thì phần nở bị khung cắt.
- **Bám bo góc thẻ**: `Card padded={false}` có `overflow-hidden` ⇒ hàng đầu/cuối
  theo bo 24dp. Hàng bấm được trong thẻ/tấm trượt không đệm tự lo `px-md py-sm`
  (xem `/demo`). ⛔ Cần huy hiệu tràn ra ngoài mép thẻ thì tự đè
  `className="overflow-visible"`.
- **Không dùng `android_ripple` cho hàng/thẻ**: ripple bị cắt theo hộp chữ nhật của
  `Pressable` (không theo bo góc con, không nở ra ngoài), cần mã màu thô + alpha
  (`useThemeColors()`), và iOS không có nó ⇒ hai đường code cho một hiệu ứng. Lớp
  nhấn tĩnh bằng token chạy giống hệt trên hai nền tảng.
- Test: không `toHaveStyle`. Cấp `responderGrant` (kèm `currentTarget` — thiếu thì
  `responderRelease` bị bỏ qua, `pressed` kẹt) rồi kiểm lớp nhấn có mặt / mất sau
  `responderRelease` / `responderTerminate`: `tests/ui/press-test-utils.ts`.
- **Haptic**: base KHÔNG có haptic (không `expo-haptics`). Dự án thêm haptic thì
  quy tắc chung: chạm điều hướng / đổi tab / đổi phân đoạn KHÔNG rung; chỉ rung
  cho bật/tắt (`Toggle`) và hành động thành công/xác nhận.

## Chuyển động — `Animated.View` và `className` KHÔNG đi chung

Đã đo được: NativeWind gộp class và `style` vào **một** object. Reanimated thấy
khoá `viewDescriptors` trong object đó liền coi cả object là handle animation và
**vứt sạch style đến từ class** — component thành vô hình, không lỗi nào báo.

```tsx
// ❌ mất hết style của className
<Animated.View className="bg-bg-1 rounded-md" style={animatedStyle} />

// ✅ truyền thẳng SharedValue qua style, class ở lớp bọc ngoài
<View className="bg-bg-1 rounded-md">
  <Animated.View style={{ opacity: progress }} />
</View>
```

⛔ **`cssInterop(Animated.View, { className: 'style' })` KHÔNG cứu được ca có
`useAnimatedStyle`.** Nó chỉ đủ khi `Animated.View` mang class mà KHÔNG có style
hoạt ảnh dựng bằng `useAnimatedStyle` (ví dụ `Skeleton`: truyền thẳng một
`SharedValue` qua `style`). Có `useAnimatedStyle` thì style động ghi đè và chỉ
còn `transform`/`opacity`: đã chạy thử với runtime NativeWind thật (cùng bộ
`registerCSS` của `react-native-css-interop/test`) — núm `Toggle` bản cũ ra
`{ transform: [{ translateX: 0 }] }`, mất `h-4 w-4 rounded-full bg-*` ⇒ 0×0, vô
hình trên máy thật (web KHÔNG tái hiện, nên không ai thấy lúc dev).

✅ **Cách đúng khi cần vừa trượt/mờ vừa có class:** lớp hoạt ảnh `Animated.View`
CHỈ mang `style`; hình (kích thước, bo, màu) là một `View` thường LỒNG BÊN TRONG
mang `className`. Mẫu thật: `toggle/Toggle.tsx`.

### Công tắc (`Toggle`)

- Ray `flex-row items-center` để lớp trượt chỉ ôm vừa núm, nằm mép TRÁI; núm
  `mx-px` (1dp) + viền ray 1dp = đệm 2dp **đối xứng** (⛔ `mx-0.5` là 3dp trái, 0
  phải). Quãng chạy `TRAVEL` là SỐ (md 16 · sm 12), không phải class.
- `SharedValue` khởi tạo THEO `value` (`useSharedValue(value ? 1 : 0)`): công tắc
  bật sẵn lúc mở màn đứng đúng chỗ, không trượt từ trái; effect chạy lại khi
  `value` đổi — kể cả đổi từ NGOÀI (hoàn lại sau lỗi mạng).
- `accessibilityRole="switch"`, `accessibilityState={{ busy, checked, disabled }}`
  (`checked`, không phải `selected`); vùng chạm ≥ 44dp nhờ `hitSlop`.
- `busy` (tuỳ chọn, mặc định `false`): đang lưu — GIỮ nguyên dáng, chặn bấm đôi/đua
  (không `onChange`), báo `busy` cho trình đọc màn hình. `disabled` = không được
  đổi; `busy` = đang đổi, đợi. `value` vẫn cập nhật theo nơi gọi khi đang `busy`.
- Test khoá bằng CẤU TRÚC (`testID="toggle-knob"`: `className` nằm trên `View`
  thường, lớp trượt cha không có class) vì `react-native-css-interop` không khai
  trong `package.json` nên `check:imports` chặn `registerCSS`.

## Khoảng cách đầu màn, vùng đáy, hàng lọc chip

Ba chỗ mà MỘT khe bị cộng đôi (hoặc bị cắt) vì hai component cùng nghĩ mình lo
việc đó. Mỗi khe chỉ có MỘT chủ:

| Khe                                         | Chủ duy nhất                                                                 | ⛔ Đừng                                                       |
| ------------------------------------------- | ---------------------------------------------------------------------------- | ------------------------------------------------------------- |
| Thanh tiêu đề → nội dung (8dp theo bản vẽ)  | **Khối đầu của màn**: `<View className="gap-… py-xs">`                       | Đừng thêm `pt-*` cho `Screen` có `header` — thành 16dp        |
| Vùng an toàn đáy khi màn có `footer`        | **Chính component đáy** (`BottomActionBar`); `Screen` không đệm khe `footer` | Đừng cộng `insets.bottom` ở cả `Screen` lẫn thanh đáy         |
| Vùng an toàn đáy khi màn nằm trong `<Tabs>` | **`BottomNav`** — `Screen` và `BottomActionBar` đều tự bỏ `insets.bottom`    | Đừng tự cộng `insets.bottom` cho thân màn/thanh đáy trong tab |

- **Tín hiệu "đang trên thanh tab"** là `BottomTabBarHeightContext` (chính
  `BottomTabView` cấp cho màn con, đo từ thanh tab THẬT) — ⛔ không dùng hằng số
  cứng cho chiều cao thanh tab. Trong tab, `BottomActionBar` chỉ chừa khe 16dp tới
  thanh (ngoài tab: `max(insets.bottom, 16)`).
- **`Screen scrollable={false}`** đã đệm vùng an toàn đáy cho KHUNG chứa. Danh
  sách tự cuộn đặt trong đó (FlashList/`ScrollView`) ⛔ đừng tự `paddingBottom`
  thêm vùng an toàn lần nữa — viewport ngắn đi và dòng/nút cuối bị cắt cụt ngay
  mép (CTA của `EmptyState` là nạn nhân quen).
- **Màn có nút nổi (FAB) hoặc hành động chính cố định cùng việc với CTA của
  `EmptyState`** (ví dụ FAB "Thêm" và nút "Thêm" trong khối trống): ⛔ chỉ giữ MỘT.
  Khi có FAB/`BottomActionBar` thì truyền `EmptyState` KHÔNG có `actions` (0 nút đã
  được hỗ trợ sẵn) — hai nút cùng việc là thừa và nút nổi che mất CTA ở đáy khối.
  Base chưa có FAB; dự án nào dựng thì khe tới thanh tab phải tính từ
  `BottomTabBarHeightContext`, và khi bàn phím mở thì phần tử cố định không được
  đè ô đang nhập (cộng chiều cao nó vào `bottomOffset` của `KeyboardAwareScrollView`).
- **Hàng lọc/chọn dùng `ScrollView` ngang, ⛔ không `flex-wrap`.** Bọc dòng làm
  `Chip` gãy xuống hàng hai, hàng lọc cao lên và đẩy nội dung thật xuống. Mẫu:
  `<ScrollView horizontal showsHorizontalScrollIndicator={false} className="-mx-md"
contentContainerClassName="items-center gap-xs px-md py-3xs">` — lề âm bằng đệm
  thân màn để hàng chạy sát mép; `py-3xs` vì `hitSlop` của `Chip` không ra ngoài
  được khung cuộn (chip `md` 40 + 2×2 = 44dp). Chỉ chia đều (không cuộn) khi đúng
  một hàng ngắn, số ô cố định (ví dụ mệnh giá 3 ô bằng `fullWidth`). Xem mục chip
  ở `/demo` → Component.
- **Điều hướng KHÔNG rung** (haptic): `BottomNav` không gọi haptic khi đổi tab;
  rung chỉ cho hành động có ý nghĩa. Phản hồi chạm của tab là ripple theo token
  (`fg-on-nav-accent` ~12%), không phải ripple xám mặc định của hệ điều hành.

## Bắt buộc về khả năng tiếp cận

- Mọi thứ bấm được: `accessibilityRole` + nhãn (chữ trong nút, hoặc
  `accessibilityLabel` khi nút chỉ có icon).
- Vùng chạm ≥ 44dp. Control nhỏ hơn thì `hitSlop`, đừng phóng to hình.
- `accessibilityState` phải phản ánh đúng `disabled` / `checked` / `selected` /
  `busy` — trình đọc màn hình không nhìn thấy màu.
- Mọi chữ nằm trong `<Text>`.

## Giới hạn

- 1 file `.tsx` = 1 component export, **≤ 200 dòng**. Vượt thì tách sub-component
  vào cùng thư mục.
- ⛔ Không `any`, không `@ts-expect-error`.
- Chú thích viết **VÌ SAO**, tiếng Việt, dùng dấu hiệu `⛔` `⚠️` `✅` `❌` như
  phần còn lại của repo.
- Xong việc: `npx tsc --noEmit` và `npx eslint <file bạn sửa>` phải sạch.

## Test

Mỗi nhóm component một file `tests/ui/<nhóm>.test.tsx`, test **hành vi** chứ
không phải hình thức (NativeWind không biên dịch trong Jest — `style` luôn rỗng,
xem `docs/rules/testing.md`). Đủ dùng: render được, `onPress` được gọi, `disabled`
chặn được, nhãn cho trình đọc màn hình có mặt.

⚠️ `render()` của RNTL 14 là **bất đồng bộ** — phải `await`.
