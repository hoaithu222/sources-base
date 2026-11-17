import type { Page } from '@playwright/test';

/**
 * Đo bố cục THẬT của trang — thứ jsdom không có (`docs/rules/display/responsive-screens.md §6.2`).
 *
 *   `page`       `scrollWidth − clientWidth` của tài liệu: > 0 là cả trang tràn ngang (chặt hơn `scrollWidth ≤ innerWidth`: tính cả khi
 *                có thanh cuộn chiếm chỗ)
 *   `main`       `scrollWidth − clientWidth` của vùng `<main>` (vỏ vùng làm việc khoá tài liệu `h-dvh overflow-hidden` và
 *                `overflow-x-hidden` ở `<main>`, nên nội dung tràn bị CẮT mà `page` vẫn bằng 0 — chỉ số này mới thấy)
 *   `offenders`  phần tử vượt mép phải, bỏ phần tử nằm trong vùng cuộn ngang có chủ đích — để báo lỗi chỉ đúng chỗ
 */

export interface OverflowReport {
  page: number;
  main: number;
  offenders: string[];
}

const MAX_OFFENDERS = 8;

export function measureOverflow(page: Page): Promise<OverflowReport> {
  return page.evaluate((limit) => {
    const root = document.documentElement;
    const main = document.querySelector('main');

    const insideScroller = (element: Element): boolean => {
      for (let parent = element.parentElement; parent; parent = parent.parentElement) {
        const { overflowX } = getComputedStyle(parent);
        const clips = overflowX === 'auto' || overflowX === 'scroll' || overflowX === 'hidden';
        if (clips && parent.scrollWidth > parent.clientWidth) return true;
      }
      return false;
    };

    const offenders = [...document.querySelectorAll('body *')]
      .filter((element) => element.getBoundingClientRect().right > innerWidth + 1)
      .filter((element) => !insideScroller(element))
      .slice(0, limit)
      .map(
        (element) => `${element.tagName.toLowerCase()}.${String(element.className).slice(0, 60)}`,
      );

    return {
      page: root.scrollWidth - root.clientWidth,
      main: main ? main.scrollWidth - main.clientWidth : 0,
      offenders,
    };
  }, MAX_OFFENDERS);
}
