import type { TreeNodeData } from '@/shared/ui/data-display/tree/tree.types';

/**
 * dropdown-tree-select.utils — chỉ mục phẳng của cây + toán chọn (không React).
 *
 * Dùng:   const next = toggleSelection(buildTreeIndex(data), new Set(ids), 'id', true, cascade);
 * Lưu ý:  `cascade` bật thì chọn cha kéo theo mọi con, và cha chỉ tick khi MỌI con đã tick.
 */

interface TreeIndex {
  nodeById: Map<string, TreeNodeData>;
  parentById: Map<string, string | null>;
  childIds: Map<string, string[]>;
}

export type CheckState = 'checked' | 'indeterminate' | 'unchecked';

export interface SelectedLabel {
  id: string;
  label: string;
}

export function buildTreeIndex(data: TreeNodeData[]): TreeIndex {
  const nodeById = new Map<string, TreeNodeData>();
  const parentById = new Map<string, string | null>();
  const childIds = new Map<string, string[]>();

  const walk = (nodes: TreeNodeData[], parent: string | null): void => {
    for (const node of nodes) {
      nodeById.set(node.id, node);
      parentById.set(node.id, parent);
      const kids = node.children ?? [];
      childIds.set(
        node.id,
        kids.map((kid) => kid.id),
      );
      if (kids.length) walk(kids, node.id);
    }
  };

  walk(data, null);
  return { nodeById, parentById, childIds };
}

function getDescendantIds(index: TreeIndex, id: string): string[] {
  const out: string[] = [];
  const stack = [...(index.childIds.get(id) ?? [])];
  while (stack.length) {
    const cur = stack.pop() as string;
    out.push(cur);
    const kids = index.childIds.get(cur);
    if (kids?.length) stack.push(...kids);
  }
  return out;
}

/** Trạng thái checkbox của node; chỉ có `'indeterminate'` khi `cascade` bật. */
export function getCheckState(
  index: TreeIndex,
  selected: Set<string>,
  id: string,
  cascade: boolean,
): CheckState {
  if (selected.has(id)) return 'checked';
  if (!cascade) return 'unchecked';
  const hasCheckedDescendant = getDescendantIds(index, id).some((d) => selected.has(d));
  return hasCheckedDescendant ? 'indeterminate' : 'unchecked';
}

/** Bật/tắt `id` và trả tập mới; với `cascade` còn kéo theo con cháu rồi cập nhật tổ tiên. */
export function toggleSelection(
  index: TreeIndex,
  selected: Set<string>,
  id: string,
  checked: boolean,
  cascade: boolean,
): Set<string> {
  const next = new Set(selected);

  if (!cascade) {
    if (checked) next.add(id);
    else next.delete(id);
    return next;
  }

  for (const target of [id, ...getDescendantIds(index, id)]) {
    if (checked) next.add(target);
    else next.delete(target);
  }

  let parent = index.parentById.get(id) ?? null;
  while (parent) {
    const kids = index.childIds.get(parent) ?? [];
    const allChecked = kids.length > 0 && kids.every((kid) => next.has(kid));
    if (allChecked) next.add(parent);
    else next.delete(parent);
    parent = index.parentById.get(parent) ?? null;
  }

  return next;
}

export function getSelectedLabels(data: TreeNodeData[], selected: Set<string>): SelectedLabel[] {
  const out: SelectedLabel[] = [];
  const walk = (nodes: TreeNodeData[]): void => {
    for (const node of nodes) {
      if (selected.has(node.id)) out.push({ id: node.id, label: node.name });
      if (node.children?.length) walk(node.children);
    }
  };
  walk(data);
  return out;
}
