import { memo } from 'react';

import type { ThemePreference } from '@/domains/preferences';
import { cn } from '@/shared/utils/style/cn';

type ThumbSkin = 'light' | 'dark';
type ThumbPart = 'page' | 'bar' | 'panel' | 'line';

/**
 * Màu cửa sổ thu nhỏ — thanh header đọc `primary` nên đổi Màu nhấn là ảnh đổi theo ngay. Ảnh Tối đặt class `dark` ở gốc
 * để token (`bg-page`, `bg-surface`, `border-strong`) lật về bảng màu tối THẬT dù trang đang hiện theme nào.
 */
const THUMB_SKIN_CLASSES = {
  light: {
    page: 'bg-neutral-1',
    bar: 'bg-linear-to-r from-primary-5 to-primary-7',
    panel: 'bg-neutral-0',
    line: 'bg-neutral-4',
  },
  dark: {
    page: 'dark bg-bg-page',
    bar: 'bg-linear-to-r from-primary-6 to-primary-8',
    panel: 'bg-bg-surface',
    line: 'bg-border-strong',
  },
} satisfies Record<ThumbSkin, Record<ThumbPart, string>>;

/** Nửa tối của ảnh "Tự động" — cắt chéo như ảnh Auto của macOS. */
const THUMB_AUTO_CLIP = '[clip-path:polygon(58%_0,100%_0,100%_100%,42%_100%)]';

function ThumbWindow({ skin, className }: { skin: ThumbSkin; className?: string }) {
  const parts = THUMB_SKIN_CLASSES[skin];
  return (
    <span className={cn('absolute inset-0 flex flex-col gap-1 p-1', parts.page, className)}>
      <span className={cn('h-1.5 shrink-0 rounded-xs', parts.bar)} />
      <span className="flex min-h-0 flex-1 gap-1">
        <span className={cn('w-3 rounded-xs', parts.panel)} />
        <span className={cn('flex flex-1 flex-col gap-1 rounded-xs p-1', parts.panel)}>
          <span className={cn('h-1 w-3/4 rounded-full', parts.line)} />
          <span className={cn('h-1 w-1/2 rounded-full', parts.line)} />
        </span>
      </span>
    </span>
  );
}

/**
 * ThemeThumb — ảnh cửa sổ thu nhỏ cho ô chọn Giao diện (`ChoiceTiles`) ở trang Cài đặt: Sáng · Tối · Tự động (cắt chéo
 * hai nửa). Vẽ bằng token, không ảnh bitmap — đổi màu nhấn là ảnh tự khớp; ảnh Tối luôn là bảng màu tối thật (bo góc
 * như cửa sổ macOS) kể cả khi trang đang sáng.
 *
 * @param props.mode - `light` | `dark` | `system`.
 *
 * @example
 * <ChoiceTiles options={[{ value: 'light', label: 'Sáng', preview: <ThemeThumb mode="light" /> }]} … />
 */
const ThemeThumb = memo(function ThemeThumb({ mode }: { mode: ThemePreference }) {
  if (mode !== 'system') return <ThumbWindow skin={mode} />;
  return (
    <>
      <ThumbWindow skin="light" />
      <ThumbWindow className={THUMB_AUTO_CLIP} skin="dark" />
    </>
  );
});

export default ThemeThumb;
