/**
 * Ngôn ngữ HUD đã nghỉ hưu ở source-base-rouded (nhóm `surfaces` + `layout`) — `docs/rules/styling/light-theme.md`.
 *
 * Theme tối cùng HÌNH HỌC với theme sáng, chỉ khác bảng màu. Ba điều được khoá ở đây:
 *  - prop trang trí cũ (`intensity`, `notch`, `corners`, `brackets`…) giữ chữ ký TS nhưng VÔ HIỆU: DOM không đổi;
 *  - `HudCorners` không còn vẽ gì;
 *  - mã nguồn của hai nhóm không còn `not-dark:` và mọi `dark:` còn lại chỉ chỉnh MÀU (chữ / nền phẳng / viền / vòng).
 */

import { render } from '@testing-library/react';
import type { ReactElement } from 'react';
import { describe, expect, it } from 'vitest';

import {
  BoxInfo,
  DetailPanelHeader,
  HudCorners,
  HudFrame,
  PanelCard,
  SummaryCard,
  TitleScreen,
} from '@/shared/ui';
import { SOURCE_CODE, stripComments } from '@tests/helpers/source-files';

const htmlOf = (element: ReactElement) => {
  const view = render(element);
  const html = view.container.innerHTML;
  view.unmount();
  return html;
};

describe('prop trang trí cũ là no-op — DOM giống hệt bản mặc định', () => {
  const CASES: [string, ReactElement, ReactElement][] = [
    [
      'HudFrame',
      <HudFrame>
        <div />
      </HudFrame>,
      <HudFrame corners intensity="prime" notch notchSize={20} scanlines sweep ticks tone="red">
        <div />
      </HudFrame>,
    ],
    [
      'PanelCard',
      <PanelCard title="Thẻ">nội dung</PanelCard>,
      <PanelCard frame="cyber" frameWeight="hairline" notch sweep title="Thẻ">
        nội dung
      </PanelCard>,
    ],
    [
      'SummaryCard',
      <SummaryCard icon="cube-bold" label="Nhãn" value="12" />,
      <SummaryCard corners="chamfer" icon="cube-bold" label="Nhãn" value="12" />,
    ],
    ['BoxInfo', <BoxInfo title="Tiến độ" />, <BoxInfo corners="dot" title="Tiến độ" />],
    [
      'DetailPanelHeader',
      <DetailPanelHeader title="Sơ đồ" />,
      <DetailPanelHeader brackets title="Sơ đồ" titleVariant="solid" />,
    ],
    [
      'TitleScreen',
      <TitleScreen icon="cube-bold" title="Màn hình" />,
      <TitleScreen brackets icon="cube-bold" title="Màn hình" />,
    ],
  ];

  it.each(CASES)('%s', (_name, plain, decorated) => {
    expect(htmlOf(decorated)).toBe(htmlOf(plain));
  });
});

describe('HudCorners — không còn vẽ gì', () => {
  it.each(['bracket', 'dot', 'chamfer', 'none'] as const)('variant=%s', (variant) => {
    const { container } = render(
      <div className="relative">
        <HudCorners frame glow lightRounded radius={8} size={10} thickness={2} variant={variant} />
      </div>,
    );

    expect(container.firstElementChild?.childElementCount).toBe(0);
  });
});

describe('mã nguồn surfaces + layout — chỉ còn dark: chỉnh màu', () => {
  const FILES = Object.entries(SOURCE_CODE)
    .filter(([file]) => /^src\/shared\/ui\/(surfaces|layout)\//.test(file))
    .map(([file, text]) => [file, stripComments(text)] as const);

  /** Mọi lớp `dark:…` (kể cả ghép `dark:hover:…`), bỏ tiền tố biến thể để còn tên tiện ích. */
  const darkUtilities = (text: string) =>
    [...text.matchAll(/(?<![\w-])dark:([^\s'"`]+)/g)].map((m) =>
      m[1].replace(/^(?:[\w@/-]+:)*/, ''),
    );

  const COLOR_UTILITY =
    /^(?:text|bg|border|ring|outline|fill|stroke|divide|placeholder|caret|accent|decoration)-/;
  const NOT_COLOR =
    /^(?:text-(?:body|caption|h\d|xs|sm|base|lg|xl|\d)|bg-(?:linear|gradient|radial|conic|none|\[(?:linear|radial|conic|url)|\(image)|border-(?:0|\d|[xytrblse]-?\d+)|ring-(?:\d|inset|offset)|outline-(?:\d|offset))/;

  it('có file để kiểm', () => {
    expect(FILES.length).toBeGreaterThan(30);
  });

  it('không còn `not-dark:` (diện mạo sáng áp cho cả hai theme)', () => {
    const offenders = FILES.filter(([, text]) => text.includes('not-dark:')).map(([file]) => file);
    expect(offenders).toEqual([]);
  });

  it('mọi `dark:` là chỉnh MÀU phẳng — không quầng, gradient, vát góc, đổi cỡ / bậc chữ, hiện / ẩn phần tử', () => {
    const offenders = FILES.flatMap(([file, text]) =>
      darkUtilities(text)
        .filter((utility) => !COLOR_UTILITY.test(utility) || NOT_COLOR.test(utility))
        .map((utility) => `${file} — dark:${utility}`),
    );
    expect(offenders).toEqual([]);
  });
});
