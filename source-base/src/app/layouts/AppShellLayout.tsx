import { Suspense, useCallback, useRef } from 'react';
import { Outlet } from 'react-router-dom';

import { LoadingScreen } from '@/app/components';
import { AppCommandPalette, AppDock, AppHeader, AppPhoneTopBar, AppTabBar } from '@/app/shell';
import { useDisplayStore } from '@/domains/preferences';
import {
  SHELL_GUTTER_X,
  SHELL_GUTTER_Y,
  SHELL_SAFE_INSET_X,
} from '@/shared/constants/layout.constants';
import { useIsPhone, useTvEscapeHatch } from '@/shared/hooks';
import { cn } from '@/shared/utils/style/cn';
import { HeaderSlotsProvider } from '@/shared/widgets/header';

import './app-shell-layout.css';
import { useRouteScrollRestoration } from './useRouteScrollRestoration';

const APP_SHELL_LAYOUT_SLOT_CLASSES = {
  root: 'app-background relative flex h-dvh w-full flex-col overflow-hidden',
  main: 'relative z-10 min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto',
};

/**
 * AppShellLayout — khung ứng dụng của mọi route sau `AuthGuard`: Header + vùng `<main>` cuộn (trang
 * con render vào `<Outlet />`) + Dock + bảng lệnh Ctrl/Cmd+K. Điện thoại (`useIsPhone()`: dọc < 768px hoặc xoay
 * ngang thấp): top bar phẳng `AppPhoneTopBar` thay Header, thanh tab đáy `AppTabBar` thay Dock — cả hai nằm TRONG
 * luồng của khung `h-dvh flex-col` nên `<main>` tự co lại, không bị che.
 *
 * Dùng làm `element` của route (`setup/app-routes.tsx`): `{ element: <AppShellLayout />, children: […] }`.
 * Sửa giao diện: nền → `app-shell-layout.css` (`.app-background`) · lề → `SHELL_GUTTER_X` /
 * `SHELL_GUTTER_Y` · class → `APP_SHELL_LAYOUT_SLOT_CLASSES`.
 * Lưu ý: trang con KHÔNG tự thêm lề ngoài; phím thoát TV và Ctrl/Cmd+K chỉ hoạt động trong layout này.
 * Dock (desktop) là `fixed`, luôn NỔI ĐÈ lên `<main>` ở mọi chế độ hiển thị — không chừa chỗ trong luồng,
 * nên `<main>` luôn full height bất kể Dock đang pinned/collapsed/autohide/hidden.
 * `<main>` không dựng lại khi đổi trang — vị trí cuộn do `useRouteScrollRestoration` (trang mới về đầu,
 * Back / Forward khôi phục, chỉ đổi `?search` thì giữ). `<Outlet />` nằm trong MỘT `Suspense` đứng yên: đổi sang
 * trang chưa tải thì trang cũ còn hiện tới khi trang mới sẵn sàng, màn chờ chỉ lộ ở lần mở đầu.
 * `SHELL_SAFE_INSET_X` (có `scrollbar-gutter: stable`) giữ chỗ cho thanh cuộn nên nội dung không xê dịch ngang khi trang
 * dài ra / ngắn lại.
 */
export default function AppShellLayout() {
  const setDisplayMode = useDisplayStore((state) => state.setMode);
  const exitTv = useCallback(() => setDisplayMode('standard'), [setDisplayMode]);
  useTvEscapeHatch(exitTv);

  const isPhone = useIsPhone();

  const mainRef = useRef<HTMLElement>(null);
  useRouteScrollRestoration(mainRef, 'main');

  const mainClassName = cn(
    APP_SHELL_LAYOUT_SLOT_CLASSES.main,
    SHELL_GUTTER_X,
    SHELL_SAFE_INSET_X,
    SHELL_GUTTER_Y,
  );

  return (
    <HeaderSlotsProvider>
      <div className={APP_SHELL_LAYOUT_SLOT_CLASSES.root}>
        {isPhone ? <AppPhoneTopBar /> : <AppHeader />}
        <main ref={mainRef} className={mainClassName}>
          <Suspense fallback={<LoadingScreen level="content" />}>
            <Outlet />
          </Suspense>
        </main>
        {isPhone ? <AppTabBar /> : <AppDock />}
        <AppCommandPalette />
      </div>
    </HeaderSlotsProvider>
  );
}
