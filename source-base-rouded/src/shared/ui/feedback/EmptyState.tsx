import { SystemIcon, type BoldSystemIconName } from '@/shared/ui/icons/Icons';
import Heading, { type HeadingSize } from '@/shared/ui/primitives/Heading';
import Text, { type TextSize } from '@/shared/ui/primitives/Text';
import { cn } from '@/shared/utils/style/cn';

export type EmptyStateSize = 'sm' | 'md' | 'lg';
export type EmptyStateIconColor = 'neutral' | 'primary' | 'sky' | 'yellow' | 'red' | 'green';

export interface EmptyStateProps {
  title: React.ReactNode;
  description?: React.ReactNode;
  size?: EmptyStateSize;
  icon?: BoldSystemIconName | React.ReactNode;
  iconColor?: EmptyStateIconColor;
  illustration?: React.ReactNode;
  action?: React.ReactNode;
  titleClassName?: string;
  className?: string;
}

const EMPTY_STATE_BASE_CLASSES = 'flex w-full flex-col items-center justify-center text-center';

const EMPTY_STATE_TEXT_CLASSES = 'flex max-w-md flex-col items-center gap-1';

const EMPTY_STATE_VISUAL_CLASSES = 'flex items-center justify-center';

/** Ô icon bo `rounded-lg` + viền tông 25% + nền tông 8%; KHÔNG ngoặc góc, KHÔNG quầng. */
const EMPTY_STATE_ICON_WRAP_BASE_CLASSES =
  'relative flex shrink-0 items-center justify-center rounded-lg border';

const EMPTY_STATE_SIZE_CLASSES = {
  sm: 'gap-2 p-3',
  md: 'gap-3 p-4',
  lg: 'gap-4 p-4',
} satisfies Record<EmptyStateSize, string>;

const EMPTY_STATE_ICON_WRAP_SIZE_CLASSES = {
  sm: 'size-10',
  md: 'size-14',
  lg: 'size-20',
} satisfies Record<EmptyStateSize, string>;

const EMPTY_STATE_ICON_PX = { sm: 20, md: 28, lg: 36 } satisfies Record<EmptyStateSize, number>;

const EMPTY_STATE_TITLE_SIZES = {
  sm: 'extraTiny',
  md: 'tiny',
  lg: 'small',
} satisfies Record<EmptyStateSize, HeadingSize>;

const EMPTY_STATE_DESCRIPTION_SIZES = {
  sm: 'tiny',
  md: 'small',
  lg: 'medium',
} satisfies Record<EmptyStateSize, TextSize>;

const EMPTY_STATE_ICON_COLOR_CLASSES = {
  neutral: 'border-border-default bg-bg-subtle text-fg-muted',
  primary: 'border-primary-5/25 bg-primary-5/8 text-primary-6 dark:text-primary-5',
  sky: 'border-sky-5/25 bg-sky-5/8 text-sky-7 dark:text-sky-5',
  yellow: 'border-yellow-5/30 bg-yellow-5/10 text-yellow-7 dark:text-yellow-5',
  red: 'border-red-5/25 bg-red-5/8 text-red-6 dark:text-red-5',
  green: 'border-green-5/25 bg-green-5/8 text-green-7 dark:text-green-5',
} satisfies Record<EmptyStateIconColor, string>;

const isIconName = (value: unknown): value is BoldSystemIconName => typeof value === 'string';

function renderVisual(
  size: EmptyStateSize,
  iconColor: EmptyStateIconColor,
  icon: EmptyStateProps['icon'],
  illustration: React.ReactNode,
) {
  if (illustration) return <div className={EMPTY_STATE_VISUAL_CLASSES}>{illustration}</div>;
  if (!isIconName(icon)) return icon && <div className={EMPTY_STATE_VISUAL_CLASSES}>{icon}</div>;

  const iconWrapClassName = cn(
    EMPTY_STATE_ICON_WRAP_BASE_CLASSES,
    EMPTY_STATE_ICON_WRAP_SIZE_CLASSES[size],
    EMPTY_STATE_ICON_COLOR_CLASSES[iconColor],
  );

  return (
    <div className={iconWrapClassName}>
      <SystemIcon name={icon} size={EMPTY_STATE_ICON_PX[size]} />
    </div>
  );
}

