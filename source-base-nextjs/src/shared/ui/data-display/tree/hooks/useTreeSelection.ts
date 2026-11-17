'use client';

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import type { RefObject } from 'react';
import type { NodeApi, TreeApi } from 'react-arborist';
import type { TreeNodeData, TreeProps } from '../tree.types';

interface UseTreeSelectionOptions {
  treeRef: RefObject<TreeApi<TreeNodeData> | null>;
  data: TreeNodeData[];
  selectionMode: NonNullable<TreeProps['selectionMode']>;
  selectedIds: TreeProps['selectedIds'];
  revealSelected: boolean;
  arboristHeight: number;
  showArborist: boolean;
  onSelect: TreeProps['onSelect'];
}

/**
 * useTreeSelection — đồng bộ selection ngoài ↔ arborist + lộ node đang chọn; trả `onSelect` nối vào arborist.
 *
 * Lưu ý: giữ thứ tự effect khoá → reveal → seed → mở khoá; `single` cũng ghi `setSelection` theo id vì prop
 * `selection` của arborist bỏ qua node nằm trong nhánh đóng (docs/notes/components/data-display.md, ## Tree).
 */
export function useTreeSelection({
  treeRef,
  data,
  selectionMode,
  selectedIds,
  revealSelected,
  arboristHeight,
  showArborist,
  onSelect,
}: UseTreeSelectionOptions) {
  const isSyncingSelectionRef = useRef(true);

  useLayoutEffect(() => {
    if (showArborist) isSyncingSelectionRef.current = true;
  }, [showArborist]);

  const revealIds = useMemo(() => selectedIds ?? [], [selectedIds]);
  const revealKey = revealIds.join(',');
  useEffect(() => {
    if (!revealSelected || revealIds.length === 0 || arboristHeight <= 0) return;
    const raf = requestAnimationFrame(() => {
      revealIds.forEach((id) => treeRef.current?.openParents(id));
      void treeRef.current?.scrollTo(revealIds[0]);
    });
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `revealKey` đại diện nội dung `revealIds`; thêm `revealIds` sẽ chạy lại mỗi render do đổi reference mảng.
  }, [revealSelected, revealKey, arboristHeight, data]);

  useEffect(() => {
    const api = treeRef.current;
    if (!api) return;
    const next = selectionMode === 'single' ? (selectedIds ?? []).slice(0, 1) : (selectedIds ?? []);
    const current = api.selectedIds;
    const same = next.length === current.size && next.every((id) => current.has(id));
    if (same) return;
    const last = next[next.length - 1] ?? null;
    isSyncingSelectionRef.current = true;
    api.setSelection({ ids: next, anchor: last, mostRecent: last });
    isSyncingSelectionRef.current = false;
    // eslint-disable-next-line react-hooks/exhaustive-deps -- so sánh giá trị trong effect mới là chốt chặn vòng lặp; `data` để re-check sau khi cây lazy tải thêm node.
  }, [selectionMode, revealKey, data]);

  useEffect(() => {
    isSyncingSelectionRef.current = false;
  }, [showArborist]);

  return useCallback(
    (nodes: NodeApi<TreeNodeData>[]) => {
      if (isSyncingSelectionRef.current) return;
      onSelect?.(nodes.map((node) => node.id));
    },
    [onSelect],
  );
}
