/**
 * Cụm media (ảnh · khung xem ảnh · tải tệp) — theme tối cùng hình với theme sáng, chỉ khác bảng màu.
 *
 * jsdom không vẽ CSS nên khoá HỢP ĐỒNG class: mọi `dark:` còn lại chỉ là chỉnh MÀU phẳng (chữ · nền · viền…, kể cả khi đi
 * kèm `hover:` / `group-hover:`); không `not-dark:`, không quầng (`shadow-[…]`, `drop-shadow`), không gradient, không
 * `hud-*`, không `clip-path`, không pseudo trang trí riêng cho tối.
 */

import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import {
  Dropzone,
  FileBadge,
  FileCard,
  FileList,
  Image,
  ImageLightbox,
  ImagePreview,
  Upload,
  type UploadFile,
} from '@/shared/ui';
import * as IMAGE_LIGHTBOX_THEME from '@/shared/ui/media/image/lightbox/image-lightbox.theme';
import * as FILE_CARD_THEME from '@/shared/ui/media/upload/file-list/file-card.theme';
import * as UPLOAD_THEME from '@/shared/ui/media/upload/upload.theme';

const noop = () => undefined;

/** `dark:` còn được phép = chỉnh MÀU phẳng (chữ · nền · viền · vòng…, không gradient, không pseudo) hoặc tham số màu `dark:[--x:…]`. */
const isFlatDarkColor = (c: string) =>
  /^dark:\[--(?!hud)[a-z-]+:/.test(c) ||
  (/^dark:(?:[^\s:]+:)*(?:text|bg|border|ring|outline|fill|stroke|divide|decoration)-(?!linear|gradient|\[)/.test(
    c,
  ) &&
    !/(^|:)(before|after):/.test(c));

const hudLeftovers = (classes: string[]) =>
  classes.filter(
    (c) =>
      /(^|:)not-dark:/.test(c) ||
      (/(^|:)dark:/.test(c) && !isFlatDarkColor(c)) ||
      /(^|[:-])hud-|clip-path|-skew-/.test(c),
  );

/** Mọi token class trong một chuỗi / bảng class lồng nhau (bỏ giá trị không phải chuỗi). */
const tokensOf = (value: unknown): string[] => {
  if (typeof value === 'string') return value.split(/\s+/).filter(Boolean);
  if (value && typeof value === 'object') return Object.values(value).flatMap(tokensOf);
  return [];
};

const bodyClasses = () =>
  [...document.body.querySelectorAll('[class]')].flatMap((element) =>
    (element.getAttribute('class') ?? '').split(/\s+/).filter(Boolean),
  );

const FILE_STATUSES = ['pending', 'uploading', 'paused', 'success', 'error'] as const;
const FILES: UploadFile[] = FILE_STATUSES.map((status, index) => ({
  id: String(index),
  name: `tai-lieu-${status}.pdf`,
  size: 2048 * (index + 1),
  type: 'application/pdf',
  status,
  progress: status === 'uploading' || status === 'paused' ? 40 : 100,
  error: status === 'error' ? 'Vượt dung lượng cho phép' : undefined,
}));

describe('bảng class media — không còn nhánh HUD', () => {
  it.each([
    ['upload.theme', UPLOAD_THEME],
    ['file-card.theme', FILE_CARD_THEME],
    ['image-lightbox.theme', IMAGE_LIGHTBOX_THEME],
  ])('%s: mọi trạng thái chỉ còn `dark:` chỉnh màu phẳng', (_name, theme) => {
    expect(hudLeftovers(tokensOf(theme))).toEqual([]);
  });
});

describe('media đang hiện — không còn nhánh HUD', () => {
  it('Upload 3 kiểu · FileList mọi trạng thái · FileBadge · Dropzone', () => {
    render(
      <>
        <Upload variant="dropzone" />
        <Upload error="Chỉ nhận tệp .pdf" variant="dropzone" />
        <Upload variant="inline" />
        <Upload variant="button" />
        <FileList files={FILES} showCancel showPercent showProgressBar showRemove showRetry />
        <FileCard density="compact" file={FILES[1]} variant="simple" />
        <FileBadge name="bao-cao.xlsx" />
        <Dropzone onDrop={noop}>
          <p>vùng thả</p>
        </Dropzone>
      </>,
    );

    expect(hudLeftovers(bodyClasses())).toEqual([]);
  });

  it('Image · ImagePreview (có / không ảnh) · ImageLightbox', () => {
    render(
      <>
        <Image alt="Thư mục" name="folder-empty" />
        <ImagePreview alt="Không ảnh" />
        <ImagePreview alt="Có ảnh" preview src="/a.png" />
        <ImageLightbox open src="/a.png" onOpenChange={noop} />
      </>,
    );

    expect(hudLeftovers(bodyClasses())).toEqual([]);
  });
});
