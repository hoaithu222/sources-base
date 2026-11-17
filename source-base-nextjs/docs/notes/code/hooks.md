# Ghi chú code — hooks (`src/shared/hooks/`)

> Lý do thiết kế KHÔNG hiển nhiên của hook dùng chung, tách khỏi code theo `comment-policy.md §3`. Mỗi mục ≤ 6 gạch.
> Cách gọi từng hook nằm ở JSDoc trên hook; quy ước chung ở `ime-safe-input.md`, `keyboard-navigation.md`, `navigable-controls.md`.

## useBeforeUnload

- **`e.returnValue = ''` là bắt buộc**: thiếu dòng này Chrome/Firefox không hiện hộp thoại xác nhận —
  `preventDefault()` một mình không đủ.

## Nhóm hook

- **Gom theo việc hook làm, không theo nơi dùng** (`state/` · `timing/` · `url/` · `dom/` · `browser/` · `input/` ·
  `table/`): `useExpandToViewport` ở `dom/` dù hay dùng cho bảng — nó không biết gì về bảng.
- **Trạng thái danh sách (lọc / tìm / trang) CHỈ có `useQueryParams`** (+ `useDebounce` cho ô tìm): hook giữ chúng
  trong `useState` là trái luật "filter/page/search lên URL" (`api-patterns.md`) — đừng thêm.

## useCopyToClipboard

- **Bộ đếm giữ trong ref, huỷ bộ đếm cũ khi bắt đầu lần chép mới; effect dọn lúc unmount.** Hạn chế đã biết (bộ
  đếm hẹn SAU `await writeText` nên hai lần chép chồng nhau vẫn tắt cờ sớm): `docs/known-issues.md`.

## useElementSize

- **Callback ref, không phải `useRef` + effect deps rỗng**: element render có điều kiện (`isLoading ? … : <div ref/>`)
  làm effect chạy khi `ref.current` còn `null` → observer không bao giờ được tạo, size kẹt `{0, 0}`.
- **`useLayoutEffect` + đo đồng bộ khi gắn node**: ResizeObserver chỉ trả kết quả ở nhịp sau, nếu chỉ chờ nó thì
  luôn có ≥ 1 frame consumer vẽ bằng size fallback (chart nháy to rồi co lại).
- **Đo theo content box (trừ padding)** để khớp `entry.contentRect`, không thì lần đo đồng bộ và lần của observer lệch
  đúng bằng padding → resize nhảy. Thay đổi < 1px bị bỏ qua (sai số làm tròn).

## useFullscreen

- **Fullscreen API thay vì `fixed inset-0`**: trình duyệt nhấc element ra khỏi luồng layout nên không bị `clip-path` /
  `overflow` của cha cắt. Đổi lại, mọi portal nằm ngoài element fullscreen sẽ biến mất (so `useExpandToViewport`).

## useKeyboardShortcut (và `useSaveShortcut` / `useTvEscapeHatch`; `useCommandPaletteShortcut` ở `shared/widgets/command-palette`)

- **MỘT luật cho mọi phím tắt**: mỗi hook tự viết (khớp `code` hay `key`, nghe ở đâu, có bỏ qua ô nhập không) thì
  cùng một tổ hợp hành xử khác nhau. Hook chuyên dụng chỉ là lớp bọc khai tổ hợp.
- **Nhận diện bằng `code` (vị trí phím), không phải `key` (ký tự sinh ra)**: bộ gõ tiếng Việt đang bật thì `key`
  có thể là `'Process'`/`'Unidentified'` và phím tắt im lặng không chạy. Vẫn dò thêm `key` cho bàn phím lạ không phát `code`.
- **Khớp ĐÚNG tổ hợp**: có thêm Alt/Shift là tổ hợp khác (vd Ctrl+Shift+S "lưu thành…") — trả lại cho hệ thống.
- **Ctrl/⌘ + phím nghe ở pha CAPTURE**: bắt trước mọi `stopPropagation()` trong modal / bảng / popup. Ctrl+S và
  Ctrl+K KHÔNG bỏ qua ô nhập (phản xạ "lưu tất" / "tìm nhanh"); thoát TV thì có (`ignoreWhileTyping`).
- **`useSaveShortcut` nuốt phím kể cả khi `canSave=false`** (hộp thoại "Lưu trang" vô nghĩa với SPA) nên tách
  `enabled` (có bind) khỏi `canSave` (có gọi `onSave`).

