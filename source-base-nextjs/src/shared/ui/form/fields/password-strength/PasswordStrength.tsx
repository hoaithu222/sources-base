import { useTranslations } from 'next-intl';
import { SystemIcon } from '@/shared/ui/icons/Icons';
import { cn } from '@/shared/utils/style/cn';
import {
  buildDefaultPasswordConditions,
  getPasswordLevel,
  type PasswordCondition,
  type PasswordStrengthLevel,
} from './password-strength.utils';

export interface PasswordStrengthProps {
  value: string;
  conditions?: PasswordCondition[];
  className?: string;
}

const PASSWORD_STRENGTH_SEGMENTS = [0, 1, 2, 3];

const PASSWORD_STRENGTH_LIT_SEGMENTS = {
  empty: 0,
  weak: 1,
  moderate: 2,
  strong: 4,
} satisfies Record<PasswordStrengthLevel, number>;

const PASSWORD_STRENGTH_SEGMENT_BASE_CLASSES =
  'h-1 flex-1 rounded-xs transition-[background-color,box-shadow] duration-200 ease-out';

/** Vạch sáng = màu mức (token trạng thái tự lật theo theme); vạch tắt = rãnh `bg-track`. */
const PASSWORD_STRENGTH_SEGMENT_CLASSES = {
  empty: 'bg-bg-track',
  weak: 'bg-error',
  moderate: 'bg-warning',
  strong: 'bg-success',
} satisfies Record<PasswordStrengthLevel, string>;

const PASSWORD_STRENGTH_TAG_CLASSES = {
  empty: 'text-fg-faint',
  weak: 'text-error',
  moderate: 'text-warning',
  strong: 'text-success',
} satisfies Record<PasswordStrengthLevel, string>;

const PASSWORD_STRENGTH_TEXT_CLASSES = 'text-caption-12 text-fg-muted';

/**
 * PasswordStrength — thước đo độ mạnh mật khẩu: 4 vạch + nhãn mức + câu đánh giá + danh sách điều kiện.
 *
 * Trong form dùng `PasswordField showStrength` (đã ghép sẵn); dùng riêng khi tự dựng ô mật khẩu.
 * Mức độ suy từ SỐ điều kiện đạt (`getPasswordLevel`): 0 → `empty` · 1 → `weak` · 2 → `moderate` ·
 * từ 3 → `strong`; số vạch sáng 0 / 1 / 2 / 4 ("mạnh" = đầy thước).
 * Sửa giao diện: màu vạch → `PASSWORD_STRENGTH_SEGMENT_CLASSES` · số vạch sáng →
 * `PASSWORD_STRENGTH_LIT_SEGMENTS` · màu nhãn mức → `PASSWORD_STRENGTH_TAG_CLASSES` · chữ nhãn mức và câu
 * đánh giá → `ui.form` → `passwordStrength.tags` / `passwordStrength.labels` (theo ngôn ngữ).
 * Lưu ý: thang có 3 mức nên truyền hơn 3 điều kiện thì đạt 3 bất kỳ đã là "mạnh".
 *
 * @param props.value - Mật khẩu đang gõ.
 * @param props.conditions - Điều kiện `{ label, test(value) }` (nhãn đã dịch). Bỏ trống = bộ mặc định (chữ hoa ·
 *   chữ số · từ 8 ký tự) với nhãn theo ngôn ngữ (`ui.form` → `passwordStrength.conditions`).
 * @param props.className - Class cho khối ngoài cùng.
 *
 * @example
 * <PasswordStrength value={password} />
 */
function PasswordStrength({
  value,
  conditions: customConditions,
  className,
}: PasswordStrengthProps) {
  const t = useTranslations('ui.form');
  const conditions =
    customConditions ??
    buildDefaultPasswordConditions({
      uppercase: t('passwordStrength.conditions.uppercase'),
      digit: t('passwordStrength.conditions.digit'),
      minLength: t('passwordStrength.conditions.minLength'),
    });
  const results = conditions.map((c) => c.test(value));
  const passed = results.filter(Boolean).length;
  const level = getPasswordLevel(passed);
  const litSegments = PASSWORD_STRENGTH_LIT_SEGMENTS[level];

  const strengthClassName = cn('flex flex-col gap-1.5', className);
  const tagClassName = cn(
    'w-16 shrink-0 text-right text-caption-12-medium',
    PASSWORD_STRENGTH_TAG_CLASSES[level],
  );

  return (
    <div className={strengthClassName}>
      <div className="flex items-center gap-3">
        <div
          aria-label={t('passwordStrength.meterAria')}
          aria-valuemax={conditions.length}
          aria-valuemin={0}
          aria-valuenow={passed}
          aria-valuetext={t(`passwordStrength.tags.${level}`)}
          className="flex flex-1 gap-1"
          role="meter"
        >
          {PASSWORD_STRENGTH_SEGMENTS.map((i) => (
            <span
              key={i}
              className={cn(
                PASSWORD_STRENGTH_SEGMENT_BASE_CLASSES,
                PASSWORD_STRENGTH_SEGMENT_CLASSES[i < litSegments ? level : 'empty'],
              )}
            />
          ))}
        </div>
        <span aria-hidden className={tagClassName}>
          {t(`passwordStrength.tags.${level}`)}
        </span>
      </div>

      <p className={PASSWORD_STRENGTH_TEXT_CLASSES}>{t(`passwordStrength.labels.${level}`)}</p>

      <ul className="flex flex-col gap-1">
        {conditions.map((c, i) => (
          <li key={c.label} className="flex items-center gap-1.5">
            <SystemIcon
              aria-hidden
              className={results[i] ? 'text-success' : 'text-fg-faint'}
              name={results[i] ? 'circle-check-outline' : 'circle-outline'}
              size={14}
            />
            <span className={cn('text-caption-12', results[i] ? 'text-fg-body' : 'text-fg-muted')}>
              {c.label}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default PasswordStrength;
