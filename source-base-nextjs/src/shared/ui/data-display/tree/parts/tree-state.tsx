import EmptyState from '@/shared/ui/feedback/EmptyState';
import Spinner from '@/shared/ui/feedback/Spinner';
import type { BoldSystemIconName } from '@/shared/ui/icons/Icons';
import Text from '@/shared/ui/primitives/Text';
import { TREE_STATE_CLASSES } from '../tree.theme';
import type { TreeStateKind } from '../tree.types';

interface TreeStateProps {
  kind: TreeStateKind;
  message: string;
}

const TREE_STATE_ICONS = {
  empty: 'folder-bold',
  search: 'magnifying-glass-bold',
} satisfies Record<Exclude<TreeStateKind, 'loading'>, BoldSystemIconName>;

/**
 * TreeState — khung thay cho cây khi đang tải (spinner) · cây rỗng · tìm không ra (`EmptyState` của UI kit).
 *
 * Phần con nội bộ của `Tree` (`getStateView` trong `tree.utils.ts` chọn `kind` + `message`).
 * Sửa giao diện: khung đang tải → `TREE_STATE_CLASSES` (`tree.theme.ts`) · icon rỗng / tìm không ra →
 * `TREE_STATE_ICONS`.
 *
 * @param props.kind - `loading` (spinner) | `empty` (icon thư mục — cây rỗng) | `search` (icon kính lúp —
 *   `searchTerm` không khớp node nào).
 * @param props.message - Chữ hiện dưới hình.
 *
 * @example
 * <TreeState kind="empty" message="Không tìm thấy thư mục" />
 */
function TreeState({ kind, message }: TreeStateProps) {
  if (kind === 'loading') {
    return (
      <div className={TREE_STATE_CLASSES}>
        <Spinner label={message} />
        <Text aria-hidden className="text-center" size="tiny" skin="muted">
          {message}
        </Text>
      </div>
    );
  }

  return (
    <EmptyState
      className="h-full"
      icon={TREE_STATE_ICONS[kind]}
      title={message}
      titleClassName="text-body-14-medium text-fg-muted"
    />
  );
}

export default TreeState;
