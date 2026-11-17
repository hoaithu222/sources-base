import type { CSSProperties } from 'react';

import { colorMix } from '@/shared/utils/style/color-mix.utils';

import { AUTH_ACCENT, AUTH_TEAL } from './auth-hud.constants';

const CELL = '68px 46px';

const GRID_CLASSES = 'animate-auth-grid opacity-40 motion-reduce:animate-none';

const HORIZON_CLASSES = 'opacity-50';

const GRID_BASE_STYLE: CSSProperties = {
  position: 'absolute',
  left: '-60%',
  right: '-60%',
  height: '62%',
  backgroundSize: CELL,
};

function gridMask(fadeTo: 'bottom' | 'top'): CSSProperties {
  const value = `linear-gradient(to ${fadeTo}, var(--color-bg-page) 4%, transparent 78%),
     linear-gradient(to right, var(--color-bg-page) 34%, transparent 66%)`;
  return {
    maskImage: value,
    WebkitMaskImage: value,
    maskComposite: 'intersect',
    WebkitMaskComposite: 'source-in',
  };
}

const GRID_TOP_STYLE: CSSProperties = {
  ...GRID_BASE_STYLE,
  ...gridMask('bottom'),
  top: '-6%',
  backgroundImage: `linear-gradient(${colorMix(AUTH_ACCENT, 0.32)} 1px, transparent 1px),
              linear-gradient(90deg, ${colorMix(AUTH_ACCENT, 0.22)} 1px, transparent 1px)`,
  transform: 'perspective(300px) rotateX(-64deg)',
  transformOrigin: 'center top',
  animationDirection: 'reverse',
};

const GRID_BOTTOM_STYLE: CSSProperties = {
  ...GRID_BASE_STYLE,
  ...gridMask('top'),
  bottom: '-6%',
  backgroundImage: `linear-gradient(${colorMix(AUTH_TEAL, 0.44)} 1px, transparent 1px),
              linear-gradient(90deg, ${colorMix(AUTH_TEAL, 0.3)} 1px, transparent 1px)`,
  transform: 'perspective(300px) rotateX(64deg)',
  transformOrigin: 'center bottom',
};

const HORIZON_STYLE: CSSProperties = {
  position: 'absolute',
  top: '50%',
  left: 0,
  right: 0,
  height: 220,
  marginTop: -110,
  background: `linear-gradient(90deg, transparent 2%, ${colorMix('var(--color-teal-3)', 0.5)} 26%,
                ${colorMix(AUTH_TEAL, 0.22)} 52%, transparent 72%) center center / 100% 1px no-repeat,
              radial-gradient(60% 100% at 32% 50%, ${colorMix(AUTH_TEAL, 0.16)}, transparent 70%)`,
};

const VIGNETTE_STYLE: CSSProperties = {
  position: 'absolute',
  inset: 0,
  background: `radial-gradient(ellipse 90% 80% at 50% 45%, transparent 40%, ${colorMix('var(--color-bg-page)', 0.88)} 100%)`,
};

/**
 * AuthBackdrop — nền màn xác thực: lưới phối cảnh mờ trên / dưới, chân trời và viền tối dần ra mép.
 *
 * `AuthLayout` gắn MỘT lần, phủ `fixed` sau thẻ form. Màu qua token + `colorMix` (`auth-hud.constants.ts`),
 * KHÔNG hex. Lưu ý: giữ mask của lưới — bỏ thì hoa văn lấn vào nội dung form. Một công thức cho cả hai theme
 * (chỉ khác màu của token): đốm sao và ngoặc góc màn hình đã gỡ.
 */
function AuthBackdrop() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <span className={GRID_CLASSES} style={GRID_TOP_STYLE} />

      <span className={GRID_CLASSES} style={GRID_BOTTOM_STYLE} />

      <span className={HORIZON_CLASSES} style={HORIZON_STYLE} />

      <span style={VIGNETTE_STYLE} />
    </div>
  );
}

export default AuthBackdrop;
