'use client';

import { Suspense } from 'react';
import type { ReactNode } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';

import { selectEffectiveUiScale, useDisplayStore } from '@/domains/preferences';
import { ChartScaleProvider } from '@/shared/charts';
import DisplayUrlSync from './sync/DisplayUrlSync';

import AppOverlays from './AppOverlays';
import LocaleSync from './sync/LocaleSync';
import { getQueryClient } from './query-client';
import SessionBootstrap from './sync/SessionBootstrap';

interface AppProvidersProps {
  children: ReactNode;
}

/**
 * AppProviders — provider của VÙNG LÀM VIỆC (đăng nhập + ứng dụng), gắn ở `[locale]/(workspace)/layout.tsx` và sống xuyên suốt
 * chuyển route trong vùng đó. Phần dùng chung cho mọi trang (nạp store, áp giao diện) ở `BaseProviders`.
 *
 * Bọc: QueryClient · `ChartScaleProvider` (biểu đồ theo cỡ chữ hiển thị) · `AppOverlays` (toast, thẻ tiến trình);
 * `LocaleSync` (thông báo lỗi + Zod theo ngôn ngữ) · `SessionBootstrap` (token adapter, đồng bộ đa tab) ·
 * `DisplayUrlSync` (`?display=tv`, bọc `<Suspense>` vì đọc `useSearchParams`).
 *
 * @param props.children - Cây trang (đã qua layout của nhóm route).
 */
export default function AppProviders({ children }: AppProvidersProps) {
  const uiScale = useDisplayStore(selectEffectiveUiScale);

  return (
    <QueryClientProvider client={getQueryClient()}>
      <LocaleSync />
      <SessionBootstrap />
      <Suspense fallback={null}>
        <DisplayUrlSync />
      </Suspense>
      <ChartScaleProvider uiScale={uiScale}>{children}</ChartScaleProvider>
      <AppOverlays />
    </QueryClientProvider>
  );
}
