'use client';

import { TOUCH_MEDIA_QUERY } from '@/shared/constants/media-query.constants';

import { useMediaQuery } from './useMediaQuery';

/**
 * Đang thao tác bằng NGÓN TAY (không có con trỏ để rê): iPad / điện thoại chạm → `true`; iPad + Magic Keyboard, PC → `false`.
 * Bản JS của biến thể `touch:` (`styles/theme/variants.css`), cùng điều kiện để CSS và JS không lệch nhau.
 * ⛔ Đừng thay bằng kiểm tra bề rộng màn: iPad Pro 12.9" ngang = 1366px, trùng dải laptop 14" (ipad-responsive.md §1).
 */
export function useIsCoarsePointer(): boolean {
  return useMediaQuery(TOUCH_MEDIA_QUERY);
}
