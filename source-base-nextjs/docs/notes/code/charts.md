# Ghi chú code — charts (`src/shared/charts/`)

> Lý do thiết kế KHÔNG hiển nhiên của hạ tầng chart, tách khỏi code theo `comment-policy.md §3`.
> Quy ước chung (thang mật độ, bảng màu đã qua validator, nét nguyên, responsive, TV mode) ở `chart-conventions.md` — không lặp lại ở đây.

## chart-density.constants.ts

- **Không có sàn cỡ chữ riêng cho TV, không ngoại lệ độ dày lưới**: khung chart giữ nguyên ở TV nên sàn cỡ chữ làm
  nhãn trục đè nhau; lưới dày tranh chú ý với dữ liệu. `uiScale` nhân đều là đủ.

## chart-palette.constants.ts

- **`CHART_SERIES_TOKENS` là kết quả CHẤM BẰNG MÁY, không phải gu**: enumerate 8! thứ tự × bậc có sẵn của ramp, giữ thứ tự mà (a) mọi slot
  trong dải L của cả hai theme, (b) ΔE kề nhau mù màu ≥ 8 + mắt thường ≥ 15, (c) 3 slot đầu qua kiểm "mọi cặp", (d) cặp 8↔1 cũng qua (donut
  khép vòng), rồi mới chọn cái giữ xanh lá thương hiệu VCI `primary-6` ở slot 1 với hai hàng xóm là hue xa (tím hồng slot 2 ·
  tím slot 8); cam `orange-6` đẩy ra slot 7 vì xanh lá ↔ cam mù màu chỉ 7,1. Không còn `green-*` trong bảng (↔ `primary-6` ΔE 4,6).
  Cùng hex ở light và dark vì cả hai dải pass — khi một dự án đổi ramp mà không còn bộ chung thì thêm cặp `[light, dark]` `chart-*`
  thay vì ép chung. Lát "Khác" xám `chart-other` (≥ 3:1 cả hai nền; `neutral-6` cũ chỉ 1,90:1 ở dark).
- **Trạng thái / semantic KHÔNG bị dải L ràng buộc, chỉ bị ΔE + tương phản**: cam ↔ đỏ chỉ tách được (ΔE 18,4) khi đỏ ĐẬM hơn cam, nên `late = error-6` mà
  `slow = warning-5` giữ sáng; đảo lại (cam đậm `-6`/`-7`) thì cam thành nâu và vẫn FAIL kề đỏ. `done = success-6` khác hex mọi slot (gần nhất là
  xanh lá thương hiệu slot 1, ΔE 16,3) để trạng thái không mạo danh series. Hai bậc dưới 3:1 trên nền sáng bù bằng chữ / icon (quy tắc "relief").
- **Sequential 1 hue xanh lá: `primary-2…6` + `green-8`, 6 bậc**: dải `primary` đổi hue từ bậc 7 (ngọc ~190° → lam ~222°)
  nên đầu đậm mượn `green-8` (cùng hue ~154°, L 0.43) để giữ "một hue" (≤ 40°). Bậc thứ 7 hỏng: `primary-1` lệch độ sáng
  0.041 < 0.06 so với `primary-2` (ngưỡng tối thiểu để hai bậc kề phân biệt được). Dark là bản ĐẢO NEO chọn riêng: thấp =
  gần nền (2,23:1), cao = sáng (14,32:1).
- **Diverging blue ↔ red, giữa là xám của hệ** (sáng: sage `#E2E7E5` = `border-default`; tối: slate `#3D4A5F` — không xám thuần):
  cặp lạnh/nóng sống sót mù màu đỏ–lục; hai nhánh cân xứng độ sáng (ΔL ≤ 0.05), dark dùng `-5` ở hai cực (sáng nhất) và `-7` sát giữa.
  Giữ C của điểm giữa < 0.05 để không mang hue.
- **`KPI_HEALTH_THRESHOLDS` thay cho gán màu tay từng vòng**: gán tay làm một màu mang hai nghĩa trên cùng
  màn hình (`secondary-5` vừa là vòng 68% vừa là gauge tiến độ dự án) và thang không đơn điệu (68% cyan "mát" hơn 75% lục).
