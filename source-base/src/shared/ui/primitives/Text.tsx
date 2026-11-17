import { useEffect, useRef, useState } from 'react';
import Tooltip from '@/shared/ui/overlays/Tooltip';
import { cn } from '@/shared/utils/style/cn';
import { TEXT_ELLIPSIS_CLASSES } from './text-ellipsis.theme';

export type TextSize = 'extraLarge' | 'large' | 'medium' | 'small' | 'body' | 'tiny' | 'extraTiny';
export type TextWeight = 'normal' | 'medium' | 'bold';
export type TextSkin =
  'standard' | 'muted' | 'primary' | 'success' | 'warning' | 'error' | 'disabled';

export interface TextProps extends Omit<React.HTMLAttributes<HTMLElement>, 'color'> {
  as?: React.ElementType;
  size?: TextSize;
  weight?: TextWeight;
  skin?: TextSkin;
  ellipsis?: boolean;
}

const TEXT_SIZE_CLASSES = {
  extraLarge: { normal: 'text-h3', medium: 'text-h3-medium', bold: 'text-h3-medium' },
  large: { normal: 'text-h4', medium: 'text-h4-medium', bold: 'text-h4-medium' },
  medium: { normal: 'text-body-16', medium: 'text-body-16-medium', bold: 'text-body-16-medium' },
  small: { normal: 'text-body-14', medium: 'text-body-14-medium', bold: 'text-body-14-medium' },
  body: { normal: 'text-body', medium: 'text-body-medium', bold: 'text-body-medium' },
  tiny: {
    normal: 'text-caption-12',
    medium: 'text-caption-12-medium',
    bold: 'text-caption-12-medium',
  },
  extraTiny: {
    normal: 'text-caption-10',
    medium: 'text-caption-10-medium',
    bold: 'text-caption-10-medium',
  },
} satisfies Record<TextSize, Record<TextWeight, string>>;

const TEXT_SKIN_CLASSES = {
  standard: 'text-fg-heading',
  muted: 'text-fg-muted',
  primary: 'text-link',
  success: 'text-success',
  warning: 'text-warning',
  error: 'text-error',
  disabled: 'text-fg-faint',
} satisfies Record<TextSkin, string>;

/**
 * Text — chữ theo token cỡ / nét / màu của UI kit; mặc định là `<span>` inline.
 *
 * Nhận thêm mọi thuộc tính của phần tử được render (`id`, `style`, `aria-*`…). Tiêu đề có cấp
 * (h1…h6) dùng `Heading`, hoặc `<Text as="h2">` khi cần cỡ chữ khác cấp thẻ.
 * Sửa giao diện: cỡ + nét → `TEXT_SIZE_CLASSES[size][weight]` · màu → `TEXT_SKIN_CLASSES`.
 * Lưu ý: nét chỉ qua `weight`, KHÔNG thêm `font-*` cạnh token chữ (token đã gói cả nét). Chữ trên nền
 * tối CỐ ĐỊNH (vd Header) dùng `className="text-fg-on-chrome"`, không dùng `skin`
 * — docs/notes/components/primitives.md.
 *
 * @param props.as - Thẻ / component render ra (`'p'`, `'h2'`, `'label'`…). Mặc định `'span'`.
 * @param props.size - Cỡ: `extraLarge` 24px | `large` 20px | `medium` 16px | `small` 14px | `body` 13px
 *   | `tiny` 12px | `extraTiny` 10px. Mặc định `medium`.
 * @param props.weight - Nét: `normal` (400) | `medium` (500) | `bold` (≡ `medium`, Figma chỉ có 400 / 500).
 *   Mặc định `normal`.
 * @param props.skin - Màu: `standard` | `muted` | `primary` (màu link) | `success` | `warning` | `error`
 *   | `disabled`. Mặc định `standard`.
 * @param props.ellipsis - `true` → cắt một dòng bằng "…" không gọt dấu (`block` + `TEXT_ELLIPSIS_CLASSES`), chỉ khi BỊ TRÀN mới hiện `Tooltip`
 *   với nội dung `title` ?? `children` (khi là chuỗi). Mặc định `false`.
 * @param props.title - Không `ellipsis`: gắn thẳng lên phần tử (tooltip gốc trình duyệt). Có `ellipsis`:
 *   thành nội dung `Tooltip`, KHÔNG gắn thuộc tính `title` (tránh hai tooltip chồng nhau).
 *
 * @example
 * <Text size="small" weight="medium" skin="muted">Ghi chú</Text>
 *
 * <Text ellipsis as="p" size="tiny">{project.longName}</Text>
 */
function Text({
  as: Tag = 'span',
  size = 'medium',
  weight = 'normal',
  skin = 'standard',
  ellipsis = false,
  title,
  className,
  children,
  ...rest
}: TextProps) {
  const ref = useRef<HTMLElement | null>(null);
  const [overflowing, setOverflowing] = useState(false);

  useEffect(() => {
    if (!ellipsis) return;
    const el = ref.current;
    if (!el) return;
    const check = () => setOverflowing(el.scrollWidth > el.clientWidth);
    check();
    const observer = new ResizeObserver(check);
    observer.observe(el);
    return () => observer.disconnect();
  }, [ellipsis, children]);

  const textClassName = cn(
    TEXT_SIZE_CLASSES[size][weight],
    TEXT_SKIN_CLASSES[skin],
    ellipsis && ['block', TEXT_ELLIPSIS_CLASSES],
    className,
  );

  const node = (
    <Tag ref={ref} className={textClassName} title={ellipsis ? undefined : title} {...rest}>
      {children}
    </Tag>
  );

  const tooltipContent = title ?? (typeof children === 'string' ? children : undefined);

  if (!ellipsis || tooltipContent == null) return node;

  return (
    <Tooltip content={tooltipContent} open={overflowing ? undefined : false}>
      {node}
    </Tooltip>
  );
}

export default Text;
