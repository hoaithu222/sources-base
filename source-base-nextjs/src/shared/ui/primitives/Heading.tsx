import { cn } from '@/shared/utils/style/cn';

export type HeadingSize =
  'extraLarge' | 'large' | 'medium' | 'small' | 'tiny' | 'extraTiny' | 'micro' | 'nano';

type HeadingTag = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p';

export interface HeadingProps extends Omit<
  React.HTMLAttributes<HTMLHeadingElement & HTMLParagraphElement>,
  'color'
> {
  size?: HeadingSize;
  light?: boolean;
}

const HEADING_SIZE_CLASSES = {
  extraLarge: 'text-h1-medium',
  large: 'text-h2-medium',
  medium: 'text-h3-medium',
  small: 'text-h4-medium',
  tiny: 'text-body-18-medium',
  extraTiny: 'text-body-16-medium',
  micro: 'text-body-14-medium',
  nano: 'text-caption-12-medium',
} satisfies Record<HeadingSize, string>;

const HEADING_SIZE_TAGS = {
  extraLarge: 'h1',
  large: 'h2',
  medium: 'h3',
  small: 'h4',
  tiny: 'h5',
  extraTiny: 'h6',
  micro: 'p',
  nano: 'p',
} satisfies Record<HeadingSize, HeadingTag>;

/**
 * Heading — tiêu đề ngữ nghĩa: `size` chọn CẢ thẻ HTML (`h1`…`h6`, `p`) lẫn token chữ.
 *
 * Nhận thêm mọi thuộc tính của thẻ tiêu đề (`id`, `aria-*`…). Chữ inline / đoạn văn dùng `Text`;
 * cần cỡ chữ khác cấp thẻ thì dùng `<Text as="h2" size="…">`.
 * Sửa giao diện: cỡ chữ → `HEADING_SIZE_CLASSES` · thẻ HTML → `HEADING_SIZE_TAGS` · màu → nhánh `light`
 * trong `cn()`.
 * Lưu ý: đổi `size` là đổi CẤP tiêu đề trong cây heading của trang (trình đọc màn hình nhảy theo đó);
 * đừng chọn `size` chỉ vì cỡ chữ — docs/notes/components/primitives.md.
 *
 * @param props.size - Cấp: `extraLarge` h1 40px | `large` h2 32px | `medium` h3 24px | `small` h4 20px
 *   | `tiny` h5 18px | `extraTiny` h6 16px | `micro` `<p>` 14px | `nano` `<p>` 12px. Mọi cỡ nét Medium.
 *   Mặc định `medium`.
 * @param props.light - Màu chữ: `true` → `text-fg-heading` (đảo theo theme) | `false` → `text-fg-muted`
 *   (tiêu đề lùi một cấp). Mặc định `true`.
 *
 * @example
 * <Heading size="small">Thông tin chung</Heading>
 */
function Heading({ size = 'medium', light = true, className, children, ...rest }: HeadingProps) {
  const Tag = HEADING_SIZE_TAGS[size];
  const headingClassName = cn(
    HEADING_SIZE_CLASSES[size],
    light ? 'text-fg-heading' : 'text-fg-muted',
    className,
  );

  return (
    <Tag className={headingClassName} {...rest}>
      {children}
    </Tag>
  );
}

export default Heading;
