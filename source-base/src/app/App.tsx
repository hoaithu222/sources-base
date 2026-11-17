import { Suspense } from 'react';

import { ErrorBoundary, LoadingScreen } from './components';
import { AppProvider } from './providers';
import { AppRouter } from './router';

/**
 * App — cây ứng dụng: ranh giới lỗi → Suspense → providers → router; `main.tsx` chỉ khởi động và mount.
 */
export default function App() {
  return (
    <ErrorBoundary label="Ứng dụng" level="app">
      <Suspense fallback={<LoadingScreen level="app" />}>
        <AppProvider>
          <AppRouter />
        </AppProvider>
      </Suspense>
    </ErrorBoundary>
  );
}
