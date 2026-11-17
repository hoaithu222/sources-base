import { useId } from 'react';
import {
  SEGMENT_TOGGLE_WAVE_PATH,
  SEGMENT_TOGGLE_WAVE_STOP_CLASSES,
  SEGMENT_TOGGLE_WAVE_SVG_CLASSES,
} from '../segment-toggle-glide.theme';

/**
 * SegmentToggleWave — dải sóng của variant `wave`: vạch nền võng thành đường cong mềm dưới đoạn đang chọn; chỉ
 * SegmentToggle dùng, đặt TRONG mặt trượt (nên trượt + co giãn theo đoạn đang chọn).
 *
 * Màu dốc: hai đầu = `--sw-track` (nối liền hai cánh vạch nền của mặt trượt), giữa = `--sw-color` (màu nhấn).
 * Sửa hình: `SEGMENT_TOGGLE_WAVE_PATH` · màu / cỡ: `SEGMENT_TOGGLE_WAVE_*` ở `segment-toggle-glide.theme.ts`.
 * Lưu ý: SVG `preserveAspectRatio="none"` chỉ giãn NGANG (cao đúng 10px = viewBox) → nét dày đúng px ở mọi bề ngang.
 *
 * @example
 * <span ref={glideRef} className={glideClassName}>
 *   <SegmentToggleWave />
 * </span>
 */
function SegmentToggleWave() {
  const gradientId = `seg-wave-${useId().replace(/[^\w-]/g, '')}`;

  return (
    <svg
      aria-hidden
      className={SEGMENT_TOGGLE_WAVE_SVG_CLASSES}
      focusable="false"
      preserveAspectRatio="none"
      viewBox="0 0 100 10"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" x2="1" y1="0" y2="0">
          <stop className={SEGMENT_TOGGLE_WAVE_STOP_CLASSES.edge} offset="0" />
          <stop className={SEGMENT_TOGGLE_WAVE_STOP_CLASSES.ink} offset="0.26" />
          <stop className={SEGMENT_TOGGLE_WAVE_STOP_CLASSES.ink} offset="0.74" />
          <stop className={SEGMENT_TOGGLE_WAVE_STOP_CLASSES.edge} offset="1" />
        </linearGradient>
      </defs>
      <path d={SEGMENT_TOGGLE_WAVE_PATH} fill={`url(#${gradientId})`} />
    </svg>
  );
}

export default SegmentToggleWave;
