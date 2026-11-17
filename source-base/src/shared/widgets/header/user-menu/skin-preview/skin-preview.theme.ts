import { HEADER_HEIGHT_CLASS } from '@/shared/constants/layout.constants';
import { cn } from '@/shared/utils/style/cn';

/**
 * skin-preview.theme.ts — bảng class của ẢNH XEM TRƯỚC một kiểu khung header ở menu "Kiểu header": một lát thanh header thu 50% dựng bằng
 * chính chip / bảng tên thật (nên luôn khớp cấu hình và cỡ màn hình hiện tại), chữ thay bằng vạch.
 *
 * Dùng:   cn(SKIN_PREVIEW_CLASSES.frame) → khung cắt · .stage → sân khấu thu 50% (gắn thêm `spec.vars` của kiểu) · .tabBar / .plateTitle / .plateSubtitle → "chữ"
 * Lưu ý:  ⛔ Khung cao ĐÚNG nửa chiều cao thanh thật (20 · 22 · 26px = nửa `HEADER_HEIGHT_CLASS.height`) × 150px = nửa bề ngang sân khấu 300px.
 *         ⛔ Mọi biến màu / hình học do sân khấu tự khai (như `<header>`): `--header-bg`, `spec.vars`, `--plate-tone`.
 */

export const SKIN_PREVIEW_CLASSES = {
  frame:
    'pointer-events-none relative block h-5 w-[150px] shrink-0 overflow-hidden xl:h-[22px] wide:h-[26px]',
  stage: cn(
    'absolute top-0 left-0 flex w-[300px] origin-top-left scale-50 items-stretch',
    HEADER_HEIGHT_CLASS.height,
    'bg-bg-surface text-fg-on-chrome dark:bg-linear-to-b dark:from-bg-header-from dark:to-bg-header-to',
    '[--header-bg:var(--color-bg-surface)] dark:[--header-bg:var(--color-bg-header-to)]',
  ),
  cluster: 'relative flex h-full w-full items-center justify-center',
  plateText: 'relative flex flex-col items-center gap-1',
  plateTitle: 'relative block h-1.5 w-16 bg-fg-on-chrome/85',
  plateSubtitle: 'relative block h-[3px] w-10 bg-fg-on-nav-muted/70',
  tabBar: 'relative block h-1 w-5 bg-current opacity-70',
  option: 'flex items-center gap-3',
} as const;