/**
 * EmptyState — khối "chưa có dữ liệu" / "không có kết quả" đặt giữa vùng nội dung (bảng, danh sách,
 * panel rỗng): ô icon bo mềm (hoặc minh hoạ), tiêu đề, mô tả, nút hành động.
 *
 * Ghép với `TableEmptyIllustration` qua `illustration` cho bảng rỗng; khối báo lỗi / cảnh báo thì
 * dùng `Callout`. Khối có `role="status"`.
 * Sửa giao diện: khoảng cách → `EMPTY_STATE_SIZE_CLASSES` · ô icon → `EMPTY_STATE_ICON_WRAP_BASE_CLASSES`
 * + `EMPTY_STATE_ICON_WRAP_SIZE_CLASSES` · cỡ icon → `EMPTY_STATE_ICON_PX`
 * · màu ô icon (viền + nền + icon) → `EMPTY_STATE_ICON_COLOR_CLASSES`
 * · cỡ chữ → `EMPTY_STATE_TITLE_SIZES` / `EMPTY_STATE_DESCRIPTION_SIZES`.
 * Lưu ý: `illustration` thắng `icon`; chuỗi bất kỳ truyền vào `icon` đều bị hiểu là TÊN icon.
 *
 * @param props.title - Tiêu đề (bắt buộc), render bằng `Heading` (`sm` → h6 · `md` → h5 · `lg` → h4).
 * @param props.description - Dòng mô tả dưới tiêu đề, chữ mờ, rộng tối đa `max-w-md`.
 * @param props.size - Cỡ khối: `sm` (panel nhỏ, icon 20px) | `md` (icon 28px) | `lg` (cả trang, icon 36px).
 *   Mặc định `sm`.
 * @param props.icon - Tên icon `-bold` → icon trong ô bo mềm tô nhạt | ReactNode → render thẳng,
 *   không khung. Mặc định `'inbox-bold'`.
 * @param props.iconColor - Màu ô icon: `neutral` | `primary` | `sky` | `yellow` | `red` | `green`; chỉ áp
 *   khi `icon` là tên icon. Mặc định `neutral`.
 * @param props.illustration - Minh hoạ render thẳng (vd `<TableEmptyIllustration />`); có thì bỏ qua
 *   `icon` / `iconColor`.
 * @param props.action - Nút / liên kết hành động dưới mô tả (nhiều nút xếp ngang, cách 8px).
 * @param props.titleClassName - Class thêm cho tiêu đề, vd `"text-caption-12"` để hạ cỡ chữ.
 * @param props.className - Class thêm cho khung ngoài (vd `min-h-0 flex-1` để lấp vùng còn lại).
 *
 * @example
 * <EmptyState icon="inbox-bold" title="Chưa có dữ liệu" action={<Button size="sm">Tạo mới</Button>} />
 *
 * <EmptyState illustration={<TableEmptyIllustration accentColor="sky" />} title="Không có kết quả" />
 */
function EmptyState({
  title,
  description,
  size = 'sm',
  icon = 'inbox-bold',
  iconColor = 'neutral',
  illustration,
  action,
  titleClassName,
  className,
}: EmptyStateProps) {
  const emptyStateClassName = cn(
    EMPTY_STATE_BASE_CLASSES,
    EMPTY_STATE_SIZE_CLASSES[size],
    className,
  );

  return (
    <div className={emptyStateClassName} role="status">
      {renderVisual(size, iconColor, icon, illustration)}

      <div className={EMPTY_STATE_TEXT_CLASSES}>
        <Heading className={titleClassName} size={EMPTY_STATE_TITLE_SIZES[size]}>
          {title}
        </Heading>
        {description && (
          <Text size={EMPTY_STATE_DESCRIPTION_SIZES[size]} skin="muted">
            {description}
          </Text>
        )}
      </div>

      {action && <div className="flex items-center gap-2">{action}</div>}
    </div>
  );
}

export default EmptyState;
