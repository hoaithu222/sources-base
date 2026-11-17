/**
 * field-nav — hàm thuần cho điều hướng mũi tên giữa các ô nhập (kiểu Excel); chỉ đọc DOM, không dính React.
 *
 * Dùng:   qua hook `useArrowFieldNav` (`@/shared/hooks`) — không tự ghép từng hàm ở màn hình.
 * Lưu ý:  ô đích chọn theo TOẠ ĐỘ THẬT trên màn hình, không theo thứ tự khai báo: form xếp dọc và xếp
 *         ngang dùng chung một luật (↓ tìm ô nằm dưới, → tìm ô nằm bên phải) — keyboard-navigation.md.
 */

export type FieldNavDirection = 'up' | 'down' | 'left' | 'right';

const ARROW_DIRECTION: Record<string, FieldNavDirection> = {
  ArrowUp: 'up',
  ArrowDown: 'down',
  ArrowLeft: 'left',
  ArrowRight: 'right',
};

/** Hướng từ `KeyboardEvent.key` (`'ArrowUp'`…); `null` nếu phím không phải mũi tên. */
export const arrowDirection = (key: string): FieldNavDirection | null =>
  ARROW_DIRECTION[key] ?? null;

const FIELD_SELECTOR = [
  'input:not([type="hidden"]):not([type="checkbox"]):not([type="radio"])',
  'textarea',
  '[role="combobox"]',
].join(',');

type TextField = HTMLInputElement | HTMLTextAreaElement;

const isTextField = (el: HTMLElement): el is TextField =>
  el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement;

/** `true` cho `input` chữ, `textarea`, `[role="combobox"]`; ô tích / radio (`input[type=checkbox|radio]`, `button[role=radio]`) không tính. */
export const isNavField = (el: HTMLElement): boolean => el.matches(FIELD_SELECTOR);

const caretOf = (el: TextField): { start: number; end: number } | null => {
  try {
    const { selectionStart: start, selectionEnd: end } = el;
    return start === null || end === null ? null : { start, end };
  } catch {
    return null;
  }
};

const setCaret = (el: TextField, position: number): void => {
  try {
    el.setSelectionRange(position, position);
  } catch {
    /* input type không hỗ trợ chọn — bỏ qua, focus là đủ. */
  }
};

/**
 * Mũi tên có được RỜI ô hiện tại không? Ô chữ: ←/→ chỉ rời khi con trỏ sát đầu/cuối và không bôi đen;
 * ↑/↓ rời ngay với input một dòng, `<textarea>` phải đang ở dòng đầu/cuối. Dropdown đang mở
 * (`aria-expanded="true"`) → không rời, nhường mũi tên cho việc chọn option.
 */
export function canLeaveField(el: HTMLElement, direction: FieldNavDirection): boolean {
  if (el.getAttribute('aria-expanded') === 'true') return false;
  if (!isTextField(el)) return true;

  const caret = caretOf(el);
  if (!caret) return true;
  if (caret.start !== caret.end) return false;

  if (direction === 'left') return caret.start === 0;
  if (direction === 'right') return caret.start === el.value.length;

  if (el instanceof HTMLTextAreaElement) {
    return direction === 'up'
      ? !el.value.slice(0, caret.start).includes('\n')
      : !el.value.slice(caret.start).includes('\n');
  }
  return true;
}

const isDisabled = (el: HTMLElement): boolean =>
  el.hasAttribute('disabled') || el.getAttribute('aria-disabled') === 'true';

/** Các ô nhập đang hiển thị và thao tác được bên trong `scope`. */
export function collectNavFields(scope: HTMLElement): HTMLElement[] {
  return Array.from(scope.querySelectorAll<HTMLElement>(FIELD_SELECTOR)).filter((el) => {
    if (isDisabled(el)) return false;
    const rect = el.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0;
  });
}

const AXIS_TOLERANCE = 4;
const CROSS_AXIS_PENALTY = 2;

const centerOf = (el: HTMLElement) => {
  const rect = el.getBoundingClientRect();
  return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
};

/**
 * Ô gần nhất theo ĐÚNG hướng vừa nhấn. Không có ô nào nằm về phía đó → `null`,
 * caller trả phím lại cho trình duyệt (vd ↓ ở ô cuối thẻ sẽ mở dropdown).
 */
export function findFieldInDirection(
  fields: HTMLElement[],
  current: HTMLElement,
  direction: FieldNavDirection,
): HTMLElement | null {
  const from = centerOf(current);
  const vertical = direction === 'up' || direction === 'down';
  const forward = direction === 'down' || direction === 'right' ? 1 : -1;

  let best: HTMLElement | null = null;
  let bestScore = Number.POSITIVE_INFINITY;

  for (const field of fields) {
    if (field === current) continue;
    const to = centerOf(field);
    const main = (vertical ? to.y - from.y : to.x - from.x) * forward;
    if (main <= AXIS_TOLERANCE) continue;
    const cross = Math.abs(vertical ? to.x - from.x : to.y - from.y);
    const score = main + cross * CROSS_AXIS_PENALTY;
    if (score < bestScore) {
      bestScore = score;
      best = field;
    }
  }
  return best;
}

/**
 * Chuyển focus sang ô đích, con trỏ vào ở mép ĐỐI DIỆN hướng đi (phải/xuống → đầu ô, trái/lên → cuối ô)
 * để mạch gõ chạy liên tục và lần nhấn kế không bật ngược về ô cũ.
 */
export function focusField(el: HTMLElement, direction: FieldNavDirection): void {
  el.focus();
  if (!isTextField(el)) return;
  setCaret(el, direction === 'right' || direction === 'down' ? 0 : el.value.length);
}
