import { memo } from 'react';
import type { ReactNode } from 'react';

import { Toolbar } from '@/shared/ui';

interface KpiActionRowProps {
  kpis: ReactNode;
  actions: ReactNode;
}

/**
 * KpiActionRow — hàng "dải thẻ KPI + hành động của trang" của trang ĐÃ có `<PageHeader>` (tên phân hệ nằm trên thanh
 * header nên KHÔNG dựng thêm `TitleScreen`): dải KPI chiếm phần còn lại của hàng, cụm hành động ghim cuối hàng và
 * CĂN GIỮA theo chiều dọc so với thẻ. Quy tắc: `docs/rules/structure/page-structure.md` §3b.
 *
 * Dựng trên `Toolbar` có sẵn (cụm trái nở · cụm phải ghim · `items-center`; hẹp thì cụm phải rớt xuống hàng riêng canh
 * phải) — không tự viết flex mới. Bọc dải KPI trong `min-w-0 flex-1` để lưới thẻ giãn đủ bề ngang cụm trái.
 *
 * @param props.kpis - Dải thẻ KPI (lưới thẻ của trang).
 * @param props.actions - Hành động của trang (xuất, thêm, đổi khoảng thời gian, làm mới…).
 *
 * @example
 * <KpiActionRow actions={<Button size="sm">Thêm gói thầu</Button>} kpis={<ComposedKpiStrip rows={rows} />} />
 */
const KpiActionRow = memo(function KpiActionRow({ kpis, actions }: KpiActionRowProps) {
  return <Toolbar left={<div className="min-w-0 flex-1">{kpis}</div>} right={actions} />;
});

export default KpiActionRow;
