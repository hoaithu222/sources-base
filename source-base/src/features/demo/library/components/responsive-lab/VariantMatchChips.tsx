import { memo, useMemo } from 'react';

import { selectIsTv, useDisplayStore } from '@/domains/preferences';

import { useMatchedQueries } from '../../hooks/useMatchedQueries';
import DemoGrid from '../shell/DemoGrid';
import DemoRow from '../shell/DemoRow';
import type { DemoVariantProbeGroup } from './responsive-lab.types';
import VariantChip from './VariantChip';

interface VariantMatchChipsProps {
  groups: readonly DemoVariantProbeGroup[];
}

/** Nhóm có thêm chip `tv:` — đọc từ store hiển thị chứ không phải media query (class `.tv` trên `<html>`). */
const TV_CHIP_GROUP_ID = 'device';

/**
 * VariantMatchChips — mỗi nhóm biến thể (bậc bề rộng · cổng laptop · thiết bị) là một hàng chip "khớp /
 * không", cập nhật ngay theo `matchMedia` khi kéo cỡ cửa sổ, xoay máy hay bật TV.
 *
 * @param props.groups - Các nhóm biến thể cần đối chiếu, mỗi probe là một media query.
 *
 * @example
 * <VariantMatchChips groups={DEMO_VARIANT_PROBE_GROUPS} />
 */
const VariantMatchChips = memo(function VariantMatchChips({ groups }: VariantMatchChipsProps) {
  const queries = useMemo(() => groups.flatMap((g) => g.probes.map((p) => p.query)), [groups]);
  const matches = useMatchedQueries(queries);
  const isTv = useDisplayStore(selectIsTv);

  return (
    <>
      {groups.map((group) => (
        <DemoRow key={group.id} label={group.label} note={group.note} stacked>
          <DemoGrid align="start" min="sm">
            {group.probes.map((probe) => (
              <VariantChip
                key={probe.label}
                detail={probe.query}
                label={probe.label}
                matches={matches[probe.query] === true}
              />
            ))}
            {group.id === TV_CHIP_GROUP_ID ? (
              <VariantChip detail="class .tv trên <html>" label="tv:" matches={isTv} />
            ) : null}
          </DemoGrid>
        </DemoRow>
      ))}
    </>
  );
});

export default VariantMatchChips;
