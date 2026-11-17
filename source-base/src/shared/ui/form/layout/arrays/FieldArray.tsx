import {
  useFieldArray,
  type Control,
  type FieldArrayPath,
  type FieldValues,
  type UseFieldArrayReturn,
} from 'react-hook-form';

type FieldArrayRenderProps<T extends FieldValues, N extends FieldArrayPath<T>> = Pick<
  UseFieldArrayReturn<T, N>,
  'fields' | 'append' | 'prepend' | 'remove' | 'move' | 'insert' | 'swap' | 'update'
>;

export interface FieldArrayProps<T extends FieldValues, N extends FieldArrayPath<T>> {
  name: N;
  control?: Control<T>;
  children: (props: FieldArrayRenderProps<T, N>) => React.ReactNode;
  className?: string;
}

/**
 * FieldArray — danh sách field lặp (liên hệ, dòng hàng…), render-prop bọc `useFieldArray` của react-hook-form.
 *
 * Đặt trong `<Form>`; `children` nhận `{ fields, append, prepend, remove, move, insert, swap, update }`. Mỗi
 * dòng dùng `key={f.id}` (KHÔNG dùng chỉ số) và tên field `${name}.${i}.<khoá>`. Mảng lồng trong mảng → lồng
 * thêm một `FieldArray` với `name` của mảng con (vd `chapters.${i}.lessons`); kéo-thả đổi thứ tự →
 * `SortableFieldArray`; cặp khoá–giá trị tự do → `DictionaryField`.
 * Lưu ý: `append` mặc định focus ô đầu của dòng mới (RHF `shouldFocus`); bố cục dòng do nơi dùng dựng.
 *
 * @param props.name - Đường dẫn của mảng trong form (vd `contacts`, `chapters.0.lessons`).
 * @param props.control - `form.control`; chỉ truyền khi mảng nằm NGOÀI cây `<Form>` / `FormProvider`.
 * @param props.children - Hàm render nhận các thao tác của `useFieldArray`, trả các dòng.
 * @param props.className - Class cho khối bọc danh sách.
 *
 * @example
 * <FieldArray<Values, 'contacts'> name="contacts">
 *   {({ fields, append }) => (
 *     <>
 *       {fields.map((f, i) => (
 *         <TextField key={f.id} name={`contacts.${i}.email`} label={`Email ${i + 1}`} />
 *       ))}
 *       <Button onClick={() => append({ email: '' })}>Thêm</Button>
 *     </>
 *   )}
 * </FieldArray>
 */
function FieldArray<T extends FieldValues, N extends FieldArrayPath<T>>({
  name,
  control,
  children,
  className,
}: FieldArrayProps<T, N>) {
  const methods = useFieldArray<T, N>({ name, control });

  return <div className={className}>{children(methods)}</div>;
}

export default FieldArray;
