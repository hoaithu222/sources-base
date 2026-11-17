# State Management — Zustand store (`src/domains/`)

> State CẤP APP (phiên đăng nhập, theme, display mode) dùng Zustand, mỗi store
> thuộc một domain trong `src/domains/`. State CẤP SERVER (dữ liệu từ API) dùng TanStack Query — xem
> `api-patterns.md`. State CẤP FORM dùng react-hook-form — xem
> `form-validation.md`. Đừng lẫn 3 loại này vào 1 chỗ.

## Khi nào Zustand, khi nào KHÔNG

| Loại state | Dùng gì |
|---|---|
| Dữ liệu từ server (list, detail, mutation) | TanStack Query — KHÔNG copy vào Zustand store |
| Auth/session, theme, display mode (state toàn app, nhiều nơi đọc) | Zustand slice |
| Filter/search/pagination/tab của 1 trang | URL qua `useQueryParams()` — KHÔNG Zustand, KHÔNG `useState` |
| State chỉ 1 component/2-3 component con dùng | `useState` cục bộ tại component cha gần nhất — KHÔNG "lỡ tay" đẩy lên Zustand global |

## Store nằm ở đâu — `src/domains/{domain}/`

Store KHÔNG nằm ở `app/`: feature cũng cần đọc chúng mà feature không được
import ngược lên `app` (xem "Chiều phụ thuộc" trong README).

| Domain | Store | Ghi chú |
|---|---|---|
| `@/domains/session` | `useSessionStore` | Chỉ chứa DỮ LIỆU. Mọi chuyển trạng thái đi qua hàm vòng đời (`establishSession`, `logout`, `restoreSession`…) — ⛔ không `setState` từ bên ngoài |
| `@/domains/preferences` | `useThemeStore`, `useDisplayStore` | Store + action đơn giản, theo mẫu dưới đây |

Mỗi store là một bộ file đặt tên theo vai trò (`folder-structure.md`), không `index.ts` con, không
tên trần (`types.ts`, `selectors.ts`):

```
domains/preferences/{slice}/        (session: domains/session/model/, tiền tố `session.`)
  {slice}.store.ts       # use{Slice}Store — create() (+ persist nếu cần), action viết trong create()
  {slice}.types.ts       # {Slice}State (dữ liệu) + {Slice}StoreType (state + action)
  {slice}.constants.ts   # {SLICE}_INITIAL_STATE · {SLICE}_STORAGE = { key, version }
  {slice}.selectors.ts   # select* — derived value, tính 1 lần, không lặp logic ở nơi gọi
  {slice}.utils.ts       # sanitize{Slice}State · parse* — hàm thuần kiểm dữ liệu không tin cậy
```

Import LUÔN qua index của domain (`@/domains/preferences`, `@/domains/session`),
KHÔNG import sâu vào bên trong — ESLint chặn. Barrel xuất ĐẶT TÊN, chỉ thứ bên ngoài dùng.

⛔ `shared/ui`, `shared/widgets`, `shared/charts` KHÔNG đọc store của domain hay feature: chúng nhận giá
trị qua props. Nơi nối store với widget là `src/app/_shell/`. Ngoại lệ DUY NHẤT: store CỤC BỘ của một
widget (`{x}.store.ts` trong folder widget) — chỉ giữ trạng thái giao diện của chính widget đó hoặc làm
cầu nối hai cây component, không đọc store widget khác (`widget-composition.md` §10).

Khi nào tạo domain mới: khi có dữ liệu mà TỪ HAI feature trở lên cùng dùng.
Chỉ một feature dùng thì để trong feature đó.

## Selector — tính derived value 1 chỗ, đừng lặp logic ở nơi gọi

```ts
// display.selectors.ts — nhận `DisplayState` (dữ liệu), dùng được cả với `getState()` lẫn object thường
export const selectIsTv = (state: DisplayState) => state.mode === 'tv';

export const selectEffectiveUiScale = (state: DisplayState): EffectiveUiScale =>
  state.mode === 'tv' ? state.uiScale : 1;
```

