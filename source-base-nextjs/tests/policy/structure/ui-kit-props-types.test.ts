/**
 * Component công khai nào cũng phải xuất kiểu `XxxProps` đi kèm — `ui-kit-architecture.md §1`.
 *
 * ── Vì sao là bài kiểm chứ không phải dòng nhắc trong tài liệu ───────────────
 * Khi rà thì 57/120 interface đang thiếu `export` — và thiếu KHÔNG đều: cùng thư mục `actions/`,
 * `ContextMenuProps` có xuất còn `ButtonProps` thì không. Kiểu quên rải rác như vậy không ai phát
 * hiện bằng mắt. Hậu quả: không viết nổi `function SubmitButton(props: ButtonProps)` hay bọc lại
 * `TextField` mà vẫn giữ kiểu — tức chặn đúng việc mà người dùng một bộ kit làm hằng ngày.
 *
 * Component nào được barrel xuất ra (`tests/helpers/ui-kit-exports.ts`) thì `XxxProps` cũng phải có
 * mặt ở CHÍNH barrel đó. Helper nội bộ (`picker-trigger`, `calendar-panel`…) cố ý không đi qua
 * barrel nên tự động nằm ngoài phạm vi — đúng như §8 quy định.
 */

import { describe, expect, it } from 'vitest';

import { UI_KIT_COMPONENTS, barrelTypes } from '@tests/helpers/ui-kit-exports';

/**
 * Component cố ý KHÔNG có `XxxProps` riêng: ba cái đầu nhận trọn hợp đồng của Radix
 * (`React.ComponentProps<typeof Primitive>`), `ToastContainer` không nhận prop nào — bịa ra một
 * interface rỗng chỉ để thoả bài kiểm thì tệ hơn là không có.
 */
const NO_OWN_PROPS = new Set(['ToastProvider', 'ToastViewport', 'RadioGroup', 'ToastContainer']);

describe('UI kit — kiểu Props đi cùng component', () => {
  it('có component để kiểm', () => {
    expect(UI_KIT_COMPONENTS.length).toBeGreaterThan(100);
  });

  it('mọi component đi qua barrel đều xuất kèm XxxProps', () => {
    const missing = UI_KIT_COMPONENTS.filter(
      (c) => !NO_OWN_PROPS.has(c.name) && !barrelTypes(c.barrel).has(`${c.name}Props`),
    ).map((c) => `${c.barrel} — thiếu ${c.name}Props`);

    expect(missing, `Chưa xuất kiểu Props:\n  ${missing.join('\n  ')}`).toEqual([]);
  });

  it('danh sách NO_OWN_PROPS chỉ chứa component có thật', () => {
    const names = new Set(UI_KIT_COMPONENTS.map((c) => c.name));
    const stale = [...NO_OWN_PROPS].filter((name) => !names.has(name));
    expect(stale, `Xoá khỏi NO_OWN_PROPS: ${stale.join(', ')}`).toEqual([]);
  });
});
