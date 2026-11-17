'use client';

import { Fragment, memo } from 'react';
import { Link } from '@/core/i18n';

import { AppIcon, AppTile } from '@/shared/ui';
import { cn } from '@/shared/utils/style/cn';

import { MODULE_LAUNCHER_CLASSES } from '../module-nav.theme';
import type { HeaderModule, HeaderNavItem } from '../module-nav.types';

interface ModuleLauncherCardProps {
  module: HeaderModule;
  /** Màn hình hiện trên thẻ (đã lọc theo ô tìm); nhóm (`children`) thành tiêu đề nhỏ + mục con. */
  screens: readonly HeaderNavItem[];
  active: boolean;
  onNavigate: () => void;
}

/**
 * ModuleLauncherCard — một THẺ phân hệ trong bảng "Tất cả phân hệ": đầu thẻ (ô phân hệ + tên + mô tả → trang chủ phân hệ)
 * + danh sách màn hình có icon (màn đang mở tô đặc). Phần nội bộ của `ModuleLauncherPanel`.
 *
 * @param props.module - Phân hệ (`HeaderModule`).
 * @param props.screens - Màn hình cần hiện (đã lọc, đã bỏ trang chủ phân hệ).
 * @param props.active - Phân hệ đang mở (đầu thẻ được tô).
 * @param props.onNavigate - Gọi khi bấm một liên kết (đóng bảng).
 *
 * @example
 * <ModuleLauncherCard active module={module} screens={screens} onNavigate={close} />
 */
const ModuleLauncherCard = memo(function ModuleLauncherCard({
  module,
  screens,
  active,
  onNavigate,
}: ModuleLauncherCardProps) {
  const renderScreen = (item: HeaderNavItem) => (
    <Link
      key={item.key}
      aria-current={item.active ? 'page' : undefined}
      className={cn(
        MODULE_LAUNCHER_CLASSES.screen,
        item.active && MODULE_LAUNCHER_CLASSES.screenActive,
      )}
      href={item.href}
      onClick={onNavigate}
      onFocus={item.onIntent}
      onPointerEnter={item.onIntent}
    >
      <AppIcon name={item.icon ?? 'folder'} size={16} />
      <span className="truncate">{item.label}</span>
    </Link>
  );

  return (
    <section aria-label={module.title} className={MODULE_LAUNCHER_CLASSES.card}>
      <Link
        aria-current={active ? 'true' : undefined}
        className={cn(
          MODULE_LAUNCHER_CLASSES.cardHead,
          active && MODULE_LAUNCHER_CLASSES.cardHeadActive,
        )}
        href={module.href}
        onClick={onNavigate}
        onFocus={module.onIntent}
        onPointerEnter={module.onIntent}
      >
        <AppTile icon={module.icon} size="sm" tone={module.tone} />
        <span className={MODULE_LAUNCHER_CLASSES.cardText}>
          <span className={MODULE_LAUNCHER_CLASSES.cardTitle}>{module.title}</span>
          {module.subtitle && (
            <span className={MODULE_LAUNCHER_CLASSES.cardSubtitle}>{module.subtitle}</span>
          )}
        </span>
      </Link>
      {screens.length > 0 && (
        <div className={MODULE_LAUNCHER_CLASSES.screens}>
          {screens.map((item) =>
            item.children ? (
              <Fragment key={item.key}>
                <span className={MODULE_LAUNCHER_CLASSES.screenGroup}>{item.label}</span>
                {item.children.map(renderScreen)}
              </Fragment>
            ) : (
              renderScreen(item)
            ),
          )}
        </div>
      )}
    </section>
  );
});

export default ModuleLauncherCard;
