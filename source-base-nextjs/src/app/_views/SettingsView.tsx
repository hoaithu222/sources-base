'use client';

import { useCallback } from 'react';
import { useTranslations } from 'next-intl';

import {
  UI_SCALE_VALUES,
  parseUiScale,
  selectEffectiveUiScale,
  selectIsTv,
  useDisplayStore,
} from '@/domains/preferences';
import { InsetGroup, InsetGroupRow, PageBody, PageShell, SegmentToggle, Toggle } from '@/shared/ui';
import { PageHeader } from '@/shared/widgets/header';

import AppearanceGroup from './settings/AppearanceGroup';
import LanguageGroup from './settings/LanguageGroup';
import { SETTINGS_SHORTCUTS } from './settings/settings.constants';

const SCALE_OPTIONS = UI_SCALE_VALUES.map((v) => ({ key: String(v), label: `×${v}` }));

const KBD_CLASS =
  'rounded-sm border border-border-default bg-bg-subtle px-1.5 py-px font-mono text-caption-12 text-fg-body shadow-[inset_0_-1px_0_var(--color-border-default)]';

/**
 * SettingsView — cài đặt theo bố cục System Settings của macOS: tên trang lên header, các HỘP NHÓM (`InsetGroup`) xếp
 * một cột giữa trang, mỗi dòng = ô icon màu · tên + dòng phụ · điều khiển bên phải. Nhóm: Ngôn ngữ (`LanguageGroup`) ·
 * Giao diện (`AppearanceGroup`: Tự động / Sáng / Tối + Màu nhấn) · Màn hình lớn · Phím tắt.
 *
 * TV ép giao diện tối và khoá chọn theme; tắt TV thì theme đã lưu quay lại. Mức phóng chữ chỉ hiện ở TV (giá trị qua
 * `parseUiScale` trước khi ghi store). Chữ ở `messages/<locale>/account.json` (`settings`).
 */
export default function SettingsView() {
  const t = useTranslations('account.settings');
  const isTv = useDisplayStore(selectIsTv);
  const uiScale = useDisplayStore(selectEffectiveUiScale);
  const setMode = useDisplayStore((s) => s.setMode);
  const setUiScale = useDisplayStore((s) => s.setUiScale);

  const handleTv = useCallback(
    (checked: boolean) => setMode(checked ? 'tv' : 'standard'),
    [setMode],
  );
  const handleScale = useCallback(
    (key: string) => {
      const scale = parseUiScale(key);
      if (scale !== null) setUiScale(scale);
    },
    [setUiScale],
  );

  return (
    <PageShell variant="flow">
      <PageHeader subtitle={t('subtitle')} title={t('title')} tone="sky" />

      <PageBody>
        <div className="mx-auto flex w-full max-w-2xl flex-col gap-4">
          <LanguageGroup />

          <AppearanceGroup />

          <InsetGroup footer={t('tv.footer')} title={t('tv.title')}>
            <InsetGroupRow
              control={
                <Toggle aria-label={t('tv.mode')} checked={isTv} onCheckedChange={handleTv} />
              }
              description={t('tv.modeDescription')}
              icon="asset"
              title={t('tv.mode')}
              tone="blue"
            />
            {isTv && (
              <InsetGroupRow
                control={
                  <SegmentToggle
                    options={SCALE_OPTIONS}
                    size="sm"
                    value={String(uiScale)}
                    onValueChange={handleScale}
                  />
                }
                description={t('tv.scaleDescription')}
                icon="magnifying-glass-plus-bold"
                title={t('tv.scale')}
                tone="sky"
              />
            )}
          </InsetGroup>

          <InsetGroup description={t('shortcuts.description')} title={t('shortcuts.title')}>
            {SETTINGS_SHORTCUTS.map((shortcut) => (
              <InsetGroupRow
                key={shortcut.id}
                title={t(`shortcuts.items.${shortcut.id}`)}
                value={<kbd className={KBD_CLASS}>{shortcut.keys}</kbd>}
              />
            ))}
          </InsetGroup>
        </div>
      </PageBody>
    </PageShell>
  );
}
