'use client';

import { memo, useCallback, useState } from 'react';
import { useTranslations } from 'next-intl';

import { Popover } from '@/shared/ui';
import { SystemIcon } from '@/shared/ui/icons/Icons';

import { MODULE_SWITCHER_CLASSES } from './module-nav.theme';
import type { HeaderModule } from './module-nav.types';
import ModuleLauncherPanel from './parts/module-launcher-panel';

interface ModuleSwitcherProps {
  modules: readonly HeaderModule[];
  activeId?: string;
  shortcutLabel?: string;
}

/**
 * ModuleSwitcher — nút ⊞ "Tất cả phân hệ" ĐẦU thanh header (như ô ứng dụng của Feishu / nút 全部菜单 của Kingdee): bấm mở
 * bảng mọi phân hệ + mọi màn hình (`ModuleLauncherPanel`) — tìm tên màn rồi Enter là tới. Tên phân hệ đang mở do vệt phân
 * hệ (`ModuleTrail`) nói, nút này chỉ là icon để thanh gọn.
 *
 * @param props.modules - Phân hệ đã lọc quyền (`HeaderModule[]`, kèm `screens`). Rỗng → không dựng nút.
 * @param props.activeId - `id` phân hệ đang mở (thẻ được tô trong bảng).
 * @param props.shortcutLabel - Nhãn phím tắt bảng lệnh ở chân bảng (vd "Ctrl K").
 *
 * @example
 * <ModuleSwitcher modules={modules} activeId="tai-chinh" shortcutLabel="Ctrl K" />
 */
const ModuleSwitcher = memo(function ModuleSwitcher({
  modules,
  activeId,
  shortcutLabel,
}: ModuleSwitcherProps) {
  const t = useTranslations('ui.widgets');
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);

  if (modules.length === 0) return null;

  return (
    <Popover
      align="start"
      content={
        <ModuleLauncherPanel
          activeId={activeId}
          modules={modules}
          shortcutLabel={shortcutLabel}
          onNavigate={close}
        />
      }
      open={open}
      side="bottom"
      sideOffset={8}
      onOpenChange={setOpen}
    >
      <button
        aria-label={t('header.moduleSwitcher.label')}
        className={MODULE_SWITCHER_CLASSES.trigger}
        title={t('header.moduleSwitcher.title')}
        type="button"
      >
        <SystemIcon name="grid-2-bold" />
      </button>
    </Popover>
  );
});

export default ModuleSwitcher;
