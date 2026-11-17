/**
 * Nội dung file của repo dưới dạng chuỗi — nguồn DUY NHẤT cho mọi bài kiểm luật (`tests/policy/**`).
 *
 * Khoá tính từ gốc repo, không có `/` đầu: `src/app/App.tsx`, `docs/rules/…/x.md`, `tests/setup.ts`.
 * Glob viết đường TUYỆT ĐỐI (`/src/**`) nên khoá không đổi theo độ sâu của file test.
 *
 * Đọc bằng `import.meta.glob` của Vite, KHÔNG dùng `fs`: `tsconfig.app` cố ý không nạp type của Node
 * (code ứng dụng không được với tới API máy chủ) nên `import('fs')` đỏ ngay ở bước typecheck.
 * Đối số của `import.meta.glob` phải là object LITERAL (Vite phân tích tĩnh) — không rút thành hằng.
 */

const fromRoot = (files: Record<string, unknown>) =>
  Object.fromEntries(Object.entries(files).map(([path, text]) => [path.slice(1), String(text)]));

/** Mọi file `.ts` / `.tsx` trong `src/` — kể cả file sinh tự động (lọc bằng `isGenerated`). */
export const SOURCE_CODE: Record<string, string> = fromRoot(
  import.meta.glob('/src/**/*.{ts,tsx}', { eager: true, query: '?raw', import: 'default' }),
);

/**
 * Mọi file `.css` trong `src/`. Có nội dung thật nhờ `test.css.include` của `vite.config.ts` — thiếu
 * cấu hình đó thì vitest trả `""` cho mọi `*.css?raw` và bài kiểm CSS pass giả.
 */
export const SOURCE_CSS: Record<string, string> = fromRoot(
  import.meta.glob('/src/**/*.css', { eager: true, query: '?raw', import: 'default' }),
);

/** File không phải TS / CSS mà bài kiểm luật cần đọc: `index.html`, nguồn bảng màu. */
export const ROOT_FILES: Record<string, string> = fromRoot(
  import.meta.glob(['/index.html', '/src/styles/theme/colors-theme.json'], {
    eager: true,
    query: '?raw',
    import: 'default',
  }),
);

/** Mọi file `.ts` / `.tsx` trong `tests/` (kể cả helper và chính file này). */
export const TEST_FILES: Record<string, string> = fromRoot(
  import.meta.glob('/tests/**/*.{ts,tsx}', { eager: true, query: '?raw', import: 'default' }),
);

/** Tài liệu markdown: `docs/**`, `README.md`, `.claude/**`. */
export const DOC_FILES: Record<string, string> = fromRoot(
  import.meta.glob(['/docs/**/*.md', '/README.md', '/.claude/**/*.md'], {
    eager: true,
    query: '?raw',
    import: 'default',
  }),
);

/**
 * Đường dẫn mọi file của repo — CHỈ tên, không nạp nội dung (glob lười) — để kiểm một đường dẫn
 * nhắc trong tài liệu có tồn tại không.
 */
export const REPO_PATHS: ReadonlySet<string> = new Set(
  Object.keys(
    import.meta.glob(['/*', '/{.claude,.github,.husky,docs,public,scripts,src,tests}/**/*']),
  ).map((path) => path.slice(1)),
);

/** File do `npm run generate:*` sinh ra — không sửa tay nên không soi. */
export const isGenerated = (path: string) =>
  /\.generated\.|\/generated-[a-z]+\.css$|^src\/assets\/(icons|image)\/index\.|^src\/shared\/ui\/icons\/index\.ts$/.test(
    path,
  );

/** Mã nguồn `src/**` đã bỏ file sinh tự động. */
export const HANDWRITTEN_CODE: Record<string, string> = Object.fromEntries(
  Object.entries(SOURCE_CODE).filter(([path]) => !isGenerated(path)),
);

/**
 * Bỏ chú thích, GIỮ NGUYÊN vị trí: ký tự trong chú thích thành dấu cách, ký tự xuống dòng giữ lại —
 * số dòng / cột mà bài kiểm báo vẫn trỏ đúng chỗ. `kind: 'css'` chỉ bỏ khối `/* … *\/`; `'code'`
 * bỏ thêm `// …` (trừ `https://`).
 */
export function stripComments(text: string, kind: 'code' | 'css' = 'code'): string {
  const blank = (s: string) => s.replace(/[^\n]/g, ' ');
  const noBlocks = text.replace(/\/\*[\s\S]*?\*\//g, blank);
  if (kind === 'css') return noBlocks;
  return noBlocks.replace(
    /(^|[^:])(\/\/[^\n]*)/g,
    (_, lead: string, line: string) => lead + blank(line),
  );
}

/**
 * Số dòng THẬT — khớp `wc -l` và con số ghi trong tài liệu.
 *
 * ⛔ KHÔNG dùng thẳng `text.split('\n').length`: mọi file kết thúc bằng ký tự xuống dòng (Prettier
 * ép) nên phép tách sinh thêm một phần tử rỗng và mọi file bị đếm DƯ 1 dòng — rule ghi 200 mà cổng
 * thật chặn ở 199.
 */
export function lineCount(text: string): number {
  const normalized = text.endsWith('\n') ? text.slice(0, -1) : text;
  return normalized === '' ? 0 : normalized.split('\n').length;
}

/** Thư mục chứa file: `src/a/b.ts` → `src/a`; file ở gốc (`README.md`) → `''`. */
export const dirOf = (path: string) => path.slice(0, Math.max(path.lastIndexOf('/'), 0));

/** Tên file: `src/a/b.ts` → `b.ts`. */
export const baseName = (path: string) => path.slice(path.lastIndexOf('/') + 1);
