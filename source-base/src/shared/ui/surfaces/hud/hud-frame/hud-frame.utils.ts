import type { CSSProperties } from 'react';

/** Pha `tone-5` với trong suốt: `mixTone('sky', 30)` → `color-mix(… var(--color-sky-5) 30% …)`. */
export const mixTone = (tone: string, pct: number): string =>
  `color-mix(in srgb, var(--color-${tone}-5) ${pct}%, transparent)`;

export const buildClip = (n: number): string =>
  `polygon(${n}px 0, 100% 0, 100% calc(100% - ${n}px), calc(100% - ${n}px) 100%, 0 100%, 0 ${n}px)`;

export const frameBackground = (tone: string, startPct: number, midPct: number): string =>
  `linear-gradient(150deg,
      ${mixTone(tone, startPct)} 0%,
      ${mixTone(tone, midPct)} 30%,
      var(--color-border-default) 70%)`;

export const scanlineBackground = (tone: string): string =>
  `repeating-linear-gradient(
                180deg,
                transparent 0,
                transparent 3px,
                ${mixTone(tone, 6)} 3px,
                ${mixTone(tone, 6)} 4px
              )`;

export const topStripeStyle = (tone: string): CSSProperties => ({
  background: `linear-gradient(90deg,
                transparent 0%,
                ${mixTone(tone, 80)} 30%,
                ${mixTone(tone, 80)} 70%,
                transparent 100%)`,
});

/** `position` = hai cạnh ghim chấm: `{ left: 12, top: 1 }` hoặc `{ right: 1, bottom: 12 }`. */
export const dotStyle = (px: number, color: string, position: CSSProperties): CSSProperties => ({
  width: px,
  height: px,
  ...position,
  background: color,
});
