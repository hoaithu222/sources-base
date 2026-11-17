# TV Display Mode

> Chế độ hiển thị riêng cho TV 65", khoảng cách nhìn ~3m. Bật bằng `?display=tv`
> trong URL hoặc trang **Cài đặt** (`src/app/_views/SettingsView.tsx`).
> **3 mức cỡ chữ**: 1.1 (mặc định) / 1.2 / 1.3 + thu padding ngoài (nhường diện tích).
> **KHÔNG ẩn Header/Dock, KHÔNG phóng to bố cục** — người dùng chốt 2026-08-07.

---

## 0. Nguyên tắc tối cao — 3 mức chọn được, trần 1.3

```
1. MỘT THẾ GIỚI          → Cùng 1 codebase, 3 mức TV (mặc định 1.1, max 1.3)
2. KHÔNG KỲ PHỤC          → KHÔNG ẩn chrome / cài đặt / nút bấm khi TV
3. CHỈ NHÂN CHỮ          → --ui-scale (1.1/1.2/1.3) nhân riêng token typography
4. KHUNG GIỮ NGUYÊN      → KHÔNG phóng root font-size (bố cục không giãn)
5. PADDING NHƯỢNG DỊ     → thu padding ngoài để user xem từ xa
6. DARK THEME ONLY       → TV ép dark (config)
7. TRẦN 1.3, KHÔNG VƯỢT  → Rủi ro chữ tràn khỏi nút/chip/ô bảng cố định
8. KHÔNG GIỮ DESIGN CŨ   → scale 1.5/1.8, overscan, ẩn chrome đã bỏ; giá trị đã lưu ngoài thang được `sanitizeDisplayState` (`merge` + `migrate` của store) nắn về mặc định 1.1
```

**Bài học:** Phóng root font-size = phóng tất cả (Tailwind v4 `--spacing: 0.25rem`)
→ bảng/panel tràn, vỡ bố cục ở TV. Chỉ nhân token chữ = chữ to, khung giữ → đúng.
Trần 1.3 vì khung không giãn → mỗi bậc chữ to là bậc rủi ro tràn.

---

## 1. Cấu trúc scale: store → CSS var → render

| Lớp | Nơi | Giá trị / Hành động |
|-----|-----|-------------|
| **Store** | `src/domains/preferences/display/display.store.ts` (`useDisplayStore`) | `mode` ('standard' \| 'tv'), `uiScale: TvUiScale` (1.1 \| 1.2 \| 1.3 — mức TV đã chọn, vẫn nhớ khi ở standard) |
| **Selector** | `.../display/display.selectors.ts` | `selectIsTv` · `selectEffectiveUiScale` → `EffectiveUiScale` (`1` ở standard) — ⛔ luôn dùng selector, KHÔNG đọc thẳng `state.uiScale` |
| **URL param** | `src/app/_providers/sync/DisplayUrlSync.tsx` — `?display=tv&scale=1.2` (gắn ở `AppProviders`, bọc `<Suspense>` vì đọc `useSearchParams`) | đọc / viết ở `display/display.utils.ts`: `readDisplayOverrides` · `nextDisplaySearch`; ghi store bằng `applyDisplayOverrides` |
| **CSS var** | `applyAppearance()` ở `src/app/_providers/appearance/appearance.utils.ts` (`AppearanceSync` gọi khi preferences đổi) ghi thẳng lên `<html>`; LẦN ĐẦU (trước khi vẽ) do `appearanceInitScript()` ở `<head>` — xem §8 | `--ui-scale` (1 / 1.1 / 1.2 / 1.3) · `--lh-scale` (nửa nhịp) · class `.tv` |
| **CSS var (weight)** | `:root.tv` trong `modes/tv.css` | `--fw-regular: 500` · `--fw-medium: 600` |
| **UI** | `src/app/_views/SettingsView.tsx` | Chọn chế độ + mức scale từ `UI_SCALE_VALUES` |
| **Render** | Typography (UI kit) | Font size: `calc(var(--fs-{token}, <mặc định>) * var(--ui-scale, 1))` |
| **UI Padding** | `src/app/_layouts/AppShellLayout.tsx` | Padding ngoài của `<main>` — nhường diện tích khi xem từ xa |

**⛔ KHÔNG hardcode scale ở component**. `--ui-scale` do `applyAppearance` đặt
một chỗ trên `<html>`. UI chọn mức qua `UI_SCALE_VALUES = [1.1, 1.2, 1.3]`.

⚠️ `modes/tv.css` **không** khai `--ui-scale` trong khối `.tv`; `base/root-vars.css` mới đặt giá trị
gốc `--ui-scale: 1` ở `:root`. Giá trị TV được `applyAppearance` ghi bằng
`root.style.setProperty('--ui-scale', …)` — sửa nhầm chỗ sẽ không có tác dụng.

