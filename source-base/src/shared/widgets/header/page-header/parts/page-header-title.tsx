import { memo } from 'react';
import type { ReactNode } from 'react';

import type { TitleIconColor } from '@/shared/ui';
import { cn } from '@/shared/utils/style/cn';

import {
  PAGE_HEADER_SIDE_CLASSES,
  PAGE_HEADER_SIDED_CLASSES,
  PAGE_HEADER_SIZE_CLASSES,
  PAGE_HEADER_SLOT_CLASSES,
  PAGE_HEADER_SUBTITLE_CLASSES,
  pageHeaderTitleFit,
  plateToneStyle,
  type PageHeaderLayout,
  type PageHeaderSide,
  type PageHeaderTitleSize,
} from '../page-header.theme';
import PlateDecor from './plate-decor';

/** Phần bảng tên trong props của `PageHeader` (`PageHeaderProps` kế thừa nguyên). */
export interface PageHeaderTitleProps {
  title: string;
  subtitle?: ReactNode;
  tone?: TitleIconColor;
  titleSize?: PageHeaderTitleSize;
}

interface PageHeaderTitlePlateProps extends PageHeaderTitleProps {
  /** Bố cục cụm tâm (`PageHeaderLayout`) — quyết định sàn bề rộng + trần chữ + chỗ bảng tên chui vào ô bên. */
  layout?: PageHeaderLayout;
  /** Trang có nhiều tab: bỏ cánh `///` ở md..2xl (xem `PAGE_HEADER_SLOT_CLASSES.wingDense`). */
  dense?: boolean;
}

interface WingProps {
  side: PageHeaderSide;
  tone: TitleIconColor;
  dense: boolean;
}

const Wing = memo(function Wing({ side, tone, dense }: WingProps) {
  const toneVar = `var(--color-${tone}-5)`;

  const wingClassName = cn(
    PAGE_HEADER_SLOT_CLASSES.wing,
    PAGE_HEADER_SIDE_CLASSES[side].wing,
    dense && PAGE_HEADER_SLOT_CLASSES.wingDense,
  );
  const barClassName = cn(PAGE_HEADER_SLOT_CLASSES.wingBar, PAGE_HEADER_SIDE_CLASSES[side].wingBar);
  const leadBarClassName = cn(barClassName, PAGE_HEADER_SLOT_CLASSES.wingGlow);

  return (
    <span aria-hidden className={wingClassName}>
      <span className={leadBarClassName} style={{ background: toneVar }} />
      <span
        className={barClassName}
        style={{ background: `color-mix(in srgb, ${toneVar} 65%, transparent)` }}
      />
      <span
        className={barClassName}
        style={{ background: `color-mix(in srgb, ${toneVar} 30%, transparent)` }}
      />
    </span>
  );
});

