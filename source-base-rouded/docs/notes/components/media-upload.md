# Ghi chú component — media / upload (`src/shared/ui/media/upload/`)

> Lý do thiết kế KHÔNG hiển nhiên của cụm tải tệp (`Upload`, `Dropzone`, `FileCard`…), tách khỏi
> code theo `comment-policy.md §3`. Mỗi mục ≤ 6 gạch; chỉ ghi điều code không tự nói và rule
> chung chưa có. Ảnh / lightbox / chú thích: `media.md`.

## upload/ — cấu trúc folder

- **Khác `variant="dropzone"` của `Upload`**: đó là phần con nội bộ `parts/upload-drop-area.tsx`
  (`UploadDropArea` — viền đứt + nút "Chọn file"); `Dropzone` là component công khai BỌC nội dung có sẵn.
- **Nằm trong `upload/` (không folder riêng)**: dùng chung `hooks/useDropQueue` + `utils/drop.utils` với
  `useUploadPicker` của `Upload` — tách folder thì một bên phải chui vào ruột bên kia.

## Upload

- **`variant="inline"` trông như ô để gõ** (viền + nền input): đã có người tưởng gõ được vào đó.
  Hành động (quét OCR, tải lên) dùng `variant="button"`.
- **`variant="button"` vẫn nhận kéo-thả**: nút là đích thả hợp lệ. `buttonVariant` mặc định `stroke`
  để không tranh nhấn với nút hành động chính của form.
- **`directory` gán `webkitdirectory` / `directory` lên DOM trong effect**: hai attr này ngoài type
  của React, spread JSX không ổn định. Chọn thư mục kéo theo `multiple` ngầm định.
- **`onDirectories` bắn TRƯỚC `onFiles`**: thư mục rỗng không sinh `File` nên `onFiles` không gọi.
  Nút "Chọn thư mục" không báo được thư mục rỗng (giới hạn của Web API).
- **`aria-labelledby` thắng `aria-label`** (quy tắc tính tên trợ năng): dùng khi nhãn đã vẽ ở nơi
  khác (vd `FormItem`), khỏi chép lại chuỗi nhãn.
- **`maxFiles` chỉ giới hạn MỖI LẦN chọn** (`maxFiles - currentCount`); tổng số do caller giữ.
  Input được reset `value` sau mỗi lần chọn để chọn lại được đúng tệp vừa chọn.

## Upload — trigger (dropzone · inline · button)

- **`invalid` chỉ tô đỏ, KHÔNG in dòng lỗi**: trong form, `FormItem` đã in lỗi (FileField truyền
  `invalid={Boolean(error)}`); để Upload in thêm là một lỗi hiện hai lần.
- **dragOver thắng error**: người đang kéo tệp vào chính là người đang sửa lỗi — phản hồi "thả được"
  quan trọng hơn viền đỏ. Tiêu đề / nhãn đổi thành "Thả tệp để tải lên" trong lúc kéo.
- **"Chọn file" trong dropzone là `<Button asChild><span>`**: cả vùng đã là `role="button"`; một
  `<button>` thật bên trong là control lồng nhau (2 điểm Tab, trình đọc màn hình đọc lẫn).
- **`dragleave` bỏ qua khi `relatedTarget` còn trong trigger**: rê qua phần tử con cũng bắn
  `dragleave` → trạng thái dragOver nháy tắt-bật.
- **`inline` dùng `fieldSurface({ focusMode: 'trigger' })` + `FIELD_HEIGHT`**: viền, hover, focus,
  invalid giống hệt ô nhập; icon tải lên ở cuối hàng báo đây là ô CHỌN tệp chứ không gõ.
- **`button` báo kéo-thả bằng viền đứt `outline`** (cùng ngôn ngữ với dropzone), lỗi → `skin="danger"`;
  `outline` không đổi kích thước nút nên hàng nút không xô lệch.

## FileCard · FileBadge

- **Một bảng `FILE_CARD_STATUS_TONES`** cho mỗi trạng thái (icon · vạch trái · thanh tiến độ · màu
  chữ): thêm trạng thái mới là `tsc` đỏ ở đúng một chỗ, không lệch giữa icon và màu.
- **Vạch trái 2px + thanh tiến độ ĐÈ lên viền** (`-left-px` / `-bottom-px`): tiến độ là "viền đáy đầy
  dần", không thêm chiều cao. pending vẽ rãnh nét đứt (đang xếp hàng); success / error bỏ thanh.
- **`file.error` thay nhãn trạng thái thay vì thêm dòng**: mọi hàng của FileList cao bằng nhau; câu
  đầy đủ nằm ở `title`.
- **Chữ trạng thái ở theme sáng dùng bậc `-7`** (`text-success-7`, `text-warning-7`, `dark:` về token
  đơn): `text-success` chỉ ~2.6:1 trên nền trắng ở cỡ 12px.
- **uploading = primary, còn thẻ `ProgressCard` (`progress-center/card`) running = info**: hàng tệp đã có thanh + spinner
  phân biệt với success; thẻ góc màn chỉ có màu nên cần khác hẳn success.
