/**
 * Mặt NỔI phải ĐỤC và SẮC ở CẢ HAI theme (`light-theme.md` §1.5 — kính chỉ trên nền có màu): popover · menu · panel select ·
 * toast · tooltip `data`. Người dùng báo (2026-10-19) launcher header + toast trông mờ, lộ thẻ KPI phía sau.
 *
 * jsdom không vẽ CSS nên ở đây khoá HỢP ĐỒNG class:
 *  - nền `bg-surface` đặc (token `bg-popup` còn alpha 97%) + viền `border-strong` — token tự đảo theo theme, không nhánh riêng;
 *  - KHÔNG kính ở bất kỳ theme nào: không `backdrop-blur-*` / `backdrop-saturate-*` / `rim-glass` / nhánh `supports-[backdrop…]`;
 *  - KHÔNG còn nhánh theo theme (`dark:` / `not-dark:`) hay họ `hud-*` trên mặt nổi — tối cùng hình với sáng, chỉ khác bảng màu;
 *  - hộp thoại / ngăn kéo toàn màn cũng vậy: không `dark:`, `hud-*`, `clip-path`; `Modal frame` · `Popover variant` đã vô hiệu.
 */

import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import {
  ConfirmDialog,
  Drawer,
  DrawerSection,
  FormModal,
  Modal,
  Popover,
  Toast,
  ToastProvider,
  ToastViewport,
  Tooltip,
} from '@/shared/ui';
import { MENU_CONTENT_CLASSES } from '@/shared/ui/actions/menu.theme';
import { FIELD_POPUP_CLASS } from '@/shared/ui/inputs/field.theme';
import {
  FLOATING_SURFACE_LIGHT_CLASS,
  popupSurface,
} from '@/shared/ui/overlays/popup-surface.theme';

const classesOf = (value: string | Element) =>
  (typeof value === 'string' ? value : value.className).split(/\s+/).filter(Boolean);

