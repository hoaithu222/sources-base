'use client';

import { useId } from 'react';
import type { ReactNode } from 'react';

import { Text } from '@/shared/ui';
import { cn } from '@/shared/utils/style/cn';

import { CATALOG_SLOT_CLASSES } from './catalog.theme';

interface CatalogStateProps {
  label: string;
  note?: string;
  children: ReactNode;
  className?: string;
}

/**
 * CatalogState — một ô "nhãn + ví dụ" của catalog: nhãn nhỏ phía trên (tên trạng thái hoặc prop), component mẫu ở giữa,
 * dòng ghi chú nhỏ phía dưới (thường là giá trị đang chọn).
 *
 * Là nhóm có tên (`role="group"`) nên trình đọc màn hình và test tìm được từng trạng thái theo nhãn.
 *
 * @param props.label - Tên trạng thái / prop đang minh hoạ (đã dịch, hoặc tên prop dạng code).
 * @param props.note - Dòng chữ nhỏ dưới ví dụ, vd `Giá trị: …`; bỏ trống thì không hiện.
 * @param props.children - Component mẫu.
 * @param props.className - Class thêm cho khung (vd `max-w-xs` khi ví dụ giãn hết bề ngang).
 */
export default function CatalogState({ label, note, children, className }: CatalogStateProps) {
  const labelId = useId();

  return (
    <div
      aria-labelledby={labelId}
      className={cn(CATALOG_SLOT_CLASSES.state, className)}
      role="group"
    >
      <Text id={labelId} size="tiny" skin="muted" weight="medium">
        {label}
      </Text>
      {children}
      {note && (
        <Text size="tiny" skin="muted">
          {note}
        </Text>
      )}
    </div>
  );
}
