import { memo } from 'react';
import { Link } from 'react-router-dom';

import { Button } from '@/shared/ui';
import { SystemIcon } from '@/shared/ui/icons/Icons';

import type { ExecSummaryItem } from '../utils/executive.utils';

interface PanelSummaryProps {
  items?: readonly ExecSummaryItem[];
  link?: { to: string; label: string };
}

const PANEL_SUMMARY_CLASSES = {
  root: 'flex flex-wrap items-center justify-end gap-x-3 gap-y-1',
  item: 'whitespace-nowrap text-caption-12 text-fg-muted',
  value: 'text-body-14-semibold text-fg-heading tabular-nums',
} satisfies Record<string, string>;

/**
 * PanelSummary — cụm góc phải hàng tiêu đề của `ExecPanel`: vài cặp "nhãn mờ · số đậm" tóm tắt khối (lũy kế, thu / chi /
 * ròng, số việc) và một liên kết "Xem chi tiết ›" là `<Link>` thật (nút `ghost` qua `asChild`) sang màn nghiệp vụ.
 * Lưu ý: chỉ đặt số KHÔNG có sẵn trong thân khối; khung hẹp thì các cặp tự xuống dòng (không cắt chữ).
 *
 * @param props.items - Các cặp nhãn – số, theo thứ tự đọc.
 * @param props.link - Liên kết sang màn chi tiết (`to` là route thật, `label` là chữ trên nút).
 *
 * @example
 * <PanelSummary items={[{ label: 'Lũy kế', value: '1.103,0 tỷ' }]} link={{ to: '/tai-chinh/cong-no', label: 'Công nợ' }} />
 */
const PanelSummary = memo(function PanelSummary({ items = [], link }: PanelSummaryProps) {
  return (
    <span className={PANEL_SUMMARY_CLASSES.root}>
      {items.map((item) => (
        <span key={item.label} className={PANEL_SUMMARY_CLASSES.item}>
          {`${item.label} `}
          <span className={PANEL_SUMMARY_CLASSES.value}>{item.value}</span>
        </span>
      ))}
      {link ? (
        <Button
          asChild
          endIcon={<SystemIcon name="angle-right-outline" size={12} />}
          size="xs"
          skin="neutral"
          variant="ghost"
        >
          <Link to={link.to}>{link.label}</Link>
        </Button>
      ) : null}
    </span>
  );
});

export default PanelSummary;
