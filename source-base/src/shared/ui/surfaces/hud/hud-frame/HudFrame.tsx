import { memo, type CSSProperties } from 'react';

import { cn } from '@/shared/utils/style/cn';
import HudFrameDecor from './hud-frame-decor';
import { HUD_FRAME_LOOK } from './hud-frame.theme';
import type { HudFrameProps } from './hud-frame.types';
import {
  buildClip,
  dotStyle,
  frameBackground,
  mixTone,
  scanlineBackground,
  topStripeStyle,
} from './hud-frame.utils';

const DOT_INSET_PX = 1;

const HUD_FRAME_ROOT_CLASSES = 'relative isolate h-full min-h-0 p-px';

const HUD_FRAME_GLOW_CLASSES = cn(
  'shadow-[0_1px_2px_var(--color-shadow-popup),0_6px_16px_-10px_var(--color-shadow-popup)]',
  'dark:[box-shadow:var(--hud-frame-glow)]',
);

const HUD_FRAME_BODY_CLASSES =
  'relative flex h-full min-h-0 flex-col overflow-hidden bg-bg-surface';

const HUD_FRAME_STRIPE_CLASSES = cn(
  'pointer-events-none absolute left-[6%] right-[34%] top-0 z-10 h-px',
  'dark:shadow-[0_0_8px_color-mix(in_srgb,var(--hud-frame-tone)_55%,transparent)]',
);

const HUD_FRAME_BRACKET_CLASSES =
  'pointer-events-none absolute z-20 dark:[filter:var(--hud-frame-bracket-glow)]';

const HUD_FRAME_DOT_CLASSES =
  'pointer-events-none absolute z-20 rounded-full dark:[box-shadow:var(--hud-frame-dot-glow)]';

/**
 * HudFrame — khung panel big-screen: viền gradient 1px, vát góc TL + BR, ngoặc [ ] ở TR + BL, quầng sáng.
 *
 * Chỉ là KHUNG: không header, không đệm thân (caller tự lo, giữ mật độ cao — visual-hierarchy.md).
 * Cần header + trạng thái tải / rỗng thì dùng `PanelCard`; hộp phẳng không hiệu ứng → `Surface`.
 * Root luôn `h-full min-h-0` để panel con cuộn được trong lưới flex.
 * Sửa giao diện: nét · quầng · ngoặc · chấm góc → `HUD_FRAME_LOOK[intensity][weight]` (hud-frame.theme.ts)
 * · chuỗi gradient / clip-path → hud-frame.utils.ts · vỏ của `prime` → hud-frame-decor.tsx.
 * Lưu ý: `prime` tốn 5 lớp vẽ mỗi khung — lưới 20+ card dùng `weight="hairline"`. KHÔNG lồng HudFrame
 * trong HudFrame khác (hai quầng sáng làm mất cạnh khung). Quầng (khung · ngoặc · chấm · vệt mép trên) CHỈ
 * hiện ở theme tối.
 *
 * @param props.tone - Họ màu của viền, ngoặc, quầng (`TitleIconColor`: `sky` | `azure` | `green` | …).
 *   Mặc định `sky`.
 * @param props.notch - `true` → vát góc TL + BR (`clip-path`); `false` → khung vuông. Mặc định `true`.
 * @param props.corners - `true` → vẽ ngoặc [ ] ở TR + BL và chấm khoá ở hai góc còn lại. Mặc định `true`.
 * @param props.glow - `true` → bóng quanh khung: theme tối là quầng theo tone, theme sáng là bóng đổ mềm
 *   (`shadow-popup`). Mặc định `true`.
 * @param props.intensity - Độ "kịch": `default` (nhẹ) | `cyber` (ngoặc dày, quầng xa, vệt sáng mép
 *   trên) | `prime` (thêm vỏ "thiết bị đo"). Mặc định `default`.
 * @param props.weight - Bề dày nét: `regular` | `hairline` (nét 1px, quầng ôm sát — cho lưới dày).
 *   Mặc định `regular`.
 * @param props.scanlines - `true` → phủ sọc ngang mờ lên nền thân. Mặc định `false`.
 * @param props.sweep - `true` → vệt sáng chạy vô hạn ở mép trên; CHỈ có tác dụng với `prime`, chỉ bật cho
 *   1–2 panel hero mỗi màn. Mặc định `false`.
 * @param props.ticks - `true` → thước chia ở mép trên; chỉ với `prime` × `regular` (khung mảnh bỏ thước). Mặc định `true`.
 * @param props.notchSize - Cạnh vát góc, px (cũng là vị trí chấm khoá góc khi `notch`). Mặc định `12`.
 * @param props.bodyClassName - Class thêm cho lớp thân (nền `bg-bg-surface`, `flex-col`, `overflow-hidden`).
 * @param props.bodyStyle - Style của lớp thân; dùng khi nền phải tính bằng `color-mix` (đè `bg-bg-surface`).
 * @param props.className - Class thêm cho khung ngoài.
 * @param props.children - Nội dung, nằm trên các lớp trang trí (`z-10`).
 *
 * @example
 * <HudFrame tone="azure" intensity="cyber" scanlines>
 *   <div className="p-2">…</div>
 * </HudFrame>
 *
 * <HudFrame intensity="prime" weight="hairline" notch={false}>…</HudFrame>
 */
