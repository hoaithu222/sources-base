import { memo } from 'react';

import { cn } from '@/shared/utils/style/cn';

import { HEADER_CONTROL_HEIGHT, HEADER_FRAME_CLASS } from '../header.theme';

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
    HEADER_FRAME_CLASS,
    'gap-1.5 px-2 wide:gap-2 wide:px-3',
    'border border-border-default dark:border-transparent',
  ),
  dot: 'relative size-2 shrink-0 rounded-full wide:size-2.5',
  code: cn(
    'shrink-0 tabular-nums text-caption-12-bold tracking-[0.02em] wide:text-body-16-bold',
    'text-primary-7 dark:text-primary-4',
    'dark:[text-shadow:0_0_10px_color-mix(in_srgb,var(--color-primary-4)_45%,transparent)]',
  ),
  divider: 'hidden h-3.5 w-px shrink-0 bg-divider-nav 2xl:block wide:h-4',
  label: cn(
    'hidden max-w-[9rem] truncate 2xl:block wide:max-w-[10rem]',
    'text-caption-12-medium text-fg-on-chrome wide:text-body-14-medium',
  ),
} satisfies Record<HeaderContextChipSlot, string>;

/** Màu chấm theo trạng thái; quầng + nhịp "thở" chỉ `dark:` (sáng: chấm đặc, không phát sáng). */
const HEADER_CONTEXT_DOT_CLASSES = {
  online: cn(
    'bg-success dark:shadow-[0_0_8px_var(--color-success)]',
    "after:absolute after:inset-0 after:rounded-full after:bg-success after:content-['']",
    'motion-safe:dark:after:animate-ping',
  ),
  warning: 'bg-warning dark:shadow-[0_0_8px_var(--color-warning)]',
  offline: 'bg-neutral-5',
} satisfies Record<HeaderContextStatus, string>;

const HEADER_CONTEXT_STATUS_LABELS = {
  online: 'Đang hoạt động',
  warning: 'Cần chú ý',
  offline: 'Mất kết nối',
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
 * @param props.statusLabel - Câu cho trình đọc màn hình thay câu mặc định theo `status`.
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
  const spoken = statusLabel ?? HEADER_CONTEXT_STATUS_LABELS[status];
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
