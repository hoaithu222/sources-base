import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

/**
 * Test cho ba CỔNG KIỂM tĩnh: `check-contrast.mjs`, `check-touch-targets.mjs`
 * và `check-file-size.mjs`.
 *
 * ── Vì sao test một script, không phải test component ────────────────────────
 * Ba script này tồn tại chính vì test runtime KHÔNG làm được việc của chúng:
 * NativeWind không biên dịch class trong Jest nên `style` luôn rỗng (xem
 * `docs/rules/testing.md`). Nhưng bản thân script thì lại rất dễ hỏng ÂM THẦM
 * theo đúng cái kiểu nó sinh ra để chặn: sửa một regex, sửa cách gom phạm vi,
 * và nó lặng lẽ ngừng tìm thấy gì — vẫn in "✅", vẫn thoát 0, cổng kiểm vẫn
 * xanh, chỉ là không còn bảo vệ ai nữa.
 *
 * Nên ở đây cho script chạy trên một cây nguồn GIẢ có lỗi cố ý, rồi đòi nó phải
 * đỏ. Cây giả nằm ở thư mục tạm của hệ điều hành ⛔ chứ không nằm trong repo:
 * `tsconfig.json` gom mọi file `.ts`/`.tsx` nên một file mồi đặt trong `tests/`
 * sẽ bị `tsc` và ESLint soi, còn file mồi trong `src/` thì lọt luôn vào chính
 * ba cổng kiểm này.
 */
const ROOT = path.join(__dirname, '..', '..');

/**
 * Dựng một thư mục nguồn giả, chạy script lên nó, dọn sạch.
 *
 * `files` và `env` nhận được đường dẫn thư mục tạm vì có trình soát cần biết nó:
 * manifest của `check-file-size.mjs` khoá nợ theo ĐƯỜNG DẪN, nên file mồi phải
 * tự khai đường dẫn của chính mình.
 */
