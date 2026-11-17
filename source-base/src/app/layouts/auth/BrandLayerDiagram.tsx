import type { CSSProperties } from 'react';

import { Text } from '@/shared/ui';
import { cn } from '@/shared/utils/style/cn';
import { colorMix } from '@/shared/utils/style/color-mix.utils';

import { AUTH_ACCENT, AUTH_ACCENT_SOFT, AUTH_TEAL } from './auth-hud.constants';

const DIAGRAM_CLASSES =
  'relative hidden max-h-[280px] min-h-[140px] flex-1 overflow-hidden lg:block';
const TAG_CLASSES =
  'absolute left-full ml-4 -translate-y-1/2 whitespace-nowrap font-mono uppercase tracking-[0.15em]';

const PLANES = [
  { key: 'source', top: '42%', tone: AUTH_TEAL, border: 0.36, grid: 0.13, glow: false },
  { key: 'domain', top: '26.5%', tone: AUTH_TEAL, border: 0.48, grid: 0.16, glow: false },
  { key: 'report', top: '11%', tone: AUTH_ACCENT_SOFT, border: 0.85, grid: 0.2, glow: true },
] as const;

const TAGS = [
  { key: 'report', text: 'Báo cáo & phân tích', skin: 'primary', style: { top: '0%' } },
  { key: 'domain', text: 'Nghiệp vụ', skin: 'muted', style: { top: '50%' } },
  { key: 'source', text: 'Dữ liệu nền', skin: 'disabled', style: { top: '100%' } },
] as const;

const PLANE_TRANSFORM = 'translateX(-50%) scaleY(.55) rotate(45deg)';

const PLANE_CLASSES = 'absolute left-1/2 h-[46%]';

const PLANE_GLOW_CLASSES =
  'dark:shadow-[0_0_22px_-4px_color-mix(in_srgb,var(--color-primary-5)_55%,transparent)]';

const GLOW_STYLE: CSSProperties = {
  aspectRatio: '1.7',
  background: `radial-gradient(ellipse 30% 7% at 50% 84%, ${colorMix('var(--color-bg-page)', 0.85)}, transparent 70%),
            radial-gradient(ellipse 46% 30% at 50% 30%, ${colorMix(AUTH_ACCENT, 0.1)}, transparent 72%)`,
};

const AXIS_STYLE: CSSProperties = {
  aspectRatio: '2.097',
  borderLeft: `1px solid ${colorMix(AUTH_TEAL, 0.3)}`,
  borderRight: `1px solid ${colorMix(AUTH_TEAL, 0.3)}`,
};

function planeStyle({ tone, grid, border, top }: (typeof PLANES)[number]): CSSProperties {
  return {
    aspectRatio: '1',
    backgroundImage: `linear-gradient(${colorMix(tone, grid)} 1px, transparent 1px),
              linear-gradient(90deg, ${colorMix(tone, grid)} 1px, transparent 1px)`,
    backgroundSize: '25% 25%',
    border: `1px solid ${colorMix(tone, border)}`,
    top,
    transform: PLANE_TRANSFORM,
  };
}

const PLANE_STYLES = PLANES.map((plane) => ({
  key: plane.key,
  className: cn(PLANE_CLASSES, plane.glow && PLANE_GLOW_CLASSES),
  style: planeStyle(plane),
}));

/**
 * BrandLayerDiagram — sơ đồ trang trí ba lớp nền tảng (dữ liệu nền → nghiệp vụ → báo cáo) của `AuthBrandPanel`.
 *
 * Ẩn dưới `lg`, co theo chiều cao còn trống. Sửa lớp ở `PLANES` (độ đậm lưới / viền thang 0–1), nhãn ở `TAGS`.
 * Quầng của lớp trên cùng (chỉ theme tối) ở `PLANE_GLOW_CLASSES`.
 */
function BrandLayerDiagram() {
  return (
    <div aria-hidden className={DIAGRAM_CLASSES}>
      <span
        className="absolute left-1/2 top-1/2 h-[96%] -translate-x-1/2 -translate-y-1/2"
        style={GLOW_STYLE}
      />

      <span className="absolute left-1/2 top-[34%] h-[31%] -translate-x-1/2" style={AXIS_STYLE}>
        {TAGS.map(({ key, text, skin, style }) => (
          <Text key={key} className={TAG_CLASSES} size="extraTiny" skin={skin} style={style}>
            {text}
          </Text>
        ))}
      </span>

      {PLANE_STYLES.map(({ key, className, style }) => (
        <span key={key} className={className} style={style} />
      ))}
    </div>
  );
}

export default BrandLayerDiagram;