## useCountUp

- **Lần đầu chạy từ 0, các lần sau từ giá trị TRƯỚC**: luôn từ 0 thì mỗi lần polling `1.235 → 1.236` con số rơi
  về 0 rồi bò lên — đọc ra như dữ liệu vừa mất rồi có lại.
- **`prefers-reduced-motion` ⇒ nhảy thẳng tới đích, không phải chạy nhanh hơn**: người rối loạn tiền đình bị chóng
  mặt thật vì chuyển động không mong muốn. `disabled` cho số trong bảng dài / ô đang sửa, nơi chuyển động là nhiễu.
- **rAF thay vì `setInterval`**: rAF tự dừng khi tab ẩn nên bảng điều khiển mở nền cả ngày không đốt CPU;
  `setInterval` vẫn chạy và vẫn `setState`.
- **`easeOutCubic`**: dành phần lớn thời gian ở GẦN giá trị cuối nên đọc ra cỡ số ngay; tuyến tính thì nửa thời
  lượng đầu số còn sai một nửa.
- **`displayRef` chỉ ghi trong effect / rAF, không ghi lúc render** (`react-hooks/refs`): chế độ đồng thời có thể
  render rồi VỨT, lần bị vứt đã đổi ref → animation sau xuất phát từ giá trị chưa từng hiện lên màn hình.
- **Khung cuối gán đúng `target`**, không phải kết quả nội suy: sai số dấu phẩy động để lại "1.234,999…" đứng vĩnh viễn.

## useEventCallback

- **Generic ràng buộc theo KIỂU HÀM** (`T extends (...args: never[]) => unknown`), không theo tuple tham số: TS suy
  luận đúng kiểu tham số cho callback nhiều đối số có giá trị mặc định (tránh param bị `unknown`).
- **Ghi `ref.current` trong `useLayoutEffect` (sau commit)**, không ghi lúc render — vi phạm `react-hooks/refs`.

## useLatestRequest

- **Bộ đếm tăng dần, không phải cờ `cancelled` theo từng effect**: `begin()` tăng bộ đếm nên MỌI lượt trước tự hết hiệu lực;
  dùng chung cho debounce (kiểm tra) và handler (đổi cấp cha) mà không cần effect cleanup riêng.
- **`invalidate()` chỉ tăng bộ đếm, không huỷ request thật**: API vẫn chạy tới cùng, kết quả bị bỏ. Muốn huỷ thật thì
  truyền `signal` (`api-patterns.md`) — hook này dành cho chỗ không đi qua TanStack Query.
- **`alive` đặt lại `true` ở đầu effect**: StrictMode giả lập unmount → mount, cleanup đã hạ cờ; không đặt lại thì mọi
  lượt sau đó bị coi là đã gỡ. `begin()` gọi SAU unmount (timer lọt lưới) trả checker luôn `false`.
- **Kiểm `isCurrent()` SAU mỗi `await` và TRƯỚC mọi `setState`**, kể cả nhánh lỗi: lượt cũ thất bại vẫn không được
  tắt cờ "đang tải" của lượt mới.

## useLocalStorage

- **Giá trị mới tính NGOÀI updater của `setState`, từ ref `latest`; `setItem` chạy đúng một lần mỗi `setValue`.** Updater
  phải thuần (StrictMode gọi hai lần); ref gán ngay trong `setValue` nên hai `setValue(v => v + 1)` cùng tick vẫn cộng dồn.
- **Đổi `key` được nhận ra ngay lúc render**: state giữ `{ key, value }`, lệch key thì đọc lại kho và `setState` tại chỗ.
  `useState` chỉ khởi tạo một lần nên bản cũ giữ giá trị của khoá trước; làm bằng effect thì có một khung hình hiện nó.
- **`setValue` / `removeValue` gắn với `key` của lần render đó**; `initialValue` đọc qua ref nên literal mới không đổi
  danh tính chúng. Cùng giá trị thì trả lại `prev` — không thì effect gọi `setValue(x)` lặp vô hạn.
- **`parse` chỉ chạy lúc ĐỌC kho** (mount / đổi key); trả `undefined` = sai kiểu → `initialValue` (để `null` vẫn hợp
  lệ). Không truyền `parse` thì JSON bị ép kiểu `T` không kiểm.
