import { useCallback, useRef, useState } from 'react';

interface UseColumnResizeParams {
  enabled: boolean;
  minWidth?: number;
}

export interface ColumnResizeApi {
  widths: Record<string, number>;
  onResizeStart: (key: string, startWidth: number, e: React.PointerEvent) => void;
  resizingKey: string | null;
}

/** Bề rộng layout CÓ phần lẻ: rect khi khớp `offsetWidth` (±1px, không bị transform co giãn), không thì `offsetWidth`. */
const layoutWidth = (el: HTMLElement) => {
  const rect = el.getBoundingClientRect().width;
  return Math.abs(rect - el.offsetWidth) < 1 ? rect : el.offsetWidth;
};

/**
 * useColumnResize — kéo giãn cột của `<Table>`: giữ bề rộng override theo key cột, nghe con trỏ ở `window`.
 *
 * Lưu ý: luôn nghe cả `pointercancel` (docs/notes/components/data-display-table.md, ## useColumnResize).
 * ⛔ Lúc bắt đầu kéo, CHỐT bề rộng ĐANG HIỂN THỊ của MỌI cột (không chỉ cột đang kéo) vào `widths` — số đo mới
 * thắng số cũ: `table-layout: fixed` CHIA phần dư của `<table>` cho mọi cột, thiếu bước chốt này kéo một cột làm
 * các cột khác co/giãn theo. Khi mọi cột đã chốt px, `Table` thêm cột ĐỆM cuối (`TABLE_FILLER_COLUMN`) hút phần
 * dư — thu hẹp một cột không làm cột khác giãn ra. Đọc qua `<thead>` bằng `data-col-key` (gồm cả ô `rowSpan` tầng
 * trên của header 2 tầng), lấy cả phần lẻ (`layoutWidth`) — làm tròn thì tổng lệch → hiện thanh cuộn ngang.
 * Chỉ nút chuột CHÍNH bắt đầu kéo (chuột phải mở menu, không kẹt trạng thái kéo).
 *
 * @param params.enabled - `false` ⇒ `onResizeStart` không làm gì.
 * @param params.minWidth - Bề rộng tối thiểu mỗi cột khi kéo (px). Mặc định `60`.
 * @returns `{ widths, onResizeStart, resizingKey }` — gắn `onResizeStart` vào `onPointerDown` của tay cầm.
 *
 * @example
 * const resize = useColumnResize({ enabled: resizable, minWidth: minColumnWidth });
 */
export function useColumnResize({
  enabled,
  minWidth = 60,
}: UseColumnResizeParams): ColumnResizeApi {
  const [widths, setWidths] = useState<Record<string, number>>({});
  const [resizingKey, setResizingKey] = useState<string | null>(null);
  const drag = useRef<{ key: string; startX: number; startWidth: number } | null>(null);

  const onResizeStart = useCallback(
    (key: string, startWidth: number, e: React.PointerEvent) => {
      if (!enabled || e.button !== 0) return;
      e.preventDefault();
      e.stopPropagation();

      const thead = (e.currentTarget as HTMLElement).closest('thead');
      const snapshot: Record<string, number> = {};
      thead?.querySelectorAll<HTMLElement>('th[data-col-key]').forEach((cell) => {
        const cellKey = cell.dataset.colKey;
        if (cellKey) snapshot[cellKey] = layoutWidth(cell);
      });

      drag.current = { key, startX: e.clientX, startWidth: snapshot[key] ?? startWidth };
      setResizingKey(key);
      setWidths((prev) => ({ ...prev, ...snapshot }));
      document.body.classList.add('splitter-resizing-x');

      const handleMove = (ev: PointerEvent) => {
        const d = drag.current;
        if (!d) return;
        const next = Math.max(minWidth, d.startWidth + (ev.clientX - d.startX));
        setWidths((prev) => ({ ...prev, [d.key]: next }));
      };
      const handleUp = () => {
        drag.current = null;
        setResizingKey(null);
        document.body.classList.remove('splitter-resizing-x');
        window.removeEventListener('pointermove', handleMove);
        window.removeEventListener('pointerup', handleUp);
        window.removeEventListener('pointercancel', handleUp);
      };
      window.addEventListener('pointermove', handleMove);
      window.addEventListener('pointerup', handleUp);
      window.addEventListener('pointercancel', handleUp);
    },
    [enabled, minWidth],
  );

  return { widths, onResizeStart, resizingKey };
}
