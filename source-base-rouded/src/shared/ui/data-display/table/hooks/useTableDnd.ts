import { useCallback, useMemo } from 'react';
import { KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import type {
  DndContextProps,
  DragEndEvent,
  KeyboardSensorOptions,
  PointerSensorOptions,
  UniqueIdentifier,
  UseDraggableArguments,
} from '@dnd-kit/core';
import type { TableProps } from '../table.types';

interface UseTableDndParams<TData> extends Pick<TableProps<TData>, 'isRowDraggable' | 'onReorder'> {
  data: TData[];
  getRowKey: (row: TData, index: number) => string | number;
}

/** Chuột phải đi ≥ 4px mới bắt đầu kéo — bấm thường trên tay cầm không thành kéo. */
const POINTER_SENSOR_OPTIONS: PointerSensorOptions = { activationConstraint: { distance: 4 } };

const KEYBOARD_SENSOR_OPTIONS: KeyboardSensorOptions = {
  coordinateGetter: sortableKeyboardCoordinates,
};

/** Lời đọc cho trình đọc màn hình khi kéo dòng bằng bàn phím (thay câu tiếng Anh mặc định của dnd-kit). */
const TABLE_DND_ACCESSIBILITY: DndContextProps['accessibility'] = {
  screenReaderInstructions: {
    draggable:
      'Nhấn Space để nhấc dòng, phím mũi tên để dời, Space lần nữa để thả vào chỗ mới hoặc Esc để huỷ.',
  },
  announcements: {
    onDragStart: ({ active }) => `Đã nhấc dòng ${active.id}.`,
    onDragOver: ({ active, over }) =>
      over ? `Dòng ${active.id} đang ở vị trí dòng ${over.id}.` : `Dòng ${active.id} ở ngoài bảng.`,
    onDragEnd: ({ active, over }) =>
      over ? `Đã thả dòng ${active.id} vào vị trí dòng ${over.id}.` : `Đã thả dòng ${active.id}.`,
    onDragCancel: ({ active }) => `Đã huỷ kéo, dòng ${active.id} về chỗ cũ.`,
  },
};

/** `attributes` truyền vào `useSortable` của từng dòng: mô tả vai trò bằng tiếng Việt. */
export const TABLE_ROW_DRAG_ATTRIBUTES: UseDraggableArguments['attributes'] = {
  roleDescription: 'dòng kéo được',
};

/** Cấu hình dnd-kit của `<Table sortable>`: sensors (reference ổn định), id dòng kéo được, handler thả, a11y. */
export function useTableDnd<TData>({
  data,
  getRowKey,
  isRowDraggable,
  onReorder,
}: UseTableDndParams<TData>) {
  const sensors = useSensors(
    useSensor(PointerSensor, POINTER_SENSOR_OPTIONS),
    useSensor(KeyboardSensor, KEYBOARD_SENSOR_OPTIONS),
  );
  const sortableIds = useMemo(
    () =>
      data.reduce<UniqueIdentifier[]>((acc, row, index) => {
        if (!isRowDraggable || isRowDraggable(row, index)) acc.push(getRowKey(row, index));
        return acc;
      }, []),
    [data, isRowDraggable, getRowKey],
  );
  const handleDragEnd = useCallback(
    ({ active, over }: DragEndEvent) => {
      if (over && active.id !== over.id) onReorder?.(active.id, over.id);
    },
    [onReorder],
  );

  return { sensors, sortableIds, handleDragEnd, accessibility: TABLE_DND_ACCESSIBILITY };
}
