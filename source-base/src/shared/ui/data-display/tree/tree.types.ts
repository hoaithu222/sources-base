import type { NodeApi } from 'react-arborist';
import type { SystemIconName } from '@/shared/ui/icons/Icons';

export interface TreeNodeData {
  id: string;
  name: string;
  children?: TreeNodeData[];
  icon?: SystemIconName;
  /** Làm mờ + chặn chọn; chặn luôn expand trừ khi bật `expandDisabled`. */
  disabled?: boolean;
  /** Field tuỳ ý (badge, count…) để dùng trong `renderNode` / `renderTrailing`. */
  [key: string]: unknown;
}

export interface TreeHandle {
  /** Mở / đóng cả cây một lượt; KHÔNG bắn `onToggle` cho từng node. */
  expandAll: () => void;
  collapseAll: () => void;
  select: (id: string) => void;
  /** Bỏ chọn từ NGOÀI cây (vd chip "x") phải đi qua đây — tự lọc `selectedIds` thì node vẫn tô sáng. */
  deselect: (id: string) => void;
  scrollTo: (id: string) => void;
  open: (id: string) => void;
  close: (id: string) => void;
  openParents: (id: string) => void;
}

export interface TreeProps {
  data: TreeNodeData[];

  height?: number | string;
  width?: number | string;
  rowHeight?: number;
  indent?: number;

  selectionMode?: 'single' | 'multi';
  selectedIds?: string[];
  revealSelected?: boolean;
  onSelect?: (ids: string[]) => void;
  onToggle?: (id: string) => void;
  selectedRowClassName?: string;

  openByDefault?: boolean;
  defaultOpenIds?: string[];
  expandAll?: boolean;
  expandOnRowClick?: boolean;
  expandDisabled?: boolean;

  searchTerm?: string;
  searchMatch?: (node: TreeNodeData, term: string) => boolean;

  defaultLeafIcon?: SystemIconName;
  defaultCollapsedIcon?: SystemIconName;
  defaultExpandedIcon?: SystemIconName;
  renderNode?: (node: NodeApi<TreeNodeData>) => React.ReactNode;
  renderTrailing?: (node: NodeApi<TreeNodeData>) => React.ReactNode;

  loading?: boolean;
  loadingMessage?: string;
  emptyMessage?: string;
  searchEmptyMessage?: string;

  className?: string;
  disabled?: boolean;
  ref?: React.Ref<TreeHandle>;
}

export type TreeRowState = 'selected' | 'disabled';

export type TreeLabelState = 'idle' | 'selected';

export type TreeIconTone = 'leaf' | 'branch' | 'selected';

export type TreeStateKind = 'loading' | 'empty' | 'search';

export interface TreeIconDefaults {
  leaf?: SystemIconName;
  collapsed?: SystemIconName;
  expanded?: SystemIconName;
}

export interface TreeRowRenderConfig extends Pick<
  TreeProps,
  | 'disabled'
  | 'expandDisabled'
  | 'expandOnRowClick'
  | 'renderNode'
  | 'renderTrailing'
  | 'searchTerm'
  | 'selectedRowClassName'
> {
  iconDefaults: TreeIconDefaults;
}
