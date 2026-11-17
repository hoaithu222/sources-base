/**
 * `ChoiceTiles` — chọn bằng hình kiểu macOS: là nhóm radio thật (tên nhóm, tên từng ô, phím mũi tên), `swatch` đọc tên
 * qua `aria-label`, ô / nhóm khoá không đổi giá trị.
 */

import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { ChoiceTiles } from '@/shared/ui';

const TILES = [
  { value: 'system', label: 'Tự động', preview: <span /> },
  { value: 'light', label: 'Sáng', preview: <span /> },
  { value: 'dark', label: 'Tối', preview: <span />, disabled: true },
];

describe('ChoiceTiles', () => {
  it('là radiogroup có tên; ô mang nhãn làm tên, ô đang chọn aria-checked', () => {
    render(
      <ChoiceTiles aria-label="Giao diện" options={TILES} value="light" onValueChange={vi.fn()} />,
    );
    expect(screen.getByRole('radiogroup', { name: 'Giao diện' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Sáng' })).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByRole('radio', { name: 'Tự động' })).toHaveAttribute('aria-checked', 'false');
  });

  it('bấm ô → onValueChange với value của ô; ô khoá không gọi', () => {
    const onValueChange = vi.fn();
    render(
      <ChoiceTiles
        aria-label="Giao diện"
        options={TILES}
        value="light"
        onValueChange={onValueChange}
      />,
    );
    fireEvent.click(screen.getByRole('radio', { name: 'Tự động' }));
    expect(onValueChange).toHaveBeenCalledWith('system');

    onValueChange.mockClear();
    fireEvent.click(screen.getByRole('radio', { name: 'Tối' }));
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it('swatch: tên đọc + tooltip từ label, class nền `fill` gắn lên chấm', () => {
    render(
      <ChoiceTiles
        aria-label="Màu nhấn"
        options={[
          { value: 'blue', label: 'Xanh dương', fill: 'bg-blue-6' },
          { value: 'red', label: 'Đỏ', fill: 'bg-red-6' },
        ]}
        value="red"
        variant="swatch"
        onValueChange={vi.fn()}
      />,
    );
    const blue = screen.getByRole('radio', { name: 'Xanh dương' });
    expect(blue).toHaveAttribute('title', 'Xanh dương');
    expect(blue).toHaveClass('bg-blue-6');
    expect(screen.getByRole('radio', { name: 'Đỏ' })).toHaveAttribute('aria-checked', 'true');
  });

  it('`disabled` khoá cả nhóm', () => {
    render(
      <ChoiceTiles
        aria-label="Giao diện"
        disabled
        options={TILES}
        value="light"
        onValueChange={vi.fn()}
      />,
    );
    expect(screen.getByRole('radio', { name: 'Tự động' })).toBeDisabled();
    expect(screen.getByRole('radio', { name: 'Sáng' })).toBeDisabled();
  });
});