---

## 2. Cơ chế nhân chữ ×1.1/1.2/1.3 — TỪ CSS VAR, KHÔNG ROOT FONT-SIZE

⛔ KHÔNG `html { font-size: calc(16px * var(--ui-scale)); }` — phóng root font-size là phóng cả spacing / kích
thước → bố cục vỡ. **Cách đúng (3 mức chọn được):**

```ts
// appearance.utils.ts (applyAppearance) — ghi hệ số ĐANG HIỆU LỰC lên <html> (1 ngoài TV; 1.1 / 1.2 / 1.3 ở TV)
root.style.setProperty('--ui-scale', String(uiScale));
root.style.setProperty('--lh-scale', String(1 + (uiScale - 1) * 0.5)); // nửa nhịp
root.classList.toggle('tv', isTv);
```

```css
/* modes/tv.css — chỉ NÂNG BẬC WEIGHT, không đụng --ui-scale */
:root.tv {
  --fw-regular: 500;    /* Nâng weight nửa bậc: 450→500 */
  --fw-medium: 600;     /* 500→600 */
  /* --fw-semibold, --fw-bold: giữ nguyên */
}

/* Font size — nhân riêng, KHÔNG vào root */
/* src/styles/font/generated-font.css */
@utility text-body-14 {
  font-size: calc(var(--fs-body-14, 0.875rem) * var(--ui-scale, 1));
  /* Normal: 0.875rem × 1 = 14px */
  /* TV ×1.1: 0.875rem × 1.1 = 15.4px */
  /* TV ×1.2: 0.875rem × 1.2 = 16.8px */
  /* TV ×1.3: 0.875rem × 1.3 = 18.2px */
  line-height: calc(var(--lh-body-14, 1.25rem) * var(--ui-scale, 1));
  font-weight: var(--fw-regular, 450);
}
```

**Hệ quả (kiểm trên Chrome thật):**
| | Normal | ×1.1 | ×1.2 | ×1.3 |
|---|---|---|---|---|
| `body-14` | 14px | 15.4px | 16.8px | 18.2px |
| `caption-10` | 10px | 11px | 12px | 13px |
| Giãn dòng | 20px | 22px | 24px | 26px |
| `p-4` (padding) | 16px | 16px | 16px | 16px |
| `h-11` (height) | 44px | 44px | 44px | 44px |

**Quy luật:**
- Chữ: nhân `--ui-scale` (14px → 15.4–18.2px)
- Spacing/kích thước box: **GIỮ NGUYÊN** (root KHÔNG phóng)
- Bố cục: không bị kéo giãn, user từ xa đọc được chữ to hơn
- **Trần 1.3** để chữ không tràn khỏi nút/chip/ô bảng cố định

---

## 3. Vì sao KHÔNG phóng bố cục — bài học phải giữ

Cách làm SAI đã bị loại: phóng `font-size` của `<html>`.

Tailwind v4 khai `--spacing` bằng **rem**, nên phóng gốc là phóng luôn mọi
`p-*`, `gap-*`, `h-*`, `w-*`. Ở hệ số 1.8, màn 1920px chỉ còn tương đương
1067px logic → bảng tràn, panel vỡ, hộp thoại chạy ra ngoài khung.

Vì thế cơ chế hiện tại **chỉ nhân riêng token chữ** qua `--ui-scale`, còn khung
giữ nguyên kích thước pixel.

⛔ Ba thứ KHÔNG được thêm lại (đều đã thử và đã bỏ):

| Đừng làm | Vì sao |
|---|---|
| `html { font-size: calc(16px * var(--ui-scale)) }` | Phóng cả spacing → vỡ bố cục |
| Hệ số > 1.3 | Khung không giãn, chữ to hơn nữa là tràn khỏi nút/chip/ô bảng |
| Phóng `barSize` / bán kính donut / kích thước icon theo `uiScale` | Khung cứng thì px cứng phải giữ nguyên |

## 4. ⛔ Checklist: thêm dashboard mới compatible TV

### Bắt buộc dùng `@/shared/charts`

| Nội dung | Từ | Nếu không = blocked |
|----------|-----|-------|
| Bậc mật độ (`ChartDensity`) | `@/shared/charts` (barrel) | Hardcode cỡ chữ → không scale |
| Helper `useChartMetrics()` — hệ số TV tự đọc từ `ChartScaleProvider` (gắn sẵn ở `AppProviders`) | `@/shared/charts` (barrel) | Không đo độ cao → kẹt bậc, chữ nhỏ |
| Helper token màu (`tokenVar`, `tokenVarAlpha`, `labelInt`, `fmt3`, …) | `@/shared/charts` (barrel) | Fork tức ngay = drift khi fix bug |
| Style theo bậc (`buildChartStyles`, `chartDensityFor`) | `@/shared/charts` (barrel) | Mỗi fork đông cứng ở một cỡ chữ |

