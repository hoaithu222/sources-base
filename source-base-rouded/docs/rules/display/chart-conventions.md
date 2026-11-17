# Chart & Dashboard Conventions

> Áp dụng cho **mọi chart Recharts** + **mọi dashboard / command-center / màn hình lớn**
> trong `src/features/**`. Mục tiêu: chart đồng bộ visual với hệ thống token,
> dashboard layout fit viewport (hạn chế scroll), padding gọn, sửa 1 chỗ → đổi
> toàn bộ. Vi phạm các quy tắc đánh dấu **⛔** → **block merge**.

---

## 0. Stack & quy tắc tối cao

| Layer                        | BẮT BUỘC                                                                          | KHÔNG                                                |
| ---------------------------- | --------------------------------------------------------------------------------- | ---------------------------------------------------- |
| Chart library                | **Recharts**                                                                      | KHÔNG dùng chart.js, nivo, victory, apexcharts       |
| Color                        | Token qua `tokenVar()` → `var(--color-*)`                                         | KHÔNG hex / oklch / rgb hardcode                     |
| Font (axis, legend, tooltip) | font-size px **chỉ trong recharts props**, lấy từ thang mật độ §1.5 — phần khác dùng `text-{scale}` | KHÔNG `text-sm`/`text-xs` raw cho UI bên ngoài chart; KHÔNG hardcode `fontSize` |
| Section wrapper              | UI kit `<SectionHeader>` hoặc local section component                               | KHÔNG raw `<div>` + tự build header                  |
| KPI card                     | `<CompactKpiCard>` (UI kit)                                                         | KHÔNG raw `<div>` card / KHÔNG fork Hud-card style   |
| Icon trong chart UI          | `<SystemIcon name="...-bold" />`                                                  | KHÔNG inline `<svg>` / import icon component trực tiếp                 |

---

## 1. ⛔ Token contract — KHÔNG NEGOTIABLE

### 1.1. Hạ tầng chart — `@/shared/charts` là nguồn DUY NHẤT

⛔ Feature **KHÔNG** tự khai palette / thang mật độ / helper token. Mọi thứ import
từ `@/shared/charts`. Fork ra feature = drift ngay lần sửa bug đầu tiên.

| File (trong `src/shared/charts/`) | Chứa | Vì sao tách |
|------|------|-------------|
| `constants/chart-palette.constants.ts` | `CHART_SERIES_TOKENS`, `CHART_OTHER_TOKEN`, `CHART_SEQUENTIAL_TOKENS`, `CHART_DIVERGING_TOKENS`, `CHART_SEMANTIC`, `CHART_STATUS`, `KPI_HEALTH_THRESHOLDS`, `CHART_CHROME` / `CHART_CHROME_TV`, `CHART_DASH` | Nguồn màu DUY NHẤT (§1.2) — mọi bậc đã qua validator (§1.2.1) |
| `constants/chart-density.constants.ts` | `ChartDensity`, `CHART_DENSITY_SCALE`, `CHART_DENSITY_BREAKPOINTS` (chiều cao), `CHART_WIDTH_BREAKPOINTS`, `CHART_MIN_SIZE` | Bảng cỡ chữ/nét theo bậc (§1.5) · dải bề rộng + sàn khung (§2.6) |
| `utils/chart-color.utils.ts` | `tokenVar`, `tokenVarAlpha`, `tokenVarOver`, `tokenAtStep`, `tokenDarker`, `seriesTokenAt`, `sequentialTokenAt` / `sequentialScale` / `sequentialTokenForRatio`, `divergingTokenAt` / `divergingTokenFor`, `kpiHealthToken` | Tên token → màu CSS (alpha qua `colorMix` của `utils/style/color-mix.utils.ts`); chọn token theo vai trò |
| `utils/chart-color-distance.utils.ts` | `deltaE(a, b, vision)`, `contrastRatio`, `oklchOf`, `worstDeltaE`, `worstCvdDeltaE` | Đo bảng màu bằng máy — cùng công thức `validate_palette.js` (§1.2.1); demo + test dùng |
| `utils/chart-format.utils.ts` | `labelInt`, `fmt3` | Số trên chart (§3.2.5), viết trên `formatNumber` |
| `utils/chart-style.utils.ts` | `chartDensityFor(height)`, `buildChartStyles(density, uiScale, narrow)` → `m.grid` · `m.axisLine` · `m.legendLabel` · `m.lineCursor` / `m.barCursor` · `m.dot` / `m.activeDot` …, `isNarrowChart`, `CHART_TOOLTIP_SURFACE`, `CHART_CONTAINER_PROPS`, `CHART_INTERACTION_PROPS`, `barSizeByCount` | Sinh style object theo bậc; props khung + cảm ứng dùng chung |
| `utils/chart-gradient.utils.ts` | `arcGradientStops`, `columnGradientStops`, `barGradient`, `arcGradientVectors`, `arcSpectrumStops`, `arcGradientId` | Gradient mảng lớn: lõi tối hơn 1 bậc → mép = token (§1.3) |
| `utils/chart-axis.utils.ts` · `chart-center-label.utils.ts` · `chart-arc-label.utils.ts` | Trục (`niceAxisMax`, `axisTicks`, `xAxisLayout`), nhãn tâm donut, nhãn cung | Tính toán hình học dùng lại |
| `useChartMetrics.ts` · `ChartScaleProvider.tsx` | Đo vùng vẽ → chọn bậc → trả style + `narrow` / `plotWidth` / `container` / `chartProps`; hệ số TV lấy từ provider | Mắt xích làm "phóng to = đọc rõ hơn" và "hẹp = nhãn thưa" |
| `ProgressDonutChart.tsx` | Vòng % tiến độ SVG thuần (không Recharts) | Dùng chung, không phải widget |

Cái feature ĐƯỢC phép tự khai: `constants/*.constants.ts` (bảng ánh xạ series của
riêng nó → token, §1.2; dữ liệu mẫu, §4) và `types/`.

Helper màu dùng qua barrel, không chép lại: `tokenVar(CHART_SEMANTIC.plan)` → `var(--color-info-5)` ·
`tokenVarAlpha('info-5', 0.08)` (alpha thang 0–1) · `tokenAtStep('info-5', 6)` → `'info-6'` (hàm hạ
bậc DUY NHẤT, dùng dựng gradient §1.3).

**Quy tắc:**

- KHÔNG fork tooltip / legend / axis style giữa các chart
- Đổi visual tooltip / legend → **chỉ sửa `buildChartStyles`** → tất cả chart đồng bộ; chữ chú giải đi qua `labelStyle={m.legendLabel}` (chữ giữ màu `fg-*`, không tô màu series — §1.7)
- KHÔNG khai `fontSize` bằng số trực tiếp trong file chart (xem §1.5)

### 1.5. ⛔ Thang cỡ chữ & nét theo MẬT ĐỘ — KHÔNG hardcode `fontSize`

**Vấn đề của cách cũ (hằng số `fontSize: 10`):** cỡ chữ không phụ thuộc kích
thước vùng vẽ, nên bấm **xem toàn màn hình chỉ giãn khoảng trắng — chữ và nét y
nguyên**, phóng to không hề giúp đọc rõ. Trên màn TV/4K phòng điều hành, 10px
gần như không đọc nổi từ xa. Đây là lỗi hệ thống, không phải lỗi từng chart.

Chart **PHẢI** đo chính mình rồi lấy bậc tương ứng. Hệ số TV (`uiScale` hiệu lực)
`useChartMetrics()` tự đọc từ `ChartScaleProvider` — gắn MỘT lần ở `AppProvider` từ
`useDisplayStore(selectEffectiveUiScale)`; file chart KHÔNG đọc store, KHÔNG truyền tham
số (tham số chỉ để ghi đè trong test). Xem `tv-display-mode.md §4`:

```tsx
const [chartRef, m] = useChartMetrics<HTMLDivElement>();

<div ref={chartRef} className="h-full w-full">
  <ResponsiveContainer width="100%" height="100%">
    <LineChart …>
      <CartesianGrid {...m.grid} vertical={false} />
      <XAxis tick={m.axisTick} axisLine={m.axisLine} tickLine={false} />
      <YAxis tick={m.axisTick} width={m.scale.yAxisWidth} axisLine={false} tickLine={false} />
      <Tooltip contentStyle={m.tooltip} itemStyle={m.tooltipItem} labelStyle={m.tooltipLabel} cursor={m.lineCursor} />
      <Legend iconSize={m.scale.legend} labelStyle={m.legendLabel} wrapperStyle={m.legend} />
      <Line strokeWidth={m.scale.lineWidth} dot={m.dot} activeDot={m.activeDot} />
    </LineChart>
  </ResponsiveContainer>
</div>
```

Bậc chọn theo **chiều cao thực của vùng vẽ** (đã trừ header + padding panel):

| Bậc | Chiều cao | axis | legend | tooltip | nhãn cột | nét line | YAxis width |
|-----|-----------|------|--------|---------|----------|----------|-------------|
| `compact` | < 200px | 11 | 11 | 12 / 11 | 11 | 2 | 36 |
| `base` | 200–359px | 12 | 12 | 13 / 12 | 13 | 2 | 42 |
| `large` | 360–519px | 14 | 13 | 14 / 13 | 15 | 3 | 50 |
| `xlarge` | ≥ 520px | 16 | 15 | 16 / 15 | 18 | 4 | 58 |

**Quy tắc cứng:**

- **Sàn 11px.** Dưới mức đó chữ mất nét trên nền tối có gradient. `fontSize={9}`
  hay `fontSize={10}` trong file chart → **block merge**.
- **Nét thẳng (line, grid, leader) phải SỐ NGUYÊN.** Nét lẻ (2.5, 3.5) bị trình duyệt 
  khử răng cưa thành vệt xám 2px — hình chart trông "chưa nét". `dotRadius` được phép lẻ 
  (bán kính hình tròn). Giữ cứng: `lineWidth` ∈ `[2, 2, 3, 4]`, `gridWidth` luôn `1` ở MỌI bậc, kể cả TV (lưới là chrome, phải lùi sau dữ liệu).
- KHÔNG viết `fontSize` bằng số trong file chart — luôn qua `m.scale.*`.
- Chart nào cũng phải có `ref` đo được; quên `ref` thì chart kẹt ở bậc mặc định.
- ⛔ **Nhãn số trên chart KHÔNG ép font mono.** Dùng `tabular-nums` (căn cột số)
  + weight 600, font để KẾ THỪA font sans của app. Xem §1.8.

### 1.6. ⛔ Lưới và trục phải NHÌN THẤY ĐƯỢC

```tsx
// ❌ SAI — alpha 8%, gần như vô hình ở cả 2 theme
<CartesianGrid stroke={tokenVar('divider-soft')} />

// ✅ ĐÚNG — border-default (#E2E7E5 sáng / #35495D tối)
<CartesianGrid {...m.grid} />   // nét LIỀN 1px, stroke = CHART_CHROME.grid = 'border-default'
<XAxis axisLine={m.axisLine} /> // trục đậm hơn lưới một bậc: CHART_CHROME.axis = 'border-strong'
```

