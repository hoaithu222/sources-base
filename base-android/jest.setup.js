/**
 * Chạy SAU khi môi trường test đã dựng xong (`setupFilesAfterEnv`).
 *
 * `@testing-library/react-native` từ bản 12.4 đã tự đăng ký matcher
 * (`toBeOnTheScreen`, `toHaveTextContent`…) khi được import, nên chỉ cần một
 * dòng import — KHÔNG cần `@testing-library/jest-native` nữa (gói đó đã ngừng
 * phát triển và xung đột matcher nếu cài kèm).
 */
require('@testing-library/react-native');

/**
 * `react-native-gesture-handler` gọi `RNGestureHandlerModule.install()` ngay lúc
 * nạp module. Trong Node không có module native đó, nên suite chết ở dòng
 * `import` với `_RNGestureHandlerModule.default.install is not a function` —
 * lỗi chỉ vào gói, không chỉ vào component đang test.
 *
 * ⚠️ Cần từ khi `BottomSheet` bọc `GestureHandlerRootView` BÊN TRONG `<Modal>`:
 * `<Modal>` là cửa sổ native riêng nên `GestureHandlerRootView` ở gốc app không
 * với tới, cử chỉ vuốt-để-đóng chết trên Android. Hệ quả phụ là mọi test đi qua
 * `BottomSheet` (kể cả `DatePicker`, `BottomNav`) nay đều nạp gói này.
 *
 * Dùng bản mock CHÍNH THỨC của thư viện thay vì tự viết, và đặt ở đây thay vì
 * rải `jest.mock(...)` trong từng file test.
 *
 * ⚠️ Lý do rất cụ thể: mock tay phải trỏ vào `lib/commonjs/`, KHÔNG phải `src/`.
 * `jest.config.js` thay resolver mặc định bằng resolver của
 * `react-native-worklets`, nên gói được phân giải theo trường `main` (bản đã
 * biên dịch) chứ không theo trường `react-native` (`src/index.ts`). Mock nhầm
 * `src/` thì KHÔNG có tác dụng gì mà cũng KHÔNG báo lỗi — stack trace vẫn hiện
 * tên file `src/*.ts` vì có source map, nên rất dễ tưởng là đã mock đúng.
 * `jestSetup.js` của gói phủ cả ba cây (`src`, `lib/commonjs`, `lib/module`)
 * nên không dính bẫy đó.
 */
require('react-native-gesture-handler/jestSetup');

/**
 * `expo-secure-store` gọi thẳng xuống Keychain/Keystore — không có bản chạy
 * được trong Node. Mock bằng một Map trong bộ nhớ để test luồng phiên đăng nhập
 * chạy thật chứ không phải bỏ qua.
 */
jest.mock('expo-secure-store', () => {
  const store = new Map();
  return {
    getItemAsync: jest.fn(async (key) => store.get(key) ?? null),
    setItemAsync: jest.fn(async (key, value) => void store.set(key, value)),
    deleteItemAsync: jest.fn(async (key) => void store.delete(key)),
    isAvailableAsync: jest.fn(async () => true),
  };
});

/** Cùng lý do — AsyncStorage cũng là module native. */
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

/**
 * `react-native-keyboard-controller` đo bàn phím ở tầng NATIVE — nạp nó trong
 * Node là ném ngay `The package doesn't seem to be linked`, và suite chết ở
 * dòng `import` chứ không phải ở chỗ dùng. Mọi màn hình có ô nhập đều đi qua
 * `KeyboardAwareScrollView` (xem `docs/rules/mobile-ux.md`), nên thiếu mock này
 * thì gần như không màn hình nào test được.
 *
 * Bản mock CHÍNH THỨC của thư viện: `KeyboardAwareScrollView` rơi về
 * `ScrollView` thường, các giá trị hoạt ảnh về 0.
 */
jest.mock('react-native-keyboard-controller', () =>
  require('react-native-keyboard-controller/jest'),
);
