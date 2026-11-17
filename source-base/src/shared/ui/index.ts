/**
 * UI kit: import component và kiểu từ '@/shared/ui'; mỗi nhóm chức năng có barrel riêng.
 * SystemIcon là ngoại lệ: import từ '@/shared/ui/icons/Icons' để không kéo registry qua barrel.
 * SystemIconName chỉ là kiểu, được export ở đây; registry sinh bằng npm run generate:icons.
 */

export * from './primitives';
export * from './feedback';
export * from './actions';
export * from './inputs';
export * from './selects';
export * from './pickers';
export * from './overlays';
export * from './navigation';
export * from './data-display';
export * from './surfaces';
export * from './media';
export * from './layout';
export * from './form';
export * from './icons/gem-icon';
export type { SystemIconName } from './icons';
export type { BoldSystemIconName, SystemIconProps } from './icons/Icons';
