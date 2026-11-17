import type { HudFrameIntensity, HudFrameTone, HudFrameWeight } from './hud-frame.types';
import { mixTone } from './hud-frame.utils';

/**
 * Bảng "diện mạo" của HudFrame theo intensity × weight (HudFrame.tsx chỉ tra ô rồi vẽ).
 *
 * Ô gồm:  % pha tone ở gradient viền · quầng ngoài (chỉ theme tối) · cỡ + nét bracket · quầng bracket
 *         · chấm góc notch
 * Sửa:    đổi giá trị trong đúng ô cần chỉnh — các ô độc lập, không ô nào kế thừa ô khác.
 * Lưu ý:  ⚠️ prime × hairline giữ bracket 16px (size-4) nhưng nét 1px — cánh theo intensity, nét theo weight.
 *         ⚠️ hairline (lưới nhiều card) KHÔNG chấm góc: 4 chấm sáng × 8 card là nhiễu (ngân sách trang trí §0c).
 */

interface HudFrameLook {
  startPct: number;
  midPct: number;
  shadow: (tone: HudFrameTone) => string;
  bracket: string;
  bracketPx: number;
  bracketGlowPx: number | null;
  dotPx: number | null;
}

export const HUD_FRAME_LOOK = {
  default: {
    regular: {
      startPct: 70,
      midPct: 22,
      shadow: (tone) => `0 0 24px -10px ${mixTone(tone, 70)}`,
      bracket: 'size-2.5',
      bracketPx: 1.5,
      bracketGlowPx: null,
      dotPx: null,
    },
    hairline: {
      startPct: 68,
      midPct: 16,
      shadow: (tone) => `0 0 12px -8px ${mixTone(tone, 75)}`,
      bracket: 'size-3.5',
      bracketPx: 1,
      bracketGlowPx: 2,
      dotPx: null,
    },
  },
  cyber: {
    regular: {
      startPct: 90,
      midPct: 35,
      shadow: (tone) => `0 0 32px -6px ${mixTone(tone, 55)},
         0 0 12px -4px ${mixTone(tone, 80)}`,
      bracket: 'size-3.5',
      bracketPx: 2,
      bracketGlowPx: 3,
      dotPx: 6,
    },
    hairline: {
      startPct: 68,
      midPct: 16,
      shadow: (tone) => `0 0 12px -8px ${mixTone(tone, 75)}`,
      bracket: 'size-3.5',
      bracketPx: 1,
      bracketGlowPx: 2,
      dotPx: null,
    },
  },
  prime: {
    regular: {
      startPct: 100,
      midPct: 46,
      shadow: (tone) => `0 6px 20px -12px var(--color-shadow-popup),
         0 0 34px -8px ${mixTone(tone, 52)},
         0 0 10px -3px ${mixTone(tone, 85)}`,
      bracket: 'size-4',
      bracketPx: 2,
      bracketGlowPx: 3,
      dotPx: 6,
    },
    hairline: {
      startPct: 68,
      midPct: 16,
      shadow: (tone) => `0 0 12px -8px ${mixTone(tone, 75)}`,
      bracket: 'size-4',
      bracketPx: 1,
      bracketGlowPx: 2,
      dotPx: null,
    },
  },
} satisfies Record<HudFrameIntensity, Record<HudFrameWeight, HudFrameLook>>;
