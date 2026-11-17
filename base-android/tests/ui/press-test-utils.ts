import { act } from '@testing-library/react-native';

/**
 * Sự kiện chạm tối thiểu để kích máy trạng thái của `Pressability` (RN) trong Jest.
 *
 * ⚠️ Vì sao không dùng `userEvent.press`: nó chạy trọn vòng nhấn-nhả trong MỘT lệnh nên không bao
 * giờ dừng ở trạng thái "đang giữ". Muốn kiểm `pressed` thì phải tự cấp `responderGrant` (đặt tay
 * xuống) rồi `responderRelease`/`responderTerminate` (nhả/bị cuộn cướp).
 */
export const touch = (target = 1) => ({
  // ⚠️ `currentTarget` BẮT BUỘC: `Pressability` lưu nó làm `_responderID` lúc `responderGrant`, và
  // thiếu nó thì `responderRelease` bị bỏ qua lặng lẽ (không `onPressOut`, `pressed` kẹt mãi).
  currentTarget: target,
  nativeEvent: {
    changedTouches: [{ identifier: 0, locationX: 4, locationY: 4, pageX: 4, pageY: 4, target }],
    identifier: 0,
    locationX: 4,
    locationY: 4,
    pageX: 4,
    pageY: 4,
    target,
    timestamp: Date.now(),
    touches: [{ identifier: 0, locationX: 4, locationY: 4, pageX: 4, pageY: 4, target }],
  },
  persist: () => undefined,
});

/** Cho đồng hồ giả chạy `ms` mili giây (RN giữ `pressed` tối thiểu ~130ms sau khi nhả). */
export const settle = (ms: number) =>
  act(async () => {
    jest.advanceTimersByTime(ms);
  });
