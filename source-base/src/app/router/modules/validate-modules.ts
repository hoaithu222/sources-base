import type { RoutePermission } from '@/domains/session';

import { findLandingEntry, flattenModule } from '../definition';
import type { ModuleDef, RouteEntry } from '../definition';

/**
 * validate-modules — kiểm tra khai báo phân hệ khi nạp registry (dev và test): cấu hình sai dừng app
 * ngay với thông báo chỉ đúng chỗ, thay vì thành một route chết.
 *
 * Dùng:   validateModules(MODULE_REGISTRY, Object.values(PATHS))
 *         findModuleProblems(…) → string[]  (dùng trong test)
 * Lưu ý:  danh sách luật kiểm: docs/rules/structure/routing-conventions.md §8. Mỗi luật là một hàm `checkXxx`
 *         chạy trên danh sách phẳng của `flattenModule`.
 */

/** Path phân hệ: tuyệt đối, tĩnh, không `/` ở cuối. */
const MODULE_PATH = /^\/[^/:*?#\s]+(\/[^/:*?#\s]+)*$/;
/** Path con: tương đối, không `/` ở đầu và cuối. */
const CHILD_PATH = /^[^/?#\s]+(\/[^/?#\s]+)*$/;

/** `/a/:id` và `/a/:slug` là cùng một mẫu với React Router. */
const patternOf = (path: string) => path.replace(/:[^/]+/g, ':');

const samePermission = (a: RoutePermission, b: RoutePermission) =>
  a.resource === b.resource && (a.action ?? 'view') === (b.action ?? 'view');

/** Vị trí của route trong thông báo lỗi: `phân hệ "report" › ":id" › index`. */
function whereOf({ def, parent }: RouteEntry): string {
  if (!parent) return `phân hệ "${def.id}"`;
  return `${whereOf(parent)} › ${def.index ? 'index' : `"${def.path}"`}`;
}

function pathProblemOf({ def, parent }: RouteEntry): string | undefined {
  if (!parent) {
    if (MODULE_PATH.test(def.path ?? '')) return undefined;
    return `path "${def.path}" phải TUYỆT ĐỐI và tĩnh — bắt đầu bằng "/", không ":param", không "*", không "/" ở cuối`;
  }
  if (def.index || (typeof def.path === 'string' && CHILD_PATH.test(def.path))) return undefined;
  return (
    `path con phải TƯƠNG ĐỐI (vd "create", ":id") — không bắt đầu hay kết thúc bằng "/". ` +
    `Route nằm ngoài "${parent.path}" thì khai ở đúng cấp của nó`
  );
}

/** Path của route và mọi tầng cha đều hợp lệ — chỉ khi đó `entry.path` mới là URL thật. */
function hasValidPath(entry: RouteEntry): boolean {
  return !pathProblemOf(entry) && (!entry.parent || hasValidPath(entry.parent));
}

/** Lần khai đầu giữ chỗ; mỗi lần khai lại cùng `key` là một lỗi. */
function findDuplicates(
  claims: readonly { key: string; where: string; what: string }[],
  owners = new Map<string, string>(),
): string[] {
  return claims.flatMap(({ key, where, what }) => {
    const owner = owners.get(key);
    if (owner) return [`${what}: đã khai ở ${owner}, khai lại ở ${where}`];
    owners.set(key, where);
    return [];
  });
}

function checkIds(entries: readonly RouteEntry[]): string[] {
  return findDuplicates(
    entries.flatMap((entry) => {
      const { id } = entry.def;
      return id ? [{ key: id, where: whereOf(entry), what: `Trùng id "${id}"` }] : [];
    }),
  );
}

function checkPaths(entries: readonly RouteEntry[], reservedPaths: readonly string[]): string[] {
  const formatProblems = entries.flatMap((entry) => {
    const problem = pathProblemOf(entry);
    return problem ? [`${whereOf(entry)}: ${problem}`] : [];
  });
  const claims = entries
    .filter((entry) => entry.kind !== 'index' && hasValidPath(entry))
    .map((entry) => ({
      key: patternOf(entry.path),
      where: whereOf(entry),
      what: `Trùng path "${entry.path}"`,
    }));
  const reserved = new Map(reservedPaths.map((path) => [patternOf(path), `trang tĩnh "${path}"`]));

  return [...formatProblems, ...findDuplicates(claims, reserved)];
}

function checkShapes(entries: readonly RouteEntry[]): string[] {
  return entries.flatMap((entry) => {
    const { def } = entry;
    const where = whereOf(entry);
    if (Array.isArray(def.children) === Boolean(def.page)) {
      return [`${where}: phải có đúng một trong hai — "page" (trang) hoặc "children" (layout)`];
    }
    if (entry.parent && def.children?.length === 0) {
      return [`${where}: layout phải có ít nhất một route con`];
    }
    return [];
  });
}

function checkIndexPages(entries: readonly RouteEntry[]): string[] {
  return entries.flatMap((layout) => {
    const count = entries.filter(
      (entry) => entry.parent === layout && entry.kind === 'index',
    ).length;
    return count > 1 ? [`${whereOf(layout)}: có ${count} trang index — chỉ được một`] : [];
  });
}

function checkLanding(modules: readonly ModuleDef[]): string[] {
  return modules.flatMap((module) => {
    if (!MODULE_PATH.test(module.path) || findLandingEntry(module)) return [];

    const where = `phân hệ "${module.id}"`;
    const { landingPath } = module.meta;
    return landingPath === undefined
      ? [
          `${where}: không có trang index tại "${module.path}" — thêm { index: true, page } hoặc khai meta.landingPath`,
        ]
      : [`${where}: landingPath "${landingPath}" không trỏ tới route nào đã khai trong phân hệ`];
  });
}

function checkRedundantPermission(entries: readonly RouteEntry[]): string[] {
  return entries.flatMap((entry) => {
    const { permission } = entry.def;
    const parentPermissions = entry.parent?.permissions ?? [];
    if (!permission || !parentPermissions.some((granted) => samePermission(granted, permission)))
      return [];
    return [
      `${whereOf(entry)}: permission trùng với quyền cấp cha đã áp — bỏ đi, quyền vốn cộng dồn`,
    ];
  });
}

function checkDefaultTab(entries: readonly RouteEntry[]): string[] {
  return entries.flatMap((entry) => {
    const { meta } = entry.def;
    if (!meta?.defaultTab || meta.tabTitles?.[meta.defaultTab]) return [];
    return [`${whereOf(entry)}: defaultTab "${meta.defaultTab}" không có trong tabTitles`];
  });
}

/** Trả về danh sách lỗi (rỗng = hợp lệ). Hàm thuần — xem `validateModules` để ném lỗi. */
export function findModuleProblems(
  modules: readonly ModuleDef[],
  reservedPaths: readonly string[] = [],
): string[] {
  const entries = modules.flatMap(flattenModule);

  return [
    ...checkIds(entries),
    ...checkPaths(entries, reservedPaths),
    ...checkShapes(entries),
    ...checkIndexPages(entries),
    ...checkLanding(modules),
    ...checkRedundantPermission(entries),
    ...checkDefaultTab(entries),
  ];
}

/**
 * Ném lỗi liệt kê MỌI vấn đề của registry (không dừng ở lỗi đầu tiên).
 * @param reservedPaths Path đã có chủ ngoài registry (trang tĩnh) — phân hệ không được khai trùng.
 */
export function validateModules(
  modules: readonly ModuleDef[],
  reservedPaths: readonly string[] = [],
): void {
  const problems = findModuleProblems(modules, reservedPaths);
  if (problems.length === 0) return;

  throw new Error(
    `[module-registry] Khai báo phân hệ không hợp lệ:\n${problems.map((p) => `  • ${p}`).join('\n')}`,
  );
}
