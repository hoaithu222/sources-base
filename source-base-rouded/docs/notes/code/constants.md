# Ghi chú code — constants (`src/shared/constants/`)

> Lý do thiết kế KHÔNG hiển nhiên của hằng dùng chung, tách khỏi code theo `comment-policy.md §3`.
> Cách DÙNG nằm ở khối hướng dẫn đầu mỗi file. Mỗi mục ≤ 6 gạch; chỉ ghi điều code không tự nói và
> rule chung chưa có.

## Tên file

- **Một file một nhóm hằng, hậu tố `.constants.ts`** (`app` · `pagination` · `layout` · `paths` · `dom` · `auth-motifs` ·
  `row-selection` · `media-query`): file gộp nhiều nhóm thì mở ra không đoán được nó chứa gì.
- **`APP_NAME` đọc `appConfig` qua `@/core/config`**, không với sâu vào file bên trong core.

## layout.constants.ts

- **Chiều cao VÙNG header hai bậc**: 56px (`h-14`) từ tablet tới laptop, 64px (`h-16`) từ `wide` ≥ 1800px = thanh NỔI 48 /
  56px + khe 8px phía trên (theme sáng); control 32 → 36px (`HEADER_CONTROL_HEIGHT` ở `header.theme.ts`). Hằng đo cả khe
  nên mọi phép "viewport − header" không phải cộng thêm 8px. Bỏ bậc `xl` của bản HUD; cỡ gốc gắn `wide`, không `3xl`.
- **KHÔNG có bậc `touch:` cho chiều cao thanh**: thanh dày hơn trên iPad đọc ra như giao diện bị phóng to và lấy
  chỗ của nội dung. Nút icon 32px vẫn bấm được nhờ vùng chạm `::after` trong suốt (`HEADER_ICON_BUTTON_CLASS`).
- **Bốn khoá `HEADER_HEIGHT_CLASS` là một bộ**: `belowHeader`, `contentMaxHeight`, `contentTopOffset` lệch
  khỏi `height` thì overlay bám dưới thanh rơi vào giữa nội dung và vùng cuộn hụt/thừa đúng phần chênh.
- **`contentMaxHeight` dùng `dvh` ở mọi bậc**, số trừ khớp từng bậc của `height`: Safari iPad tính `100vh` lớn hơn vùng nhìn thấy nên
  vùng cuộn thò xuống dưới thanh công cụ; ở máy tính `dvh` = `vh` nên không đổi pixel nào (`ipad-responsive.md §5`).
- **Điện thoại lề vỏ 8px** (`phone:px-2 phone:py-2` + `phone:pl/pr-[max(0.5rem,safe)]`, 2026-10-19): lề 16px + đệm thẻ 12–16px
  trên màn 390px làm nội dung hẹp, chữ phụ KPI bị cắt. 8px = khe giữa thẻ (`gap-2`) nên nhịp ngoài = nhịp trong. Top bar /
  thanh tab giữ đệm riêng 16px (là khung, không phải nội dung).
- **`SHELL_SAFE_INSET_X` ghép SAU `SHELL_GUTTER_X`** (`tv:px-2` vẫn thắng): lề `<main>` không hẹp hơn `--safe-l` / `--safe-r`
  (tai thỏ xoay ngang), laptop vẫn 16px. Chỗ chừa Dock ghim (`useDockReserveClass`) ghép sau cùng nên thắng cả hai.
- **`SHELL_GUTTER_X/Y` là MỘT hằng cho header lẫn `<main>`**: mỗi bên tự khai thì mép logo lệch mép nội dung. Đây là
  lề của VỎ; padding trong control tách riêng — mép hộp bấm được mới canh lưới (`spacing-system.md §3`).

## auth-motifs.constants.ts

- **Một mô-típ cho cả hai khoang của tấm thẻ** (giới thiệu và form): cùng hình dạng thì BẮT BUỘC cùng màu,
  bề dày, khe — mắt nhận ra "cùng một thứ" từ hình dạng rồi bị màu và khe phản lại, đọc ra là "rối".
