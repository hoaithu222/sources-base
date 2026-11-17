/**
 * `task-progress.utils` — có trong catalog `reuse-first.md` nhưng base chưa có màn nào gọi (API dọn
 * sẵn cho dự án kế thừa). Test vừa giữ hành vi, vừa là "nơi dùng" để knip không báo file mồ côi.
 */

import { describe, expect, it } from 'vitest';

import {
  taskProgressColorToken,
  taskProgressTextClass,
  taskProgressVariant,
} from '@/shared/utils/style/task-progress.utils';

describe('task-progress.utils', () => {
  it('thang một việc: 100 xong · ≥ 70 · ≥ 30 · còn lại lỗi; kẹp ngoài [0, 100]', () => {
    expect(taskProgressVariant(100)).toBe('success');
    expect(taskProgressVariant(140)).toBe('success');
    expect(taskProgressVariant(99)).toBe('primary');
    expect(taskProgressVariant(70)).toBe('primary');
    expect(taskProgressVariant(30)).toBe('warning');
    expect(taskProgressVariant(29)).toBe('error');
    expect(taskProgressVariant(-5)).toBe('error');
  });

  it('class chữ và token màu cùng mức với thanh tiến độ', () => {
    expect(taskProgressTextClass(100)).toBe('text-success-5');
    expect(taskProgressColorToken(50)).toBe('warning-5');
  });
});
