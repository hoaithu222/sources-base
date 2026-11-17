import { memo, type ReactNode } from 'react';

import { BoxPanel } from '@/shared/ui';
import { cn } from '@/shared/utils/style/cn';

interface ExecPanelProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
  bodyClassName?: string;
  children: ReactNode;
}

const EXEC_PANEL_CLASSES = {
  root: 'squircle min-w-0 rounded-xl',
  header: 'flex-wrap items-start gap-3 px-4 pt-4 pb-3 [&>div:first-child]:min-w-48',
  title: 'm-0 truncate text-body-16-semibold leading-5 text-fg-heading',
  body: 'px-4 pb-4',
} satisfies Record<string, string>;

/**
 * ExecPanel — khung chung các khối của màn "Dashboard điều hành": `BoxPanel` viền mảnh (bo `xl` + `squircle`, viền
 * bắt sáng — cả hai theme), tiêu đề là `<h2>` thật, dòng mô tả mờ bên dưới, cụm hành động ghim góc phải-trên cách mép
 * 16px, thân đệm 16px hai bên + đáy — khối thoáng, không dính mép.
 * Lưu ý: thân là khung `flex-col overflow-hidden` — con cần lấp phần còn lại thì `min-h-0 flex-1`; bảng / danh sách tràn
 * mép thì đổi đệm qua `bodyClassName` (vd `px-0 pb-2`).
 *
 * @param props.title - Tiêu đề khối (render `<h2>`).
 * @param props.description - Dòng phụ dưới tiêu đề: đơn vị, phạm vi số liệu.
 * @param props.actions - Góc phải hàng tiêu đề: liên kết "Xem chi tiết", số đếm, tóm tắt ngắn.
 * @param props.className - Class thêm cho khung (thường là ô lưới `EXEC_PANEL_SLOT_CLASSES`).
 * @param props.bodyClassName - Class thêm cho thân (đè đệm mặc định `px-4 pb-4`).
 * @param props.children - Nội dung khối.
 *
 * @example
 * <ExecPanel actions={<Text size="tiny">5 việc</Text>} description="Tỷ đồng" title="Dòng tiền">…</ExecPanel>
 */
const ExecPanel = memo(function ExecPanel({
  title,
  description,
  actions,
  className,
  bodyClassName,
  children,
}: ExecPanelProps) {
  return (
    <BoxPanel
      bodyClassName={cn(EXEC_PANEL_CLASSES.body, bodyClassName)}
      bodyOverflow="hidden"
      border="hairline"
      className={cn(EXEC_PANEL_CLASSES.root, className)}
      description={description}
      headerClassName={EXEC_PANEL_CLASSES.header}
      headerRight={actions}
      title={<h2 className={EXEC_PANEL_CLASSES.title}>{title}</h2>}
    >
      {children}
    </BoxPanel>
  );
});

export default ExecPanel;
