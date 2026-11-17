import {
  BELOW_WIDE_QUERY,
  PHONE_MEDIA_QUERY,
  TOUCH_MEDIA_QUERY,
} from '@/shared/constants/media-query.constants';

import { DEMO_SCREEN_PATHS } from '../../../shared/constants/screens.constants';
import type {
  DemoDeviceGroup,
  DemoFrameTarget,
  DemoVariantProbeGroup,
  DemoViewport,
} from '../../components/responsive-lab/responsive-lab.types';

/**
 * Bảng thiết bị → viewport CSS px — cùng số liệu với `docs/rules/display/responsive-screens.md §1`. Viewport
 * là `innerWidth × innerHeight` (không phải độ phân giải panel), nên 1920×1080 ở 125% chỉ còn 1536×864.
 */
export const DEMO_DEVICE_GROUPS: readonly DemoDeviceGroup[] = [
  {
    id: 'phone-portrait',
    label: 'Điện thoại dọc',
    gate: 'phone: · touch:',
    viewports: [
      { width: 320, height: 568, note: 'sàn thấp nhất' },
      { width: 360, height: 800 },
      { width: 375, height: 667 },
      { width: 390, height: 844 },
      { width: 393, height: 852 },
      { width: 412, height: 915 },
      { width: 430, height: 932 },
    ],
  },
  {
    id: 'phone-landscape',
    label: 'Điện thoại ngang',
    gate: 'phone: (cao ≤ 540) · touch:',
    viewports: [
      { width: 568, height: 320 },
      { width: 667, height: 375 },
      { width: 844, height: 390 },
      { width: 915, height: 412 },
      { width: 932, height: 430 },
    ],
  },
  {
    id: 'tablet-portrait',
    label: 'Tablet dọc',
    gate: 'md: · touch:',
    viewports: [
      { width: 744, height: 1133, note: 'mini · khớp phone:' },
      { width: 768, height: 1024 },
      { width: 810, height: 1080 },
      { width: 820, height: 1180 },
      { width: 834, height: 1194 },
      { width: 1024, height: 1366, note: 'Pro 12.9"' },
    ],
  },
  {
    id: 'tablet-landscape',
    label: 'Tablet ngang',
    gate: 'lg: · touch:',
    viewports: [
      { width: 1024, height: 768 },
      { width: 1133, height: 744 },
      { width: 1180, height: 820 },
      { width: 1194, height: 834 },
      { width: 1366, height: 1024, note: 'Pro — trùng bề rộng laptop 14"' },
    ],
  },
  {
    id: 'laptop-14',
    label: 'Laptop 14"',
    gate: 'xl:max-wide:',
    viewports: [
      { width: 1280, height: 720 },
      { width: 1366, height: 768 },
      { width: 1440, height: 900 },
      { width: 1512, height: 982, note: 'MBP' },
      { width: 1536, height: 864, note: 'FHD@125% · cổng 2xl:' },
    ],
  },
  {
    id: 'laptop-16',
    label: 'Laptop 16"',
    gate: '2xl:max-wide:',
    viewports: [
      { width: 1536, height: 960, note: '1920×1200@125%' },
      { width: 1600, height: 900 },
      { width: 1680, height: 1050 },
      { width: 1728, height: 1117, note: 'MBP' },
      { width: 1792, height: 1120, note: 'còn dưới 1800' },
    ],
  },
  {
    id: 'external',
    label: 'Màn ngoài / TV',
    gate: 'wide: · tv:',
    viewports: [
      { width: 1920, height: 1080 },
      { width: 2560, height: 1440 },
      { width: 3840, height: 2160, note: 'chế độ TV' },
    ],
  },
];

/** Tám cỡ chọn nhanh trên thanh công cụ khung — một đại diện mỗi bậc quan trọng. */
export const DEMO_QUICK_VIEWPORTS: readonly DemoViewport[] = [
  { width: 360, height: 800 },
  { width: 390, height: 844 },
  { width: 768, height: 1024 },
  { width: 820, height: 1180 },
  { width: 1024, height: 768 },
  { width: 1280, height: 720 },
  { width: 1536, height: 864 },
  { width: 1728, height: 1117 },
];

/**
 * Trang nạp vào khung. Mục "Thư viện UI" trỏ về chính `#responsive-lab` — trong khung, khu vực này tự
 * rút gọn còn số đo + chip nên đọc được ngay biến thể nào đang khớp ở cỡ khung (không lồng khung trong khung).
 */
export const DEMO_FRAME_TARGETS: readonly DemoFrameTarget[] = [
  { key: 'composed', label: 'Ghép thực tế', path: DEMO_SCREEN_PATHS.composed },
  { key: 'dashboard', label: 'Tổng quan', path: DEMO_SCREEN_PATHS.dashboard },
  {
    key: 'library',
    label: 'Số đo trong khung',
    path: `${DEMO_SCREEN_PATHS.library}#responsive-lab`,
  },
];

/**
 * Biến thể đối chiếu "đang khớp / không khớp". Query trùng điều kiện CSS: bậc bề rộng = mốc `breakpoints.css`
 * (`wide` 1800, `3xl` 1920); `phone` / `touch` / `max-wide` lấy từ `media-query.constants` — cùng nguồn với
 * `useIsPhone` / `useIsCoarsePointer` / `useIsBelowWide`.
 */
export const DEMO_VARIANT_PROBE_GROUPS: readonly DemoVariantProbeGroup[] = [
  {
    id: 'width',
    label: 'Bậc bề rộng',
    note: 'khớp khi rộng ≥ mốc — dùng cho chuyện hẹp chỗ',
    probes: [
      { label: 'sm:', query: '(min-width: 640px)' },
      { label: 'md:', query: '(min-width: 768px)' },
      { label: 'lg:', query: '(min-width: 1024px)' },
      { label: 'xl:', query: '(min-width: 1280px)' },
      { label: '2xl:', query: '(min-width: 1536px)' },
      { label: 'wide:', query: '(min-width: 1800px)' },
      { label: '3xl:', query: '(min-width: 1920px)' },
    ],
  },
  {
    id: 'gate',
    label: 'Cổng laptop',
    note: 'chỉnh cho laptop mà không đụng màn ngoài ≥ 1800',
    probes: [
      { label: 'max-wide:', query: BELOW_WIDE_QUERY },
      { label: 'xl:max-wide: (14")', query: `(min-width: 1280px) and ${BELOW_WIDE_QUERY}` },
      { label: '2xl:max-wide: (16")', query: `(min-width: 1536px) and ${BELOW_WIDE_QUERY}` },
    ],
  },
  {
    id: 'device',
    label: 'Thiết bị & chế độ',
    note: 'phone: = kích thước · touch: = ngón tay · tv: = chế độ TV',
    probes: [
      { label: 'phone:', query: PHONE_MEDIA_QUERY },
      { label: 'touch:', query: TOUCH_MEDIA_QUERY },
      { label: 'standalone:', query: '(display-mode: standalone)' },
    ],
  },
];