- **Gốc màu thương hiệu (`primary-4` — dải xanh VCI) rồi mới sang teal**: gạch nhấn NỘI DUNG (tiêu đề), không phải khung HUD.
- **`TITLE_BAR_STYLE` và `TITLE_BAR_CLASS` đi cặp**: viền 2px + khe 16px = `pl-[18px]`.
- **Ở `shared`, file `.ts`**: `AuthBrandPanel` (`app`) và `AuthPageHeading` (`features/auth`) cùng dùng mà feature
  không import được `app`; để trong `.tsx` thì Fast Refresh mất state (`react-refresh/only-export-components`).
- **Ô thương hiệu `BRAND_MARK_*` là mô-típ thứ hai**: khoang thương hiệu (AuthLayout) và trang trạng thái cùng một ô vát +
  một icon; logo header nay là `AppTile` (cùng ngôn ngữ ô phân hệ ở Dock / launcher), giữ icon `layer-group-bold`.
- **Nền `primary-6` đặc + icon `neutral-0`, KHÔNG viền / bóng**: `clip-path` cắt mất `border` ở cạnh vát và xén
  luôn `box-shadow` (quầng không bao giờ hiện). Cỡ icon ép bằng `[&>svg]:size-*!` vì `SystemIcon` đặt cỡ inline.

## dom.constants.ts

- **`OPEN_DIALOG_SELECTOR` là MỘT hằng cho "đang có dialog mở"** (hook bảng, hook phóng viewport, picker, cây): mỗi
  nơi tự viết thì kẻ thiếu `data-state="open"`, kẻ quên `alertdialog`.
- **Có `data-state="open"`**: Radix giữ dialog trong DOM suốt animation đóng (`data-state="closed"`) — chỉ tính dialog
  đang MỞ thật. Popover của Radix cũng mang `role="dialog"` nên cũng được tính (picker trong popover vẫn đúng chỗ).

## media-query.constants.ts

- **Bản JS của biến thể CSS**: `PHONE_MEDIA_QUERY` ↔ `phone:` · `BELOW_WIDE_QUERY` ↔ `max-wide:` · `TOUCH_MEDIA_QUERY` ↔
  `touch:`. Đổi một bên mà quên bên kia thì JS và CSS nói hai chuyện — `policy/display/responsive-foundation` buộc khớp.
- **`PHONE_MEDIA_QUERY` có HAI vế** (dọc < 768px · xoay ngang cao ≤ 540px, rộng < 1024px): `matchMedia` hiểu dấu phẩy
  là "hoặc", còn CSS phải khai dạng khối `@slot`. Vế ngang cố ý chừa laptop thấp nhất (1280×600).
- **`BELOW_WIDE_QUERY` là `1799.98px`, không `1800px`**: `max-wide:` của Tailwind là `width < 1800px`; `max-width: 1800px`
  sẽ khớp cả đúng 1800 (màn ngoài ở cỡ gốc).

## row-selection.constants.ts

- **Ở `shared/`, không ở feature**: chép lại dễ thiếu một nhóm (portal Radix, `[role="dialog"]`) là bỏ chọn ngay lúc
  bấm vào dropdown đang mở, lỗi im lặng. Module mới import chứ không khai lại.
- **Bắt ở cấp `document`, không chỉ trong ruột bảng**: bảng dài kín màn hình thì không còn nền trống để
  bấm. Cơ chế nghe sự kiện: `notes/code/hooks.md` (`useClearRowSelectionOnOutsideClick`).
- **Bốn nhóm trong `KEEP_ROW_SELECTION_SELECTOR`**: dòng dữ liệu + header (`onRowClick`, kéo giãn cột, nút
  cuộn mép tự lo) · vùng tự đánh dấu · nội dung Radix bay ra `body` qua portal · mọi control tương tác.