### Form input & UI

- Dùng UI kit component (không fork)
- Dùng `text-{scale}-{weight}` font token (rem tự scale qua CSS var)
- KHÔNG `px` cứng cho kích thước UI (dùng Tailwind scale → rem → auto phụ `--ui-scale`)

---

## 5. TV mode hoạt động ra sao — con đường dòng chảy

```
User bật TV mode (URL ?display=tv hoặc trang Cài đặt)
  ↓
store.mode = 'tv' + persist
  ↓
<html> nhận class ".tv" (hoặc đọc store, ghi --ui-scale)
  ↓
CSS var --ui-scale: 1.1 + nâng font-weight (--fw-regular: 500, --fw-medium: 600)
  ↓
Typography nhân 1.1: calc(14px * 1.1 = 15.4px) ← tất cả font qua generated-font.css
  ↓
Layout padding ngoài của <main> ở AppShellLayout (nhường diện tích)
  ↓
Kết quả: chữ to hơn 10%, padding ngoài gọn, khung KHÔNG giãn → xem TV được, không vỡ
```

---

## 6. Phạm vi TV

TV mode là **công tắc toàn app**, không phải tính năng của riêng màn nào: bật lên
là mọi trang đều nhân cỡ chữ theo `--ui-scale`. Vì thế:

- ⛔ Mọi màn hình mới **mặc định nằm trong scope TV** — không có danh sách trắng.
- Màn nào có chart → BẮT BUỘC dùng `useChartMetrics` từ `@/shared/charts` (§4),
  nếu không thì chữ trong chart kẹt cỡ desktop trong khi phần còn lại đã to lên.
- Muốn ĐƯA MỘT MÀN RA NGOÀI scope (giữ cỡ cứng vì lý do bố cục) → phải ghi lý do
  vào PR **và** thêm một dòng vào bảng dưới. Bảng trống nghĩa là không có ngoại lệ.

| Màn / module ngoài scope | Lý do | Ngày |
|--------------------------|-------|------|
| _(chưa có)_ | — | — |

---

## 7. ⛔ Anti-patterns — BLOCK MERGE

| ❌ Sai | ✅ Đúng |
|-------|--------|
| `fontSize: 10` cứng, KHÔNG nhân `m.uiScale` | `Math.round(10 * m.uiScale)` — giữ nguyên số gốc, TV nhân thêm |
| Thay số đã tinh chỉnh tay bằng `m.axisTick` / `m.barLabel` | GIỮ số gốc (xem §Quy tắc nền — chữ đổi cỡ cả khi TẮT TV là hồi quy) |
| `scale` ngoài `UI_SCALE_VALUES` trong code | Chỉ `1.1 / 1.2 / 1.3`; mặc định `DEFAULT_TV_UI_SCALE` |
| `--ui-scale` set rải rác ở component | CHỈ `applyAppearance` ghi lên `<html>` — một chỗ duy nhất |
| `html { font-size: calc(...) }` ở TV | KHÔNG, sẽ phóng spacing → vỡ layout |
| Phép chia `height / uiScale` ở chart | KHÔNG, bỏ từ lâu — dùng height thực |
| Phóng `barSize / donutRadius` theo `uiScale` | KHÔNG, khung không giãn, px cứng vẫn px cứng |
| Tự viết lại helper màu / số của chart (`tokenVar`, `labelInt`…) | Import từ `@/shared/charts` |

---

## 8. Bật/tắt TV mode

### URL param
```
?display=tv&scale=1.2          // bật TV ở mức chữ ×1.2
```

`DisplayUrlSync` (`src/app/_providers/sync/`) giữ URL và store theo nhau:

1. Tới một location mới (mở trang, bấm link, **Back/Forward**) mà URL có
   `display` / `scale` hợp lệ → **URL thắng**, store đổi theo.
2. URL không mang hai param đó (lần mở đầu, link nội bộ) → giữ lựa chọn đang
   có (đã lưu ở localStorage).
3. Sau đó URL được viết lại cho khớp store: TV → `display=tv&scale=<mức>`
   (`scale` **luôn** đi kèm, kể cả mức mặc định, để link chia sẻ mở ra đúng mức
   chữ trên máy người nhận); chế độ thường → gỡ cả hai param.
4. Param rác (`?display=abc`) coi như không có.

