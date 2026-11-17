# Ghi chú code — domains (`src/domains/`)

> Lý do thiết kế KHÔNG hiển nhiên của `src/domains/`, tách khỏi code theo
> `comment-policy.md §3`. Mỗi mục ≤ 6 gạch; chỉ ghi điều code không tự nói và rule
> chung chưa có.

## session — bố cục

- **`model/` = dữ liệu + luật, `lifecycle/` = hành vi theo thời gian, `api/` = gọi BE.** Schema nằm ở `model/` vì
  nó định nghĩa hình dạng phiên cho CẢ BE lẫn hồ sơ đã lưu, không chỉ cho lời gọi API.
- **Barrel chỉ xuất thứ app / feature dùng.** `sessionApi`, `refreshSession`, `hasPermission`, `clearSession` cố ý
  không xuất: gọi `sessionApi.refresh()` từ ngoài là vòng qua single-flight + epoch; test import sâu.

## session — mô hình

- **JWT, đơn tenant, RBAC phẳng.** Cố ý không có tổ chức / dự án; cần thì thêm domain riêng.
- **Access token chỉ nằm trong bộ nhớ** (`accessToken`). Refresh token ở cookie HttpOnly do BE đặt. Để token
  trong localStorage là mở cửa cho XSS lấy trọn phiên — `partialize` chỉ giữ `user`.
- **`status` không persist.** Khôi phục `authenticated` từ ổ đĩa khiến guard cho qua khi chưa có token.
- **Hồ sơ đọc từ localStorage được kiểm lại ở CẢ `merge` lẫn `migrate`** (`sanitizeSessionState`): dữ liệu sai
  hình dạng làm `user.roles.includes` nổ ngay khung hình đầu. Đổi khoá lưu là đăng xuất mọi người.
- **Guard nhìn `status`, không nhìn `exp` của token.** Token hết hạn là chuyện thường và được chữa bằng refresh
  khi 401; coi nó là "chưa đăng nhập" thì người dùng bị đá về `/login` dù cookie còn sống.
- **Refresh trả cả hồ sơ, không chỉ token:** sau F5 bộ nhớ trống, một lượt refresh dựng lại toàn bộ phiên.

## session — session.lifecycle

- **Một đường refresh**: khởi động, interceptor 401 và tín hiệu từ tab khác đều qua `refreshSession()` — hai đường
  riêng thì lệch luật (F5 lúc backend trả 503 bị coi là "chưa đăng nhập").
- **`RefreshOutcome` ba nhánh, không gộp thành boolean**: chỉ 400/401/403 là `unauthenticated`; mất mạng, 5xx, 429,
  payload sai là `unavailable` và GIỮ phiên. Kết quả cũ (`STALE_OUTCOME`) cũng là `unavailable`.
- **`startNewEpoch` vô hiệu kết quả cũ** mỗi lần phiên xác lập / kết thúc, không thì token người vừa đăng xuất tự
  quay lại. `logout()` chụp `sessionIdentity()` nên phiên B chen vào lúc chờ BE không bị xoá.
- **Web Locks chỉ là tối ưu hoá đa tab.** Không có / bị từ chối (iframe sandbox) thì refresh chạy thẳng, đúng
  một lần; khoá từ chối SAU khi refresh đã chạy thì giữ kết quả đó, không refresh lại.
- **`onSessionEnd` — MỘT sự kiện cho mọi lần "dữ liệu theo tài khoản hết hợp lệ"** (`logout` · `expired` · `remote` ·
  `switched`); `switched` bắn cả với hồ sơ khôi phục từ localStorage — dọn thừa vô hại, sót là lộ dữ liệu.
- **`endReason`** ghi lý do phiên đang sống vừa kết thúc (không persist) để `AuthGuard` bỏ đích quay lại khi
  người dùng đăng xuất CHỦ ĐỘNG. `restoreSession` idempotent (chỉ từ `idle` / `unavailable`), luôn thoát `restoring`.

## session — session.sync

- **File chỉ là đường truyền**, không đụng store; phản ứng nằm ở `startSessionSync()`. Tách vậy để
  `session.lifecycle` import được nó mà không tạo vòng.
- **Tín hiệu không mang token hay hồ sơ.** Tab nhận tự hỏi máy chủ bằng cookie.
- **`login` từ tab khác → refresh ngay**, kể cả khi tab này đang có phiên: cookie giờ có thể thuộc tài khoản
  khác (→ `switched`). Lượt refresh đó lỗi thì chỉ `console.error`, state giữ nguyên.
- **`expired` KHÔNG phát cho tab khác**: phiên chết thật thì tab nào refresh cũng tự nhận 401; phát một lần từ chối
  "giả" (hai tab cùng gửi cookie vừa xoay vòng) là đăng xuất luôn tab đang giữ phiên mới hợp lệ.
