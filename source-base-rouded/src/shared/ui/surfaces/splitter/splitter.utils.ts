import type { CSSProperties } from 'react';

import type { SplitterOrientation } from './splitter.types';

type SplitterSide = 'first' | 'second';

interface PaneStyleInput {
  collapsed: boolean;
  collapsedSide: SplitterSide;
  collapseMode: 'offscreen' | 'shrink';
  initialSize: number | string;
  orientation: SplitterOrientation;
  size: number | null;
  sizedSide: SplitterSide;
}

/** `value` là số (px) hoặc chuỗi "40%" / "320px"; trả về px, hoặc `null` khi không đọc được. */
export function resolveInitialPx(value: number | string | undefined, total: number): number | null {
  if (value == null) return null;
  if (typeof value === 'number') return value;
  const trimmed = value.trim();
  if (trimmed.endsWith('%')) {
    const pct = Number.parseFloat(trimmed.slice(0, -1));
    if (Number.isFinite(pct)) return Math.round((pct / 100) * total);
  }
  const px = Number.parseFloat(trimmed);
  return Number.isFinite(px) ? px : null;
}

/** Như `resolveInitialPx` nhưng trả `undefined` (không giới hạn) thay cho `null`. */
export function resolveBound(
  value: number | string | undefined,
  total: number,
): number | undefined {
  const px = resolveInitialPx(value, total);
  return px == null ? undefined : px;
}

export function clampSize(value: number, min?: number, max?: number, total?: number): number {
  let next = value;
  if (typeof min === 'number') next = Math.max(min, next);
  if (typeof max === 'number') next = Math.min(max, next);
  if (typeof total === 'number') next = Math.min(total, Math.max(0, next));
  return next;
}

const fillStyle = (orientation: SplitterOrientation): CSSProperties =>
  orientation === 'horizontal' ? { flex: 1, minWidth: 0 } : { flex: 1, minHeight: 0 };

function sizedStyle({ initialSize, orientation, size }: PaneStyleInput): CSSProperties {
  if (size == null) {
    return {
      flexBasis: typeof initialSize === 'number' ? `${initialSize}px` : initialSize,
      flexGrow: 0,
      flexShrink: 0,
    };
  }
  const length = orientation === 'horizontal' ? { width: `${size}px` } : { height: `${size}px` };
  return { ...length, flexGrow: 0, flexShrink: 0, flexBasis: 'auto' };
}

function collapsedStyle({ collapseMode, orientation, size }: PaneStyleInput): CSSProperties {
  if (collapseMode === 'shrink') {
    const zero = orientation === 'horizontal' ? { width: 0 } : { height: 0 };
    return { ...zero, flexGrow: 0, flexShrink: 0, flexBasis: 0 };
  }
  const length = size != null ? `${size}px` : '40%';
  return orientation === 'horizontal'
    ? {
        position: 'absolute',
        left: '-10000px',
        width: length,
        height: '100%',
        visibility: 'hidden',
        pointerEvents: 'none',
      }
    : {
        position: 'absolute',
        top: '-10000px',
        height: length,
        width: '100%',
        visibility: 'hidden',
        pointerEvents: 'none',
      };
}

function firstPaneStyle(input: PaneStyleInput): CSSProperties {
  const { collapsed, collapsedSide, orientation, sizedSide } = input;
  if (collapsed && collapsedSide === 'first') return collapsedStyle(input);
  if (collapsed && collapsedSide === 'second') return fillStyle(orientation);
  if (sizedSide === 'second') return fillStyle(orientation);
  return sizedStyle(input);
}

function secondPaneStyle(input: PaneStyleInput): CSSProperties | undefined {
  const { collapsed, collapsedSide, sizedSide } = input;
  if (collapsed && collapsedSide === 'second') return collapsedStyle(input);
  if (collapsed && collapsedSide === 'first') return undefined;
  if (sizedSide === 'first') return undefined;
  return sizedStyle(input);
}

/** Style inline của hai pane theo kích thước hiện tại, pane chốt và trạng thái ẩn. */
export function getPaneStyles(input: PaneStyleInput) {
  return { first: firstPaneStyle(input), second: secondPaneStyle(input) };
}
