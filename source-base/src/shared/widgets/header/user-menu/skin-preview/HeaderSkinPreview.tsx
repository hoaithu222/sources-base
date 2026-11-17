import { memo } from 'react';

import { cn } from '@/shared/utils/style/cn';

import type { HeaderSkin } from '../../header-skin.store';
import { HEADER_SLOT_CLASSES } from '../../header.theme';
import { HEADER_SKIN_SPECS } from '../../page-header/header-skin.theme';
import {
  PAGE_HEADER_NAV_SLANT,
  PAGE_HEADER_SIDE_CLASSES,
  PAGE_HEADER_SIDED_CLASSES,
  PAGE_HEADER_SLOT_CLASSES,
  plateToneStyle,
  type PageHeaderSide,
} from '../../page-header/page-header.theme';
import { PAGE_NAV_SLOT_CLASSES } from '../../page-header/page-nav.theme';
import PageHeaderChip from '../../page-header/parts/chip/page-header-chip';
import NavShelf from '../../page-header/parts/nav-shelf';
import PlateDecor from '../../page-header/parts/plate-decor';
import { HeaderSkinOverrideContext } from '../../page-header/shapes/skin-override.context';
import { SKIN_PREVIEW_CLASSES } from './skin-preview.theme';

interface PreviewNavProps {
  side: PageHeaderSide;
  tabs: number;
}

/** Ô nav của ảnh xem trước: dải chip (chữ là vạch) + thanh khay nếu kiểu có — cùng cấu trúc `PageHeaderNav`, chip đầu của dải trái đang bật. */
function PreviewNav({ side, tabs }: PreviewNavProps) {
  const slant = PAGE_HEADER_NAV_SLANT[side];

  return (
    <span className={cn(PAGE_HEADER_SLOT_CLASSES.navCell, PAGE_HEADER_SIDE_CLASSES[side].navCell)}>
      <span className={PAGE_NAV_SLOT_CLASSES.root}>
        {Array.from({ length: tabs }, (_, index) => (
          <PageHeaderChip key={index} active={side === 'left' && index === 0} slant={slant}>
            <span className={SKIN_PREVIEW_CLASSES.tabBar} />
          </PageHeaderChip>
        ))}
        <NavShelf side={side} slant={slant} />
      </span>
    </span>
  );
}

/**
 * HeaderSkinPreview — ảnh xem trước MỘT kiểu khung header trong menu "Kiểu header": lát thanh header thu 50% gồm hai tab bên trái (tab đầu
 * đang bật), bảng tên ở giữa, một tab bên phải. Dựng bằng chính `PageHeaderChip` / `PlateDecor` / `NavShelf` với kiểu ghi đè qua
 * `HeaderSkinOverrideContext` — nên mọi thay đổi cấu hình kiểu tự có mặt ở đây, không có bản vẽ riêng để lệch.
 *
 * Lưu ý: thuần trang trí — `aria-hidden` + `inert` (chip bên trong là `<button>`, không được nhận focus / click); chữ thay bằng vạch nên
 * dòng menu giữ nguyên tên truy cập. `data-skin-preview` chỉ để test.
 *
 * @param props.skin - Kiểu khung cần vẽ.
 *
 * @example
 * <HeaderSkinPreview skin="tray-flip" />
 */
const HeaderSkinPreview = memo(function HeaderSkinPreview({ skin }: { skin: HeaderSkin }) {
  const plateClassName = cn(PAGE_HEADER_SLOT_CLASSES.plate, PAGE_HEADER_SIDED_CLASSES.sided.plate);

  return (
    <span aria-hidden className={SKIN_PREVIEW_CLASSES.frame} data-skin-preview={skin} inert>
      <HeaderSkinOverrideContext.Provider value={skin}>
        <span
          className={cn(SKIN_PREVIEW_CLASSES.stage, HEADER_SKIN_SPECS[skin].vars)}
          style={plateToneStyle('sky')}
        >
          <span className={HEADER_SLOT_CLASSES.rail} />
          <span className={SKIN_PREVIEW_CLASSES.cluster}>
            <PreviewNav side="left" tabs={2} />
            <span className={plateClassName}>
              <PlateDecor tone="sky" />
              <span className={SKIN_PREVIEW_CLASSES.plateText}>
                <span className={SKIN_PREVIEW_CLASSES.plateTitle} />
                <span className={SKIN_PREVIEW_CLASSES.plateSubtitle} />
              </span>
            </span>
            <PreviewNav side="right" tabs={1} />
          </span>
        </span>
      </HeaderSkinOverrideContext.Provider>
    </span>
  );
});

export default HeaderSkinPreview;
