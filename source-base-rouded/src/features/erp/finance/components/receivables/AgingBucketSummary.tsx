import { memo } from 'react';

import { tokenVar } from '@/shared/charts';
import { StackBar } from '@/shared/ui';
import { formatPercent } from '@/shared/utils/format/format.utils';

import { AGING_BUCKETS, type AgingBucketMeta } from '../../constants/receivables.constants';
import { formatMoneyShort } from '../../utils/finance-format.utils';
import type { DebtSummary } from '../../utils/receivables.utils';

interface AgingBucketSummaryProps {
  summary: DebtSummary;
}

interface AgingBucketStatProps {
  bucket: AgingBucketMeta;
  value: number;
  share: number;
}

type AgingSummarySlot = 'root' | 'grid' | 'stat' | 'head' | 'swatch' | 'label' | 'value' | 'share';

const AGING_SUMMARY_CLASSES = {
  root: 'flex shrink-0 flex-col gap-2 border-b border-border-default p-3',
  grid: 'grid grid-cols-2 gap-x-4 gap-y-2',
  stat: 'flex min-w-0 flex-col',
  head: 'flex min-w-0 items-center gap-1.5',
  swatch: 'size-2.5 shrink-0 rounded-xs',
  label: 'truncate text-caption-12 text-fg-muted',
  value: 'flex items-baseline gap-1.5 tabular-nums text-body-14-semibold text-fg-heading',
  share: 'text-caption-12 text-fg-muted',
} satisfies Record<AgingSummarySlot, string>;

/**
 * AgingBucketStat — một ô của lưới cơ cấu tuổi nợ: ô màu + tên nhóm, số tiền + tỉ trọng.
 *
 * @param props.bucket - Nhóm tuổi nợ (`AGING_BUCKETS`).
 * @param props.value - Dư nợ của nhóm (đồng).
 * @param props.share - Tỉ trọng trên tổng dư nợ, thang 100.
 */
const AgingBucketStat = memo(function AgingBucketStat({
  bucket,
  value,
  share,
}: AgingBucketStatProps) {
  return (
    <div className={AGING_SUMMARY_CLASSES.stat}>
      <span className={AGING_SUMMARY_CLASSES.head}>
        <span
          aria-hidden
          className={AGING_SUMMARY_CLASSES.swatch}
          style={{ backgroundColor: tokenVar(bucket.token) }}
        />
        <span className={AGING_SUMMARY_CLASSES.label}>{bucket.label}</span>
      </span>
      <span className={AGING_SUMMARY_CLASSES.value}>
        {formatMoneyShort(value)}
        <span className={AGING_SUMMARY_CLASSES.share}>{formatPercent(share)}</span>
      </span>
    </div>
  );
});

/**
 * AgingBucketSummary — đầu panel Tuổi nợ: thanh 100% chia bốn nhóm tuổi nợ + lưới 2×2 (ô màu · tên nhóm · số tiền ·
 * tỉ trọng). Cùng màu với biểu đồ đối tác bên dưới nên lưới này kiêm luôn chú giải của biểu đồ.
 *
 * @param props.summary - KPI đã cộng (`summarizeDebt`) — lấy tổng từng nhóm.
 *
 * @example
 * <AgingBucketSummary summary={summarizeDebt(rows, 'receivable')} />
 */
const AgingBucketSummary = memo(function AgingBucketSummary({ summary }: AgingBucketSummaryProps) {
  const shareOf = (value: number) => (summary.total > 0 ? (value / summary.total) * 100 : 0);
  const segments = AGING_BUCKETS.map((bucket) => ({
    value: summary.buckets[bucket.key],
    color: tokenVar(bucket.token),
    title: `${bucket.label}: ${formatMoneyShort(summary.buckets[bucket.key])}`,
  }));
  const ariaLabel = AGING_BUCKETS.map(
    (bucket) => `${bucket.label} ${formatPercent(shareOf(summary.buckets[bucket.key]))}`,
  ).join(', ');

  return (
    <div className={AGING_SUMMARY_CLASSES.root}>
      <StackBar ariaLabel={ariaLabel} height={12} minPercent={1} segments={segments} />
      <div className={AGING_SUMMARY_CLASSES.grid}>
        {AGING_BUCKETS.map((bucket) => (
          <AgingBucketStat
            key={bucket.key}
            bucket={bucket}
            share={shareOf(summary.buckets[bucket.key])}
            value={summary.buckets[bucket.key]}
          />
        ))}
      </div>
    </div>
  );
});

export default AgingBucketSummary;
