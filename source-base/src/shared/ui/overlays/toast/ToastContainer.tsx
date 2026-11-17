import { memo } from 'react';
import Toast, { ToastProvider } from './Toast';
import ToastViewport from './ToastViewport';
import { useToastStore } from './toast.store';

/**
 * ToastContainer — gắn `ToastProvider` + `ToastViewport` và vẽ mọi toast trong hàng đợi.
 *
 * Đặt MỘT lần ở gốc app (đã có trong `AppOverlays`); nơi khác chỉ gọi `showToast()` (`@/shared/ui`).
 * Toast tự gỡ khỏi hàng đợi khi đóng (hết giờ / vuốt / bấm ✕). Không nhận prop.
 *
 * @example
 * <ToastContainer />
 */
const ToastContainer = memo(function ToastContainer() {
  const { toasts, remove } = useToastStore();

  return (
    <ToastProvider swipeDirection="right">
      <ToastViewport />
      {toasts.map((item) => (
        <Toast
          key={item.id}
          action={item.action}
          description={item.description}
          duration={item.duration}
          open
          title={item.title}
          type={item.type}
          onOpenChange={(open) => {
            if (!open) remove(item.id);
          }}
        />
      ))}
    </ToastProvider>
  );
});

export default ToastContainer;
