'use client';

import { useContext } from 'react';
import type { NodeRendererProps } from 'react-arborist';
import { SystemIcon } from '@/shared/ui/icons/Icons';
import { cn } from '@/shared/utils/style/cn';
import { TreeRowConfigContext } from '../tree.context';
import {
  TREE_CHEVRON_CLASSES,
  TREE_CHEVRON_PLACEHOLDER_CLASSES,
  TREE_LABEL_CLASSES,
  TREE_LABEL_STATE_CLASSES,
  TREE_MATCH_CLASSES,
  TREE_ROW_BASE_CLASSES,
  TREE_ROW_STATE_CLASSES,
  TREE_TRAILING_CLASSES,
} from '../tree.theme';
import type { TreeNodeData } from '../tree.types';
import { splitTreeMatch, treeIndentGuideStyle } from '../tree.utils';
import TreeNodeIcon from './tree-node-icon';

/**
 * TreeNodeRow — một dòng của `Tree`: vạch dẫn thụt lề + chevron + icon + tên (tô chữ khớp tìm kiếm) + trailing,
 * hoặc toàn bộ `renderNode`.
 *
 * Phần con nội bộ: arborist gọi qua `<ArboristTree>{TreeNodeRow}</ArboristTree>`, cấu hình đọc từ
 * `TreeRowConfigContext` (`Tree` cấp). Nhận đúng props renderer của arborist.
 * Sửa giao diện: class → `tree.theme.ts` · icon → `tree-node-icon.tsx` · vạch dẫn / tô chữ khớp →
 * `tree.utils.ts`.
 * Lưu ý: phải đứng NGOÀI `Tree` và đọc cấu hình qua context — đổi identity thì arborist remount dòng giữa
 * pointerdown ↔ pointerup và nuốt `click`. Giữ bước lọc click từ PORTAL đứng TRƯỚC nhánh disabled
 * (docs/notes/components/data-display.md, ## Tree).
 *
 * @param props.node - Node arborist của dòng (trạng thái mở / chọn / focus, `toggle`, `handleClick`).
 * @param props.style - Style định vị do danh sách ảo hoá cấp (thụt lề theo cấp).
 *
 * @example
 * <ArboristTree<TreeNodeData> {...treeProps}>{TreeNodeRow}</ArboristTree>
 */
function TreeNodeRow({ node, style }: NodeRendererProps<TreeNodeData>) {
  const config = useContext(TreeRowConfigContext);
  if (!config) return null;
  const {
    disabled,
    expandDisabled,
    expandOnRowClick,
    iconDefaults,
    renderNode,
    renderTrailing,
    searchTerm,
    selectedRowClassName,
  } = config;

  const isParent = !node.isLeaf;
  const isSelected = node.isSelected;
  const isDisabled = node.data.disabled || disabled;
  const canExpand = !isDisabled || !!expandDisabled;
  const iconTogglesExpand = isParent && !expandOnRowClick && canExpand;

  const onRowClick = (event: React.MouseEvent) => {
    if (!event.currentTarget.contains(event.target as Node)) return;
    if (isDisabled) {
      if (isParent && expandOnRowClick && canExpand) node.toggle();
      event.stopPropagation();
      return;
    }
    if (isParent && expandOnRowClick) node.toggle();
    node.handleClick(event);
    event.stopPropagation();
  };

  const onExpandClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    if (canExpand) node.toggle();
  };

  const rowStyle = { ...style, ...treeIndentGuideStyle(node.level, node.tree.indent) };
  const rowClassName = cn(
    TREE_ROW_BASE_CLASSES,
    isSelected && (selectedRowClassName || TREE_ROW_STATE_CLASSES.selected),
    isDisabled && TREE_ROW_STATE_CLASSES.disabled,
  );
  const chevronClassName = cn(
    TREE_CHEVRON_CLASSES,
    canExpand && 'cursor-pointer',
    node.isOpen && 'rotate-90',
  );
  const labelClassName = cn(
    TREE_LABEL_CLASSES,
    TREE_LABEL_STATE_CLASSES[isSelected ? 'selected' : 'idle'],
  );

  return (
    <div className={rowClassName} style={rowStyle} onClick={onRowClick}>
      {isParent ? (
        <span className={chevronClassName} onClick={onExpandClick}>
          <SystemIcon name="angle-right-outline" size={12} />
        </span>
      ) : (
        <span aria-hidden className={TREE_CHEVRON_PLACEHOLDER_CLASSES} />
      )}

      {renderNode ? (
        renderNode(node)
      ) : (
        <>
          <TreeNodeIcon
            iconDefaults={iconDefaults}
            node={node}
            togglesExpand={iconTogglesExpand}
            onToggle={onExpandClick}
          />
          <span className={labelClassName}>
            {splitTreeMatch(node.data.name, searchTerm).map((segment, index) =>
              segment.hit ? (
                <mark key={index} className={TREE_MATCH_CLASSES}>
                  {segment.text}
                </mark>
              ) : (
                segment.text
              ),
            )}
          </span>
          {renderTrailing && <span className={TREE_TRAILING_CLASSES}>{renderTrailing(node)}</span>}
        </>
      )}
    </div>
  );
}

export default TreeNodeRow;
