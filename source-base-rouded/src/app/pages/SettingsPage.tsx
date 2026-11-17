import { useCallback } from 'react';

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
import { SETTINGS_SHORTCUTS } from './settings/settings.constants';

const SCALE_OPTIONS = UI_SCALE_VALUES.map((v) => ({ key: String(v), label: `×${v}` }));

const KBD_CLASS =
  'rounded-sm border border-border-default bg-bg-subtle px-1.5 py-px font-mono text-caption-12 text-fg-body shadow-[inset_0_-1px_0_var(--color-border-default)]';

/**
 * SettingsPage — cài đặt theo bố cục System Settings của macOS: tên trang lên header, các HỘP NHÓM (`InsetGroup`) xếp
 * một cột giữa trang, mỗi dòng = ô icon màu · tên + dòng phụ · điều khiển bên phải. Nhóm: Giao diện (`AppearanceGroup`:
 * Tự động / Sáng / Tối + Màu nhấn) · Màn hình lớn · Phím tắt.
 *
 * TV ép giao diện tối và khoá chọn theme; tắt TV thì theme đã lưu quay lại. Mức phóng chữ chỉ hiện ở TV (giá trị qua
 * `parseUiScale` trước khi ghi store).
 */
export default function SettingsPage() {
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
      <PageHeader
        subtitle="Giao diện · màu nhấn · màn hình lớn · phím tắt"
        title="Cài đặt"
        tone="sky"
      />

      <PageBody>
        <div className="mx-auto flex w-full max-w-2xl flex-col gap-4">
          <AppearanceGroup />

          <InsetGroup
            footer="Phóng CỠ CHỮ để đọc từ xa; khung giữ nguyên kích thước nên bố cục không vỡ."
            title="Màn hình lớn"
          >
            <InsetGroupRow
              control={
                <Toggle
                  aria-label="Chế độ màn hình lớn"
                  checked={isTv}
                  onCheckedChange={handleTv}
                />
              }
              description="Dùng cho màn hình điều hành treo tường"
              icon="asset"
              title="Chế độ màn hình lớn"
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
                description="Trần ×1.3 — cao hơn chữ bắt đầu tràn khỏi nút và ô bảng"
                icon="magnifying-glass-plus-bold"
                title="Mức phóng chữ"
                tone="sky"
              />
            )}
          </InsetGroup>

          <InsetGroup description="Thao tác nhanh không cần chuột" title="Phím tắt">
            {SETTINGS_SHORTCUTS.map((shortcut) => (
              <InsetGroupRow
                key={shortcut.keys}
                title={shortcut.label}
                value={<kbd className={KBD_CLASS}>{shortcut.keys}</kbd>}
              />
            ))}
          </InsetGroup>
        </div>
      </PageBody>
    </PageShell>
  );
}
