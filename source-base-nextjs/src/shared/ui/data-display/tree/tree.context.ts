'use client';

import { createContext } from 'react';
import type { TreeRowRenderConfig } from './tree.types';

export const TreeRowConfigContext = createContext<TreeRowRenderConfig | null>(null);