- **Màu là quyết định trình bày, không nằm trong hợp đồng dữ liệu**: để BE trả tên màu thì mỗi nguồn dữ liệu sẽ
  tự bịa một bảng màu khác nhau.
- **`KPI_HEALTH_THRESHOLDS` (90/60/30) — sức khoẻ CHỈ TIÊU**, không phải tiến độ MỘT việc: chỉ tiêu đạt 90% đã là tốt —
  đòi tròn 100 thì mọi cột đều đỏ. Tên `kpiHealthToken` cố ý khác hẳn mọi tên "progress…" để không bị gộp nhầm.

## chart-palette.constants.ts — `CHART_CHROME*`

- **`CHART_CHROME_TV` chỉ nâng tương phản (chữ `fg-subheading`, lưới `border-strong`), không nâng bão hoà series**: series đã ở dải L an toàn;
  panel 65" nhìn từ xa dễ bloom hơn — tăng bão hoà ở TV là đi ngược hướng.
- **Mọi khoá `CHART_CHROME*` phải có nơi đọc** (`tests/shared/charts/chart-chrome.test.ts`): khoá khai mà không ai
  đọc thì sửa màu đúng tên khoá mà hình không đổi. Track chốt MỘT giá trị `divider-default`, dùng chung cho TV.
- **`track` là chrome, cố ý dưới 3:1** (`chart-conventions.md §3.1.5`): vành nền phần CHƯA đạt; `ProgressDonutChart`
  đọc `CHART_CHROME.track` nên đổi một chỗ là mọi vòng tiến độ đổi theo.
- **Lưới nét LIỀN, trục (`axis`) đậm hơn lưới (`grid`) một bậc**: lưới đứt `3 3` là dáng mặc định của Recharts;
  đường gốc là mốc đọc, lưới chỉ là vạch phụ.

## chart-axis.utils.ts

- **`xAxisLayout` tính mật độ từ BỀ RỘNG thật, không từ số điểm**: `interval={4}` cứng hợp 30 ngày ở 1366px nhưng chồng nhãn ở 360px. Thứ tự ưu tiên: hiện hết →
  nghiêng -35° (nhãn ≥ 5 ký tự, vừa khi nghiêng) → thưa đều. `TICK_CHAR_EM = 0.6` cố ý ước rộng (chữ số `tabular-nums`) — sai về phía thưa còn hơn đè.
  Luôn chừa chỗ cho ≥ 2 nhãn; chưa đo (`plotWidth ≤ 0`) trả "hiện hết" để frame đầu không flash trục rỗng.

- **Chốt trần về mốc tròn thay vì để Recharts tự chọn**: không chỉ định `domain`/`ticks` thì trần trục nhảy
  theo từng bộ lọc (6 tháng → 3 tháng là cả lưới đổi bước), người xem mất mốc so sánh giữa hai lần nhìn.
- **`NICE_STEPS` dày hơn 1·2·5·10** (có 1,5 · 2,5 · 3 · 6): bộ thưa đẩy max 13,9 lên trần 25 — hơn nửa khung
  là khoảng trống, đường dữ liệu bị nén xuống đáy; bộ dày cho trần 16.
- **`AXIS_HEADROOM = 1.05`**: thiếu nó thì khi giá trị lớn nhất rơi đúng vào trần, nhãn số trên đỉnh bị cắt
  mất nửa ở mép khung.

- **`yAxisWidthFor` ước 0.7em/ký tự + 10px**: bảng `yAxisWidth` (36–58) chỉ vừa số ≤ 3 ký tự; `100%` đo được ≈ 35px ở 12px chữ (`%` rộng ≈ 1.1em, chữ số `tabular-nums` 0.6em)
  cộng lề tick 8px nên vượt 42px và tràn ~1,3px ở mép trái (bị cắt ở MỌI viewport, thấy rõ nhất ở 320px). Chốt ở nơi gọi (có biết `labelChars`) chứ không đo chữ lúc chạy.

## chart-arc-label.utils.ts

- **Chữ trắng phẳng (`neutral-0`), không tô theo màu lát**: nhãn đè lên chính cung nên cùng màu là tàng hình.
  Tương phản ở đây là với màu cung, không phải nền trang → không phụ thuộc theme (`§1.7` chỉ cấm trên nền panel).
