import { useLayoutEffect, type RefObject } from 'react';

interface SegmentGlideOptions {
  /** Khoá đang chọn — đổi khoá là đo lại và trượt. */
  activeKey: string | undefined;
  /** Variant có mặt trượt không (`segmentGlideClasses`); `false` = bỏ qua. */
  enabled: boolean;
  /** Px cao thêm ở đáy (`underline` đè lên `border-b` của khung). */
  bleed: number;
  /** Đổi danh sách đoạn (thêm / bớt / đổi nhãn) cũng đo lại. */
  layoutKey: unknown;
}

/**
 * useSegmentGlide — đặt mặt trượt (`glideRef`, con đầu của khung `relative`) đè đúng đoạn `aria-pressed="true"`.
 *
 * Ghi thẳng `transform` / `width` / `height` vào style (không re-render). Lần đo ĐẦU ép tính style rồi mới bật
 * `data-ready` → hiện ngay tại chỗ, không trượt từ góc trái. ResizeObserver trên khung + từng đoạn: font tải xong,
 * badge đổi số, khung giãn → mặt trượt đi theo. Không còn đoạn nào được chọn → ẩn.
 */
export function useSegmentGlide(
  glideRef: RefObject<HTMLSpanElement | null>,
  { activeKey, enabled, bleed, layoutKey }: SegmentGlideOptions,
) {
  useLayoutEffect(() => {
    const glide = glideRef.current;
    const root = glide?.parentElement;
    if (!enabled || !glide || !root) return;

    const place = () => {
      const target = root.querySelector<HTMLElement>(':scope > [aria-pressed="true"]');
      if (!target || target.offsetWidth === 0) {
        glide.style.visibility = 'hidden';
        return;
      }
      glide.style.visibility = '';
      glide.style.width = `${target.offsetWidth}px`;
      glide.style.height = `${target.offsetHeight + bleed}px`;
      glide.style.transform = `translate(${target.offsetLeft}px, ${target.offsetTop}px)`;
      if (glide.dataset.ready !== 'true') {
        glide.getBoundingClientRect();
        glide.dataset.ready = 'true';
      }
    };

    place();
    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(place);
    observer.observe(root);
    for (const child of root.children) if (child !== glide) observer.observe(child);
    return () => observer.disconnect();
  }, [glideRef, activeKey, enabled, bleed, layoutKey]);
}
