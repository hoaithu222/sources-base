'use client';

import { memo, useRef } from 'react';
import { useTranslations } from 'next-intl';
import type { NodeApi } from 'react-arborist';
import Input from '@/shared/ui/inputs/Input';
import { SystemIcon } from '@/shared/ui/icons/Icons';
import Tree from '@/shared/ui/data-display/tree/Tree';
import type { TreeHandle, TreeNodeData } from '@/shared/ui/data-display/tree/tree.types';
import { useDebounce, useImeSafeSearchInput } from '@/shared/hooks';
import {
  FIELD_POPUP_SEARCH_ICON_CLASS,
  FIELD_POPUP_SEARCH_INPUT_CLASS,
} from '@/shared/ui/inputs/field.theme';
import {
  DROPDOWN_TREE_SELECT_HEADER_CLASSES,
  DROPDOWN_TREE_SELECT_ICON_BUTTON_CLASSES,
} from '../dropdown-tree-select.theme';

interface DropdownTreeSelectPanelProps {
  data: TreeNodeData[];
  treeHeight: number;
  searchable: boolean;
  search: string;
  onSearch: (value: string) => void;
  multi: boolean;
  selectedIds?: string[];
  renderNode: (node: NodeApi<TreeNodeData>) => React.ReactNode;
  expandDisabled?: boolean;
  openByDefault?: boolean;
  defaultOpenIds?: string[];
  searchDebounceMs?: number;
}

/**
 * DropdownTreeSelectPanel — thân panel của `DropdownTreeSelect`: ô tìm kiếm + nút mở / thu gọn tất cả + `Tree`.
 *
 * Phần con NỘI BỘ; dòng cây vẽ hoàn toàn bằng `renderNode` do DropdownTreeSelect truyền xuống.
 * Lưu ý: ô tìm kiếm là `<Input>` uncontrolled (`useImeSafeSearchInput`), KHÔNG dùng prop `debounce` của
 * Input — docs/rules/interaction/ime-safe-input.md; cây chỉ lọc sau `searchDebounceMs`.
 *
 * @param props.data - Cây dữ liệu `TreeNodeData[]`.
 * @param props.treeHeight - Cao vùng cây (px).
 * @param props.searchable - `true` → hiện ô tìm kiếm.
 * @param props.search - Từ khoá hiện tại (state ở component cha).
 * @param props.onSearch - Gọi khi từ khoá đổi (đã an toàn với bộ gõ IME).
 * @param props.multi - `true` → không tô dòng chọn của `Tree` (chế độ checkbox).
 * @param props.selectedIds - Id đang chọn, để `Tree` tô dòng ở chế độ `single`.
 * @param props.renderNode - Vẽ thân mỗi dòng (checkbox / icon / tên / trailing / dấu chọn).
 * @param props.expandDisabled - Cho mở / đóng node `disabled` (vẫn chặn chọn).
 * @param props.openByDefault - Mở toàn bộ node khi mount. Mặc định `false`.
 * @param props.defaultOpenIds - Id các node mở sẵn khi mount (vd chỉ node gốc đầu tiên).
 * @param props.searchDebounceMs - Độ trễ (ms) trước khi cây lọc theo từ khoá. Mặc định `300`.
 *
 * @example
 * <DropdownTreeSelectPanel data={tree} multi={false} renderNode={renderNode} search={q}
 *   searchable treeHeight={260} onSearch={setQ} />
 */
const DropdownTreeSelectPanel = memo(function DropdownTreeSelectPanel({
  data,
  treeHeight,
  searchable,
  search,
  onSearch,
  multi,
  selectedIds,
  renderNode,
  expandDisabled,
  openByDefault = false,
  defaultOpenIds,
  searchDebounceMs = 300,
}: DropdownTreeSelectPanelProps) {
  const t = useTranslations('ui.selects');
  const tCommon = useTranslations('ui.common');
  const treeRef = useRef<TreeHandle>(null);

  const { inputProps } = useImeSafeSearchInput(search, onSearch);
  const treeSearch = useDebounce(search, searchDebounceMs);

  return (
    <>
      <div className={DROPDOWN_TREE_SELECT_HEADER_CLASSES}>
        {searchable && (
          <Input
            {...inputProps}
            border="none"
            className={FIELD_POPUP_SEARCH_INPUT_CLASS}
            placeholder={t('shared.searchPlaceholder')}
            size="sm"
            startIcon={
              <SystemIcon
                className={FIELD_POPUP_SEARCH_ICON_CLASS}
                name="magnifying-glass-outline"
                size={14}
              />
            }
            wrapperClassName="h-auto flex-1 px-0"
          />
        )}
        <button
          aria-label={t('treeSelect.expandAll')}
          className={DROPDOWN_TREE_SELECT_ICON_BUTTON_CLASSES}
          title={t('treeSelect.expandAll')}
          type="button"
          onClick={() => treeRef.current?.expandAll()}
        >
          <SystemIcon name="angle-down-outline" size={12} />
        </button>
        <button
          aria-label={t('treeSelect.collapseAll')}
          className={DROPDOWN_TREE_SELECT_ICON_BUTTON_CLASSES}
          title={t('treeSelect.collapseAll')}
          type="button"
          onClick={() => treeRef.current?.collapseAll()}
        >
          <SystemIcon name="angle-up-outline" size={12} />
        </button>
      </div>

      <div className="px-2">
        <Tree
          ref={treeRef}
          data={data}
          defaultOpenIds={defaultOpenIds}
          emptyMessage={tCommon('noData')}
          expandAll={openByDefault}
          expandDisabled={expandDisabled}
          height={treeHeight}
          openByDefault={openByDefault}
          renderNode={renderNode}
          searchTerm={treeSearch || undefined}
          selectedIds={multi ? undefined : selectedIds}
          selectionMode="single"
        />
      </div>
    </>
  );
});

export default DropdownTreeSelectPanel;
