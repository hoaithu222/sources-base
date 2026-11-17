import { APP_NAME } from '@/shared/constants/app.constants';
import {
  BRAND_MARK_ICON,
  TITLE_BAR_CLASS,
  TITLE_BAR_STYLE,
} from '@/shared/constants/auth-motifs.constants';
import { Text } from '@/shared/ui';
import { SystemIcon } from '@/shared/ui/icons/Icons';
import { cn } from '@/shared/utils/style/cn';

import BrandLayerDiagram from './BrandLayerDiagram';

const KICKER = 'Nền tảng nội bộ';

const HEADLINE = 'Vận hành trên một hệ';

const SUMMARY =
  'nơi số liệu, quy trình và báo cáo nằm chung một chỗ — không còn mỗi bộ phận một file.';

const MODULES = [
  'Dữ liệu gốc tập trung, một nguồn thật duy nhất',
  'Quy trình và phân quyền theo đúng vai trò từng người',
  'Báo cáo tổng hợp cập nhật theo thời gian thực',
];

const PANEL_CLASSES =
  'flex min-h-0 min-w-0 flex-1 flex-col justify-center gap-6 overflow-hidden p-6 phone:flex-none phone:p-5 lg:p-10';

const MARK_CLASSES = cn(
  'inline-flex size-12 shrink-0 items-center justify-center bg-primary-6 text-neutral-0',
  'squircle rounded-xl [&>svg]:size-6!',
);

const MODULE_ITEM_CLASSES = cn(
  'flex items-baseline gap-3 [counter-increment:mod]',
  'before:font-mono before:text-caption-10 before:tabular-nums before:content-[counter(mod,decimal-leading-zero)]',
  'before:text-teal-7 dark:before:text-link',
);

/**
 * AuthBrandPanel — khoang thương hiệu của `AuthLayout`: logo + tên app, tiêu đề, tóm tắt, sơ đồ lớp, danh sách điểm mạnh.
 *
 * Thay nội dung theo dự án ở `KICKER` · `HEADLINE` · `SUMMARY` · `MODULES`; tên app lấy từ `APP_NAME`.
 * Lưu ý: từ `lg` lề `p-10` phải khớp khoang form của `AuthLayout`; `BrandLayerDiagram` lấp chiều cao còn lại.
 * Điện thoại (`phone:`) chỉ giữ hàng logo + tên app — tiêu đề, tóm tắt, sơ đồ, danh sách ẩn để form lên đầu màn.
 * Logo là ô vuông bo `xl` + `squircle` nền `primary-6` (cùng dáng icon app của `AppTile`).
 */
function AuthBrandPanel() {
  return (
    <section className={PANEL_CLASSES}>
      <div className="flex items-center gap-3">
        <span aria-hidden className={MARK_CLASSES}>
          <SystemIcon name={BRAND_MARK_ICON} />
        </span>
        <Text className="tracking-wide" ellipsis size="large" weight="medium">
          {APP_NAME}
        </Text>
      </div>

      <div className="flex flex-col gap-4 phone:hidden">
        <div className={TITLE_BAR_CLASS} style={TITLE_BAR_STYLE}>
          <Text as="p" className="font-mono uppercase tracking-[0.22em]" size="tiny" skin="muted">
            {KICKER}
          </Text>
          <Text as="p" className="tracking-tight" size="extraLarge" skin="primary" weight="medium">
            {HEADLINE}
          </Text>
        </div>

        <Text as="p" size="small" skin="muted">
          <b className="text-fg-subheading">{APP_NAME}</b> — {SUMMARY}
        </Text>
      </div>

      <div className="contents phone:hidden">
        <BrandLayerDiagram />
      </div>

      <ol className="flex list-none flex-col gap-2 [counter-reset:mod] phone:hidden">
        {MODULES.map((m) => (
          <li key={m} className={MODULE_ITEM_CLASSES}>
            <Text size="small" skin="muted">
              {m}
            </Text>
          </li>
        ))}
      </ol>
    </section>
  );
}

export default AuthBrandPanel;
