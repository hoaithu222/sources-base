import dayjs from 'dayjs';
import 'dayjs/locale/vi';
import relativeTime from 'dayjs/plugin/relativeTime';
import utc from 'dayjs/plugin/utc';

/**
 * Định dạng ngày giờ — TIẾNG VIỆT, đúng quy ước Việt Nam.
 *
 * ── ⛔ Quy ước ngày của Việt Nam là NGÀY/THÁNG/NĂM ───────────────────────────
 * `03/04/2026` ở Việt Nam là **3 tháng 4**, ở Mỹ là **4 tháng 3**. Định dạng
 * mặc định của JavaScript đi theo `Intl` của máy, mà máy thì tuỳ người dùng đặt
 * ngôn ngữ gì. Nên KHÔNG bao giờ để mặc định quyết: mọi ngày hiển thị phải đi
 * qua các hàm ở đây.
 *
 * Ngày sai lệch một tháng trong biên bản nghiệm thu là sai lệch pháp lý, không
 * phải lỗi hiển thị.
 *
 * ── Vì sao dayjs mà không phải `Intl.DateTimeFormat` ────────────────────────
 * Hermes (máy JS của React Native) xưa nay cắt bớt ICU để giảm dung lượng, nên
 * `Intl` có mặt nhưng dữ liệu ngôn ngữ không đầy đủ và KHÁC NHAU giữa Android
 * với iOS. Kết quả là cùng một ngày hiển thị khác nhau trên hai máy. dayjs mang
 * theo dữ liệu ngôn ngữ của chính nó nên hai nền tảng ra kết quả giống hệt.
 */

dayjs.extend(relativeTime);
dayjs.extend(utc);
dayjs.locale('vi');

/** Kiểu đầu vào chấp nhận được — chuỗi ISO, timestamp, hoặc `Date`. */
export type DateInput = string | number | Date | null | undefined;

/** Ngày dạng `dd/MM/yyyy`. Chuỗi rỗng khi không có/không hợp lệ. */
export function formatDate(value: DateInput, fallback = ''): string {
  if (value === null || value === undefined || value === '') return fallback;
  const date = dayjs(value);
  return date.isValid() ? date.format('DD/MM/YYYY') : fallback;
}

/** Ngày giờ dạng `dd/MM/yyyy HH:mm`. */
export function formatDateTime(value: DateInput, fallback = ''): string {
  if (value === null || value === undefined || value === '') return fallback;
  const date = dayjs(value);
  return date.isValid() ? date.format('DD/MM/YYYY HH:mm') : fallback;
}

/** Giờ dạng `HH:mm` (24 giờ — quy ước Việt Nam, không dùng SA/CH). */
export function formatTime(value: DateInput, fallback = ''): string {
  if (value === null || value === undefined || value === '') return fallback;
  const date = dayjs(value);
  return date.isValid() ? date.format('HH:mm') : fallback;
}

/**
 * Khoảng cách tương đối: "3 phút trước", "2 ngày trước".
 *
 * Dùng cho dòng thời gian, thông báo, tin nhắn — chỗ mà "vừa xong" hữu ích hơn
 * "14:32". ⛔ Đừng dùng cho ngày trên chứng từ: "2 tháng trước" không tra cứu
 * được và không đối chiếu được với bản giấy.
 */
export function formatRelative(value: DateInput, fallback = ''): string {
  if (value === null || value === undefined || value === '') return fallback;
  const date = dayjs(value);
  return date.isValid() ? date.fromNow() : fallback;
}

/**
 * Chuỗi `yyyy-MM-dd` để GỬI LÊN backend.
 *
 * ⛔ Đừng dùng `new Date().toISOString().slice(0, 10)` cho việc này. `toISOString`
 * đổi sang UTC trước, nên 23:30 ngày 05/04 giờ Việt Nam (UTC+7) ra `2026-04-05`
 * ở đây nhưng `2026-04-05T16:30Z` — và với những máy chủ tự cắt theo UTC thì
 * ngày lùi lại một hôm. Lỗi CHỈ xảy ra với dữ liệu nhập buổi tối, nên nó lọt
 * qua mọi lần thử ban ngày rồi mới lộ khi có người tăng ca.
 */
export function toApiDate(value: DateInput): string | null {
  if (value === null || value === undefined || value === '') return null;
  const date = dayjs(value);
  return date.isValid() ? date.format('YYYY-MM-DD') : null;
}

/** Đúng ngày hôm nay (theo giờ máy) hay không. */
export function isToday(value: DateInput): boolean {
  if (value === null || value === undefined || value === '') return false;
  const date = dayjs(value);
  return date.isValid() && date.isSame(dayjs(), 'day');
}
