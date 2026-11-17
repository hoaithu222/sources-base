import { memo } from 'react';
import { useTranslations } from 'next-intl';

import { cn } from '@/shared/utils/style/cn';

import { HEADER_CONTROL_HEIGHT } from '../header.theme';

export type HeaderContextStatus = 'online' | 'warning' | 'offline';

interface HeaderContextChipProps {
  code: string;
  label?: string;
  status?: HeaderContextStatus;
  statusLabel?: string;
  className?: string;
}

type HeaderContextChipSlot = 'root' | 'dot' | 'code' | 'divider' | 'label';

const HEADER_CONTEXT_CHIP_CLASSES = {
  root: cn(
    'hidden shrink-0 select-none items-center md:inline-flex',
    HEADER_CONTROL_HEIGHT,
    'gap-1.5 rounded-full px-2',
  ),
  dot: 'relative size-2 shrink-0 rounded-full',
  code: cn('shrink-0 tabular-nums text-caption-12-bold tracking-[0.06em]', 'text-[var(--hdr-fg)]'),
  divider: 'hidden h-3.5 w-px shrink-0 bg-[var(--hdr-divider)] 2xl:block',
  label: cn(
    'hidden max-w-[9rem] truncate 2xl:block wide:max-w-[10rem]',
    'text-caption-12-medium text-[var(--hdr-fg-muted)]',
  ),
} satisfies Record<HeaderContextChipSlot, string>;

/** Màu chấm theo trạng thái — chấm đặc, không phát sáng, cùng hình ở cả hai theme (token `success` / `warning` tự lật). */
const HEADER_CONTEXT_DOT_CLASSES = {
  online: cn(
    'bg-success',
    "after:absolute after:inset-0 after:rounded-full after:bg-success after:content-['']",
  ),
  warning: 'bg-warning',
  offline: 'bg-neutral-5',
} satisfies Record<HeaderContextStatus, string>;

/**
 * HeaderContextChip — chip NGỮ CẢNH LÀM VIỆC cạnh logo: chấm trạng thái + mã (công trường, nhà máy, bãi…) + tên đầy đủ.
 * Truyền vào `<Header context={…} />`.
 *
 * Chip để ĐỌC (không bấm) — cho người dùng biết đang xem số liệu của nơi nào. Cần đổi nơi làm việc thì app bọc
 * nút riêng; trang tự bơm node vào mép trái bằng `<PageHeader start>`, không dùng chip này.
 * Sửa giao diện: `HEADER_CONTEXT_CHIP_CLASSES` · màu chấm → `HEADER_CONTEXT_DOT_CLASSES`.
 * Lưu ý: ẩn dưới `md` (top bar điện thoại không có chỗ); tên đầy đủ (`label`) chỉ hiện từ `2xl` ≥ 1536px — laptop 14"
 * chỉ thấy chấm + mã, tên vẫn đọc được qua `title` khi rê chuột.
 *
 * @param props.code - Mã ngắn, viết như in trên biển công trường (vd "BDD-S02"); luôn hiện.
 * @param props.label - Tên đầy đủ (vd "Bãi đúc dầm số 2"); hiện từ `2xl`.
 * @param props.status - Trạng thái kết nối của nơi đó: `online` | `warning` | `offline`. Mặc định `online`.
 * @param props.statusLabel - Câu cho trình đọc màn hình thay câu mặc định theo `status` (câu mặc định theo ngôn ngữ).
 * @param props.className - Class thêm cho khung.
 *
 * @example
 * <Header context={<HeaderContextChip code="BDD-S02" label="Bãi đúc dầm số 2" />} … />
 */
const HeaderContextChip = memo(function HeaderContextChip({
  code,
  label,
  status = 'online',
  statusLabel,
  className,
}: HeaderContextChipProps) {
  const t = useTranslations('ui.widgets');
  const spoken = statusLabel ?? t(`header.contextStatus.${status}`);
  const tooltip = [code, label, spoken].filter(Boolean).join(' · ');

  return (
    <span className={cn(HEADER_CONTEXT_CHIP_CLASSES.root, className)} title={tooltip}>
      <span
        aria-label={spoken}
        className={cn(HEADER_CONTEXT_CHIP_CLASSES.dot, HEADER_CONTEXT_DOT_CLASSES[status])}
        role="img"
      />
      <span className={HEADER_CONTEXT_CHIP_CLASSES.code}>{code}</span>
      {label && (
        <>
          <span aria-hidden className={HEADER_CONTEXT_CHIP_CLASSES.divider} />
          <span className={HEADER_CONTEXT_CHIP_CLASSES.label}>{label}</span>
        </>
      )}
    </span>
  );
});

export default HeaderContextChip;
