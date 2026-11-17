'use client';

import { useId, useState } from 'react';
import { SystemIcon } from '@/shared/ui/icons/Icons';
import { HUD_TITLE_MARK } from '@/shared/ui/primitives/hud.theme';
import { TOUCH_HIT_CLASSES } from '@/shared/ui/primitives/touch-hit.theme';
import { cn } from '@/shared/utils/style/cn';

export interface FormSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  collapsible?: boolean;
  defaultOpen?: boolean;
  className?: string;
}

const FORM_SECTION_HEADER_CLASSES = 'flex items-start gap-2 pb-2 border-b border-divider-default';

/** Vạch dọc thương hiệu trước tiêu đề — cùng hình `BoxPanel` (`HUD_TITLE_MARK`), canh giữa dòng chữ 20px đầu. */
const FORM_SECTION_MARK_CLASSES = cn('mt-0.5 ml-1', HUD_TITLE_MARK);

const FORM_SECTION_TEXT_CLASSES = 'flex min-w-0 flex-1 flex-col gap-0.5';

const FORM_SECTION_TITLE_CLASSES = 'text-body-14-semibold text-fg-heading';

const FORM_SECTION_DESCRIPTION_CLASSES = 'text-caption-12 text-fg-muted';

const FORM_SECTION_TOGGLE_CLASSES = cn(
  TOUCH_HIT_CLASSES.row,
  'group flex w-full cursor-pointer select-none items-center justify-between gap-2 text-left',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring-focus',
);

const FORM_SECTION_CHEVRON_CLASSES = cn(
  'inline-flex size-6 shrink-0 items-center justify-center rounded-sm text-fg-muted',
  'transition-[color,background-color,transform] duration-150 ease-out motion-reduce:transition-none',
  'group-hover:bg-bg-subtle group-hover:text-fg-heading',
);

const FORM_SECTION_BODY_CLASSES = 'flex flex-col gap-4';

/**
 * FormSection — nhóm field có tiêu đề (vạch dọc thương hiệu + mô tả + đường kẻ), tuỳ chọn thu gọn được.
 *
 * Đặt trong `<Form>`, bọc một cụm field liên quan (thường kèm `FormGrid` bên trong). Thu gọn được thì tiêu
 * đề là nút (`aria-expanded`) nằm TRONG `<h3>` (mẫu accordion WAI), mở / đóng bằng chuột, Enter hoặc Space.
 * Nhóm ngang hàng nhau cần chuyển qua lại → `FormTabs`; điền theo thứ tự → `FormStepper`.
 * Sửa giao diện: hàng tiêu đề + đường kẻ → `FORM_SECTION_HEADER_CLASSES` · vạch dọc →
 * `FORM_SECTION_MARK_CLASSES` · tiêu đề → `FORM_SECTION_TITLE_CLASSES` · nút thu gọn →
 * `FORM_SECTION_TOGGLE_CLASSES` / `FORM_SECTION_CHEVRON_CLASSES` · thân → `FORM_SECTION_BODY_CLASSES`.
 * Lưu ý: khi thu gọn, field bên trong bị gỡ khỏi DOM (giá trị vẫn giữ) — lỗi của chúng không hiện tới khi
 * mở lại, nên đừng thu gọn sẵn nhóm có field bắt buộc.
 *
 * @param props.title - Tiêu đề nhóm (thẻ `<h3>`).
 * @param props.description - Dòng mô tả dưới tiêu đề.
 * @param props.children - Các field của nhóm.
 * @param props.collapsible - `true` → bấm tiêu đề để thu gọn / mở. Mặc định `false`.
 * @param props.defaultOpen - Trạng thái mở ban đầu khi `collapsible`. Mặc định `true`.
 * @param props.className - Class cho khối ngoài cùng.
 *
 * @example
 * <FormSection title="Liên hệ" description="Dùng để gửi thông báo">
 *   <EmailField name="email" label="Email" />
 * </FormSection>
 *
 * <FormSection title="Tuỳ chọn thêm" collapsible defaultOpen={false}>…</FormSection>
 */
function FormSection({
  title,
  description,
  children,
  collapsible = false,
  defaultOpen = true,
  className,
}: FormSectionProps) {
  const [open, setOpen] = useState(defaultOpen);
  const uid = useId();
  const contentId = `${uid}content`;
  const descriptionId = `${uid}desc`;
  const expanded = !collapsible || open;

  const sectionClassName = cn('flex flex-col gap-4', className);
  const chevronClassName = cn(FORM_SECTION_CHEVRON_CLASSES, open && 'rotate-180');
  const bodyClassName = cn(
    FORM_SECTION_BODY_CLASSES,
    collapsible && 'animate-chip-in motion-reduce:animate-none',
  );

  return (
    <div className={sectionClassName}>
      <div className={FORM_SECTION_HEADER_CLASSES}>
        <span aria-hidden className={FORM_SECTION_MARK_CLASSES} />
        <div className={FORM_SECTION_TEXT_CLASSES}>
          <h3 className={FORM_SECTION_TITLE_CLASSES}>
            {collapsible ? (
              <button
                aria-controls={open ? contentId : undefined}
                aria-describedby={description ? descriptionId : undefined}
                aria-expanded={open}
                className={FORM_SECTION_TOGGLE_CLASSES}
                type="button"
                onClick={() => setOpen((v) => !v)}
              >
                <span className="min-w-0">{title}</span>
                <span aria-hidden className={chevronClassName}>
                  <SystemIcon name="angle-down-outline" size={16} />
                </span>
              </button>
            ) : (
              title
            )}
          </h3>
          {description && (
            <p className={FORM_SECTION_DESCRIPTION_CLASSES} id={descriptionId}>
              {description}
            </p>
          )}
        </div>
      </div>

      {expanded && (
        <div className={bodyClassName} id={contentId}>
          {children}
        </div>
      )}
    </div>
  );
}

export default FormSection;
