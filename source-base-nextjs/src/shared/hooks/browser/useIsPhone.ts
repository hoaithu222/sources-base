'use client';

import { PHONE_MEDIA_QUERY } from '@/shared/constants/media-query.constants';

import { useMediaQuery } from './useMediaQuery';

/**
 * useIsPhone — màn ĐIỆN THOẠI ở cả hai hướng: dọc (< 768px) hoặc xoay ngang thấp (cao ≤ 540px, rộng < 1024px).
 *
 * Bản JS của biến thể `phone:` (`styles/theme/variants.css`), cùng điều kiện để CSS và JS không lệch nhau.
 * Chỉ dùng khi CẤU TRÚC JSX phải khác (vd Modal → bottom-sheet, gom bộ lọc); chỉ đổi class thì viết `phone:`.
 * Lưu ý: đây là chuyện KÍCH THƯỚC, không phải ngón tay — hỏi chuyện chạm bằng `useIsCoarsePointer`.
 *
 * @returns `true` khi màn thuộc nhóm điện thoại; dựng ở client cho giá trị đúng ngay khung đầu; lần hydrate HTML tĩnh thì khung đầu là `false` rồi tự cập nhật.
 *
 * @example
 * const isPhone = useIsPhone();
 * return isPhone ? <FilterDisclosure>{filters}</FilterDisclosure> : filters;
 */
export function useIsPhone(): boolean {
  return useMediaQuery(PHONE_MEDIA_QUERY);
}
