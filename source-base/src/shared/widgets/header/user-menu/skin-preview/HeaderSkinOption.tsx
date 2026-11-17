import { memo } from 'react';

import type { HeaderSkin } from '../../header-skin.store';
import { HEADER_SKIN_LABEL } from '../user-menu.constants';
import HeaderSkinPreview from './HeaderSkinPreview';
import { SKIN_PREVIEW_CLASSES } from './skin-preview.theme';

/**
 * HeaderSkinOption — nhãn của MỘT dòng chọn kiểu khung trong submenu "Kiểu header": ảnh xem trước + tên kiểu. Truyền làm `label` của
 * `MenuOption` (kit `Menu` nhận `ReactNode`); tên truy cập của dòng chỉ là tên kiểu vì ảnh `aria-hidden`.
 *
 * @param props.skin - Kiểu khung của dòng.
 *
 * @example
 * { key: 'skin:hex', label: <HeaderSkinOption skin="hex" />, checked: false }
 */
const HeaderSkinOption = memo(function HeaderSkinOption({ skin }: { skin: HeaderSkin }) {
  return (
    <span className={SKIN_PREVIEW_CLASSES.option}>
      <HeaderSkinPreview skin={skin} />
      <span>{HEADER_SKIN_LABEL[skin]}</span>
    </span>
  );
});

export default HeaderSkinOption;
