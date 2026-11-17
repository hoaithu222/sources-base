import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BREAKPOINTS, useBreakpoint } from '@/shared/theme';

/**
 * Đệm NGANG cho một tấm trượt bị kẹp bề rộng và canh giữa màn.
 *
 * Dùng chung cho `BottomSheet` và `TooltipSheet` — hai tấm có cùng hình học
 * (`w-full … tablet:max-w-screen-tablet tablet:self-center`) nên cùng một công
 * thức. ⛔ Đừng chép công thức này vào từng component: nó là loại số học mà sửa
 * một nơi quên nơi kia thì không test nào bắt được.
 *
 * ── ❌ Cách cũ đã SAI: `isTablet ? 0 : insets.left` ──────────────────────────
 * Lập luận cũ là "từ 600dp thì tấm đã bị kẹp 600dp và canh giữa nên hai bên dư
 * hơn tai thỏ". Chỉ đúng ở máy tính bảng thật. Ở cửa sổ **620dp** — máy gập vừa
 * mở, hoặc chia đôi màn hình trên máy tính bảng — lề mỗi bên chỉ
 * `(620 − 600) / 2 = 10dp`, trong khi khuyết camera/tai thỏ ăn tới ~44dp. Điều
 * kiện `isTablet` khi đó trả 0 và chữ đầu hàng lại chui xuống dưới phần khuyết,
 * đúng cái lỗi mà nó định chặn.
 *
 * ── ✅ So LỀ THỰC TẾ với inset, không so bậc màn hình ────────────────────────
 * Tấm chỉ cần đẩy nội dung vào thêm đúng phần inset mà lề chưa che hết:
 *
 *     lề mỗi bên = max(0, (bề rộng cửa sổ − 600) / 2)
 *     đệm cần    = max(0, inset − lề)
 *
 * Ba mốc đo được: 390dp ⇒ lề 0, đệm = inset (như cũ) · 620dp ⇒ lề 10, đệm
 * = 44 − 10 = 34 (cũ trả 0 ❌) · 1000dp ⇒ lề 200, đệm 0 (như cũ ✅).
 *
 * ⚠️ Con số 600 phải khớp với class `tablet:max-w-screen-tablet` trong
 * `bottom-sheet.styles.ts` / `tooltip-sheet.styles.ts`, nên lấy từ `BREAKPOINTS`
 * chứ ⛔ không viết `600` tại chỗ — xem `docs/rules/responsive.md`. Nơi gọi nào
 * đè trần đó bằng `className` thì phải tự lo phần đệm ngang của mình.
 */
export function useSheetEdgeInset() {
  const insets = useSafeAreaInsets();
  /* ⛔ Hook, KHÔNG phải `Dimensions.get()`: kéo thanh chia đôi màn hình là bề
     rộng đổi hàng chục lần mỗi giây, đọc một lần rồi thôi là đệm kẹt ở số cũ. */
  const { width } = useBreakpoint();

  const sideMargin = Math.max(0, (width - BREAKPOINTS.tablet) / 2);

  return {
    left: Math.max(0, insets.left - sideMargin),
    right: Math.max(0, insets.right - sideMargin),
  };
}
