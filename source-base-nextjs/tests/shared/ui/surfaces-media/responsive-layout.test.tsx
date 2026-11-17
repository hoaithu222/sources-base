/**
 * Bố cục + lớp phủ ảnh trên màn hẹp / máy chạm (Toolbar · TitleScreen · Splitter · ImageLightbox) — `docs/rules/display/ipad-responsive.md`.
 *
 * jsdom không có CSS nên test đọc CLASS. Khoá các luật khó thấy bằng mắt trên laptop: hàng công cụ không bóp ô lọc về 0
 * ở điện thoại, tiêu đề cắt `…` thay vì đẩy nút ra ngoài màn, hộp bấm của nút ✕ lightbox ≥ 44px, neo mép cộng `--safe-*`.
 */

import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import {
  Button,
  DetailPanelHeader,
  ImageLightbox,
  Splitter,
  Text,
  TitleScreen,
  Toolbar,
} from '@/shared/ui';
import { renderInRouter, renderWithIntl } from '@tests/helpers/render';
import { SOURCE_CODE } from '@tests/helpers/source-files';

const noop = () => {};
const classesOf = (el: Element) => el.className.split(/\s+/);

describe('Toolbar — điện thoại: cụm phải rớt xuống hàng, không bóp cụm trái', () => {
  it('cụm trái giữ sàn basis-64, cụm phải tự xuống dòng canh phải', () => {
    renderWithIntl(<Toolbar left={<span>Lọc</span>} right={<span>Thêm</span>} />);
    const left = screen.getByText('Lọc').parentElement!;
    const right = screen.getByText('Thêm').parentElement!;

    expect(classesOf(left)).toEqual(
      expect.arrayContaining(['min-w-0', 'flex-1', 'phone:basis-64']),
    );
    expect(classesOf(right)).toEqual(
      expect.arrayContaining(['phone:ml-auto', 'phone:flex-wrap', 'phone:justify-end']),
    );
    expect(classesOf(left.parentElement!)).toContain('flex-wrap');
  });
});

describe('TitleScreen — điện thoại: tiêu đề cắt …, cụm phải xuống hàng', () => {
  it('hàng chính cho xuống dòng; tiêu đề cắt bằng text-ellipsis (không `truncate`, không gọt dấu)', () => {
    renderInRouter(
      <TitleScreen
        right={<Button size="sm">Thêm</Button>}
        subtitle="PHỐI HỢP"
        title="Tổng quan dự án"
      />,
    );
    const title = screen.getByRole('heading', { level: 1, name: 'Tổng quan dự án' });
    const row = title.closest('.relative.flex.w-full.items-center') as HTMLElement;

    expect(classesOf(row)).toContain('flex-wrap');
    expect(classesOf(title)).toEqual(
      expect.arrayContaining(['min-w-0', 'overflow-x-clip', 'overflow-y-visible', 'text-ellipsis']),
    );
    expect(classesOf(title)).not.toContain('truncate');
  });

  it('nút Quay lại nới hộp bấm trên máy chạm', () => {
    renderInRouter(<TitleScreen title="Chi tiết" onBack={noop} />);

    expect(classesOf(screen.getByRole('button', { name: 'Quay lại' }))).toEqual(
      expect.arrayContaining(['relative', 'touch:after:absolute']),
    );
  });
});

describe('Text ellipsis — cắt chữ không gọt dấu tiếng Việt', () => {
  it('dùng overflow-x-clip + overflow-y-visible thay cho truncate', () => {
    renderWithIntl(
      <Text ellipsis size="tiny">
        ỨNG DỤNG KẾ HOẠCH
      </Text>,
    );
    const el = screen.getByText('ỨNG DỤNG KẾ HOẠCH');

    expect(classesOf(el)).toEqual(
      expect.arrayContaining([
        'block',
        'overflow-x-clip',
        'overflow-y-visible',
        'text-ellipsis',
        'whitespace-nowrap',
      ]),
    );
    expect(classesOf(el)).not.toContain('truncate');
  });
});

describe('Cắt chữ một dòng — không còn `truncate` thô trong UI kit', () => {
  it('src/shared/ui (trừ lớp nổi) dùng TEXT_ELLIPSIS_CLASSES, không `truncate` gọt dấu tiếng Việt', () => {
    const offenders = Object.entries(SOURCE_CODE)
      .filter(
        ([file]) =>
          file.startsWith('src/shared/ui/') && !file.startsWith('src/shared/ui/overlays/'),
      )
      .flatMap(([file, text]) =>
        text
          .split('\n')
          .map((line, index) => ({ line, index }))
          .filter(({ line }) => /\btruncate\b/.test(line) && !/^\s*(\*|\/\/|\/\*)/.test(line))
          // Giá trị SỐ (không dấu) được phép cắt thô — chỉ chữ có dấu mới bị gọt.
          .filter(({ line }) => !/tabular-nums/.test(line) || /label|title|name/i.test(line))
          .map(({ line, index }) => `${file}:${index + 1} — ${line.trim()}`),
      );

    expect(
      offenders,
      'Thay `truncate` bằng TEXT_ELLIPSIS_CLASSES (primitives/text-ellipsis.theme) — notes/components/primitives.md',
    ).toEqual([]);
  });
});

