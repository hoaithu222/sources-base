/**
 * Mặt tiền công khai của bộ component giao diện.
 *
 * ── Cách dùng ────────────────────────────────────────────────────────────────
 *     import { Chip, Input, ListItem } from '@/shared/ui';
 *
 * Nhóm nào cũng có barrel riêng (`@/shared/ui/chip`), nhưng nhập từ đây là
 * đường chính: nơi gọi không phải nhớ component nằm ở thư mục nào, và đổi chỗ
 * một file trong `src/shared/ui/` không kéo theo sửa hàng loạt lời gọi.
 *
 * ── ⛔ Vì sao `feedback/` KHÔNG có ở đây ─────────────────────────────────────
 * `ToastHost` mount đúng MỘT lần ở gốc cây (`AppProviders`), và `toast-store` là
 * hạ tầng chứ không phải component để đặt vào màn hình. Gom chúng vào barrel này
 * là mời người ta `import { ToastHost }` rồi mount lần thứ hai — lúc đó mỗi
 * toast hiện ra hai bản chồng lên nhau. Hai file đó nhập thẳng theo đường đầy đủ.
 *
 * ── ⚠️ Barrel và import vòng ─────────────────────────────────────────────────
 * ⛔ Component TRONG `src/shared/ui/` tuyệt đối không được nhập từ `@/shared/ui`
 * — kể cả khi cần dùng lẫn nhau. Nhập chéo qua barrel tạo vòng
 * (`Card → index → Card`), mà trên React Native vòng hiện ra lúc CHẠY dưới dạng
 * `undefined is not a function` ở một file KHÔNG liên quan tới chỗ sai. Cần
 * `Chip` bên trong `Card` thì nhập thẳng `'../chip/Chip'`.
 * ESLint chặn cứng (`import/no-cycle`, `maxDepth: Infinity`).
 *
 * ── Trạng thái ───────────────────────────────────────────────────────────────
 * Dựng theo design system BIDV OMNI MB. Số đo (chiều cao, giãn cách, bo góc) lấy
 * từ Figma; MÀU và CỠ CHỮ lấy từ hệ token của repo — nên đổi bảng màu chỉ cần
 * sửa `src/styles/colors/colors.json`, không đụng file component nào.
 *
 * ⚠️ Muốn thêm component mới thì tra ở ĐÂY trước. Viết một cái nút thứ hai
 * trong feature là cách chắc chắn nhất để hai nút lệch nhau ở lần đổi token kế
 * tiếp — đúng thứ vừa phải đi dọn ở `EmptyState` (nó từng có nút riêng, nay
 * dùng `Button` chung).
 */

export { Alert } from './alert';
export type { AlertProps, AlertTone } from './alert';

export { Avatar, getInitials } from './avatar';
export type { AvatarBadgeTone, AvatarProps, AvatarShape, AvatarSize } from './avatar';

/**
 * ⚠️ Có BA lớp phủ, đừng nhầm lẫn:
 *  · `BottomSheet` — tấm trượt đáy DÙNG CHUNG, cho mọi nội dung.
 *  · `TooltipSheet` — bản chuyên dụng cho tooltip cấp 3 (nội dung > 5 dòng),
 *    dựng sẵn tiêu đề + danh sách gạch đầu dòng theo đúng bản vẽ tooltip.
 *  · `Dialog` — hộp thoại giữa màn, dành cho việc BẮT người dùng quyết định.
 */
export { BottomSheet } from './bottom-sheet';
export type { BottomSheetProps } from './bottom-sheet';

export { Badge, BadgeAnchor } from './badge';
export type {
  BadgeAnchorProps,
  BadgeAppearance,
  BadgeProps,
  BadgeSize,
  BadgeVariant,
} from './badge';

/**
 * ⚠️ KHÔNG có `IconButton`. Trong Figma nút chỉ-icon là thuộc tính
 * `Only icon=On` của CÙNG component set, nên ở đây nó là prop `iconOnly` của
 * `Button` — không phải component thứ hai.
 */
export { Button, LinkButton } from './button';
export type {
  ButtonProps,
  ButtonSize,
  ButtonVariant,
  LinkButtonProps,
  LinkButtonSize,
  LinkButtonTone,
} from './button';

/**
 * ⚠️ `MediaCard` cố ý KHÔNG khai bề rộng. `165.5` của lưới 2 cột là
 * `(343 − 12) / 2`, không phải hằng số — nơi gọi lo bằng `flex-1` trong
 * `flex-row gap-sm`, rail ngang thì lớp bọc đặt `width: 276`. Viết cứng bề rộng
 * là tràn cột trên máy 320dp và lọt thỏm trên máy tính bảng.
 *
 * ⛔ Thẻ có `onPress` thì đừng đặt nút vào `footer`: `MediaCard` gộp cả thẻ
 * thành MỘT ô trợ năng, nút lồng bên trong sẽ không tới được trình đọc màn hình.
 */
