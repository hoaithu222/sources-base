# Ghi chú component — primitives (`src/shared/ui/primitives/`)

> Lý do thiết kế KHÔNG hiển nhiên của từng component, tách khỏi code theo
> `comment-policy.md §3`. Mỗi mục ≤ 6 gạch; chỉ ghi điều code không tự nói và rule
> chung chưa có.

## Avatar

- **`animate-fade-in` trên `<img>`**: Radix chỉ mount ảnh SAU khi tải xong nên trước đó ô hiện chữ
  cái đầu; fade 180ms làm bước chuyển chữ → ảnh mượt, rõ nhất ở danh sách nhiều avatar.
- **`3xs` (16px) / `2xs` (20px) chỉ để nhận mặt**, không phải phần tử bấm: dành cho dãy avatar chồng
  trong một dòng chữ nhỏ, to hơn sẽ át dòng chữ. `xxl` (128px) là avatar "hero" cho cuộc gọi 1-1.
- **Bảng màu 6 sắc khác nhau** (primary · blue · teal · yellow · purple · pink) cho `auto` (nền ổn định theo tên,
  `AVATAR_PALETTE_CLASSES`), chữ trắng chỉ trên bậc đạt ≥ 4.5:1 (`-6` / `-7`); vàng là ngoại lệ: nền `-5` chữ `-9`
  (trắng trên vàng chỉ ~1.6:1).
- **`variant="brand"`** (gradient `primary-7 → sky-8`) cho avatar user duy nhất (header, profile), không
  đổi theo tên; bậc đậm để chữ trắng ≥ 5:1 ở mọi điểm của gradient (bản Figma `-4 → -6` quá sáng). Theme tối: `brand`
  có vòng 1px `primary-4/60` + quầng mảnh, `bordered` lên `primary-4` + quầng — `brand` bỏ vòng mảnh khi đã `bordered`
  (`dark:ring-1` đè `ring-2`).
- **`onClick` → `<button>` thật qua `Root asChild`**, không `span role="button"`: có sẵn tab, Enter / Space,
  tên = `alt ?? name` (chữ cái đầu "VĐ" không phải tên đọc được). Không bấm thì vẫn `span` để lồng được trong trigger.
  Vòng focus `ring-2 ring-focus`; khi `bordered` (vòng `primary-5` trùng màu `ring-focus`) focus dày lên `ring-4`.
- **Icon user dự phòng cỡ theo `AVATAR_ICON_PX`**: `SystemIcon` đặt cỡ inline nên class `size-1/2` ở nơi
  dùng không ăn; chữ cái đầu dùng token chữ (`caption-9` → `h1`), không `text-[Npx]`.

## Badge

- **Kiểu tag Arco — tinted**: nền `{c}-5/12` + viền `ring-1 {c}-5/30` + chữ bậc đậm ở theme sáng (`-7`;
  `success` / `accent` `-8`) và `dark:` `-4` (họ có bậc 4) hoặc `-5`; ≥ 4.5:1 trên nền tint.
- **Viền là `ring-inset` (box-shadow), không `border`**: mọi variant cùng kích thước, đổi variant hay
  bật / tắt viền không xê dịch layout.
- **solid: chữ trắng chỉ trên nền đủ đậm** (≥ 4.3:1 — `-7` cho primary / secondary / success, `-6` cho
  info / indigo / error); `accent` / `warning` nền `-5` chữ `-9` vì trắng trên vàng / cam `-5` ~1.5–2.5:1.
- **disabled = tinted mờ** (nền `/6`, viền `/15`, chữ `/50`); outline = viền `-6` (tối `-5`) + chữ như
  tinted; `neutral` dùng token theo vai trò (`bg-pressed` · `fg-body` · `border-default`).
- **`size`**: `lg` cho badge đứng MỘT MÌNH làm nhãn trạng thái của cả thẻ (12px đọc quá bé); `md` đúng
  Figma; `sm` cho ô bảng / list dày; `xs` cho chip nhỏ, chỉ báo đếm.
- **`onRemove` chặn nổi bọt click** (badge hay nằm trong chip / hàng có `onClick` riêng); nút "x" hover
  nền `bg-current/15` theo màu chữ — hover đỏ thì chìm trên badge `error` và lệch tông trên badge đặc.

## Divider

