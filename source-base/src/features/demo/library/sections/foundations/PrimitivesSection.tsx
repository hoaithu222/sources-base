import { Fragment, memo } from 'react';

import { Avatar, Badge, Divider, GemIcon, Text } from '@/shared/ui';
import { SystemIcon } from '@/shared/ui/icons/Icons';

import DemoRow from '../../components/shell/DemoRow';
import DemoSection from '../../components/shell/DemoSection';
import {
  AVATAR_SIZES,
  BADGE_COLORS,
  BADGE_SIZES,
  BADGE_VARIANTS,
  DEMO_AVATAR_SRC,
  DIVIDER_VARIANTS,
  GEM_COLORS,
  GEM_ICON_PX,
  GEM_SIZES,
} from '../../constants/foundations/primitives.constants';

/** Sáu tên rơi vào đủ sáu ô màu của Avatar (băm theo tổng mã ký tự). */
const AVATAR_PALETTE_NAMES = [
  'Bùi Quang',
  'Lý Khánh',
  'Phạm Hà',
  'Đặng Thu',
  'Hoàng Minh',
  'Mai Hương',
];

/**
 * PrimitivesSection — mục "Nguyên tố" của trang `/demo`: `Avatar` · `Badge` · `Divider` · `GemIcon`.
 */
const PrimitivesSection = memo(function PrimitivesSection() {
  return (
    <DemoSection
      description="Avatar · Badge · Divider · GemIcon — xem phần Chữ ở trên cho Heading/Text."
      importPath="@/shared/ui"
      title="Nguyên tố"
    >
      <DemoRow label="Badge · color" note="9 màu — chọn theo Ý NGHĨA trạng thái">
        {BADGE_COLORS.map((color) => (
          <Badge key={color} color={color} variant="tinted">
            {color}
          </Badge>
        ))}
      </DemoRow>

      <DemoRow label="Badge · size" note="xs → lg; mọi variant cùng chiều cao (viền là ring-inset)">
        {BADGE_SIZES.map((size) => (
          <Fragment key={size}>
            <Badge color="info" dot size={size}>
              {size}
            </Badge>
            <Badge color="info" size={size} variant="solid">
              {size}
            </Badge>
          </Fragment>
        ))}
      </DemoRow>

      <DemoRow
        label="Badge · color × variant"
        note="9 màu × 4 kiểu — chữ đổi bậc theo theme để đọc được ở cả sáng lẫn tối"
        stacked
      >
        <div className="grid w-fit grid-cols-[92px_repeat(4,max-content)] items-center gap-x-6 gap-y-2">
          <span />
          {BADGE_VARIANTS.map((variant) => (
            <Text key={variant} className="font-mono" size="extraTiny" skin="muted">
              {variant}
            </Text>
          ))}
          {BADGE_COLORS.map((color) => (
            <Fragment key={color}>
              <Text className="font-mono" size="extraTiny" skin="muted">
                {color}
              </Text>
              {BADGE_VARIANTS.map((variant) => (
                <Badge key={variant} color={color} variant={variant}>
                  {color}
                </Badge>
              ))}
            </Fragment>
          ))}
        </div>
      </DemoRow>

      <DemoRow label="Badge · phụ kiện">
        <Badge color="error" dot variant="tinted">
          có chấm
        </Badge>
        <Badge
          color="warning"
          startIcon={<SystemIcon name="bell-outline" size={12} />}
          variant="tinted"
        >
          icon đầu
        </Badge>
        <Badge
          color="info"
          endIcon={<SystemIcon name="angle-right-outline" size={12} />}
          variant="tinted"
        >
          icon cuối
        </Badge>
        <Badge color="neutral" variant="tinted" onRemove={() => undefined}>
          gỡ được
        </Badge>
      </DemoRow>

      <DemoRow label="Avatar · size" note="chưa có ảnh thì lấy chữ cái đầu của tên">
        {AVATAR_SIZES.map((size) => (
          <Avatar key={size} name="Nguyễn Văn An" size={size} />
        ))}
      </DemoRow>

      <DemoRow
        label="Avatar · nền theo tên"
        note="6 ô màu, chữ luôn đủ tương phản (vàng dùng chữ đậm)"
      >
        {AVATAR_PALETTE_NAMES.map((name) => (
          <Avatar key={name} name={name} size="lg" />
        ))}
      </DemoRow>

      <DemoRow label="Avatar · shape / variant / bordered / initialsCount">
        <Avatar name="Trần Bình" shape="circle" size="lg" />
        <Avatar name="Trần Bình" shape="square" size="lg" />
        <Avatar name="Trần Bình" size="lg" variant="brand" />
        <Avatar bordered name="Trần Bình" size="lg" />
        <Avatar initialsCount={1} name="Trần Bình" size="lg" />
        <Avatar size="lg" />
      </DemoRow>

      <DemoRow
        label="Avatar · src / fallback tuỳ biến / onClick"
        note="hai avatar cuối có onClick: rê chuột, hoặc Tab tới để thấy vòng focus"
      >
        <Avatar alt="Ảnh minh hoạ" name="Lê Cường" size="lg" src={DEMO_AVATAR_SRC} />
        <Avatar
          fallback={<SystemIcon className="text-warning" name="star-bold" size={16} />}
          size="lg"
        />
        <Avatar name="Vũ Đạt" size="lg" onClick={() => undefined} />
        <Avatar bordered name="Vũ Đạt" size="lg" onClick={() => undefined} />
      </DemoRow>

      <DemoRow label="Divider · orientation × variant · nhãn" stacked>
        <div className="flex flex-col gap-2">
          {DIVIDER_VARIANTS.map((variant) => (
            <Divider key={variant} variant={variant} />
          ))}
          <Divider>hoặc</Divider>
          <div className="flex h-8 items-center gap-3">
            {DIVIDER_VARIANTS.map((variant) => (
              <Fragment key={variant}>
                <Divider orientation="vertical" variant={variant} />
                <Text size="tiny">{variant}</Text>
              </Fragment>
            ))}
          </div>
        </div>
      </DemoRow>

      <DemoRow
        label="GemIcon · color × size"
        note="icon LUÔN dùng biến thể -bold trong gem"
        stacked
      >
        <div className="grid w-fit grid-cols-[56px_repeat(3,max-content)] items-center gap-x-6 gap-y-2">
          <span />
          {GEM_SIZES.map((size) => (
            <Text key={size} className="font-mono" size="extraTiny" skin="muted">
              {size}
            </Text>
          ))}
          {GEM_COLORS.map((color) => (
            <Fragment key={color}>
              <Text className="font-mono" size="extraTiny" skin="muted">
                {color}
              </Text>
              {GEM_SIZES.map((size) => (
                <GemIcon key={size} color={color} size={size}>
                  <SystemIcon name="star-bold" size={GEM_ICON_PX[size]} />
                </GemIcon>
              ))}
            </Fragment>
          ))}
        </div>
      </DemoRow>
    </DemoSection>
  );
});

export default PrimitivesSection;
