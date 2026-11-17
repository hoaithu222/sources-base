import { memo, useState } from 'react';

import { Button, Toast, ToastProvider, ToastViewport, showToast } from '@/shared/ui';

/**
 * DemoRawToast — nút + toast ghép THÔ (`ToastProvider` + `ToastViewport` + `Toast` nối tay) của mục "Phản hồi",
 * không qua `showToast()`.
 * Lưu ý: `className="static inset-auto"` gỡ neo `fixed` của viewport — chỉ hợp lệ ở trang trưng bày.
 *
 * @example
 * <DemoRawToast />
 */
const DemoRawToast = memo(function DemoRawToast() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button size="sm" variant="stroke" onClick={() => setOpen(true)}>
        Hiện Toast thô
      </Button>
      <ToastProvider>
        <ToastViewport className="static inset-auto" />
        <Toast
          action={{ label: 'Hoàn tác', onClick: () => showToast('info', 'Đã hoàn tác') }}
          closable
          description="Toast + ToastProvider + ToastViewport ghép trực tiếp, className relocate inline."
          duration={4000}
          open={open}
          title="Toast thô"
          type="info"
          onOpenChange={setOpen}
        />
      </ToastProvider>
    </>
  );
});

export default DemoRawToast;