- **`vertical` dùng `self-stretch`, KHÔNG `h-full`**: cha flex thường cao auto nên `height: 100%` co
  về 0; `self-stretch` giãn theo chiều cao hàng. Cần cố định thì truyền `h-*`.
- **Nhãn (`children`) chỉ hiện khi `horizontal`**; `vertical` luôn vẽ một đường đơn, bỏ qua `children`.
- **`solid` dùng `divider-default`, `dashed` / `dotted` dùng `divider-strong`**: nét đứt hở nửa chiều
  dài nên cùng một màu trông nhạt hơn hẳn nét liền.
- **Theme tối, CHỈ nét liền ngang**: tô bằng `border-image` (giữ viền 1px, không đổi cỡ) — đường đơn sáng giữa mờ hai đầu
  (ánh `sky`), bản có nhãn mỗi nửa sáng dần về phía nhãn (ánh `primary`). Nét dọc (vạch ngắn trong hàng meta), đứt, chấm
  giữ phẳng: dốc trên vạch 12px là mất hẳn. `border-image` thắng `border-color` — đổi màu nét qua `className` không ăn ở tối.

## Heading

- **Mọi cỡ dùng nét Medium (500)** theo thang Figma. `tiny` / `extraTiny` render `<h5>` / `<h6>` nhưng
  dùng token "Body 1/2 – Subhead" (18px / 16px) vì Figma không có H5 / H6.
- **`micro` / `nano` render `<p>`** (14px / 12px) cho tiêu đề phụ trong panel, thấp hơn cấp tiêu đề
  modal.
- **`light`**: `true` → `text-fg-heading` (đảo theo theme), `false` → `text-fg-muted` (tiêu đề lùi một
  cấp, vẫn ≥ 4.5:1); `fg-faint` (~2.6:1 trên nền sáng) chỉ dành cho chữ disabled.

## Text

- **Token chữ gói cỡ + line-height + nét trong MỘT khai báo**: không tách nét bằng `font-*` riêng
  (shorthand `font` reset lại; `tests/policy/styling/font-tokens.test.ts` chặn), nên mỗi cỡ có đủ 3 nét trong bảng.
- **`weight="bold"` ≡ `medium`**: thang Figma chỉ có Regular (400) và Medium (500); `bold` giữ lại cho
  tương thích API.
- **`skin` dùng token `fg-*` / semantic** (tự đảo light / dark). Chữ trên nền tối CỐ ĐỊNH (vd Header
  gradient) dùng `className="text-fg-on-chrome"`, không dùng skin.
- **`ellipsis` cắt bằng `TEXT_ELLIPSIS_CLASSES`, không `truncate`**: `truncate` đặt `overflow: hidden` nên gọt dấu mũ / thanh
  (Ố, Ế, Ắ) nằm ngoài hộp dòng; `overflow-x-clip overflow-y-visible` chỉ cắt chiều ngang (`text-ellipsis.theme`).
- **`ellipsis` luôn bọc `<Tooltip>`** (`open={false}` ép đóng khi không tràn) để node không remount khi
  trạng thái tràn đổi, giữ ref / ResizeObserver ổn định.
- **`title`**: không `ellipsis` → thuộc tính `title` gốc của thẻ; có `ellipsis` → thành nội dung
  Tooltip và bỏ `title` gốc, để không hiện hai tooltip chồng nhau.

## text-ellipsis.theme

- **`TEXT_ELLIPSIS_CLASSES` thay `truncate` ở MỌI chỗ cắt chữ tiếng Việt**: `truncate` = `overflow: hidden` cắt cả chiều dọc nên dấu của chữ
  HOA / dòng thấp bị gọt; `overflow-x-clip overflow-y-visible text-ellipsis whitespace-nowrap` chỉ cắt ngang.
- **`min-w-0` đã nằm trong hằng**: `overflow: clip` KHÔNG làm flex item co được như `hidden` — thiếu `min-w-0` thì chữ đẩy tràn thay vì "…".
- Class phải LITERAL trong hằng (Tailwind quét như văn bản); dùng `cn(TEXT_ELLIPSIS_CLASSES, …)`, đừng ghép chuỗi.

## touch-hit.theme

