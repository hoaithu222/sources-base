import { memo, useMemo } from 'react';

import { useEffectiveTheme } from '@/domains/preferences';
import { DARK_COLORS, LIGHT_COLORS, THEME_COLOR_KEYS, type ThemeColorKey } from '@/shared/theme';
import { Callout, Text } from '@/shared/ui';

import DemoRow from '../../components/shell/DemoRow';
import DemoSection from '../../components/shell/DemoSection';
import DemoTokenSwatch from '../../components/showcase/DemoTokenSwatch';
import {
  DEMO_FOREGROUND_TOKENS,
  DEMO_LINE_TOKENS,
  DEMO_SCALE_FAMILIES,
  DEMO_SCALE_STEPS,
  DEMO_SEMANTIC_TOKENS,
  DEMO_SURFACE_TOKENS,
} from '../../constants/foundations/color-families.constants';

/**
 * ColorTokensSection — mục "Màu sắc" của trang `/demo`: bảng token màu của cả 2 theme, sinh từ
 * `colors-theme.json`. Đọc NGANG: một họ màu, bậc 1 (nhạt) → 9 (đậm), ô trống = họ đó không có bậc ấy;
 * đọc DỌC: cùng một bậc ở các họ khác nhau.
 */
const ColorTokensSection = memo(function ColorTokensSection() {
  const theme = useEffectiveTheme();
  const palette = theme === 'dark' ? DARK_COLORS : LIGHT_COLORS;

  const hexOf = useMemo(() => (token: string) => palette[token as ThemeColorKey] ?? '', [palette]);

  return (
    <DemoSection
      description={`${THEME_COLOR_KEYS.length} token × 2 theme, sinh từ colors-theme.json. Đổi màu = sửa JSON rồi chạy npm run generate:colors.`}
      importPath="src/styles/theme/colors-theme.json"
      title="Màu sắc"
    >
      <Callout intent="warning" title="Không bao giờ viết hex trong component" variant="tinted">
        Dùng class token (<code className="font-mono">bg-primary-6</code>,{' '}
        <code className="font-mono">text-fg-subheading</code>) hoặc{' '}
        <code className="font-mono">var(--color-*)</code> khi buộc phải dùng inline style. Hex cứng
        không đổi theo theme sáng/tối.
      </Callout>

      <DemoRow label="Nền — bề mặt xếp chồng từ xa tới gần người dùng" stacked>
        <div className="grid grid-cols-5 gap-2 sm:grid-cols-10">
          {DEMO_SURFACE_TOKENS.map((t) => (
            <DemoTokenSwatch key={t} hex={hexOf(t)} tall token={t} />
          ))}
        </div>
      </DemoRow>

      <DemoRow
        label="Chữ — fg-heading nổi nhất, fg-faint mờ nhất"
        note="mẫu chữ đặt trên bg-surface: đổi theme để soi độ đọc"
        stacked
      >
        <div className="grid grid-cols-5 gap-2">
          {DEMO_FOREGROUND_TOKENS.map((t) => (
            <DemoTokenSwatch key={t} hex={hexOf(t)} kind="text" token={t} />
          ))}
        </div>
      </DemoRow>

      <DemoRow label="Nét — viền, vạch ngăn, vòng focus" note="mẫu là khung viền 2px" stacked>
        <div className="grid grid-cols-5 gap-2">
          {DEMO_LINE_TOKENS.map((t) => (
            <DemoTokenSwatch key={t} hex={hexOf(t)} kind="line" token={t} />
          ))}
        </div>
      </DemoRow>

      <DemoRow label="Ngữ nghĩa — chọn theo Ý NGHĨA, không theo cảm tính" stacked>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
          {DEMO_SEMANTIC_TOKENS.map((t) => (
            <DemoTokenSwatch key={t} hex={hexOf(t)} token={t} />
          ))}
        </div>
      </DemoRow>

      <DemoRow
        label={`Thang màu — ${DEMO_SCALE_FAMILIES.length} họ × bậc 1…9`}
        note="ô trống = họ đó không có bậc ấy; rê chuột để xem tên token đầy đủ"
        stacked
      >
        <div className="flex flex-col gap-2">
          {DEMO_SCALE_FAMILIES.map((family) => (
            <div key={family} className="flex items-start gap-2">
              <Text className="w-20 shrink-0 truncate pt-1.5 font-mono" size="tiny" weight="medium">
                {family}
              </Text>
              <div className="grid flex-1 grid-cols-9 gap-1">
                {DEMO_SCALE_STEPS.map((step) => {
                  const token = `${family}-${step}`;
                  const hex = hexOf(token);
                  return hex ? (
                    <DemoTokenSwatch key={step} hex={hex} label={String(step)} token={token} />
                  ) : (
                    <div key={step} aria-hidden="true" />
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </DemoRow>
    </DemoSection>
  );
});

export default ColorTokensSection;
