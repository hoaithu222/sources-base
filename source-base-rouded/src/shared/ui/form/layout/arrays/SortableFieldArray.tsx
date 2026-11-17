import { useContext } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type Active,
  type Announcements,
  type DragEndEvent,
  type Over,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  useFieldArray,
  type Control,
  type FieldArrayPath,
  type FieldArrayWithId,
  type FieldValues,
  type UseFieldArrayReturn,
} from 'react-hook-form';
import { SystemIcon } from '@/shared/ui/icons/Icons';
import { cn } from '@/shared/utils/style/cn';
import { TOUCH_HIT_CLASSES } from '@/shared/ui/primitives/touch-hit.theme';
import { DragHandleContext } from './sortable-field-array.context';

interface SortableRenderProps<T extends FieldValues, N extends FieldArrayPath<T>> {
  fields: FieldArrayWithId<T, N>[];
  append: UseFieldArrayReturn<T, N>['append'];
  remove: UseFieldArrayReturn<T, N>['remove'];
  move: UseFieldArrayReturn<T, N>['move'];
}

export interface SortableFieldArrayProps<T extends FieldValues, N extends FieldArrayPath<T>> {
  name: N;
  control?: Control<T>;
  children: (props: SortableRenderProps<T, N>) => React.ReactNode;
  className?: string;
}

const SORTABLE_ITEM_DRAGGING_CLASSES = cn(
  'z-10 rounded-md opacity-90',
  'shadow-[0_8px_24px_var(--color-shadow-popup)] ring-1 ring-primary-5/40',
  'dark:ring-primary-4/70',
);

const SORTABLE_DRAG_HANDLE_CLASSES = cn(
  TOUCH_HIT_CLASSES.inline,
  'inline-flex size-7 shrink-0 cursor-grab touch-none items-center justify-center rounded-sm text-fg-muted',
  'transition-colors duration-150 ease-out',
  'hover:bg-bg-subtle hover:text-fg-heading',
  'active:cursor-grabbing active:bg-bg-pressed active:text-link',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring-focus',
);

const position = (item: Active | Over | null) =>
  ((item?.data.current?.sortable?.index as number | undefined) ?? 0) + 1;

const SORTABLE_ANNOUNCEMENTS: Announcements = {
  onDragStart: ({ active }) => `Đã nhấc dòng ${position(active)}.`,
  onDragOver: ({ active, over }) =>
    over ? `Dòng ${position(active)} đang ở vị trí ${position(over)}.` : undefined,
  onDragEnd: ({ active, over }) =>
    over ? `Đã thả dòng ${position(active)} vào vị trí ${position(over)}.` : undefined,
  onDragCancel: ({ active }) => `Đã huỷ kéo, dòng ${position(active)} về chỗ cũ.`,
};

const SORTABLE_ACCESSIBILITY = {
  announcements: SORTABLE_ANNOUNCEMENTS,
  screenReaderInstructions: {
    draggable:
      'Nhấn Space để nhấc dòng, dùng mũi tên lên / xuống để di chuyển, Space để thả, Esc để huỷ.',
  },
};

/**
 * SortableItem — một dòng kéo-thả được của `SortableFieldArray` (`SortableFieldArray.Item`).
 *
 * Đặt trong hàm render của `SortableFieldArray`; bên trong có `SortableFieldArray.DragHandle` làm tay nắm.
 *
 * @param props.id - Id của dòng — lấy đúng `fields[i].id` (khớp danh sách `SortableContext`).
 * @param props.children - Nội dung dòng (tay nắm + các field).
 *
 * @example
 * <SortableFieldArray.Item key={f.id} id={f.id}>…</SortableFieldArray.Item>
 */
function SortableItem({ id, children }: { id: string; children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
  });

  return (
    <DragHandleContext.Provider value={{ attributes, listeners }}>
      <div
        ref={setNodeRef}
        className={cn('relative', isDragging && SORTABLE_ITEM_DRAGGING_CLASSES)}
        style={{ transform: CSS.Transform.toString(transform), transition }}
      >
        {children}
      </div>
    </DragHandleContext.Provider>
  );
}