- **Nhãn đuôi tệp là chip đặc** (`bg-{c}-6/7 text-neutral-0`) trong ô nhuộm: đọc được ở 9px cả hai
  theme; ô ảnh (`previewUrl`) bỏ nhuộm để không ám màu lên ảnh.

## Dropzone

- **`depthRef` đếm enter/leave**: `dragenter`/`dragleave` bắn lại khi rê qua phần tử con, không đếm
  thì overlay nhấp nháy.
- **Chỉ nhận khi `dataTransfer.types` có `'Files'`**: kéo text / phần tử nội bộ không bật overlay.
- **Chụp `dt.files` ĐỒNG BỘ trước `await`**: `DataTransfer` hết hiệu lực sau event, đọc sau khi chờ
  sẽ ra rỗng.
- **Phân loại `folder` theo `folderPaths`, không theo số tệp**: thả thư mục rỗng thì `files` rỗng,
  bám vào nó thì cú thả rơi vào hư không.
- **Không tự validate** `accept` / dung lượng: caller hoặc modal xử lý, Dropzone chỉ báo `kind` +
  `files`.
- **Kết quả đọc thư mục đi qua hàng `useDropQueue`** (cả `Upload directoryOnly`): giao đúng thứ tự THẢ, không
  latest-wins — mỗi lần thả là một lô người dùng muốn giữ; unmount thì không giao.

## readDirectoryDrop

- **Trích entry ĐỒNG BỘ trước mọi `await`**: `DataTransferItemList` hết hiệu lực sau event.
- **Ghi cả `folderPaths`**: thư mục RỖNG không sinh `File`, chỉ dựa vào `webkitRelativePath` của
  file thì nó biến mất khỏi cây.
- **`readEntries` trả theo batch** nên phải lặp tới khi rỗng mới đủ mục con.
- **`webkitRelativePath` gắn bằng `Object.defineProperty`** từ `fullPath` (bỏ `/` đầu) cho khớp
  dạng của `<input webkitdirectory>`.

## useUpload

- **Ref "luôn mới" gán trong `useLayoutEffect`, KHÔNG gán lúc render**: ghi ref khi đang render
  không an toàn với concurrent rendering và bị rule `react-hooks/refs` chặn.
- **Mọi chỗ đọc các ref đó nằm trong handler / hàm async** (chạy SAU commit) nên dời sang layout
  effect không đổi ngữ nghĩa.
- **`previewUrl` chỉ tạo cho ảnh** và được thu hồi ở `removeFile` / `clear` / unmount: caller không
  tự `revokeObjectURL`.
- **Mỗi tệp một `AbortController`**: `cancelFile` đặt `paused` NGAY rồi mới abort, `retryFile` abort lượt đang chạy
  trước; kết quả / tiến độ về muộn của lượt đã huỷ hoặc bị thay được bỏ qua (kể cả handler lờ `signal`).
- **`multiple=false` chỉ giữ MỘT tệp**: mỗi lần thêm nhận tệp hợp lệ đầu tiên và THAY tệp cũ (huỷ lượt tải, thu
  hồi `previewUrl`; `maxFiles` không trừ tệp sắp bị thay); tệp không hợp lệ vẫn báo qua `onReject`.
- **Không phụ thuộc React Query**: caller bọc `onUpload` bằng `useMutation` nếu muốn.

## upload.theme · file-card.theme

- **Hai file theme** (trần 300 dòng): `upload.theme` cho Upload · Dropzone, `file-list/file-card.theme` cho FileCard ·
  FileBadge; kiểu trục (`UploadSize` = `FieldSize`, `FileCardVariant`…) ở `upload.types.ts` để theme và component cùng đọc.
- **Ô state tự mang `cursor` · màu viền · nền**: `*_BASE_CLASSES` cố ý không chứa chúng để mỗi ô
  đứng một mình, không phải đọc `cn()` ghi đè mới biết class cuối cùng.
- **Vệt sáng thanh đang tải dùng `animate-[progress-shine_…_infinite]`**: `animate-progress-shine` chỉ
  chạy MỘT lần (cho hover); tiến độ sống cần lặp, kèm `motion-reduce:animate-none`.
- **Theme tối — vùng thả**: nghỉ = viền đứt `hud-5/45` + `HUD_PANEL_FILL`; rê `HUD_HOVER_GLOW`; ngoặc 4 góc CHỈ khi đang kéo tệp qua
  (trạng thái, không phải trang trí — §0c); kéo-qua = viền liền `primary-4` + quầng
  trong/ngoài mạnh + ô icon đặc dốc + tiêu đề `HUD_TEXT_GLOW`. Overlay `Dropzone` cùng ngôn ngữ (ngoặc `-inset-0.5` vì viền 2px).
- **Theme tối — FileCard**: nền dốc ngang nhuộm màu trạng thái từ mép trái (nơi vạch phát sáng), vạch trái quầng theo
  trạng thái (trừ pending); thẻ bấm được thêm `HUD_HOVER_GLOW`. Inline kéo-qua dùng `HUD_FOCUS_GLOW`.
