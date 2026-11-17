/**
 * Thang chữ trang Demo, chỉ để TRÌNH BÀY — khớp `src/styles/font/font.json`; đổi cỡ chữ = sửa
 * `font.json` rồi `npm run generate:font`, các class `text-{thang}-{độ đậm}` tự cập nhật theo.
 */

interface DemoFontScale {
  token: string;
  /** Class THẬT, viết nguyên văn — KHÔNG ghép `'text-' + token` (Tailwind chỉ quét mã như văn bản thuần). */
  sample: string;
  size: string;
  lineHeight: string;
  usage: string;
}

export const DEMO_FONT_SCALES: readonly DemoFontScale[] = [
  {
    token: 'h1',
    sample: 'text-h1',
    size: '40px',
    lineHeight: '56px',
    usage: 'Tiêu đề trang giới thiệu',
  },
  { token: 'h2', sample: 'text-h2', size: '32px', lineHeight: '40px', usage: 'Tiêu đề mục lớn' },
  { token: 'h3', sample: 'text-h3', size: '24px', lineHeight: '36px', usage: 'Tiêu đề màn hình' },
  { token: 'h4', sample: 'text-h4', size: '20px', lineHeight: '32px', usage: 'Tiêu đề khối' },
  {
    token: 'body-18',
    sample: 'text-body-18',
    size: '18px',
    lineHeight: '28px',
    usage: 'Đoạn văn nổi',
  },
  {
    token: 'body-16',
    sample: 'text-body-16',
    size: '16px',
    lineHeight: '24px',
    usage: 'Đoạn văn mặc định',
  },
  {
    token: 'body-14',
    sample: 'text-body-14',
    size: '14px',
    lineHeight: '20px',
    usage: 'Chữ thân + nhãn — dùng nhiều nhất',
  },
  {
    token: 'body',
    sample: 'text-body',
    size: '13px',
    lineHeight: '20px',
    usage: 'Bảng dày dữ liệu',
  },
  {
    token: 'body-13',
    sample: 'text-body-13',
    size: '13px',
    lineHeight: '16px',
    usage: 'Chữ trong control một dòng: ô nhập, cây, phân trang',
  },
  {
    token: 'caption-12',
    sample: 'text-caption-12',
    size: '12px',
    lineHeight: '16px',
    usage: 'Chú thích, gợi ý',
  },
  {
    token: 'caption-12-tight',
    sample: 'text-caption-12-tight',
    size: '12px',
    lineHeight: '14px',
    usage: 'Huy hiệu sm, chữ cái avatar — khung thấp',
  },
  {
    token: 'caption-10',
    sample: 'text-caption-10',
    size: '10px',
    lineHeight: '16px',
    usage: 'Nhãn siêu nhỏ, đơn vị',
  },
  {
    token: 'caption-10-tight',
    sample: 'text-caption-10-tight',
    size: '10px',
    lineHeight: '12px',
    usage: 'Huy hiệu xs',
  },
  {
    token: 'caption-9',
    sample: 'text-caption-9',
    size: '9px',
    lineHeight: '12px',
    usage: 'Chữ cái avatar 2xs, nhãn đuôi tệp — KHÔNG cho chart (sàn 11px)',
  },
] as const;

export const DEMO_FONT_WEIGHTS = [
  { label: '(thường)', sample: 'text-body-16' },
  { label: 'medium', sample: 'text-body-16-medium' },
  { label: 'semibold', sample: 'text-body-16-semibold' },
  { label: 'bold', sample: 'text-body-16-bold' },
] as const;

/**
 * Ví dụ SAI, in nguyên văn trên trang Demo. Cờ `font-guard-quote` cuối dòng bảo
 * `tests/policy/styling/font-tokens.test.ts` bỏ qua dòng này — nó là TRÍCH DẪN, không phải chỗ dùng thật.
 */
export const BANNED_FONT_UTILITIES = 'text-sm font-medium leading-5'; // font-guard-quote

/** Mọi bậc của `Heading` — `micro`/`nano` render ra `<p>`, KHÔNG phải thẻ heading. */
export const DEMO_HEADING_SIZES = [
  { size: 'extraLarge', tag: 'h1' },
  { size: 'large', tag: 'h2' },
  { size: 'medium', tag: 'h3' },
  { size: 'small', tag: 'h4' },
  { size: 'tiny', tag: 'h5' },
  { size: 'extraTiny', tag: 'h6' },
  { size: 'micro', tag: 'p' },
  { size: 'nano', tag: 'p' },
] as const;

/** Ba độ đậm mà `<Text>` nhận. `bold` cố ý ánh xạ về Medium — Figma dừng ở 500. */
export const DEMO_TEXT_WEIGHTS = ['normal', 'medium', 'bold'] as const;
