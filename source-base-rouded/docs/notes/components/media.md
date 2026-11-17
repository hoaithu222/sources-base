# Ghi chú component — media (`src/shared/ui/media/image/`, `media/image-annotator/`)

> Lý do thiết kế KHÔNG hiển nhiên của ảnh, khung xem ảnh và lớp chú thích, tách khỏi code theo
> `comment-policy.md §3`. Mỗi mục ≤ 6 gạch; chỉ ghi điều code không tự nói và rule
> chung chưa có. Cụm tải tệp (`media/upload/`): `media-upload.md`.

## Image

- **Bấm được (`preview` / `onClick`) thì `<img role="button">`**, không bọc thêm `<button>`: giữ nguyên phần tử nhận
  `className` / `width` / `height` nên bố cục không vỡ; tên = `alt` ("Xem ảnh …" khi `preview`), Tab + Enter / Space.
- **KHÔNG khung chờ**: ảnh registry đóng gói sẵn, tải gần như tức thì — khung chờ chỉ nháy ở icon thư mục 16px của `Tree`.
- **`rounded` bo cả ảnh lẫn ô lỗi** (chung `IMAGE_ROUNDED_CLASSES`); mặc định `none` — ảnh thường nằm trong khung đã bo
  + `overflow-hidden`; `sm`…`xl` đi theo thang `rounded-*` (tối về 0).
- **Lỗi tải ảnh** (`onError`) thay `<img>` bằng ô `role="img"` (viền `border-default` + nền `bg-subtle` + icon `fg-muted`;
  theme tối thêm mặt `Surface`: `HUD_PANEL_FILL` + viền `sky-5/35`), vẫn giữ `className`, `width`, `height`,
  `aria-label={alt}`; khi đó `preview` không còn mở lightbox.
- **`preview` chặn nổi bọt click** (`stopPropagation`): ảnh nằm trong card bấm được sẽ không kích
  hoạt luôn handler của card. Khi `preview` bật thì `onClick` bị bỏ qua.
- **Tên không có trong registry** → render `null` và `console.warn` ở DEV (không ném lỗi). ⛔ KHÔNG chạy
  `generate:images` — generator lệch registry đã commit, xem `docs/known-issues.md`.

## ImagePreview

- **`size="full"` có biến thể riêng** (`size-full shrink`): tailwind-merge KHÔNG coi `size-*` xung đột với
  `w-*` / `h-*`, nên `className="w-full"` không gỡ được cỡ cố định — ảnh kẹt trong hộp nhỏ.
- **Bo góc đặt trên khung ngoài**: `overflow-hidden` của nó mới cắt được góc của `<img>` bên trong.
- **`{...imgProps}` đứng SAU `loading` / `onError`** nên caller ghi đè được; ghi đè `onError` thì
  `hasError` không bật và placeholder không hiện.
- **Lightbox chỉ gắn khi `preview && src && !hasError`**; placeholder (không src / `disabled` / lỗi
  tải) không bấm được và không `interactive`. Theme tối placeholder có viền ánh xanh vẽ bằng bóng TRONG (`inset 0 0 0 1px`):
  khung ngoài `overflow-hidden` + cỡ cố định, `border` thật sẽ ăn mất 2px của icon / ảnh.
- **Khung chờ = `Skeleton` của kit** phủ khung tới khi `onLoad` (ảnh `opacity-0` rồi hiện dần). Đã tải / đã lỗi nhớ
  THEO `src` (`loadedSrc` / `failedSrc`) nên đổi ảnh là chờ / thử lại, không kẹt trạng thái của ảnh cũ.
- **Bấm được** → `role="button"` (tên = `alt`, trống thì "Xem ảnh") + Tab + Enter / Space; màn tối `neutral-10/45`
  hiện khi rê HOẶC focus (icon mắt khi `preview`) — cùng cách `CardScreenshot`.

## ImageLightbox

- **Zoom đổi `width` / `height`, KHÔNG `transform: scale`** (vỡ hạt; `transform` chỉ để XOAY); lăn chuột zoom gắn vào
  VÙNG XEM. 1× = "vừa khung", `%` là mức THẬT so với ảnh gốc; hộp ảnh `m-auto`, không `justify-center` (cắt mép).
