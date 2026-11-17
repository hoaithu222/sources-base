import { afterEach, beforeEach } from 'vitest';

/**
 * Chặn jsdom "điều hướng" thật khi bấm `<a href>` — Next `<Link>` ngoài App Router không tự `preventDefault`, nên jsdom in
 * "Not implemented: navigation to another Document" ra stderr. Gọi MỘT lần ở đầu file / `describe`:
 *
 *   guardAnchorNavigation();
 *
 * Chỉ chặn hành vi mặc định của trình duyệt (sự kiện vẫn tới handler React); muốn kiểm đích đến thì đọc `href` của liên kết.
 */
export function guardAnchorNavigation(): void {
  const prevent = (event: Event) => event.preventDefault();
  beforeEach(() => document.addEventListener('click', prevent));
  afterEach(() => document.removeEventListener('click', prevent));
}
