import type { CSSProperties, ReactNode } from 'react';

import type { TitleIconColor } from '@/shared/ui/layout/TitleScreen';

export type HudFrameTone = TitleIconColor;

export type HudFrameIntensity = 'default' | 'cyber' | 'prime';

export type HudFrameWeight = 'regular' | 'hairline';

export interface HudFrameProps {
  tone?: HudFrameTone;
  notch?: boolean;
  corners?: boolean;
  glow?: boolean;
  intensity?: HudFrameIntensity;
  weight?: HudFrameWeight;
  scanlines?: boolean;
  sweep?: boolean;
  ticks?: boolean;
  notchSize?: number;
  bodyClassName?: string;
  bodyStyle?: CSSProperties;
  className?: string;
  children: ReactNode;
}