- **Reset khi mở lại và khi đổi `src`** bằng setState ngay trong thân render (không effect): thiếu nhịp
  đổi `src` thì ảnh sau kế thừa zoom / xoay cũ và khung giật tới khi `onLoad` chạy.
- **`AnnotationLayer` nạp lười** (`lazy()` ở module scope của `image-lightbox-viewport.tsx`): canvas nặng chỉ
  tải khi bấm bút chì; gọi `lazy()` trong component thì React unmount lại cả khung vẽ mỗi lượt render.
- **Đang vẽ thì Esc / click nền không đóng khung, ←/→ không chuyển ảnh** (mất nét chưa lưu). Esc chặn ở
  `onEscapeKeyDown` của Content vì Radix nghe Esc ở `document`, listener `window` của lớp vẽ quá muộn.
- **Màn hẹp / cảm ứng**: ✕ `size-9` (40px ở `phone:`) + `::after` ≥ 44px, `aria-label="Đóng"`; thanh công cụ dưới `max-w` màn − 1rem
  CUỘN ngang (nút `shrink-0`); mọi neo mép cộng `--safe-t/r/b/l` (tai thỏ, vạch Home).
- **`navigation` / `actions` là hợp đồng mở** (caller giữ danh sách + chỉ số; ←/→ chỉ bắt khi `total > 1`; `actions` dùng
  `LightboxToolButton`). Nút nổi hover nền ĐỤC `bg-dialog-raised` (`bg-nav-hover` trong suốt lộ ảnh). Theme tối: mặt nổi
  `HUD_PANEL_FILL`, thanh công cụ có ray đỉnh + vạch ngăn dốc sáng, nút công cụ rê = quầng trong + vạch sáng đáy.

## AnnotationLayer

- **Toạ độ lưu theo px ẢNH GỐC**: canvas vẽ theo `scale` hiển thị, pointer chia `scale`, nên flatten ở cỡ gốc
  khớp cái người dùng thấy. Chuột → ảnh lấy TÂM của rect rồi quay ngược `-rotation` (rect khi xoay là hộp bao).
- **Di chuyển CHỈ qua thẻ kéo** dưới hộp bao: kéo trên thân shape không xê dịch, bấm nhầm không lệch nét. Vì
  thế không có tool "Chọn" — thao tác trên object có sẵn luôn thắng tool (`useAnnotationEditor`).
- **Esc bóc từng lớp**: đang kéo hình → bỏ nháp; hết dở dang → thoát chế độ vẽ. CỐ Ý không có bậc
  "bỏ chọn": vẽ xong object nào là nó tự được chọn.
- **Không `preventDefault()` ở pointerdown** (mất `dblclick` — lối sửa chữ). Ô soạn chữ focus ở frame SAU khi
  mount và `readyRef` chặn `onBlur` trong khoảng đó, nếu không ô vừa hiện đã tự đóng.
- **Flatten**: PNG giữ PNG (ảnh chụp màn hình cần nét sắc), loại khác xuất JPEG nền trắng; giữ tên file, chỉ
  đổi đuôi, để BE dedupe nhất quán. `decodeImage` dùng `from-image` để ảnh EXIF xoay khớp lúc hiển thị.
- **Nét và chữ có viền trắng mờ bên dưới** để đọc được trên mọi nền ảnh (đỏ / tối).

## AnnotatorToolbar · thanh nổi (`parts/annotator-toolbar.tsx`, `parts/annotation-layer-action-bar.tsx`)

- **Thanh nổi mượn `IMAGE_LIGHTBOX_SURFACE_CLASSES`**, `bottom` cộng `--safe-b` (ngay trên thanh zoom). `AnnotatorToolbar`:
  ô màu đang chọn = `ring-primary-5` (tối: `primary-4` + quầng); `disabled` khoá TỪNG nút (`pointer-events-none` không chặn Tab).
- **Import Button / SegmentToggle / Tooltip theo đường trực tiếp**: barrel `@/shared/ui` export `ImageLightbox`, mà
  lightbox import lớp chú thích ⇒ vòng lặp import.
