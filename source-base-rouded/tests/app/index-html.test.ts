/**
 * `index.html` — thứ trình duyệt hiện TRƯỚC khi bundle chạy (tên tab, tên app khi ghim ra màn hình
 * chính, màu thanh trình duyệt) là chuỗi viết tay, không đọc được từ code. Đổi tên app mặc định hay
 * màu nền trang mà quên file này là lệch âm thầm: tab nháy tên cũ, thanh trạng thái khác màu nền.
 */

import { describe, expect, it } from 'vitest';

import { parseAppEnv } from '@/core/config/env.schema';
import colors from '@/styles/theme/colors-theme.json';
import { ROOT_FILES } from '@tests/helpers/source-files';

const indexHtml = ROOT_FILES['index.html'] ?? '';
const doc = new DOMParser().parseFromString(indexHtml, 'text/html');

const metaContent = (selector: string) =>
  doc.querySelector<HTMLMetaElement>(`meta${selector}`)?.getAttribute('content') ?? null;

/** Tên app khi `.env` không khai `VITE_APP_NAME` — không đọc `appConfig` để `.env.local` không chen vào. */
const DEFAULT_APP_NAME = parseAppEnv({}).appName;

describe('index.html — khớp nguồn thật', () => {
  it('đọc được file thật', () => {
    expect(indexHtml).toContain('<div id="root">');
  });

  it('<title> = tên app mặc định (`VITE_APP_NAME`) — giống tên tab khi không route nào có tiêu đề', () => {
    expect(doc.title).toBe(DEFAULT_APP_NAME);
  });

  it('apple-mobile-web-app-title = tên app mặc định', () => {
    expect(metaContent('[name="apple-mobile-web-app-title"]')).toBe(DEFAULT_APP_NAME);
  });

  it('theme-color hai theme = token `bg-page` (light, dark) của colors-theme.json', () => {
    const [light, dark] = colors.theme['bg-page'];

    expect(metaContent('[name="theme-color"][media="(prefers-color-scheme: light)"]')).toBe(light);
    expect(metaContent('[name="theme-color"][media="(prefers-color-scheme: dark)"]')).toBe(dark);
  });
});
