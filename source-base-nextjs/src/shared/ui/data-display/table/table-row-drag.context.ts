'use client';

import { createContext } from 'react';
import type { DraggableAttributes } from '@dnd-kit/core';
import type { SyntheticListenerMap } from '@dnd-kit/core/dist/hooks/utilities';

export interface RowDragCtx {
  attributes: DraggableAttributes | Record<string, never>;
  listeners: SyntheticListenerMap | undefined;
}

/** Cấp attributes + listeners của dòng sortable cho `<TableDragHandle>` nằm trong `cell`. */
export const RowDragContext = createContext<RowDragCtx | null>(null);
