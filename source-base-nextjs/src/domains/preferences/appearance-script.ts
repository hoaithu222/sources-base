import {
  DISPLAY_PARAM,
  DISPLAY_STORAGE,
  SCALE_PARAM,
  UI_SCALE_VALUES,
} from './display/display.constants';
import { ACCENT_COLORS, THEME_STORAGE } from './theme/theme.constants';

/**
 * appearanceInitScript — chuỗi JS chạy ĐỒNG BỘ trong `<head>`, TRƯỚC lần vẽ đầu tiên: áp theme · TV · màu nhấn · cỡ chữ
 * đã lưu lên `<html>` để trang không nháy sáng → tối khi mới mở (server không biết localStorage của người dùng).
 *
 * Dùng:   <script dangerouslySetInnerHTML={{ __html: appearanceInitScript() }} />  ở `app/[locale]/layout.tsx`,
 *         `<html suppressHydrationWarning>` vì script đổi class / style của chính `<html>`.
 * Lưu ý:  PHẢI khớp `applyAppearance` (`app/_providers/appearance`) — `tests/app/_providers/appearance.test.tsx` chạy script và so kết
 *         quả. Đọc đúng khoá của hai store (`THEME_STORAGE`, `DISPLAY_STORAGE`), URL `?display` / `?scale` thắng giá trị đã lưu.
 *         Mọi lỗi (JSON hỏng, localStorage bị chặn) nuốt im — mặc định là giao diện sáng. Chỉ import hằng số, KHÔNG import
 *         store: file này được Server Component nạp.
 */

export function appearanceInitScript(): string {
  const config = {
    themeKey: THEME_STORAGE.key,
    displayKey: DISPLAY_STORAGE.key,
    displayParam: DISPLAY_PARAM,
    scaleParam: SCALE_PARAM,
    scales: UI_SCALE_VALUES,
    accents: ACCENT_COLORS,
  };

  return `(function(c){try{
var d=document.documentElement;
function read(k){try{var r=localStorage.getItem(k);return r?(JSON.parse(r).state||{}):{}}catch(e){return{}}}
var t=read(c.themeKey),s=read(c.displayKey),q=new URLSearchParams(location.search);
var m=q.get(c.displayParam);if(m!=='tv'&&m!=='standard')m=s.mode;
var u=Number(q.get(c.scaleParam));if(c.scales.indexOf(u)<0)u=s.uiScale;if(c.scales.indexOf(u)<0)u=c.scales[0];
var tv=m==='tv',ui=tv?u:1;
var dark=tv||t.theme==='dark'||(t.theme==='system'&&matchMedia('(prefers-color-scheme: dark)').matches);
d.classList.toggle('dark',dark);d.classList.toggle('tv',tv);
if(t.accent&&t.accent!=='vci'&&c.accents.indexOf(t.accent)>=0)d.dataset.accent=t.accent;
d.style.setProperty('--ui-scale',String(ui));d.style.setProperty('--lh-scale',String(1+(ui-1)*0.5));
}catch(e){}})(${JSON.stringify(config)})`;
}
