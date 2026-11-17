import { memo, type CSSProperties } from 'react';

export type HudCornerVariant = 'bracket' | 'dot' | 'chamfer' | 'none';

export interface HudCornersProps {
  variant?: HudCornerVariant;
  size?: number;
  thickness?: number;
  frame?: boolean;
  frameWidth?: number;
  inset?: number;
  radius?: number;
  glow?: boolean;
}

const HUD = 'var(--hud-c, var(--color-teal-5))';
const FRAME = 'var(--hud-frame-c, var(--hud-c, var(--color-teal-5)))';

const HUD_CORNERS_GLOW_CLASSES = 'dark:[filter:var(--hud-corners-glow)]';

/** Mỗi góc: `place` neo · `edges` 2 cạnh dày · `round` bo góc · `cut` nét vát (`k` = phần lùi). */
const CORNERS = [
  {
    key: 'tl',
    place: { top: 0, left: 0 },
    edges: (t: number) => ({ borderTopWidth: t, borderLeftWidth: t }),
    round: (r: number) => ({ borderTopLeftRadius: r }),
    cut: (s: number, k: number) => ({
      top: s - k,
      left: k,
      transformOrigin: '0 0',
      rotate: '-45deg',
    }),
  },
  {
    key: 'tr',
    place: { top: 0, right: 0 },
    edges: (t: number) => ({ borderTopWidth: t, borderRightWidth: t }),
    round: (r: number) => ({ borderTopRightRadius: r }),
    cut: (s: number, k: number) => ({
      top: s - k,
      right: k,
      transformOrigin: '100% 0',
      rotate: '45deg',
    }),
  },
  {
    key: 'bl',
    place: { bottom: 0, left: 0 },
    edges: (t: number) => ({ borderBottomWidth: t, borderLeftWidth: t }),
    round: (r: number) => ({ borderBottomLeftRadius: r }),
    cut: (s: number, k: number) => ({
      bottom: s - k,
      left: k,
      transformOrigin: '0 100%',
      rotate: '45deg',
    }),
  },
  {
    key: 'br',
    place: { bottom: 0, right: 0 },
    edges: (t: number) => ({ borderBottomWidth: t, borderRightWidth: t }),
    round: (r: number) => ({ borderBottomRightRadius: r }),
    cut: (s: number, k: number) => ({
      bottom: s - k,
      right: k,
      transformOrigin: '100% 100%',
      rotate: '-45deg',
    }),
  },
] as const;

/** Clip-path bát giác cho `chamfer`: cắt 4 góc của lớp viền để 4 nét chéo đắp lại. */
const chamferClip = (s: number) =>
  `polygon(${s}px 0, calc(100% - ${s}px) 0, 100% ${s}px, 100% calc(100% - ${s}px), calc(100% - ${s}px) 100%, ${s}px 100%, 0 calc(100% - ${s}px), 0 ${s}px)`;

/**
 * HudCorners — khung viền + nhấn 4 góc (chữ ký HUD) vẽ trong CÙNG một hệ toạ độ; dùng trong SummaryCard /
 * BoxInfo và các khung tự dựng (vd nền màn đăng nhập).
 *
 * Cha PHẢI `position: relative`. Màu đọc biến CSS của cha: `--hud-c` (góc, mặc định teal-5) ·
 * `--hud-frame-c` (khung, mặc định = `--hud-c`) — đổi tone chỉ cần set biến, vd `[--hud-c:var(--color-sky-5)]`.
 * Sửa giao diện: hình học từng góc → `CORNERS` (`borderWidth: 0` PHẢI đứng TRƯỚC `c.edges()`, đặt sau
 * thì ngoặc biến mất).
 * Lưu ý: bật `frame` thì cha PHẢI bỏ `border-*` của chính nó, nếu không ra hai nét lệch nhau 2px.
 * Lý do thiết kế: notes/components/surfaces-hud.md.
 *
 * @param props.variant - Kiểu nhấn góc: `bracket` (ngoặc [ ]) | `dot` (chấm vuông) | `chamfer` (vát 45°)
 *   | `none` (chỉ còn viền khi `frame`). Mặc định `bracket`.
 * @param props.size - Cánh ngoặc / cạnh vát, px; tự nâng lên tối thiểu 3 × `thickness`. Mặc định `8`.
 * @param props.thickness - Bề dày nét góc, px (với `dot` là nửa cạnh chấm). Mặc định `1.5`.
 * @param props.frame - `true` → vẽ luôn khung viền 4 cạnh. Mặc định `false`.
 * @param props.frameWidth - Bề dày khung viền, px; nhỏ hơn `thickness` thì viền mảnh mà góc vẫn nổi.
 *   Mặc định = `thickness`.
 * @param props.inset - Thụt cả lớp vào trong, px. Mặc định `0`.
 * @param props.radius - Bo góc, px, phải khớp `rounded-*` của cha; vô nghĩa với `chamfer`. Mặc định `0`.
 * @param props.glow - `true` → quầng `drop-shadow` quanh nét góc — CHỈ hiện ở theme tối. Mặc định `true`.
 *
 * @example
 * <div className="relative [--hud-c:var(--color-sky-5)]">
 *   <HudCorners frame frameWidth={1} size={10} thickness={2} variant="bracket" />
 *   …
 * </div>
 */
const HudCorners = memo(function HudCorners({
  variant = 'bracket',
  size = 8,
  thickness = 1.5,
  frame = false,
  frameWidth,
  inset = 0,
  radius = 0,
  glow = true,
}: HudCornersProps) {
  const arm = Math.max(size, thickness * 3);
  const isChamfer = variant === 'chamfer';
  const cornerClassName = glow ? HUD_CORNERS_GLOW_CLASSES : undefined;
  const rootStyle: CSSProperties = {
    inset,
    ['--hud-corners-glow' as string]: `drop-shadow(0 0 ${thickness + 1}px color-mix(in srgb, ${HUD} 55%, transparent))`,
  };

  return (
    <div aria-hidden className="pointer-events-none absolute z-20" style={rootStyle}>
      {frame && (
        <span
          className="absolute inset-0"
          style={{
            border: `${frameWidth ?? thickness}px solid ${FRAME}`,
            borderRadius: isChamfer ? undefined : radius || undefined,
            clipPath: isChamfer ? chamferClip(arm) : undefined,
          }}
        />
      )}

      {variant !== 'none' &&
        CORNERS.map((c) => {
          const base: CSSProperties = { position: 'absolute' };

          if (variant === 'dot') {
            return (
              <span
                key={c.key}
                className={cornerClassName}
                style={{
                  ...base,
                  ...c.place,
                  width: thickness * 2,
                  height: thickness * 2,
                  background: HUD,
                }}
              />
            );
          }

          if (isChamfer) {
            const back = thickness / 2 / Math.SQRT2;
            return (
              <span
                key={c.key}
                className={cornerClassName}
                style={{
                  ...base,
                  ...c.cut(arm, back),
                  width: arm * Math.SQRT2 - thickness,
                  height: thickness,
                  background: HUD,
                }}
              />
            );
          }

          return (
            <span
              key={c.key}
              className={cornerClassName}
              style={{
                ...base,
                ...c.place,
                width: arm,
                height: arm,
                borderStyle: 'solid',
                borderWidth: 0,
                borderColor: HUD,
                ...c.edges(thickness),
                ...(radius ? c.round(radius) : null),
              }}
            />
          );
        })}
    </div>
  );
});

export default HudCorners;
