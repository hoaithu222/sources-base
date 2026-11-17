/**
 * Bộ "render nông mà rộng" của UI kit — `tests/shared/ui/render/<bộ>.test.tsx`.
 *
 * Mỗi component công khai đúng MỘT lượt render với bộ prop tối thiểu, chỉ hỏi một câu: "có dựng ra
 * DOM mà không ném không". `tsc` chỉ chứng minh KIỂU khớp; nó không bắt một barrel trỏ nhầm file,
 * một bảng `*_CLASSES` thiếu ô, hay một component ném lỗi ngay lượt render đầu. Hành vi chi tiết là
 * việc của test riêng từng nhóm.
 *
 * Danh sách phải phủ ĐÚNG tập component mà barrel xuất ra (`ui-kit-exports.ts`) — thêm component
 * vào barrel mà quên thêm ca là đỏ, không còn con số cứng phải nhớ nâng.
 */

import type { RenderResult } from '@testing-library/react';
import { IntlError } from 'next-intl';
import type { ReactElement } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { IntlWrapper, renderInRouter } from './render';
import { UI_KIT_COMPONENTS } from './ui-kit-exports';

/** Bộ render → các nhóm chức năng của UI kit mà bộ đó phủ. Mỗi nhóm thuộc đúng MỘT bộ. */
export const RENDER_SUITES = {
  'display-basics': ['primitives', 'feedback', 'layout', 'icons'],
  'actions-inputs': ['actions', 'inputs'],
  'selects-pickers': ['selects', 'pickers'],
  'overlays-navigation': ['overlays', 'navigation'],
  'data-display': ['data-display'],
  'surfaces-media': ['surfaces', 'media'],
  form: ['form'],
} as const satisfies Record<string, readonly string[]>;

export type RenderSuite = keyof typeof RENDER_SUITES;

export interface RenderCaseOptions {
  /** Cách dựng — mặc định `renderInRouter`; field của form dùng `renderInForm`. */
  mount?: (ui: ReactElement) => RenderResult;
  /** Khẳng định thêm ngoài "dựng được" (chữ / phần tử phải có mặt). */
  check?: (view: RenderResult) => void;
}

/**
 * `[nhãn, phần tử, tuỳ chọn?]`. Nhãn bắt đầu bằng tên component; biến thể thêm ` · <tên>`
 * (`'PanelCard · overlay'`).
 */
export type RenderCase = [label: string, element: ReactElement, options?: RenderCaseOptions];

/**
 * Dựng một `RenderCase`. Viết `renderCase('Nhãn', <X />)` thay vì mảng `['Nhãn', <X />]` — luật `react/jsx-key` coi phần tử
 * JSX đứng trong literal mảng là danh sách thiếu `key`.
 */
export function renderCase(
  label: string,
  element: ReactElement,
  options?: RenderCaseOptions,
): RenderCase {
  return options ? [label, element, options] : [label, element];
}

const componentOf = (label: string) => label.split(' · ')[0];

/** Lỗi next-intl (thiếu khoá, sai định dạng) mà provider chỉ `console.error` chứ không ném — render vẫn "xanh" với chữ khoá thô. */
function intlErrorsOf(spy: { mock: { calls: unknown[][] } }): string[] {
  return spy.mock.calls
    .map(([first]) => first)
    .filter((first): first is IntlError => first instanceof IntlError)
    .map((error) => error.message);
}

/**
 * Dựng mọi ca của một bộ, rồi đối chiếu với danh sách component công khai của các nhóm thuộc bộ.
 * `notRendered` — component cố ý không có ca, kèm LÝ DO (đã kiểm ở đâu); hết lý do thì xoá.
 */
export function describeRenderSuite(
  suite: RenderSuite,
  cases: readonly RenderCase[],
  notRendered: Record<string, string> = {},
) {
  const groups: readonly string[] = RENDER_SUITES[suite];
  const expected = UI_KIT_COMPONENTS.filter((c) => groups.includes(c.group)).map((c) => c.name);

  describe(`UI kit — ${groups.join(' · ')}: mọi component công khai đều render được`, () => {
    it.each(cases)('%s', (_label, element, { mount = renderInRouter, check } = {}) => {
      const errors = vi.spyOn(console, 'error');
      try {
        const view = mount(element);
        // Overlay (Modal/Drawer/Tooltip) render qua portal nên nằm ngoài
        // `container` — xét cả `baseElement` để không báo sai.
        expect(view.container.innerHTML.length + view.baseElement.innerHTML.length).toBeGreaterThan(
          0,
        );
        check?.(view);
        expect(intlErrorsOf(errors), 'Thiếu / sai thông điệp next-intl (vi)').toEqual([]);
      } finally {
        errors.mockRestore();
      }
    });

    it.each(cases)(
      '%s · en: không thiếu thông điệp',
      (_label, element, { mount = renderInRouter } = {}) => {
        const errors = vi.spyOn(console, 'error');
        try {
          mount(<IntlWrapper locale="en">{element}</IntlWrapper>);
          expect(intlErrorsOf(errors), 'Thiếu / sai thông điệp next-intl (en)').toEqual([]);
        } finally {
          errors.mockRestore();
        }
      },
    );

    it('phủ ĐÚNG danh sách component mà barrel xuất ra', () => {
      const covered = new Set(cases.map(([label]) => componentOf(label)));
      const missing = expected.filter((name) => !covered.has(name) && !(name in notRendered));
      const stray = [...covered].filter((name) => !expected.includes(name));
      const stale = Object.keys(notRendered).filter(
        (name) => !expected.includes(name) || covered.has(name),
      );

      expect(missing, `Thêm ca render cho component mới:\n  ${missing.join('\n  ')}`).toEqual([]);
      expect(stray, `Ca không ứng với component nào của bộ này:\n  ${stray.join('\n  ')}`).toEqual(
        [],
      );
      expect(stale, `Xoá khỏi danh sách không render:\n  ${stale.join('\n  ')}`).toEqual([]);
    });
  });
}
