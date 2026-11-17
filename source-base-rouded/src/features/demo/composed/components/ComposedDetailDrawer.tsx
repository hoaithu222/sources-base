import { memo, type ReactNode } from 'react';

import {
  Badge,
  Button,
  Drawer,
  DrawerSection,
  Progress,
  Text,
  type SystemIconName,
} from '@/shared/ui';
import { SystemIcon } from '@/shared/ui/icons/Icons';
import { formatNumber } from '@/shared/utils/format/format.utils';

import {
  PACKAGE_STATUS_META,
  type DemoPackageRow,
} from '../../shared/constants/packages.constants';

interface ComposedDetailDrawerProps {
  row: DemoPackageRow | null;
  onClose: () => void;
}

interface InfoRowProps {
  icon: SystemIconName;
  label: string;
  children: ReactNode;
}

/**
 * InfoRow — một dòng "icon · nhãn · giá trị" trong ngăn kéo chi tiết.
 *
 * @param props.icon - Icon đầu dòng.
 * @param props.label - Nhãn cột trái.
 * @param props.children - Giá trị cột phải.
 */
const InfoRow = memo(function InfoRow({ icon, label, children }: InfoRowProps) {
  return (
    <div className="flex items-start gap-2 border-b border-divider-strong py-2.5 last:border-b-0">
      <SystemIcon className="mt-0.5 shrink-0 text-fg-muted" name={icon} size={14} />
      <Text className="w-28 shrink-0 pt-0.5" size="tiny" skin="muted">
        {label}
      </Text>
      <div className="min-w-0 flex-1 break-words">{children}</div>
    </div>
  );
});

/**
 * ComposedDetailDrawer — ngăn kéo chi tiết một gói thầu của màn `/demo/ghep`: tiến độ + trạng thái, mã, nhà
 * thầu, giá trị, hạn hoàn thành. Mỗi vùng là một `DrawerSection` khác tông (tiến độ = xanh lá, thông tin = cyan).
 *
 * @param props.row - Gói đang xem; khác `null` thì ngăn kéo mở.
 * @param props.onClose - Gọi khi người dùng đóng (nút Đóng, Esc, bấm nền).
 */
const ComposedDetailDrawer = memo(function ComposedDetailDrawer({
  row,
  onClose,
}: ComposedDetailDrawerProps) {
  return (
    <Drawer
      footer={
        <Button size="md" variant="secondary" onClick={onClose}>
          Đóng
        </Button>
      }
      open={row !== null}
      title={row ? `${row.code} — ${row.name}` : ''}
      onOpenChange={(next) => !next && onClose()}
    >
      {row && (
        <div className="flex flex-col gap-3">
          <DrawerSection
            extra={
              <Badge color={PACKAGE_STATUS_META[row.status].color} variant="tinted">
                {PACKAGE_STATUS_META[row.status].label}
              </Badge>
            }
            icon="chart-line-bold"
            title="Tiến độ thi công"
            tone="primary"
          >
            <Progress showValue value={row.progress} />
          </DrawerSection>

          <DrawerSection bodyClassName="py-0" icon="clipboard-bold" title="Thông tin gói thầu">
            <InfoRow icon="file-lines-bold" label="Mã gói thầu">
              <Text size="small">{row.code}</Text>
            </InfoRow>
            <InfoRow icon="building-bold" label="Nhà thầu">
              <Text size="small">{row.contractor}</Text>
            </InfoRow>
            <InfoRow icon="wallet-bold" label="Giá trị hợp đồng">
              <Text className="tabular-nums" size="small">{`${formatNumber(row.value)} đ`}</Text>
            </InfoRow>
            <InfoRow icon="calendar-bold" label="Hạn hoàn thành">
              <Text className="tabular-nums" size="small">
                {row.dueDate}
              </Text>
            </InfoRow>
          </DrawerSection>
        </div>
      )}
    </Drawer>
  );
});

export default ComposedDetailDrawer;
