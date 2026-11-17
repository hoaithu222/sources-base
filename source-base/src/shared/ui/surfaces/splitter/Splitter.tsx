import { memo } from 'react';
import { cn } from '@/shared/utils/style/cn';
import { SystemIcon } from '@/shared/ui/icons/Icons';
import {
  SPLITTER_HANDLE_STATE_CLASSES,
  SPLITTER_ORIENTATION_CLASSES,
  SPLITTER_SLOT_CLASSES,
} from './splitter.theme';
import type { SplitterOrientation } from './splitter.types';
import { getPaneStyles } from './splitter.utils';
import { useSplitterDrag } from './useSplitterDrag';

export interface SplitterProps {
  children: [React.ReactNode, React.ReactNode];
  initialSize?: number | string;
  minSize?: number | string;
  maxSize?: number | string;
  orientation?: SplitterOrientation;
  sizedSide?: 'first' | 'second';
  onResize?: (size: number) => void;
  deferResize?: boolean;
  collapsed?: boolean;
  collapsedSide?: 'first' | 'second';
  collapseMode?: 'offscreen' | 'shrink';
  className?: string;
}

/**
 * Splitter — chia đôi khung thành hai pane, kéo tay nắm ở giữa để đổi kích thước (ngang hoặc dọc).
 *
 * Truyền ĐÚNG hai con: con thứ nhất / thứ hai là hai pane. Một pane chốt kích thước (`sizedSide`),
 * pane kia `flex-1` nuốt phần dôi. Tay nắm nhận cả phím: ←/→ (hoặc ↑/↓ khi `vertical`) đổi 10px,
 * giữ Shift đổi 50px.
 * Sửa giao diện: class → `splitter.theme.ts` · style pane → `splitter.utils.ts` · logic kéo / phím →
 * `useSplitterDrag.ts`.
 * Lưu ý: kéo bằng POINTER events, không phải mouse — Safari iPad không giả lập chuột cho thao tác kéo.
 * Pane chứa canvas WebGL dùng `collapseMode="offscreen"`: co về 0 sinh lỗi framebuffer.
 * Mount trong khung chưa có kích thước (tab ẩn) thì tự đo lại khi khung hiện ra.
 *
 * @param props.children - Đúng hai phần tử: `[paneThứNhất, paneThứHai]`.
 * @param props.initialSize - Cỡ ban đầu của pane chốt: số = px, chuỗi = `"40%"` / `"320px"`. Mặc định `"40%"`.
 * @param props.minSize - Cận dưới của pane chốt, cùng dạng `initialSize`. Mặc định không giới hạn.
 * @param props.maxSize - Cận trên của pane chốt, cùng dạng `initialSize`. Mặc định không giới hạn.
 * @param props.orientation - `horizontal` (hai pane trái / phải) | `vertical` (trên / dưới).
 *   Mặc định `horizontal`.
 * @param props.sizedSide - Pane chốt kích thước: `first` | `second`; dùng `second` khi pane thứ nhất là
 *   nội dung chính cần giãn (vd cột giữa của `[cây | bảng | chi tiết]`). Mặc định `first`.
 * @param props.onResize - Gọi với cỡ mới (px) của pane chốt: mỗi nhịp kéo, mỗi lần bấm phím, hoặc chỉ
 *   khi thả nếu `deferResize`.
 * @param props.deferResize - `true` → lúc kéo chỉ vẽ đường xem trước, pane đổi cỡ khi THẢ — cho pane
 *   nặng (canvas WebGL, iframe). Mặc định `false`.
 * @param props.collapsed - `true` → ẩn một pane (`collapsedSide`) và tay nắm. Mặc định `false`.
 * @param props.collapsedSide - Pane bị ẩn khi `collapsed`: `first` | `second`. Mặc định `first`.
 * @param props.collapseMode - Cách ẩn: `offscreen` (đẩy ra ngoài màn, GIỮ kích thước) | `shrink` (co về 0,
 *   có chuyển động). Mặc định `offscreen`.
 * @param props.className - Class thêm cho khung ngoài (luôn `h-full w-full`).
 *
 * @example
 * <Splitter initialSize={320} minSize={200} maxSize="60%">
 *   <TreePanel />
 *   <DetailPanel />
 * </Splitter>
 *
 * <Splitter orientation="vertical" collapsed={!showLog} collapsedSide="second" collapseMode="shrink">
 *   <Viewer />
 *   <LogPanel />
 * </Splitter>
 */
const Splitter = memo(function Splitter({
  children,
  initialSize = '40%',
  minSize,
  maxSize,
  orientation = 'horizontal',
  onResize,
  deferResize = false,
  collapsed = false,
  collapsedSide = 'first',
  sizedSide = 'first',
  collapseMode = 'offscreen',
  className,
}: SplitterProps) {
  const { containerRef, dragging, handleKeyDown, handlePointerDown, previewSize, size, total } =
    useSplitterDrag({
      deferResize,
      initialSize,
      maxSize,
      minSize,
      onResize,
      orientation,
      sizedSide,
    });

  const paneStyles = getPaneStyles({
    collapsed,
    collapsedSide,
    collapseMode,
    initialSize,
    orientation,
    size,
    sizedSide,
  });
  const valueNow = size != null && total > 0 ? Math.round((size / total) * 100) : undefined;
  const paneTransitionClassName =
    collapseMode === 'shrink' && !dragging && 'transition-[width,height] duration-300 ease-in-out';

  const orientationClasses = SPLITTER_ORIENTATION_CLASSES[orientation];
  const rootClassName = cn(SPLITTER_SLOT_CLASSES.root, orientationClasses.root, className);
  const firstPaneClassName = cn(SPLITTER_SLOT_CLASSES.paneFirst, paneTransitionClassName);
  const secondPaneClassName = cn(SPLITTER_SLOT_CLASSES.paneSecond, paneTransitionClassName);
  const handleClassName = cn(
    SPLITTER_SLOT_CLASSES.handle,
    orientationClasses.handle,
    SPLITTER_HANDLE_STATE_CLASSES[dragging ? 'dragging' : 'idle'],
  );
  const ghostClassName = cn(SPLITTER_SLOT_CLASSES.ghost, orientationClasses.ghost);

  return (
    <div ref={containerRef} className={rootClassName} data-orientation={orientation}>
      <div className={firstPaneClassName} style={paneStyles.first}>
        {children[0]}
      </div>

      {!collapsed && (
        <div
          aria-label="Đổi kích thước khung"
          aria-orientation={orientation === 'horizontal' ? 'vertical' : 'horizontal'}
          aria-valuemax={100}
          aria-valuemin={0}
          aria-valuenow={valueNow}
          className={handleClassName}
          role="separator"
          tabIndex={0}
          onKeyDown={handleKeyDown}
          onPointerDown={handlePointerDown}
        >
          <span className={SPLITTER_SLOT_CLASSES.handleGrip}>
            <SystemIcon
              name={
                orientation === 'horizontal' ? 'grip-dots-vertical-outline' : 'ellipsis-outline'
              }
              size={12}
            />
          </span>
        </div>
      )}

      <div className={secondPaneClassName} style={paneStyles.second}>
        {children[1]}
      </div>

      {deferResize && dragging && previewSize != null && (
        <div
          aria-hidden
          className={ghostClassName}
          style={
            orientation === 'horizontal'
              ? { left: `${previewSize}px` }
              : { top: `${previewSize}px` }
          }
        />
      )}
    </div>
  );
});

export default Splitter;
