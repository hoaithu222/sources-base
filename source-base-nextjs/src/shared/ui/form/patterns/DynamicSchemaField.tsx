'use client';

import { useEffect, useRef } from 'react';
import { useWatch, useFormContext } from 'react-hook-form';

export interface DynamicSchemaFieldProps {
  watch: string;
  children: React.ReactNode;
}

/**
 * DynamicSchemaField — kiểm lại cả form khi field "phân biệt" (discriminant) đổi giá trị, để lỗi của nhánh
 * cũ biến mất và lỗi của nhánh mới hiện ra ngay.
 *
 * Đặt trong `<Form>` có schema `z.discriminatedUnion(...)`, bọc các `ConditionalField` của từng nhánh.
 * Lưu ý: chỉ kiểm khi giá trị ĐỔI sau lần render đầu — không kiểm lúc mount, cũng không kiểm khi field đổi
 * từ `undefined` (không có trong `defaultValues`) sang giá trị đầu tiên (tránh đỏ cả form trước khi gõ).
 *
 * @param props.watch - Tên field phân biệt cần theo dõi (vd `customerType`).
 * @param props.children - Các nhánh field (thường là `ConditionalField`).
 *
 * @example
 * <DynamicSchemaField watch="customerType">
 *   <ConditionalField watch="customerType" condition={(v) => v === 'company'}>
 *     <TextField name="taxId" label="Mã số thuế" required />
 *   </ConditionalField>
 * </DynamicSchemaField>
 */
function DynamicSchemaField({ watch: watchName, children }: DynamicSchemaFieldProps) {
  const { trigger } = useFormContext();
  const discriminant = useWatch({ name: watchName }) as string | undefined;

  const prevDiscriminantRef = useRef(discriminant);

  useEffect(() => {
    const prev = prevDiscriminantRef.current;
    prevDiscriminantRef.current = discriminant;
    if (prev !== undefined && prev !== discriminant) {
      void trigger();
    }
  }, [discriminant, trigger]);

  return <>{children}</>;
}

export default DynamicSchemaField;