const HudFrame = memo(function HudFrame({
  tone = 'sky',
  notch = true,
  corners = true,
  glow = true,
  intensity = 'default',
  weight = 'regular',
  scanlines = false,
  sweep = false,
  ticks = true,
  notchSize = 12,
  bodyClassName,
  bodyStyle,
  className,
  children,
}: HudFrameProps) {
  const look = HUD_FRAME_LOOK[intensity][weight];
  const { bracketGlowPx, dotPx } = look;
  const clip = buildClip(notchSize);
  const dotOffset = notch ? notchSize : DOT_INSET_PX;
  const toneColor = `var(--color-${tone}-5)`;
  const bracketBorder = `${look.bracketPx}px solid ${toneColor}`;

  const bracketGlow =
    bracketGlowPx === null ? 'none' : `drop-shadow(0 0 ${bracketGlowPx}px ${mixTone(tone, 70)})`;
  const dotGlow = dotPx === null ? 'none' : `0 0 ${dotPx}px ${toneColor}`;

  const rootStyle: CSSProperties = {
    clipPath: notch ? clip : undefined,
    background: frameBackground(tone, look.startPct, look.midPct),
    ['--hud-frame-tone' as string]: toneColor,
    ['--hud-frame-glow' as string]: look.shadow(tone),
    ['--hud-frame-bracket-glow' as string]: bracketGlow,
    ['--hud-frame-dot-glow' as string]: dotGlow,
  };

  return (
    <div
      className={cn(HUD_FRAME_ROOT_CLASSES, glow && HUD_FRAME_GLOW_CLASSES, className)}
      style={rootStyle}
    >
      <div
        className={cn(HUD_FRAME_BODY_CLASSES, bodyClassName)}
        style={notch ? { clipPath: clip, ...bodyStyle } : bodyStyle}
      >
        {scanlines && (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 z-0 opacity-40"
            style={{ background: scanlineBackground(tone) }}
          />
        )}
        {intensity === 'prime' && (
          <HudFrameDecor sweep={sweep} ticks={ticks && weight === 'regular'} tone={tone} />
        )}
        {intensity === 'cyber' && (
          <span aria-hidden className={HUD_FRAME_STRIPE_CLASSES} style={topStripeStyle(tone)} />
        )}
        <div className="relative z-10 flex h-full min-h-0 flex-col">{children}</div>
      </div>

      {corners && (
        <>
          <span
            aria-hidden
            className={cn(HUD_FRAME_BRACKET_CLASSES, 'right-0 top-0', look.bracket)}
            style={{ borderRight: bracketBorder, borderTop: bracketBorder }}
          />
          <span
            aria-hidden
            className={cn(HUD_FRAME_BRACKET_CLASSES, 'bottom-0 left-0', look.bracket)}
            style={{ borderBottom: bracketBorder, borderLeft: bracketBorder }}
          />
        </>
      )}

      {corners && dotPx !== null && (
        <>
          <span
            aria-hidden
            className={HUD_FRAME_DOT_CLASSES}
            style={dotStyle(dotPx, toneColor, { left: dotOffset, top: DOT_INSET_PX })}
          />
          <span
            aria-hidden
            className={HUD_FRAME_DOT_CLASSES}
            style={dotStyle(dotPx, toneColor, { right: DOT_INSET_PX, bottom: dotOffset })}
          />
        </>
      )}
    </div>
  );
});

export default HudFrame;