/** Class kính / mờ — không được có ở theme nào. */
const glassClasses = (value: string | Element) =>
  classesOf(value).filter((c) =>
    /(^|:)backdrop-(blur|saturate)-|(^|:)rim-glass$|supports-\[backdrop/.test(c),
  );

/** Class riêng của một theme (`dark:` / `not-dark:`) hoặc họ `hud-*` — mặt nổi không còn nhánh theo theme. */
const themeBranchClasses = (value: string | Element) =>
  classesOf(value).filter((c) => /(^|:)(not-)?dark:|(^|:)hud-/.test(c));

function expectCrispSurface(value: string | Element) {
  expect(classesOf(value)).toEqual(
    expect.arrayContaining(['bg-bg-dialog', 'border-border-strong']),
  );
  expect(glassClasses(value)).toEqual([]);
  expect(themeBranchClasses(value)).toEqual([]);
}

describe('popup-surface — mặt nổi đục, một diện mạo cho cả hai theme', () => {
  it('FLOATING_SURFACE_LIGHT_CLASS không có nhánh `dark:` / `not-dark:`', () => {
    expect(classesOf(FLOATING_SURFACE_LIGHT_CLASS)).toEqual(
      expect.arrayContaining(['bg-bg-dialog', 'border-border-strong']),
    );
    expect(themeBranchClasses(FLOATING_SURFACE_LIGHT_CLASS)).toEqual([]);
  });

  it.each([
    ['popupSurface()', popupSurface()],
    ['Menu / ContextMenu', MENU_CONTENT_CLASSES],
    ['panel Dropdown / MultiSelect / TreeSelect', FIELD_POPUP_CLASS],
  ])('%s: đục + viền sắc, không kính, không nhánh theo theme', (_name, classes) => {
    expectCrispSurface(classes);
  });
});

describe('Popover · Toast · Tooltip — bề mặt khi hiện', () => {
  it.each(['glass', 'solid'] as const)('Popover variant="%s": đục, không kính', (variant) => {
    render(
      <Popover content={<p>nội dung</p>} defaultOpen variant={variant}>
        <button type="button">Mở</button>
      </Popover>,
    );

    expectCrispSurface(screen.getByRole('dialog'));
  });

  it('Toast: thẻ đục (không `rim-glass`, không vệt nền), ô icon có vòng trong cùng tông', () => {
    render(
      <ToastProvider>
        <Toast open title="Đã lưu" type="success" />
        <ToastViewport />
      </ToastProvider>,
    );

    const root = screen.getByText('Đã lưu').closest('li');
    expect(root).not.toBeNull();
    expectCrispSurface(root as HTMLElement);
    expect(
      classesOf(root as HTMLElement).filter((c) => c.startsWith('bg-[linear-gradient')),
    ).toEqual([]);
    expect(classesOf(root as HTMLElement)).toContain('[--toast-tone:var(--color-success)]');
    expect(root?.querySelector('.ring-\\(--toast-tone\\)\\/25')).not.toBeNull();
  });

  it('Tooltip `data` nền đặc `bg-dialog`; `hint` mực đặc có vòng 1px, không mờ', () => {
    const { unmount } = render(
      <Tooltip content="Doanh thu" open variant="data">
        <button type="button">Tháng 9</button>
      </Tooltip>,
    );
    const data = document.querySelector('[data-radix-popper-content-wrapper] > div');
    expect(classesOf(data as Element)).toContain('bg-bg-dialog');
    expect(glassClasses(data as Element)).toEqual([]);
    expect(themeBranchClasses(data as Element)).toEqual([]);
    unmount();

    render(
      <Tooltip content="Tải xuống" open>
        <button type="button">Tải</button>
      </Tooltip>,
    );
    const hint = document.querySelector('[data-radix-popper-content-wrapper] > div');
    expect(classesOf(hint as Element)).toEqual(
      expect.arrayContaining(['bg-neutral-9', 'ring-1', 'ring-neutral-10']),
    );
    expect(glassClasses(hint as Element)).toEqual([]);
  });
});

const noop = () => undefined;

/** Mọi class của phần tử và hậu duệ trong `document.body` (hộp thoại / ngăn kéo portal ra body). */
const bodyClasses = () =>
  [...document.body.querySelectorAll('[class]')].flatMap((element) =>
    (element.getAttribute('class') ?? '').split(/\s+/).filter(Boolean),
  );

/** `dark:` còn được phép = chỉnh MÀU phẳng (chữ · nền · viền · vòng…, không gradient, không pseudo) hoặc tham số màu `dark:[--x:…]`. */
const isFlatDarkColor = (c: string) =>
  /^dark:\[--(?!hud)[a-z-]+:/.test(c) ||
  (/^dark:(?:[^\s:]+:)*(?:text|bg|border|ring|outline|fill|stroke|divide|decoration)-(?!linear|gradient|\[)/.test(
    c,
  ) &&
    !/(^|:)(before|after):/.test(c));

/** Nhánh HUD còn sót: `not-dark:`, `dark:` không phải chỉnh màu phẳng (quầng · gradient · hình học), `hud-*`, `clip-path`, vát. */
const hudLeftovers = (classes: string[]) =>
  classes.filter(
    (c) =>
      /(^|:)not-dark:/.test(c) ||
      (/(^|:)dark:/.test(c) && !isFlatDarkColor(c)) ||
      /(^|[:-])hud-|clip-path|-skew-/.test(c),
  );

const FULLSCREEN_OVERLAYS: [string, () => React.ReactElement][] = [
  [
    'Modal',
    () => (
      <Modal description="Mô tả" open title="Tiêu đề" onCancel={noop} onConfirm={noop}>
        nội dung
      </Modal>
    ),
  ],
  [
    'FormModal',
    () => (
      <FormModal open title="Biểu mẫu" onConfirm={noop}>
        nội dung
      </FormModal>
    ),
  ],
  [
    'ConfirmDialog',
    () => (
      <ConfirmDialog
        open
        recommendation="Lưu bản nháp"
        secondaryActionLabel="Lưu nháp"
        title="Xoá hạng mục?"
        variant="delete"
        onConfirm={noop}
      />
    ),
  ],
  [
    'Drawer + DrawerSection',
    () => (
      <Drawer footer={<span>chân</span>} open title="Ngăn kéo" onOpenChange={noop}>
        <DrawerSection title="Vùng" tone="warning">
          nội dung
        </DrawerSection>
      </Drawer>
    ),
  ],
];

describe('hộp thoại · ngăn kéo — tối cùng hình với sáng', () => {
  it.each(FULLSCREEN_OVERLAYS)(
    '%s: không còn nhánh HUD (dark: / hud-* / clip-path)',
    (_name, ui) => {
      const { unmount } = render(ui());

      expect(hudLeftovers(bodyClasses())).toEqual([]);
      unmount();
    },
  );

  it('Modal `frame` đã vô hiệu: hud và default ra cùng class panel', () => {
    const panelClassOf = (frame: 'default' | 'hud') => {
      const { unmount } = render(
        <Modal frame={frame} open title="Khung">
          nội dung
        </Modal>,
      );
      const className = screen.getByRole('dialog').className;
      unmount();
      return className;
    };

    expect(panelClassOf('hud')).toBe(panelClassOf('default'));
  });

  it('Popover `variant` đã vô hiệu: glass và solid ra cùng class panel', () => {
    const panelClassOf = (variant: 'glass' | 'solid') => {
      const { unmount } = render(
        <Popover content={<p>nội dung</p>} defaultOpen variant={variant}>
          <button type="button">Mở</button>
        </Popover>,
      );
      const className = screen.getByRole('dialog').className;
      unmount();
      return className;
    };

    expect(panelClassOf('solid')).toBe(panelClassOf('glass'));
  });
});
