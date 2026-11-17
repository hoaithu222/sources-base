import { Fragment, memo } from 'react';

import {
  Button,
  Progress,
  ProgressCircle,
  Skeleton,
  Spinner,
  Surface,
  Text,
  type SkeletonVariant,
} from '@/shared/ui';

import {
  PROGRESS_CIRCLE_SIZES,
  PROGRESS_CIRCLE_VARIANTS,
  PROGRESS_SIZES,
  PROGRESS_VARIANTS,
  SKELETON_ROUNDED,
  SKELETON_VARIANTS,
  SPINNER_COLORS,
  SPINNER_SIZES,
} from '../../constants/feedback-overlays/feedback.constants';
import DemoRow from '../../components/shell/DemoRow';
import DemoSection from '../../components/shell/DemoSection';

const SKELETON_DEMO_BOX: Record<SkeletonVariant, { width: number; height: number }> = {
  text: { width: 160, height: 12 },
  rectangle: { width: 96, height: 48 },
  circle: { width: 48, height: 48 },
};

/**
 * FeedbackIndicatorsSection — mục "Chỉ báo trạng thái" của trang `/demo`: `Spinner` · `Skeleton` · `Progress` · `ProgressCircle`.
 */
const FeedbackIndicatorsSection = memo(function FeedbackIndicatorsSection() {
  return (
    <DemoSection
      description="Spinner · Skeleton · Progress · ProgressCircle — chỉ báo tải/tiến độ, không kèm text trạng thái."
      importPath="@/shared/ui"
      title="Chỉ báo tiến độ"
    >
      <DemoRow
        label="Spinner · size × color"
        note="cung chuyển sắc quay trên rãnh divider-default; theme tối có quầng sáng phía trong"
        stacked
      >
        <div className="grid w-fit grid-cols-[40px_repeat(8,minmax(52px,max-content))] items-center justify-items-center gap-3">
          <span />
          {SPINNER_COLORS.map((color) => (
            <Text key={color} className="font-mono" size="extraTiny" skin="muted">
              {color}
            </Text>
          ))}
          {SPINNER_SIZES.map((size) => (
            <Fragment key={size}>
              <Text className="font-mono" size="extraTiny" skin="muted">
                {size}
              </Text>
              {SPINNER_COLORS.map((color) => (
                <Spinner key={color} color={color} size={size} />
              ))}
            </Fragment>
          ))}
        </div>
      </DemoRow>

      <DemoRow
        label="Spinner · color=inherit"
        note="Button loading tự dùng — cung theo màu chữ của nút, rãnh = 25% màu đó"
      >
        <Button loading size="sm">
          Đang lưu
        </Button>
        <Button loading size="sm" variant="stroke">
          Đang tải
        </Button>
        <Button loading size="sm" skin="danger" variant="secondary">
          Đang xoá
        </Button>
      </DemoRow>

      <DemoRow label="Skeleton · variant" note="vệt sáng quét ngang, giữ đúng khung nội dung thật">
        {SKELETON_VARIANTS.map((variant) => (
          <Skeleton key={variant} variant={variant} {...SKELETON_DEMO_BOX[variant]} />
        ))}
      </DemoRow>

      <DemoRow label="Skeleton · rounded (variant=rectangle)">
        {SKELETON_ROUNDED.map((rounded) => (
          <Skeleton key={rounded} height={40} rounded={rounded} variant="rectangle" width={64} />
        ))}
      </DemoRow>

      <DemoRow label="Skeleton · ghép khung thẻ đang tải" stacked width="narrow">
        <Surface className="flex w-full items-center gap-3" padding="md">
          <Skeleton height={40} variant="circle" width={40} />
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <Skeleton variant="text" width="45%" />
            <Skeleton variant="text" width="85%" />
            <Skeleton variant="text" width="65%" />
          </div>
        </Surface>
      </DemoRow>

      <DemoRow
        label="Progress · variant (size=md)"
        note="chữ % trung tính, màu nằm ở thanh"
        stacked
      >
        <div className="flex w-full max-w-md flex-col gap-2">
          {PROGRESS_VARIANTS.map((variant, i) => (
            <Progress key={variant} showValue value={30 + i * 15} variant={variant} />
          ))}
        </div>
      </DemoRow>

      <DemoRow label="Progress · size" stacked>
        <div className="grid w-full max-w-md grid-cols-[24px_1fr] items-center gap-x-3 gap-y-2">
          {PROGRESS_SIZES.map((size) => (
            <Fragment key={size}>
              <Text className="font-mono" size="extraTiny" skin="muted">
                {size}
              </Text>
              <Progress showValue size={size} value={64} />
            </Fragment>
          ))}
        </div>
      </DemoRow>

      <DemoRow label="Progress · biên & max" note="0% · 100% · value=30 max=50 → 60%" stacked>
        <div className="flex w-full max-w-md flex-col gap-2">
          <Progress showValue value={0} />
          <Progress showValue value={100} variant="success" />
          <Progress max={50} showValue value={30} variant="warning" />
        </div>
      </DemoRow>

      <DemoRow
        label="ProgressCircle · size × variant"
        note="xs quá nhỏ để in số nên tự ẩn %"
        stacked
      >
        <div className="grid w-fit grid-cols-[40px_repeat(6,minmax(64px,max-content))] items-center justify-items-center gap-3">
          <span />
          {PROGRESS_CIRCLE_VARIANTS.map((variant) => (
            <Text key={variant} className="font-mono" size="extraTiny" skin="muted">
              {variant}
            </Text>
          ))}
          {PROGRESS_CIRCLE_SIZES.map((size) => (
            <Fragment key={size}>
              <Text className="font-mono" size="extraTiny" skin="muted">
                {size}
              </Text>
              {PROGRESS_CIRCLE_VARIANTS.map((variant, i) => (
                <ProgressCircle
                  key={variant}
                  showValue
                  size={size}
                  value={20 + i * 16}
                  variant={variant}
                />
              ))}
            </Fragment>
          ))}
        </div>
      </DemoRow>

      <DemoRow label="ProgressCircle · biên" note="0% không vẽ cung · 3% nắp vuông · 100% khép kín">
        <ProgressCircle showValue size="md" value={0} />
        <ProgressCircle showValue size="md" value={3} variant="warning" />
        <ProgressCircle showValue size="md" value={100} variant="success" />
      </DemoRow>
    </DemoSection>
  );
});

export default FeedbackIndicatorsSection;
