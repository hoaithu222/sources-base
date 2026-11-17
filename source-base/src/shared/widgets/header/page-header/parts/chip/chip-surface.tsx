import { memo } from 'react';
import type { CSSProperties } from 'react';

import { cn } from '@/shared/utils/style/cn';

import { useHeaderSkinSpec, type ChipMark, type ChipShape } from '../../header-skin.theme';
import {
  chipPlacement,
  PAGE_NAV_ACTIVE_GLOW_CLASS,
  PAGE_NAV_BAR_CLASSES,
  PAGE_NAV_SLOT_CLASSES,
  PAGE_NAV_STATE_CLASSES,
  type PageHeaderChipSlant,
} from '../../page-nav.theme';
import { CHEVRON_TOWARD, chipClip, chipMarks } from '../../shapes/chip-shapes.theme';
import ChipTicks from './chip-ticks';

interface ChipSurfaceProps {
  slant: PageHeaderChipSlant;
  active: boolean;
}

const HEADER_BG = 'var(--header-bg, var(--color-bg-header-to))';

/** Xanh lá chủ đạo pha 28% ngọc — sắc "công nghệ" của chip đang bật, vẫn đọc ra màu thương hiệu. */
const HOT = 'color-mix(in srgb, var(--color-primary-5) 72%, var(--color-teal-5))';

/** Thân chip bật: ĐẶC (trộn vào `--header-bg` chứ không `transparent`), sáng dần từ đáy lên. */
const ACTIVE_FACE = `linear-gradient(to top,
  color-mix(in srgb, ${HOT} 88%, ${HEADER_BG}) 0%,
  color-mix(in srgb, ${HOT} 44%, ${HEADER_BG}) 50%,
  color-mix(in srgb, ${HOT} 12%, ${HEADER_BG}) 100%)`;

/** Thân KIỂU ĐẶC (`look: 'solid'`, không viền): nghỉ = nền thanh + 16% `hud`; bật = tô xanh đậm từ trên xuống (chữ trắng). */
const SOLID_FACE = `color-mix(in srgb, var(--color-hud-5) 16%, ${HEADER_BG})`;
const SOLID_ACTIVE_FACE =
  'linear-gradient(to bottom, var(--color-primary-5), var(--color-primary-7))';

/** Chùm sáng dưới chữ của chip bật ở kiểu KHÔNG khung: không viền bên dưới nên dùng nền xuyên thấu, tắt dần lên trên. */
const BARE_ACTIVE_FACE = `linear-gradient(to top, color-mix(in srgb, ${HOT} 34%, transparent), transparent 90%)`;

/** Viền chip bật: sáng đặc ở đáy, vẫn giữ 85% ở đỉnh — khung không hở nóc. */
const ACTIVE_EDGE = `linear-gradient(to top,
  var(--color-primary-3) 0%,
  color-mix(in srgb, var(--color-primary-4) 85%, transparent) 100%)`;

/**
 * Viền nghỉ NÉT: MỘT màu đặc 60% (không dốc mờ dần) — viền 1px mà nhạt dần về một đầu đọc ra là vệt nhoè. Viết bằng class
 * để `group-hover:` đổi sáng được ở cả hai theme.
 */
const IDLE_EDGE_CLASSES = 'bg-hud-5/60 group-hover:bg-hud-4';

/** Thân nghỉ ĐẶC (nền thanh + 10% `hud`): thân xuyên thấu để lộ viền bên dưới làm viền 1px lem sang phần thân. */
const IDLE_FACE = `color-mix(in srgb, var(--color-hud-5) 10%, ${HEADER_BG})`;

/**
 * Thân kiểu "Mũi tên": sáng dần về phía MŨI (phía bảng tên) — chip như được bảng tên chiếu sáng, mũi nhọn là chỗ sáng nhất.
 * Dải trái sáng sang phải, dải phải sáng sang trái.
 */
const chevronFace = (slant: PageHeaderChipSlant, active: boolean) =>
  active
    ? `linear-gradient(${CHEVRON_TOWARD[slant]}, color-mix(in srgb, ${HOT} 14%, ${HEADER_BG}), color-mix(in srgb, ${HOT} 74%, ${HEADER_BG}))`
    : `linear-gradient(${CHEVRON_TOWARD[slant]}, ${HEADER_BG}, color-mix(in srgb, var(--color-hud-5) 20%, ${HEADER_BG}))`;

/** Thân kiểu "Thẻ": sáng từ MÉP TRÊN xuống (như tab thư mục được chiếu từ trên), chân tối dần vào ray. */
const folderFace = (active: boolean) =>
  active
    ? `linear-gradient(to bottom, color-mix(in srgb, ${HOT} 62%, ${HEADER_BG}), color-mix(in srgb, ${HOT} 14%, ${HEADER_BG}))`
    : `linear-gradient(to bottom, color-mix(in srgb, var(--color-hud-5) 18%, ${HEADER_BG}), ${HEADER_BG})`;