/**
 * DragHandle — tay nắm kéo của một dòng (`SortableFieldArray.DragHandle`); chỉ kéo được khi nắm vào đây.
 *
 * Đặt trong `SortableFieldArray.Item`. Bàn phím: focus tay nắm → Space để nhấc, mũi tên để di chuyển,
 * Space để thả.
 *
 * @param props.className - Class cho nút tay nắm.
 *
 * @example
 * <SortableFieldArray.DragHandle className="mt-8" />
 */
function DragHandle({ className }: { className?: string }) {
  const { attributes, listeners } = useContext(DragHandleContext);
  return (
    <button
      type="button"
      {...(attributes as React.ButtonHTMLAttributes<HTMLButtonElement>)}
      {...(listeners as unknown as React.ButtonHTMLAttributes<HTMLButtonElement>)}
      aria-label="Kéo để sắp xếp"
      className={cn(SORTABLE_DRAG_HANDLE_CLASSES, className)}
    >
      <SystemIcon name="grip-dots-vertical-outline" size={16} />
    </button>
  );
}

/**
 * SortableFieldArrayBase — hàm gốc của `SortableFieldArray` (trước khi gắn `Item` / `DragHandle`); xem khối
 * tài liệu của `SortableFieldArray`.
 *
 * @example
 * <SortableFieldArrayBase name="steps">{({ fields }) => …}</SortableFieldArrayBase>
 */
function SortableFieldArrayBase<T extends FieldValues, N extends FieldArrayPath<T>>({
  name,
  control,
  children,
  className,
}: SortableFieldArrayProps<T, N>) {
  const { fields, append, remove, move } = useFieldArray<T, N>({ name, control });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;
    const oldIndex = fields.findIndex((f) => f.id === active.id);
    const newIndex = fields.findIndex((f) => f.id === over.id);
    if (oldIndex !== -1 && newIndex !== -1) move(oldIndex, newIndex);
  };

  const listClassName = cn('flex flex-col gap-2', className);

  return (
    <DndContext
      accessibility={SORTABLE_ACCESSIBILITY}
      collisionDetection={closestCenter}
      sensors={sensors}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={fields.map((f) => f.id)} strategy={verticalListSortingStrategy}>
        <div className={listClassName}>{children({ fields, append, remove, move })}</div>
      </SortableContext>
    </DndContext>
  );
}

/**
 * SortableFieldArray — danh sách field lặp đổi được thứ tự bằng kéo-thả (chuột, chạm, bàn phím), bọc
 * `useFieldArray` + dnd-kit.
 *
 * Đặt trong `<Form>`; `children` nhận `{ fields, append, remove, move }`, mỗi dòng bọc trong
 * `<SortableFieldArray.Item id={f.id}>` và có một `<SortableFieldArray.DragHandle />`. Thứ tự không quan
 * trọng → `FieldArray`.
 * Sửa giao diện: dòng đang kéo → `SORTABLE_ITEM_DRAGGING_CLASSES` · tay nắm → `SORTABLE_DRAG_HANDLE_CLASSES`.
 * Lưu ý: chỉ tay nắm nhận kéo (chuột, chạm, bàn phím Space + mũi tên); lời đọc cho trình đọc màn hình là
 * tiếng Việt (`SORTABLE_ANNOUNCEMENTS`).
 *
 * @param props.name - Đường dẫn của mảng trong form (vd `steps`).
 * @param props.control - `form.control`; chỉ truyền khi mảng nằm NGOÀI cây `<Form>` / `FormProvider`.
 * @param props.children - Hàm render nhận `{ fields, append, remove, move }`, trả các dòng.
 * @param props.className - Class cho cột danh sách (mặc định `flex flex-col gap-2`).
 *
 * @example
 * <SortableFieldArray<Values, 'steps'> name="steps">
 *   {({ fields }) =>
 *     fields.map((f, i) => (
 *       <SortableFieldArray.Item key={f.id} id={f.id}>
 *         <SortableFieldArray.DragHandle />
 *         <TextField name={`steps.${i}.title`} label={`Bước ${i + 1}`} />
 *       </SortableFieldArray.Item>
 *     ))
 *   }
 * </SortableFieldArray>
 */
const SortableFieldArray = Object.assign(SortableFieldArrayBase, {
  Item: SortableItem,
  DragHandle,
});

export default SortableFieldArray;
