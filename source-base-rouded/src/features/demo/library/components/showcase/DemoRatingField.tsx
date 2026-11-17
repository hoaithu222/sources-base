import { memo } from 'react';

import { Button, FormItem, Text, useFieldA11y, useFormField, useFormMeta } from '@/shared/ui';
import { SystemIcon } from '@/shared/ui/icons/Icons';

const LABEL = 'Mức hài lòng';

/**
 * DemoRatingField — field "chấm sao" tự viết của mục "Hook của form": mẫu cho `useFormField` +
 * `useFormMeta` + `useFieldA11y` (nối nhãn / lỗi vào nhóm radio), gắn vào field `satisfaction` của form cha.
 * Lưu ý: `useFormField` / `useFormMeta` cần FormProvider — chỉ chạy dưới `<Form>`, nên tách riêng khỏi section.
 *
 * @example
 * <Form form={form}><DemoRatingField /></Form>
 */
const DemoRatingField = memo(function DemoRatingField() {
  const { field, fieldState } = useFormField('satisfaction');
  const meta = useFormMeta();
  const error = fieldState.error?.message;
  const a11y = useFieldA11y({ label: LABEL, error });
  const value = Number(field.value) || 0;

  return (
    <FormItem {...a11y.item} error={error} label={LABEL} required>
      <div {...a11y.trigger} className="flex items-center gap-0.5" role="radiogroup">
        {[1, 2, 3, 4, 5].map((n) => (
          <Button
            key={n}
            aria-checked={n === value}
            aria-label={`${n} sao`}
            className="w-8 px-0"
            role="radio"
            size="sm"
            variant="ghost"
            onClick={() => field.onChange(n)}
          >
            <SystemIcon
              className={n <= value ? 'text-warning' : 'text-fg-faint'}
              name={n <= value ? 'star-bold' : 'star-outline'}
              size={18}
            />
          </Button>
        ))}
        <span className="ml-2 text-caption-12 text-fg-muted tabular-nums">{value}/5</span>
      </div>
      <Text size="extraTiny" skin="muted">
        useFormMeta: readOnly={String(meta.readOnly)} · autoSave={String(meta.autoSave)}
      </Text>
    </FormItem>
  );
});

export default DemoRatingField;
