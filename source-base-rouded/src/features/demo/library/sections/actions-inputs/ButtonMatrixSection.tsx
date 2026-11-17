import { Fragment, memo } from 'react';

import { Button, Text } from '@/shared/ui';
import { SystemIcon } from '@/shared/ui/icons/Icons';

import DemoRow from '../../components/shell/DemoRow';
import DemoSection from '../../components/shell/DemoSection';
import {
  BUTTON_SIZES,
  BUTTON_SKINS,
  BUTTON_VARIANTS,
} from '../../constants/actions-inputs/actions.constants';

const BUTTON_MATRIX_GRID_CLASSES =
  'grid w-fit grid-cols-[76px_repeat(4,max-content)] items-center gap-x-6 gap-y-2';

const BUTTON_STATES = ['loading', 'disabled', 'iconOnly'] as const;

/**
 * ButtonMatrixSection — mục "Ma trận nút" của trang `/demo`: đủ ma trận variant × skin × size của `Button`,
 * cuối cùng là hàng trạng thái loading / disabled / iconOnly (nút vuông chỉ icon).
 */
const ButtonMatrixSection = memo(function ButtonMatrixSection() {
  return (
    <DemoSection
      description="variant (4) × skin (4) × size (5) — mỗi cỡ 1 bảng variant×skin riêng, cuối cùng là loading / disabled / iconOnly."
      importPath="@/shared/ui"
      title="Nút (đủ ma trận)"
    >
      {BUTTON_SIZES.map((size) => (
        <DemoRow key={size} label={`size="${size}"`} stacked>
          <div className={BUTTON_MATRIX_GRID_CLASSES}>
            <span />
            {BUTTON_SKINS.map((skin) => (
              <Text key={skin} className="font-mono" size="extraTiny" skin="muted">
                {skin}
              </Text>
            ))}
            {BUTTON_VARIANTS.map((variant) => (
              <Fragment key={variant}>
                <Text className="font-mono" size="extraTiny" skin="muted">
                  {variant}
                </Text>
                {BUTTON_SKINS.map((skin) => (
                  <Button key={skin} size={size} skin={skin} variant={variant}>
                    Nút
                  </Button>
                ))}
              </Fragment>
            ))}
          </div>
        </DemoRow>
      ))}

      <DemoRow label='trạng thái · size="md" · loading / disabled / iconOnly × variant' stacked>
        <div className={BUTTON_MATRIX_GRID_CLASSES}>
          {BUTTON_STATES.map((state) => (
            <Fragment key={state}>
              <Text className="font-mono" size="extraTiny" skin="muted">
                {state}
              </Text>
              {BUTTON_VARIANTS.map((variant) => {
                const iconOnly = state === 'iconOnly';
                const icon = <SystemIcon name="floppy-disk-outline" size={16} />;
                return (
                  <Button
                    key={variant}
                    aria-label={iconOnly ? `Lưu (${variant})` : undefined}
                    disabled={state === 'disabled'}
                    iconOnly={iconOnly}
                    loading={state === 'loading'}
                    size="md"
                    startIcon={iconOnly ? undefined : icon}
                    title={iconOnly ? 'Lưu' : undefined}
                    variant={variant}
                  >
                    {iconOnly ? icon : variant}
                  </Button>
                );
              })}
            </Fragment>
          ))}
        </div>
      </DemoRow>
    </DemoSection>
  );
});

export default ButtonMatrixSection;
