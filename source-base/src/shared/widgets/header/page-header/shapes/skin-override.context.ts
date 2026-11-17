import { createContext } from 'react';

import type { HeaderSkin } from '../../header-skin.store';

/**
 * skin-override.context.ts — cho MỘT nhánh cây dựng khung header theo kiểu KHÁC kiểu đang chọn trong store: dùng cho ảnh xem trước
 * từng kiểu ở menu "Kiểu header" (`user-menu/skin-preview/`). `useHeaderSkinSpec()` đọc context này TRƯỚC store.
 *
 * Dùng:   <HeaderSkinOverrideContext.Provider value="hex">…chip · bảng tên…</HeaderSkinOverrideContext.Provider>
 * Lưu ý:  ⛔ Chỉ ảnh xem trước dùng — thanh header thật luôn đọc store. Giá trị `null` (mặc định) = không ghi đè.
 */
export const HeaderSkinOverrideContext = createContext<HeaderSkin | null>(null);
