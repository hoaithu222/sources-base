'use client';

import type { NodeApi } from 'react-arborist';
import { SystemIcon } from '@/shared/ui/icons/Icons';
import type { SystemIconName } from '@/shared/ui/icons/Icons';
import Image from '@/shared/ui/media/image/Image';
import { cn } from '@/shared/utils/style/cn';
import { TREE_FOLDER_ICON_CLASSES, TREE_ICON_CLASSES, TREE_ICON_TONE_CLASSES } from '../tree.theme';
import type { TreeIconDefaults, TreeIconTone, TreeNodeData } from '../tree.types';

interface TreeNodeIconProps {
  node: NodeApi<TreeNodeData>;
  iconDefaults: TreeIconDefaults;
  togglesExpand: boolean;
  onToggle: (event: React.MouseEvent) => void;
}

/** Ưu tiên: icon riêng → icon mặc định theo loại node (lá · cha đang mở · cha đang đóng). */
function resolveNodeIcon(
  node: NodeApi<TreeNodeData>,
  defaults: TreeIconDefaults,
): SystemIconName | undefined {
  if (node.data.icon) return node.data.icon;
  if (node.isLeaf) return defaults.leaf;
  return node.isOpen ? defaults.expanded : defaults.collapsed;
}

/** Màu icon: dòng đang chọn → xanh thương hiệu; còn lại theo loại (cha hổ phách như thư mục · lá trầm). */
function iconToneOf(node: NodeApi<TreeNodeData>): TreeIconTone {
  if (node.isSelected) return 'selected';
  return node.isLeaf ? 'leaf' : 'branch';
}

/**
 * TreeNodeIcon — ô icon trước tên node của `Tree`: icon riêng, icon mặc định theo loại, hoặc ảnh thư mục.
 *
 * Phần con nội bộ của `TreeNodeRow`. Không tìm được icon nào: node cha hiện ảnh `folder-fill`, node lá bỏ
 * trống ô icon.
 * Sửa giao diện: `TREE_ICON_CLASSES` · `TREE_FOLDER_ICON_CLASSES` · màu icon theo loại / dòng đang chọn →
 * `TREE_ICON_TONE_CLASSES` (`tree.theme.ts`).
 *
 * @param props.node - Node arborist đang vẽ.
 * @param props.iconDefaults - Icon mặc định `{ leaf, collapsed, expanded }` lấy từ props của `Tree`.
 * @param props.togglesExpand - `true` → bấm icon thì đóng / mở node.
 * @param props.onToggle - Handler đóng / mở; chỉ gắn khi `togglesExpand`.
 *
 * @example
 * <TreeNodeIcon iconDefaults={iconDefaults} node={node} togglesExpand onToggle={onExpandClick} />
 */
function TreeNodeIcon({ node, iconDefaults, togglesExpand, onToggle }: TreeNodeIconProps) {
  const onClick = togglesExpand ? onToggle : undefined;
  const icon = resolveNodeIcon(node, iconDefaults);

  if (!icon && !node.isLeaf) {
    return (
      <span
        className={cn(TREE_FOLDER_ICON_CLASSES, togglesExpand && 'cursor-pointer')}
        onClick={onClick}
      >
        <Image alt="" height={16} name="folder-fill" width={16} />
      </span>
    );
  }
  if (!icon) return null;

  const iconClassName = cn(
    TREE_ICON_CLASSES,
    TREE_ICON_TONE_CLASSES[iconToneOf(node)],
    togglesExpand && 'cursor-pointer',
  );

  return (
    <span className={iconClassName} onClick={onClick}>
      <SystemIcon name={icon} size={16} />
    </span>
  );
}

export default TreeNodeIcon;
