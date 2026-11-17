'use client';

import { useCallback, useEffect, useImperativeHandle, useMemo, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { Tree as ArboristTree } from 'react-arborist';
import type { NodeApi, TreeApi } from 'react-arborist';
import { cn } from '@/shared/utils/style/cn';
import { includesSearch } from '@/shared/utils/format/string.utils';
import { TreeRowConfigContext } from './tree.context';
import { TREE_CONTAINER_CLASSES } from './tree.theme';
import type { TreeNodeData, TreeProps, TreeRowRenderConfig } from './tree.types';
import { getStateView, hasNoSearchResult } from './tree.utils';
import TreeNodeRow from './parts/tree-node-row';
import TreeState from './parts/tree-state';
import { useTreeContainerHeight } from './hooks/useTreeContainerHeight';
import { useTreeSelection } from './hooks/useTreeSelection';
import { useTreeWheelInDialog } from './hooks/useTreeWheelInDialog';

type TreeBulkToggle = 'openAll' | 'closeAll';

/** Id node gốc ẩn mà arborist tự dựng — không bao giờ chuyển ra `onToggle`. */
const ARBORIST_ROOT_ID = '__REACT_ARBORIST_INTERNAL_ROOT__';

/**
 * Tree — cây thư mục / danh mục dựng trên `react-arborist`: ảo hoá, chọn đơn / nhiều, tìm kiếm.
 *
 * Ô chọn dạng cây trong popover thì dùng `DropdownTreeSelect` (đã bọc Tree + ô tìm + chip).
 * Điều khiển từ ngoài (mở / đóng hết, cuộn tới node, bỏ chọn từ chip) qua `ref` kiểu `TreeHandle`.
 * Sửa giao diện: class → `tree.theme.ts` · dòng (chevron, icon, click, tô chữ khớp tìm kiếm) →
 * `parts/tree-node-row.tsx` · vạch dẫn thụt lề / tô chữ khớp / trạng thái thay cây → `tree.utils.ts`
 * · chọn / lộ node → `hooks/useTreeSelection.ts` · chiều cao → `hooks/useTreeContainerHeight.ts`.
 * Lưu ý: multi — Ctrl / ⌘ + click chọn rời, Shift + click chọn dải (hành vi gốc của arborist), click thường
 * thay cả lựa chọn. Không có sẵn cascade-check cha ↔ con — cần thì tự dựng trong `renderNode`. Dòng cao
 * 30px trên mọi thiết bị kể cả iPad — đừng dựng lại nhánh 40px cho cảm ứng.
 * Lý do thiết kế: docs/notes/components/data-display.md (## Tree).
 *
 * @param props.data - Danh sách node gốc `TreeNodeData[]` (`id` duy nhất toàn cây, `name`, `children`,
 *   `icon`, `disabled`, field tuỳ ý cho `renderNode`).
 * @param props.height - Chiều cao: số (px) hoặc chuỗi CSS (vd `"100%"` → tự đo, cha phải có chiều cao xác
 *   định). Mặc định `400`.
 * @param props.width - Bề ngang (px hoặc chuỗi CSS). Mặc định `'100%'`.
 * @param props.rowHeight - Chiều cao một dòng (px). Mặc định `30`.
 * @param props.indent - Thụt lề mỗi cấp (px). Mặc định `28`.
 * @param props.selectionMode - `single` | `multi`. Mặc định `single`.
 * @param props.selectedIds - Id đang chọn (controlled); `single` chỉ đọc phần tử đầu.
 * @param props.revealSelected - `true` → mở cha và cuộn tới node đang chọn khi cây đã có chiều cao
 *   (dropdown / popover cây). Mặc định `false`.
 * @param props.onSelect - `(ids) => void` khi người dùng chọn; không bắn khi Tree tự đồng bộ `selectedIds`.
 * @param props.onToggle - `(id) => void` khi MỘT node đóng / mở (người dùng bấm, `ref.open` / `close` /
 *   `openParents` / `scrollTo`, `revealSelected`). Không bắn lúc dựng, cũng không bắn cho `expandAll` /
 *   `collapseAll` (prop hay ref).
 * @param props.selectedRowClassName - Class thay cho nền / chữ dòng đang chọn mặc định.
 * @param props.openByDefault - `true` → mọi node mở sẵn lúc dựng. Mặc định `false`.
 * @param props.defaultOpenIds - Id các node mở sẵn lúc dựng (chỉ đọc khi cây dựng lần đầu).
 * @param props.expandAll - `true` → mở hết khi dựng; đổi giá trị về sau thì mở / đóng cả cây theo.
 *   Mặc định `false`.
 * @param props.expandOnRowClick - `true` → bấm cả dòng cha cũng đóng / mở (kèm chọn); mặc định chỉ chevron và
 *   icon thư mục đóng / mở. Mặc định `false`.
 * @param props.expandDisabled - `true` → node `disabled` vẫn đóng / mở được (vẫn chặn chọn) — node cha "chỉ
 *   làm đường dẫn". Mặc định `false`.
 * @param props.searchTerm - Chuỗi lọc: node hiện nếu chính nó hoặc một hậu duệ khớp; phần tên khớp được tô
 *   `<mark>`. Bỏ trống ⇒ không lọc.
 * @param props.searchMatch - `(node, term) => boolean` thay cách khớp mặc định (chứa `name`, không phân biệt
 *   hoa / thường / dấu).
 * @param props.defaultLeafIcon - Tên `SystemIcon` cho node lá không có `icon` riêng. Bỏ trống ⇒ không icon.
 * @param props.defaultCollapsedIcon - Tên `SystemIcon` cho node cha đang đóng. Bỏ trống ⇒ ảnh thư mục màu.
 * @param props.defaultExpandedIcon - Tên `SystemIcon` cho node cha đang mở. Bỏ trống ⇒ ảnh thư mục màu.
 * @param props.renderNode - `(node) => ReactNode` thay TOÀN BỘ phần sau chevron (icon, tên, trailing).
 * @param props.renderTrailing - `(node) => ReactNode` cuối dòng (badge, số đếm); bị bỏ qua khi có
 *   `renderNode`.
 * @param props.loading - `true` → hiện trạng thái đang tải thay cho cây. Mặc định `false`.
 * @param props.loadingMessage - Chữ lúc đang tải. Mặc định theo ngôn ngữ (`ui.dataDisplay` → `tree.loading`).
 * @param props.emptyMessage - Chữ khi `data` rỗng. Mặc định theo ngôn ngữ (`ui.dataDisplay` → `tree.empty`).
 * @param props.searchEmptyMessage - Chữ khi `searchTerm` không khớp node nào.
 *   Mặc định theo ngôn ngữ (`ui.dataDisplay` → `tree.searchEmpty`).
 * @param props.className - Class của khung bọc ngoài.
 * @param props.disabled - `true` → mọi dòng mờ và không chọn được.
 * @param props.ref - Nhận `TreeHandle` (`expandAll` · `collapseAll` · `select` · `deselect` · `scrollTo`
 *   · `open` · `close` · `openParents`) — React 19: `ref` là prop thường.
 *
 * @example
 * <Tree data={nodes} selectedIds={ids} onSelect={setIds} height={320} />
 *
 * const treeRef = useRef<TreeHandle>(null);
 * <Tree ref={treeRef} data={nodes} height="100%" defaultOpenIds={['root']} />
 * treeRef.current?.expandAll();
 */
function Tree({
  data,
  height = 400,
  width = '100%',
  rowHeight = 30,
  indent = 28,
  selectionMode = 'single',
  selectedIds,
  revealSelected = false,
  onSelect,
  onToggle,
  selectedRowClassName,
  openByDefault = false,
  defaultOpenIds,
  expandAll = false,
  expandOnRowClick = false,
  searchTerm,
  searchMatch,
  defaultLeafIcon,
  defaultCollapsedIcon,
  defaultExpandedIcon,
  renderNode,
  renderTrailing,
  expandDisabled = false,
  loading = false,
  loadingMessage,
  emptyMessage,
  searchEmptyMessage,
  className,
  disabled,
  ref,
}: TreeProps) {
  const t = useTranslations('ui.dataDisplay');
  const treeRef = useRef<TreeApi<TreeNodeData> | null>(null);
  const bulkTogglingRef = useRef(false);
  const appliedExpandAllRef = useRef(expandAll);
  const { containerRef, arboristHeight } = useTreeContainerHeight(height);

  const noSearchResult = useMemo(
    () => hasNoSearchResult(data, searchTerm, searchMatch),
    [data, searchTerm, searchMatch],
  );
  const stateView = getStateView(loading, data, noSearchResult, {
    loading: loadingMessage ?? t('tree.loading'),
    empty: emptyMessage ?? t('tree.empty'),
    searchEmpty: searchEmptyMessage ?? t('tree.searchEmpty'),
  });
  const showArborist = stateView === null;

  const handleSelect = useTreeSelection({
    treeRef,
    data,
    selectionMode,
    selectedIds,
    revealSelected,
    arboristHeight,
    showArborist,
    onSelect,
  });
  useTreeWheelInDialog(containerRef);

  const runBulkToggle = useCallback((action: TreeBulkToggle) => {
    const api = treeRef.current;
    if (!api) return;
    bulkTogglingRef.current = true;
    try {
      api[action]();
    } finally {
      bulkTogglingRef.current = false;
    }
  }, []);

  const handleToggle = useCallback(
    (id: string) => {
      if (bulkTogglingRef.current || id === ARBORIST_ROOT_ID) return;
      onToggle?.(id);
    },
    [onToggle],
  );

  useEffect(() => {
    if (appliedExpandAllRef.current === expandAll) return;
    appliedExpandAllRef.current = expandAll;
    runBulkToggle(expandAll ? 'openAll' : 'closeAll');
  }, [expandAll, runBulkToggle]);

  useImperativeHandle(
    ref,
    () => ({
      expandAll: () => runBulkToggle('openAll'),
      collapseAll: () => runBulkToggle('closeAll'),
      select: (id: string) => treeRef.current?.select(id),
      deselect: (id: string) => treeRef.current?.get(id)?.deselect(),
      scrollTo: (id: string) => treeRef.current?.scrollTo(id),
      open: (id: string) => treeRef.current?.open(id),
      close: (id: string) => treeRef.current?.close(id),
      openParents: (id: string) => treeRef.current?.openParents(id),
    }),
    [runBulkToggle],
  );

  const matcher = useCallback(
    (node: NodeApi<TreeNodeData>) => {
      if (!searchTerm) return true;
      if (searchMatch) return searchMatch(node.data, searchTerm);
      return includesSearch(node.data.name, searchTerm);
    },
    [searchTerm, searchMatch],
  );

  const initialOpenState = useMemo(() => {
    if (!defaultOpenIds?.length) return undefined;
    return Object.fromEntries(defaultOpenIds.map((id) => [id, true]));
  }, [defaultOpenIds]);

  const treeProps = useMemo(
    () => ({
      data,
      openByDefault: expandAll || openByDefault,
      initialOpenState,
      height: arboristHeight,
      width,
      rowHeight,
      indent,
      searchTerm,
      searchMatch: searchTerm ? matcher : undefined,
      disableEdit: true,
      disableDrag: true,
      disableDrop: true,
      disableMultiSelection: selectionMode === 'single',
      selection: selectionMode === 'single' ? selectedIds?.[0] : undefined,
      onSelect: handleSelect,
      onToggle: handleToggle,
    }),
    [
      data,
      expandAll,
      openByDefault,
      initialOpenState,
      arboristHeight,
      width,
      rowHeight,
      indent,
      searchTerm,
      matcher,
      selectionMode,
      selectedIds,
      handleSelect,
      handleToggle,
    ],
  );

  const renderCtx = useMemo<TreeRowRenderConfig>(
    () => ({
      disabled,
      iconDefaults: {
        leaf: defaultLeafIcon,
        collapsed: defaultCollapsedIcon,
        expanded: defaultExpandedIcon,
      },
      renderNode,
      renderTrailing,
      expandOnRowClick,
      expandDisabled,
      searchTerm,
      selectedRowClassName,
    }),
    [
      disabled,
      defaultLeafIcon,
      defaultCollapsedIcon,
      defaultExpandedIcon,
      renderNode,
      renderTrailing,
      expandOnRowClick,
      expandDisabled,
      searchTerm,
      selectedRowClassName,
    ],
  );

  const handleKeyDownCapture = useCallback((e: React.KeyboardEvent) => {
    const target = e.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
      return;
    }
    if (e.key.length === 1 && e.key !== ' ' && !e.ctrlKey && !e.metaKey && !e.altKey) {
      e.stopPropagation();
    }
  }, []);

  const treeClassName = cn(TREE_CONTAINER_CLASSES, className);

  return (
    <div
      ref={containerRef}
      className={treeClassName}
      style={{ width, height }}
      onKeyDownCapture={handleKeyDownCapture}
    >
      {stateView ? (
        <TreeState {...stateView} />
      ) : (
        <TreeRowConfigContext.Provider value={renderCtx}>
          <ArboristTree<TreeNodeData> ref={treeRef} {...treeProps}>
            {TreeNodeRow}
          </ArboristTree>
        </TreeRowConfigContext.Provider>
      )}
    </div>
  );
}

export default Tree;
