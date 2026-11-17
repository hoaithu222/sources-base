import { cn } from '@/shared/utils/style/cn';

/**
 * hud-frame.theme — bảng class của HudFrame: thẻ bo `lg`, viền gradient 1px, bóng nghỉ — CÙNG MỘT hình ở cả hai theme.
 *
 * Dùng:   cn(HUD_FRAME_CLASSES.root, glow && HUD_FRAME_CLASSES.glow, className)
 * Sửa:    viền gradient → root · bóng nghỉ → glow · thân → body · lớp chứa nội dung → content
 * Lưu ý:  viền là lớp `p-px` lộ nền gradient của root (dốc dọc nhạt → `border-default` → đậm, cùng công thức `rim-soft`);
 *         thân bo `lg − 1px` để khít viền, nền `bg-surface` tự lật theo theme.
 */

export const HUD_FRAME_CLASSES = {
  root: cn(
    'relative isolate h-full min-h-0 rounded-lg p-px',
    'bg-[linear-gradient(to_bottom,color-mix(in_srgb,var(--color-border-default)_55%,var(--color-bg-surface)),var(--color-border-default)_40%,color-mix(in_srgb,var(--color-border-strong)_75%,var(--color-border-default)))]',
  ),
  glow: 'shadow-(--elev-1)',
  body: 'relative flex h-full min-h-0 flex-col overflow-hidden rounded-[calc(var(--radius-lg)-1px)] bg-bg-surface',
  content: 'relative z-10 flex h-full min-h-0 flex-col',
} satisfies Record<'root' | 'glow' | 'body' | 'content', string>;
