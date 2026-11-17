import { cn } from '@/shared/utils/style/cn';

/**
 * hud.theme.ts — công thức HUD DÙNG CHUNG của UI kit (theme tối): đổ sáng, viền sáng, quầng, ngoặc góc, mặt "đang bật",
 * dấu `//` tiêu đề. Mọi component lấy từ đây để cùng MỘT ngôn ngữ ánh sáng — không tự chép chuỗi `color-mix` riêng.
 *
 * Dùng:   cn(BASE, HUD_LIT_FILL, HUD_HOVER_GLOW, …) · ngoặc góc: HUD_BRACKETS_BEFORE + màu `dark:before:text-*`
 * Màu:    KHUNG / trang trí (mặt rọi, ngoặc, ray, dấu `//`) = họ `hud` (sky, nét cyan của bảng điều hành) · TƯƠNG TÁC /
 *         ĐANG BẬT (rê, focus, chọn, khối đặc, hàng trỏ) = `primary` (xanh lá chủ đạo). Không trộn hai vai trong một hằng.
 * Lưu ý:  ⛔ MỌI hằng ở đây CHỈ có biến thể `dark:` — theme sáng giữ sạch (`visual-hierarchy.md §0b`).
 *         ⛔ Ngoặc góc chiếm `::before` / `::after` — chọn hằng theo pseudo CÒN TRỐNG của component (touch-hit dùng
 *            `touch:after:`; vạch trái của hàng menu dùng `before:`). Màu ngoặc = `currentColor` của pseudo.
 *         Lý do: docs/notes/components/primitives.md (## hud.theme.ts)
 */

/** Sắc "đang bật" = xanh lá chủ đạo pha 28% ngọc (CSS value) — cùng sắc chip tab header, Dock, tab `folder`. */
export const HUD_HOT = 'color-mix(in srgb, var(--color-primary-5) 72%, var(--color-teal-5))';

/** Mặt nổi "được rọi từ trên": dốc xanh lá rất nhạt đỉnh → trong suốt (chỉ `background-image`, giữ màu nền token). */
export const HUD_LIT_FILL =
  'dark:bg-[linear-gradient(180deg,color-mix(in_srgb,var(--color-hud-5)_10%,transparent),color-mix(in_srgb,var(--color-hud-5)_2%,transparent)_70%)]';

/** Mặt panel / hộp nổi (khung lớn): dốc xanh dương rất nhạt đỉnh — trung tính hơn `HUD_LIT_FILL`, không ám xanh lá. */
export const HUD_PANEL_FILL =
  'dark:bg-[linear-gradient(180deg,color-mix(in_srgb,var(--color-hud-5)_7%,transparent),transparent_55%)]';

/** Rê chuột: viền sáng lên + quầng TRONG (control có viền 1px). */
export const HUD_HOVER_GLOW = cn(
  'dark:hover:border-primary-4/70',
  'dark:hover:shadow-[inset_0_0_14px_color-mix(in_srgb,var(--color-primary-5)_24%,transparent)]',
);

/** Focus / mở (ô nhập, trigger): vòng 1px + quầng ngoài + quầng trong — thay cho `ring` trơn. */
export const HUD_FOCUS_GLOW =
  'dark:shadow-[0_0_0_1px_color-mix(in_srgb,var(--color-primary-5)_55%,transparent),0_0_16px_-2px_color-mix(in_srgb,var(--color-primary-5)_55%,transparent),inset_0_0_12px_-4px_color-mix(in_srgb,var(--color-primary-5)_45%,transparent)]';

/** Cùng `HUD_FOCUS_GLOW` nhưng tông lỗi. */
export const HUD_FOCUS_GLOW_ERROR =
  'dark:shadow-[0_0_0_1px_color-mix(in_srgb,var(--color-error)_55%,transparent),0_0_16px_-2px_color-mix(in_srgb,var(--color-error)_50%,transparent),inset_0_0_12px_-4px_color-mix(in_srgb,var(--color-error)_40%,transparent)]';

/**
 * Mặt "ĐANG BẬT" (ô được chọn: ngày, trang, segment, hàng chọn): xanh-ngọc dâng từ đáy + vạch sáng đáy (inset) + quầng.
 * Viết sẵn cho cả trạng thái thường lẫn `data-[state=*]` không được — component ghép theo selector của mình.
 */
export const HUD_ACTIVE_FILL = cn(
  'dark:bg-[linear-gradient(0deg,color-mix(in_srgb,color-mix(in_srgb,var(--color-primary-5)_72%,var(--color-teal-5))_48%,transparent),color-mix(in_srgb,var(--color-primary-5)_12%,transparent))]',
  'dark:shadow-[inset_0_-2px_0_var(--color-primary-4),0_0_14px_-3px_color-mix(in_srgb,var(--color-primary-5)_60%,transparent)]',
);

/** Nút / ô đặc màu primary: dốc sáng đỉnh → đậm đáy + gờ sáng 1px đỉnh + quầng. Sáng: giữ nền đặc của component. */
export const HUD_SOLID_PRIMARY = cn(
  'dark:bg-linear-to-b dark:from-primary-5 dark:to-primary-7',
  'dark:shadow-[inset_0_1px_0_color-mix(in_srgb,var(--color-neutral-0)_30%,transparent),0_0_14px_-3px_color-mix(in_srgb,var(--color-primary-5)_70%,transparent)]',
);

