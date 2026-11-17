import { memo } from 'react';

import type { TitleIconColor } from '@/shared/ui';
import { cn } from '@/shared/utils/style/cn';

import { useHeaderSkinSpec } from '../header-skin.theme';
import {
  PAGE_HEADER_FLANK_SEGMENT_CLASSES,
  PAGE_HEADER_SIDE_CLASSES,
  PAGE_HEADER_SLOT_CLASSES,
} from '../page-header.theme';
import {
  PLATE_HANDLE_CLASS,
  PLATE_MARK_CLASSES,
  PLATE_SHAPE_CLASSES,
} from '../shapes/plate-shapes.theme';

const FLANK_SIDES = ['left', 'right'] as const;

interface PlateDecorProps {
  tone: TitleIconColor;
  /** Bảng tên có ô nav (thanh khay) bên cạnh: viền bị che từ đường khay. `false` (trang không tab) → viền vẽ liền thẳng lên mép trên. Mặc định `true`. */
  shelved?: boolean;
}

/**
 * PlateDecor — mọi lớp NỀN / TRANG TRÍ của bảng tên (nằm dưới chữ, `-z-10`): viền + thân, dấu nhấn góc, đường kẻ dọc, vạch
 * sáng hai bên (cụm gạch–chấm), ray đáy + núm sáng. Phần nội bộ của `PageHeaderTitle`; mỗi lớp bật / tắt theo `HEADER_SKIN_SPECS[skin].plate`.
 * Kiểu đặc: chân bảng tên là vạch tông màu 2px phủ trọn bề ngang (cùng chân 2px của chip), không có ray mờ dần + quầng.
 *
 * Lưu ý: đọc `--plate-tone` từ phần tử cha (`PageHeaderTitle` đặt); mọi lớp `aria-hidden` + `pointer-events-none`. Kiểu không
 * khung (`bare`) không vẽ viền / thân — chỉ còn đường kẻ dọc + ray đáy.
 *
 * @param props.tone - Tông màu bảng tên (chỉ để vẽ ray đáy bằng gradient; các lớp khác đọc `--plate-tone`).
 * @param props.shelved - Có thanh khay bên cạnh (trang có tab) → viền chỉ vẽ từ đường khay xuống. Mặc định `true`.
 *
 * @example
 * <PlateDecor tone="sky" />
 */
const PlateDecor = memo(function PlateDecor({ tone, shelved = true }: PlateDecorProps) {
  const spec = useHeaderSkinSpec();
  const plate = spec.plate;
  /** Có thanh khay BÊN CẠNH: viền chỉ vẽ TỪ đường khay xuống — phía trên là nền liền với thanh khay. Không có (không tab) → viền liền thẳng lên mép trên. */
  const capped = shelved && spec.nav?.shelf === true;
  const solid = plate.look === 'solid';
  /** Trang không tab: hình riêng `solo` (cạnh nghiêng thẳng từ mép trên) nếu kiểu khai; còn lại dùng `shape`. */
  const shape = shelved ? plate.shape : (plate.solo ?? plate.shape);
  const shapeClassName = PLATE_SHAPE_CLASSES[shape];
  const railClassName = cn(PAGE_HEADER_SLOT_CLASSES.plateRail, PAGE_HEADER_SLOT_CLASSES.railGlow);
  const handleClassName = cn(PAGE_HEADER_SLOT_CLASSES.plateHandle, PLATE_HANDLE_CLASS);
  /** Rãnh chữ V cần thân chạm đáy (không thụt 1px) — thụt theo chiều dọc làm hai cạnh chéo của rãnh dày mỏng lệch nhau. */
  const bgFlush = ['chevron', 'hang', 'lean', 'leanVee'].includes(shape);
  /** Hình solo kéo cạnh chéo lên mép trên nên lấn ra ngoài hộp `--plate-ext`: nới viền ra đúng chừng đó, thân thụt 1px như thường. */
  const extended = shape === 'lean' || shape === 'leanVee';

  return (
    <>
      {plate.shape !== 'bare' && !solid && (
        <>
          <span
            aria-hidden
            className={cn(
              PAGE_HEADER_SLOT_CLASSES.plateEdge,
              capped && PAGE_HEADER_SLOT_CLASSES.plateEdgeCapped,
              shapeClassName,
              extended && 'inset-x-[calc(var(--plate-ext)*-1)]',
            )}
          />
          <span
            aria-hidden
            className={cn(
              PAGE_HEADER_SLOT_CLASSES.plateBg,
              bgFlush && 'bottom-0',
              shapeClassName,
              extended && 'inset-x-[calc(1px-var(--plate-ext))]',
            )}
          />
        </>
      )}
      {plate.shape !== 'bare' && solid && (
        <>
          <span aria-hidden className={cn(PAGE_HEADER_SLOT_CLASSES.plateBgSolid, shapeClassName)} />
          <span aria-hidden className={PAGE_HEADER_SLOT_CLASSES.plateTopBar} />
        </>
      )}
      {PLATE_MARK_CLASSES[plate.mark].map((markClassName) => (
        <span
          key={markClassName}
          aria-hidden
          className={cn(PAGE_HEADER_SLOT_CLASSES.plateMark, markClassName)}
        />
      ))}
      {plate.rules && (
        <>
          <span
            aria-hidden
            className={cn(
              PAGE_HEADER_SLOT_CLASSES.plateRule,
              PAGE_HEADER_SIDE_CLASSES.left.plateRule,
            )}
          />
          <span
            aria-hidden
            className={cn(
              PAGE_HEADER_SLOT_CLASSES.plateRule,
              PAGE_HEADER_SIDE_CLASSES.right.plateRule,
            )}
          />
        </>
      )}
      {plate.flank &&
        FLANK_SIDES.map((side) => (
          <span
            key={side}
            aria-hidden
            className={cn(
              PAGE_HEADER_SLOT_CLASSES.plateFlank,
              PAGE_HEADER_SIDE_CLASSES[side].flank,
            )}
          >
            {PAGE_HEADER_FLANK_SEGMENT_CLASSES.map((segmentClassName) => (
              <span key={segmentClassName} className={segmentClassName} />
            ))}
          </span>
        ))}
      {solid ? (
        <span aria-hidden className={PAGE_HEADER_SLOT_CLASSES.plateRailSolid} />
      ) : (
        <span
          aria-hidden
          className={railClassName}
          style={{
            background: `linear-gradient(to right, transparent, var(--color-${tone}-5), transparent)`,
          }}
        />
      )}
      {plate.handle && <span aria-hidden className={handleClassName} />}
    </>
  );
});

export default PlateDecor;
