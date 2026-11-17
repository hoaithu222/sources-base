import { memo, useCallback, useState } from 'react';
import type { NodeApi } from 'react-arborist';

import { Badge, Checkbox, Input, Surface, Text, Tree } from '@/shared/ui';
import type { TreeNodeData } from '@/shared/ui';
import { SystemIcon } from '@/shared/ui/icons/Icons';
import { useImeSafeSearchInput } from '@/shared/hooks';

import DemoGrid from '../../components/shell/DemoGrid';
import DemoRow from '../../components/shell/DemoRow';
import DemoSection from '../../components/shell/DemoSection';
import { DEMO_TREE_DATA } from '../../constants/samples.constants';

/** `true` khi có ít nhất một hậu duệ đang chọn — checkbox của cha hiện dấu gạch. */
function hasSelectedDescendant(node: NodeApi<TreeNodeData>): boolean {
  return node.children?.some((child) => child.isSelected || hasSelectedDescendant(child)) ?? false;
}

/** Tên node theo `id` (duyệt sâu) — để in dòng "Đang chọn". */
function findNodeName(nodes: readonly TreeNodeData[], id: string | undefined): string | undefined {
  for (const node of nodes) {
    if (node.id === id) return node.name;
    const hit = node.children && findNodeName(node.children, id);
    if (hit) return hit;
  }
  return undefined;
}

/**
 * DataTreeSection — mục "Cây dữ liệu" của trang `/demo`: `Tree` ảo hoá, chọn đơn / nhiều, tìm kiếm, tuỳ biến node.
 */
const DataTreeSection = memo(function DataTreeSection() {
  const [singleSelected, setSingleSelected] = useState<string[]>(['p1-1-1']);
  const [multiSelected, setMultiSelected] = useState<string[]>([]);
  const [checkedIds, setCheckedIds] = useState<string[]>(['p1-1-2']);
  const [treeSearch, setTreeSearch] = useState('');
  const { inputProps: treeSearchProps } = useImeSafeSearchInput(treeSearch, setTreeSearch);

  const renderCount = useCallback(
    (node: NodeApi<TreeNodeData>) =>
      node.data.children?.length ? (
        <Badge color="neutral" variant="tinted">
          {node.data.children.length}
        </Badge>
      ) : null,
    [],
  );

  const renderCheckNode = useCallback((node: NodeApi<TreeNodeData>) => {
    const checked = node.isSelected || (hasSelectedDescendant(node) && 'indeterminate');
    return (
      <span className="flex min-w-0 flex-1 items-center gap-1.5">
        <Checkbox
          aria-label={`Chọn ${node.data.name}`}
          checked={checked}
          disabled={!!node.data.disabled}
          size="sm"
          onCheckedChange={() => (node.isSelected ? node.deselect() : node.selectMulti())}
          onClick={(event) => event.stopPropagation()}
          onPointerDown={(event) => event.stopPropagation()}
        />
        <SystemIcon
          className={node.isLeaf ? 'shrink-0 text-fg-muted' : 'shrink-0 text-action-accent'}
          name={node.data.icon ?? 'file-outline'}
          size={14}
        />
        <span
          className={
            node.isSelected ? 'truncate text-body-13-semibold' : 'truncate text-body-13-medium'
          }
        >
          {node.data.name}
        </span>
      </span>
    );
  }, []);

  const singleName = findNodeName(DEMO_TREE_DATA, singleSelected[0]);

  return (
    <DemoSection
      description="Tree — ảo hoá, chọn đơn/nhiều, tìm kiếm, override render node."
      importPath="@/shared/ui"
      title="Cây"
    >
      <DemoGrid min="md">
        <DemoRow
          label="Tree · chọn đơn + revealSelected + renderTrailing (đếm con)"
          note="Tab vào cây rồi ↑ ↓ ← → để thấy vòng focus"
          stacked
        >
          <Surface padding="sm">
            <Tree
              data={DEMO_TREE_DATA}
              height={210}
              renderTrailing={renderCount}
              revealSelected
              selectedIds={singleSelected}
              onSelect={setSingleSelected}
            />
          </Surface>
          <Text size="extraTiny" skin="muted">
            Đang chọn: {singleName ?? '—'}
          </Text>
        </DemoRow>

        <DemoRow
          label="Tree · selectionMode=multi"
          note="Ctrl / ⌘ + click chọn rời · Shift + click chọn dải"
          stacked
        >
          <Surface padding="sm">
            <Tree
              data={DEMO_TREE_DATA}
              expandAll
              height={210}
              selectedIds={multiSelected}
              selectionMode="multi"
              onSelect={setMultiSelected}
            />
          </Surface>
          <Text size="extraTiny" skin="muted">
            Đã chọn {multiSelected.length} mục · node <code className="font-mono">disabled</code>{' '}
            làm mờ dòng và chặn chọn.
          </Text>
        </DemoRow>

        <DemoRow
          label="Tree · searchTerm"
          note="lọc theo tên, giữ tổ tiên, tô chữ khớp — gõ không dấu vẫn ra"
          stacked
        >
          <Input
            {...treeSearchProps}
            clearable
            placeholder="Tìm trong cây… (vd: ban ve)"
            startIcon={<SystemIcon name="magnifying-glass-outline" size={14} />}
          />
          <Surface padding="sm">
            <Tree data={DEMO_TREE_DATA} height={180} searchTerm={treeSearch} />
          </Surface>
        </DemoRow>

        <DemoRow
          label='Tree · renderNode (checkbox 3 trạng thái) + height="100%"'
          note="renderNode thay cả thân dòng; cha có con được chọn hiện dấu gạch"
          stacked
        >
          <Surface className="h-56" padding="sm">
            <Tree
              data={DEMO_TREE_DATA}
              expandAll
              height="100%"
              renderNode={renderCheckNode}
              selectedIds={checkedIds}
              selectionMode="multi"
              onSelect={setCheckedIds}
            />
          </Surface>
        </DemoRow>
      </DemoGrid>
    </DemoSection>
  );
});

export default DataTreeSection;