- **Chỉ `{ type: 'login' }` / `{ type: 'logout' }` (`isSessionSignal`) có nghĩa** — kênh là của cả origin; tin lạ
  mà coi là `logout` thì đăng xuất người dùng. **Phát lỗi → đóng kênh hỏng và mở lại ngay**, subscription gắn sang.

## session — quyền

- **Một luật: `canAccess(user, permissions)`** — guard, menu và `usePermission` cùng gọi. Kiểm đăng nhập tắt
  (demo) thì mở hết. `usePermission` mà tự gọi `hasPermission` thì trả `false` ở demo và ẩn mọi nút theo quyền.
- **`hasPermission(user, permission)` là hàm thuần, KHÔNG xét demo**; chuỗi `"resource:action"` chỉ dựng ở
  `permissionKey`. `usePermission` subscribe vào KẾT QUẢ (boolean) để quyền bị thu hồi làm component render lại.
- **Từ vựng:** một quyền = `permission` (`RoutePermission`), danh sách cộng dồn từ phân hệ xuống trang = `permissions`.
- **Kiểm quyền ở FE chỉ ẩn/hiện giao diện.** Quyền thật do BE kiểm trên từng API.

## session — api

- **Refresh, logout đều bật `skipAuthRefresh`.** 401 của refresh nghĩa là "không có phiên" (refresh
  gọi refresh là vòng lặp); 401 của logout mà đi refresh thì dựng lại đúng phiên đang muốn bỏ.
- **Refresh có timeout riêng (10 giây).** LB nhận kết nối rồi im thì mọi request đang chờ sau lượt
  refresh treo tới lúc socket chết.
- **Payload sai schema là `unavailable`, không phải "hết phiên".** BE dùng tên trường khác thì đổi ở
  `model/session.schema.ts` bằng `.transform()`.

## preferences

- **Là domain chứ không ở `app`** vì feature cũng đọc (biểu đồ cần `uiScale`) mà feature không được import ngược
  lên `app`. `shared/*` không đọc store của domain — nhận qua props (`widget-composition.md §10`).
- **Mỗi slice một bộ file theo vai trò** (`theme.store` · `.types` · `.constants` · `.selectors` · `.utils`),
  không `index.ts` con; barrel gốc xuất đặt tên. `useEffectiveTheme` nằm ở gốc vì đọc cả hai slice.
- **Lựa chọn đã lưu ≠ giá trị đang hiển thị.** TV ép tối (`resolveEffectiveTheme` / `useEffectiveTheme`) và
  scale chỉ có hiệu lực ở TV (`selectEffectiveUiScale`) — nơi vẽ đọc bản "hiệu lực", nơi ghi đọc bản đã lưu.

## preferences — display

- **Mặc định TV là mức thấp nhất (1.1), cố ý.** Chữ to thêm là thứ nhận ra ngay; chữ tràn khỏi ô thì phải
  cuộn hết màn mới thấy. Để user tự nâng lên khi cần an toàn hơn là mặc định cao rồi họ gặp lỗi hiển thị trước.
- **Hai kiểu scale:** `TvUiScale` (1.1 / 1.2 / 1.3 — store, URL) và `EffectiveUiScale` (`1 | TvUiScale` — selector).
  Gộp làm một kiểu `1 | …` thì `setUiScale(1)` qua được tsc dù sanitiser lẫn UI không bao giờ nhận `1`.
- **Dữ liệu đã lưu là đầu vào KHÔNG tin cậy**: zustand chỉ gọi `migrate` khi `version` đổi, cùng version thì trộn
  thẳng JSON (`uiScale: 99` lọt tới `--ui-scale`) — nên `sanitizeDisplayState` chạy trong cả `merge` lẫn `migrate`.
- **Chuỗi không phải JSON làm `getItem` ném**: zustand nuốt lỗi, `merge` không được gọi, store giữ state hiện có
  (mặc định lúc khởi động) — nên sanitiser chỉ phải lo JSON hợp lệ nhưng sai hình dạng.
- **Định dạng URL (`?display=` / `?scale=`) chỉ ở `display.utils.ts`**: đọc (`readDisplayOverrides`) và viết
  (`nextDisplaySearch`) cạnh nhau; `applyDisplayOverrides` ghi `mode` + `uiScale` MỘT lần, không khung hình nửa vời.

## preferences — theme

- **Cùng cơ chế: `sanitizeThemeState` trong `merge` + `migrate`**: `light` / `dark` hợp lệ được giữ, chỉ giá trị lạ
  về dark — tăng `version` không được đưa theme của mọi người về mặc định.
- **Mặc định nằm ở `theme.constants.ts`**, không ở file store, để `theme.utils.ts` import được mà không tạo vòng.