export { AccountCard, Card, MEDIA_ASPECT_RATIO, MediaCard, Thumbnail } from './card';
export type {
  AccountCardProps,
  CardProps,
  /**
   * ⚠️ Tên đã lệch nghĩa: kiểu này giờ dùng cho cả `Thumbnail`, không riêng
   * `MediaCard`. Giữ nguyên vì đổi tên là phá API công khai.
   */
  MediaCardAspect,
  MediaCardProps,
  ThumbnailProps,
} from './card';

export { Checkbox } from './checkbox';
export type { CheckboxProps, CheckboxSize } from './checkbox';

export { Chip } from './chip';
export type { ChipProps, ChipRole, ChipSize } from './chip';

/**
 * ⚠️ `Calendar` là tấm lịch TRẦN, `DatePicker` là ô nhập mở tấm lịch trong
 * bottom sheet. Màn hình thường cần cái thứ hai; cái thứ nhất chỉ dùng khi
 * lịch phải nằm sẵn trên màn (bộ lọc báo cáo), và lúc đó nơi gọi tự lo phần
 * hiển thị giá trị đã chọn.
 */
export {
  Calendar,
  DATE_FORMAT_DEFAULT,
  DatePicker,
  MONTH_FORMAT_DEFAULT,
  VI_LOCALE,
  YEAR_FORMAT_DEFAULT,
} from './date-picker';
export type {
  CalendarProps,
  DatePickerMode,
  DateLike,
  /**
   * ⚠️ `mode` và `precision` là HAI trục khác nhau, đừng nhầm:
   *  · `mode` — chọn MỘT ngày (`single`) hay một KHOẢNG (`range`).
   *  · `precision` — dừng ở `day` · `month` · `year`, hoặc đi lần lượt
   *    `year-month-day`. Chỉ có nghĩa với `mode="single"`.
   * Mọi `precision` đều trả về `Date`, nên `onChange` không đổi kiểu.
   */
  DatePickerPrecision,
  DatePickerProps,
  DateRange,
} from './date-picker';

export { Divider } from './divider';
export type {
  DividerOrientation,
  DividerProps,
  DividerStyle,
  DividerThickness,
  DividerTone,
} from './divider';

/**
 * ⚠️ `EmptyStateProps` là union: phải có ÍT NHẤT một trong `title` | `description`.
 * Ghi chú thiết kế của Figma cho phép khối chỉ có mô tả ("chỉ 1 thông điệp thì
 * show description text"), nên `title` không còn bắt buộc — nhưng khối rỗng
 * hoàn toàn thì `tsc` chặn.
 */
export { EmptyState } from './empty-state';
export type { EmptyStateActionProps, EmptyStateProps } from './empty-state';

/**
 * ⚠️ `Icon` là component DUY NHẤT của repo được nhập từ cả hai đường, và đó là
 * chủ ý: component BÊN TRONG `src/shared/ui/` phải nhập `@/shared/ui/icon`
 * (nhập qua barrel tổng là import vòng), còn màn hình và feature thì nhập từ
 * đây cho gọn.
 *
 * ⛔ Tên icon là union THẬT (`IconName`, 303 tên) — gõ sai là `tsc` đỏ ngay, chứ
 * không hỏng âm thầm. Tra tên bằng `ls assets/icons/system`, ⛔ đừng đoán:
 * `close`/`check`/`chevron-down` KHÔNG tồn tại, phải là `cancel` /
 * `checkmark-circle` / `arrow-down-small`.
 */
export { Icon, ICON_NAMES } from './icon';
export type { IconName, IconProps, IconVariant } from './icon';

/**
 * Thanh phụ nằm TRÊN bàn phím (nút "Xong" để đóng).
 *
 * ⚠️ Dựng bằng `KeyboardStickyView` chứ không phải `InputAccessoryView` —
 * cái sau chỉ chạy trên iOS, mà đây là base Android. ⛔ Đừng cộng
 * `insets.bottom`: thanh nằm trên bàn phím, không nằm ở đáy màn.
 */
export { KeyboardBar } from './keyboard';
export type { KeyboardBarProps } from './keyboard';

export { FormInput, Input } from './input';
export type { FormInputProps, InputProps } from './input';

export { ListItem } from './list';
export type { ListItemProps } from './list';

export { Dialog } from './modal';
export type { DialogActionProps, DialogProps, DialogVariant } from './modal';

export { AppBar, BottomActionBar, BottomNav } from './navigation';
export type { BottomNavItem } from './navigation';

export { SliderDot } from './pagination';
export type { SliderDotProps } from './pagination';

/**
 * ⚠️ Hai kiểu ô PIN, chọn theo NGỮ CẢNH chứ không theo thẩm mỹ:
 *  · `box` (mặc định) — ô vuông hiện ký tự, cho OTP nhận qua SMS.
 *  · `dot` — vòng tròn ⌀32 chỉ hiện chấm, cho màn nhập PIN đăng nhập. Kiểu này
 *    tự đặt `autoComplete="off"`: mã không đến từ SMS nên gợi ý tự điền chỉ tổ
 *    che mất bàn phím.
 */
export { PinInput } from './pin';
export type { PinInputProps, PinVariant } from './pin';

export { Radio, RadioGroup } from './radio';
export type { RadioGroupProps, RadioProps } from './radio';

