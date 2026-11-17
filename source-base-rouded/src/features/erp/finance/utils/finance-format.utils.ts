import { formatNumber } from '@/shared/utils/format/format.utils';
import { formatMoneyCompactRaw } from '@/shared/utils/format/money.utils';

/**
 * Định dạng số tiền của phân hệ Tài chính (vi-VN). Bảng: `formatAmount` — đủ đồng, âm trong ngoặc kiểu kế toán,
 * 0 để trống. Thẻ KPI / chú giải: `formatMoneyShort` — "10,72 tỷ" · "604,35 tr".
 */

/** Đủ đồng: `1234567000` → "1.234.567.000" · âm → "(1.234.000)" · 0 → "" (hoặc `zero`). */
export function formatAmount(value: number, zero = ''): string {
  if (!value) return zero;
  const text = formatNumber(Math.abs(value));
  return value < 0 ? `(${text})` : text;
}

/** Gọn theo đơn vị tỷ / triệu, đủ `digits` số lẻ (cột số thẳng nhịp): "10,72 tỷ" · "4,00 tỷ". */
export function formatMoneyShort(value: number, digits = 2): string {
  const { text, suffix } = formatMoneyCompactRaw(value, digits, true);
  return suffix ? `${text} ${suffix}` : text;
}

/** Tên đối tác bỏ tiền tố loại hình: "Công ty CP Thép Kim Sơn" → "Thép Kim Sơn". */
export const partnerShortName = (name: string) => name.replace(/^Công ty (CP|TNHH) /, '');

/** Tỷ đồng 1 số lẻ cho nhãn biểu đồ: `12.43` → "12,4". */
export const formatBillion = (value: number) => formatNumber(value, 1);

/** Mũi tên + % thay đổi cho dòng phụ thẻ KPI: "▲ 6,2%" · "▼ 1,8%" · "—" khi không so được. */
export function formatChange(pct: number | null): string {
  if (pct === null || !Number.isFinite(pct)) return '—';
  if (Math.abs(pct) < 0.05) return '0%';
  return `${pct > 0 ? '▲' : '▼'} ${formatNumber(Math.abs(pct), 1)}%`;
}
