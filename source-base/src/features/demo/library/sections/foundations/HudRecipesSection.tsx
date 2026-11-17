import { memo } from 'react';

import {
  HUD_BAR_GLOW,
  HUD_BAR_HEAD_AFTER,
  HUD_HOT,
  HUD_TEXT_GLOW,
  HUD_TITLE_MARK,
  HUD_TRACK,
  Text,
} from '@/shared/ui';
import { cn } from '@/shared/utils/style/cn';

import DemoGrid from '../../components/shell/DemoGrid';
import DemoRow from '../../components/shell/DemoRow';
import DemoSection from '../../components/shell/DemoSection';
import {
  DEMO_HUD_DECOR_RECIPES,
  DEMO_HUD_SURFACE_RECIPES,
  type DemoHudRecipe,
} from '../../constants/foundations/hud-recipes.constants';

/** Ô mẫu trung tính: viền + nền token; công thức HUD ghép lên trên (chỉ đổi ở theme tối). */
const HUD_TILE_CLASSES =
  'relative flex h-24 items-center justify-center border border-border-default bg-bg-surface transition-[border-color,box-shadow] duration-150';

const HUD_TILE_CAPTION_CLASSES = 'flex min-w-0 flex-col gap-0.5';

/** Mẫu họ thanh: rãnh 8px + thanh 64% tông primary (biến `--hud-bar-tone`). */
const HUD_BAR_DEMO_STYLE = {
  width: '64%',
  background:
    'linear-gradient(to right, color-mix(in srgb, var(--color-primary-5) 45%, transparent), var(--color-primary-5))',
  ['--hud-bar-tone' as string]: 'var(--color-primary-5)',
};

interface HudTileProps {
  recipe: DemoHudRecipe;
}

const HudTile = memo(function HudTile({ recipe }: HudTileProps) {
  return (
    <div className="flex min-w-0 flex-col gap-2">
      <div aria-hidden className={cn(HUD_TILE_CLASSES, recipe.className)} />
      <div className={HUD_TILE_CAPTION_CLASSES}>
        <code className="text-caption-12-semibold text-fg-heading">{recipe.name}</code>
        <Text size="tiny" skin="muted">
          {recipe.usage}
        </Text>
      </div>
    </div>
  );
});

/**
 * HudRecipesSection — mục "Công thức HUD" của trang `/demo`: từng hằng `HUD_*` (`primitives/hud.theme.ts`) trên một ô
 * mẫu riêng, để soi và so từng hiệu ứng tách khỏi component. Mọi hiệu ứng CHỈ hiện ở theme tối.
 */
const HudRecipesSection = memo(function HudRecipesSection() {
  return (
    <DemoSection
      description="Nguồn chung của đổ sáng · quầng · ngoặc góc · mặt đang bật · dấu // — mọi component ghép từ đây. Chỉ hiện ở theme tối (sáng giữ sạch)."
      importPath="@/shared/ui — HUD_*"
      title="Công thức HUD"
    >
      <DemoRow label="Mặt & trạng thái" note="ô trung tính + đúng MỘT công thức" stacked>
        <DemoGrid min="sm">
          {DEMO_HUD_SURFACE_RECIPES.map((recipe) => (
            <HudTile key={recipe.name} recipe={recipe} />
          ))}
        </DemoGrid>
      </DemoRow>

      <DemoRow label="Trang trí (pseudo-element)" note="ngoặc góc · ray sáng" stacked>
        <DemoGrid min="sm">
          {DEMO_HUD_DECOR_RECIPES.map((recipe) => (
            <HudTile key={recipe.name} recipe={recipe} />
          ))}
        </DemoGrid>
      </DemoRow>

      <DemoRow
        label="HUD_TRACK · HUD_BAR_GLOW · HUD_BAR_HEAD_AFTER"
        note="họ thanh: Progress · RankingBoard · CapsuleChart · BoxInfo"
        stacked
      >
        <div className={cn('h-2 w-full max-w-md bg-bg-track', HUD_TRACK)}>
          <div
            className={cn('relative h-full', HUD_BAR_GLOW, HUD_BAR_HEAD_AFTER)}
            style={HUD_BAR_DEMO_STYLE}
          />
        </div>
      </DemoRow>

      <DemoRow label="HUD_TITLE_MARK · HUD_TEXT_GLOW · HUD_HOT" stacked>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
          <span className="flex items-center gap-2">
            <span aria-hidden className={HUD_TITLE_MARK} />
            <span className="text-body-14-semibold text-fg-heading">Tiêu đề khối</span>
          </span>
          <span className={cn('text-h3-bold tabular-nums text-fg-heading', HUD_TEXT_GLOW)}>
            128,5
          </span>
          <span className="flex items-center gap-2">
            <span
              aria-hidden
              className="size-8 border border-border-default"
              style={{ background: HUD_HOT }}
            />
            <Text size="tiny" skin="muted">
              HUD_HOT — xanh lá pha 28% ngọc (sắc &quot;đang bật&quot;)
            </Text>
          </span>
        </div>
      </DemoRow>
    </DemoSection>
  );
});

export default HudRecipesSection;
