'use client';

import type { DraggableAttributes } from '@dnd-kit/core';
import type { SyntheticListenerMap } from '@dnd-kit/core/dist/hooks/utilities';
import { createContext } from 'react';

/** Thuộc tính kéo-thả của dòng đang render: `SortableFieldArray.Item` cấp, `DragHandle` đọc. */
interface DragHandleCtx {
  attributes: DraggableAttributes | Record<string, never>;
  listeners: SyntheticListenerMap | undefined;
}

export const DragHandleContext = createContext<DragHandleCtx>({
  attributes: {},
  listeners: undefined,
});
