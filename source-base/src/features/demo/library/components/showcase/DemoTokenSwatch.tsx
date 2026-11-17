import { memo } from 'react';

import { cn } from '@/shared/utils/style/cn';

type DemoTokenSwatchKind = 'fill' | 'text' | 'line';

interface DemoTokenSwatchProps {
  token: string;
  hex?: string;
  label?: string;
  kind?: DemoTokenSwatchKind;
  tall?: boolean;
}

const DEMO_TOKEN_SWATCH_BASE_CLASSES = 'w-full border border-border-default';

const DEMO_TOKEN_SWATCH_SIZE_CLASSES = {
  regular: 'h-7',
  tall: 'h-10',
} satisfies Record<'regular' | 'tall', string>;

const DEMO_TOKEN_SWATCH_KIND_CLASSES = {
  fill: '',
  text: 'flex items-center justify-center bg-bg-surface text-body-16-semibold',
  line: 'border-2 bg-bg-surface',
} satisfies Record<DemoTokenSwatchKind, string>;

const DEMO_TOKEN_SWATCH_NAME_CLASSES =
  'truncate font-mono text-caption-10-tight-medium text-fg-heading';

const DEMO_TOKEN_SWATCH_VALUE_CLASSES = 'truncate font-mono text-caption-10-tight text-fg-muted';

function swatchStyle(kind: DemoTokenSwatchKind, token: string) {
  const color = `var(--color-${token})`;
  if (kind === 'text') return { color };
  if (kind === 'line') return { borderColor: color };
  return { backgroundColor: color };
}

/**
 * DemoTokenSwatch — ô trình bày MỘT token màu của mục "Màu sắc": mẫu tô bằng `var(--color-<token>)` (đổi theme
 * là đổi ngay) + tên token + giá trị đã giải theo theme đang bật.
 *
 * Sửa: khung mẫu → `DEMO_TOKEN_SWATCH_*_CLASSES` · màu đi qua `swatchStyle()`.
 * Lưu ý: token chữ / nét trình bày đúng VAI của nó (chữ trên nền, nét quanh khung) — mảng màu đặc của một
 * token chữ không cho biết nó đọc được hay không (`notes/code/demo.md`).
 *
 * @param props.token - Tên token KHÔNG có tiền tố `--color-` (vd `primary-5`).
 * @param props.hex - Mã màu đã giải theo theme đang bật — hiện dưới tên và trong tooltip.
 * @param props.label - Nhãn dưới mẫu, mặc định = `token` (thang màu truyền bậc vì hàng đã ghi tên họ).
 * @param props.kind - `fill` (mảng màu) | `text` (chữ "Aa" trên nền bề mặt) | `line` (khung viền 2px).
 *   Mặc định `fill`.
 * @param props.tall - `true` → mẫu cao hơn, cho token nền lớn. Mặc định `false`.
 *
 * @example
 * <DemoTokenSwatch hex="#1A94FF" token="primary-5" />
 * <DemoTokenSwatch hex="#5B6B7F" kind="text" token="fg-muted" />
 */
const DemoTokenSwatch = memo(function DemoTokenSwatch({
  token,
  hex,
  label,
  kind = 'fill',
  tall = false,
}: DemoTokenSwatchProps) {
  const swatchClassName = cn(
    DEMO_TOKEN_SWATCH_BASE_CLASSES,
    DEMO_TOKEN_SWATCH_SIZE_CLASSES[tall ? 'tall' : 'regular'],
    DEMO_TOKEN_SWATCH_KIND_CLASSES[kind],
  );

  return (
    <div className="flex min-w-0 flex-col gap-1" title={hex ? `${token} · ${hex}` : token}>
      <div aria-hidden className={swatchClassName} style={swatchStyle(kind, token)}>
        {kind === 'text' ? 'Aa' : null}
      </div>
      <div className="flex min-w-0 flex-col">
        <span className={DEMO_TOKEN_SWATCH_NAME_CLASSES}>{label ?? token}</span>
        {hex ? <span className={DEMO_TOKEN_SWATCH_VALUE_CLASSES}>{hex}</span> : null}
      </div>
    </div>
  );
});

export default DemoTokenSwatch;
