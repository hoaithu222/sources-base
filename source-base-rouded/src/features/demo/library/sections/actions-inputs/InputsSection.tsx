import { memo, useState } from 'react';

import { FIELD_HEIGHT, Input, NumberInput, Text, Textarea } from '@/shared/ui';
import { SystemIcon } from '@/shared/ui/icons/Icons';
import { cn } from '@/shared/utils/style/cn';

import DemoGrid from '../../components/shell/DemoGrid';
import DemoRow from '../../components/shell/DemoRow';
import DemoSection from '../../components/shell/DemoSection';
import {
  FIELD_SIZES,
  INPUT_BORDERS,
  INPUT_VARIANTS,
} from '../../constants/actions-inputs/inputs.constants';

/**
 * InputsSection — mục "Ô nhập" của trang `/demo`: `Input` · `Textarea` · `NumberInput` trên cùng nền field.
 */
const InputsSection = memo(function InputsSection() {
  const [amount, setAmount] = useState<number | null>(1250);
  const [amountVnd, setAmountVnd] = useState<number | null>(4_500_000);

  return (
    <DemoSection
      description="Input · Textarea · NumberInput — cùng chung nền field (FIELD_HEIGHT). Ô CHỌN ở mục kế bên."
      importPath="@/shared/ui"
      title="Ô nhập"
    >
      <DemoRow
        label="FIELD_HEIGHT"
        note="nguồn chiều cao DUY NHẤT — Input/Textarea/NumberInput/Dropdown dùng chung"
      >
        {FIELD_SIZES.map((size) => (
          <div
            key={size}
            className={cn(
              FIELD_HEIGHT[size],
              'flex items-center rounded-md border border-dashed border-border-strong px-3',
            )}
          >
            <Text className="font-mono" size="extraTiny" skin="muted">
              {size} · {FIELD_HEIGHT[size]}
            </Text>
          </div>
        ))}
      </DemoRow>

      <DemoRow label="Input · size" stacked>
        <DemoGrid min="md">
          {FIELD_SIZES.map((size) => (
            <Input key={size} placeholder={`size="${size}"`} size={size} />
          ))}
        </DemoGrid>
      </DemoRow>

      <DemoRow
        label="Input · variant / border"
        note="border=none/bottomLine bỏ khung — dùng khi input nằm trong ô bảng"
        stacked
      >
        <DemoGrid min="sm">
          {INPUT_VARIANTS.map((variant) => (
            <Input key={variant} placeholder={variant} variant={variant} />
          ))}
        </DemoGrid>
        <DemoGrid min="md">
          {INPUT_BORDERS.map((border) => (
            <Input key={border} border={border} defaultValue="Gõ thử…" placeholder={border} />
          ))}
        </DemoGrid>
        <DemoGrid min="md">
          {INPUT_BORDERS.map((border) => (
            <Input key={border} border={border} invalid placeholder={`${border} · invalid`} />
          ))}
        </DemoGrid>
      </DemoRow>

      <DemoRow label="Input · phụ kiện & trạng thái" stacked>
        <DemoGrid min="lg">
          <Input
            placeholder="Có icon đầu dòng"
            startIcon={<SystemIcon name="magnifying-glass-outline" size={16} />}
          />
          <Input
            endIcon={<SystemIcon name="calendar-outline" size={16} />}
            placeholder="Có icon cuối dòng"
          />
          <Input clearable defaultValue="Xoá nhanh được" placeholder="clearable" />
          <Input
            clearable
            placeholder="Ô tìm kiếm — filled: nền xám, viền chỉ hiện khi focus"
            startIcon={
              <SystemIcon className="text-fg-faint" name="magnifying-glass-outline" size={16} />
            }
            variant="filled"
          />
          <Input invalid placeholder="invalid — viền đỏ" />
          <Input defaultValue="disabled — vẫn đọc được" disabled />
          <Input defaultValue="filled + disabled" disabled variant="filled" />
          <Input clearable placeholder="readOnly" readOnly value="Chỉ đọc — không hiện ✕" />
        </DemoGrid>
      </DemoRow>

      <DemoRow
        label="NumberInput"
        note="chặn ký tự không phải số, có nút tăng/giảm (tự tắt ở min/max) — KHÔNG có prop clearable"
        stacked
      >
        <DemoGrid min="md">
          <NumberInput max={100000} min={0} step={50} value={amount} onChange={setAmount} />
          <NumberInput defaultValue={10} max={10} min={0} />
        </DemoGrid>
      </DemoRow>

      <DemoRow label="NumberInput · size / invalid / disabled" stacked>
        <DemoGrid min="md">
          {FIELD_SIZES.map((size) => (
            <NumberInput key={size} defaultValue={1} size={size} />
          ))}
        </DemoGrid>
        <DemoGrid min="md">
          <NumberInput defaultValue={5} invalid />
          <NumberInput defaultValue={5} disabled />
          <NumberInput border="bottomLine" defaultValue={5} invalid />
        </DemoGrid>
      </DemoRow>

      <DemoRow
        label="NumberInput · variant / số nguyên / đơn vị / tiền"
        note="số căn phải · vi-VN 1.234.567,89"
        stacked
      >
        <DemoGrid min="sm">
          {INPUT_VARIANTS.map((variant) => (
            <NumberInput key={variant} defaultValue={10} variant={variant} />
          ))}
        </DemoGrid>
        <DemoGrid min="md">
          <NumberInput allowDecimal={false} defaultValue={12} suffix="m²" />
          <NumberInput
            decimalScale={0}
            hideStepper
            suffix="₫"
            thousandSeparator
            value={amountVnd}
            onChange={setAmountVnd}
          />
          <NumberInput decimalScale={2} defaultValue={1234567.89} hideStepper thousandSeparator />
        </DemoGrid>
      </DemoRow>

      <DemoRow label="Textarea · size / maxLength / minHeight / invalid" stacked>
        <DemoGrid min="md">
          {FIELD_SIZES.map((size) => (
            <Textarea key={size} placeholder={`size="${size}"`} size={size} />
          ))}
          <Textarea maxLength={200} placeholder="Đếm ký tự tự bật khi có maxLength" />
          <Textarea defaultValue="Chạm giới hạn" maxLength={13} />
          <Textarea invalid minHeight={80} placeholder="invalid + minHeight tuỳ chỉnh" />
          <Textarea defaultValue="disabled" disabled />
        </DemoGrid>
      </DemoRow>
    </DemoSection>
  );
});

export default InputsSection;
