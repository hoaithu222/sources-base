import { cn } from '@/shared/utils/style/cn';

/**
 * progress-center.theme.ts — chỗ đứng của rail thẻ tiến trình (góc dưới phải màn hình).
 *
 * Dùng:   <div className={PROGRESS_CENTER_RAIL_CLASSES}>…thẻ…</div>
 * Lưu ý:  rail neo MỘT lần cho cả góc, thẻ con xếp bằng `flex-col` + `gap` — đừng cho thẻ tự neo
 *         `fixed`. Lề 1rem cộng thêm vùng an toàn (`--safe-b` / `--safe-r`) để không lọt dưới tai thỏ /
 *         thanh home. Lý do `z-1000` · `pointer-events`: docs/notes/code/widgets.md. Điện thoại (`phone:`): neo trên thanh
 *         tab đáy (`--tab-bar-reach` của `tab-bar.css`), sát lề 8px.
 */

export const PROGRESS_CENTER_RAIL_CLASSES = cn(
  'pointer-events-none fixed z-1000 flex w-96 max-w-[calc(100vw-2rem)] flex-col gap-2 *:pointer-events-auto',
  'bottom-[calc(1rem+var(--safe-b,0px))] right-[calc(1rem+var(--safe-r,0px))]',
  'phone:bottom-[calc(var(--tab-bar-reach)+var(--safe-b,0px)+0.5rem)] phone:right-[calc(0.5rem+var(--safe-r,0px))] phone:max-w-[calc(100vw-1rem)]',
);
