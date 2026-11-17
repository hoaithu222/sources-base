'use client';

import { useLayoutEffect } from 'react';

import { rehydratePersistedStores } from '@/shared/utils/browser/storage.utils';

/**
 * StoreHydration — nạp state đã lưu (theme, TV, phiên, Dock…) từ localStorage vào các store `persist` MỘT lần, ngay sau
 * hydrate. `AppProviders` đặt nó ĐẦU TIÊN trong cây: layout effect của anh em đứng trước chạy trước mọi effect của cây con,
 * nên guard / widget thấy state thật ngay lần chạy effect đầu.
 * Lý do: store `persist` đã bật `skipHydration` — nạp lúc tạo store làm lần render đầu khác HTML server (lỗi hydration).
 */
export default function StoreHydration() {
  useLayoutEffect(() => {
    rehydratePersistedStores();
  }, []);

  return null;
}
