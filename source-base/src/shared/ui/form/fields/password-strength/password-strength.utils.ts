export interface PasswordCondition {
  label: string;
  test: (value: string) => boolean;
}

export type PasswordStrengthLevel = 'empty' | 'weak' | 'moderate' | 'strong';

export const DEFAULT_PASSWORD_CONDITIONS: PasswordCondition[] = [
  { label: 'Ít nhất 1 chữ in hoa', test: (v) => /[A-Z]/.test(v) },
  { label: 'Ít nhất 1 chữ số', test: (v) => /\d/.test(v) },
  { label: 'Ít nhất 8 ký tự', test: (v) => v.length >= 8 },
];

/** Số điều kiện đạt (thang 3) → mức độ mạnh. */
export function getPasswordLevel(passed: number): PasswordStrengthLevel {
  if (passed <= 0) return 'empty';
  if (passed === 1) return 'weak';
  if (passed === 2) return 'moderate';
  return 'strong';
}
