import { memo } from 'react';

import { useElementSize } from '@/shared/hooks';

import type { DemoViewport } from './responsive-lab.types';

interface ViewportFrameProps {
  viewport: DemoViewport;
  src: string;
  title: string;
}

/** Hai nét viền 1px của khung — trừ khỏi bề ngang chứa để khung không tràn. */
const FRAME_BORDER_PX = 2;

/**
 * ViewportFrame — `<iframe>` đúng cỡ viewport chọn (rộng × cao CSS px) rồi THU bằng `transform: scale` cho vừa
 * khung chứa, nên media query / biến thể bên trong đọc đúng cỡ đó chứ không phải cỡ cửa sổ thật.
 *
 * Chỉ mô phỏng KÍCH THƯỚC: `touch:` / `hover` vẫn đọc con trỏ thật của máy đang mở trang. Không phóng to quá
 * 1:1 (khung hẹp hơn viewport thì thu, rộng hơn thì giữ nguyên).
 *
 * @param props.viewport - Cỡ viewport cần dựng (CSS px).
 * @param props.src - Đường dẫn trang nạp vào khung (cùng gốc, có thể kèm `#hash`).
 * @param props.title - Tên trợ năng của khung.
 *
 * @example
 * <ViewportFrame src="/demo/ghep" title="Ghép thực tế ở 390 × 844" viewport={{ width: 390, height: 844 }} />
 */
const ViewportFrame = memo(function ViewportFrame({ viewport, src, title }: ViewportFrameProps) {
  const [boxRef, { width: boxWidth }] = useElementSize<HTMLDivElement>();
  const scale = boxWidth > 0 ? Math.min(1, (boxWidth - FRAME_BORDER_PX) / viewport.width) : 1;

  return (
    <div ref={boxRef} className="flex w-full justify-center overflow-hidden">
      <div
        className="box-content shrink-0 overflow-hidden border border-border-strong bg-bg-page"
        data-testid="viewport-frame"
        style={{ width: viewport.width * scale, height: viewport.height * scale }}
      >
        <iframe
          className="block border-0"
          src={src}
          style={{
            width: viewport.width,
            height: viewport.height,
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
          }}
          title={title}
        />
      </div>
    </div>
  );
});

export default ViewportFrame;