/** Chữ phát sáng nhẹ (số KPI, nhãn đang bật). */
export const HUD_TEXT_GLOW =
  'dark:[text-shadow:0_0_10px_color-mix(in_srgb,var(--color-primary-4)_50%,transparent)]';

/**
 * Ngoặc 4 góc 8px (8 lớp gradient MỘT pseudo) ở `::before` — màu = `currentColor` của pseudo, tô bằng
 * `dark:before:text-*` (mặc định `primary-4/70`). Component cần `relative`.
 */
export const HUD_BRACKETS_BEFORE = cn(
  "dark:before:pointer-events-none dark:before:absolute dark:before:inset-0 dark:before:content-['']",
  'dark:before:text-hud-4/75',
  'dark:before:[background:linear-gradient(currentColor,currentColor)_no-repeat_left_top/8px_1.5px,linear-gradient(currentColor,currentColor)_no-repeat_left_top/1.5px_8px,linear-gradient(currentColor,currentColor)_no-repeat_right_top/8px_1.5px,linear-gradient(currentColor,currentColor)_no-repeat_right_top/1.5px_8px,linear-gradient(currentColor,currentColor)_no-repeat_left_bottom/8px_1.5px,linear-gradient(currentColor,currentColor)_no-repeat_left_bottom/1.5px_8px,linear-gradient(currentColor,currentColor)_no-repeat_right_bottom/8px_1.5px,linear-gradient(currentColor,currentColor)_no-repeat_right_bottom/1.5px_8px]',
);

/** Cùng `HUD_BRACKETS_BEFORE` nhưng ở `::after` — cho component đã dùng `::before`. */
export const HUD_BRACKETS_AFTER = cn(
  "dark:after:pointer-events-none dark:after:absolute dark:after:inset-0 dark:after:content-['']",
  'dark:after:text-hud-4/75',
  'dark:after:[background:linear-gradient(currentColor,currentColor)_no-repeat_left_top/8px_1.5px,linear-gradient(currentColor,currentColor)_no-repeat_left_top/1.5px_8px,linear-gradient(currentColor,currentColor)_no-repeat_right_top/8px_1.5px,linear-gradient(currentColor,currentColor)_no-repeat_right_top/1.5px_8px,linear-gradient(currentColor,currentColor)_no-repeat_left_bottom/8px_1.5px,linear-gradient(currentColor,currentColor)_no-repeat_left_bottom/1.5px_8px,linear-gradient(currentColor,currentColor)_no-repeat_right_bottom/8px_1.5px,linear-gradient(currentColor,currentColor)_no-repeat_right_bottom/1.5px_8px]',
);

/** Ray sáng mép TRÊN (mờ hai đầu) ở `::after` — đỉnh của lớp nổi, panel, thanh công cụ. */
export const HUD_TOP_RAIL_AFTER = cn(
  "dark:after:pointer-events-none dark:after:absolute dark:after:inset-x-4 dark:after:top-0 dark:after:h-px dark:after:content-['']",
  'dark:after:bg-linear-to-r dark:after:from-transparent dark:after:via-hud-4 dark:after:to-transparent',
);

/** Hàng danh sách đang rê / đang trỏ: dốc ngang xanh lá từ trái (dùng kèm vạch trái của component). */
export const HUD_ROW_HIGHLIGHT =
  'dark:bg-[linear-gradient(90deg,color-mix(in_srgb,var(--color-primary-5)_20%,transparent),color-mix(in_srgb,var(--color-primary-5)_4%,transparent)_85%)]';

/**
 * Dấu `//` trước tiêu đề khối (BoxPanel · SectionHeader · FormSection · khung hộp thoại): hai vạch nghiêng, vạch sau nhạt
 * 55%, MỘT gradient; quầng `drop-shadow` chỉ `dark:`.
 */
export const HUD_TITLE_MARK = cn(
  'h-4 w-[11px] shrink-0 -skew-x-[24deg]',
  'bg-[linear-gradient(90deg,var(--color-hud-6)_0_4px,transparent_4px_7px,color-mix(in_srgb,var(--color-hud-6)_55%,transparent)_7px_11px)]',
  'dark:bg-[linear-gradient(90deg,var(--color-hud-4)_0_4px,transparent_4px_7px,color-mix(in_srgb,var(--color-hud-4)_55%,transparent)_7px_11px)]',
  'dark:drop-shadow-[0_0_5px_color-mix(in_srgb,var(--color-hud-5)_70%,transparent)]',
);

/**
 * Họ THANH (rãnh + thanh đạt) — cùng hình với `Progress`: rãnh lõm (không vạch chia — thanh nằm dày trong bảng, vạch chia
 * thành nhiễu) · quầng thanh · điểm sáng 2px ở ĐẦU thanh. Thanh đặt biến `--hud-bar-tone` (style) và cần `relative`; gắn `HUD_BAR_HEAD_AFTER` chỉ khi giá trị > 0.
 */
export const HUD_TRACK = cn('dark:shadow-[inset_0_1px_2px_var(--color-shadow-popup)]');

export const HUD_BAR_GLOW =
  'dark:shadow-[0_0_8px_color-mix(in_srgb,var(--hud-bar-tone)_50%,transparent)]';

export const HUD_BAR_HEAD_AFTER = cn(
  "dark:after:absolute dark:after:inset-y-0 dark:after:right-0 dark:after:w-0.5 dark:after:content-['']",
  'dark:after:bg-[color-mix(in_srgb,var(--hud-bar-tone)_35%,var(--color-neutral-0))]',
  'dark:after:shadow-[0_0_6px_1px_var(--hud-bar-tone)]',
);
