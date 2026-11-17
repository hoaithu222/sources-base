/**
 * Vùng chạm của điều khiển nhỏ trên máy chạm — `docs/rules/display/ipad-responsive.md §3.3`.
 *
 * jsdom không có CSS nên test đọc CLASS: hình KHÔNG đổi, chỉ `::after` trong suốt (`touch:after:*` + `relative`) nới
 * hộp bấm. Mất một trong các class đó là điều khiển 16–24px quay về khó bấm mà không ai thấy khác biệt trên laptop.
 */

import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Button, Checkbox, Input, PasswordField, Radio, RadioGroup, Toggle } from '@/shared/ui';
import { TOUCH_HIT_CLASSES } from '@/shared/ui/primitives/touch-hit.theme';
import { renderInForm, renderWithIntl } from '@tests/helpers/render';

const classesOf = (el: Element) => el.className.split(/\s+/);

describe('Button — hộp bấm ≥ 44px trên máy chạm, hình chỉ siết', () => {
  it.each(['xl', 'lg', 'md', 'sm', 'xs'] as const)(
    'size="%s": relative + ::after nới dọc',
    (size) => {
      renderWithIntl(<Button size={size}>Lưu</Button>);
      const classes = classesOf(screen.getByRole('button', { name: 'Lưu' }));

      expect(classes).toContain('relative');
      expect(classes).toContain('touch:after:absolute');
      expect(classes).toContain("touch:after:content-['']");
      expect(classes.some((c) => c.startsWith('touch:after:-inset-y-'))).toBe(true);
    },
  );

  it('không có bậc touch: nào LỚN hơn cỡ nền (chỉ được siết)', () => {
    renderWithIntl(<Button size="md">Lưu</Button>);
    const classes = classesOf(screen.getByRole('button', { name: 'Lưu' }));

    expect(classes).toContain('h-9');
    expect(classes).toContain('touch:h-8');
  });

  it('className của nơi dùng vẫn đè được vị trí (absolute / fixed)', () => {
    renderWithIntl(
      <Button className="absolute" size="sm">
        Đóng
      </Button>,
    );
    const classes = classesOf(screen.getByRole('button', { name: 'Đóng' }));

    expect(classes).toContain('absolute');
    expect(classes).not.toContain('relative');
  });
});

describe('Checkbox · Radio · Toggle — ô nhỏ nới hộp bấm bằng ::after', () => {
  it('Checkbox', () => {
    renderWithIntl(<Checkbox aria-label="Chọn" />);
    const classes = classesOf(screen.getByRole('checkbox'));

    expect(classes).toContain('relative');
    expect(classes).toContain('touch:after:absolute');
    expect(classes).toContain('touch:after:-inset-3');
  });

  it('Radio', () => {
    renderWithIntl(
      <RadioGroup>
        <Radio aria-label="Một" value="1" />
      </RadioGroup>,
    );
    const classes = classesOf(screen.getByRole('radio'));

    expect(classes).toContain('relative');
    expect(classes).toContain('touch:after:absolute');
  });

  it('Toggle nới nhiều theo chiều dọc hơn chiều ngang', () => {
    renderWithIntl(<Toggle aria-label="Bật" />);
    const classes = classesOf(screen.getByRole('switch'));

    expect(classes).toContain('touch:after:-inset-y-3');
    expect(classes).toContain('touch:after:-inset-x-1');
  });
});

describe('Input — cả khung 36px là vùng nhập, nút ✕ nới hộp bấm', () => {
  it('<input> cao bằng khung (h-full) để chạm vào đâu trong ô cũng vào chữ', () => {
    renderWithIntl(<Input aria-label="Tên" />);

    expect(screen.getByLabelText('Tên')).toHaveClass('h-full');
  });

  it('nút Xóa có ::after', () => {
    renderWithIntl(<Input aria-label="Tên" clearable defaultValue="abc" />);
    const clear = screen.getByRole('button', { name: 'Xóa' });

    expect(classesOf(clear)).toContain('touch:after:absolute');
  });

  it('nút hiện mật khẩu của PasswordField có ::after', () => {
    renderInForm(<PasswordField label="Mật khẩu" name="password" />, { password: '' });

    expect(classesOf(screen.getByRole('button', { name: 'Hiện mật khẩu' }))).toContain(
      'touch:after:absolute',
    );
  });
});

describe('TOUCH_HIT_CLASSES', () => {
  it.each(Object.entries(TOUCH_HIT_CLASSES))(
    '%s: đủ relative + absolute + content rỗng',
    (_name, value) => {
      expect(value).toContain('relative');
      expect(value).toContain('touch:after:absolute');
      expect(value).toContain("touch:after:content-['']");
    },
  );
});
