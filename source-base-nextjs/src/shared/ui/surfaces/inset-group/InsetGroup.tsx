import { memo, useId } from 'react';
import type { ReactNode } from 'react';

import { cn } from '@/shared/utils/style/cn';

import {
  INSET_GROUP_BOX_CLASSES,
  INSET_GROUP_CLASSES,
  type InsetGroupSurface,
} from './inset-group.theme';

export interface InsetGroupProps {
  title?: ReactNode;
  description?: ReactNode;
  footer?: ReactNode;
  surface?: InsetGroupSurface;
  className?: string;
  children: ReactNode;
}

/**
 * InsetGroup — HỘP NHÓM kiểu System Settings của macOS: tiêu đề nhóm nằm NGOÀI hộp, các `InsetGroupRow` xếp trong một
 * hộp bo góc với vạch ngăn thụt vào. Dùng cho cài đặt, danh sách đi sâu (quyền, cấu hình, mục có số đếm), cặp nhãn –
 * giá trị của một bản ghi — chỗ cần đọc nhanh "có gì, bao nhiêu, bấm vào đâu".
 *
 * Nhiều nhóm liên tiếp: xếp trong cột `gap-4`; mỗi nhóm một chủ đề. Không lồng hộp trong hộp.
 * Lưu ý: bảng dữ liệu nhiều cột vẫn là `Table`; hộp nhóm cho ≤ ~12 dòng mỗi nhóm.
 *
 * @param props.title - Tiêu đề nhóm (chữ đậm, ngoài hộp). Có tiêu đề → hộp được gắn nhãn cho trình đọc màn hình.
 * @param props.description - Câu giải thích dưới tiêu đề.
 * @param props.footer - Ghi chú nhỏ dưới hộp (giải thích hệ quả của cài đặt…).
 * @param props.surface - `raised` (mặc định) hộp trắng viền mảnh trên nền trang · `sunken` hộp xám nhạt trong bề mặt
 *   trắng · `glass` kính mờ trên nền có màu (dải gradient, hero).
 * @param props.className - Class thêm cho khối ngoài.
 * @param props.children - Các `InsetGroupRow`.
 *
 * @example
 * <InsetGroup title="Quyền truy cập" footer="Áp dụng từ lần đăng nhập sau.">
 *   <InsetGroupRow icon="finance" title="Tài chính" description="Sổ cái, công nợ" value="4" href="/quyen/tai-chinh" />
 *   <InsetGroupRow icon="warehouse" tone="yellow" title="Kho vận" value="0" href="/quyen/kho-van" />
 * </InsetGroup>
 */
const InsetGroup = memo(function InsetGroup({
  title,
  description,
  footer,
  surface = 'raised',
  className,
  children,
}: InsetGroupProps) {
  const titleId = useId();
  return (
    <section
      aria-labelledby={title != null ? titleId : undefined}
      className={cn(INSET_GROUP_CLASSES.root, className)}
    >
      {(title != null || description != null) && (
        <div className={INSET_GROUP_CLASSES.head}>
          {title != null && (
            <h3 className={INSET_GROUP_CLASSES.title} id={titleId}>
              {title}
            </h3>
          )}
          {description != null && <p className={INSET_GROUP_CLASSES.description}>{description}</p>}
        </div>
      )}
      <div className={INSET_GROUP_BOX_CLASSES[surface]} role="list">
        {children}
      </div>
      {footer != null && <p className={INSET_GROUP_CLASSES.footer}>{footer}</p>}
    </section>
  );
});

export default InsetGroup;
