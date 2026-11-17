import { memo } from 'react';

import { cn } from '@/shared/utils/style/cn';

import { useHeaderSkinSpec } from '../header-skin.theme';
import type { PageHeaderSide } from '../page-header.theme';
import type { PageHeaderChipSlant } from '../page-nav.theme';
import {
  PAGE_NAV_SHELF_CLASSES,
  PAGE_NAV_SHELF_LINE_CLASSES,
  PAGE_NAV_SHELF_ORNAMENT_CLASSES,
  type PageNavShelfLine,
} from '../shapes/shelf.theme';

interface NavShelfProps {
  side: PageHeaderSide;
  slant: PageHeaderChipSlant;
}

/**
 * NavShelf — thanh khay của họ kiểu "khay" (`HEADER_SKIN_SPECS[skin].nav.shelf`): dải nền + đường ngang bẻ ra từ bảng tên, phủ trên đầu
 * nhóm tab. Đặt làm con CUỐI của dải chip (`PAGE_NAV_SLOT_CLASSES.root`, `relative`) nên bề ngang = dải chip, dài theo số tab. Kiểu
 * khác trả `null`. Phần nội bộ của `PageHeaderNav` (và ảnh xem trước kiểu ở menu).
 *
 * Lưu ý: thuần trang trí (`aria-hidden`, `pointer-events-none`); `data-shelf` chỉ để test / đo. Vật trang trí (`nav.ornament`) nằm
 * TRONG thanh (ô nav bên phải vẽ đè lên bảng tên theo thứ tự DOM, nên không đặt ở bảng tên được). Lớp ở `shapes/shelf.theme.ts`.
 *
 * @param props.side - Ô nav chứa thanh: `left` | `right` bảng tên.
 * @param props.slant - Hướng nghiêng của dải chip (cũng là phía neo của thanh).
 *
 * @example
 * <span className={PAGE_NAV_SLOT_CLASSES.root}>{chips}<NavShelf side="left" slant="left" /></span>
 */
const NavShelf = memo(function NavShelf({ side, slant }: NavShelfProps) {
  const nav = useHeaderSkinSpec().nav;
  if (nav?.shelf !== true) return null;

  const line: PageNavShelfLine =
    nav.double === true ? 'double' : nav.dashed === true ? 'dashed' : 'solid';
  const ornament = nav.ornament;

  return (
    <span
      aria-hidden
      className={cn(
        PAGE_NAV_SHELF_CLASSES.root,
        PAGE_NAV_SHELF_CLASSES[slant],
        PAGE_NAV_SHELF_LINE_CLASSES[line],
      )}
      data-shelf={side}
    >
      {ornament !== undefined && (
        <span
          className={cn(
            PAGE_NAV_SHELF_ORNAMENT_CLASSES.root,
            PAGE_NAV_SHELF_ORNAMENT_CLASSES[slant],
          )}
          data-ornament={ornament}
        >
          {PAGE_NAV_SHELF_ORNAMENT_CLASSES[ornament][slant].map((className) => (
            <span key={className} className={className} />
          ))}
        </span>
      )}
    </span>
  );
});

export default NavShelf;