- **Đọc / ghi qua `safeStorage`** (`utils/browser/storage.utils.ts`): `setItem` ném khi đầy hoặc ở Safari riêng tư —
  không bắt thì lỗi bay lên tận component; giá trị trong bộ nhớ vẫn đổi.
- **Cố ý không đồng bộ giữa các tab** (không nghe `storage` event): cần thì dùng `useMultiTabSync`.

## useQueryParams

- **Số trên URL đọc chặt (`/^\d+$/` + số nguyên an toàn)**: URL là thứ người khác gửi tới, `parseInt('12abc')` ra 12.
  Chỉ ĐỌC được kiểm — `setPage(-3)` vẫn ghi `?page=-3` rồi đọc ra trang 1.
- **`pageSize` vượt trần `maxPageSize` → `defaultPageSize`**, không kẹp về trần: `?pageSize=99999999` không được chảy
  vào lời gọi API. Trần ≥ mọi mức của `PAGE_SIZE_OPTIONS`.
- **`clearParams()` chỉ xoá param hook SỞ HỮU** (page / pageSize / search / tab + `paramKeys`): URL còn là của
  `DisplayUrlSync` và bộ lọc chỗ khác. Filter riêng của màn hình phải khai trong `paramKeys` mới bị xoá.
- **`clearParams` qua `useEventCallback`**: danh tính ổn định dù `paramKeys` là mảng literal mới mỗi render, vẫn dùng key mới nhất.
- **Luật "rỗng / `null` thì xoá key" nằm MỘT chỗ** (`applyParamUpdates`, `url/query-params.utils.ts`), dùng chung với
  `useNavHref` — href của tab và URL sau `updateParams` không thể lệch nhau.

## useQueryParams · useNavHref — trên Next

- **Đọc bằng `useSearchParams` (`next/navigation`) nên trang PHẢI bọc `<Suspense>`** ở `page.tsx`: không thì Next không prerender được route và cả trang mất SSG (`routing-conventions.md §7`).
- **Ghi bằng `router.replace` của `@/core/i18n`** (không thêm mục lịch sử, giữ tiền tố ngôn ngữ) — `router.push` mỗi lần gõ tìm kiếm làm nút Back kẹt trong các bước lọc; `useRouteScrollRestoration` giữ vị trí cuộn khi chỉ đổi `?search`.
- **`useNavHref` dựng href THẬT** (`${pathname}?…`, `pathname` không tiền tố ngôn ngữ để `<Link>` tự thêm) — tab có `href` thì Ctrl+click mở tab mới được; tự nối chuỗi ở nơi gọi là xoá mọi param lọc khác.

## useClearRowSelectionOnOutsideClick

- **Nghe ở `document`, không chỉ trong ruột bảng**: vị trí đẻ dòng mới của "Thêm nhóm" đọc dòng đang chọn nên phải
  bỏ chọn được mới thêm nhóm ở cấp GỐC; bảng dài kín màn hình thì trong bảng không còn nền trống nào để bấm.
- **`mousedown` (không phải `click`)** để bỏ chọn xong trước khi tiêu điểm đổi chỗ.
- **Có dialog mở thì treo luật** (`OPEN_DIALOG_SELECTOR`, `constants/dom.constants.ts`): lớp phủ Radix không khớp
  selector nào, bấm nó để đóng modal sẽ bị hiểu nhầm thành "bỏ chọn". Target đã rời DOM (dòng vừa xoá) cũng bỏ qua.

## useExpandToViewport

- **Không unmount / di chuyển node (không portal, không `requestFullscreen()` trên node khác)**: canvas WebGL của
  viewer 3D và state tốn kém khác (ReactFlow, chart…) giữ nguyên context, không phải tải lại.
- **Modal Radix portal xuống `document.body` với `z-50`, sau khối layout trong DOM** → vẫn hiện ĐÈ lên lớp phóng
  to; Fullscreen API thì ngược lại (portal ngoài element fullscreen biến mất).
- **`<main>` của `AppShellLayout` là `relative z-10` còn `<Header>` render `sticky={false}`** (không z-index) ⇒ lớp
  `fixed` trong `<main>` phủ trọn header + dock. Ancestor có `transform` / `filter` / `will-change` làm `fixed` neo sai.
- **Esc thu nhỏ nhưng NHƯỜNG cho dialog đang mở** (`OPEN_DIALOG_SELECTOR`; Esc của dialog là đóng dialog); sau đó
  `blur()` để focus-ring không bám lại trên nút toggle. Esc đi qua `useKeyboardShortcut` (khớp đúng Esc trơn).