Lưới là mốc để người đọc ước lượng giá trị. Lưới không nhìn thấy = chart chỉ còn
là hình trang trí. `divider-soft` (alpha 8%) chỉ dùng cho separator trang
trí, **KHÔNG** cho lưới/trục/track.

### 1.7. ⛔ KHÔNG tô CHỮ bằng màu series

```tsx
// ❌ SAI — success-6 #00B85E làm màu chữ trên nền sáng: contrast 2,6:1 (series cũng vậy: yellow-7 chỉ 3,35:1)
<text fill={tokenVar(CHART_STATUS.done)} fontSize={12}>{pct}%</text>

// ✅ ĐÚNG — chữ dùng foreground; danh tính màu series nằm ở chấm/cung/nét
<text fill={tokenVar('fg-heading')} fontSize={m.scale.pieLabel}>{pct}%</text>
<circle fill={tokenVar(CHART_STATUS.done)} r={3} />
```

Token series sinh ra để tô MẢNG và NÉT, không phải để làm màu chữ (không slot nào đạt 4,5:1 — ngưỡng chữ thường — ở CẢ hai
theme). Áp cho **mọi** chữ trong chart: nhãn trục, nhãn cột, nhãn trực tiếp cuối đường, chú giải (Recharts mặc định tô chữ legend theo màu series —
dùng `labelStyle={m.legendLabel}`), số ở tâm donut. Danh tính màu nằm ở ô màu / nét đường đứng cạnh chữ. Ngoại lệ duy nhất: chữ ĐẶT TRONG
một mảng màu (ô heatmap, lát donut) chọn trắng hoặc mực theo độ sáng mảng.

### 1.8. ⛔ SỐ KHÔNG DÙNG FONT MONO — `.num-mono` ĐÃ BỊ XOÁ

Recipe `.num-mono` / `.num-mono-light` (JetBrains Mono, weight 600, slashed-zero)
từng được áp cho **mọi** con số của app — KPI, ô bảng, nhãn chart, mốc thời gian.
Đã **gỡ khỏi toàn bộ codebase** và **xoá định nghĩa** trong `globals.css`.

**Vì sao bỏ:**

| Vấn đề | Hệ quả thấy được |
| ------ | ---------------- |
| Số mono nằm cạnh nhãn sans trong CÙNG một dòng | Đọc ra như hai hệ chữ ghép vào nhau — nhãn "Còn lại:" font sans, số "4,45 tỷ" font mono |
| JetBrains Mono ở cỡ 10–12px | Nét MỎNG hơn font sans cùng cỡ trên nền tối → chữ số nhoè, đúng thứ nó định chống |
| `.num-mono` khoá cứng `font-weight: 600` trong một CSS rule | Nuốt sạch `weight` của component; SVG presentation attribute (`fontWeight={700}`) xếp DƯỚI CSS rule nên bị bỏ qua — đã gây bug mất tín hiệu "lát active" ở donut Máy thiết bị |
| Digit mono rộng ~0.6em | Cùng một con số chiếm nhiều bề ngang hơn — tốn chỗ ở đúng chỗ khan hiếm nhất (ô bảng, nhãn chart) |

**Thay bằng gì:** `tabular-nums`. Đó mới là thứ giải quyết vấn đề thật (cột số
thẳng hàng) và nó **không đụng tới font-family lẫn font-weight**.

```tsx
// ❌ SAI — class đã xoá, viết lại là dựng lại đúng recipe vừa gỡ
<span className="num-mono tabular-nums text-fg-heading">{value}</span>
<span className="num-mono-light">{value}</span>

// ❌ SAI — ép mono cho SỐ bằng đường vòng
<text fontFamily="var(--font-mono)" fontSize={12}>{value}</text>
<span className="font-mono tabular-nums">{value}</span>
<LabelList style={{ fontFamily: 'var(--font-mono)' }} />

// ✅ ĐÚNG — số dùng font sans của app, chỉ căn cột bằng tabular-nums
<span className="tabular-nums text-fg-heading">{value}</span>
<LabelList {...m.barLabel} />   // m.barLabel KHÔNG còn fontFamily
```

**`font-mono` còn được dùng ở đâu?** CHỈ cho chuỗi KHÔNG PHẢI số liệu, nơi mono
mang nghĩa thật: địa chỉ IP, độ phân giải, mã/ID, đoạn cấu hình, phím tắt `<kbd>`.
Dấu hiệu nhận biết: **hễ đi kèm `tabular-nums` thì đó là SỐ → bỏ `font-mono`.**

### 1.2. ⛔ Màu series — CHỈ lấy từ `@/shared/charts`, KHÔNG tự chọn bậc

Feature **KHÔNG** viết token series bằng tay (`'info-5'`, `'sky-4'`, `'teal-5'`…). Lấy qua `seriesTokenAt(i)` ·
`CHART_SERIES_TOKENS` · `CHART_OTHER_TOKEN` · `CHART_SEMANTIC` · `CHART_STATUS` · `CHART_SEQUENTIAL_TOKENS` ·
`CHART_DIVERGING_TOKENS`. Mỗi bậc trong các bảng đó đã được **validator chấm ở cả hai theme** (§1.2.1). Quy tắc
"chỉ bậc `-5`" cũ đã BỎ vì bằng chứng validator: `-5` có L 0.72–0.83 — ngoài dải sáng của CẢ hai theme (7/8 slot dark, 3/8 slot light) và
tương phản nền sáng thấp tới 1,67:1; bậc đủ dải là `-5…-7` tuỳ họ nên chọn một lần ở `@/shared/charts`, không rải ra feature.

`CHART_COLORS` trong ví dụ dưới là tên MINH HOẠ cho bảng ánh xạ **thực thể → token** của feature (khai trong
`constants/*.constants.ts`). Mẫu thật: `DASHBOARD_STATUS_TOKENS` (`features/demo/dashboard/constants/metrics.constants.ts`) ·
`DEMO_TREND_SERIES` (`features/demo/library/constants/widgets/chart-gallery.constants.ts`).

> ⛔ Hex trong các bảng dưới được đối chiếu với `src/shared/theme/colors.generated.ts` ngày 2026-10-17. Source of truth là
> `colors-theme.json` (+ `npm run generate:colors`), KHÔNG phải bảng này. **KHÔNG BAO GIỜ chép hex vào code.**
> Bẫy tên: `primary` là **dải logo VCI** (xanh lá → ngọc → lam; `primary-6` là xanh lá thương hiệu — KHÁC `green` = `success`),
> hệ **không có họ `cyan`** — cyan do `secondary` / `teal` / `sky` đảm nhiệm; `blue`=`info` · `red`=`error` · `green`=`success` ·
> `yellow`=`accent` (vàng kim) · `orange`=`warning` là alias trùng hex 100%.

**Series — 8 slot, thứ tự CỐ ĐỊNH** (cùng hex ở light và dark: cả hai dải L đều pass nên không cần cặp theme):

| Slot | Token | Hex | Họ |
| ---- | ----- | --- | -- |
| 1 | `primary-6` | `#19825A` | xanh lá VCI (tông thương hiệu) |
| 2 | `fuchsia-6` | `#D946EF` | tím hồng |
| 3 | `orange-7` | `#A35000` | nâu (cam đậm) |
| 4 | `blue-6` | `#0D74CC` | xanh dương |
| 5 | `yellow-7` | `#B18535` | vàng kim |
| 6 | `indigo-6` | `#5B67D9` | chàm |
| 7 | `orange-6` | `#D66900` | cam |
| 8 | `purple-5` | `#A855F7` | tím |
| Khác | `chart-other` | `#7A8AA0` | xám trung tính (`shared`) |

Xanh lá thương hiệu KHÔNG đứng cạnh cam: mù màu đỏ – lục thấy `primary-6` ↔ `orange-6` gần như một màu (ΔE mù màu 7,1 < 8)
— cam ở slot 7, cách slot 1 qua cả hai chiều vòng donut.

**Nghĩa cố định** (không dùng cho "series 4"; luôn kèm chữ / icon — §1.2.1):

| Vai trò | Token | Hex |
| ------- | ----- | --- |
| `CHART_SEMANTIC.plan` · `.actual` · `.forecast` | `info-5` · `success-6` · `warning-5` | `#1A94FF` · `#00B85E` · `#FC820A` |
| `CHART_STATUS.done` · `.running` · `.slow` · `.late` | `success-6` · `info-5` · `warning-5` · `error-6` | `#00B85E` · `#1A94FF` · `#FC820A` · `#DC2A38` |

**Thang giá trị** — theme pair trong `colors-theme.json` (token `chart-seq-N` / `chart-div-N`, đổi theo theme, class `bg-chart-seq-3` dùng được):

| Thang | Bậc | Light | Dark (chọn riêng, KHÔNG tự lật) |
| ----- | --- | ----- | ------------------------------- |
| Sequential (1 hue xanh lá: `primary` 2 → 6 + `green-8`, thấp → cao) | 1 … 6 | `#D5EFDF #A9DEC0 #6DC596 #2FA562 #19825A #005F32` (nhạt → đậm) | `#005F32 #19825A #2FA562 #6DC596 #A9DEC0 #D5EFDF` (đảo neo: thấp = gần nền, cao = sáng) |
| Diverging (lạnh `blue` ↔ nóng `red`, giữa xám) | 1 … 7 | `#0D74CC #3DA0FF #B5D6FF` · `#E2E7E5` · `#FCC7CB #F26A73 #DC2A38` | `#1A94FF #0D74CC #095599` · `#3D4A5F` · `#B21B28 #DC2A38 #FF424E` |

```ts
import {
  CHART_STATUS, CHART_SEMANTIC, seriesTokenAt, tokenVar,
  sequentialTokenForRatio, divergingTokenFor,
} from '@/shared/charts';

// Thực thể → token: khai MỘT lần theo THỰC THỂ (không theo thứ hạng) — lọc bớt series không tô lại series còn lại.
export const CHART_COLORS = {
  structure: seriesTokenAt(0),     // primary-6
  mep: seriesTokenAt(1),           // fuchsia-6
  planned: CHART_SEMANTIC.plan,    // info-5 (nét đứt)
  actual: CHART_SEMANTIC.actual,   // success-6 (nét liền)
  riskHigh: CHART_STATUS.late,     // error-6
} as const;

<Bar fill={tokenVar(CHART_COLORS.structure)} />
<Cell fill={tokenVar(sequentialTokenForRatio(value / max))} />          // heatmap
<Cell fill={tokenVar(divergingTokenFor(actual - plan, 10))} />          // lệch kế hoạch, ±10 = màu cực
```

**KHÔNG được phép:**

