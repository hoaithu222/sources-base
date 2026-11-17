import { memo, type CSSProperties } from 'react';

import { cn } from '@/shared/utils/style/cn';
import { mixTone } from './hud-frame.utils';

interface HudFrameDecorProps {
  tone: string;
  sweep?: boolean;
  ticks?: boolean;
}

const HUD_DECOR_GLOW_CLASSES = 'absolute inset-0 hidden dark:block';

const HUD_DECOR_SWEEP_CLASSES = cn(
  'h-full w-[28%] animate-hud-sweep will-change-transform',
  'dark:shadow-[0_0_8px_color-mix(in_srgb,var(--hud-frame-tone)_60%,transparent)]',
  'motion-reduce:animate-none motion-reduce:hidden',
);

const RAIL_PEG_PCTS = [40, 65, 90] as const;

const bevelStyle = (tone: string): CSSProperties => ({
  boxShadow: `inset 0 1px 0 ${mixTone(tone, 30)}, inset 0 -1px 0 var(--color-divider-soft)`,
});

const glowStyle = (tone: string): CSSProperties => ({
  background: `radial-gradient(120% 90% at 0% 0%, ${mixTone(tone, 14)} 0%, transparent 55%)`,
  boxShadow: `inset 0 -18px 24px -24px ${mixTone(tone, 55)}`,
});

const tickStyle = (tone: string): CSSProperties => ({
  backgroundImage: `repeating-linear-gradient(90deg, ${mixTone(tone, 55)} 0 1px, transparent 1px 6px)`,
  WebkitMaskImage: 'linear-gradient(to right, black 0, transparent 100%)',
  maskImage: 'linear-gradient(to right, black 0, transparent 100%)',
});

const sweepStyle = (tone: string): CSSProperties => ({
  background: `linear-gradient(90deg, transparent 0%, ${mixTone(tone, 85)} 50%, transparent 100%)`,
});

const railStyle = (tone: string): CSSProperties => ({
  background: `linear-gradient(to left, transparent 0%, ${mixTone(tone, 45)} 60%, transparent 100%)`,
});

/**
 * HudFrameDecor — vỏ "thiết bị đo" của `HudFrame intensity="prime"`; helper nội bộ, không qua barrel.
 *
 * KHÔNG import trực tiếp — bật qua `<HudFrame intensity="prime" sweep ticks>`.
 * Sửa giao diện: mỗi lớp (nẹp trong · quầng góc · thước chia · vệt quét · ray đáy) là một hàm
 * `…Style(tone)` phía trên.
 * Lưu ý: mọi lớp `aria-hidden` + `pointer-events-none` + `z-0` (dưới nội dung `z-10`) — không được
 * chắn cú bấm. Quầng (góc, đáy, vệt quét) CHỈ hiện ở theme tối và đọc `--hud-frame-tone` do HudFrame khai.
 *
 * @param props.tone - Họ màu (token bậc `-5`), cùng `tone` của HudFrame.
 * @param props.sweep - `true` → vệt sáng chạy vô hạn ở mép trên. Mặc định `false`.
 * @param props.ticks - `true` → thước chia ở mép trên. Mặc định `true`.
 *
 * @example
 * <HudFrameDecor tone="azure" sweep={false} ticks />
 */
const HudFrameDecor = memo(function HudFrameDecor({
  tone,
  sweep = false,
  ticks = true,
}: HudFrameDecorProps) {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 z-0">
      <div className="absolute inset-0" style={bevelStyle(tone)} />
      <div className={HUD_DECOR_GLOW_CLASSES} style={glowStyle(tone)} />
      {ticks && <div className="absolute left-12 top-0 h-1 w-1/3" style={tickStyle(tone)} />}
      {sweep && (
        <div className="absolute inset-x-0 top-0 h-px overflow-hidden">
          <div className={HUD_DECOR_SWEEP_CLASSES} style={sweepStyle(tone)} />
        </div>
      )}
      <div className="absolute inset-x-0 bottom-0 flex items-center gap-2">
        <div className="h-px flex-1" style={railStyle(tone)} />
        <div className="flex shrink-0 items-center gap-[2px] pr-1">
          {RAIL_PEG_PCTS.map((pct) => (
            <div key={pct} className="h-px w-2" style={{ background: mixTone(tone, pct) }} />
          ))}
        </div>
      </div>
    </div>
  );
});

export default HudFrameDecor;
