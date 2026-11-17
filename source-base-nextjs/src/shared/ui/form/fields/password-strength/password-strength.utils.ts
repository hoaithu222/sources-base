export interface PasswordCondition {
  label: string;
  test: (value: string) => boolean;
}

export type PasswordStrengthLevel = 'empty' | 'weak' | 'moderate' | 'strong';

/** Khoá điều kiện mặc định — cũng là khoá nhãn ở `ui.form` → `passwordStrength.conditions`. */
export type PasswordConditionKey = 'uppercase' | 'digit' | 'minLength';

const DEFAULT_PASSWORD_CONDITION_TESTS = {
  uppercase: (v) => /[A-Z]/.test(v),
  digit: (v) => /\d/.test(v),
  minLength: (v) => v.length >= 8,
} satisfies Record<PasswordConditionKey, PasswordCondition['test']>;

/**
 * Dựng điều kiện mặc định (chữ hoa · chữ số · từ 8 ký tự) với nhãn đã dịch — hàm thuần, không gọi hook.
 * @param labels - Nhãn từng điều kiện theo ngôn ngữ hiện tại.
 * @example buildDefaultPasswordConditions({ uppercase: 'A', digit: '1', minLength: '8' });
 */
export function buildDefaultPasswordConditions(
  labels: Record<PasswordConditionKey, string>,
): PasswordCondition[] {
  return (Object.keys(DEFAULT_PASSWORD_CONDITION_TESTS) as PasswordConditionKey[]).map((key) => ({
    label: labels[key],
    test: DEFAULT_PASSWORD_CONDITION_TESTS[key],
  }));
}

/** Số điều kiện đạt (thang 3) → mức độ mạnh. */
export function getPasswordLevel(passed: number): PasswordStrengthLevel {
  if (passed <= 0) return 'empty';
  if (passed === 1) return 'weak';
  if (passed === 2) return 'moderate';
  return 'strong';
}