/**
 * PageHeaderTitle — "bảng tên" module treo ở cụm tâm thanh header: khung (hình keystone · bát giác · chữ nhật · không khung),
 * dấu nhấn góc, hai cánh `///` đối xứng gương, ray đáy có điểm sáng giữa. Phần nội bộ của `PageHeader`.
 *
 * THÔNG MINH: chữ tên TỰ HẠ CỠ theo độ dài (`pageHeaderTitleFit`: ≤ 16 ký tự giữ cỡ gốc, ≤ 26 hạ một bậc, dài hơn hạ hai
 * bậc) trước khi bị cắt "…"; tên và dòng phụ bị cắt vẫn đọc đủ ở `title` khi rê chuột. Dòng phụ có vạch mảnh hai bên,
 * vạch tự co biến mất khi dòng phụ dài.
 * Sửa giao diện: hình + dấu nhấn + điểm sáng → `HEADER_SKIN_SPECS[skin].plate` (`header-skin.theme.ts`) · lớp → `PAGE_HEADER_SLOT_CLASSES`
 * · cỡ chữ → `PAGE_HEADER_SIZE_CLASSES` · có/không ô nav hai bên → `PAGE_HEADER_SIDED_CLASSES` · dòng phụ → `PAGE_HEADER_SUBTITLE_CLASSES`.
 * Lưu ý: ⛔ CHỈ CÓ CHỮ, không gem icon — nhận diện module bằng `tone`. Màu qua `color-mix()` trên CSS var
 * của token (không hex); `style` inline là ngoại lệ hợp lệ của `tailwind-conventions.md` vì phụ thuộc `tone`.
 * Viền = 2 lớp `plateEdge` + `plateBg` (clip-path cắt `border`) dùng chung một đa giác; nền + quầng đọc tone qua `--plate-tone`
 * đặt trên plate, quầng (chữ · ray · cánh) CHỈ ở `dark:`. Có ô nav bên cạnh (`sided`) thì plate chui vào ô nav một đoạn
 * `--plate-cut`, cạnh vát SONG SONG với cạnh chip kề nó (`PAGE_HEADER_SIDED_CLASSES.sided.plate`). Kiểu không khung không
 * vẽ viền / thân / dấu nhấn mà thay bằng hai đường kẻ dọc ở hai mép.
 *
 * @param props.title - Tiêu đề module / bản ghi.
 * @param props.subtitle - Dòng phụ NGAY DƯỚI tiêu đề (ngày · trạng thái…): một hàng, ngắn.
 * @param props.tone - Tông màu bảng tên — nhận diện module. Mặc định `yellow`.
 * @param props.titleSize - `md` (tiêu đề TĨNH của module) | `sm` (tiêu đề ĐỘNG của trang chi tiết: chữ
 *   nhỏ hơn, trần bề rộng chặt hơn). Mặc định `md`.
 * @param props.layout - `sided` (có tab hai bên → SÀN bề rộng + siết TRẦN, viền bị che từ đường khay) | `free` (không tab → viền
 *   vẽ liền lên mép trên). Chỉ `PageHeader` truyền. Hình bảng tên giống nhau ở cả hai. Mặc định `free`.
 *
 * @example
 * <PageHeaderTitle title="Tiến độ" tone="yellow" subtitle="Tuần 32" titleSize="md" />
 */
const PageHeaderTitle = memo(function PageHeaderTitle({
  title,
  subtitle,
  tone = 'yellow',
  titleSize = 'md',
  layout = 'free',
  dense = false,
}: PageHeaderTitlePlateProps) {
  const hasSubtitle = subtitle != null && subtitle !== false;

  const plateClassName = cn(
    PAGE_HEADER_SLOT_CLASSES.plate,
    PAGE_HEADER_SIZE_CLASSES[titleSize].plate,
    PAGE_HEADER_SIDED_CLASSES[layout].plate,
  );
  const titleBlockClassName = cn(
    PAGE_HEADER_SLOT_CLASSES.titleBlock,
    PAGE_HEADER_SIDED_CLASSES[layout].titleBlock,
  );
  const titleClassName = cn(
    PAGE_HEADER_SLOT_CLASSES.title,
    PAGE_HEADER_SIDED_CLASSES[layout].title,
    PAGE_HEADER_SIZE_CLASSES[titleSize].title[pageHeaderTitleFit(title)],
    hasSubtitle && PAGE_HEADER_SUBTITLE_CLASSES.title,
  );

  return (
    <div className={plateClassName} style={plateToneStyle(tone)}>
      <PlateDecor shelved={layout === 'sided'} tone={tone} />

      <Wing dense={dense} side="left" tone={tone} />

      <span className={titleBlockClassName}>
        <h1 className={titleClassName} title={title}>
          {title}
        </h1>
        {hasSubtitle && (
          <span className={PAGE_HEADER_SLOT_CLASSES.subtitleRow}>
            <span
              aria-hidden
              className={cn(
                PAGE_HEADER_SLOT_CLASSES.subtitleRule,
                PAGE_HEADER_SIDE_CLASSES.left.rule,
              )}
            />
            <span
              className={PAGE_HEADER_SLOT_CLASSES.subtitle}
              title={typeof subtitle === 'string' ? subtitle : undefined}
            >
              {subtitle}
            </span>
            <span
              aria-hidden
              className={cn(
                PAGE_HEADER_SLOT_CLASSES.subtitleRule,
                PAGE_HEADER_SIDE_CLASSES.right.rule,
              )}
            />
          </span>
        )}
      </span>

      <Wing dense={dense} side="right" tone={tone} />
    </div>
  );
});

export default PageHeaderTitle;
