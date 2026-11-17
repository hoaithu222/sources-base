import { memo } from 'react';
import { cn } from '@/shared/utils/style/cn';
import { SystemIcon, type SystemIconName } from '@/shared/ui/icons/Icons';
import { TEXT_ELLIPSIS_CLASSES } from '@/shared/ui/primitives/text-ellipsis.theme';
import { DRAWER_SECTION_CLASSES, DRAWER_SECTION_TONE_CLASSES } from './drawer.theme';
import type { DrawerSectionTone } from './drawer.types';

export interface DrawerSectionProps {
  title: React.ReactNode;
  icon?: SystemIconName;
  tone?: DrawerSectionTone;
  extra?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
  bodyClassName?: string;
}

/**
 * DrawerSection — một VÙNG THÔNG TIN trong `Drawer` (tiến độ, thông tin chung, cảnh báo…): vạch nhấn trái + icon + tiêu đề
 * in hoa cùng tông, vạch dưới tiêu đề sáng trái → mờ phải. Mỗi vùng chọn một `tone` khác nhau để mắt tách vùng ngay.
 *
 * Xếp nhiều vùng: bọc bằng `flex flex-col gap-3`. Thân vùng có đệm sẵn; danh sách tự có đệm dòng thì
 * `bodyClassName="py-0"`. Sửa giao diện: `DRAWER_SECTION_CLASSES` · tông → `DRAWER_SECTION_TONE_CLASSES` (`drawer.theme.ts`).
 *
 * @param props.title - Tiêu đề vùng (hiện in hoa).
 * @param props.icon - Icon trước tiêu đề (`SystemIcon` name), cùng tông.
 * @param props.tone - `primary` | `info` | `warning` | `danger` | `neutral`. Mặc định `info`.
 * @param props.extra - Phần tử bên phải tiêu đề (Badge trạng thái, nút nhỏ…).
 * @param props.children - Nội dung vùng.
 * @param props.className - Class thêm cho khung vùng.
 * @param props.bodyClassName - Class thêm cho thân vùng (vd `py-0` khi danh sách tự có đệm).
 *
 * @example
 * <Drawer open={open} onOpenChange={setOpen} title="XL-02 — Kết cấu thân">
 *   <div className="flex flex-col gap-3">
 *     <DrawerSection icon="chart-line-bold" title="Tiến độ thi công" tone="primary" extra={<Badge>Đang thi công</Badge>}>
 *       <Progress showValue value={64} />
 *     </DrawerSection>
 *     <DrawerSection icon="file-lines-bold" title="Thông tin gói thầu">…</DrawerSection>
 *   </div>
 * </Drawer>
 */
const DrawerSection = memo(function DrawerSection({
  title,
  icon,
  tone = 'info',
  extra,
  children,
  className,
  bodyClassName,
}: DrawerSectionProps) {
  return (
    <section
      className={cn(DRAWER_SECTION_TONE_CLASSES[tone], DRAWER_SECTION_CLASSES.root, className)}
    >
      <header className={DRAWER_SECTION_CLASSES.header}>
        {icon && <SystemIcon className={DRAWER_SECTION_CLASSES.icon} name={icon} size={14} />}
        <h3 className={cn(DRAWER_SECTION_CLASSES.title, TEXT_ELLIPSIS_CLASSES)}>{title}</h3>
        {extra && <div className={DRAWER_SECTION_CLASSES.extra}>{extra}</div>}
      </header>
      <div className={cn(DRAWER_SECTION_CLASSES.body, bodyClassName)}>{children}</div>
    </section>
  );
});

export default DrawerSection;
