import { images } from '@/assets/image';
import type { UploadFile } from '@/shared/ui';

/** Dữ liệu giả cho mục "Ảnh & tệp" và "Tải tệp & xem ảnh". */

/** Kích thước mỗi bước giả lập tiến độ (%) — đủ chậm để nhìn thấy thanh chạy. */
export const DEMO_UPLOAD_STEP = 12;

export const DEMO_UPLOAD_TICK_MS = 220;

/**
 * Ba tệp có sẵn, mỗi tệp một trạng thái. Lưu ý: KHÔNG `readonly` / `as const` — `useUpload` giữ
 * chính mảng này trong state (cùng lý do ở `constants/samples.constants.ts`).
 */
export const DEMO_UPLOAD_INITIAL: UploadFile[] = [
  {
    id: 'seed-done',
    name: 'ban-ve-ket-cau.pdf',
    size: 2_411_724,
    type: 'application/pdf',
    status: 'success',
    progress: 100,
  },
  {
    id: 'seed-paused',
    name: 'bang-khoi-luong.xlsx',
    size: 148_320,
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    status: 'paused',
    progress: 38,
  },
  {
    id: 'seed-error',
    name: 'anh-hien-truong.jpg',
    size: 5_320_998,
    type: 'image/jpeg',
    status: 'error',
    progress: 0,
    error: 'Vượt dung lượng cho phép',
  },
];

const LIGHTBOX_PLACEHOLDER_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0A1D30"/>
      <stop offset="100%" stop-color="#0F766E"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="800" fill="url(#g)"/>
  <circle cx="380" cy="300" r="90" fill="#22C55E" opacity="0.55"/>
  <path d="M0 640 L320 430 L560 600 L820 380 L1200 660 L1200 800 L0 800 Z" fill="#134E4A"/>
  <text x="600" y="740" fill="#DDE6EF" font-family="sans-serif" font-size="34" text-anchor="middle">
    Ảnh mẫu 1200 × 800
  </text>
</svg>`.trim();

/** Data-URI dùng cho `ImageLightbox` — chạy được cả khi không có mạng. */
export const DEMO_LIGHTBOX_SRC = `data:image/svg+xml,${encodeURIComponent(LIGHTBOX_PLACEHOLDER_SVG)}`;

/** 1 tệp / mỗi `UploadFileStatus` (pending·uploading·paused·success·error); tên đầu cố ý dài để thấy cắt chữ. */
export const DEMO_UPLOAD_FILES: UploadFile[] = [
  {
    id: 'uf-pending',
    name: 'bien-ban-hop-giao-ban-cong-truong-tuan-12-khu-b.docx',
    size: 84_220,
    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    status: 'pending',
    progress: 0,
  },
  {
    id: 'uf-uploading',
    name: 'bang-khoi-luong.xlsx',
    size: 148_320,
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    status: 'uploading',
    progress: 46,
  },
  {
    id: 'uf-paused',
    name: 'video-hien-truong.mp4',
    size: 42_600_000,
    type: 'video/mp4',
    status: 'paused',
    progress: 63,
  },
  {
    id: 'uf-success',
    name: 'ban-ve-ket-cau.pdf',
    size: 2_411_724,
    type: 'application/pdf',
    status: 'success',
    progress: 100,
  },
  {
    id: 'uf-error',
    name: 'anh-hien-truong.jpg',
    size: 5_320_998,
    type: 'image/jpeg',
    status: 'error',
    progress: 0,
    error: 'Vượt dung lượng cho phép (tối đa 5 MB)',
  },
];

/** Tệp ảnh đã tải xong có `previewUrl` — FileBadge vẽ ảnh thu nhỏ thay cho icon. */
export const DEMO_UPLOAD_THUMB_FILE: UploadFile = {
  id: 'uf-thumb',
  name: 'mat-bang-tang-3.png',
  size: 1_265_664,
  type: 'image/png',
  status: 'success',
  progress: 100,
  previewUrl: images['folder-fill'],
};

/** Mỗi tên một skin của FileBadge: red · green · blue · orange · sky · purple · neutral. */
export const DEMO_FILE_BADGE_NAMES = [
  'ho-so.pdf',
  'du-toan.xlsx',
  'thuyet-minh.docx',
  'mat-bang.dwg',
  'anh.png',
  'ban-ve.zip',
  'ghi-chu.txt',
];
