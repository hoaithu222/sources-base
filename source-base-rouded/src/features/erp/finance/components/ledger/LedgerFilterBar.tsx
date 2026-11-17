import { memo } from 'react';

import { useImeSafeSearchInput } from '@/shared/hooks';
import { Button, Input, Text } from '@/shared/ui';
import { SystemIcon } from '@/shared/ui/icons/Icons';

import { FINANCE_PANEL_ACTIONS_CLASSES } from '../../finance.theme';

interface LedgerFilterBarProps {
  keyword: string;
  onKeywordChange: (next: string) => void;
  resultCount: number;
  totalCount: number;
  onExport: () => void;
}

/**
 * LedgerFilterBar — cụm điều khiển trên header panel Sổ cái (không tốn hàng riêng): đếm "còn / tổng" bút toán · ô tìm
 * số chứng từ, diễn giải, TK đối ứng (an toàn với bộ gõ tiếng Việt) · xuất Excel. Tài khoản + kỳ là bộ lọc của TRANG,
 * nằm ở `PageHeader filters`.
 *
 * @param props.keyword - Từ khoá đang lọc.
 * @param props.onKeywordChange - Gọi khi từ khoá đổi (sau khi gõ xong chữ có dấu).
 * @param props.resultCount - Số bút toán còn lại sau khi lọc.
 * @param props.totalCount - Tổng số bút toán của kỳ.
 * @param props.onExport - Bấm nút xuất Excel.
 *
 * @example
 * <LedgerFilterBar keyword="" resultCount={32} totalCount={32} onExport={exportBook} onKeywordChange={setKeyword} />
 */
const LedgerFilterBar = memo(function LedgerFilterBar({
  keyword,
  onKeywordChange,
  resultCount,
  totalCount,
  onExport,
}: LedgerFilterBarProps) {
  const { inputProps } = useImeSafeSearchInput(keyword, onKeywordChange);

  return (
    <div className={FINANCE_PANEL_ACTIONS_CLASSES}>
      <Text className="shrink-0 tabular-nums" size="tiny" skin="muted">
        {`${resultCount}/${totalCount} bút toán`}
      </Text>
      <Input
        {...inputProps}
        aria-label="Tìm bút toán"
        clearable
        placeholder="Tìm số CT, diễn giải, TK đối ứng…"
        size="sm"
        startIcon={<SystemIcon name="magnifying-glass-outline" size={16} />}
        wrapperClassName="w-72 shrink-0 phone:w-auto phone:min-w-0 phone:flex-1"
      />
      <Button
        aria-label="Xuất sổ cái ra Excel"
        size="sm"
        skin="neutral"
        startIcon={<SystemIcon name="download-bold" size={14} />}
        variant="stroke"
        onClick={onExport}
      >
        <span className="max-wide:sr-only">Xuất Excel</span>
      </Button>
    </div>
  );
});

export default LedgerFilterBar;
