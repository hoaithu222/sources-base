import type { CSSProperties } from 'react';

import { HudCorners } from '@/shared/ui';
import { colorMix } from '@/shared/utils/style/color-mix.utils';

import { AUTH_ACCENT, AUTH_ACCENT_SOFT, AUTH_TEAL } from './auth-hud.constants';

const CELL = '68px 46px';

const GRID_CLASSES = 'animate-auth-grid opacity-40 motion-reduce:animate-none dark:opacity-100';

const HORIZON_CLASSES = 'opacity-50 dark:opacity-100';

const TWINKLE_CLASSES = 'hidden animate-auth-twinkle motion-reduce:animate-none dark:block';

const CORNERS_CLASSES =
  'pointer-events-none fixed inset-4 z-[1] hidden [--hud-c:var(--color-teal-5)] dark:block';

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

const STAR_INK = 'var(--color-fg-heading)';

const TWINKLE_STYLE: CSSProperties = {
  position: 'absolute',
  inset: 0,
  backgroundImage: [
    `radial-gradient(1.5px 1.5px at 12% 22%, ${colorMix(STAR_INK, 0.55)}, transparent)`,
    `radial-gradient(1.5px 1.5px at 68% 12%, ${colorMix(AUTH_ACCENT_SOFT, 0.55)}, transparent)`,
    `radial-gradient(1px 1px at 34% 62%, ${colorMix(STAR_INK, 0.4)}, transparent)`,
    `radial-gradient(1.5px 1.5px at 88% 48%, ${colorMix(AUTH_TEAL, 0.5)}, transparent)`,
    `radial-gradient(1px 1px at 52% 84%, ${colorMix('var(--color-sky-5)', 0.45)}, transparent)`,
    `radial-gradient(1px 1px at 22% 76%, ${colorMix(STAR_INK, 0.3)}, transparent)`,
    `radial-gradient(1px 1px at 76% 72%, ${colorMix(AUTH_ACCENT_SOFT, 0.4)}, transparent)`,
    `radial-gradient(1px 1px at 44% 34%, ${colorMix(STAR_INK, 0.28)}, transparent)`,
  ].join(','),
};

const VIGNETTE_STYLE: CSSProperties = {
  position: 'absolute',
  inset: 0,
  background: `radial-gradient(ellipse 90% 80% at 50% 45%, transparent 40%, ${colorMix('var(--color-bg-page)', 0.88)} 100%)`,
};

/**
 * AuthBackdrop — nền màn xác thực: lưới phối cảnh trên / dưới, chân trời, đốm sao, viền tối và góc HUD.
 *
 * `AuthLayout` gắn MỘT lần, phủ `fixed` sau thẻ form. Màu qua token + `colorMix` (`auth-hud.constants.ts`),
 * KHÔNG hex. Lưu ý: giữ mask của lưới — bỏ thì hoa văn lấn vào nội dung form.
 * Theme sáng chỉ còn lưới + chân trời mờ; đốm sao và ngoặc góc màn hình chỉ ở theme tối (`dark:block`).
 */
function AuthBackdrop() {
  return (
    <>
      <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <span className={GRID_CLASSES} style={GRID_TOP_STYLE} />

        <span className={GRID_CLASSES} style={GRID_BOTTOM_STYLE} />

        <span className={HORIZON_CLASSES} style={HORIZON_STYLE} />

        <span className={TWINKLE_CLASSES} style={TWINKLE_STYLE} />

        <span style={VIGNETTE_STYLE} />
      </div>

      <div aria-hidden className={CORNERS_CLASSES}>
        <HudCorners size={22} thickness={1.5} variant="bracket" />
      </div>
    </>
  );
}

export default AuthBackdrop;
