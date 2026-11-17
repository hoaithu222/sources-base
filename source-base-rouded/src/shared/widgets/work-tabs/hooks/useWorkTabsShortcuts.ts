import { useNavigate } from 'react-router-dom';

import { useKeyboardShortcut } from '@/shared/hooks';

import type { WorkTab, WorkTabStep } from '../work-tabs.types';
import { WORK_TAB_STEP_CODE } from '../work-tabs.utils';

const STEP_DELTA = { prev: -1, next: 1 } satisfies Record<WorkTabStep, number>;

/**
 * useWorkTabsShortcuts — Ctrl/⌘ + Shift + `[` / `]`: sang thẻ TRƯỚC / SAU theo THỨ TỰ MỞ (vòng lại ở hai đầu), như chuyển
 * tab của trình duyệt — thứ tự mở không đổi khi bấm liên tục (thứ tự gần đây thì có). Màn đang đứng không phải thẻ →
 * `next` về thẻ đầu, `prev` về thẻ cuối.
 * Lưu ý: KHÔNG dùng Alt + ← / → (lùi / tiến của trình duyệt). Nhãn phím: `workTabStepLabel`.
 *
 * @param row - Danh sách để đi vòng, đúng thứ tự (vd "Trang chủ" + thẻ theo thứ tự store).
 * @param activePath - `pathname` đang mở.
 * @param enabled - `false` → không gắn phím (dải tắt).
 *
 * @example
 * useWorkTabsShortcuts([home, ...tabs], pathname, enabled);
 */
export function useWorkTabsShortcuts(
  row: readonly Pick<WorkTab, 'path' | 'search'>[],
  activePath: string,
  enabled: boolean,
) {
  const navigate = useNavigate();

  const step = (direction: WorkTabStep) => {
    if (row.length === 0) return;
    const index = row.findIndex((tab) => tab.path === activePath);
    const target =
      index < 0
        ? row.at(direction === 'next' ? 0 : -1)
        : row[(index + STEP_DELTA[direction] + row.length) % row.length];
    if (target && target.path !== activePath) void navigate(target.path + target.search);
  };

  useKeyboardShortcut({
    code: WORK_TAB_STEP_CODE.prev,
    mods: ['mod', 'shift'],
    capture: true,
    enabled,
    onTrigger: () => step('prev'),
  });
  useKeyboardShortcut({
    code: WORK_TAB_STEP_CODE.next,
    mods: ['mod', 'shift'],
    capture: true,
    enabled,
    onTrigger: () => step('next'),
  });
}
