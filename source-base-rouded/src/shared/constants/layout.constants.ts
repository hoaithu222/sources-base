/**
 * Hằng layout toàn cục — nguồn duy nhất cho chiều cao Header và lề vỏ ngoài.
 *
 * Dùng:   <header className={HEADER_HEIGHT_CLASS.height}> · <main className={SHELL_GUTTER_X}>
 *         Mọi phép "viewport trừ header" (AppShellLayout, drawer, toolbar dính, dialog…) lấy
 *         từ `HEADER_HEIGHT_CLASS`, không tự gõ số.
 * Lưu ý:  ⛔ chiều cao header RESPONSIVE (56px → `wide:` ≥ 1800px 64px — gồm thanh nổi 48 / 56px + khe 8px phía trên) và
 *         KHÔNG có bậc `touch:`.
 *         ⛔ bốn khoá của `HEADER_HEIGHT_CLASS` là MỘT BỘ — đổi `height` thì đổi cả ba khoá còn lại.
 *         Lý do: docs/notes/code/constants.md.
 */

/** Chiều cao VÙNG header 2 bậc: 56px (`h-14` = thanh nổi 48px + khe 8px) → `wide:` 64px (`h-16` = thanh 56px + khe 8px). */
export const HEADER_HEIGHT_CLASS = {
  /** Gắn lên `<header>` — chiều cao thanh. */
  height: 'h-14 wide:h-16',
  /** Chiều cao tối đa = viewport − header, cho vùng cuộn riêng; `dvh` (= `vh` ở máy tính). */
  contentMaxHeight: 'max-h-[calc(100dvh-3.5rem)] wide:max-h-[calc(100dvh-4rem)]',
  /** `pt` = chiều cao header — cho layout có header `fixed`. */
  contentTopOffset: 'pt-14 wide:pt-16',
  /** `top` = chiều cao header — cho overlay bám ngay dưới thanh. */
  belowHeader: 'top-14 wide:top-16',
} as const;

/**
 * Lề ngang của VỎ ngoài — header và `<main>` dùng chung hằng này nên mép luôn thẳng nhau. `phone:` / `tv:` thu về 8px
 * (điện thoại: lề = khe giữa thẻ `gap-2` → nhịp đều, nội dung rộng thêm 16px). Không áp cho padding BÊN TRONG control.
 */
export const SHELL_GUTTER_X = 'px-4 phone:px-2 tv:px-2';

/** Lề trái / phải của `<main>` không hẹp hơn vùng an toàn (tai thỏ khi xoay ngang); ghép SAU `SHELL_GUTTER_X`, `tv:px-2` vẫn thắng. */
export const SHELL_SAFE_INSET_X =
  'pl-[max(1rem,var(--safe-l,0px))] pr-[max(1rem,var(--safe-r,0px))] phone:pl-[max(0.5rem,var(--safe-l,0px))] phone:pr-[max(0.5rem,var(--safe-r,0px))]';

/** Đệm dọc của `<main>`, cùng nhịp với `SHELL_GUTTER_X` (điện thoại 8px dưới top bar / trên thanh tab). */
export const SHELL_GUTTER_Y = 'py-4 phone:py-2 tv:py-2';
