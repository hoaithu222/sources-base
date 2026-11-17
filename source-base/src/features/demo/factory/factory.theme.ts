import { cn } from '@/shared/utils/style/cn';

/**
 * Bảng class bố cục của màn `/demo/xuong` ("Gia công") — MỘT chỗ khai lưới, chiều cao từng panel và sơ đồ xưởng.
 *
 * Dùng:   <div className={FACTORY_MAIN_GRID_CLASSES}><PanelCard className={FACTORY_PANEL_SLOT_CLASSES.plan} …/></div>
 * Sửa:    lưới chính 3 cột (biểu đồ · sơ đồ · cảnh báo) → FACTORY_MAIN_GRID_CLASSES · hàng dưới → FACTORY_BOTTOM_GRID_CLASSES
 *         · từng panel → FACTORY_PANEL_SLOT_CLASSES · sơ đồ xưởng → FACTORY_SCENE_CLASSES
 * Lưu ý:  từ `xl` hai lưới CHIA chiều cao còn lại theo `flex-[11]` : `flex-[5]` nên trang vừa một màn 1080p; dưới `xl`
 *         panel cao cố định, xếp 1–2 cột và `<PageBody>` cuộn. Sàn `xl:min-h-*` để màn thấp thì cuộn thay vì bóp panel.
 */

export type FactoryPanelSlot =
  'plan' | 'share' | 'scene' | 'notices' | 'equipment' | 'steel' | 'remain';

type FactorySceneSlot =
  | 'root'
  | 'glow'
  | 'grid'
  | 'plane'
  | 'zone'
  | 'zoneLabel'
  | 'overview'
  | 'stat'
  | 'statIcon'
  | 'statValue'
  | 'statLabel';

export const FACTORY_KPI_STRIP_CLASSES =
  'grid shrink-0 grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-4';

export const FACTORY_MAIN_GRID_CLASSES = cn(
  'grid shrink-0 grid-cols-1 gap-2 md:grid-cols-2',
  'xl:min-h-[34rem] xl:flex-[11] xl:grid-cols-[minmax(0,1.2fr)_minmax(0,1.6fr)_minmax(0,1.2fr)] xl:grid-rows-2',
);

export const FACTORY_BOTTOM_GRID_CLASSES =
  'grid shrink-0 grid-cols-1 gap-2 xl:min-h-56 xl:flex-[5] xl:grid-cols-2';

export const FACTORY_PANEL_SLOT_CLASSES = {
  plan: 'h-80 xl:col-start-1 xl:row-start-1 xl:h-auto',
  share: 'h-72 xl:col-start-1 xl:row-start-2 xl:h-auto',
  scene:
    'h-[28rem] md:col-span-2 xl:col-span-1 xl:col-start-2 xl:row-span-2 xl:row-start-1 xl:h-auto',
  notices: 'h-80 xl:col-start-3 xl:row-start-1 xl:h-auto',
  equipment: 'h-72 xl:col-start-3 xl:row-start-2 xl:h-auto',
  steel: 'h-64 xl:h-auto',
  remain: 'h-64 xl:h-auto',
} satisfies Record<FactoryPanelSlot, string>;

/**
 * Sơ đồ xưởng 2.5D: mặt sàn lưới nghiêng `perspective` + các khu là ô viền sáng; nhãn ghim (`HudCallout`) và dải tổng
 * quan (4 ô, mép trên — vùng trống phía xa của sàn) nằm NGOÀI mặt nghiêng nên chữ không méo. Lưới sàn + quầng chỉ ở theme tối; sáng là sàn xám nhạt kẻ ô mảnh.
 */
export const FACTORY_SCENE_CLASSES = {
  root: cn(
    'relative isolate h-full min-h-0 overflow-hidden',
    'bg-bg-subtle dark:bg-[radial-gradient(80%_70%_at_50%_60%,color-mix(in_srgb,var(--color-sky-6)_22%,transparent),transparent_70%)]',
  ),
  glow: cn(
    'pointer-events-none absolute inset-x-0 bottom-0 -z-10 hidden h-1/2 dark:block',
    'bg-linear-to-t from-primary-5/10 to-transparent',
  ),
  grid: cn(
    'pointer-events-none absolute inset-[-20%_-10%_-6%] -z-10 [transform:perspective(900px)_rotateX(58deg)]',
    'bg-[linear-gradient(var(--color-divider-default)_1px,transparent_1px),linear-gradient(90deg,var(--color-divider-default)_1px,transparent_1px)]',
    '[background-size:36px_36px] dark:opacity-70',
  ),
  plane: cn(
    'absolute inset-x-[5%] top-[10%] bottom-[5%] grid grid-cols-8 grid-rows-4 gap-2.5',
    '[transform:perspective(1100px)_rotateX(36deg)] [transform-origin:50%_100%]',
  ),
  zone: cn(
    'relative flex items-end justify-start p-2',
    'border border-[color-mix(in_srgb,var(--zone-tone)_55%,transparent)]',
    'bg-[color-mix(in_srgb,var(--zone-tone)_10%,transparent)]',
    'dark:bg-[linear-gradient(180deg,color-mix(in_srgb,var(--zone-tone)_26%,transparent),color-mix(in_srgb,var(--zone-tone)_8%,transparent))]',
    'dark:shadow-[inset_0_0_24px_color-mix(in_srgb,var(--zone-tone)_25%,transparent),0_0_14px_color-mix(in_srgb,var(--zone-tone)_20%,transparent)]',
  ),
  zoneLabel: 'text-caption-10-medium uppercase tracking-[0.06em] text-fg-muted',
  overview: cn(
    'absolute inset-x-3 top-3 z-20 grid grid-cols-2 gap-px sm:grid-cols-4',
    'border border-sky-5/40 bg-sky-5/25 backdrop-blur-sm',
    'dark:shadow-[0_0_16px_color-mix(in_srgb,var(--color-sky-5)_22%,transparent)]',
  ),
  stat: 'flex min-w-0 items-center gap-2 bg-bg-surface/92 px-2.5 py-1.5',
  statIcon:
    'flex size-6 shrink-0 items-center justify-center text-info dark:text-sky-4 [&>svg]:size-4.5!',
  statValue: 'text-body-16-bold tabular-nums leading-tight text-fg-heading',
  statLabel: 'truncate text-caption-10-medium leading-tight text-fg-muted',
} satisfies Record<FactorySceneSlot, string>;

/** Biến màu khung khu `--zone-tone` — class literal mỗi tone (cùng bộ tone với `HudCallout`). */
export const FACTORY_ZONE_TONE_CLASSES = {
  sky: '[--zone-tone:var(--color-sky-5)]',
  primary: '[--zone-tone:var(--color-primary-5)]',
  teal: '[--zone-tone:var(--color-teal-5)]',
  yellow: '[--zone-tone:var(--color-yellow-5)]',
} as const;