Giá trị "đang hiển thị" khác giá trị "đã lưu" thì có hàm / hook riêng ở domain, nơi gọi không tự suy:
`useEffectiveTheme()` (TV ép tối), `selectEffectiveUiScale` (scale chỉ có hiệu lực ở TV).

Ví dụ thật: `selectEffectiveUiScale` luôn trả `1` ở chế độ standard dù store
còn nhớ `uiScale` cũ đã chọn khi ở TV — **mọi nơi cần nhân cỡ chữ (chart
metrics...) PHẢI dùng selector này**, KHÔNG đọc thẳng `state.uiScale` (xem
`chart-conventions.md`). Đây là lý do có tầng selector: logic "khi nào áp
dụng scale" chỉ viết đúng 1 lần.

## `persist` middleware — khai `partialize` + `version`/`migrate` khi đổi shape

```ts
// theme.constants.ts — khoá có tiền tố `next-base:` (đổi tên dự án thì đổi tiền tố MỘT lần, kèm migrate nếu cần giữ dữ liệu)
export const THEME_STORAGE = { key: 'next-base:theme', version: 1 } as const;

// theme.store.ts
export const useThemeStore = create<ThemeStoreType>()(
  persist(
    (set, get) => ({ ...THEME_INITIAL_STATE, setTheme: ..., toggleTheme: ... }),
    {
      name: THEME_STORAGE.key,
      version: THEME_STORAGE.version,
      storage: createSafeJSONStorage(), // `@/shared/utils/browser/storage.utils` — localStorage hỏng không làm `set()` ném
      skipHydration: true, // ⛔ BẮT BUỘC với store persist — xem "SSR + persist" bên dưới
      migrate: sanitizeThemeState, // đổi version: nắn dữ liệu cũ, GIỮ phần còn hợp lệ
      merge: (persisted, current) => ({ ...current, ...sanitizeThemeState(persisted) }), // MỖI lần rehydrate
      partialize: (state) => ({ theme: state.theme, accent: state.accent }), // CHỈ field cần lưu, không cả action
    },
  ),
);

registerPersistedStore(useThemeStore); // ⛔ BẮT BUỘC đi kèm `skipHydration` — không đăng ký thì store KHÔNG BAO GIỜ nạp lại
```

### SSR + `persist`: `skipHydration` + `registerPersistedStore` (BẮT BUỘC cho mọi store persist)

**Vấn đề.** Mặc định zustand `persist` đọc localStorage NGAY lúc tạo store. Server không có localStorage nên HTML server được dựng từ state
MẶC ĐỊNH, còn lần render đầu ở trình duyệt lại dựng từ state ĐÃ LƯU → hai bên khác nhau → lỗi hydration ("Text content does not match",
class lệch, nháy giao diện).

**Cách làm của base:**

1. Store khai `skipHydration: true` → lúc tạo store KHÔNG đọc localStorage; lần render đầu ở trình duyệt khớp HTML server.
2. Store gọi `registerPersistedStore(useXxxStore)` (`@/shared/utils/browser/storage.utils`) ngay dưới `create(...)`.
3. `StoreHydration` (`app/_providers`, gắn ở `BaseProviders` ở root layout) gọi `rehydratePersistedStores()` MỘT lần sau hydrate
   (`useLayoutEffect`, đứng đầu cây provider nên chạy trước effect của cây con). State thật vào ngay sau đó.
4. Code chỉ được hành động theo state ĐÃ LƯU (ghi đè giao diện, redirect theo phiên) đọc `usePersistedStoresHydrated()` (`@/shared/hooks`)
   — `false` ở server và ở lần render đầu, `true` sau khi nạp xong.
5. Phần giao diện (theme, TV, màu nhấn, cỡ chữ) không chờ bước 3: script `appearanceInitScript()` (`domains/preferences/appearance-script.ts`) chạy
   đồng bộ trong `<head>`, đọc cùng khoá localStorage và áp lên `<html>` TRƯỚC lần vẽ đầu → không nháy sáng → tối.
   Vì vậy `THEME_STORAGE.key` / `DISPLAY_STORAGE.key` được CẢ store lẫn script đọc — đổi khoá là đổi cả hai (hằng dùng chung, không gõ lại chuỗi).

