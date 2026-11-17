import * as ToastPrimitive from '@radix-ui/react-toast';
import { cn } from '@/shared/utils/style/cn';

const TOAST_VIEWPORT_CLASSES = cn(
  'fixed right-[calc(1rem+var(--safe-r,0px))] top-[calc(4.5rem+var(--safe-t,0px))] z-[200]',
  'flex w-full max-w-[min(380px,calc(100vw-32px))] flex-col-reverse gap-2 outline-none',
  'phone:top-auto phone:bottom-[calc(var(--tab-bar-reach,0px)+var(--safe-b,0px)+0.75rem)]',
  'phone:right-[calc(0.5rem+var(--safe-r,0px))] phone:max-w-[calc(100vw-16px)]',
);

/**
 * ToastViewport — điểm gắn hiển thị của mọi `Toast`: như thông báo macOS — góc TRÊN phải ngay dưới header (cách
 * 16px), thẻ mới nhất trên cùng (góc dưới phải dành cho rail tiến trình tải lên). Đặt MỘT lần trong `ToastProvider` (thường ở gốc app — `ToastContainer` đã làm sẵn).
 *
 * Nhận thêm mọi prop của Radix `Toast.Viewport` (`hotkey`, `label`…).
 * Sửa giao diện: vị trí / khoảng cách → `TOAST_VIEWPORT_CLASSES`.
 * Lưu ý: neo trên-phải đã cộng `--safe-t` / `--safe-r` (ipad-responsive.md §6) — đổi neo thì giữ phần cộng này.
 * Điện thoại: rộng ≤ màn − 16px, neo TRÊN thanh tab đáy (`--tab-bar-reach` + `--safe-b`) — ngón cái với tới để vuốt.
 *
 * @param props.className - Class thêm, ghi đè vị trí (vd `static inset-auto` để đặt trong khung trưng bày).
 * @param props.ref - Trỏ tới phần tử `<ol>` của viewport (React 19: `ref` là prop thường).
 *
 * @example
 * <ToastProvider>
 *   <App />
 *   <ToastViewport />
 * </ToastProvider>
 */
function ToastViewport({
  className,
  ...rest
}: React.ComponentProps<typeof ToastPrimitive.Viewport>) {
  return <ToastPrimitive.Viewport className={cn(TOAST_VIEWPORT_CLASSES, className)} {...rest} />;
}

export default ToastViewport;
