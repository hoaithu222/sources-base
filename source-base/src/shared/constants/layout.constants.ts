/**
 * Hằng layout toàn cục — nguồn duy nhất cho chiều cao Header và lề vỏ ngoài.
 *
 * Dùng:   <header className={HEADER_HEIGHT_CLASS.height}> · <main className={SHELL_GUTTER_X}>
 *         Mọi phép "viewport trừ header" (AppShellLayout, drawer, toolbar dính, dialog…) lấy
 *         từ `HEADER_HEIGHT_CLASS`, không tự gõ số.
 * Lưu ý:  ⛔ chiều cao header RESPONSIVE (40px → `xl:` 44px → `wide:` ≥ 1800px 52px) và KHÔNG có bậc `touch:`.
 *         ⛔ bốn khoá của `HEADER_HEIGHT_CLASS` là MỘT BỘ — đổi `height` thì đổi cả ba khoá còn lại.
 *         Lý do: docs/notes/code/constants.md.
 */

/** Class Tailwind khớp thang chiều cao header 3 bậc: 40px (`h-10`) → `xl:` 44px (`h-11`) → `wide:` 52px (`h-13`). */
export const HEADER_HEIGHT_CLASS = {
  /** Gắn lên `<header>` — chiều cao thanh. */
  height: 'h-10 xl:h-11 wide:h-13',
  /** Chiều cao tối đa = viewport − header, cho vùng cuộn riêng; `dvh` (= `vh` ở máy tính). */
  contentMaxHeight:
    'max-h-[calc(100dvh-2.5rem)] xl:max-h-[calc(100dvh-2.75rem)] wide:max-h-[calc(100dvh-3.25rem)]',
  /** `pt` = chiều cao header — cho layout có header `fixed`. */
  contentTopOffset: 'pt-10 xl:pt-11 wide:pt-13',
  /** `top` = chiều cao header — cho overlay bám ngay dưới thanh. */
  belowHeader: 'top-10 xl:top-11 wide:top-13',
} as const;

/**
 * Lề ngang của VỎ ngoài — header và `<main>` dùng chung hằng này nên mép luôn thẳng nhau.
 * `tv:` thu về 8px. Không áp cho padding BÊN TRONG control (logo, chip, nút icon).
 */
export const SHELL_GUTTER_X = 'px-4 tv:px-2';

/**
 * Lề trái / phải của `<main>`: không hẹp hơn vùng an toàn (tai thỏ), lề PHẢI trừ chỗ thanh cuộn
 * (`--scrollbar-gutter`) vì `<main>` luôn chừa chỗ đó — nội dung không xê dịch khi trang dài ra / ngắn lại, mép phải
 * vẫn thẳng header. Ghép SAU `SHELL_GUTTER_X`. Lý do: docs/notes/code/constants.md.
 */
export const SHELL_SAFE_INSET_X = [
  'pl-[max(1rem,var(--safe-l,0px))]',
  'pr-[max(calc(1rem-var(--scrollbar-gutter,0px)),var(--safe-r,0px))]',
  'tv:pr-[max(calc(0.5rem-var(--scrollbar-gutter,0px)),var(--safe-r,0px))]',
  '[scrollbar-gutter:stable]',
].join(' ');

/** Đệm dọc của `<main>`, cùng nhịp với `SHELL_GUTTER_X`. */
export const SHELL_GUTTER_Y = 'py-4 tv:py-2';
