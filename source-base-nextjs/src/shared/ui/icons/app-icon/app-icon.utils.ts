import type { SystemIconName } from '../index';
import { VCI_ICONS, type VciIconName } from '../vci-icon';

/** Tên icon nhận diện: bộ VCI (`'finance'`…) hoặc icon hệ thống (`'wallet-bold'`…) — hai tập không trùng tên. */
export type AppIconName = SystemIconName | VciIconName;

/** `true` khi tên thuộc bộ icon VCI (tên hệ thống luôn có đuôi `-bold` / `-outline`). */
export const isVciIconName = (name: AppIconName): name is VciIconName => name in VCI_ICONS;