function runOn(
  script: string,
  files: Record<string, string> | ((dir: string) => Record<string, string>),
  env?: (dir: string) => Record<string, string>,
) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'base-android-gate-'));
  try {
    for (const [name, content] of Object.entries(typeof files === 'function' ? files(dir) : files))
      fs.writeFileSync(path.join(dir, name), content, 'utf8');

    const result = spawnSync(process.execPath, [path.join(ROOT, 'scripts', script), dir], {
      encoding: 'utf8',
      env: { ...process.env, ...env?.(dir) },
    });
    return { status: result.status, output: `${result.stdout}${result.stderr}` };
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

describe('check-contrast.mjs', () => {
  it('đỏ khi chữ mờ đặt lên nền sáng — cặp cùng MỘT chuỗi class', () => {
    const { status, output } = runOn('check-contrast.mjs', {
      'Bad.tsx': 'export const A = () => <View className="bg-bg-1 text-fg-4">x</View>;\n',
    });

    expect(status).toBe(1);
    // 1.73:1 là đúng con số đo tay đang nằm trong `Divider.tsx` — nếu công thức
    // WCAG ở script bị sửa hỏng thì số này lệch ngay.
    expect(output).toContain('bg-bg-1 + text-fg-4');
    expect(output).toContain('1.73:1');
  });

  it('đỏ khi nền và màu chữ nằm ở hai slot của CÙNG một object tv()', () => {
    const { status, output } = runOn('check-contrast.mjs', {
      'Bad.tsx': "const s = { root: 'bg-bg-1', label: 'text-fg-4' };\nexport default s;\n",
    });

    expect(status).toBe(1);
    expect(output).toContain('bg-bg-1 + text-fg-4');
  });

  it('⛔ KHÔNG ghép nền của biến thể này với màu chữ của biến thể kia', () => {
    const { status } = runOn('check-contrast.mjs', {
      'Ok.tsx':
        'const s = {\n' +
        "  selected: { root: 'bg-bg-1', label: 'text-fg-1' },\n" +
        "  ghost: { label: 'text-fg-4' },\n" +
        '};\nexport default s;\n',
    });

    // `bg-bg-1` (biến thể `selected`) + `text-fg-4` (biến thể `ghost`) là một
    // cặp KHÔNG bao giờ xuất hiện trên màn hình. Ghép nó là báo nhầm.
    expect(status).toBe(0);
  });

  it('bỏ qua trạng thái vô hiệu — WCAG 1.4.3 loại trừ thành phần không hoạt động', () => {
    const { status } = runOn('check-contrast.mjs', {
      'Ok.tsx':
        'export const A = () => <View className="bg-action-disabled text-action-disabled-fg">x</View>;\n',
    });

    expect(status).toBe(0);
  });
});

describe('check-touch-targets.mjs', () => {
  it('đỏ khi thẻ bấm được cao 40dp mà không có hitSlop', () => {
    const { status, output } = runOn('check-touch-targets.mjs', {
      'Bad.tsx': 'export const A = () => <Pressable className="h-10 w-10" onPress={f} />;\n',
    });

    expect(status).toBe(1);
    expect(output).toContain('40dp');
  });

  it('đỏ khi hitSlop chỉ nới NGANG — không giúp gì cho chiều cao', () => {
    const { status } = runOn('check-touch-targets.mjs', {
      'Bad.tsx':
        'export const A = () => <Pressable className="h-control-xs" hitSlop={{ left: 8, right: 8 }} onPress={f} />;\n',
    });

    expect(status).toBe(1);
  });

  it('xanh khi hitSlop bù đủ, ở cả dạng số lẫn dạng object', () => {
    const { status } = runOn('check-touch-targets.mjs', {
      'Ok.tsx':
        'export const A = () => <Pressable className="h-10" hitSlop={8} onPress={f} />;\n' +
        'export const B = () => <Pressable className="h-8" hitSlop={{ bottom: 12, top: 12 }} onPress={f} />;\n' +
        'export const C = () => <Pressable className="h-11" onPress={f} />;\n',
    });

    expect(status).toBe(0);
  });

  it('đọc được chiều cao đến từ slot tv() của file bên cạnh', () => {
    const { status, output } = runOn('check-touch-targets.mjs', {
      'thing.styles.ts': "export const s = { slots: { chip: 'h-control-xs px-md' } };\n",
      'Thing.tsx':
        "import { s } from './thing.styles';\n" +
        'export const A = () => <Pressable className={s.chip()} onPress={f} />;\n',
    });

    expect(status).toBe(1);
    expect(output).toContain('32dp');
  });
});

describe('check-file-size.mjs', () => {
  /**
   * File dài đúng `n` dòng: `n−1` dòng chú thích + một dòng mã. Nội dung không
   * quan trọng — trình soát này chỉ ĐẾM DÒNG, ⛔ không phân tích cú pháp.
   */
  const lines = (n: number) => `${'// x\n'.repeat(n - 1)}export const a = 1;\n`;

  /** Khoá mà manifest dùng để nhận ra một file — đúng phép tính script làm. */
  const key = (dir: string, name: string) =>
    path.relative(ROOT, path.join(dir, name)).replaceAll('\\', '/');

  it('đỏ khi .tsx vượt 200 dòng, và nói rõ số dòng đo được', () => {
    const { status, output } = runOn('check-file-size.mjs', { 'Big.tsx': lines(201) });

    expect(status).toBe(1);
    expect(output).toContain('201 dòng');
  });

  it('đỏ khi hook/util .ts vượt 150 dòng', () => {
    const { status, output } = runOn('check-file-size.mjs', { 'use-thing.ts': lines(151) });

    expect(status).toBe(1);
    expect(output).toContain('151 dòng');
  });

  it('xanh ở ĐÚNG trần — 200 với .tsx, 150 với .ts', () => {
    const { status } = runOn('check-file-size.mjs', {
      'Ok.tsx': lines(200),
      'use-ok.ts': lines(150),
    });

    expect(status).toBe(0);
  });

  /**
   * ⚠️ Đây là nửa dễ hỏng nhất của trình soát: siết `.ts` lên MỌI file là
   * `button.styles.ts` (485 dòng vì 5 kiểu × 3 cỡ × 4 trạng thái) đỏ vĩnh viễn,
   * và người ta sẽ tắt cổng kiểm chứ không chẻ bảng công thức làm đôi.
   */
  it('miễn trừ file công thức/khai báo theo hậu tố, và file sinh tự động', () => {
    const { status } = runOn('check-file-size.mjs', {
      'a.styles.ts': lines(400),
      'b.types.ts': lines(400),
      'c.constants.ts': lines(400),
      'icons.generated.ts': lines(400),
    });

    expect(status).toBe(0);
  });

  it('tha file đã khai nợ, chừng nào nó không dài quá `max`', () => {
    const { status, output } = runOn(
      'check-file-size.mjs',
      (dir) => ({
        'debt.json': JSON.stringify({
          debt: [{ file: key(dir, 'Legacy.tsx'), max: 208, why: 'nợ cũ, cần tách' }],
        }),
        'Legacy.tsx': lines(208),
      }),
      (dir) => ({ FILE_SIZE_MANIFEST: path.join(dir, 'debt.json') }),
    );

    expect(status).toBe(0);
    expect(output).toContain('nợ đã khai: 1');
  });

  /**
   * ⛔ Không có ca này thì manifest thành một cái van xả: khai nợ ở 208 dòng
   * xong file lặng lẽ lên 400, y như một ngoại lệ tương phản khai cho 4.45:1 mà
   * tha luôn cho 1.2:1. `max` là để KHOÁ mức nợ, không phải để miễn trừ file.
   */
  it('đỏ lại khi file đã khai nợ còn PHÌNH quá `max`', () => {
    const { status, output } = runOn(
      'check-file-size.mjs',
      (dir) => ({
        'debt.json': JSON.stringify({
          debt: [{ file: key(dir, 'Legacy.tsx'), max: 208, why: 'nợ cũ, cần tách' }],
        }),
        'Legacy.tsx': lines(209),
      }),
      (dir) => ({ FILE_SIZE_MANIFEST: path.join(dir, 'debt.json') }),
    );

    expect(status).toBe(1);
    expect(output).toContain('PHÌNH');
  });

  it('đỏ khi mục nợ không nói vì sao — nợ không có lý do là nợ không ai trả', () => {
    const { status, output } = runOn(
      'check-file-size.mjs',
      (dir) => ({
        'debt.json': JSON.stringify({ debt: [{ file: key(dir, 'Legacy.tsx'), max: 300 }] }),
        'Legacy.tsx': lines(208),
      }),
      (dir) => ({ FILE_SIZE_MANIFEST: path.join(dir, 'debt.json') }),
    );

    expect(status).toBe(1);
    expect(output).toContain('thiếu "why"');
  });

  it('nhắc khi nợ đã trả xong mà mục khai còn nằm lại — nhưng KHÔNG làm đỏ', () => {
    const { status, output } = runOn(
      'check-file-size.mjs',
      (dir) => ({
        'debt.json': JSON.stringify({
          debt: [{ file: key(dir, 'Fixed.tsx'), max: 208, why: 'nợ cũ, cần tách' }],
        }),
        'Fixed.tsx': lines(120),
      }),
      (dir) => ({ FILE_SIZE_MANIFEST: path.join(dir, 'debt.json') }),
    );

    // Trả nợ xong mà cổng kiểm đỏ là dạy người ta rằng dọn dẹp thì bị phạt.
    expect(status).toBe(0);
    expect(output).toContain('Mục THỪA');
  });
});