export { Progress, ProgressStep } from './progress';
export type {
  ProgressProps,
  ProgressStatus,
  ProgressStepItem,
  ProgressStepProps,
} from './progress';

export {
  Skeleton,
  SkeletonBottomBarItem,
  SkeletonParagraph,
  SkeletonParagraphWithIcon,
  SkeletonText,
} from './skeleton';
export type {
  SkeletonBottomBarItemProps,
  SkeletonParagraphProps,
  SkeletonParagraphWithIconProps,
  SkeletonProps,
  SkeletonTextProps,
} from './skeleton';

/**
 * ⛔ Ô tìm kiếm ở đây là UNCONTROLLED, và đó là ràng buộc bắt buộc chứ không
 * phải lựa chọn: `value` bị `Omit` khỏi props nên truyền vào là `tsc` đỏ.
 *
 * Lý do — ghi đè state giữa lúc bộ gõ đang ghép dấu làm MẤT DẤU hoặc nhảy con
 * trỏ về đầu trên Android + Telex. Người dùng gõ "mét khối" ra "met khoi" và
 * kết luận là app hỏng. ESLint của repo cũng chặn cứng ca này.
 */
export { SearchInput, useSearchInput } from './search';
export type { SearchInputHandle, SearchInputProps } from './search';

/**
 * Khung màn hình: vùng an toàn + dải gradient đầu màn + vùng cuộn né bàn phím.
 *
 * ⚠️ Với `gradient` đang bật thì `<AppBar>` phải để MẶC ĐỊNH (trong suốt) —
 * ⛔ đừng truyền `opaque`. Thanh tiêu đề nằm TRÊN dải màu; cho nó nền riêng là
 * thành hai mảng màu chồng nhau, và mép nối hiện ra thành một đường ngang không
 * có trong bản vẽ.
 */
export { Screen } from './screen';
export type { ScreenProps } from './screen';

/**
 * Tiêu đề nhóm nội dung — thứ LẶP NHIỀU NHẤT trong bản vẽ (29–60 lần).
 *
 * ⚠️ Tiêu đề nằm NGOÀI thẻ, không phải trong. Đừng nhầm với `Card.title`:
 *   <Section title="Thông tin đơn hàng"><Card>…</Card></Section>
 * Khe tiêu đề → nội dung (12) do `Section` lo; khe 24 giữa hai `Section` thì
 * nơi gọi lo — gộp cả hai vào component là cộng dồn `gap` sai.
 */
export { Section } from './section';
export type { SectionProps, SectionTone } from './section';

/**
 * Ô CHỌN — trông như `Input` nhưng bấm để mở tấm trượt, không gõ được.
 *
 * ⛔ Đừng thay bằng `<Input readOnly onPress>`: `InputProps` không có `onPress`,
 * và `readOnly` của `Input` đổi hình thức sang nền xám bỏ viền, trong khi ô chọn
 * phải trắng + có viền y như ô nhập thường.
 *
 * ⚠️ `FormSelect` nhận `format` chứ không nhận `value`: form giữ MÃ, ô hiện TÊN.
 * Truyền `value` từ state riêng thì `reset()`/`setValue()` làm ô hiện tên CŨ
 * trong khi dữ liệu gửi đi là mã MỚI.
 */
export { FormSelect, Select, SelectSheet } from './select';
export type {
  FormSelectProps,
  SelectOption,
  SelectProps,
  SelectSheetProps,
  SelectTone,
} from './select';

/**
 * Ô tăng/giảm số lượng.
 *
 * ⚠️ Khung dùng lại `inputStyles().field()` — trong bản vẽ đây là một biến thể
 * của chính ô nhập, nên bo góc/viền/đệm phải khớp mọi ô còn lại trong form.
 * Bề rộng 126 tự ra từ nhịp bên trong; ⛔ đừng đóng cứng, "100" phải nới được.
 */
export { Stepper } from './stepper';
export type { StepperProps } from './stepper';

export { Tabs } from './tab';
export type { TabItemData, TabsProps, TabsVariant } from './tab';

export { Toggle } from './toggle';
export type { ToggleProps, ToggleSize } from './toggle';

export { Tooltip, TooltipSheet } from './tooltip';
export type { TooltipProps, TooltipSheetProps } from './tooltip';

/**
 * Ngưỡng 4 cấp nội dung tooltip, trích thẳng từ ghi chú thiết kế trong Figma
 * ("Max 2 dòng, 56 ký tự…"). Nơi gọi cần chúng để biết khi nào phải chuyển từ
 * bong bóng sang tấm trượt đáy (cấp 3) hay sang màn hình riêng (cấp 4).
 */
export {
  isHtmlTooltipContent,
  resolveTooltipLevel,
  TOOLTIP_LEVEL_1_MAX_CHARS,
  TOOLTIP_LEVEL_1_MAX_LINES,
  TOOLTIP_LEVEL_2_MAX_CHARS,
  TOOLTIP_LEVEL_2_MAX_LINES,
  TOOLTIP_LEVEL_3_MIN_LINES,
} from './tooltip';
export type { TooltipLevel, TooltipPlacement } from './tooltip';
