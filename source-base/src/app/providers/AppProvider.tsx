import type { ReactNode } from 'react';
import { QueryClientProvider, type QueryClient } from '@tanstack/react-query';

import { selectEffectiveUiScale, useDisplayStore } from '@/domains/preferences';
import { ChartScaleProvider } from '@/shared/charts';

import AppOverlays from './AppOverlays';
import { queryClient } from './query-client';
import AppearanceSync from './appearance/AppearanceSync';

interface AppProviderProps {
  children: ReactNode;
  client?: QueryClient;
}

/**
 * AppProvider — bọc app bằng QueryClient và `ChartScaleProvider` (biểu đồ theo cỡ chữ hiển thị); mount
 * `AppearanceSync` và `AppOverlays` MỘT lần, độc lập với route.
 *
 * @param props.children - Cây bên trong (router).
 * @param props.client - QueryClient riêng để cô lập cache khi test. Mặc định là singleton của app.
 */
export default function AppProvider({ children, client = queryClient }: AppProviderProps) {
  const uiScale = useDisplayStore(selectEffectiveUiScale);

  return (
    <QueryClientProvider client={client}>
      <AppearanceSync />
      <ChartScaleProvider uiScale={uiScale}>{children}</ChartScaleProvider>
      <AppOverlays />
    </QueryClientProvider>
  );
}