```tsx
// ❌ SAI — magic string ngoài constants / tự chọn bậc
<Bar fill={tokenVar('primary-5')} />
export const CHART_COLORS = { planned: 'sky-4', actual: 'blue-4' };   // ⛔ bậc chưa qua validator

// ❌ SAI — hex / oklch / rgb hardcode
<Bar fill="#60A5FA" />   <Line stroke="oklch(0.78 0.11 75)" />

// ❌ SAI — quay vòng quá 8 (series 9 trùng series 1)
const token = CHART_SERIES_TOKENS[i % 8];            // ✅ seriesTokenAt(i) → 'chart-other'

// ✅ ĐÚNG
<Bar fill={tokenVar(CHART_COLORS.structure)} />
```

> **Ngoại lệ duy nhất** được dùng token ngoài các bảng trên: `border-default`, `fg-*`, `bg-*` cho axis, grid, tooltip
> surface (§1.1) — **chrome** của chart, không phải series data.

#### 1.2.1. Bảng màu chart đã được validator chấm

Công cụ: skill **dataviz** — `scripts/validate_palette.js` (OKLab ΔE ×100, mô phỏng mù màu Machado 2009 mức 1.0). Bề mặt chart
THẬT của base: sáng `#FFFFFF` (`bg-surface`), tối `#141D27`. Sáu kiểm: (1) thứ tự hue cố định · (2) dải L sáng 0.43–0.77 / tối
0.48–0.67 · (3) chroma ≥ 0.10 · (4) ΔE mù màu giữa cặp **kề nhau** ≥ 8 (sàn 6 chỉ hợp lệ khi có kênh phụ) + sàn mắt thường ≥ 15 ·
(5) tương phản nền ≥ 3:1 (dưới mức đó BẮT BUỘC nhãn trực tiếp / bảng số) · (6) chỉ hex có trong `colors-theme.json`.

```bash
V="<skill dataviz>/scripts/validate_palette.js"
node $V "#19825A,#D946EF,#A35000,#0D74CC,#B18535,#5B67D9,#D66900,#A855F7" --mode light --surface "#FFFFFF"
node $V "…cùng 8 hex…"                                    --mode dark  --surface "#021A36"
node $V "#19825A,#D946EF,#A35000" --mode light --pairs all   # scatter / bản đồ / small multiples
```

| Bảng | Trước (bậc `-5` neon) | Sau (bảng VCI hiện tại) |
| ---- | --------------------- | --- |
| 8 slot — dải L | **FAIL**: light 3/8 slot ngoài dải · dark 7/8 | PASS cả hai (L 0.53–0.67) |
| 8 slot — ΔE kề (mù màu / thường) | 13,4 / 24,0 | **21,1 / 28,4** (mù màu: xanh lá ↔ tím hồng 1↔2 · thường: xanh dương ↔ vàng kim 4↔5; vòng donut 8↔1: 23,1 / 33,9) |
| 8 slot — mọi cặp, 3 slot đầu | **FAIL** mắt thường 14,4 (cyan ↔ chàm) | **8,4 / 19,9** — cặp yếu nhất ở cả hai kiểm là xanh lá ↔ nâu (1↔3) |
| 8 slot — tương phản nền | light **WARN 7/8 slot**, thấp nhất 1,67:1 · dark PASS | light thấp nhất **3,35** (`yellow-7`) · dark ≥ 3,08 (`orange-7`) — cả 8 slot ≥ 3:1, không cần relief |
| "Khác" | `neutral-6`: dark **1,90:1** (gần tàng hình) | `chart-other`: **3,52 / 4,96** |
| Trạng thái (xong→đang làm→chậm→trễ) | **FAIL** normal 13,5 (cam ↔ đỏ) · dải L FAIL | PASS 15,7 / 18,4; mọi cặp mù màu 7,7 (sàn — luôn kèm chữ) |
| KH / TT / Dự báo | dải L FAIL; light 1,67:1 | mắt thường ≥ 27,6; mù màu 7,7 (nét đứt/liền là kênh phụ) |

Điểm cần biết khi đọc bảng:
- **Trạng thái / semantic không bị dải L ràng buộc** (skill: trạng thái là thang cố định, không phải categorical; chính thang mẫu
  của skill có bậc ngoài dải): `success-6` (L 0.685) và `warning-5` (0.731) ngoài dải tối là có chủ đích — cam ↔ đỏ chỉ tách
  được nếu đỏ ĐẬM hơn cam (`error-6`), nên cam giữ `-5`. Hai bậc này dưới 3:1 trên nền sáng (2,62 · 2,52) ⇒ **luôn đi kèm chữ / icon**.
- **Slot 1 = xanh lá thương hiệu `primary-6`** (bản tối cũ: cyan `secondary-6`). Hàng xóm của nó ở CẢ hai chiều vòng là hue xa
  (tím hồng slot 2, tím slot 8). **Cam `orange-6` đẩy xuống slot 7**: xanh lá ↔ cam mù màu chỉ 7,1 — đặt kề nhau là FAIL. Nâu
  `orange-7` (slot 3) đậm hơn nên xanh lá ↔ nâu còn 8,4 — đạt sàn, nhưng là cặp yếu nhất của 3 slot đầu.
- **Không còn WARN tương phản**: thấp nhất là `yellow-7` (vàng kim) 3,35:1 trên nền sáng và `orange-7` 3,08:1 trên nền tối — cả
  8 slot ≥ 3:1 trên cả hai nền nên series không cần "relief rule" (quy tắc đó giờ chỉ còn cho trạng thái `success-6` / `warning-5`).
- **Trần series**: kiểm kề nhau chịu được 8 slot; kiểm "mọi cặp" (scatter, bubble, bản đồ, small multiples) chỉ chịu **3 series** —
  thêm slot 4 là FAIL (tím hồng ↔ xanh dương mù màu 6,0). Quá 3 thì gom "Khác" hoặc facet, KHÔNG đổi palette.
  4 series đã bắt buộc nhãn trực tiếp.
- Bài kiểm khoá bằng máy: `tests/shared/charts/chart-palette-validator.test.ts` chạy cùng công thức (`deltaE`, `contrastRatio`,
  `oklchOf` của `@/shared/charts`) trên hex đã giải của từng theme và ghim các số trên.

**Quy trình thêm / đổi một màu chart** (không bỏ bước nào):
1. Chọn bậc trong ramp CÓ SẴN của `colors-theme.json`: L trong dải của CẢ hai theme (hoặc thêm cặp `chart-*` [light, dark] khi một bậc
   không vừa cả hai), C ≥ 0.10, tương phản nền ≥ 3:1 nếu được.
2. Chạy validator hai theme (lệnh trên, thêm `--pairs all` nếu dùng cho scatter / bản đồ). FAIL → dịch bậc ±1 (giữ hue, đổi L) hoặc đổi chỗ slot
   rồi chạy lại ("snap-to-passing"); KHÔNG nới ngưỡng.
3. Sửa `chart-palette.constants.ts` (hoặc `colors-theme.json` → `npm run generate:colors`), cập nhật bảng §1.2 + bảng điểm này.
4. Sửa số ghim trong `chart-palette-validator.test.ts`; `npx vitest run tests/shared/charts tests/policy/styling`.
5. Chụp `/demo#chart-palette` + `/demo#chart-gallery` ở sáng + tối + khung 360px và nhìn bằng mắt (validator chỉ đo màu, không đo bố cục).

#### 1.2.2. Chọn thang màu theo CÔNG VIỆC của dữ liệu

| Dữ liệu là… | Dùng | Nguyên tắc |
| ----------- | ---- | ---------- |
| Danh tính (đường / cột / lát nào) | `seriesTokenAt(i)` | 8 hue cố định theo thực thể, không xoay vòng; **một series → một màu slot 1 cho mọi cột** (không tô cột theo giá trị) |
| Độ lớn (bao nhiêu) — heatmap, bản đồ nhiệt | `sequentialTokenForRatio` · `sequentialScale(n)` | **1 hue**, nhạt → đậm; ≥ 7 lớp có nghĩa thì dùng bảng; không cầu vồng |
| Phía so với mốc (vượt / hụt kế hoạch) | `divergingTokenFor(value, extent)` | 2 hue ngược + **xám giữa**; mỗi phía số bậc bằng nhau; "tốt / xấu" thì dùng `CHART_STATUS`, không dùng diverging |
| Trạng thái (xong / chậm / trễ) | `CHART_STATUS` | nghĩa cố định, luôn chữ / icon; không mượn cho "series 4" |
| Thực thể gom đuôi | `CHART_OTHER_TOKEN` | luôn là lát / series CUỐI, xám |

- Chữ trong ô heatmap chọn **trắng hoặc mực theo độ sáng ô** (không tô màu series). Hai khối sequential cạnh nhau → khối thứ hai lấy hue
  của slot kế (không phải cầu vồng).
- Filter bỏ series thì series còn lại **GIỮ màu** — token đi theo thực thể, không theo thứ hạng hiện tại.

### 1.3. ⛔ Tô MẢNG LỚN — gradient cùng hue, tối hơn 1 bậc ở lõi

Series đã nằm trong dải L an toàn nên mảng lớn KHÔNG còn bloom như bậc `-5` neon cũ; gradient chỉ còn để cho "độ khối":
mép = **token series**, lõi tối hơn 1 bậc (`tokenDarker`). Helper của `@/shared/charts` (`utils/chart-gradient.utils.ts`) tính bậc **tương đối**
theo bậc của token (token `-5` giữ đúng hành vi cũ `-6 → -5`; `primary-6` → `primary-7 → primary-6`), kẹp ở bậc cuối còn tồn tại.

| Hình | Helper |
|------|--------|
| Đĩa đặc / cung một lát / vòng tiến độ (`<radialGradient>`) | `arcGradientStops(color)` — 2 stop (lõi tối hơn 1 bậc → mép = token) |
| Cột dọc cao | `columnGradientStops(color)` — 3 stop (tối hơn 2 bậc → 1 bậc → token) |
| Thanh chữ nhật (CSS `background`) | `barGradient(color)` |
| Vành donut nhiều lát | `arcGradientVectors` + `arcSpectrumStops` + `arcGradientId` |

```tsx
<radialGradient id={id} cx="50%" cy="50%" r="50%">
  {arcGradientStops(color).map((s) => <stop key={s.offset} offset={s.offset} stopColor={s.color} />)}
</radialGradient>
```

Token chrome (`fg-*`, `bg-*`, `border-*`, `neutral-*`…), `chart-other`, thang chỉ số `chart-seq-*` / `chart-div-*` hoặc không có bậc → 2 stop CÙNG màu (tô phẳng).

**Quy tắc cứng:** gradient **CHỈ đổi bậc, KHÔNG đổi hue** — biên độ tối đa 2 bậc; gradient đa hue (vd `#1d54f7 → #68eaf9`) phá danh tính màu series.
Mép ngoài luôn là màu đã qua validator — đừng dựng gradient SÁNG hơn token.

### 1.4. ⛔ Xanh thương hiệu là TÔNG THƯƠNG HIỆU, không phải DẢI PHÂN LOẠI

