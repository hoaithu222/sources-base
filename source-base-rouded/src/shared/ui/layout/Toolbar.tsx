import { memo } from 'react';
import type { ReactNode } from 'react';

import { cn } from '@/shared/utils/style/cn';

export type ToolbarBorder = 'none' | 'bottom' | 'top';
export type ToolbarPadding = 'none' | 'sm' | 'md' | 'lg';

export interface ToolbarProps {
  left?: ReactNode;
  right?: ReactNode;
  border?: ToolbarBorder;
  padding?: ToolbarPadding;
  className?: string;
}

const TOOLBAR_ROOT_CLASSES = 'flex shrink-0 flex-wrap items-center justify-between gap-2';
const TOOLBAR_LEFT_CLASSES = 'flex min-w-0 flex-1 flex-wrap items-center gap-2 phone:basis-64';
const TOOLBAR_RIGHT_CLASSES =
  'flex shrink-0 items-center gap-2 phone:ml-auto phone:max-w-full phone:flex-wrap phone:justify-end';

const TOOLBAR_BORDER_CLASSES = {
  none: '',
  bottom: 'relative border-b border-border-default',
  top: 'relative border-t border-border-default',
} satisfies Record<ToolbarBorder, string>;

const TOOLBAR_PADDING_CLASSES = {
  none: '',
  sm: 'px-2 py-1.5',
  md: 'p-2',
  lg: 'px-3 py-2.5',
} satisfies Record<ToolbarPadding, string>;

/**
 * Toolbar — hàng công cụ / bộ lọc của trang hoặc panel: cụm trái NỞ (ô tìm, dropdown lọc, khoảng ngày),
 * cụm phải GHIM (hành động "Thêm", "Xuất Excel").
 *
 * Đặt giữa `TitleScreen` và `PageBody` trong `<PageShell>`, hoặc ở đầu / chân panel. Hai cụm tự xuống
 * dòng khi hẹp; phần thiếu chỗ luôn trừ vào cụm trái. Điện thoại (`phone:`): cụm trái giữ sàn 16rem — cụm phải
 * không đủ chỗ cạnh đó thì rớt xuống hàng riêng canh phải (và tự xuống dòng), không bóp ô lọc về 0.
 * Sửa giao diện: khung → `TOOLBAR_ROOT_CLASSES` · hai cụm → `TOOLBAR_LEFT_CLASSES` / `TOOLBAR_RIGHT_CLASSES`
 * · viền → `TOOLBAR_BORDER_CLASSES` · đệm → `TOOLBAR_PADDING_CLASSES`.
 * Lưu ý: `min-w-0` ở cụm trái bắt buộc (thiếu thì ô tìm `w-full` tràn đè cụm phải); Toolbar KHÔNG tự
 * cuộn ngang — cụm hành động dài thì tự bọc `overflow-x-auto overscroll-x-contain`
 * — docs/notes/components/layout.md.
 *
 * @param props.left - Cụm trái: bộ lọc, ô tìm. Luôn render (kể cả rỗng) để đẩy cụm phải về mép phải.
 * @param props.right - Cụm phải: nút hành động; `null` / `false` / không truyền → không dựng ô phải.
 * @param props.border - Viền ngăn: `none` | `bottom` | `top`. Mặc định `none`.
 * @param props.padding - Đệm: `none` | `sm` (ngang 8 · dọc 6px) | `md` (8px mọi phía) | `lg` (ngang 12 · dọc
 *   10px). Mặc định `none`.
 * @param props.className - Class thêm cho hàng.
 *
 * @example
 * <Toolbar
 *   border="bottom"
 *   left={<Input placeholder="Tìm gói thầu" />}
 *   padding="md"
 *   right={<Button size="sm">Thêm</Button>}
 * />
 */
const Toolbar = memo(function Toolbar({
  left,
  right,
  border = 'none',
  padding = 'none',
  className,
}: ToolbarProps) {
  const toolbarClassName = cn(
    TOOLBAR_ROOT_CLASSES,
    TOOLBAR_BORDER_CLASSES[border],
    TOOLBAR_PADDING_CLASSES[padding],
    className,
  );

  return (
    <div className={toolbarClassName}>
      <div className={TOOLBAR_LEFT_CLASSES}>{left}</div>
      {right != null && right !== false && <div className={TOOLBAR_RIGHT_CLASSES}>{right}</div>}
    </div>
  );
});

export default Toolbar;