- **Bóng mềm `drop-shadow` thay cho viền `stroke`**: lát sáng (`accent-5`, `green-5`) làm chữ trắng chìm; viền tối
  `paintOrder="stroke"` vẽ đường kẻ đen quanh từng chữ số và làm chữ nhoè. `drop-shadow` bám alpha glyph nên không sinh viền.
- **`uiScale` nhân cả sàn LẪN trần, không đổi công thức**: nhiều donut đã chạm trần 18 ở cỡ thường — giữ trần thì
  nhãn % là thứ duy nhất không to lên khi bật TV. `arcLabelFits()` vẫn bỏ nhãn khi vành mỏng nên chữ không tràn.
- **`max` / `ratio` cho donut cỡ lớn** (vành ≥ 50px chạm trần 18 từ sớm nên nhãn nhỏ hẳn so với vành): truyền
  `max` cao hơn; hạ `ratio` (vd 0.34) khi muốn nhiều lề trên/dưới hơn. `arcLabelFits()` vẫn là chốt chặn cuối.
- **`arcLabelPoint` đảo dấu góc**: Recharts đo `midAngle` ngược chiều trục y của SVG; quên đảo thì nhãn lật qua
  trục ngang và rơi sang lát khác.

## chart-center-label.utils.ts

- **Không ghim một token cho mọi cỡ donut**: lỗ là hình học px (không đổi ở TV), token là `rem × --ui-scale` —
  donut nhỏ thì chữ to hơn lỗ, donut to/TV thì chữ đứng yên giữa lỗ rộng. Trả TOKEN để vẫn tự phóng ở TV.
- **`valueChars` đo theo chuỗi LỚN NHẤT** (`PERCENT_LABEL_CHARS`), không theo `label.length`: nhãn % dài 2–4 ký
  tự nên cùng một hàng thẻ ra ba cỡ chữ (lỗ ~60px: `'100%'` 20px, `'0%'` 32px) và cụm chữ cao thêm đè lên vành.
- **`MONO_ADVANCE_EM = 0.6` cố ý ước rộng**: chữ số sans + `tabular-nums` hẹp hơn chút; đoán rộng chỉ làm chọn
  bậc nhỏ hơn — tốt hơn tràn khỏi lỗ.
- **`centerLabelMaxWidth` dùng dây cung × `WIDTH_SAFE` 0.82** (lỗ tròn nên bề rộng khả dụng hẹp dần khi rời
  tâm). `max-w-full` theo khung ngoài là sai: khung rộng gấp 2–3 lần lỗ nên `truncate` không bao giờ kích hoạt.
- **`TEXT_ADVANCE_EM = 0.70` đo theo chữ HOA** (~0.65–0.72em + `tracking-wide` 0.025em), không phải 0.58/0.64:
  sai số không đối xứng — ước thừa chỉ bỏ dòng phụ (đã có ở badge/chú giải), ước thiếu thì chữ đè lên vành.
- **Bảng bậc dừng ở `body-14`** (sàn còn đọc được trên nền tối); `centerCaptionFits` bỏ hẳn dòng phụ khi lỗ hẹp
  thay vì để `truncate` cắt còn `"11 đ…"`.

## chart-color.utils.ts · chart-format.utils.ts

- **Tách theo việc**: `chart-color` (tên token → màu CSS, hạ bậc, màu series, sức khoẻ chỉ tiêu) và `chart-format`
  (số trên chart) — không gom vào một file "tokens" nhiều việc.
- **`tokenAtStep` là hàm hạ bậc DUY NHẤT** — gradient (`chart-gradient.utils.ts`) cũng đi qua nó; đừng thêm hàm hạ
  bậc thứ hai — mỗi bản một regex là lệch nhau.
- **`labelInt` / `fmt3` viết trên `formatNumber`** (vi-VN, `Intl` dựng một lần) thay vì `toLocaleString` mỗi lần gọi —
  nhãn cột chạy trên từng cột của từng chart.

## chart-gradient.utils.ts