Đã kiểm bằng ΔE + mô phỏng mù màu: dải "thuần xanh" cùng họ (cyan → teal → azure → blue → chàm) **FAIL** từ lát thứ 4
(`azure-5 ↔ secondary-6` chỉ ΔE 5,5 — mắt thường cũng khó phân biệt). Xanh lá thương hiệu cũng sát các họ lân cận: `primary-6`
↔ `green-7` chỉ ΔE 4,6, ↔ `secondary-6` 11,5, ↔ `teal-6` 13,4 (mắt thường, đều dưới sàn 15) — và ↔ cam `orange-6` mù màu 7,1.

- Muốn dashboard "tông thương hiệu" → xanh lá `primary-6` đã giữ **slot 1** (series chính); hai bên nó là hue XA (tím hồng
  slot 2, tím slot 8), cam đứng xa ở slot 7. ⛔ KHÔNG thêm `green-*` / `teal-*` làm series cạnh nó (xanh lá ↔ lục chỉ ΔE 4,6).
- **Trần 8 series.** Quá 8 → gom "Khác", KHÔNG sinh hue thứ 9.
- **Thứ tự slot là cơ chế an toàn màu, KHÔNG được xáo.** Filter bỏ series thì series còn lại GIỮ NGUYÊN màu.

---

## 2. ⛔ Chart skeleton chuẩn (Recharts)

### 2.1. Wrapper

Mọi chart `.tsx` file PHẢI:

```tsx
import { useChartMetrics } from '@/shared/charts';

const FooChart = memo(function FooChart() {
  const data = useMemo(() => MOCK_FOO, []);
  const [chartRef, m] = useChartMetrics<HTMLDivElement>();

  return (
    <div ref={chartRef} className="h-full w-full">
      <ResponsiveContainer {...m.container}>
        <SomeChart
          {...m.chartProps}
          data={data}
          margin={{ top: 4, right: 8, left: -20, bottom: 0 }}
        >
          {/* … */}
        </SomeChart>
      </ResponsiveContainer>
    </div>
  );
});

export default FooChart;
```

**Quy tắc:**

- `<ResponsiveContainer {...m.container}>` (= `width="100%" height="100%"` + sàn chiều cao 32px) — chart luôn fill parent, parent chưa có chiều cao thì khung không về 0
- `{...m.chartProps}` lên `<LineChart>` / `<BarChart>` / `<AreaChart>` / `<PieChart>` — tắt rAF-throttle của Recharts 3 để chạm đầu tiên hiện tooltip (§2.6)
- Wrapper `<div ref={chartRef} className="h-full w-full">` — vừa cho parent chiều
  cao xác định, vừa là thứ `useChartMetrics` ĐO để chọn bậc mật độ. Quên `ref` là
  chart kẹt ở bậc mặc định, phóng to không làm chữ to lên.
- `margin.left = -20` để legend / Y-axis không thừa khoảng trắng trái
- `margin.bottom = 0` mặc định (legend tự padding 4px top)
- `data` luôn `useMemo` từ mock / props — KHÔNG inline

> **Mọi ví dụ từ đây trở xuống giả định `m`** là giá trị thứ hai của
> `useChartMetrics()` trong chính component đó.

### 2.2. Axis

```tsx
<XAxis
  dataKey="day"
  tick={m.axisTick}
  tickLine={false}
  axisLine={m.axisLine}
  {...xLayout}  // interval / angle / textAnchor / height theo BỀ RỘNG thật — KHÔNG interval số cứng (§2.6)
/>
<YAxis
  tick={m.axisTick}
  tickLine={false}
  axisLine={false}
  width={m.scale.yAxisWidth}   // theo bậc mật độ — KHÔNG số cứng
  tickFormatter={(v) => `${v}%`}  // hoặc unit khác
/>
```

`const xLayout = xAxisLayout({ count: data.length, plotWidth: m.plotWidth, fontSize: m.scale.axis, labelChars })`
(`labelChars` = số ký tự của nhãn dài nhất).

**KHÔNG:**

- Đặt `tickLine={true}` (mặc định tick line chật)
- Quên `width={m.scale.yAxisWidth}` khi YAxis có tickFormatter — chart thừa whitespace trái
- Dùng thẳng `m.scale.yAxisWidth` cho nhãn Y dài ≥ 4 ký tự (`100%`, `12.500`) — nhãn tràn ra mép trái vài px bị cắt; dùng
  `width={yAxisWidthFor(labelChars, m.scale.axis, m.scale.yAxisWidth)}`

### 2.3. CartesianGrid

```tsx
<CartesianGrid
  {...m.grid}
  vertical={false} // line chart / area chart — chỉ ngang
  // horizontal={false} // horizontal bar — chỉ dọc
/>
```

### 2.4. Tooltip

```tsx
<Tooltip
  contentStyle={m.tooltip}
  itemStyle={m.tooltipItem}
  labelStyle={m.tooltipLabel}
  cursor={m.barCursor} // cột: dải nền primary 8%
  // hoặc
  cursor={m.lineCursor} // đường / vùng: vạch dọc đứt màu trục
  formatter={(v: number) => `${v} tỷ`} // optional unit format
/>
```

### 2.5. Legend

```tsx
<Legend
  iconSize={m.scale.legend}
  labelStyle={m.legendLabel} // Recharts mặc định tô chữ chú giải bằng màu series (§1.7)
  wrapperStyle={m.legend}
  iconSize={m.scale.legend}
  labelStyle={m.legendLabel}     // chữ giữ màu fg-body — Recharts mặc định TÔ chữ theo màu series (vi phạm §1.7)
  itemSorter={null}              // giữ thứ tự khai báo — mặc định Recharts sắp theo tên A→Z
  // donut: chú giải HTML dưới / bên cạnh donut (ShareDonutChart), không layout="vertical" trong khung hẹp
  // line:  iconType="plainline" · bar / area: iconType="square"
/>
```

### 2.6. ⛔ Chart responsive — cỡ màn → mật độ / legend / tooltip

Cỡ chữ + nét theo **chiều cao** (§1.5); **bề rộng** chỉ quyết định MẬT ĐỘ NHÃN. `m.width` / `m.plotWidth` (= bề rộng − trục Y) /
`m.narrow` (< 420px, `CHART_WIDTH_BREAKPOINTS`) đến từ `useChartMetrics`. Vùng vẽ của khung thẻ ≈ viewport − lề 32 − đệm thẻ.

| Vùng vẽ (≈ viewport) | Trục X | Legend | Nhãn số / nhãn trực tiếp | Tooltip |
| -------------------- | ------ | ------ | ------------------------ | ------- |
| **< 420px** (điện thoại dọc 320–430) | `xAxisLayout`: nhãn dài → nghiêng -35°, vẫn không vừa → thưa đều (luôn ≥ 2 nhãn) | `m.legend` ở khung hẹp: dãn dòng, tối đa 5 dòng rồi cuộn dọc — không đẩy lấn vùng vẽ | Nhãn trực tiếp nhường legend; nhãn số trên cột chỉ khi ≤ 6 cột ("Khi nào label gây nhiễu" §3.2.5) | `maxWidth: min(18rem, 100vw − 2rem)`; chạm đầu tiên hiện ngay |
| 420–719px (điện thoại ngang, tablet dọc hẹp) | `xAxisLayout` (đa số hiện hết) | một hàng, tự xuống dòng | ≤ 4 series: nhãn trực tiếp cuối đường + legend | như trên |
| ≥ 720px (tablet ngang, laptop, màn ngoài) | hiện hết (thưa chỉ khi dataset dài) | một hàng | ≤ 4 series: nhãn trực tiếp + legend; ≥ 5: chỉ legend | rê chuột; cursor hairline |
| TV (`uiScale > 1`) | như ≥ 720 | chữ `fg-heading` | font × `uiScale` | §10 |

Quy tắc cứng:
- **Khung có sàn**: `<ResponsiveContainer {...m.container}>` — cha không có chiều cao thì Recharts im lặng không vẽ (hoặc cảnh báo
  `width(0) height(0)`). Cha vẫn phải cấp chiều cao thật (`h-56`, `min-h-0 flex-1`); sàn 32px chỉ là lưới an toàn.
- **Cảm ứng**: Recharts 3 gom `mousemove`/`touchmove` vào `requestAnimationFrame` nên lần chạm đầu có thể mất tooltip / `onClick` →
  `{...m.chartProps}` (`throttledEvents: []`) trên MỌI chart có tooltip hoặc `onClick`. Vùng chạm ≥ 24px (`activeDot`, `barSize`
  không cần to, nhưng cursor dải `fill` phải phủ cả nhóm).
- **Hover-only không được là nguồn thông tin duy nhất**: mọi giá trị phải đọc được qua legend / nhãn / bảng số; tooltip chỉ BỔ SUNG.
  ≤ 4 series → nhãn trực tiếp ở cuối đường (chữ `fg-body`); đường hội tụ thì leader line / small multiples, KHÔNG xếp chồng nhãn.
- **Donut / pie**: chú giải là HTML (ô màu · tên · giá trị · %), xuống DƯỚI donut khi khung < 28rem — KHÔNG nhãn ngoài vành (bị cắt ở 360px).
  Số ở tâm `tabular-nums`; vòng tiến độ luôn có track (§3.1.5).
- **Số**: nhãn trục / nhãn cột / tooltip `tabular-nums` (`overrides/recharts.css`) — số không nhảy ngang khi dữ liệu đổi.
- Kiểm bằng ảnh: `/demo#chart-phone` (khung cố định 360px) và `/demo#chart-gallery` ở 360×800 · 820×1180 · 1366×768 · 1728×1117, sáng + tối.

---

> **Nâng sáng ở theme tối:** hex series KHÔNG đổi theo theme (đã ghim); `overrides/recharts.css` áp `filter: brightness(1.16) saturate(1.12)` lên cột / lát / vùng / đường dưới `.dark` để mảng màu không xỉn trên nền xanh đêm (Apple HIG: màu tối nên sáng và bão hoà hơn). Muốn chart không bị nâng → bọc phần tử bằng class riêng và thêm ngoại lệ ở file đó.

## 3. Loại chart cụ thể

### 3.1. ⛔ Donut / Pie — Stroke giữa slice

**Mặc định KHÔNG có vách ngăn đen** giữa các slice. Set `stroke="none"`:

```tsx
<Pie
  data={data}
  dataKey="value"
  nameKey="name"
  cx="38%" // center bên trái nếu có center-label, hoặc "50%"
  cy="50%"
  innerRadius="56%"
  outerRadius="86%"
  stroke="none" // ⛔ KHÔNG stroke giữa slice
  strokeWidth={0}
  paddingAngle={0} // 0 = liền mạch; nếu cần khoảng nhỏ thì 1
>
  {data.map((slice) => (
    <Cell key={slice.name} fill={tokenVar(slice.colorToken)} />
  ))}
</Pie>
```

**Khi nào thêm stroke / paddingAngle:**

| Tình huống                     | Stroke                           | paddingAngle |
| ------------------------------ | -------------------------------- | ------------ |
| Mặc định (no separator)        | `"none"`                         | `0`          |
| Cần phân tách rõ slice nhỏ     | `tokenVar('bg-surface')` strokeWidth 1 | `1-2`        |
| Slice quá ít (≤ 2) — KHÔNG cần | `"none"`                         | `0`          |

