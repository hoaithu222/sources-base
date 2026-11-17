'use client';

import { memo, useMemo, useState } from 'react';
import type { KeyboardEvent } from 'react';
import { useTranslations } from 'next-intl';
import { Link, useRouter } from '@/core/i18n';

import { useImeSafeSearchInput } from '@/shared/hooks';
import { AppTile, Input } from '@/shared/ui';
import { SystemIcon } from '@/shared/ui/icons/Icons';
import { includesNormalized, normalizeSearch } from '@/shared/utils/format/string.utils';

import { MODULE_LAUNCHER_CLASSES } from '../module-nav.theme';
import type { HeaderModule, HeaderNavItem } from '../module-nav.types';
import { useRecentModulesStore } from '../recent-modules.store';
import ModuleLauncherCard from './module-launcher-card';

interface ModuleLauncherPanelProps {
  modules: readonly HeaderModule[];
  activeId?: string;
  shortcutLabel?: string;
  onNavigate: () => void;
}

interface MatchedModule {
  module: HeaderModule;
  screens: HeaderNavItem[];
  /** Khớp theo TÊN phân hệ (Enter → trang chủ phân hệ) thay vì theo một màn hình. */
  byModule: boolean;
}

/** Màn hình của phân hệ, bỏ trang chủ phân hệ (đầu thẻ đã là lối vào đó). */
const screensOf = (module: HeaderModule) =>
  (module.screens ?? []).filter((item) => item.href !== module.href);

/** Lọc màn theo ô tìm: nhóm khớp tên → giữ đủ con; không thì giữ con khớp. */
function filterScreens(items: readonly HeaderNavItem[], needle: string): HeaderNavItem[] {
  return items.flatMap((item) => {
    if (!item.children) return includesNormalized(item.label, needle) ? [item] : [];
    if (includesNormalized(item.label, needle)) return [item];
    const children = filterScreens(item.children, needle);
    return children.length > 0 ? [{ ...item, children }] : [];
  });
}

const firstLeaf = (items: readonly HeaderNavItem[]): HeaderNavItem | undefined =>
  items.map((item) => (item.children ? firstLeaf(item.children) : item)).find(Boolean);

function matchModules(modules: readonly HeaderModule[], search: string): MatchedModule[] {
  const needle = normalizeSearch(search);
  return modules.flatMap((module): MatchedModule[] => {
    const all = screensOf(module);
    if (!needle) return [{ module, screens: all, byModule: true }];
    const byModule = [module.title, module.subtitle, module.group].some((text) =>
      includesNormalized(text, needle),
    );
    if (byModule) return [{ module, screens: all, byModule }];
    const screens = filterScreens(all, needle);
    return screens.length > 0 ? [{ module, screens, byModule }] : [];
  });
}

/** Gom theo `group` (thiếu → `other`), GIỮ thứ tự xuất hiện đầu tiên (registry đã sắp theo `order`). */
function groupMatched(list: readonly MatchedModule[], other: string): [string, MatchedModule[]][] {
  const groups = new Map<string, MatchedModule[]>();
  for (const entry of list) {
    const key = entry.module.group ?? other;
    groups.set(key, [...(groups.get(key) ?? []), entry]);
  }
  return [...groups.entries()];
}

/**
 * ModuleLauncherPanel — bảng "TẤT CẢ PHÂN HỆ" (全部菜单 kiểu Kingdee / Alibaba Cloud) mở từ nút ⊞: ô tìm (bỏ dấu, an toàn
 * IME) tìm cả TÊN PHÂN HỆ lẫn TÊN MÀN HÌNH · hàng "Gần đây" · lưới thẻ phân hệ, mỗi thẻ liệt kê màn hình có icon — mọi màn
 * của mọi phân hệ cách hai chạm. Gõ rồi Enter: mở màn đầu tiên khớp (khớp tên phân hệ → trang chủ phân hệ).
 * Phần nội bộ của `ModuleSwitcher`.
 *
 * Sửa giao diện: `MODULE_LAUNCHER_CLASSES`. Mọi mục là `<Link>` thật — chuột phải / Ctrl+click mở tab mới.
 * Lưu ý: ô tìm KHÔNG controlled (`useImeSafeSearchInput` — `ime-safe-input.md`), so khớp qua `normalizeSearch`.
 *
 * @param props.modules - Phân hệ đã lọc quyền (kèm `screens`).
 * @param props.activeId - `id` phân hệ đang mở (đầu thẻ được tô).
 * @param props.shortcutLabel - Nhãn phím tắt bảng lệnh ở chân bảng (vd "Ctrl K"); bỏ trống → không hiện gợi ý.
 * @param props.onNavigate - Gọi khi bấm một mục (đóng popover).
 *
 * @example
 * <ModuleLauncherPanel modules={modules} activeId="kho-van" onNavigate={close} />
 */
