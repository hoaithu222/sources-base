import { appConfig } from '@/core/config';
import { PATHS } from '@/shared/constants/paths.constants';

import { flattenModule, type ModuleDef } from '../definition';

import { demoModule } from './demo.routes';
import { validateModules } from './validate-modules';

/**
 * MODULE_REGISTRY — nơi khai báo DUY NHẤT của mọi phân hệ; route, Dock, bảng lệnh, tên tab và
 * guard quyền đều dựng từ đây.
 *
 * Dùng:   1. tạo `modules/{id}.routes.ts` export một `ModuleDef` (chép `demo.routes.ts`)
 *         2. thêm nó vào mảng `MODULE_REGISTRY` bên dưới
 * Lưu ý:  tắt phân hệ theo cờ: `...(flag ? [xModule] : [])`. Mẫu đầy đủ + luật:
 *         docs/rules/structure/routing-conventions.md
 */

export const MODULE_REGISTRY: readonly ModuleDef[] = [...(appConfig.isDemo ? [demoModule] : [])];

if (import.meta.env.DEV) validateModules(MODULE_REGISTRY, Object.values(PATHS));

const ROUTE_PATH_BY_ID: ReadonlyMap<string, string> = new Map(
  MODULE_REGISTRY.flatMap(flattenModule).flatMap(({ def, path }) =>
    def.id ? [[def.id, path] as const] : [],
  ),
);

/**
 * Path đầy đủ của phân hệ / route con có `id` đó; `undefined` khi phân hệ không đăng ký ở chế độ
 * đang chạy. Segment động: `generatePath(path, { id })`.
 */
export function getRoutePath(id: string): string | undefined {
  return ROUTE_PATH_BY_ID.get(id);
}
