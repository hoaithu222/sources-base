'use client';

import { ToastContainer } from '@/shared/ui';
import { ProgressCenter } from '@/shared/widgets/progress-center';

/**
 * AppOverlays — toast và thẻ tiến trình; `AppProviders` gắn một lần, sống xuyên suốt chuyển route.
 */
export default function AppOverlays() {
  return (
    <>
      <ToastContainer />
      <ProgressCenter />
    </>
  );
}
