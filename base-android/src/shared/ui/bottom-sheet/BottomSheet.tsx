import { type ReactNode } from 'react';
import { Modal, Pressable, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { bottomSheet } from './bottom-sheet.styles';
import { SheetSurface } from './SheetSurface';
import { useSheetTransition } from './useSheetTransition';

/**
 * Tấm trượt lên từ đáy màn hình.
 *
 * Dùng cho lựa chọn ngắn (chọn tỉnh/thành, chọn tài khoản), xác nhận, và khối
 * thông tin dài đọc rồi bấm. Nội dung dài hơn một màn thì đặt `scrollable`.
 *
 * ── Ghi chú thiết kế (section "Bottom sheet", `259:94850`) ───────────────────
 *  1. "Chạm vùng ngoài hoặc close/indicator để tắt bottom sheet."
 *  2. Cao tối đa 742px trên khung 812 ⇒ luôn chừa dải nền mờ phía trên, để người
 *     dùng thấy mình vẫn đang ở màn hình cũ.
 *  3. Khi chạm trần: phần đầu và phần đáy đứng yên, chỉ giữa cuộn.
 *  4. "Khi dùng close button thì tắt indicator" ⇒ `showHandle` mặc định chỉ bật
 *     khi KHÔNG có tiêu đề (tức không có nút ✕).
 *
 * ── Bốn thứ quên là hỏng trên máy thật ──────────────────────────────────────
 *  · `supportedOrientations` — thiếu thì iPhone khoá portrait suốt lúc tấm mở.
 *  · `onRequestClose` — nút back cứng của Android; thiếu thì bấm back không có
 *    gì xảy ra và người dùng tưởng app treo.
 *  · `insets.bottom` — nút dưới vạch gạt ngang thì hệ điều hành nuốt cú chạm.
 *  · `insets.left`/`right` — xoay ngang thì tai thỏ ăn vào mép BÊN của tấm.
 *
 * ⚠️ Hai điều đầu ở ngay file này (`<Modal>`); hai điều sau ở `SheetSurface` —
 * chúng thuộc HÌNH HỌC của tấm, không thuộc cửa sổ native.
 */

/**
 * `GestureHandlerRootView` là component ngoài NativeWind ⇒ chỉ nhận `style`.
 *
 * ⛔ ĐỪNG đưa hằng này cho `KeyboardAvoidingView` — xem chú thích ở chỗ dùng nó.
 */
const FILL = { flex: 1 } as const;

export interface BottomSheetProps {
  /** Khối `Alert` của Figma, đứng yên dưới tiêu đề — không cuộn theo nội dung. */
  alert?: ReactNode;
  /** Class thêm cho VÙNG NỘI DUNG (không phải cho tấm — cái đó là `className`). */
  bodyClassName?: string;
  children: ReactNode;
  className?: string;
  /** `Support text` của Figma: một dòng mô tả ngay dưới tiêu đề. */
  description?: string;
  /** Bấm nền mờ để đóng. Tắt khi tấm bắt buộc phải chọn một phương án. */
  dismissOnBackdrop?: boolean;
  /** Vùng nút cố định ở đáy — không cuộn theo nội dung. */
  footer?: ReactNode;
  /** Chiều cao cố định (dp). Có giá trị thì `snapToContent` bị bỏ qua. */
  height?: number;
  /** Chiều cao TỐI THIỂU (dp). Bỏ trống thì suy từ `padded` — hai mốc của
   *  Figma là 229 (list THÔNG TIN) và 200 (list THAO TÁC), xem `SHEET_MIN_HEIGHT`. */
  minHeight?: number;
  onClose: () => void;
  /** Đệm mặc định của vùng nội dung (ngang 16, khe 8). ⛔ Tắt khi children là
   *  danh sách row tự lo đệm — Figma vẽ những row đó TRÀN hết viền tấm. */
  padded?: boolean;
  /** Bật khi nội dung có thể dài hơn một màn. */
  scrollable?: boolean;
  /** `search bar` của Figma — đứng yên trong header, KHÔNG cuộn theo danh sách. */
  search?: ReactNode;
  /** Thanh kéo 36×4. Bỏ trống thì theo ghi chú thiết kế: chỉ hiện khi KHÔNG có
   *  tiêu đề, vì có tiêu đề là có nút ✕ và hai dấu hiệu đóng cạnh nhau là thừa. */
  showHandle?: boolean;
  /** Cao vừa nội dung (mặc định). Tắt thì tấm luôn cao hết mức cho phép. */
  snapToContent?: boolean;
  title?: string;
  visible: boolean;
}

export function BottomSheet({
  alert,
  bodyClassName,
  children,
  className,
  description,
  dismissOnBackdrop = true,
  footer,
  height,
  minHeight,
  padded = true,
  scrollable = false,
  search,
  showHandle,
  snapToContent = true,
  title,
  visible,
  onClose,
}: BottomSheetProps) {
  const styles = bottomSheet({ padded });
  const transition = useSheetTransition(visible, onClose);

  const withHandle = showHandle ?? !title;

  return (
    <Modal
      /* Vị trí do Reanimated giữ — xem `useSheetTransition`. */
      animationType="none"
      statusBarTranslucent
      supportedOrientations={['portrait', 'landscape']}
      transparent
      visible={visible}
      onRequestClose={transition.requestClose}
    >
      {/* ⛔ `GestureHandlerRootView` PHẢI có ở đây, dù `AppProviders` đã bọc gốc
          app: `<Modal>` dựng một CỬA SỔ NATIVE RIÊNG, cây con của nó không nằm
          dưới root view của gesture-handler ⇒ `Gesture.Pan()` bên trong không
          nhận sự kiện chạm, vuốt-để-đóng chết trên Android, im lặng, không
          exception nào. ⚠️ `flex: 1` bắt buộc, thiếu là màn trắng. */}
      <GestureHandlerRootView style={FILL}>
        {/* ⛔ `accessibilityViewIsModal` đặt ở LỚP GỐC, không phải ở thẻ tấm:
            đặt ở thẻ thì nền mờ (phần tử anh em) bị ẩn khỏi trình đọc màn hình. */}
        <View accessibilityViewIsModal className={styles.anchor()}>
          {dismissOnBackdrop ? (
            <Pressable
              accessibilityLabel="Đóng"
              accessibilityRole="button"
              className={styles.backdrop()}
              onPress={transition.requestClose}
            />
          ) : (
            <View className={styles.backdrop()} />
          )}

          {/* Hình học của tấm — chiều cao, vùng an toàn, né bàn phím — nằm ở
              `SheetSurface`. ⛔ Đừng kéo ngược nó về đây: file này đã chạm trần
              200 dòng của `docs/rules/code-style.md` một lần rồi. */}
          <SheetSurface
            alert={alert}
            bodyClassName={bodyClassName}
            className={className}
            description={description}
            footer={footer}
            height={height}
            minHeight={minHeight}
            padded={padded}
            scrollable={scrollable}
            search={search}
            showHandle={withHandle}
            snapToContent={snapToContent}
            styles={styles}
            title={title}
            transition={transition}
          >
            {children}
          </SheetSurface>
        </View>
      </GestureHandlerRootView>
    </Modal>
  );
}