⛔ **Server Component KHÔNG import store.** Module-level store trên server là MỘT singleton dùng chung cho mọi request trong tiến trình —
state của người dùng này rò sang người dùng kia. Store chỉ sống ở Client Component; giá trị server cần (ngôn ngữ, giao diện ban đầu) đi
qua tham số route / `appearanceInitScript`, không qua store.

Store mới KHÔNG có `skipHydration` / `registerPersistedStore` → code review chặn: lỗi này chỉ lộ ở trình duyệt với localStorage đã có dữ liệu,
`tsc` / test jsdom không thấy.

`migrate` chỉ chạy khi `version` lệch — dữ liệu CÙNG version nhưng sai giá trị (sửa tay, bản cũ lỗi)
vẫn đi thẳng vào store. Vì vậy mỗi store persist có một hàm thuần `sanitizeXxxState(raw)` (chỉ nhận
field được phép, field sai về mặc định từng cái, bỏ field lạ, không ném) và dùng nó ở CẢ `merge` lẫn
`migrate` — `async-safety.md §6`, mẫu: `domains/preferences`, `domains/session` (hồ sơ kiểm bằng zod
schema). Khoá + version khai MỘT chỗ: `{SLICE}_STORAGE` trong `*.constants.ts`; đổi khoá đã phát hành
là mất dữ liệu của mọi người dùng (với phiên: đăng xuất họ) — chỉ tăng `version`.

`partialize` LUÔN khai rõ field nào được lưu — không mặc định lưu cả object
state (bao gồm cả function action, vô nghĩa khi serialize). Khi đổi shape
field đã persist (đổi enum, xoá field...) → tăng `version` + viết `migrate`
để state cũ trong `localStorage` của user không làm app crash lúc rehydrate.
Không phải slice nào cũng cần `persist` — chỉ dùng khi state cần sống qua
lần reload (theme, display mode, hồ sơ người dùng), KHÔNG dùng cho state auth nhạy cảm
(`accessToken` chỉ ở bộ nhớ, refresh token ở cookie HttpOnly — `useSessionStore` chỉ persist `user`,
xem `security-checklist.md §4`).

## Action — đặt trong cùng object `create()`, không tách file riêng

```ts
setTheme: (theme: ThemeMode) => set({ theme }),
toggleTheme: () => set({ theme: get().theme === 'light' ? 'dark' : 'light' }),
```

Action đơn giản viết trực tiếp trong `create()`. Chỉ tách hàm riêng ra ngoài
khi logic đủ phức tạp (gọi API, side-effect nhiều bước) — khi đó cân nhắc có
nên là TanStack Query mutation thay vì Zustand action hay không (đọc lại bảng
đầu file).

## Đọc store trong component — luôn qua selector, không lấy cả object

```tsx
// ✅ ĐÚNG — chỉ re-render khi đúng field này đổi
const isTv = useDisplayStore(selectIsTv);

// ❌ SAI — re-render mỗi khi BẤT KỲ field nào trong store đổi
const { mode } = useDisplayStore();

// ❌ SAI — viết tay lại logic mà selector đã có (`selectIsTv`, `selectThemeMode`)
const isTv = useDisplayStore((s) => s.mode) === 'tv';
```

Ghi từ dữ liệu ngoài (URL, ô nhập) thì qua hàm `parse*` / action của domain (`parseThemeMode`,
`applyDisplayOverrides`), không `useXxxStore.setState(...)` thô từ `app/` hay feature.

## Liên quan

`api-patterns.md` (server state, URL-synced filter) · `chart-conventions.md`
(ví dụ dùng `selectEffectiveUiScale` thật) · `tv-display-mode.md` (slice
`display` chi tiết) · `security-checklist.md` (token KHÔNG lưu Zustand/
localStorage).
