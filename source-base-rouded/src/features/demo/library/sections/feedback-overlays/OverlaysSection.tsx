import { memo } from 'react';

import { Button, Popover, Text, Tooltip, type TooltipVariant } from '@/shared/ui';

import {
  POPOVER_ALIGNS,
  POPOVER_SIDES,
  POPOVER_VARIANTS,
  TOOLTIP_ALIGNS,
  TOOLTIP_SIDES,
  TOOLTIP_VARIANTS,
} from '../../constants/feedback-overlays/overlays.constants';
import DemoRow from '../../components/shell/DemoRow';
import DemoSection from '../../components/shell/DemoSection';

/**
 * PopoverMiniContent — ruột ngắn của các popover mẫu.
 *
 * @param props.text - Dòng mô tả hiện trong popover.
 */
const PopoverMiniContent = memo(function PopoverMiniContent({ text }: { text: string }) {
  return (
    <div className="w-48 p-3">
      <Text size="tiny" skin="muted">
        {text}
      </Text>
    </div>
  );
});

/** TooltipDataContent — ruột mẫu của `Tooltip variant="data"`: tiêu đề + các dòng nhãn · số liệu. */
const TooltipDataContent = memo(function TooltipDataContent() {
  return (
    <div className="flex min-w-36 flex-col gap-1">
      <Text size="tiny" weight="medium">
        Tháng 06 / 2025
      </Text>
      <div className="flex items-center justify-between gap-3">
        <Text size="tiny" skin="muted">
          Sản lượng
        </Text>
        <Text className="tabular-nums" size="tiny" weight="medium">
          1.248 tấn
        </Text>
      </div>
      <div className="flex items-center justify-between gap-3">
        <Text size="tiny" skin="muted">
          Đạt kế hoạch
        </Text>
        <Text className="tabular-nums" size="tiny" skin="success" weight="medium">
          96,4%
        </Text>
      </div>
    </div>
  );
});

const TOOLTIP_VARIANT_CONTENT = {
  hint: 'Gợi ý một câu cho control',
  data: <TooltipDataContent />,
} satisfies Record<TooltipVariant, React.ReactNode>;

/**
 * OverlaysSection — mục "Lớp nổi" của trang `/demo`: `Tooltip` · `Popover`.
 */
const OverlaysSection = memo(function OverlaysSection() {
  return (
    <DemoSection
      description="Tooltip · Popover — lớp nổi theo con trỏ, không chặn thao tác nền. Hộp thoại xem thêm ở mục kế tiếp."
      importPath="@/shared/ui"
      title="Lớp nổi"
    >
      <DemoRow label="Tooltip · side">
        {TOOLTIP_SIDES.map((side) => (
          <Tooltip key={side} content={`Gợi ý phía ${side}`} side={side}>
            <Button size="sm" variant="stroke">
              {side}
            </Button>
          </Tooltip>
        ))}
      </DemoRow>

      <DemoRow label="Tooltip · variant / align / arrow / delayDuration / disabled">
        {TOOLTIP_VARIANTS.map((variant) => (
          <Tooltip key={variant} content={TOOLTIP_VARIANT_CONTENT[variant]} variant={variant}>
            <Button size="sm" variant="stroke">
              variant={variant}
            </Button>
          </Tooltip>
        ))}
        {TOOLTIP_ALIGNS.map((align) => (
          <Tooltip key={align} align={align} content={`Căn ${align} theo trigger`}>
            <Button size="sm" variant="stroke">
              align={align}
            </Button>
          </Tooltip>
        ))}
        <Tooltip arrow={false} content="Không có mũi tên trỏ">
          <Button size="sm" variant="stroke">
            arrow=false
          </Button>
        </Tooltip>
        <Tooltip content="Hiện tức thì, không chờ hover" delayDuration={0}>
          <Button size="sm" variant="stroke">
            delayDuration=0
          </Button>
        </Tooltip>
        <Tooltip content="Sẽ không bao giờ hiện — disabled" disabled>
          <Button size="sm" variant="stroke">
            disabled
          </Button>
        </Tooltip>
      </DemoRow>

      <DemoRow label="Popover · variant" note="glass = kính mờ; solid = nền đặc cho panel dày chữ">
        {POPOVER_VARIANTS.map((variant) => (
          <Popover
            key={variant}
            content={<PopoverMiniContent text={`Bảng nổi variant="${variant}"`} />}
            variant={variant}
          >
            <Button size="sm" variant="stroke">
              {variant}
            </Button>
          </Popover>
        ))}
      </DemoRow>

      <DemoRow label="Popover · side / align / arrow / modal">
        {POPOVER_SIDES.map((side) => (
          <Popover
            key={side}
            content={<PopoverMiniContent text={`Mở về phía ${side}`} />}
            side={side}
          >
            <Button size="sm" variant="stroke">
              side={side}
            </Button>
          </Popover>
        ))}
        {POPOVER_ALIGNS.map((align) => (
          <Popover key={align} align={align} content={<PopoverMiniContent text={`Căn ${align}`} />}>
            <Button size="sm" variant="stroke">
              align={align}
            </Button>
          </Popover>
        ))}
        <Popover arrow content={<PopoverMiniContent text="Có mũi tên trỏ vào trigger" />}>
          <Button size="sm" variant="stroke">
            arrow
          </Button>
        </Popover>
        <Popover content={<PopoverMiniContent text="modal=true — chặn tương tác nền" />} modal>
          <Button size="sm" variant="stroke">
            modal
          </Button>
        </Popover>
      </DemoRow>
    </DemoSection>
  );
});

export default OverlaysSection;
