import { memo, useCallback, useState } from 'react';

import { useArrowFieldNav, useSaveShortcut } from '@/shared/hooks';
import {
  Badge,
  BoxPanel,
  Button,
  PageBody,
  PageShell,
  SegmentToggle,
  showToast,
  Table,
  TABLE_ENTRY_ROW_CLASSES,
  TABLE_ENTRY_ROW_HEIGHT,
  TABLE_INLINE_EDIT_CLASS,
  Text,
  type TableEntryDensity,
} from '@/shared/ui';
import { SystemIcon } from '@/shared/ui/icons/Icons';
import { handleEntryGridKeyDown } from '@/shared/utils/browser/entry-grid.utils';
import { cn } from '@/shared/utils/style/cn';
import { PageHeader } from '@/shared/widgets/header';

import EntrySaveState from '../components/EntrySaveState';
import {
  ENTRY_DENSITY_OPTIONS,
  ENTRY_KEY_HINTS,
  type EntryRow,
} from '../constants/entry.constants';
import { entryFooterCell, useEntryColumns } from '../hooks/useEntryColumns';
import { useEntrySheet } from '../hooks/useEntrySheet';

const rowKey = (row: EntryRow) => row.id;

/**
 * EntryDemoPage — màn `/demo/nhap-lieu` ("Phiếu nhập kho"): bảng NHẬP LIỆU mẫu theo `data-entry-table.md` — control phẳng
 * tới khi dòng được chạm, ô đã sửa có tam giác vàng kim, lỗi tại chỗ (không xoá chữ), cột tính toán chìm, dòng nháp vạch
 * vàng kim, dòng tổng dính đáy, đổi mật độ 32 · 40 · 48px, ← → trong dòng, Enter / Shift+Enter theo cột, Ctrl+S lưu.
 * Lưu ý: dữ liệu chỉ sống trong state của trang (bản demo, không gọi API).
 */
const EntryDemoPage = memo(function EntryDemoPage() {
  const sheet = useEntrySheet();
  const [density, setDensity] = useState<TableEntryDensity>('compact');
  const columns = useEntryColumns(sheet, density);
  const [navRef, onNavKey] = useArrowFieldNav<HTMLDivElement>();

  const { dirtyCount, errorCount, save } = sheet;

  const handleSave = useCallback(() => {
    if (errorCount > 0) {
      showToast('warning', `Còn ${errorCount} dòng có lỗi — sửa ô viền đỏ trước khi lưu.`);
      return;
    }
    showToast('success', `Đã lưu ${save()} dòng.`);
  }, [errorCount, save]);

  useSaveShortcut(handleSave, { canSave: dirtyCount > 0 });

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      handleEntryGridKeyDown(e);
      if (!e.defaultPrevented) onNavKey(e);
    },
    [onNavKey],
  );

  const rowClassName = useCallback(
    (row: EntryRow) =>
      cn(TABLE_ENTRY_ROW_CLASSES.active, row.draft && TABLE_ENTRY_ROW_CLASSES.draft),
    [],
  );

  const headerRight = (
    <div className="flex items-center gap-2">
      {errorCount > 0 && (
        <Badge className="phone:hidden" color="error">
          {errorCount} dòng lỗi
        </Badge>
      )}
      <SegmentToggle
        className="phone:hidden"
        options={ENTRY_DENSITY_OPTIONS}
        size="sm"
        value={density}
        onValueChange={(value) => setDensity(value as TableEntryDensity)}
      />
      <Button
        size="sm"
        skin="neutral"
        startIcon={<SystemIcon name="plus-outline" size={14} />}
        variant="stroke"
        onClick={sheet.addDraft}
      >
        Thêm dòng
      </Button>
      <EntrySaveState dirtyCount={dirtyCount} onSave={handleSave} />
    </div>
  );

  const footer = (
    <div className="flex flex-wrap items-center gap-3">
      {ENTRY_KEY_HINTS.map((hint) => (
        <Text key={hint.keys} size="extraTiny" skin="muted">
          <kbd className="rounded-xs border border-border-default bg-bg-subtle px-1.5 py-px font-mono">
            {hint.keys}
          </kbd>{' '}
          {hint.label}
        </Text>
      ))}
    </div>
  );

  return (
    <PageShell>
      <PageHeader subtitle="Bảng nhập liệu mẫu" title="Phiếu nhập kho PNK-2026-1017" tone="teal" />

      <PageBody overflow="hidden" stack={false}>
        <BoxPanel
          bodyOverflow="hidden"
          border="hairline"
          footer={footer}
          headerDivider
          headerRight={headerRight}
          title="Chi tiết vật tư"
        >
          <div
            ref={navRef}
            className={cn('flex min-h-0 flex-1 flex-col', TABLE_INLINE_EDIT_CLASS)}
            onKeyDown={handleKeyDown}
          >
            <Table
              columns={columns}
              data={sheet.rows}
              fill
              footerCell={entryFooterCell(sheet.rows)}
              gridBorder
              minWidth={1160}
              pagination={false}
              rowClassName={rowClassName}
              rowHeight={TABLE_ENTRY_ROW_HEIGHT[density]}
              rowKey={rowKey}
            />
          </div>
        </BoxPanel>
      </PageBody>
    </PageShell>
  );
});

export default EntryDemoPage;
