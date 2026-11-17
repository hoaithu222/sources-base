import { memo, useCallback, useMemo, useState } from 'react';
import * as PopoverPrimitive from '@radix-ui/react-popover';
import type { NodeApi } from 'react-arborist';
import Checkbox from '@/shared/ui/inputs/Checkbox';
import { fieldSurface } from '@/shared/ui/inputs/field.theme';
import { SystemIcon } from '@/shared/ui/icons/Icons';
import type { TreeNodeData } from '@/shared/ui/data-display/tree/tree.types';
import { cn } from '@/shared/utils/style/cn';
import { TEXT_ELLIPSIS_CLASSES } from '@/shared/ui/primitives/text-ellipsis.theme';
import DropdownTreeSelectValue from './parts/dropdown-tree-select-value';
import DropdownTreeSelectPanel from './parts/dropdown-tree-select-panel';
import {
  DROPDOWN_TREE_SELECT_CONTENT_CLASSES,
  DROPDOWN_TREE_SELECT_ICON_CLASSES,
  DROPDOWN_TREE_SELECT_SIZE_CLASSES,
  DROPDOWN_TREE_SELECT_TRAILING_CLASSES,
  DROPDOWN_TREE_SELECT_TRIGGER_BASE_CLASSES,
} from './dropdown-tree-select.theme';
import type { DropdownTreeSelectProps } from './dropdown-tree-select.types';
import {
  buildTreeIndex,
  getCheckState,
  getSelectedLabels,
  toggleSelection,
  type CheckState,
} from './dropdown-tree-select.utils';

function multiIconClassName(disabled: boolean, state: CheckState) {
  if (disabled) return DROPDOWN_TREE_SELECT_ICON_CLASSES.disabled;
  return state === 'unchecked'
    ? DROPDOWN_TREE_SELECT_ICON_CLASSES.idle
    : DROPDOWN_TREE_SELECT_ICON_CLASSES.active;
}

/**
 * DropdownTreeSelect — dropdown có panel là cây phân cấp `Tree` (tìm kiếm + mở / thu gọn tất cả);
 * chọn một node (`single`) hoặc nhiều node bằng checkbox (`multi`).
 *
 * Danh sách phẳng → `Dropdown` / `MultiSelect`. Giá trị luôn là MẢNG id node (`single` ⇒ tối đa 1);
 * controlled (`value` + `onChange`) hoặc uncontrolled (`defaultValue`).
 * Sửa giao diện: trigger / panel / thanh công cụ → `dropdown-tree-select.theme.ts` · ruột trigger →
 * `parts/dropdown-tree-select-value.tsx` · toán chọn (cascade, tri-state) → `dropdown-tree-select.utils.ts`.
 * Lý do thiết kế: docs/notes/components/selects.md (## DropdownTreeSelect).
 *
 * @param props.data - Cây dữ liệu `TreeNodeData[]` (`id` · `name` · `children` · `icon` · `disabled`).
 * @param props.mode - `single` (bấm node = chọn + đóng) | `multi` (checkbox + chip). Mặc định `single`.
 * @param props.value - Mảng id đang chọn (controlled).
 * @param props.defaultValue - Mảng id khởi tạo khi KHÔNG truyền `value` (uncontrolled). Mặc định `[]`.
 * @param props.size - Cao TỐI THIỂU của trigger: `sm` 32px | `md` 36px | `lg` 40px. Mặc định `md`.
 * @param props.placeholder - Chữ khi chưa chọn. Mặc định `'Chọn'`.
 * @param props.maxDisplay - Chỉ `multi`: số chip tối đa trên trigger, phần dư gộp "+N"; bỏ trống = hiện hết.
 * @param props.searchable - `true` → ô tìm kiếm đầu panel (khớp bỏ dấu trên `name`). Mặc định `true`.
 * @param props.searchDebounceMs - Độ trễ (ms) trước khi cây lọc theo từ khoá. Mặc định `300`.
 * @param props.clearable - `true` → ✕ "Xoá lựa chọn" trên trigger khi có lựa chọn (ẩn khi `disabled`).
 *   Mặc định `true`.
 * @param props.cascade - Chỉ `multi`: chọn cha kéo theo mọi con, checkbox cha 3 trạng thái. Mặc định `false`.
 * @param props.invalid - `true` → viền đỏ trên trigger. Mặc định `false`.
 * @param props.disabled - Khoá: không mở panel, ẩn mọi ✕.
 * @param props.treeHeight - Cao vùng cây trong panel (px). Mặc định `260`.
 * @param props.openByDefault - Mở toàn bộ node khi panel mở. Mặc định `false`.
 * @param props.openFirstByDefault - Chỉ mở sẵn node gốc ĐẦU TIÊN (bỏ qua khi `openByDefault`). Mặc định `false`.
 * @param props.expandDisabled - Cho mở / đóng node `disabled` (vẫn chặn chọn). Mặc định `false`.
 * @param props.renderTrailing - Nội dung căn phải mỗi dòng (số mục, badge…), nhận `NodeApi` của node.
 * @param props.side - Phía bung panel: `top` | `right` | `bottom` | `left`. Mặc định `bottom`.
 * @param props.align - Căn panel theo trigger: `start` | `center` | `end`. Mặc định `start`.
 * @param props.onChange - Gọi với mảng id mới; `single` bấm lại node đang chọn vẫn gọi.
 * @param props.className - Class thêm cho trigger.
 * @param props.contentClassName - Class thêm cho panel.
 *
 * @example
 * <DropdownTreeSelect data={FOLDERS} value={folderIds} onChange={setFolderIds} />
 *
 * <DropdownTreeSelect cascade data={DEPARTMENTS} mode="multi" maxDisplay={2}
 *   renderTrailing={(node) => node.children?.length} value={ids} onChange={setIds} />
 */