### 3.1.5. ⛔ Donut TỈ LỆ (progress ring) — track ring BẮT BUỘC

Áp dụng cho donut chỉ có 2 lát "đạt / thiếu" (vòng tiến độ 1 chỉ tiêu).

**KHÔNG tô lát "thiếu" bằng màu nền** (`bg-subtle`/`bg-pressed`): trên card cùng tông,
phần thiếu tàng hình → **mọi donut trông như đạt ~100%**. Thay bằng **track
ring**: 1 `<Pie>` phủ 360° vẽ TRƯỚC, và lát "thiếu" để `transparent`. Vòng tiến độ
SVG thuần đã có sẵn: `<ProgressDonutChart>` (`@/shared/charts`) — dùng nó trước khi tự dựng.

Màu track có MỘT nguồn: `CHART_CHROME.track` (`divider-default`, giống nhau ở chế độ thường lẫn TV).

```tsx
{/* Track — CHROME, cố ý contrast thấp (không mang dữ liệu) */}
<Pie data={[{ value: 1 }]} dataKey="value"
     innerRadius="64%" outerRadius="92%"
     fill={tokenVar(CHART_CHROME.track)} stroke="none" strokeWidth={0}
     isAnimationActive={false} />

{/* Cung dữ liệu — phần còn lại trong suốt để track lộ qua */}
<Pie data={[{ key:'done', value: num }, { key:'rest', value: den - num }]}
     dataKey="value" innerRadius="64%" outerRadius="92%"
     stroke="none" strokeWidth={0} cornerRadius={3}
     startAngle={90} endAngle={-270}
     style={{ filter: `drop-shadow(0 0 5px ${tokenVarAlpha(color, 0.45)})` }}>
  <Cell fill={`url(#${gradId})`} />
  <Cell fill="transparent" />
</Pie>
```

| Thuộc tính | Giá trị | Vì sao |
| ---------- | ------- | ------ |
| `innerRadius` / `outerRadius` | `64%` / `92%` | Vành đủ dày để lát nhỏ đọc được; chừa lề cho glow + vùng hit. **KHÔNG `80%/100%`** (vành mảnh 12px + chạm mép SVG) |
| Track fill | `CHART_CHROME.track` (`divider-default`) | Chrome — cố ý dưới 3:1. Vành RỖNG đọc ra "0%", vành MẤT đọc ra "lỗi" |
| `cornerRadius` | `2–4` | >8 làm méo lát nhỏ và vỡ vùng hit tooltip. Donut < 80px → `0` |
| Cung dữ liệu | gradient lõi tối hơn 1 bậc → mép = token (§1.3) | Độ khối, không bloom |
| Glow | **đúng 1 phần tử**, cùng màu series | Glow đại trà = bloom, mất hết cạnh. KHÔNG dùng bóng xám `rgba(40,40,40,…)` |

**Trạng thái bắt buộc có:**

| Trạng thái | Hiển thị |
| ---------- | -------- |
| Mẫu số = 0 | CHỈ track ring + `—` (`fg-faint`) + caption "Chưa có dữ liệu". Khoá hover |
| Đang refetch kỳ mới | **Giữ nguyên hình cũ ở `opacity-50`** — KHÔNG nháy skeleton, KHÔNG hiện 0% (đọc nhầm là dữ liệu thật) |
| Có dữ liệu | `%` ở tâm + `đạt/tổng` **kèm ĐƠN VỊ** (người / thiết bị / hồ sơ…) |

**Chú giải phải nói thật:** ô màu "Thiếu" trong tooltip/legend BẮT BUỘC dùng
đúng màu track (`CHART_CHROME.track`). Chú giải một màu mà vành vẽ màu khác → legend nói dối.

### 3.2. Center label cho Donut

```tsx
<div className="relative h-full w-full">
  <ResponsiveContainer>
    <PieChart>
      <Pie cx="38%" cy="50%" ...>{cells}</Pie>
      <Legend layout="vertical" verticalAlign="middle" align="right" iconType="circle" labelStyle={m.legendLabel} />
    </PieChart>
  </ResponsiveContainer>
  <div
    className="pointer-events-none absolute inset-y-0 left-0 grid place-items-center"
    style={{ width: '38%' }}  // match cx
  >
    <div className="flex flex-col items-center text-center">
      <Text size="extraTiny" className="uppercase tracking-wider text-fg-muted">
        {totalLabel}
      </Text>
      <Heading size="medium" className="text-fg-heading tabular-nums">
        {formatNumber(total)}
      </Heading>
      <Text size="extraTiny" className="text-fg-muted">
        {totalUnit}
      </Text>
    </div>
  </div>
</div>
```

**Quy tắc:** width của overlay = % của cx để label center đúng vào tâm donut.

### 3.2.5. ⛔ Bar / Line CHART luôn HIỂN THỊ SỐ — Integer label + Decimal tooltip

Mục tiêu: **user nhìn 1 phát thấy số liệu** (kiểu chart chứng khoán), không cần
hover. Hover chỉ để xem chi tiết.

#### Quy tắc cứng

| Chart type                  | Trên đỉnh element (LabelList)             | Trên hover (Tooltip)  |
| --------------------------- | ----------------------------------------- | --------------------- |
| `<Bar>` (luôn)              | **BẮT BUỘC** integer + thousand separator | Decimal đầy đủ + unit |
| `<Line>` lũy kế / KPI chính | Khuyến nghị (số nguyên) — bỏ khi quá dày  | Decimal đầy đủ + unit |
| `<Line>` mini sparkline     | Bỏ (chỉ trend, không cần số)              | Decimal đầy đủ + unit |
| `<Area>` stacked            | Bỏ (dùng tổng từ legend / KPI strip)      | Decimal đầy đủ + unit |

#### Helper formatter — chuẩn (`@/shared/charts`, file `utils/chart-format.utils.ts`)

| Helper | Dùng cho | Ví dụ |
|--------|----------|-------|
| `labelInt(v)` | Nhãn đỉnh cột — SỐ NGUYÊN + dấu phân tách hàng nghìn vi-VN | `1234.4` → `'1.234'` |
| `fmt3(v)` | Tooltip — tối đa 3 chữ số lẻ, bỏ số 0 thừa (thêm đơn vị ở nơi gọi) | `1.5` → `'1,5'` |

Cả hai viết trên `formatNumber` (`@/shared/utils/format/format.utils`, `Intl` vi-VN dựng một lần) và
ẩn `0` / `null` / `NaN` / `±Infinity` (trả `''`). Phần trăm dùng `formatPercent(v, decimals)` — KHÔNG tự
ghép `` `${formatNumber(v, 1)}%` ``.

#### Bar label skeleton chuẩn (BẮT BUỘC)

```tsx
<Bar dataKey="value" fill={tokenVar(CHART_COLORS.actual)} ...>
  <LabelList
    {...m.barLabel}                            // ⛔ cỡ chữ theo bậc mật độ (§1.5)
    dataKey="value"
    position="top"                             // ⛔ KHÔNG "inside"
    fill={tokenVar('fg-heading')}              // chữ giữ màu fg-*, KHÔNG tô màu series (§1.7)
    formatter={(v) => labelInt(Number(v))}     // integer
  />
</Bar>
```

`m.barLabel` = `{ fontSize (theo bậc), fontWeight: 600, letterSpacing: '-0.01em' }`.
⛔ KHÔNG có `fontFamily` — nhãn số kế thừa font sans của app (§1.8).

**⛔ KHÔNG dùng `stroke` + `paintOrder` cho LabelList.** Bản trước của rule này
yêu cầu viền `bg-page` 3px để tách chữ khỏi nền. Trên nền tối, viền đó vẽ ra một
**quầng ĐEN quanh mỗi con số** — trông như bóng chữ bẩn và làm chữ nhoè, đúng
thứ nó định ngăn. Nhãn đặt `position="top"` vốn nằm NGOÀI thân cột, trên nền
panel sạch, nên không có gì để tách.

Bù độ đọc bằng `tabular-nums` (cột số thẳng hàng) + weight 600 — **KHÔNG** font
mono, xem §1.8.
Chỉ khi buộc phải đặt `position="inside"` (bar rất cao, hết chỗ phía trên) thì
mới cân nhắc viền — và khi đó viền lấy màu chính thân bar, không phải `bg-page`.

#### Tooltip skeleton chuẩn (BẮT BUỘC)

```tsx
<Tooltip
  contentStyle={m.tooltip}
  itemStyle={m.tooltipItem}
  labelStyle={m.tooltipLabel}
  cursor={m.barCursor}
  formatter={(v, name) => [
    `${fmt3(Number(v)) || '0'} tỷ`, // ⛔ đơn vị BẮT BUỘC cuối chuỗi
    String(name),
  ]}
/>
```

#### Anti-patterns

| ❌ Sai                                | ✅ Đúng                                                                  |
| ------------------------------------- | ------------------------------------------------------------------------ |
| Bar không có `<LabelList>`            | `<LabelList formatter={labelInt} ... />`                                 |
| LabelList có `stroke` viền `bg-page`  | Bỏ đi — sinh quầng đen trên nền tối. Dùng `{...m.barLabel}`              |
| Label format full decimal `"123.456"` | `labelInt` → `"123"`                                                     |
| Tooltip không có đơn vị               | `formatter={(v) => [`${fmt3(Number(v))} tỷ`, name]}`                     |
| Tooltip cũng integer (= label)        | Tooltip = `fmt3` (decimal) — phải KHÁC label để có giá trị bổ sung       |
| `fontSize={9}` / `fontSize={10}` / bất kỳ số cứng | `{...m.barLabel}` — sàn 11px, theo bậc mật độ (§1.5)         |
| `fontWeight={400/500}`                | Tối thiểu `600`                                                          |
| `toLocaleString(...)` tự gọi trong file chart | `labelInt` / `fmt3` / `formatNumber` (vi-VN) — tự gọi dễ trộn `en-US`, cùng tập số hiện 2 kiểu dấu |

#### Khi nào label gây nhiễu → ẩn?

- Bar dày đặc (> 24 bar/chart) → ẩn label, **bắt buộc** giữ tooltip
- Sparkline (chart nhỏ < 80×40) → ẩn label
- Stacked bar có > 3 segment → ẩn label segment (chỉ giữ label total nếu có)

#### ⚠️ Stacked bar — TOTAL label pattern (LIMITATION của Recharts)

Recharts `LabelFormatter` signature **chỉ nhận 1 arg `(value) => string`** —
KHÔNG truy cập được payload/datum khác. Vì thế, để hiển thị TỔNG stack trên
top segment, **PHẢI pre-compute** `__total` vào data:

```tsx
// ❌ SAI — formatter không nhận entry/payload, sẽ TypeError ở build
<LabelList formatter={(_, entry) => labelInt(sumStack(entry))} />

// ❌ SAI — gắn nhãn vào series CUỐI: cột nào series đó vắng mặt (hoặc = 0) là
// mất luôn nhãn tổng. Xem §3.4.1 — đây là bug đã gặp ở biểu đồ Nhân sự.
<Bar dataKey="c" stackId="a">
  <LabelList dataKey="__total" position="top" />
</Bar>

// ✅ ĐÚNG — pre-compute __total + treo nhãn trên CỘT NEO trong suốt
const data = useMemo(
  () => MOCK.map((d) => ({ ...d, __total: d.a + d.b + d.c, __anchor: 0 })),
  []
);

<Bar dataKey="a" stackId="a" ... />
<Bar dataKey="b" stackId="a" ... />
<Bar dataKey="c" stackId="a" ... />
<Bar
  dataKey="__anchor"
  stackId="a"
  fill="transparent"
  minPointSize={1}          // ⛔ BẮT BUỘC — xem §3.4.1
  legendType="none"
  tooltipType="none"
  isAnimationActive={false}
>
  <LabelList
    dataKey="__total"        // ⛔ trỏ vào pre-computed field
    position="top"
    {...m.barLabel}
    fill={tokenVar('fg-heading')}
    formatter={(v) => labelInt(Number(v))}
  />
</Bar>
```

**Quy tắc:**

- Total field PHẢI prefix `__` (vd `__total`) — phân biệt với data field thật
- Nhãn tổng treo trên **cột neo** `__anchor`, KHÔNG trên series cuối (§3.4.1)
- Tooltip vẫn dùng `formatter={(v) => ...}` cho từng segment riêng — không cần show total

#### ⛔ 3.4.1. Vì sao phải có cột neo — Recharts LỌC BỎ rect cao 0

`computeBarRectangles` (recharts 3.x, `lib/cartesian/Bar.js`) có đoạn:

```js
if (x == null || y == null || width == null || height == null ||
    (!hasCustomShape && (width === 0 || height === 0))) {
  return null;   // ← rồi .filter(Boolean)
}
```

Và `BarLabelListProvider` dựng danh sách nhãn **từ chính mảng rect đã lọc đó**.

Hệ quả: series nào ở một cột có giá trị **0 hoặc thiếu key** → rect cao 0 → bị lọc
→ **cột đó mất nhãn**. Với stack sắp theo tổng giảm dần, series trên cùng chính là
series nhỏ nhất / rải rác nhất, nên phần lớn cột mất nhãn — nhìn như chart hỏng.

Cột neo `__anchor` luôn có mặt ở MỌI cột nên nhãn không bao giờ hụt. Phải kèm
`minPointSize={1}`: giá trị 0 cho rect cao 0 và bị lọc y hệt; `minPointSize` đẩy
lên 1px (trong suốt, không nhìn thấy) để rect sống sót.

`tooltipType="none"` + `legendType="none"` để cột neo không lọt vào tooltip và
chú giải — cả `DefaultTooltipContent` lẫn `DefaultLegendContent` đều bỏ qua entry
có `type === 'none'`.

### 3.3. Bar chart (vertical)

```tsx
<BarChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
  <CartesianGrid
    {...m.grid}
    vertical={false}
  />
  <XAxis
    dataKey="name"
    tick={m.axisTick}
    tickLine={false}
    axisLine={m.axisLine}
    interval={0} // hiện hết label
    angle={-15} // xoay nhẹ nếu label dài
    textAnchor="end"
    height={42} // thêm chiều cao axis cho label xoay
  />
  <YAxis tick={m.axisTick} tickLine={false} axisLine={false} />
  <Tooltip cursor={m.barCursor} />
  <Legend iconType="square" labelStyle={m.legendLabel} wrapperStyle={m.legend} />
  <Bar dataKey="budget" name="Ngân sách" fill={tokenVar(CHART_COLORS.budget)} />
  <Bar dataKey="spent" name="Đã chi" fill={tokenVar(CHART_COLORS.spent)} />
</BarChart>
```

**KHÔNG dùng `radius={[2, 2, 0, 0]}`** trừ khi design yêu cầu — mặc định bar VUÔNG.

### 3.4. Stacked bar

```tsx
<Bar dataKey="approved" stackId="a" name="Đã duyệt" fill={tokenVar(CHART_COLORS.approved)} />
<Bar dataKey="pending"  stackId="a" name="Chờ"      fill={tokenVar(CHART_COLORS.pending)} />
<Bar dataKey="overdue"  stackId="a" name="Quá hạn" fill={tokenVar(CHART_COLORS.overdue)} />
```

**Quy tắc:** cùng `stackId` cho stack chung; thứ tự trong JSX = thứ tự stack bottom→top.

### 3.5. Horizontal bar

```tsx
<BarChart
  data={data}
  layout="vertical"
  margin={{ top: 4, right: 12, left: 4, bottom: 0 }}
>
  <CartesianGrid
    {...m.grid}
    horizontal={false}
  />
  <XAxis
    type="number"
    tick={m.axisTick}
    tickLine={false}
    axisLine={false}
  />
  <YAxis
    type="category"
    dataKey="name"
    tick={m.axisTick}
    tickLine={false}
    axisLine={m.axisLine}
    width={Math.max(m.scale.yAxisWidth, 66)} // nhãn category dài
  />
  <Bar dataKey="value">
    {data.map((_, i) => (
      <Cell key={i} fill={tokenVar(DONUT_TOKENS[i % DONUT_TOKENS.length])} />
    ))}
  </Bar>
</BarChart>
```

**Quy tắc:** `layout="vertical"` đảo XY; `horizontal={false}` trên grid.

### 3.6. Area chart (stacked)

```tsx
const accent = CHART_COLORS.groupA; // 'azure-5'
const deep = tokenAtStep(accent, 6); // 'azure-6'
const fillId = `${useId()}-groupA`;

<AreaChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
  <defs>
    <linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor={tokenVar(accent)} stopOpacity={0.3} />
      <stop offset="100%" stopColor={tokenVar(deep)} stopOpacity={0.02} />
    </linearGradient>
    {/* … 1 gradient / series */}
  </defs>
  <Area
    type="monotone"
    dataKey="groupA"
    stackId="1"
    stroke={tokenVar(CHART_COLORS.groupA)}
    strokeWidth={m.scale.lineWidth}
    activeDot={m.activeDot}
    fill={`url(#${fillId})`}
  />
</AreaChart>
```

**Quy tắc:**

- 1 `<linearGradient>` cho mỗi series, id từ `useId()` để 2 chart cùng trang không trùng
- Màu: chính `token` (`-5`) + `tokenAtStep(token, 6)` (`-6`) cùng hue (§1.3); `-5` ở đỉnh `stopOpacity≈0.3` nhạt
  dần về `-6` ở đáy `≈0.02` (mẫu: `SCurveChart` của `features/demo/shared/charts/`)
- `type="monotone"` mặc định (mượt); dùng `step` nếu cần bậc thang

### 3.7. Line chart (đường luỹ kế / kế hoạch vs thực tế)

```tsx
<LineChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
  <CartesianGrid
    {...m.grid}
    vertical={false}
  />
  <XAxis
    dataKey="month"
    tick={m.axisTick}
    tickLine={false}
    axisLine={m.axisLine}
  />
  <YAxis
    tick={m.axisTick}
    tickLine={false}
    axisLine={false}
    tickFormatter={(v) => `${v}%`}
    width={m.scale.yAxisWidth}
  />
  <Tooltip cursor={m.lineCursor} />
  <Legend iconType="plainline" labelStyle={m.legendLabel} wrapperStyle={m.legend} />
  <Line
    type="monotone"
    dataKey="planned"
    name="Kế hoạch"
    stroke={tokenVar(CHART_COLORS.planned)}
    strokeWidth={m.scale.lineWidth}
    strokeDasharray={CHART_DASH.plan} // '6 4' — kế hoạch / dự báo → dashed
    dot={false}
    activeDot={m.activeDot}
  />
  <Line
    type="monotone"
    dataKey="actual"
    name="Thực tế"
    stroke={tokenVar(CHART_COLORS.actual)}
    strokeWidth={m.scale.lineWidth}
    dot={m.dot}
    activeDot={m.activeDot}
    connectNulls={false} // gap = chưa có dữ liệu
  />
</LineChart>
```

**Quy tắc convention dashed:**

- Kế hoạch / dự báo → `strokeDasharray={CHART_DASH.plan}` (`"6 4"`) / `CHART_DASH.forecast` (`"4 4"`)
- Thực tế → nét liền + chấm rỗng `m.dot`; cùng `m.scale.lineWidth` với kế hoạch (nét phải nguyên — §1.5)

### 3.8. Sparkline (mini area, không axis)

```tsx
<div className="-mx-1 min-h-14 flex-1">
  <ResponsiveContainer>
    <AreaChart data={data} margin={{ top: 4, right: 4, left: 4, bottom: 0 }}>
      <defs>
        <linearGradient id="gradSpark" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={tokenVar(token)} stopOpacity={0.4} />
          <stop offset="100%" stopColor={tokenVar(token)} stopOpacity={0} />
        </linearGradient>
      </defs>
      <Tooltip contentStyle={m.tooltip} ... />
      <YAxis domain={['dataMin', 'dataMax']} hide /> {/* trục ẩn: sparkline co theo dữ liệu thay vì bắt đầu từ 0 */}
      <Area dataKey="value" stroke={tokenVar(token)} fill="url(#gradSpark)" strokeWidth={m.scale.lineWidth} />
    </AreaChart>
  </ResponsiveContainer>
</div>
```

**KHÔNG đặt axis/grid/legend** trong sparkline — chỉ trend line.

---

## 4. Mock data — Vị trí + cấu trúc

### 4.1. Vị trí

Cây folder của feature: xem `feature-structure.md`. File của chủ đề này:

- `constants/<chủ-đề>.constants.ts` — dữ liệu mẫu của chart + bảng ánh xạ series → token (§1.2).
  Mẫu: `src/features/demo/dashboard/constants/metrics.constants.ts` (`DASHBOARD_S_CURVE`,
  `DASHBOARD_STATUS_TOKENS`).
- `types/{feature}.types.ts` — kiểu điểm dữ liệu dùng ở ≥ 2 file.

**KHÔNG:**

- ⛔ Fork `chart-color.utils.ts` / `chart-style.utils.ts` / bảng màu vào feature —
  `tokenVar`, `tokenVarAlpha`, style tooltip / legend / axis **chỉ** đến từ
  `@/shared/charts` (§1.1)
- Inline mock data trong component file
- Để hằng chart dài / dùng ≥ 2 file ở module-scope của chart component (hằng riêng
  ngắn của file thì được — `clean-code-standards.md §2`)

### 4.2. Cấu trúc mock

```ts
// constants/foo.constants.ts
import type { KpiItem, SCurvePoint, ... } from '../types/foo.types';

export const MOCK_KPIS: KpiItem[] = [...];
export const MOCK_SCURVE: SCurvePoint[] = MONTHS.map((m, i) => ({ ... }));
```

**Quy tắc:**

- Gom theo chủ đề, mỗi chủ đề một `*.constants.ts`; độ dài theo giới hạn chung
  (`folder-structure.md §1`) — dài thì tách theo chủ đề (vd `metrics.constants.ts` ·
  `operations.constants.ts` của `features/demo/dashboard/`)
- Mock function gen `Array.from({length: N}).map(...)` — OK để procedural
- Type-safe: import types, không `any`

---

## 5. Dashboard / Màn hình lớn — Layout

### 5.1. ⛔ Page skeleton

```tsx
// pages/FooPage.tsx
const FooPage = memo(function FooPage() {
  return (
    <div className="flex h-full flex-col gap-2.5 overflow-auto p-2.5">
      <TitleScreen icon="grid-2-bold" iconColor="sky" title="Tiêu đề" />
      <FooKpiGrid /> {/* shrink-0 */}
      {/* Hàng chính — flex-1 + min-h-0 → fill space còn lại */}
      <div className="grid min-h-[360px] flex-1 grid-cols-1 gap-2.5 xl:grid-cols-[1fr_280px]">
        <FooMainPanel />
        <FooAlertFeed />
      </div>
      {/* Strip 4 panel — shrink-0 auto-rows-[220px] */}
      <div className="grid w-full shrink-0 auto-rows-[220px] grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
        <FooSection title="Panel 1">
          <Chart1 />
        </FooSection>
        {/* … */}
      </div>
    </div>
  );
});

export default FooPage;
```

**Quy tắc:**

- Outer: `h-full flex flex-col overflow-auto p-2.5 gap-2.5`
- Padding gọn `p-2.5` hoặc `p-3` — KHÔNG `p-4`/`p-6`
- Hàng chính: `flex-1 min-h-0` + `min-h-[360px]` (chặn sập)
- Strip chart: `shrink-0 auto-rows-[220px]` — đều chiều cao
- `min-h-0` BẮT BUỘC khi parent là flex column và child có chart fill

### 5.2. ⛔ Section wrapper compact

**Trước hết thử `<BoxPanel>` (UI kit)** — nó đã là "header + body có scroll nội bộ"
với `title` · `headerRight` · `headerClassName` · `bodyClassName`. Chỉ khi
`<BoxPanel>` không đủ (cần khung/nét riêng của dashboard) mới dựng wrapper cục bộ
theo mẫu dưới, và wrapper đó phải dùng `<SectionHeader>` chứ không tự build header:

```tsx
// components/FooSection.tsx
const FooSection = memo(function FooSection({
  title,
  right,
  children,
  bodyClassName = 'p-2',
}: FooSectionProps) {
  return (
    <section className="flex h-full flex-col overflow-hidden border border-border-default bg-bg-surface">
      <SectionHeader title={title} className="shrink-0 py-1.5" right={right} />
      <div className={cn('min-h-0 flex-1 overflow-hidden', bodyClassName)}>
        {children}
      </div>
    </section>
  );
});

export default FooSection;
```

**Quy tắc:**

- Header `py-1.5` (compact) — KHÔNG `py-3`/`py-4`
- **KHÔNG description** trong header dashboard compact (chỉ title)
- Body `p-2` default — pass `p-0 overflow-hidden` khi con tự quản lý padding
- `overflow-hidden` ở body — nếu cần scroll → chart tự responsive, KHÔNG cho body scroll

### 5.3. KPI strip

```tsx
const FooKpiGrid = memo(function FooKpiGrid() {
  return (
    <div className="grid shrink-0 grid-cols-2 gap-2 md:grid-cols-4 xl:grid-cols-8">
      {MOCK_KPIS.map((item) => (
        <CompactKpiCard
          key={item.id}
          color={item.color}
          icon={item.icon}
          label={item.label}
          value={item.value}
          unit={item.unit}
          trailing={
            item.delta ? (
              <Badge
                color={item.deltaDir === 'up' ? 'success' : 'error'}
                variant="tinted"
              >
                {item.delta}
              </Badge>
            ) : undefined
          }
        />
      ))}
    </div>
  );
});

export default FooKpiGrid;
```

**Quy tắc:**

- Dùng `<CompactKpiCard>` (UI kit) — KHÔNG raw card / Hud-card fork
- Grid responsive: 2 → 4 → 8 cột (KPI nhiều); 2 → 3 → 6 (KPI vừa)
- `shrink-0` để không co theo flex parent

### 5.4. Panel có nội dung fill tuyệt đối (viewer, canvas, danh sách + chi tiết)

Khi nội dung panel phải chiếm ĐÚNG phần còn lại và tự cuộn bên trong (không kéo
giãn panel cha):

```tsx
<DashboardSection
  title={`Danh sách (${filtered.length}/${items.length})`}
  right={<StatusChipFilter ... />}
  bodyClassName="relative p-0 overflow-hidden"
>
  <div className="absolute inset-0 grid grid-cols-1 grid-rows-1 gap-px bg-border-default lg:grid-cols-[260px_1fr]">
    <div className="hidden min-h-0 flex-col overflow-hidden bg-bg-surface lg:flex">
      <ItemList items={filtered} ... />
    </div>
    <div className="relative bg-bg-subtle">
      <DetailCanvas className="absolute inset-0" />
    </div>
  </div>
</DashboardSection>
```

**Quy tắc:**

- Body `relative p-0 overflow-hidden` — nội dung fill bằng `absolute inset-0`
- ⛔ KHÔNG đặt `min-h-[420px]` trên ô con → ép cell cao hơn body (gây overflow)
- Sidebar `min-w-[240px]` đến `300px` tuỳ mật độ
- Chip filter đặt ở `right` slot của section header, KHÔNG nhét vào body

### 5.5. Reuse hook / list giữa 2 màn

Hai tính năng con của CÙNG một feature cần cùng dữ liệu + hành vi danh sách → đặt
hook / list ở `shared/` của chính feature đó; tính năng con KHÔNG import lẫn nhau:

```tsx
// ✅ ĐÚNG — features/{feature}/shared/ dùng chung cho list/ và detail/
import { useOverviewItems } from '../../shared/hooks/useOverviewItems';
import OverviewItemList from '../../shared/components/OverviewItemList';
```

**Quy tắc:** dùng giữa NHIỀU feature → dời xuống `src/domains/` (dữ liệu / logic)
hoặc `src/shared/` (giao diện) — KHÔNG chuỗi import xuyên feature
(`feature-structure.md`).

---
## 6. Anti-patterns — danh sách đen

### 6.1. Color / styling

| ❌ Sai                                                    | ✅ Đúng                                                           |
| --------------------------------------------------------- | ----------------------------------------------------------------- |
| `stroke="oklch(0.5 0.04 235)"`                            | `stroke={tokenVar('fg-muted')}`                                       |
| `fill="#22c55e"`                                          | `fill={tokenVar(CHART_COLORS.groupA)}`                             |
| `style={{ fontSize: '11px', color: '#fff' }}`             | `contentStyle={m.tooltip}` từ `useChartMetrics`              |
| `<Cell fill="oklch(0.7 0.18 30)" />`                      | `<Cell fill={tokenVar(DONUT_TOKENS[i])} />`                       |
| `<Bar fill="rgba(56,189,248,0.55)" />`                    | `<Bar fill={tokenVarAlpha(CHART_COLORS.groupA, 0.55)} />`         |
| `CHART_COLORS.planned = 'sky-4'` (bậc tự chọn, chưa qua validator) | `CHART_COLORS.planned = CHART_SEMANTIC.plan`               |
| `DONUT_TOKENS = ['blue-5','green-5','sky-4']` (tự chọn bậc) | `seriesTokenAt(i)` — slot cố định, quá 8 → `chart-other`      |
| `CHART_SERIES_TOKENS[i % 8]` (quay vòng)                  | `seriesTokenAt(i)` (series 9 trở đi = "Khác", không trùng series 1) |

### 6.2. Layout

| ❌ Sai                               | ✅ Đúng                                           |
| ------------------------------------ | ------------------------------------------------- |
| Card HUD tự dựng / chép từ POC       | UI kit `<SectionHeader>` + custom wrapper compact   |
| `h-[calc(100vh-12rem)]` magic number | `flex-1 min-h-0` (hàng chính)                     |
| `p-4` / `p-6` panel header           | `py-1.5` (compact) hoặc `py-2`                    |
| Description trong header dashboard   | Title only (compact mode)                         |
| `overflow-y-auto` body khi có chart  | `overflow-hidden` + chart `<ResponsiveContainer>` |

### 6.3. Chart

| ❌ Sai                                                             | ✅ Đúng                                                                  |
| ------------------------------------------------------------------ | ------------------------------------------------------------------------ |
| `<Pie stroke="#000" strokeWidth={2} paddingAngle={2}>`             | `stroke="none"` `strokeWidth={0}` `paddingAngle={0}`                     |
| Inline `margin={{ top: 6, right: 8, left: -18, bottom: 0 }}` magic | Comment + `tick={m.axisTick}`, margin chuẩn `top:4,right:8,left:-20` |
| `radius={[2, 2, 0, 0]}` mặc định mọi bar                           | Default vuông; chỉ add khi design yêu cầu                                |
| `<XAxis interval="preserveStartEnd" />` cho dataset 30 ngày        | `interval={4}` (1 tick / 5 ngày)                                         |
| Hardcode `width={42}` / `width={48}` mọi nơi                       | YAxis `width={m.scale.yAxisWidth}`; nhãn category dài thì `Math.max(m.scale.yAxisWidth, 66)` |
| Quên `<ResponsiveContainer>`                                       | Bọc luôn `<ResponsiveContainer width="100%" height="100%">`              |
| Quên `width="100%" height="100%"` props                            | BẮT BUỘC để fill parent                                                  |

### 6.4. Data / Mock

| ❌ Sai                            | ✅ Đúng                            |
| --------------------------------- | ---------------------------------- |
| Mock array inline trong component | `constants/<chủ-đề>.constants.ts`  |
| Mock function gen mỗi render      | `useMemo(() => MOCK_FOO, [])`      |
| `any[]` cho mock                  | Type-safe import từ `types/`       |
| Magic month/day inline            | `const MONTHS = [...]` ở file dữ liệu mẫu |

### 6.5. Màu & dữ liệu (rút từ validator + skill dataviz)

| ❌ Sai | ✅ Đúng |
| ------ | ------- |
| **Dual-axis** (hai thang Y trên một khung) — căn chỉnh tuỳ ý nên chart "bịa" ra tương quan | Hai chart xếp cạnh nhau (small multiples), hoặc quy về chung một gốc (=100 tại t0) trên MỘT trục |
| Tô chữ (nhãn, legend, số) bằng màu series | Chữ `fg-*`; màu nằm ở ô / nét kề bên (§1.7) |
| Cycle quá 8 màu (`i % 8`) hoặc sinh hue thứ 9 | `seriesTokenAt(i)` → "Khác"; hoặc facet / small multiples |
| Tô lại màu theo thứ hạng khi filter bỏ series | Màu đi theo THỰC THỂ — bảng `thực thể → token` khai một lần |
| Tô cột theo giá trị khi danh mục không có thứ tự (tên sản phẩm, khu vực) | Mọi cột slot 1 (một series); thứ tự có nghĩa thì sequential 1 hue |
| Cầu vồng cho độ lớn; hue ở điểm giữa diverging; hai hue lạnh làm hai cực | Sequential 1 hue sáng → tối; diverging lạnh ↔ nóng + xám giữa |
| Dùng `CHART_STATUS` cho "series 4", hoặc dùng slot series để biểu thị tốt / xấu | Trạng thái chỉ dùng khi màu MANG nghĩa; còn lại slot series — không trộn trong một chart |
| Nhãn số trên MỌI điểm / MỌI cột dày | Nhãn chọn lọc (điểm cuối, cực trị); còn lại axis + tooltip + bảng số |
| Tooltip là nơi duy nhất đọc được giá trị | Legend / nhãn trực tiếp / bảng số; tooltip chỉ bổ sung (§2.6) |
| Donut so sánh các giá trị gần nhau, hoặc > 6 lát cùng ý nghĩa | Cột; hoặc bảng + chart |
| Pie 2 lát / cột đơn lẻ | Thẻ số (stat tile) — con số chính là chart |
| Nhãn nằm trong cột / lát nhỏ rồi bị cắt (`overflow: hidden`) | Nhãn ra ngoài đầu cột, hoặc bỏ về tooltip + bảng |
| Khung chart cố định chiều cao mà không tính dải nhãn trục X (card có scroll lồng) | Chiều cao khung = vùng vẽ + dải trục; hoặc để khung co giãn theo nội dung |

---

## 7. Performance

- **memo BẮT BUỘC** mỗi chart component (`memo(function Foo() { ... })`)
- **useMemo** cho data biến đổi nặng (filter, map, sort)
- KHÔNG inline arrow `data={[...]}` mỗi render — `useMemo` hoặc import const
- `<ResponsiveContainer>` chỉ re-render khi parent resize — không cần memo riêng
- Chart không nên có `useEffect` — data từ React Query hook ở parent, pass xuống props

---

## 8. Checklist trước khi commit chart/dashboard

### Mỗi file chart

- [ ] `memo(function FooChart() { ... })` — KHÔNG raw arrow
- [ ] `<div ref={chartRef} className="h-full w-full">` wrapper CÓ ref đo
- [ ] `const [chartRef, m] = useChartMetrics<HTMLDivElement>()` — KHÔNG tự đọc
  `useDisplayStore` trong file chart: hệ số TV đến từ `ChartScaleProvider` ở `AppProvider`
- [ ] `<ResponsiveContainer width="100%" height="100%">`
- [ ] `margin={{ top: 4, right: 8, left: -20, bottom: 0 }}` (hoặc lý do thay đổi)
- [ ] `tokenVar()` cho mọi màu — KHÔNG hex / oklch
- [ ] **KHÔNG có `fontSize` là số cứng** — mọi cỡ chữ qua `m.scale.*` / `m.barLabel` (§1.5)
- [ ] Lưới/trục dùng `m.grid` / `m.axisLine` — KHÔNG `divider-soft` (§1.6)
- [ ] Chữ KHÔNG tô bằng màu series (§1.7)
- [ ] `YAxis width={m.scale.yAxisWidth}` — KHÔNG số cứng
- [ ] Series `CHART_COLORS.xxx` từ constants — KHÔNG magic string
- [ ] Cặp KH/TT dùng đúng `CHART_SEMANTIC` (plan dashed · actual solid · forecast dashed ngắn) — KHÔNG tự viết token
- [ ] Số qua `labelInt` / `fmt3` / `formatNumber` / `formatPercent` (vi-VN) — KHÔNG tự `toLocaleString`
- [ ] **Mọi token màu data đến từ `@/shared/charts`** (`seriesTokenAt` · `CHART_SEMANTIC` · `CHART_STATUS` · `CHART_OTHER_TOKEN` · thang sequential / diverging) — KHÔNG tự chọn bậc (§1.2); bảng màu mới phải qua validator (§1.2.1)
- [ ] `<ResponsiveContainer {...m.container}>` + `{...m.chartProps}` lên chart; trục X dùng `xAxisLayout` (§2.6); legend có `labelStyle={m.legendLabel}`
- [ ] ≥ 2 series → có legend; ≤ 4 series → nhãn trực tiếp ở khung rộng; không thông tin chỉ hiện khi hover
- [ ] Đã chụp ở 360px và nhìn: không nhãn chồng / bị cắt
- [ ] `useMemo` cho data
- [ ] Donut `stroke="none"` `paddingAngle={0}` (trừ khi cần phân tách)

### Mỗi page dashboard

- [ ] `flex h-full flex-col gap-2.5 p-2.5` outer
- [ ] `<TitleScreen>` page header
- [ ] KPI strip `shrink-0` với `<CompactKpiCard>`
- [ ] Hàng chính `flex-1 min-h-0` + `min-h-[360px]`
- [ ] Strip chart `shrink-0 auto-rows-[220px]`
- [ ] Section header `py-1.5` không description
- [ ] Body `overflow-hidden p-2` (hoặc `p-0` khi con tự quản lý padding)
- [ ] `npm run check` xanh (`quality-gates.md`)

### Mỗi feature

- [ ] Hạ tầng chart import từ `@/shared/charts` (§1.1) — feature KHÔNG fork
- [ ] `@/shared/charts` (`chart-palette.constants.ts`) là nguồn màu DUY NHẤT — module KHÔNG tự khai token màu
- [ ] `constants/*.constants.ts` chứa bảng ánh xạ series → token (§1.2)
- [ ] Dữ liệu mẫu ở `constants/*.constants.ts` — không inline trong component
- [ ] `types/{feature}.types.ts` chứa point types
- [ ] Section wrapper compact ở `components/{Feature}Section.tsx`

---

## 9. Cross-references

- Token rules: `color-system.md` · `font-system.md` · `icon-conventions.md`
- UI kit components (CompactKpiCard, SectionHeader, TitleScreen): `reuse-first.md` · `ui-kit-architecture.md`
- Hạ tầng chart dùng chung: `@/shared/charts` (§1.1)
- Tailwind / `cn()`: `tailwind-conventions.md`
- Clean code (1 file = 1 component): `clean-code-standards.md` · giới hạn dòng: `folder-structure.md §1`
- Performance: `code-optimization.md`

---

## 10. ⛔ TV Display Mode — Cỡ chữ ×1.1 / 1.2 / 1.3 (KHÔNG phóng bố cục)

### 10.1. Cơ chế TV hiện tại

⛔ KHÔNG phóng root font-size: mọi utility (padding, kích thước) giãn theo → panel tràn, bảng vỡ layout ở TV.

**Cơ chế:** `--ui-scale` (1.1 mặc định · 1.2 · 1.3, trần 1.3) nhân
**riêng token typography** trong `generated-font.css` → chữ to lên, khung GIỮ
NGUYÊN → không vỡ, xem TV được.

⛔ **Chart là NGOẠI LỆ: CSS var KHÔNG với tới được.** Recharts đặt `fontSize`
làm **thuộc tính SVG tính bằng px** trong JS, không phải class Tailwind — nên
`--ui-scale` không chạm được vào nó. Vì thế `useChartMetrics` **nhân bằng code**:

```ts
// useChartMetrics.ts — rút gọn từ code hiện tại
const contextScale = useContext(ChartScaleContext);               // 1 khi TV tắt
const uiScale = uiScaleOverride ?? contextScale;
const density = size.height > 0 ? chartDensityFor(size.height) : CHART_DENSITY_FALLBACK; // height THỰC, KHÔNG chia
return { ...buildChartStyles(density, uiScale), density, width: size.width, height: size.height, uiScale };
```

**Dòng chảy chart ở TV:**
1. Chiều cao thực: `size.height` (⛔ KHÔNG chia `uiScale`)
2. Bậc mật độ: `chartDensityFor(height)` → compact / base / large / xlarge
3. Cỡ chữ: `buildChartStyles(density, uiScale)` nhân trong JS
4. Kết quả (bậc `base`, ×1.1): axis 12 → 13, barLabel 13 → 14; **lưới giữ 1px**
   (`scaleStroke` có sàn `Math.max(1, …)` và làm tròn, 1 × 1.3 vẫn ra 1)

**Cơ chế cũ (BỎ):**
```ts
// ❌ KHÔNG LÀM — thường thấy trong code cũ:
const density = chartDensityFor(height / uiScale);  // SAI — chia chiều cao
// Lý do bỏ: khi design KHÔNG phóng bố cục, khung chart không phình theo
// `uiScale` nữa, nên chia là tự bóp slot 220px thành 200px và tụt bậc oan.
```

⛔ Giá trị `ChartScaleProvider` nhận (gắn ở `AppProvider`) PHẢI là **scale HIỆU LỰC**
(`selectEffectiveUiScale`), KHÔNG phải `state.uiScale`: store vẫn nhớ hệ số TV
lúc đang ở chế độ standard, đọc thẳng là chart to lên cả khi TV đang tắt.

### 10.2. Anti-pattern TV — BLOCK MERGE

| ❌ Sai | ✅ Đúng |
|-------|--------|
| Chia `height / uiScale` → chọn bậc | `chartDensityFor(size.height)` — height THỰC |
| Đọc thẳng `state.uiScale` / đọc store trong file chart | `useChartMetrics()` — hệ số từ `ChartScaleProvider` (`selectEffectiveUiScale`) |
| Tự nhân `fontSize` trong file chart | `buildChartStyles` đã nhân — file chart chỉ đọc `m.scale.*` |
| Phóng `barSize` / `radius` theo `uiScale` | KHÔNG — khung cứng, kích thước px giữ nguyên |
| Tô phần thiếu donut bằng `bg-*` | Track ring chuẩn + phần còn lại **`transparent`** (§3.1.5) |

---

## 11. Khi vi phạm

- PR có chart hex/oklch hardcode → **revert**
- PR có `fontSize` là số cứng trong file chart (đặc biệt `9`/`10`) → **block merge** (§1.5)
- PR có nét (lineWidth, gridWidth) lẻ (2.5, 3.5) → **revert** (§1.5)
- PR có lưới/trục tô `divider-soft` → **block merge** (§1.6)
- PR tô CHỮ bằng màu series (kể cả chữ legend mặc định của Recharts) → **revert** (§1.7)
- PR tự chọn bậc token series (`'sky-4'`, `'teal-5'`…) thay vì lấy từ `@/shared/charts`, hoặc sửa bảng màu mà không chạy validator → **revert** (§1.2)
- PR thêm trục Y thứ hai (dual-axis) → **block merge** (§6.5)
- PR có `<Pie stroke="#xxx" paddingAngle>2` mà không có lý do design → **revert**
- Dashboard có `p-4/p-6` header section → fail review
- Dashboard có description trong header compact mode → fail review
- Chart KHÔNG có `<ResponsiveContainer>` → **block merge**
- Mock data trong component file → fail review
- **TV mode**: Chia `height / uiScale` hoặc nhân lại ở code → **revert** (bỏ, CSS var lo)
- **TV mode**: Phóng `barSize` / kích thước chart element theo `uiScale` → **revert** (khung cứng)
