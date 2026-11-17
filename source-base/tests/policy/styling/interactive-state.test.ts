/**
 * Trạng thái tương tác — `docs/rules/styling/interactive-state.md`.
 *
 * Hai lỗi IM LẶNG (không lỗi build / lint / typecheck) đã xảy ra:
 *   1. Tailwind 4 ghi `translate-*` / `rotate-*` / `scale-*` vào thuộc tính CSS RIÊNG (`translate`, `rotate`, `scale`).
 *      `transition-[transform]` không bắt được chúng nên núm công tắc nhảy cóc, mũi tên xổ xoay giật.
 *   2. Rê chuột lên nút ✕ / đoạn chưa chọn / tiêu đề cột sắp xếp tô xám trung tính thay vì tint màu chủ đạo.
 */

import { describe, expect, it } from 'vitest';

import { HANDWRITTEN_CODE, stripComments } from '@tests/helpers/source-files';

/** Chuyển tiếp `transform` hợp lệ vì phần tử được ghi `style.transform` trực tiếp (không qua class Tailwind). */
const TRANSFORM_TRANSITION_ALLOWED: Record<string, string> = {
  'src/shared/ui/actions/segment-toggle/segment-toggle-glide.theme.ts':
    'mặt trượt do `useSegmentGlide` ghi thẳng `style.transform`',
};

/** Component đã đổi hover xám sang tint màu chủ đạo (`bg-bg-nav-hover`) — không được quay lại `bg-subtle` / `bg-pressed`. */
const TINTED_HOVER_FILES = [
  'src/shared/ui/feedback/Callout.tsx',
  'src/shared/ui/actions/segment-toggle/segment-toggle.theme.ts',
  'src/shared/ui/data-display/table/table.theme.ts',
  'src/shared/ui/form/layout/FormSection.tsx',
];

const CODE = Object.entries(HANDWRITTEN_CODE).map(
  ([path, text]) => [path, stripComments(text)] as const,
);

const lineOf = (text: string, index: number) => text.slice(0, index).split('\n').length;

describe('Tailwind 4: chuyển tiếp phải nhắm đúng thuộc tính', () => {
  it('không `transition-[…transform…]` — dùng `translate` / `rotate` / `scale` hoặc `transition-transform`', () => {
    const hits = CODE.filter(([path]) => !(path in TRANSFORM_TRANSITION_ALLOWED)).flatMap(
      ([path, text]) =>
        [...text.matchAll(/transition-\[[^\]]*\btransform\b[^\]]*\]/g)].map(
          (m) => `${path}:${lineOf(text, m.index)} ${m[0]}`,
        ),
    );

    expect(
      hits,
      `Tailwind 4 ghi translate-* / rotate-* / scale-* vào thuộc tính CSS riêng, \`transition-[transform]\` không bắt được ` +
        `(núm công tắc nhảy cóc). Viết \`transition-[translate,…]\` · \`[rotate,…]\` · \`[scale,…]\`, hoặc \`transition-transform\` ` +
        `(bao cả bốn). Ngoại lệ có lý do → TRANSFORM_TRANSITION_ALLOWED:\n  ${hits.join('\n  ')}`,
    ).toEqual([]);
  });

  it('danh sách ngoại lệ không chứa file đã hết dùng', () => {
    const stale = Object.keys(TRANSFORM_TRANSITION_ALLOWED).filter((path) => {
      const text = CODE.find(([p]) => p === path)?.[1] ?? '';
      return !/transition-\[[^\]]*\btransform\b[^\]]*\]/.test(text);
    });

    expect(stale, `Xoá khỏi TRANSFORM_TRANSITION_ALLOWED: ${stale.join(', ')}`).toEqual([]);
  });
});

describe('rê chuột tô tint màu chủ đạo, không xám trung tính', () => {
  it.each(TINTED_HOVER_FILES)('%s: không hover:bg-bg-subtle / bg-pressed', (path) => {
    const text = CODE.find(([p]) => p === path)?.[1] ?? '';
    const hits = [...text.matchAll(/hover:bg-bg-(?:subtle|pressed)/g)].map(
      (m) => `${path}:${lineOf(text, m.index)} ${m[0]}`,
    );

    expect(text, `${path} không đọc được`).not.toBe('');
    expect(
      hits,
      `Dùng \`hover:bg-bg-nav-hover\` (tint \`primary\`, tự theo màu chủ đạo, sáng / tối đều đọc được):\n  ${hits.join('\n  ')}`,
    ).toEqual([]);
  });
});
