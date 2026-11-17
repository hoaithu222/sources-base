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
trị qua props. Nơi nối store với widget là `src/app/shell/`. Ngoại lệ DUY NHẤT: store CỤC BỘ của một
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
// theme.constants.ts
export const THEME_STORAGE = { key: 'theme-storage', version: 1 } as const;

// theme.store.ts
export const useThemeStore = create<ThemeStoreType>()(
  persist(
    (set, get) => ({ ...THEME_INITIAL_STATE, setTheme: ..., toggleTheme: ... }),
    {
      name: THEME_STORAGE.key,
      version: THEME_STORAGE.version,
      storage: createSafeJSONStorage(), // `@/shared/utils/browser/storage.utils` — localStorage hỏng không làm `set()` ném
      migrate: sanitizeThemeState, // đổi version: nắn dữ liệu cũ, GIỮ phần còn hợp lệ
      merge: (persisted, current) => ({ ...current, ...sanitizeThemeState(persisted) }), // MỖI lần rehydrate
      partialize: (state) => ({ theme: state.theme }), // CHỈ field cần lưu, không cả action
    },
  ),
);
```

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