- **Bắn event `resize` sau khi layout vẽ xong**: container đổi kích thước mà window không resize thì Splitter,
  Recharts, ReactFlow và canvas viewer không tự đo lại.

## useMediaQuery

- **Đọc `matchMedia` ngay trong lazy initializer**: khởi tạo cứng `false` thì khung đầu luôn là nhánh desktop rồi effect mới
  sửa — máy tính bảng nháy qua bố cục sai một frame (cùng loại nháy `useElementSize` tránh bằng `useLayoutEffect`).
- **Vẫn phải phòng `matchMedia` không tồn tại**: môi trường kiểm thử và render phía máy chủ đều không có nó (server luôn trả `false`).
- **Cây CÓ SSR không được rẽ cấu trúc JSX theo hook này**: lúc hydrate, lazy initializer ở trình duyệt trả giá trị THẬT còn HTML server là `false` → lệch hydration. Chỉ dùng trong cây chỉ dựng ở client
  (vùng làm việc sau `AuthGate` ở chế độ `app` — server chỉ dựng màn chờ, nên `AppShellLayout` chọn Header / top bar theo `useIsPhone()` an toàn; chế độ demo gate `open` thì server dựng luôn khung); trang công khai / trang khách đổi class bằng biến thể CSS `phone:` / `touch:`.
- **Không tự gõ query bề rộng ở nơi dùng**: chuỗi lệch CSS một chữ là JS và CSS nói hai chuyện. Chỉ có preset đã đặt
  tên ở mục dưới (mỗi preset có biến thể CSS cùng điều kiện) và `usePrefersReducedMotion`; preset mới phải kèm biến thể CSS.

## useIsPhone · useIsBelowWide · useIsCoarsePointer

- **Mỗi preset = bản JS của MỘT biến thể CSS** (`phone:` · `max-wide:` · `touch:`): chuỗi query nằm một chỗ ở
  `constants/media-query.constants.ts`, bài kiểm `policy/display/responsive-foundation` buộc khớp từng chữ với `variants.css`.
- **Chỉ dùng khi CẤU TRÚC JSX phải khác** (Modal → bottom-sheet, gom bộ lọc, bỏ cột): đổi class thì viết `phone:` /
  `max-wide:` / `touch:` — CSS không nháy khung đầu và không cần render lại.
- **`useIsPhone` là chuyện KÍCH THƯỚC, `useIsCoarsePointer` là chuyện NGÓN TAY**: iPad dọc 768+ cắm chuột không phải
  điện thoại và có con trỏ; iPad mini dọc (744) là `phone` nhưng vẫn chạm. Hỏi đúng câu, đừng dùng cái này thay cái kia.
- **`useIsBelowWide` = < 1800px** (laptop 14" / 16", tablet, điện thoại); màn ngoài và TV trả `false`. Giữ cỡ gốc ở `wide`.

## useMultiTabSync

- **`handler` đi qua `useEventCallback`**: identity ổn định nên effect chỉ chạy lại khi ĐỔI kênh (không đóng/mở `BroadcastChannel`
  mỗi render) mà vẫn gọi bản `handler` mới nhất; ghi thẳng vào ref lúc render bị `react-hooks/refs` cấm.
- **Fallback `storage` event: người gửi ghi rồi xoá ngay khoá `app:sync:<kênh>`** để chỉ phát sự kiện, không để dữ liệu nằm lại;
  bên nhận bỏ qua sự kiện xoá (`newValue == null`).

## useTvEscapeHatch

- **Nhận callback, không đọc `@/domains/preferences`**: `shared/` biết tới `domains/` thì kéo cả cây store vào test, showcase và
  dự án có store khác (cùng lý do với `ThemeToggle`, `notes/components/actions.md`); `AppShellLayout` nối vào store.
- **`preventDefault()` vô điều kiện, kể cả khi TV đang tắt**: tổ hợp không có hành vi mặc định nào của trình duyệt cần giữ;
  chặn nhất quán (idempotent) để tránh side-effect lạ.
- **Callback đi qua `useEventCallback` (trong `useKeyboardShortcut`)**: đưa thẳng vào deps thì mỗi lần cha render lại gỡ
  rồi gắn lại listener — tốn vô ích và có kẽ hở giữa hai lần gắn.
