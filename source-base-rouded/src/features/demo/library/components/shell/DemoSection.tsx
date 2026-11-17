import { memo, type ReactNode } from 'react';

import { BoxPanel } from '@/shared/ui';
import { cn } from '@/shared/utils/style/cn';

interface DemoSectionProps {
  title: string;
  description?: string;
  importPath?: string;
  children: ReactNode;
}

const DEMO_SECTION_BODY_CLASSES = 'flex flex-col gap-3 p-3';

const DEMO_SECTION_IMPORT_CLASSES =
  'max-w-80 truncate rounded-md border border-border-default bg-bg-subtle px-1.5 py-0.5 font-mono text-caption-10 text-fg-muted';

/** Dưới `sm` chip import xuống đầu thân (cùng kiểu, vừa bề ngang) — trên header nó giành chỗ của tiêu đề. */
const DEMO_SECTION_IMPORT_PHONE_CLASSES = 'self-start sm:hidden';

const DEMO_SECTION_IMPORT_HEADER_CLASSES = 'max-sm:hidden';

/**
 * DemoSection — khung của MỘT khu vực trên trang `/demo`: `BoxPanel` viền mảnh + vạch ngăn dưới tiêu đề, một
 * dòng mô tả và đường import gợi ý là chip mã ở góc phải header; thân xếp dọc các `DemoRow` / `DemoGrid`.
 *
 * Dưới `sm` chip import chuyển từ header xuống đầu thân (header hẹp thì tiêu đề bị cắt cụt).
 * Neo `<section id>` (cho `#hash`, mục lục, `content-visibility`) do `DemoPage` dựng từ `DEMO_SECTIONS`,
 * nên section KHÔNG tự khai `id`.
 * Sửa: thân → `DEMO_SECTION_BODY_CLASSES` · chip import → `DEMO_SECTION_IMPORT_CLASSES`.
 * Lưu ý: KHÔNG hoãn gắn nội dung bằng IntersectionObserver — lý do ở `notes/code/demo.md`.
 *
 * @param props.title - Tiêu đề khu vực (có thể dài hơn nhãn ở mục lục).
 * @param props.description - Một dòng nói khu vực này chứng minh điều gì.
 * @param props.importPath - Đường import gợi ý (vd `@/shared/ui`), in thành chip mã ở góc phải header.
 * @param props.children - Các hàng mẫu.
 *
 * @example
 * <DemoSection description="variant × size" importPath="@/shared/ui" title="Nút">
 *   <DemoRow label="variant">…</DemoRow>
 * </DemoSection>
 */
const DemoSection = memo(function DemoSection({
  title,
  description,
  importPath,
  children,
}: DemoSectionProps) {
  return (
    <BoxPanel
      bodyClassName={DEMO_SECTION_BODY_CLASSES}
      border="hairline"
      description={description}
      headerDivider
      headerRight={
        importPath ? (
          <code className={cn(DEMO_SECTION_IMPORT_CLASSES, DEMO_SECTION_IMPORT_HEADER_CLASSES)}>
            {importPath}
          </code>
        ) : undefined
      }
      title={title}
    >
      {importPath ? (
        <code className={cn(DEMO_SECTION_IMPORT_CLASSES, DEMO_SECTION_IMPORT_PHONE_CLASSES)}>
          {importPath}
        </code>
      ) : null}
      {children}
    </BoxPanel>
  );
});

export default DemoSection;