const ModuleLauncherPanel = memo(function ModuleLauncherPanel({
  modules,
  activeId,
  shortcutLabel,
  onNavigate,
}: ModuleLauncherPanelProps) {
  const t = useTranslations('ui.widgets');
  const router = useRouter();
  const [search, setSearch] = useState('');
  const { inputProps } = useImeSafeSearchInput(search, setSearch);
  const recentIds = useRecentModulesStore((state) => state.ids);

  const matched = useMemo(() => matchModules(modules, search), [modules, search]);
  const otherGroup = t('header.launcher.otherGroup');
  const groups = useMemo(() => groupMatched(matched, otherGroup), [matched, otherGroup]);
  const recent = useMemo(
    () =>
      search
        ? []
        : recentIds.flatMap((id) =>
            modules.filter((module) => module.id === id && id !== activeId),
          ),
    [activeId, modules, recentIds, search],
  );
  const screenCount = modules.reduce((sum, module) => sum + screensOf(module).length, 0);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    const first = matched[0];
    if (e.key !== 'Enter' || e.nativeEvent.isComposing || !search || !first) return;
    e.preventDefault();
    const target = first.byModule ? first.module.href : firstLeaf(first.screens)?.href;
    router.push(target ?? first.module.href);
    onNavigate();
  };

  return (
    <div className={MODULE_LAUNCHER_CLASSES.panel}>
      <div className={MODULE_LAUNCHER_CLASSES.search}>
        <Input
          {...inputProps}
          aria-label={t('header.launcher.searchLabel')}
          autoFocus
          placeholder={t('header.launcher.searchPlaceholder')}
          size="sm"
          startIcon={<SystemIcon name="magnifying-glass-outline" size={14} />}
          onKeyDown={handleKeyDown}
        />
      </div>

      {recent.length > 0 && (
        <div
          aria-label={t('header.launcher.recentLabel')}
          className={MODULE_LAUNCHER_CLASSES.recent}
          role="group"
        >
          <span className={MODULE_LAUNCHER_CLASSES.recentLabel}>{t('header.launcher.recent')}</span>
          {recent.map((module) => (
            <Link
              key={module.id}
              className={MODULE_LAUNCHER_CLASSES.recentChip}
              href={module.href}
              onClick={onNavigate}
              onFocus={module.onIntent}
              onPointerEnter={module.onIntent}
            >
              <AppTile className="rounded-full" icon={module.icon} size="xs" tone={module.tone} />
              {module.title}
            </Link>
          ))}
        </div>
      )}

      <div className={MODULE_LAUNCHER_CLASSES.body}>
        {groups.length === 0 && (
          <p className={MODULE_LAUNCHER_CLASSES.empty}>{t('header.launcher.empty', { search })}</p>
        )}
        {groups.map(([group, entries]) => (
          <section key={group} aria-label={group} className={MODULE_LAUNCHER_CLASSES.group}>
            <h3 className={MODULE_LAUNCHER_CLASSES.groupLabel}>{group}</h3>
            {entries.map((entry) => (
              <ModuleLauncherCard
                key={entry.module.id}
                active={entry.module.id === activeId}
                module={entry.module}
                screens={entry.screens}
                onNavigate={onNavigate}
              />
            ))}
          </section>
        ))}
      </div>

      {shortcutLabel && (
        <div className={MODULE_LAUNCHER_CLASSES.footer}>
          <span>
            {t('header.launcher.summary', { modules: modules.length, screens: screenCount })}
          </span>
          <span>
            {t.rich('header.launcher.findAll', {
              shortcut: shortcutLabel,
              kbd: (chunks) => <kbd className={MODULE_LAUNCHER_CLASSES.kbd}>{chunks}</kbd>,
            })}
          </span>
        </div>
      )}
    </div>
  );
});

export default ModuleLauncherPanel;
