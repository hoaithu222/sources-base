'use client';

import { BELOW_WIDE_QUERY } from '@/shared/constants/media-query.constants';

import { useMediaQuery } from './useMediaQuery';

/**
 * useIsBelowWide — màn HẸP HƠN mốc `wide` (< 1800px): laptop 14" / 16", máy tính bảng, điện thoại.
 *
 * Bản JS của `max-wide:` (`styles/theme/breakpoints.css`); màn ngoài ≥ 1800px và TV trả `false`.
 * Chỉ dùng khi CẤU TRÚC JSX phải khác ở màn hẹp; chỉ đổi class thì viết `max-wide:` / `xl:max-wide:`.
 *
 * @returns `true` khi viewport rộng dưới 1800px.
 *
 * @example
 * const compact = useIsBelowWide();
 * <Legend layout={compact ? 'bottom' : 'right'} />
 */
export function useIsBelowWide(): boolean {
  return useMediaQuery(BELOW_WIDE_QUERY);
}
