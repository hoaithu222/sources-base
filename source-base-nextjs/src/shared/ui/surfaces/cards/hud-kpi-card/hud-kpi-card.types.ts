export type HudKpiCardDensity = 'default' | 'compact';
export type HudKpiCardBarVariant = 'block' | 'cells';

export interface HudKpiCardBarSegment {
  value: number;
  /** Giá trị CSS của màu đoạn, vd `var(--color-indigo-5)`. */
  color: string;
  /** Tooltip của đoạn. */
  label?: string;
}

export interface HudKpiCardLegendItem {
  label: string;
  /** Đã định dạng sẵn ở nơi gọi: "305 máy", "5,5 tỷ". */
  value: string;
  color: string;
}
