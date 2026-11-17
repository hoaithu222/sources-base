/**
 * Mọi component UI kit xuất ra ngoài PHẢI có mặt trên trang thư viện giao diện.
 *
 * ── Vì sao là bài kiểm chứ không phải lời hứa ────────────────────────────────
 * Một trang trình bày design system chỉ có giá trị khi nó ĐẦY ĐỦ. Thiếu vài
 * component thì người dùng không biết là thiếu — họ kết luận "base không có cái
 * đó" rồi tự viết lại một bản trùng lặp. Đó đúng là thứ base sinh ra để ngăn.
 *
 * Trước khi có bài kiểm này, trang demo phủ 86/123 export mà không ai biết: đếm
 * bằng mắt qua 16 file section là việc không ai làm lại lần thứ hai.
 *
 * Danh sách export lấy từ CHUỖI BARREL (`tests/helpers/ui-kit-exports.ts`), nên thêm component mới
 * vào UI kit là nó tự nằm trong phạm vi — không phải nhớ cập nhật danh sách nào.
 */

import { describe, expect, it } from 'vitest';

import { SOURCE_CODE } from '@tests/helpers/source-files';
import { UI_KIT_EXPORTS } from '@tests/helpers/ui-kit-exports';

/**
 * Component, hằng công khai (`FIELD_HEIGHT`…) và hook của UI kit. Kiểu bị xoá lúc biên dịch nên
 * không có gì để trình bày; hàm `camelCase` (`showToast`…) là API gọi, không phải thứ để bày.
 */
const EXPORTED = new Set(
  UI_KIT_EXPORTS.filter((e) => /^[A-Z]/.test(e.name) || e.kind === 'hook').map((e) => e.name),
);

/**
 * Họ hằng `HUD_*` (`primitives/hud.theme.ts`) đã VÔ HIỆU: mọi hằng là chuỗi rỗng (theme tối cùng hình học với theme sáng)
 * nên mục "Công thức HUD" của trang demo đã xoá — không còn gì để trình bày. Giai đoạn dọn dẹp gỡ chúng khỏi barrel; khi đó
 * khối này tự rỗng (lấy tên từ barrel nên không bao giờ "cũ").
 */
const RETIRED_HUD_CONSTANTS: Record<string, string> = Object.fromEntries(
  [...EXPORTED]
    .filter((name) => name.startsWith('HUD_'))
    .map((name) => [
      name,
      'Hằng HUD đã vô hiệu (chuỗi rỗng) — chờ gỡ khỏi barrel ở giai đoạn dọn dẹp',
    ]),
);

/**
 * Export có mặt trong UI kit nhưng CỐ Ý không lên trang demo, kèm lý do.
 *
 * ⛔ Chỉ thêm vào đây khi thật sự không trình bày được, và PHẢI ghi lý do. Danh
 * sách này là nợ nhìn thấy được; thêm một dòng là tự nhận một món nợ.
 */
const INTENTIONALLY_ABSENT: Record<string, string> = {
  ...RETIRED_HUD_CONSTANTS,
  // Component đã VÔ HIỆU: trả `null`, không vẽ gì ở cả hai theme — một ô mẫu chỉ là ô trống.
  HudCorners: '@deprecated, vô hiệu (không vẽ gì) — giai đoạn dọn dẹp gỡ cùng nơi gọi',
  // Provider hạ tầng: đã bọc sẵn ở gốc ứng dụng (`AppProvider`), mount lần hai
  // trong một section sẽ tạo hai hàng đợi toast chạy song song.
  ToastProvider: 'Provider toàn cục — đã mount ở AppProvider, mount lại sẽ nhân đôi hàng đợi',
  ToastViewport: 'Chỗ neo toast toàn cục — đi kèm ToastProvider',
  ToastContainer: 'Bọc Provider + Viewport — cùng lý do trên',
};

describe('trang thư viện giao diện phủ hết UI kit', () => {
  it('mọi component xuất từ @/shared/ui đều xuất hiện trên trang demo', () => {
    /*
     * Chỉ tính những tên trang demo THẬT SỰ NHẬP VỀ, không tính tên nằm rải rác
     * trong văn bản.
     *
     * Đếm theo token thô thì một câu mô tả như "còn có `FileField`…" cũng làm
     * bài kiểm xanh trong khi màn hình chẳng có gì — đúng kiểu qua bài mà không
     * làm bài. Nhập về thì gần như chắc chắn là có dựng ra thật; và nếu nhập mà
     * không dùng, `eslint no-unused-vars` đã chặn từ trước.
     */
    const imported = new Set<string>();
    for (const [p, text] of Object.entries(SOURCE_CODE)) {
      if (!p.startsWith('src/features/demo/')) continue;
      for (const m of text.matchAll(/import\s+(?:type\s+)?\{([^}]+)\}\s+from\s+'([^']+)'/g)) {
        if (!m[2].startsWith('@/shared/ui')) continue;
        for (const raw of m[1].split(',')) {
          const t = raw.trim().replace(/^type\s+/, '');
          const name = (t.includes(' as ') ? t.split(' as ')[0] : t).trim();
          if (name) imported.add(name);
        }
      }
    }

    expect(EXPORTED.size, 'không đọc được barrel UI kit — kiểm lại ui-kit-exports').toBeGreaterThan(
      80,
    );

    const missing = [...EXPORTED]
      .filter((name) => !imported.has(name))
      .filter((name) => !(name in INTENTIONALLY_ABSENT))
      .sort();

    expect(
      missing,
      `Thiếu trên trang demo (${missing.length}):\n  ${missing.join('\n  ')}\n` +
        'Thêm vào một section trong src/features/demo/library/sections/, hoặc — nếu thật sự ' +
        'không trình bày được — khai vào INTENTIONALLY_ABSENT kèm LÝ DO.',
    ).toEqual([]);
  });

  it('danh sách miễn trừ không chứa tên đã biến mất khỏi UI kit', () => {
    const stale = Object.keys(INTENTIONALLY_ABSENT).filter((n) => !EXPORTED.has(n));

    expect(
      stale,
      `Đã bỏ khỏi UI kit nhưng còn nằm trong INTENTIONALLY_ABSENT: ${stale.join(', ')}. ` +
        'Xoá khỏi danh sách miễn trừ.',
    ).toEqual([]);
  });
});
