import { memo } from 'react';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

import { getRoutePath } from '@/app/router/modules';
import { APP_NAME } from '@/shared/constants/app.constants';
import { Button, PageShell, SectionHeader, Surface, Text, TitleScreen } from '@/shared/ui';
import type { ButtonVariant } from '@/shared/ui';

interface DemoLinkProps {
  to: string | undefined;
  variant: ButtonVariant;
  children: string;
}

interface StepRowProps {
  index: string;
  title: string;
  children: ReactNode;
}

const STEP_INDEX_CLASSES =
  'flex size-8 shrink-0 items-center justify-center border border-sky-5/25 bg-sky-5/8 text-caption-12-semibold tabular-nums text-sky-7 dark:text-sky-5';

const CODE_CLASSES =
  'border border-border-default bg-bg-subtle px-1 font-mono text-caption-12 text-fg-subheading';

/**
 * DemoLink — nút dẫn tới một màn của phân hệ demo; không render gì khi phân hệ chưa đăng ký.
 *
 * @param props.to - Path lấy từ `getRoutePath(id)`; `undefined` (phân hệ không đăng ký) → không render.
 * @param props.variant - Kiểu tô của `Button`.
 * @param props.children - Nhãn nút.
 */
const DemoLink = memo(function DemoLink({ to, variant, children }: DemoLinkProps) {
  if (!to) return null;

  return (
    <Button asChild size="md" variant={variant}>
      <Link to={to}>{children}</Link>
    </Button>
  );
});

/**
 * StepRow — một bước của khối "Bắt đầu": ô số thứ tự + tiêu đề + mô tả ngắn.
 *
 * @param props.index - Số thứ tự hiển thị trong ô vuông, vd `01`.
 * @param props.title - Tên bước.
 * @param props.children - Mô tả bước (được chứa `<code>`).
 */
const StepRow = memo(function StepRow({ index, title, children }: StepRowProps) {
  return (
    <div className="flex items-start gap-3 p-3">
      <span aria-hidden className={STEP_INDEX_CLASSES}>
        {index}
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <Text size="small" weight="medium">
          {title}
        </Text>
        <Text size="tiny" skin="muted">
          {children}
        </Text>
      </div>
    </div>
  );
});

/**
 * HomePage — trang chủ mẫu của base: tên app + ba bước dựng phân hệ đầu tiên và lối vào phân hệ demo
 * (nút chỉ hiện khi phân hệ đó được đăng ký ở chế độ đang chạy).
 */
function HomePage() {
  const demoPath = getRoutePath('demo');
  const composedDemoPath = getRoutePath('demo.composed');
  const hasDemo = Boolean(demoPath ?? composedDemoPath);

  return (
    <PageShell variant="flow">
      <TitleScreen icon="house-bold" iconColor="sky" subtitle="KHUNG DỰ ÁN" title={APP_NAME} />

      <section className="flex max-w-3xl flex-col gap-2">
        <SectionHeader
          accent
          description="Khung dự án đã sẵn sàng — ba bước để có phân hệ đầu tiên"
          icon="house-outline"
          iconColor="sky"
          title="Bắt đầu"
        />
        <Surface className="flex flex-col divide-y divide-divider-default">
          <StepRow index="01" title="Khai báo phân hệ">
            Thêm một mục vào{' '}
            <code className={CODE_CLASSES}>src/app/router/modules/module-registry.ts</code>.
          </StepRow>
          <StepRow index="02" title="Route, menu và quyền tự dựng theo">
            Router, Dock và bảng lệnh Ctrl K cùng đọc danh sách đó; guard lọc theo quyền của phiên.
          </StepRow>
          <StepRow index="03" title="Ghép màn hình bằng UI kit">
            Dùng lại component của <code className={CODE_CLASSES}>@/shared/ui</code> — xem thư viện
            giao diện để chọn đúng mảnh.
          </StepRow>
          {hasDemo && (
            <div className="flex flex-wrap gap-2 p-3">
              <DemoLink to={demoPath} variant="primary">
                Xem thư viện giao diện
              </DemoLink>
              <DemoLink to={composedDemoPath} variant="stroke">
                Xem ví dụ màn hình ghép
              </DemoLink>
            </div>
          )}
        </Surface>
      </section>
    </PageShell>
  );
}

export default HomePage;