describe('Splitter — tay nắm nới hộp bấm 24px trên máy chạm', () => {
  it.each([
    ['horizontal', 'touch:after:-inset-x-2.5'],
    ['vertical', 'touch:after:-inset-y-2.5'],
  ] as const)('orientation=%s', (orientation, expected) => {
    renderWithIntl(
      <div style={{ width: 400, height: 300 }}>
        <Splitter orientation={orientation}>
          <div>A</div>
          <div>B</div>
        </Splitter>
      </div>,
    );

    expect(classesOf(screen.getByRole('separator'))).toEqual(
      expect.arrayContaining(['touch:relative', 'touch:after:absolute', expected]),
    );
  });
});

describe('ImageLightbox — màn hẹp / máy chạm', () => {
  it('nút ✕: tên "Đóng", hình 40px ở phone, hộp bấm nới, neo cộng --safe-t / --safe-r', () => {
    renderWithIntl(<ImageLightbox open src="/a.png" onDownload={noop} onOpenChange={noop} />);
    const close = screen.getByRole('button', { name: 'Đóng' });
    const corner = close.parentElement!;

    expect(classesOf(close)).toEqual(
      expect.arrayContaining(['size-9', 'phone:size-10', 'relative', 'touch:after:absolute']),
    );
    expect(classesOf(corner)).toEqual(
      expect.arrayContaining([
        'top-[calc(1rem+var(--safe-t,0px))]',
        'right-[calc(1rem+var(--safe-r,0px))]',
      ]),
    );
  });

  it('thanh công cụ cuộn ngang khi hẹp, nút không co, neo đáy cộng --safe-b', () => {
    renderWithIntl(<ImageLightbox open src="/a.png" onOpenChange={noop} />);
    const tool = screen.getByRole('button', { name: 'Xoay trái' });
    const bar = tool.parentElement!;

    expect(classesOf(bar)).toEqual(
      expect.arrayContaining([
        'overflow-x-auto',
        'overscroll-x-contain',
        'bottom-[calc(1.5rem+var(--safe-b,0px))]',
      ]),
    );
    expect(classesOf(tool)).toContain('shrink-0');
  });

  it('nút ảnh trước / sau cộng --safe-l / --safe-r', () => {
    renderWithIntl(
      <ImageLightbox
        navigation={{ index: 1, total: 3, onNext: noop, onPrev: noop }}
        open
        src="/a.png"
        onOpenChange={noop}
      />,
    );

    expect(classesOf(screen.getByRole('button', { name: 'Ảnh trước' }))).toContain(
      'left-[calc(1rem+var(--safe-l,0px))]',
    );
    expect(classesOf(screen.getByRole('button', { name: 'Ảnh sau' }))).toContain(
      'right-[calc(1rem+var(--safe-r,0px))]',
    );
  });
});

describe('TitleScreen summary + DetailPanelHeader — màn hẹp không cắt', () => {
  it('summary giữ bề ngang nội dung (flex-auto), điện thoại xuống dòng; vạch dọc ẩn dưới lg', () => {
    renderInRouter(
      <TitleScreen
        right={<Button size="sm">Thêm</Button>}
        summary={<span>Chip KPI</span>}
        title="Danh sách"
      />,
    );
    const summary = screen.getByText('Chip KPI').parentElement!;

    expect(classesOf(summary)).toEqual(
      expect.arrayContaining(['flex-auto', 'min-w-0', 'phone:flex-wrap', 'overscroll-x-contain']),
    );
    expect(classesOf(summary)).not.toContain('flex-1');
    expect(
      classesOf(screen.getByRole('button', { name: 'Thêm' }).parentElement!.firstElementChild!),
    ).toContain('max-lg:hidden');
  });

  it('DetailPanelHeader: điện thoại hàng trong flex-wrap, tiêu đề có sàn basis-40, hành động xuống hàng canh phải', () => {
    renderWithIntl(
      <DetailPanelHeader
        action={<button type="button">Lọc</button>}
        title={<span>Tiêu đề dài</span>}
      />,
    );
    const title = screen.getByText('Tiêu đề dài').parentElement!;
    const action = screen.getByRole('button', { name: 'Lọc' }).parentElement!;
    const inner = title.parentElement!;

    expect(classesOf(inner)).toEqual(expect.arrayContaining(['phone:flex-wrap', 'phone:gap-y-1']));
    expect(classesOf(title)).toEqual(
      expect.arrayContaining(['phone:basis-40', 'max-lg:overflow-x-clip']),
    );
    expect(classesOf(title)).not.toContain('max-lg:overflow-hidden');
    expect(classesOf(action)).toEqual(
      expect.arrayContaining(['phone:ml-auto', 'phone:max-w-full']),
    );
  });
});