/** Màu thân theo (hình × dấu nhấn × mặt × trạng thái): đặc / mũi tên + vát sáng (sáng dần về bảng tên) / thẻ / có viền (chip KHÔNG khung bật chỉ có chùm sáng). */
function faceBackground(
  shape: ChipShape,
  mark: ChipMark,
  solid: boolean,
  active: boolean,
  slant: PageHeaderChipSlant,
): string {
  if (solid) return active ? SOLID_ACTIVE_FACE : SOLID_FACE;
  if (shape === 'chevron' || mark === 'facet') return chevronFace(slant, active);
  if (shape === 'folder') return folderFace(active);
  return active ? ACTIVE_FACE : IDLE_FACE;
}

/**
 * ChipSurface — các lớp dựng hình khối của `PageHeaderChip` (nội bộ), theo cấu hình kiểu khung `HEADER_SKIN_SPECS[skin].chip`:
 * wrapper → `edge` (viền 1px; kiểu đặc không có) → `face` (thân ĐẶC, thụt 1px) → các dấu nhấn `corner` → vạch sáng đáy. Chip bật: vạch `bar`
 * đậm dần về giữa; chip nghỉ: vạch `barIdle` thu về 0, rê chuột thì nở ra từ tâm. `bar` không bị clip nên quầng toả ra
 * được. Kiểu đặc: chip nghỉ có CHÂN 2px (`foot`) luôn hiện để đứng chắc trên ray. Kiểu thang vạch: bốn vạch (`ChipTicks`) thay vạch đáy.
 * ⛔ KHÔNG có điểm sáng hình thoi xoay 45° — vài px mà xoay thì răng cưa thành dấu "*" ở màn DPR 1. Kiểu KHÔNG khung (`bare`)
 * không vẽ viền, chip bật chỉ có chùm sáng + vạch.
 * Lưu ý: đọc cấu hình từ store cục bộ (`useHeaderSkinSpec`); đổi kiểu = đổi bảng, không đổi cây DOM của chip.
 *
 * @param props.slant - Dải chip đứng (`left` | `right` bảng tên) — quyết định hướng của đa giác kiểu vát / mũi tên / nhãn / bậc thang.
 * @param props.active - Chip đang sáng (tab đang mở / chế độ đang bật).
 *
 * @example
 * <ChipSurface active slant="right" />
 */
const ChipSurface = memo(function ChipSurface({ slant, active }: ChipSurfaceProps) {
  const spec = useHeaderSkinSpec();
  const { shape, look, mark } = spec.chip;
  const clip = chipClip(shape, slant);
  const framed = shape !== 'bare';
  const solid = look === 'solid';
  const ticks = mark === 'ticks';
  const stateClasses = PAGE_NAV_STATE_CLASSES[active ? 'active' : 'idle'];
  const glow = active && !solid && shape !== 'box' && shape !== 'bare';

  const surfaceClassName = cn(PAGE_NAV_SLOT_CLASSES.surface, glow && PAGE_NAV_ACTIVE_GLOW_CLASS);
  const edgeClassName = cn(PAGE_NAV_SLOT_CLASSES.edge, !active && IDLE_EDGE_CLASSES);
  const faceClassName = cn(PAGE_NAV_SLOT_CLASSES.face, solid && 'inset-0');
  const cornerClassName = cn(PAGE_NAV_SLOT_CLASSES.corner, stateClasses.corner);
  const barClassName = cn(
    active ? PAGE_NAV_SLOT_CLASSES.bar : PAGE_NAV_SLOT_CLASSES.barIdle,
    PAGE_NAV_BAR_CLASSES[chipPlacement(shape, slant)],
  );

  const edgeStyle: CSSProperties = { clipPath: clip, ...(active && { background: ACTIVE_EDGE }) };
  const faceStyle: CSSProperties = {
    clipPath: clip,
    background: faceBackground(shape, mark, solid, active, slant),
  };

  return (
    <span aria-hidden className={surfaceClassName}>
      <span className={PAGE_NAV_SLOT_CLASSES.hit} style={{ clipPath: clip }} />
      {framed && !solid && <span className={edgeClassName} style={edgeStyle} />}
      {framed && <span className={faceClassName} style={faceStyle} />}
      {!framed && active && (
        <span className={PAGE_NAV_SLOT_CLASSES.face} style={{ background: BARE_ACTIVE_FACE }} />
      )}
      {chipMarks(mark, slant, active).map((polygon) => (
        <span key={polygon} className={cornerClassName} style={{ clipPath: polygon }} />
      ))}
      {ticks && <ChipTicks active={active} slant={slant} />}
      {solid && !active && <span className={PAGE_NAV_SLOT_CLASSES.foot} />}
      {!ticks && !(solid && !active) && <span className={barClassName} />}
    </span>
  );
});

export default ChipSurface;
