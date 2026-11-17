/**
 * Hook dùng chung — luôn import qua '@/shared/hooks', KHÔNG import sâu.
 * Nhóm: `state/` (trạng thái, vòng đời) · `timing/` (debounce, nhịp đồng hồ, số chạy) · `url/` (query, href) ·
 * `dom/` (phần tử, clipboard, phóng toàn viewport) · `browser/` (mạng, media query, tab) · `input/` (bàn phím,
 * ô nhập) · `table/` (chọn dòng).
 */

export * from './state';
export * from './timing';
export * from './url';
export * from './dom';
export * from './browser';
export * from './input';
export * from './table';