const DropdownTreeSelect = memo(function DropdownTreeSelect({
  data,
  mode = 'single',
  value,
  defaultValue,
  size = 'md',
  placeholder = 'Chọn',
  maxDisplay,
  searchable = true,
  searchDebounceMs = 300,
  clearable = true,
  cascade = false,
  invalid = false,
  disabled,
  treeHeight = 260,
  openByDefault = false,
  openFirstByDefault = false,
  expandDisabled = false,
  renderTrailing,
  side = 'bottom',
  align = 'start',
  onChange,
  className,
  contentClassName,
}: DropdownTreeSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [internal, setInternal] = useState<string[]>(defaultValue ?? []);

  const isControlled = value !== undefined;
  const selectedIds = isControlled ? value : internal;
  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);
  const index = useMemo(() => buildTreeIndex(data), [data]);
  const labels = useMemo(() => getSelectedLabels(data, selectedSet), [data, selectedSet]);
  const multi = mode === 'multi';

  const defaultOpenIds = useMemo(
    () => (openFirstByDefault && !openByDefault && data[0] ? [data[0].id] : undefined),
    [openFirstByDefault, openByDefault, data],
  );

  const commit = useCallback(
    (ids: string[]) => {
      if (!isControlled) setInternal(ids);
      onChange?.(ids);
    },
    [isControlled, onChange, setInternal],
  );

  const toggle = useCallback(
    (id: string, checked: boolean) => {
      commit(Array.from(toggleSelection(index, selectedSet, id, checked, cascade)));
    },
    [index, selectedSet, cascade, commit],
  );

  const selectSingle = useCallback(
    (node: NodeApi<TreeNodeData>) => {
      if (node.data.disabled) return;
      commit([node.id]);
      setOpen(false);
    },
    [commit, setOpen],
  );

  const clearAll = useCallback(
    (event: React.MouseEvent) => {
      event.stopPropagation();
      commit([]);
    },
    [commit],
  );

  const renderNode = useCallback(
    (node: NodeApi<TreeNodeData>) => {
      const trailing = renderTrailing && (
        <span className={DROPDOWN_TREE_SELECT_TRAILING_CLASSES}>{renderTrailing(node)}</span>
      );
      if (!multi) {
        const isSelected = selectedSet.has(node.id);
        return (
          <span
            className="flex items-center gap-2 flex-1 min-w-0 cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              selectSingle(node);
            }}
          >
            {node.data.icon && (
              <SystemIcon
                className={DROPDOWN_TREE_SELECT_ICON_CLASSES[isSelected ? 'active' : 'idle']}
                name={node.data.icon}
                size={14}
              />
            )}
            <span className={cn('flex-1', TEXT_ELLIPSIS_CLASSES)}>{node.data.name}</span>
            {trailing}
            {isSelected && (
              <SystemIcon
                className={DROPDOWN_TREE_SELECT_ICON_CLASSES.active}
                name="check-outline"
                size={12}
              />
            )}
          </span>
        );
      }
      const state = getCheckState(index, selectedSet, node.id, cascade);
      const disabledNode = !!node.data.disabled;
      return (
        <span className="flex items-center gap-2 flex-1 min-w-0">
          <Checkbox
            checked={state === 'indeterminate' ? 'indeterminate' : state === 'checked'}
            disabled={disabledNode}
            size="sm"
            onCheckedChange={(c) => toggle(node.id, c === true)}
            onPointerDown={(e) => e.stopPropagation()}
          />
          {node.data.icon && (
            <SystemIcon
              className={multiIconClassName(disabledNode, state)}
              name={node.data.icon}
              size={14}
            />
          )}
          <span
            className={cn('flex-1', TEXT_ELLIPSIS_CLASSES, !disabledNode && 'cursor-pointer')}
            onClick={
              disabledNode
                ? undefined
                : (e) => {
                    e.stopPropagation();
                    toggle(node.id, state !== 'checked');
                  }
            }
          >
            {node.data.name}
          </span>
          {trailing}
        </span>
      );
    },
    [multi, index, selectedSet, cascade, toggle, selectSingle, renderTrailing],
  );

  const triggerClassName = cn(
    DROPDOWN_TREE_SELECT_TRIGGER_BASE_CLASSES,
    DROPDOWN_TREE_SELECT_SIZE_CLASSES[size],
    fieldSurface({ focusMode: 'trigger', invalid, disabled }),
    className,
  );
  const panelClassName = cn(DROPDOWN_TREE_SELECT_CONTENT_CLASSES, contentClassName);

  return (
    <PopoverPrimitive.Root open={open} onOpenChange={setOpen}>
      <PopoverPrimitive.Trigger className={triggerClassName} disabled={disabled}>
        <DropdownTreeSelectValue
          clearable={clearable}
          disabled={disabled}
          labels={labels}
          maxDisplay={maxDisplay}
          multi={multi}
          placeholder={placeholder}
          onClear={clearAll}
          onRemove={(id) => toggle(id, false)}
        />
      </PopoverPrimitive.Trigger>

      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          align={align}
          className={panelClassName}
          collisionPadding={8}
          side={side}
          sideOffset={4}
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <DropdownTreeSelectPanel
            data={data}
            defaultOpenIds={defaultOpenIds}
            expandDisabled={expandDisabled}
            multi={multi}
            openByDefault={openByDefault}
            renderNode={renderNode}
            search={search}
            searchable={searchable}
            searchDebounceMs={searchDebounceMs}
            selectedIds={selectedIds}
            treeHeight={treeHeight}
            onSearch={setSearch}
          />
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
});

export default DropdownTreeSelect;