Viết URL bằng `router.replace(…, { scroll: false })` của `@/core/i18n` (giữ tiền tố ngôn ngữ), **giữ nguyên** param nghiệp vụ (`search`, `page`,
`tab`…) và `hash` (App Router không có `location.state`).

Lúc khởi động, **trước lần vẽ đầu**, `appearanceInitScript()` (`domains/preferences/appearance-script.ts`, script đồng bộ trong `<head>` của root layout — không còn `index.html`)
đọc `?display` / `?scale` (thắng giá trị đã lưu) và đặt `class tv`, `--ui-scale`, `--lh-scale` lên `<html>` → mở link `?display=tv` không nháy từ giao diện thường sang TV. Script là bản JS thuần
của logic `applyAppearance` (có test chạy script rồi so kết quả) nên **sửa một bên phải sửa cả bên kia**. Sau hydrate `AppearanceSync` (chỉ ghi khi
`usePersistedStoresHydrated()`) và `DisplayUrlSync` (`readDisplayOverrides` + `applyDisplayOverrides`) giữ trạng thái đồng bộ.

### Trang Cài đặt (production)
- `src/app/_views/SettingsView.tsx` — chọn chế độ + mức scale (`parseUiScale` kiểm trước khi ghi)
- Ghi vào `useDisplayStore` (`mode`, `uiScale`) — persist qua zustand
- Ô chọn theme hiện theme ĐANG HIỂN THỊ (`useEffectiveTheme()`: TV → tối) và bị khoá khi TV bật

### Keyboard escape (backup)
```
Ctrl/Cmd + Alt + Shift + T  → TẮT TV mode
```
⚠️ Đây là **lối thoát một chiều**, KHÔNG phải toggle: `useTvEscapeHatch` chỉ gọi
`setMode('standard')` khi đang ở TV. Bật TV vẫn phải qua trang Cài đặt hoặc URL.
Hook bỏ qua phím khi con trỏ đang ở `<input>` / `<textarea>` / vùng
`contentEditable`, và so bằng `event.code === 'KeyT'` (vị trí phím vật lý) chứ
không so `event.key` — Option+T trên macOS sinh ra `†`.

---

## 9. Font weight ở TV

| Scale | Desktop | TV |
|-------|---------|-----|
| regular (no suffix) | 450 | 500 (nâng nửa bậc) |
| `-medium` | 500 | 600 (nâng nửa bậc) |
| `-semibold` | 600 | 600 (giữ) |
| `-bold` | 700 | 700 (giữ) |

Cơ chế: `.tv` class set `--fw-regular: 500`, `--fw-medium: 600` (`modes/tv.css`)
→ generated-font.css dùng `font-weight: var(--fw-*, fallback)` → TV tự động đậm hơn.

---

## 10. Cross-references

- Chart bậc mật độ (compact/base/large/xlarge) → `chart-conventions.md` (§1.5)
- Font token + rem mechanics → `font-system.md` (§Đơn vị: px → rem)
- Tailwind rem + breakpoint → `tailwind-conventions.md` (§Đơn vị: rem + media query)
- Shared chart infra → `reuse-first.md` (§Chart Infrastructure)
- Store config: `src/domains/preferences/display/display.constants.ts` (`UI_SCALE_VALUES`, `DEFAULT_TV_UI_SCALE`, `DISPLAY_STORAGE`)
- Layout component: `src/app/_layouts/AppShellLayout.tsx` — padding `<main>` theo chế độ hiển thị
  qua hằng `SHELL_GUTTER_X` / `SHELL_GUTTER_Y` (`shared/constants/layout.constants.ts`, variant `tv:`),
  không rẽ nhánh `isTv ? … : …`.
- Font generation: `scripts/generate-font.mjs` (rem × `--ui-scale` nhân)
- CSS var: `src/styles/modes/tv.css` (.tv class, `--fw-*`) · `src/styles/base/root-vars.css` (`--ui-scale`, `--lh-scale`)

---

## 11. Khi vi phạm — BLOCK MERGE

- Chart axis dùng `fontSize: 12` cứng, KHÔNG nhân `m.uiScale` → **block merge** (TV không to chữ được)
- Đổi cỡ chữ/kích thước đã có sang thang chung `m.scale.*` → **revert** (đổi cả khi TẮT TV)
- Dùng scale ngoài `UI_SCALE_VALUES` → **revert**
- Phóng root font-size cho TV (HTML { font-size: calc(...) }) → **block merge** (vỡ layout)
- Phép chia `height / uiScale` trong useChartMetrics → **revert** (bỏ cơ chế cũ)
- Tự viết lại helper chart (`tokenVar`, `labelInt`…) thay `@/shared/charts` → **revert**
- `p-4` / `p-6` ở page outer khi TV mode (padding quá to) → fail review
