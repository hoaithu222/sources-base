import {
  HUD_ACTIVE_FILL,
  HUD_BRACKETS_AFTER,
  HUD_BRACKETS_BEFORE,
  HUD_FOCUS_GLOW,
  HUD_FOCUS_GLOW_ERROR,
  HUD_HOVER_GLOW,
  HUD_LIT_FILL,
  HUD_PANEL_FILL,
  HUD_ROW_HIGHLIGHT,
  HUD_SOLID_PRIMARY,
  HUD_TOP_RAIL_AFTER,
} from '@/shared/ui';

/** Một ô mẫu của mục "Công thức HUD": tên hằng · class ghép lên ô · dùng ở đâu. */
export interface DemoHudRecipe {
  name: string;
  className: string;
  usage: string;
}

/** Công thức "mặt / khung" — mỗi hằng một ô; tên khớp đúng export của `hud.theme.ts`. */
export const DEMO_HUD_SURFACE_RECIPES: readonly DemoHudRecipe[] = [
  {
    name: 'HUD_LIT_FILL',
    className: HUD_LIT_FILL,
    usage: 'Mặt control có viền: ô nhập, nút viền, segment',
  },
  {
    name: 'HUD_PANEL_FILL',
    className: HUD_PANEL_FILL,
    usage: 'Mặt khung lớn: Surface, panel, lớp nổi',
  },
  {
    name: 'HUD_HOVER_GLOW',
    className: HUD_HOVER_GLOW,
    usage: 'Rê chuột vào ô này — viền sáng + quầng trong',
  },
  {
    name: 'HUD_FOCUS_GLOW',
    className: HUD_FOCUS_GLOW,
    usage: 'Focus / đang mở: vòng 1px + quầng trong và ngoài',
  },
  { name: 'HUD_FOCUS_GLOW_ERROR', className: HUD_FOCUS_GLOW_ERROR, usage: 'Cùng hình, tông lỗi' },
  {
    name: 'HUD_ACTIVE_FILL',
    className: HUD_ACTIVE_FILL,
    usage: 'Ô đang bật: ngày chọn, trang hiện tại, segment',
  },
  {
    name: 'HUD_SOLID_PRIMARY',
    className: HUD_SOLID_PRIMARY,
    usage: 'Khối đặc primary: nút chính, huy hiệu đếm',
  },
  {
    name: 'HUD_ROW_HIGHLIGHT',
    className: HUD_ROW_HIGHLIGHT,
    usage: 'Hàng đang trỏ / đang chọn của danh sách',
  },
];

/** Công thức "trang trí" chiếm một pseudo-element — ô mẫu cần `relative`. */
export const DEMO_HUD_DECOR_RECIPES: readonly DemoHudRecipe[] = [
  {
    name: 'HUD_BRACKETS_BEFORE',
    className: HUD_BRACKETS_BEFORE,
    usage: 'Ngoặc 4 góc ở ::before — khung vừa / lớn',
  },
  {
    name: 'HUD_BRACKETS_AFTER',
    className: HUD_BRACKETS_AFTER,
    usage: 'Cùng hình, ở ::after khi ::before đã bận',
  },
  {
    name: 'HUD_TOP_RAIL_AFTER',
    className: HUD_TOP_RAIL_AFTER,
    usage: 'Ray sáng mép trên: lớp nổi, thanh công cụ',
  },
];
