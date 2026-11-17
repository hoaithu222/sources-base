/**
 * entry-grid.utils.ts — điều hướng DỌC trong bảng nhập liệu kiểu bảng tính: Enter xuống ô cùng cột dòng dưới, Shift+Enter
 * lên dòng trên (mũi tên trong một dòng đã có `useArrowFieldNav`). Hàm thuần trên DOM, không giữ state.
 *
 * Dùng:   <div onKeyDown={handleEntryGridKeyDown}> bọc `<Table>` có ô là `<Input>` / `<NumberInput>` / trigger chọn
 *         focusEntryCell(input, 1) → ô cùng cột dòng dưới (trả `false` khi đã ở dòng cuối)
 * Lưu ý:  ⛔ Bỏ qua khi đang gõ IME (`isComposing` / keyCode 229) — Telex chốt chữ bằng Enter; chặn ở đó là mất dấu.
 *         Ô "cùng cột" tính theo `cellIndex` của `<td>` — bảng có `colSpan` ở thân thì không dùng hàm này.
 */

/** Phần tử nhận focus trong một ô: ô nhập trước, sau đó nút / trigger (Dropdown, DatePicker). */
const CELL_FOCUSABLE =
  'input:not([type=hidden]):not([disabled]), textarea:not([disabled]), button:not([disabled])';

/** Đưa focus tới ô cùng cột ở dòng cách `delta` dòng (1 = dưới, -1 = trên); `true` khi đã chuyển được. */
export function focusEntryCell(from: HTMLElement, delta: 1 | -1): boolean {
  const cell = from.closest('td');
  const row = cell?.parentElement;
  if (!cell || !(row instanceof HTMLTableRowElement)) return false;

  let target: Element | null = row;
  for (let step = 0; step < Math.abs(delta); step++) {
    target =
      delta > 0 ? (target?.nextElementSibling ?? null) : (target?.previousElementSibling ?? null);
  }
  if (!(target instanceof HTMLTableRowElement)) return false;

  const next = target.cells[cell.cellIndex]?.querySelector<HTMLElement>(CELL_FOCUSABLE);
  if (!next) return false;
  next.focus();
  if (next instanceof HTMLInputElement) next.select();
  return true;
}

/** Handler `onKeyDown` cho vỏ bảng nhập: Enter ↓ · Shift+Enter ↑; bỏ qua IME, phím bổ trợ khác và ô nhiều dòng. */
export function handleEntryGridKeyDown(e: React.KeyboardEvent): void {
  if (e.key !== 'Enter' || e.altKey || e.ctrlKey || e.metaKey) return;
  if (e.nativeEvent.isComposing || e.nativeEvent.keyCode === 229) return;
  const target = e.target as HTMLElement;
  if (!(target instanceof HTMLInputElement)) return;
  if (focusEntryCell(target, e.shiftKey ? -1 : 1)) e.preventDefault();
}