- **Nới HỘP BẤM, không phóng hình** (`ipad-responsive.md §3.3`): `::after` trong suốt + `relative`; `icon` (-inset-2.5) cho nút / ô 16–24px
  đứng riêng, `inline` (4px ngang · 12px dọc) cho nút xếp hàng ngang sát nhau, `row` (chỉ dọc 8px) cho điều khiển rộng mà thấp.
- **Hai hộp bấm kề nhau không được chồng quá nửa khe** — chồng thì cú bấm rơi vào phần tử vẽ sau (lỗi im lặng): vì vậy có ba cỡ, chọn theo
  khe thật.
- **Không dùng trong vùng `overflow-hidden` / dải cuộn**: `::after` ra ngoài hộp sẽ bị cắt hoặc sinh thanh cuộn dọc (Tabs đệm `py-1 -my-1` để chứa).

## Badge — shape · tinted ở theme tối

- **`shape="tag"` (góc 2px) cho trạng thái trong ô bảng / cột "Trạng thái"**, `pill` (mặc định) cho nhãn chung, chip lọc:
  một bảng toàn thẻ chữ nhật đọc thẳng hàng, xen pill tròn hai đầu thì lổn nhổn.
- **`tinted` ở theme tối = nền ĐẶC ~22–28% + viền 55–60% + chữ bậc `-3`** (họ alias không có bậc 3 thì dùng họ gốc:
  `blue-3` · `green-3` · `orange-3` · `red-3` · `yellow-3`): nền 12% cũ trên navy đọc ra viền rỗng, thiếu "nét".
  Chữ `-3` trên nền tint đo ≥ 4.8:1.

## hud.theme.ts — công thức HUD dùng chung

- **Một nguồn cho mọi khối "công nghệ"** (đổ sáng, quầng, ngoặc góc, mặt đang bật, dấu `//`): UI kit, widget và feature ghép
  `HUD_*` (xuất qua `@/shared/ui`) thay vì chép chuỗi `color-mix` — đổi sắc một chỗ là cả app đổi theo.
- **CHỈ biến thể `dark:`**: theme sáng giữ sạch (`visual-hierarchy.md §0b`); sáng dùng nền / viền token của chính component.
- **`dark:` KHÔNG cộng độ ưu tiên** (`:where(.dark …)`): `dark:border-x` THUA `hover:` / `data-[…]:` / `checked:` của theme sáng —
  phải viết kèm trạng thái (`dark:data-[state=checked]:…`, `dark:hover:…`). Lỗi câm: viền tối không đổi, không báo gì.
- **Hằng là chuỗi class trạng thái NGHỈ**: không gắn được vào `focus-within:` / `data-[state=open]:`; component cần quầng theo trạng
  thái thì chép GIÁ TRỊ (vd `field.theme` dùng biến `--field-glow`) — đừng nội suy chuỗi (Tailwind chỉ quét chữ literal).
- **Ngoặc góc chiếm một pseudo** (`HUD_BRACKETS_BEFORE` / `_AFTER`): xem component đã dùng `before:` / `after:` chưa (vùng chạm
  `touch:after:`, vạch trái hàng menu `before:`); màu ngoặc = `currentColor` của pseudo (`dark:before:text-*`).
- **Mặt "đang bật" = xanh lá pha 28% ngọc** (`HUD_HOT`, `HUD_ACTIVE_FILL`): vẫn đọc ra màu thương hiệu nhưng tách khỏi `success`
  — cùng sắc với chip tab header, ô Dock, tab `folder`, ngày được chọn, trang hiện tại.

## hud.theme.ts — phân vai màu khung / tương tác

- **Khung · trang trí = họ `hud`** (alias `sky`: mặt rọi, ngoặc góc, ray, dấu `//`, viền nghỉ); **tương tác · đang bật = `primary`**
  (rê, focus, chọn, khối đặc, hàng trỏ). Bản đầu dùng xanh lá cho cả hai: cả màn một màu neon, không tách được đâu là thứ đang chọn.
- **Đối chiếu ảnh mẫu MES**: khung cyan, xanh lá chỉ ở chấm trạng thái / nút hành động / mục đang mở — phân bố sắc đo được trùng mẫu.
- **Đổi sắc khung toàn app = sửa `alias.hud`** trong `colors-theme.json`; widget / feature tự dựng khung thì dùng `hud-*`, không `sky-*`.
