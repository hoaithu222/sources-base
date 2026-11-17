'use client';

import { useEffect, useRef } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';

export interface ConditionalFieldProps {
  watch: string;
  condition: (value: unknown) => boolean;
  children: React.ReactNode;
  unregisterNames?: string[];
}

/**
 * ConditionalField — hiện / ẩn một cụm field theo giá trị của một field khác (vd chọn "Khác" thì hiện ô
 * "Ghi rõ").
 *
 * Đặt trong `<Form>`. Ẩn thì children bị gỡ khỏi DOM nhưng giá trị vẫn nằm trong form — khai
 * `unregisterNames` để gỡ hẳn (không gửi lên, không còn bị kiểm). Schema đổi theo nhánh → bọc ngoài bằng
 * `DynamicSchemaField` + `z.discriminatedUnion`.
 *
 * @param props.watch - Tên field đang theo dõi.
 * @param props.condition - `(giá trị của field đang theo dõi) => boolean`; `true` thì hiện children.
 * @param props.children - Các field hiện theo điều kiện.
 * @param props.unregisterNames - Field gỡ đăng ký khi chuyển hiện → ẩn (giá trị bị xoá khỏi form); viết mảng
 *   literal tại chỗ vẫn an toàn.
 *
 * @example
 * <ConditionalField watch="type" condition={(v) => v === 'other'} unregisterNames={['otherNote']}>
 *   <TextField name="otherNote" label="Ghi rõ" required />
 * </ConditionalField>
 */
function ConditionalField({
  watch: watchName,
  condition,
  children,
  unregisterNames,
}: ConditionalFieldProps) {
  const { unregister } = useFormContext();
  const value = useWatch({ name: watchName });
  const isVisible = condition(value);

  const prevVisibleRef = useRef<boolean | null>(null);

  useEffect(() => {
    const wasVisible = prevVisibleRef.current;
    prevVisibleRef.current = isVisible;

    if (wasVisible === true && !isVisible && unregisterNames?.length) {
      unregister(unregisterNames as Parameters<typeof unregister>[0]);
    }
  }, [isVisible, unregister, unregisterNames]);

  if (!isVisible) return null;

  return <>{children}</>;
}

export default ConditionalField;
