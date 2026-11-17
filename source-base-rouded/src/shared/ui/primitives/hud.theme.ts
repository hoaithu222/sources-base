/**
 * hud.theme.ts — CÔNG THỨC HUD cũ (theme tối của `source-base-light`), nay đã VÔ HIỆU.
 *
 * `source-base-rouded` không còn ngôn ngữ HUD: theme tối cùng hình học với theme sáng, chỉ khác bảng màu (macOS
 * dark). Mọi hằng dưới đây từng chỉ có biến thể `dark:` (quầng, gradient, ngoặc góc, ray sáng, dấu `//`) nên được đặt
 * thành chuỗi RỖNG — nơi còn gọi chúng không còn tạo ra lớp HUD nào. Riêng `HUD_TITLE_MARK` giữ phần SÁNG (vạch dọc bo tròn).
 * Giai đoạn dọn dẹp sẽ gỡ nốt các lời gọi rồi xoá file này; ĐỪNG thêm hằng mới và đừng dùng ở code mới.
 */

/** Giá trị CSS (không phải class) — còn ở vài chỗ pha màu; sẽ xoá cùng file. */
export const HUD_HOT = 'color-mix(in srgb, var(--color-primary-5) 72%, var(--color-teal-5))';

export const HUD_LIT_FILL = '';
export const HUD_PANEL_FILL = '';
export const HUD_HOVER_GLOW = '';
export const HUD_FOCUS_GLOW = '';
export const HUD_FOCUS_GLOW_ERROR = '';
export const HUD_ACTIVE_FILL = '';
export const HUD_SOLID_PRIMARY = '';
export const HUD_TEXT_GLOW = '';
export const HUD_BRACKETS_BEFORE = '';
export const HUD_BRACKETS_AFTER = '';
export const HUD_TOP_RAIL_AFTER = '';
export const HUD_ROW_HIGHLIGHT = '';
export const HUD_TRACK = '';
export const HUD_BAR_GLOW = '';
export const HUD_BAR_HEAD_AFTER = '';

/** Dấu trước tiêu đề khối: vạch dọc ngọc bo tròn (bo `xs`), như theme sáng — ở cả hai theme. */
export const HUD_TITLE_MARK = 'h-3.5 w-[3px] shrink-0 rounded-xs bg-primary-6';
