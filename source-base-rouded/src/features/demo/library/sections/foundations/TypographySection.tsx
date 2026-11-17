import { memo } from 'react';

import { Callout, Heading, Text } from '@/shared/ui';
import { cn } from '@/shared/utils/style/cn';

import DemoRow from '../../components/shell/DemoRow';
import DemoSection from '../../components/shell/DemoSection';
import {
  BANNED_FONT_UTILITIES,
  DEMO_FONT_SCALES,
  DEMO_FONT_WEIGHTS,
  DEMO_HEADING_SIZES,
  DEMO_TEXT_WEIGHTS,
} from '../../constants/foundations/font-scale.constants';

const TEXT_SIZES = ['extraLarge', 'large', 'medium', 'small', 'body', 'tiny', 'extraTiny'] as const;

const TEXT_SKINS = [
  'standard',
  'muted',
  'primary',
  'success',
  'warning',
  'error',
  'disabled',
] as const;

/**
 * TypographySection — mục "Chữ" của trang `/demo`: thang chữ `text-{thang}-{độ đậm}` · `Heading` · `Text`.
 */
const TypographySection = memo(function TypographySection() {
  return (
    <DemoSection
      description="14 thang × 4 độ đậm, sinh từ font.json. Ở chế độ TV mọi thang nhân --ui-scale nên chữ to lên mà khung giữ nguyên."
      importPath="src/styles/font/font.json"
      title="Chữ"
    >
      <Callout intent="warning" title="Không dùng utility chữ thô của Tailwind" variant="tinted">
        <code className="font-mono">{BANNED_FONT_UTILITIES}</code> → thay bằng{' '}
        <code className="font-mono">text-body-14-medium</code>. Ba class rời không nhân được với{' '}
        <code className="font-mono">--ui-scale</code> nên chế độ TV bỏ qua chúng — chữ đứng yên 14px
        trong khi mọi thứ quanh nó nở ra.
      </Callout>

      <DemoRow
        label={`Thang chữ — ${DEMO_FONT_SCALES.length} bậc · cỡ / giãn dòng / chỗ dùng`}
        stacked
      >
        <div className="flex flex-col">
          {DEMO_FONT_SCALES.map((s) => (
            <div
              key={s.token}
              className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5 border-b border-divider-default py-2 last:border-b-0"
            >
              <span className={cn(s.sample, 'min-w-0 flex-1 text-fg-heading')}>
                Xây dựng nền tảng — Aa Bb 0123
              </span>
              <Text className="w-40 shrink-0 truncate font-mono" size="tiny" weight="medium">
                {s.sample}
              </Text>
              <Text className="w-20 shrink-0 tabular-nums" size="tiny" skin="muted">
                {s.size}/{s.lineHeight}
              </Text>
              <Text className="w-64 shrink-0" size="tiny" skin="muted">
                {s.usage}
              </Text>
            </div>
          ))}
        </div>
      </DemoRow>

      <DemoRow label="Độ đậm — bốn bậc sinh cho MỌI thang" stacked>
        <div className="flex flex-col gap-0.5">
          {DEMO_FONT_WEIGHTS.map((w) => (
            <span key={w.label} className={cn(w.sample, 'text-fg-heading')}>
              {w.label} — Xây dựng nền tảng 0123
            </span>
          ))}
        </div>
      </DemoRow>

      <DemoRow
        label="Heading · size"
        note="6 bậc đầu ra thẻ heading thật; micro/nano ra <p> — chúng chỉ mượn cỡ chữ, không phải mốc cấu trúc trang"
        stacked
      >
        <div className="flex flex-col gap-1">
          {DEMO_HEADING_SIZES.map((h) => (
            <Heading key={h.size} size={h.size}>
              {h.size} → &lt;{h.tag}&gt;
            </Heading>
          ))}
        </div>
      </DemoRow>

      <DemoRow label="Heading · light" note="mặc định bật — tắt khi cần nét đặc hơn" stacked>
        <div className="flex flex-col gap-1">
          <Heading size="small">light (mặc định)</Heading>
          <Heading light={false} size="small">
            light={'{false}'}
          </Heading>
        </div>
      </DemoRow>

      <DemoRow label="Text · size">
        {TEXT_SIZES.map((size) => (
          <Text key={size} size={size}>
            {size}
          </Text>
        ))}
      </DemoRow>

      <DemoRow label="Text · skin" note="màu theo Ý NGHĨA, tự lật khi đổi theme">
        {TEXT_SKINS.map((skin) => (
          <Text key={skin} size="small" skin={skin}>
            {skin}
          </Text>
        ))}
      </DemoRow>

      <DemoRow label="Text · weight" note="bold cố ý ánh xạ về Medium — thang chữ Figma dừng ở 500">
        {DEMO_TEXT_WEIGHTS.map((weight) => (
          <Text key={weight} size="medium" weight={weight}>
            {weight}
          </Text>
        ))}
      </DemoRow>

      <DemoRow
        label="Text · ellipsis + as"
        note="ellipsis tự gắn tooltip KHI chữ bị cắt; as đổi thẻ HTML mà giữ nguyên kiểu chữ"
        stacked
      >
        <div className="flex max-w-xs flex-col gap-1">
          <Text ellipsis size="small">
            Một dòng rất dài cố tình vượt quá bề ngang của khung để thấy chỗ bị cắt và tooltip
          </Text>
          <Text as="label" size="small" weight="medium">
            as="label" — vẫn là kiểu chữ của Text
          </Text>
        </div>
      </DemoRow>

      <DemoRow label="Số liệu" note="tabular-nums cho cột số thẳng hàng — KHÔNG dùng font mono">
        <Text className="tabular-nums" size="medium">
          1.234.567
        </Text>
        <Text className="tabular-nums" size="medium">
          9.876.543
        </Text>
      </DemoRow>
    </DemoSection>
  );
});

export default TypographySection;
