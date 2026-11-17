import { memo } from 'react';

import { useImeSafeSearchInput } from '@/shared/hooks';
import { Button, Dropdown, Input, Text } from '@/shared/ui';
import { SystemIcon } from '@/shared/ui/icons/Icons';

import { DEBT_STATUS_FILTER_OPTIONS } from '../../constants/receivables.constants';
import { FINANCE_PANEL_ACTIONS_CLASSES } from '../../finance.theme';

interface DebtFilterBarProps {
  keyword: string;
  onKeywordChange: (next: string) => void;
  status: string;
  onStatusChange: (next: string) => void;
  placeholder: string;
  resultCount: number;
  totalCount: number;
  onExport: () => void;
}

/**
 * DebtFilterBar — cụm điều khiển trên header panel bảng công nợ (không tốn hàng riêng): đếm "còn / tổng" đối tác · ô tìm
 * mã / tên (an toàn với bộ gõ tiếng Việt) · lọc trạng thái · xuất Excel.
 *
 * @param props.keyword - Từ khoá đang lọc.
 * @param props.onKeywordChange - Gọi khi từ khoá đổi (sau khi gõ xong chữ có dấu).
 * @param props.status - Trạng thái đang lọc: `all` hoặc khoá của `DEBT_STATUS_META`.
 * @param props.onStatusChange - Gọi khi chọn trạng thái khác.
 * @param props.placeholder - Gợi ý của ô tìm theo chế độ ("Tìm mã, tên khách hàng…").
 * @param props.resultCount - Số đối tác còn lại sau khi lọc.
 * @param props.totalCount - Tổng số đối tác.
 * @param props.onExport - Bấm nút xuất Excel.
 *
 * @example
 * <DebtFilterBar keyword="" placeholder="Tìm…" resultCount={18} status="all" totalCount={18}
 *   onExport={exportRows} onKeywordChange={setKeyword} onStatusChange={setStatus} />
 */
const DebtFilterBar = memo(function DebtFilterBar({
  keyword,
  onKeywordChange,
  status,
  onStatusChange,
  placeholder,
  resultCount,
  totalCount,
  onExport,
}: DebtFilterBarProps) {
  const { inputProps } = useImeSafeSearchInput(keyword, onKeywordChange);

  return (
    <div className={FINANCE_PANEL_ACTIONS_CLASSES}>
      <Text className="shrink-0 tabular-nums" size="tiny" skin="muted">
        {`${resultCount}/${totalCount}`}
      </Text>
      <Input
        {...inputProps}
        aria-label="Tìm đối tác"
        clearable
        placeholder={placeholder}
        size="sm"
        startIcon={<SystemIcon name="magnifying-glass-outline" size={16} />}
        wrapperClassName="w-56 shrink-0 phone:order-first phone:w-full"
      />
      <Dropdown
        aria-label="Lọc trạng thái"
        className="w-40 shrink-0 phone:min-w-0 phone:flex-1"
        options={DEBT_STATUS_FILTER_OPTIONS}
        size="sm"
        value={status}
        onValueChange={onStatusChange}
      />
      <Button
        aria-label="Xuất bảng công nợ ra Excel"
        size="sm"
        skin="neutral"
        variant="stroke"
        onClick={onExport}
      >
        <SystemIcon name="download-bold" size={14} />
      </Button>
    </div>
  );
});

export default DebtFilterBar;
