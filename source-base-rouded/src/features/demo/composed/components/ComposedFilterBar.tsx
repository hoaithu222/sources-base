import { memo } from 'react';

import { useImeSafeSearchInput } from '@/shared/hooks';
import { Dropdown, Input, Text, Toolbar } from '@/shared/ui';
import { SystemIcon } from '@/shared/ui/icons/Icons';

import { PACKAGE_STATUS_META } from '../../shared/constants/packages.constants';

const STATUS_FILTER = [
  { value: 'all', label: 'Mọi trạng thái' },
  ...Object.entries(PACKAGE_STATUS_META).map(([value, m]) => ({ value, label: m.label })),
];

interface ComposedFilterBarProps {
  keyword: string;
  onKeywordChange: (next: string) => void;
  status: string;
  onStatusChange: (next: string) => void;
  resultCount: number;
  totalCount: number;
}

/**
 * ComposedFilterBar — thanh lọc của màn `/demo/ghep`: ô tìm (an toàn với bộ gõ tiếng Việt) + lọc trạng thái,
 * bên phải in "còn / tổng" số gói (`tabular-nums` để số không nhảy khi gõ). Là hàng ĐẦU THÂN panel bảng (không
 * nổi trên nền trang): vạch dưới tách khỏi header bảng.
 *
 * @param props.keyword - Từ khoá đang lọc.
 * @param props.onKeywordChange - Gọi khi từ khoá đổi (sau khi gõ xong chữ có dấu).
 * @param props.status - Trạng thái đang lọc: `all` hoặc một khoá của `PACKAGE_STATUS_META`.
 * @param props.onStatusChange - Gọi khi chọn trạng thái khác.
 * @param props.resultCount - Số dòng còn lại sau khi lọc.
 * @param props.totalCount - Tổng số dòng khi chưa lọc.
 */
const ComposedFilterBar = memo(function ComposedFilterBar({
  keyword,
  onKeywordChange,
  status,
  onStatusChange,
  resultCount,
  totalCount,
}: ComposedFilterBarProps) {
  const { inputProps } = useImeSafeSearchInput(keyword, onKeywordChange);

  return (
    <Toolbar
      border="bottom"
      left={
        <>
          <Input
            {...inputProps}
            clearable
            placeholder="Tìm mã, tên gói, nhà thầu…"
            size="sm"
            startIcon={<SystemIcon name="magnifying-glass-outline" size={16} />}
            wrapperClassName="w-64"
          />
          <Dropdown
            className="w-45"
            options={STATUS_FILTER}
            size="sm"
            value={status}
            onValueChange={onStatusChange}
          />
        </>
      }
      padding="md"
      right={
        <Text className="tabular-nums" size="tiny" skin="muted">
          {`${resultCount}/${totalCount} gói`}
        </Text>
      }
    />
  );
});

export default ComposedFilterBar;
