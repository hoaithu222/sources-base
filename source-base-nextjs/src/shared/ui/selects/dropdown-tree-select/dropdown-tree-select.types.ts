import type { NodeApi } from 'react-arborist';
import type { TreeNodeData } from '@/shared/ui/data-display/tree/tree.types';
import type { FieldSize } from '@/shared/ui/inputs/field.theme';

export type DropdownTreeSelectSize = FieldSize;
export type DropdownTreeSelectMode = 'single' | 'multi';

export interface DropdownTreeSelectProps {
  data: TreeNodeData[];
  mode?: DropdownTreeSelectMode;
  value?: string[];
  defaultValue?: string[];
  size?: DropdownTreeSelectSize;
  placeholder?: string;
  maxDisplay?: number;
  searchable?: boolean;
  searchDebounceMs?: number;
  clearable?: boolean;
  cascade?: boolean;
  invalid?: boolean;
  disabled?: boolean;
  treeHeight?: number;
  openByDefault?: boolean;
  openFirstByDefault?: boolean;
  expandDisabled?: boolean;
  renderTrailing?: (node: NodeApi<TreeNodeData>) => React.ReactNode;
  side?: 'top' | 'right' | 'bottom' | 'left';
  align?: 'start' | 'center' | 'end';
  onChange?: (ids: string[]) => void;
  className?: string;
  contentClassName?: string;
}
