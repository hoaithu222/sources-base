'use client';

import { useCallback, useMemo } from 'react';
import { useTranslations } from 'next-intl';
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

/** `attributes` truyền vào `useSortable` của từng dòng: mô tả vai trò theo ngôn ngữ hiện tại. */
export function useTableRowDragAttributes(): UseDraggableArguments['attributes'] {
  const t = useTranslations('ui.dataDisplay');
  return useMemo(() => ({ roleDescription: t('table.dragRole') }), [t]);
}

/**
 * Cấu hình dnd-kit của `<Table sortable>`: sensors (reference ổn định), id dòng kéo được, handler thả, a11y
 * (lời đọc theo ngôn ngữ hiện tại).
 */
export function useTableDnd<TData>({
  data,
  getRowKey,
  isRowDraggable,
  onReorder,
}: UseTableDndParams<TData>) {
  const t = useTranslations('ui.dataDisplay');
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

  const accessibility = useMemo<DndContextProps['accessibility']>(
    () => ({
      screenReaderInstructions: { draggable: t('table.dnd.instructions') },
      announcements: {
        onDragStart: ({ active }) => t('table.dnd.start', { row: active.id }),
        onDragOver: ({ active, over }) =>
          over
            ? t('table.dnd.over', { row: active.id, target: over.id })
            : t('table.dnd.outside', { row: active.id }),
        onDragEnd: ({ active, over }) =>
          over
            ? t('table.dnd.end', { row: active.id, target: over.id })
            : t('table.dnd.dropped', { row: active.id }),
        onDragCancel: ({ active }) => t('table.dnd.cancel', { row: active.id }),
      },
    }),
    [t],
  );

  return { sensors, sortableIds, handleDragEnd, accessibility };
}