- **Bậc gradient TƯƠNG ĐỐI theo bậc của token (`depth` 1 · 2), không phải `-6/-7/-5` tuyệt đối**: series nay nằm ở `-5…-7`; gradient tuyệt đối sẽ kéo mép ra `-5` neon (L > 0.72) — màu chưa qua validator.
  Mép LUÔN là token; lõi tối hơn qua `tokenDarker`, kẹp ở bậc cuối còn tồn tại (`indigo-7` hạ 2 bậc → `indigo-8`, không có `-9`) — bậc không tồn tại làm `var()` rỗng, mảng tô trong suốt. Token `-5` cũ cho đúng kết quả cũ.
  Thang CHỈ SỐ (`chart-seq-*`, `chart-div-*`) có hậu tố số nhưng KHÔNG phải bậc sáng–tối nên nằm trong `CHROME_FAMILIES` (tô phẳng).
- **`arcGradientStops` KHÔNG dùng cho vành donut nhiều lát**: `objectBoundingBox` mặc định lấy bbox của TỪNG `<path>` →
  mỗi lát một tâm lệch, bắt đoạn khác nhau của dải gradient → vành loang lổ. Dùng `arcGradientVectors` (`userSpaceOnUse`).
- **`CHROME_FAMILIES` không hạ bậc**: thang `bg`/`fg` bậc CAO hơn lại SÁNG hơn nên hạ bậc cho lõi sáng hơn mép — ngược
  ý đồ chống bloom. Track ring / lát "trống" tô PHẲNG.
- **Cung rộng (> 120°) dùng trục vuông góc phân giác** (`wide`): gradient SVG TUYẾN TÍNH nên phần cung phình ra ngoài
  đoạn nối 2 mép bị kẹp về stop cuối. Cung rộng CHỈ đổi độ đậm (`arcSpectrumStops`, `stopOpacity`), không pha màu.
- **`columnGradientStops` 3 stop** (`-7→-6→-5`): cột cao 100–400px, 2 stop kéo thành gần một màu phẳng; stop giữa
  55% vì nửa dưới bị nhãn trục/lưới cắt nhiều nhất.
- **Hex tự do trộn `neutral-10`** (0.82 ≈ 1 bậc, 0.68 ≈ 2 bậc — `HEX_INNER_MIX`, `HEX_MIX_BY_STEP`, qua `colorMix`)
  để hex legacy và token cùng "độ khối". `barGradient` đi DỌC; pha TRẮNG "cho sáng" đẩy lightness > 0.85 và gây bloom.

## chart-color-distance.utils.ts

- **Chép công thức của `validate_palette.js` (không import)**: validator là script của skill ngoài repo; test cần số khớp từng chữ số nên phải cùng công thức —
  `chart-palette-validator.test.ts` ghim `8.4 / 25.3 / 9.8 / 25.3`… lấy từ lần chạy validator, lệch thì một trong hai bên sai.
- **Chỉ nhận `#rrggbb`, ném lỗi với giá trị khác**: hex đã sinh từ `colors-theme.json`; `rgba()` của token overlay không có nghĩa trong phép đo này, im lặng trả NaN sẽ làm test pass giả.

## ProgressDonutChart

- **Ở `shared/charts`, không ở `widgets/`**: SVG trình bày thuần, không state ứng dụng, không store — cùng họ với hạ
  tầng chart (gradient, track, nhãn %).
- **Gradient, track, nhãn % lấy từ hạ tầng chung** (`arcGradientStops`, `CHART_CHROME.track`, `formatPercent`), không
  nhận prop màu đậm riêng: `arcGradientStops` tự hạ bậc và tô PHẲNG token chrome.
- **SVG thuần, không recharts** (ngoại lệ có chủ đích của `chart-conventions.md §0`): recharts 3 làm vòng biến mất
  khi ~20 card đổi cỡ cùng lúc. Gradient `userSpaceOnUse` + `r=50` (`objectBoundingBox` đổi theo bán kính vành → lệch màu).
- **Không đặt `size-full` trong component**: `tailwind-merge` không coi `w-*`/`h-*` của nơi gọi xung đột với `size-*`
  nên cả hai sống, chốt cứng 2 chiều và `aspect-square` mất tác dụng.
- **Đĩa nền ở tâm (`r=27`) lọt hẳn trong lòng vành** (mép trong ở 37/100) — lớn hơn thì đĩa đè lên cung. Màu "xong" /
  "đang làm" lấy từ `CHART_STATUS.done` / `.slow`; không neon (`drop-shadow` quanh cung làm nhoè cạnh).
