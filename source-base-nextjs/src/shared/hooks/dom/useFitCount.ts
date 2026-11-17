'use client';

import { useLayoutEffect, useRef, useState } from 'react';

interface UseFitCountOptions {
  /** Số mục của dải (đổi số mục → đo lại). */
  itemCount: number;
  /** Khe giữa hai mục, px (khớp `gap-*` của dải). */
  gap?: number;
  /** Phần cố định của dải ngoài các mục (padding + viền), px. */
  reserve?: number;
  /** Phần tử CHỦ chứa dải — chỗ trống còn dư trong nó là phần dải được nở thêm. Bỏ trống → cha trực tiếp. */
  hostSelector?: string;
}

/** Bề rộng còn trống của `host`: bề rộng trong trừ đoạn từ mép trái con đầu tới mép phải con cuối (con đang hiện). */
function freeSpaceOf(host: HTMLElement): number {
  const rects = [...host.children]
    .filter((child) => child.getClientRects().length > 0)
    .map((child) => child.getBoundingClientRect());
  if (rects.length === 0) return 0;
  const content = Math.max(...rects.map((r) => r.right)) - Math.min(...rects.map((r) => r.left));
  return Math.max(0, host.clientWidth - content);
}

/**
 * useFitCount — đếm bao nhiêu mục ĐẦU của một dải ngang vừa chỗ (mẫu "priority+" của thanh công cụ macOS): phần không vừa
 * dồn vào nút "Thêm", không cắt chữ, không cuộn ngang mù.
 *
 * Dùng:   const { wrapperRef, measureRef, count } = useFitCount({ itemCount: items.length, gap: 2, reserve: 6 });
 *         `measureRef` gắn lên một hàng ẨN (`invisible absolute`, `inert`) dựng ĐỦ mục với đúng class thật + một phần tử
 *         `data-fit-more` (nút "Thêm", chỉ tính khi có mục bị dồn) ở cuối; phần tử luôn hiện (nút action) gắn
 *         `data-fit-fixed`. `wrapperRef` gắn lên khối bọc dải đang hiện.
 * Lưu ý:  chỗ có = bề rộng dải hiện tại + chỗ trống còn dư trong phần tử chủ — dải không cần `flex-1` nên bố cục quanh nó
 *         giữ nguyên. Không có `ResizeObserver` (SSR) hoặc chưa đo được (đang ẩn, jsdom) → hiện đủ mục. Luôn chừa ≥ 1 mục.
 */
export function useFitCount<
  W extends HTMLElement = HTMLDivElement,
  M extends HTMLElement = HTMLDivElement,
>({ itemCount, gap = 0, reserve = 0, hostSelector }: UseFitCountOptions) {
  const wrapperRef = useRef<W>(null);
  const measureRef = useRef<M>(null);
  const [count, setCount] = useState(itemCount);

  useLayoutEffect(() => {
    const wrapper = wrapperRef.current;
    const measure = measureRef.current;
    if (!wrapper || !measure || typeof ResizeObserver === 'undefined') {
      setCount(itemCount);
      return;
    }
    const host =
      (hostSelector ? wrapper.closest<HTMLElement>(hostSelector) : null) ?? wrapper.parentElement;

    const compute = () => {
      const nodes = [...measure.children] as HTMLElement[];
      const more = nodes.find((node) => node.dataset.fitMore !== undefined);
      const fixed = nodes
        .filter((node) => node.dataset.fitFixed !== undefined)
        .reduce((sum, node) => sum + node.offsetWidth + gap, 0);
      const widths = nodes
        .filter((node) => node !== more && node.dataset.fitFixed === undefined)
        .map((node) => node.offsetWidth);
      if (widths.every((width) => width === 0)) {
        setCount(widths.length);
        return;
      }
      const available = wrapper.offsetWidth + (host ? freeSpaceOf(host) : 0) - reserve - fixed;
      const total = widths.reduce((sum, width, index) => sum + width + (index > 0 ? gap : 0), 0);
      if (total <= available) {
        setCount(widths.length);
        return;
      }
      let used = more?.offsetWidth ?? 0;
      let fit = 0;
      for (const width of widths) {
        if (used + width + gap > available) break;
        used += width + gap;
        fit += 1;
      }
      setCount(Math.max(1, fit));
    };

    compute();
    const observer = new ResizeObserver(compute);
    observer.observe(measure);
    observer.observe(wrapper);
    if (host) {
      observer.observe(host);
      for (const child of host.children) observer.observe(child);
    }
    return () => observer.disconnect();
  }, [itemCount, gap, reserve, hostSelector]);

  return { wrapperRef, measureRef, count };
}
