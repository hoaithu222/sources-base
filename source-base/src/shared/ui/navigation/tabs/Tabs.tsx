import * as TabsPrimitive from '@radix-ui/react-tabs';
import { cn } from '@/shared/utils/style/cn';

export interface TabOption {
  key: string;
  label: string;
  icon?: React.ReactNode;
  /** Nội dung đứng SAU nhãn, vd badge đếm (`<Badge size="xs">3</Badge>`). */
  trailing?: React.ReactNode;
  disabled?: boolean;
}

export type TabsSize = 'sm' | 'md' | 'lg';
export type TabsIndicator = 'top' | 'bottom';
export type TabsVariant = 'line' | 'folder';

export interface TabsProps {
  options: TabOption[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  size?: TabsSize;
  variant?: TabsVariant;
  indicator?: TabsIndicator;
  right?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
  listClassName?: string;
  headerClassName?: string;
}

const TABS_HEADER_CLASSES = 'flex min-w-0 shrink-0 items-center justify-between gap-3';
const TABS_ACTIONS_CLASSES = 'flex shrink-0 items-center gap-2';
const TABS_ICON_CLASSES = 'shrink-0 inline-flex items-center justify-center [&>svg]:size-4';

const TABS_LIST_BASE_CLASSES = cn(
  'flex min-w-0 max-w-full gap-2 overflow-x-auto overscroll-x-contain scrollbar-hidden',
  'touch:-my-1 touch:py-1',
);

const TABS_LIST_INDICATOR_CLASSES = {
  top: 'items-start',
  bottom: 'items-end',
} satisfies Record<TabsIndicator, string>;

const TABS_TRIGGER_BASE_CLASSES = cn(
  'relative inline-flex items-center gap-1 shrink-0 cursor-pointer',
  'px-3 text-body-14 whitespace-nowrap',
  'border-transparent text-fg-body',
  'transition-[color,border-color,background-color,box-shadow] duration-150 ease-out',
  'hover:text-fg-heading',
  'data-[state=active]:border-action-base data-[state=active]:text-action-base',
  'data-[state=active]:from-[color-mix(in_srgb,var(--color-primary-5)_14%,transparent)] data-[state=active]:to-transparent',
  'data-[state=active]:hover:text-action-base',
  'data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50 data-[disabled]:hover:text-fg-body',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring-focus',
  "touch:after:absolute touch:after:inset-x-0 touch:after:-inset-y-1 touch:after:content-['']",
);

const TABS_TRIGGER_SIZE_CLASSES = {
  sm: 'h-8',
  md: 'h-9',
  lg: 'h-10',
} satisfies Record<TabsSize, string>;

/**
 * `line` — vạch 2px + vệt đổ về phía vạch. Tối: vạch `primary-4` + quầng TRONG sát vạch, vệt pha ngọc (HUD_HOT) đậm
 * hơn, chữ phát sáng; rê tab nghỉ → vạch mờ hiện ra. Quầng phải `inset` — dải tab `overflow-x-auto` cắt mọi quầng ngoài.
 */
const TABS_LINE_ACTIVE_CLASSES = cn(
  'dark:data-[state=active]:border-primary-4 dark:data-[state=inactive]:enabled:hover:border-primary-5/35',
  'dark:data-[state=active]:from-[color-mix(in_srgb,color-mix(in_srgb,var(--color-primary-5)_72%,var(--color-teal-5))_26%,transparent)]',
  'dark:data-[state=active]:[text-shadow:0_0_10px_color-mix(in_srgb,var(--color-primary-4)_55%,transparent)]',
);

const TABS_TRIGGER_INDICATOR_CLASSES = {
  top: cn(
    'border-t-2 data-[state=active]:bg-linear-to-b',
    TABS_LINE_ACTIVE_CLASSES,
    'dark:data-[state=active]:shadow-[inset_0_7px_8px_-7px_color-mix(in_srgb,var(--color-primary-4)_85%,transparent)]',
  ),
  bottom: cn(
    'border-b-2 data-[state=active]:bg-linear-to-t',
    TABS_LINE_ACTIVE_CLASSES,
    'dark:data-[state=active]:shadow-[inset_0_-7px_8px_-7px_color-mix(in_srgb,var(--color-primary-4)_85%,transparent)]',
  ),
} satisfies Record<TabsIndicator, string>;

/**
 * `folder` — tab hình thang trên vạch đáy: viền 1px = NỀN trigger đã `clip-path`, thân = `::before` thụt 1px cùng hình.
 * Đang mở: thân xanh lá pha ngọc + vạch sáng đỉnh (`inset` shadow); quầng chỉ `dark:` — notes/components/navigation.md.
 */
const TABS_FOLDER_LIST_CLASSES = 'gap-1 border-b border-border-default dark:border-hud-5/35';

const TABS_FOLDER_TRIGGER_CLASSES = cn(
  'isolate -mb-px justify-center px-5 text-body-14-medium',
  '[clip-path:polygon(10px_0,calc(100%_-_10px)_0,100%_100%,0_100%)]',
  "before:absolute before:inset-x-px before:top-px before:bottom-0 before:-z-10 before:content-['']",
  'before:[clip-path:polygon(10px_0,calc(100%_-_10px)_0,100%_100%,0_100%)]',
  'bg-border-default before:bg-bg-subtle text-fg-muted',
  'dark:bg-primary-5/30 dark:before:bg-[linear-gradient(to_top,color-mix(in_srgb,var(--color-primary-5)_8%,var(--color-bg-surface)),var(--color-bg-surface))]',
  'hover:text-fg-heading dark:hover:bg-primary-5/55',
  'data-[state=active]:bg-primary-6 data-[state=active]:text-action-base data-[state=active]:before:bg-bg-surface',
  'dark:data-[state=active]:bg-primary-4 dark:data-[state=active]:text-fg-heading',
  'dark:data-[state=active]:before:bg-[linear-gradient(to_top,color-mix(in_srgb,color-mix(in_srgb,var(--color-primary-5)_72%,var(--color-teal-5))_46%,var(--color-bg-surface)),color-mix(in_srgb,var(--color-primary-5)_10%,var(--color-bg-surface)))]',
  'dark:data-[state=active]:before:shadow-[inset_0_2px_0_var(--color-primary-3)]',
  'dark:data-[state=active]:[text-shadow:0_0_10px_color-mix(in_srgb,var(--color-primary-4)_55%,transparent)]',
  'touch:min-h-10',
);

/**
 * Tabs — thanh tab ngang (Radix Tabs) chia một vùng thành nhiều khung nội dung cùng cấp; tab chọn có
 * vạch 2px `action-base` + vệt primary đổ về phía vạch. Nội dung từng tab đặt trong
 * `<TabsPanel value="…">` làm con. Form chia tab có đếm lỗi thì dùng `FormTabs`; chọn một giá trị (không đổi
 * khung) thì `SegmentToggle`.
 *
 * Hai chế độ: controlled (`value` + `onValueChange`) hoặc uncontrolled (`defaultValue`, mặc định tab đầu).
 * Bàn phím: ←/→ chuyển tab, Home/End về đầu/cuối (Radix). Cảm ứng: vùng bấm mỗi tab nới ≥ 40px bằng `::after`.
 * Sửa giao diện: cỡ → `TABS_TRIGGER_SIZE_CLASSES` · vạch + gradient → `TABS_TRIGGER_INDICATOR_CLASSES`
 * · chữ / trạng thái → `TABS_TRIGGER_BASE_CLASSES` · kiểu thẻ hồ sơ → `TABS_FOLDER_TRIGGER_CLASSES` + `TABS_FOLDER_LIST_CLASSES`.
 * Lưu ý: `FormTabs` dùng CHÍNH class này (tests/shared/form-tabs.test.tsx) — không thêm bậc primary-1 / -7.
 * Dải tab tràn ngang thì cuộn (ẩn thanh cuộn); focus ring vẽ `ring-inset` để không bị cắt.
 *
 * @param props.options - Danh sách tab `{ key, label, icon?, trailing?, disabled? }`; `key` khớp với
 *   `value` của `TabsPanel`.
 * @param props.value - Tab đang chọn (controlled).
 * @param props.defaultValue - Tab chọn sẵn khi uncontrolled. Mặc định `options[0].key`.
 * @param props.onValueChange - Gọi với `key` của tab vừa chọn.
 * @param props.size - Chiều cao tab: `sm` 32px | `md` 36px | `lg` 40px. Mặc định `md`.
 * @param props.variant - Kiểu: `line` (vạch chỉ báo 2px) | `folder` (tab hình thang trên vạch đáy — đầu khung chi tiết,
 *   màn điều hành). Mặc định `line`.
 * @param props.indicator - Cạnh đặt vạch chỉ báo: `top` | `bottom`; chỉ có nghĩa với `variant="line"`. Mặc định `top`.
 * @param props.right - Hành động sát mép phải, cùng hàng với dải tab (vd nút "Tạo mới").
 * @param props.children - Các `TabsPanel`.
 * @param props.className - Class của khung gốc.
 * @param props.listClassName - Class thêm cho dải tab.
 * @param props.headerClassName - Class của hàng header (dải tab + `right`) — CHỈ có tác dụng khi truyền
 *   `right` (không có `right` thì không có hàng bọc).
 *
 * @example
 * <Tabs
 *   options={[
 *     { key: 'info', label: 'Thông tin' },
 *     { key: 'log', label: 'Nhật ký', trailing: <Badge size="xs">3</Badge> },
 *   ]}
 *   value={tab}
 *   onValueChange={setTab}
 *   right={<Button size="sm">Tạo mới</Button>}
 * >
 *   <TabsPanel value="info">…</TabsPanel>
 *   <TabsPanel value="log">…</TabsPanel>
 * </Tabs>
 */
function Tabs({
  options,
  value,
  defaultValue,
  onValueChange,
  size = 'md',
  variant = 'line',
  indicator = 'top',
  right,
  children,
  className,
  listClassName,
  headerClassName,
}: TabsProps) {
  const isFolder = variant === 'folder';
  const triggerClassName = cn(
    TABS_TRIGGER_BASE_CLASSES,
    TABS_TRIGGER_SIZE_CLASSES[size],
    isFolder ? TABS_FOLDER_TRIGGER_CLASSES : TABS_TRIGGER_INDICATOR_CLASSES[indicator],
  );

  const triggerElements = options.map((option) => (
    <TabsPrimitive.Trigger
      key={option.key}
      className={triggerClassName}
      disabled={option.disabled}
      value={option.key}
    >
      {option.icon && <span className={TABS_ICON_CLASSES}>{option.icon}</span>}
      {option.label}
      {option.trailing}
    </TabsPrimitive.Trigger>
  ));

  const listElement = (
    <TabsPrimitive.List
      className={cn(
        TABS_LIST_BASE_CLASSES,
        TABS_LIST_INDICATOR_CLASSES[isFolder ? 'bottom' : indicator],
        isFolder && TABS_FOLDER_LIST_CLASSES,
        listClassName,
      )}
    >
      {triggerElements}
    </TabsPrimitive.List>
  );

  return (
    <TabsPrimitive.Root
      className={className}
      defaultValue={defaultValue ?? options[0]?.key}
      value={value}
      onValueChange={onValueChange}
    >
      {right ? (
        <div className={cn(TABS_HEADER_CLASSES, headerClassName)}>
          {listElement}
          <div className={TABS_ACTIONS_CLASSES}>{right}</div>
        </div>
      ) : (
        listElement
      )}
      {children}
    </TabsPrimitive.Root>
  );
}

export default Tabs;