- **Số ở tâm luôn `fg-heading`, không theo màu vòng**: chữ tô màu series dưới 4,5:1 ở nền sáng (chart-conventions §1.7); danh tính màu đã ở cung.
- **Cung vẽ bằng `stroke-dasharray`** (`rotate(-90)` để bắt đầu từ đỉnh). Vòng kín dùng `butt` vì đầu bo tự đè lên
  nó; `donePct` kẹp `[0, pct]` kẻo cung vẽ ngược.

## chart-style.utils.ts

- **`CHART_INTERACTION_PROPS = { throttledEvents: [] }`**: Recharts 3 xếp `mousemove` / `touchmove` vào `requestAnimationFrame` và huỷ khung đang chờ khi sự kiện kế
  tới; trên màn cảm ứng một lần chạm sinh chuỗi sự kiện sát nhau nên tooltip / `onClick` của lần chạm ĐẦU bị nuốt. Tắt throttle rẻ hơn nhiều so với một lần
  chạm trượt (chart ít điểm, không tính nặng ở mousemove).
- **`CHART_CONTAINER_PROPS.minHeight = 32`** thấp có chủ đích: sàn cao (120) làm sparkline cao 40px tràn khỏi thẻ. Sàn chỉ để khung không về 0 khi cha chưa có chiều cao;
  chart có trục vẫn phải được cha cấp chiều cao thật.
- **`legendLabel` (= `labelStyle` của `<Legend>`)**: `DefaultLegendContent` của Recharts 3 gán `color: labelStyle.color || entry.color` lên span chữ — nên chỉ cần khai `color` ở đây là chữ chú giải bỏ màu series;
  nó cũng tự đặt `whiteSpace: normal` + `overflowWrap: break-word` nên tên series dài xuống dòng ở 360px thay vì tràn.
- **Tooltip `maxWidth: min(18rem, 100vw − 2rem)`**: tên series dài làm tooltip rộng hơn khung ở 360px; Recharts chỉ nhốt vị trí, không nhốt bề rộng.

- **Nhân CẢ bậc `scale` một lần rồi mới dựng style**: `m.scale.*` mà component đọc thẳng (`yAxisWidth`, `lineWidth`,
  `dotRadius`…) cũng đã phóng; chỉ nhân trong style object thì chữ to mà trục vẫn hẹp.
- **Cỡ chữ làm tròn NGUYÊN** (`fontSize` là thuộc tính SVG): giá trị lẻ không giúp gì, chỉ làm nét chữ mờ vì trình duyệt nội suy.
- **Tooltip KHÔNG có `backdropFilter`**: Recharts bám con trỏ bằng `transform` nên toạ độ luôn lẻ; backdrop-filter ép
  composited layer → chữ bị nội suy đúng chỗ người dùng đọc số. Nền `bg-popup` đã gần đục nên blur vô ích.
- **TV nâng độ đậm**: nhãn trục 500 → 600, nhãn số trên cột 600 → 700 — nét mảnh nhìn từ xa chìm vào nền panel có gradient.
- **Mặt tooltip là hằng `CHART_TOOLTIP_SURFACE`** = bề mặt `<Tooltip variant="data">` (bóng `--color-shadow-popup`
  theo theme); tooltip tự vẽ trải cùng hằng. Nền ghi `backgroundColor`, KHÔNG shorthand — Recharts trộn sẵn `'#fff'`.
- **Ghi đè mặc định Recharts**: `tooltipLabel` có vạch ngăn nên pie / donut (không tiêu đề) KHÔNG truyền `labelStyle`
  (ra vạch rỗng); `legendLabel` · `dot` · `activeDot` bỏ chữ chú giải màu series (§1.7) và chấm / vành `#fff`.

## useChartMetrics · ChartScaleProvider

- **Hệ số TV đến qua context, hook không đọc store**: `shared/` không được import `domains/`, nên `AppProviders` (`src/app/_providers`) đọc
  `selectEffectiveUiScale` rồi cấp qua `ChartScaleProvider`; truyền bằng tham số thì chart nào quên là IM LẶNG bỏ TV.
- **Tham số `uiScaleOverride` chỉ để test / showcase** ghi đè provider; code màn hình gọi không tham số.
