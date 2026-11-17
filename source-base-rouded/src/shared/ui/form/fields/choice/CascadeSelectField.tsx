import { useState, useEffect, useId } from 'react';
import { get, useFormContext, useWatch } from 'react-hook-form';
import Dropdown from '@/shared/ui/selects/dropdown/Dropdown';
import type { DropdownOption, DropdownSize } from '@/shared/ui/selects/dropdown/dropdown.types';
import { useEventCallback, useLatestRequest } from '@/shared/hooks';
import FieldReadOnly from '../../field-read-only';
import FormItem from '../../FormItem';
import { buildFieldA11y } from '../field-a11y.utils';
import { useFormMeta } from '../hooks/useFormMeta';

export interface CascadeLevel {
  /** Tên field của cấp này trong form; phải duy nhất trong một cascade. */
  name: string;
  /** Nhãn hiện phía trên ô của cấp. */
  label: string;
  /** Nhận giá trị của mọi cấp đứng trước làm tham số. */
  fetch: (...parentValues: string[]) => Promise<DropdownOption[]>;
}

export interface CascadeSelectFieldProps {
  levels: CascadeLevel[];
  disabled?: boolean;
  className?: string;
  size?: DropdownSize;
}

interface LoadedOptions {
  parentKey: string;
  options: DropdownOption[];
}

const toFormString = (value: unknown) => (value == null ? '' : String(value));

async function loadOptions(level: CascadeLevel, parentValues: string[]): Promise<DropdownOption[]> {
  try {
    return await level.fetch(...parentValues);
  } catch {
    return [];
  }
}

/**
 * CascadeSelectField — chuỗi ô chọn phụ thuộc nhau (tỉnh → huyện → xã): đổi cấp cha thì các cấp con tự
 * xoá giá trị và nạp lại danh sách.
 *
 * Đặt trong `<Form>`; mỗi cấp là một field riêng (`level.name`), form `readOnly` thì hiện nhãn từng cấp.
 * Cấp nào có đủ giá trị ở mọi cấp cha thì được nạp — kể cả giá trị điền sẵn lúc mount hay đổ vào sau bằng
 * `form.reset()` (form sửa mở trong modal). Ô của cấp con bị khoá tới khi cấp cha có giá trị.
 * Một cấp chọn từ danh sách có sẵn → `SelectField`; tìm theo từ khoá qua API → `AsyncSelectField`.
 * Lưu ý: `levels` chỉ đọc lúc mount; đổi số cấp / tên cấp giữa chừng phải remount component (đổi `key`).
 * Nạp lỗi → cấp đó để trống (hiện "Chọn"); đổi cấp cha để nạp lại. Kết quả về muộn của cấp cha cũ bị bỏ.
 *
 * @param props.levels - Các cấp theo thứ tự cha → con: `{ name, label, fetch(...giá trị các cấp cha) }`
 *   (xem `CascadeLevel`).
 * @param props.disabled - `true` → khoá mọi cấp.
 * @param props.className - Class cho khối bọc các cấp (vd `grid grid-cols-3 gap-4`).
 * @param props.size - Chiều cao mỗi ô: `sm` 32px | `md` 36px | `lg` 40px. Mặc định `md`.
 *
 * @example
 * <CascadeSelectField
 *   className="grid grid-cols-2 gap-4"
 *   levels={[
 *     { name: 'province', label: 'Tỉnh/thành', fetch: () => api.provinces() },
 *     { name: 'district', label: 'Quận/huyện', fetch: (province) => api.districts(province) },
 *   ]}
 * />
 */
function CascadeSelectField({ levels, disabled, className, size }: CascadeSelectFieldProps) {
  const { readOnly } = useFormMeta();
  const uid = useId();
  const { setValue, formState } = useFormContext();
  const watched = useWatch({ name: levels.map((level) => level.name) }) as unknown[];
  const [loaded, setLoaded] = useState<Record<string, LoadedOptions>>({});
  const { begin, invalidate } = useLatestRequest();

  const values = levels.map((_, index) => toFormString(watched[index]));
  const chainKey = JSON.stringify(values);
  const parentKeyOf = (index: number) => JSON.stringify(values.slice(0, index));
  const parentsReady = (index: number) => values.slice(0, index).every(Boolean);
  const isFresh = (index: number) => loaded[levels[index].name]?.parentKey === parentKeyOf(index);

  const loadMissing = useEventCallback((isCurrent: () => boolean) => {
    levels.forEach((level, index) => {
      if (!parentsReady(index) || isFresh(index)) return;
      const parentKey = parentKeyOf(index);
      void loadOptions(level, values.slice(0, index)).then((options) => {
        if (!isCurrent()) return;
        setLoaded((prev) => ({ ...prev, [level.name]: { parentKey, options } }));
      });
    });
  });

  useEffect(() => {
    loadMissing(begin());
    return invalidate;
  }, [chainKey, begin, invalidate, loadMissing]);

  const handleChange = (levelIndex: number, value: string) => {
    setValue(levels[levelIndex].name, value, { shouldValidate: true, shouldDirty: true });
    for (const level of levels.slice(levelIndex + 1)) {
      setValue(level.name, '', { shouldDirty: true });
    }
  };

  return (
    <div className={className}>
      {levels.map((level, idx) => {
        const value = values[idx];
        const error = (get(formState.errors, level.name) as { message?: string } | undefined)
          ?.message;
        const opts = isFresh(idx) ? loaded[level.name].options : [];
        const loading = parentsReady(idx) && !isFresh(idx);
        const a11y = buildFieldA11y(`${uid}${level.name}-`, { label: level.label, error });

        if (readOnly) {
          const selectedLabel = opts.find((o) => o.value === value)?.label ?? value;
          return (
            <FieldReadOnly key={level.name} label={level.label}>
              {selectedLabel}
            </FieldReadOnly>
          );
        }

        return (
          <FormItem key={level.name} {...a11y.item} error={error} label={level.label}>
            <Dropdown
              {...a11y.trigger}
              disabled={disabled || (idx > 0 && !values[idx - 1])}
              invalid={Boolean(error)}
              options={opts}
              placeholder={loading ? 'Đang tải...' : 'Chọn'}
              size={size}
              value={value}
              onValueChange={(val) => handleChange(idx, val)}
            />
          </FormItem>
        );
      })}
    </div>
  );
}

export default CascadeSelectField;
