'use client';

import { Suspense, useCallback, useRef } from 'react';
import type { MouseEvent, ReactNode } from 'react';
import { useTranslations } from 'next-intl';

import {
  AppCommandPalette,
  AppDock,
  AppHeader,
  AppPhoneTopBar,
  AppTabBar,
  AppWorkTabs,
} from '@/app/_shell';
import { useDisplayStore } from '@/domains/preferences';
import {
  SHELL_GUTTER_X,
  SHELL_GUTTER_Y,
  SHELL_SAFE_INSET_X,
} from '@/shared/constants/layout.constants';
import { useIsCoarsePointer, useIsPhone, useTvEscapeHatch } from '@/shared/hooks';
import { cn } from '@/shared/utils/style/cn';
import { useDockReserveClass, useDockSettingsStore } from '@/shared/widgets/dock';
import { HeaderSlotsProvider } from '@/shared/widgets/header';

import './app-shell-layout.css';
import { useDockOverlap } from './useDockOverlap';
import { useRouteScrollRestoration } from './useRouteScrollRestoration';

const APP_SHELL_LAYOUT_SLOT_CLASSES = {
  root: 'app-background relative flex h-dvh w-full flex-col overflow-hidden',
  main: 'relative z-10 min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto outline-none',
  /** Liên kết "Bỏ qua tới nội dung": ẩn tới khi được Tab tới, hiện thành viên nổi góc trái (WCAG 2.4.1). */
  skip: cn(
    'sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[70] focus:rounded-full focus:px-4 focus:py-2',
    'focus:bg-bg-surface focus:text-body-14-semibold focus:text-link focus:shadow-(--elev-3) focus:outline-none',
    'focus:ring-2 focus:ring-ring-focus',
  ),
};

interface AppShellLayoutProps {
  children: ReactNode;
}

/**
 * AppShellLayout — khung ứng dụng của mọi route trong nhóm `(app)` (sau `AuthGate`): Header + vùng `<main>` cuộn (trang
 * con là `children`) + Dock + bảng lệnh Ctrl/Cmd+K. Điện thoại (`useIsPhone()`: dọc < 768px hoặc xoay
 * ngang thấp): top bar phẳng `AppPhoneTopBar` thay Header, thanh tab đáy `AppTabBar` thay Dock — cả hai nằm TRONG
 * luồng của khung `h-dvh flex-col` nên `<main>` tự co lại, không bị che.
 *
 * Dùng ở `src/app/[locale]/(workspace)/(app)/layout.tsx`: `<AuthGate><AppShellLayout>{children}</AppShellLayout></AuthGate>`.
 * Sửa giao diện: nền → `app-shell-layout.css` (`.app-background`) · lề → `SHELL_GUTTER_X` /
 * `SHELL_GUTTER_Y` · class → `APP_SHELL_LAYOUT_SLOT_CLASSES`.
 * Lưu ý: trang con KHÔNG tự thêm lề ngoài; phím thoát TV và Ctrl/Cmd+K chỉ hoạt động trong layout này.
 * Dock (desktop) và thanh dọc lịch sử thẻ (`AppWorkTabs`, sát mép trái) là `fixed`, NỔI ĐÈ lên nội dung — không chiếm bề
 * ngang. Dock GHIM cạnh trái / phải: nổi đè, `<main>` dùng trọn bề ngang; cạnh ĐÁY trang trôi chừa 80px (cuộn qua dải
 * Dock rồi dừng trên nó), trang khoá cao CAO TRỌN MÀN và Dock kính nổi đè — `useDockOverlap` đo Dock, vùng cuộn bị lấn
 * (`[data-dock-aware]`) nhận `--dock-overlap` để dòng tổng / dòng cuối không nấp dưới Dock. Tự ẩn / thu gọn / ẩn: trọn màn.
 * Liên kết ẩn "Bỏ qua tới nội dung" đứng TRƯỚC header: Tab lần đầu hiện nó, Enter đưa tiêu điểm vào `<main>` (không đi
 * qua cả thanh). `<main>` không dựng lại khi đổi trang — vị trí cuộn do `useRouteScrollRestoration` (trang mới về đầu,
 * Back / Forward khôi phục, chỉ đổi `?search` thì giữ). Khung khoá cao `h-dvh overflow-hidden` (document KHÔNG cuộn) — chỉ ở vùng
 * làm việc; trang công khai cuộn tự nhiên.
 *
 * @param props.children - Trang con của nhóm `(app)`, đặt trong vùng `<main>` cuộn.
 */
export default function AppShellLayout({ children }: AppShellLayoutProps) {
  const t = useTranslations('shell.layout');
  const setDisplayMode = useDisplayStore((state) => state.setMode);
  const exitTv = useCallback(() => setDisplayMode('standard'), [setDisplayMode]);
  useTvEscapeHatch(exitTv);

  const isPhone = useIsPhone();
  const dockReserveClass = useDockReserveClass();
  const isCoarsePointer = useIsCoarsePointer();
  const dockPinnedBottom = useDockSettingsStore(
    (s) => s.position === 'bottom' && (s.mode === 'pinned' || isCoarsePointer),
  );

  const mainRef = useRef<HTMLElement>(null);
  useRouteScrollRestoration(mainRef, 'main');
  useDockOverlap(mainRef, !isPhone && dockPinnedBottom);
  const skipToMain = useCallback((e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    mainRef.current?.focus();
  }, []);

  const mainClassName = cn(
    APP_SHELL_LAYOUT_SLOT_CLASSES.main,
    SHELL_GUTTER_X,
    SHELL_SAFE_INSET_X,
    SHELL_GUTTER_Y,
    !isPhone && dockReserveClass,
  );

  return (
    <HeaderSlotsProvider>
      <div className={APP_SHELL_LAYOUT_SLOT_CLASSES.root}>
        <a className={APP_SHELL_LAYOUT_SLOT_CLASSES.skip} href="#main-content" onClick={skipToMain}>
          {t('skipToContent')}
        </a>
        {isPhone ? <AppPhoneTopBar /> : <AppHeader />}
        <main ref={mainRef} className={mainClassName} id="main-content" tabIndex={-1}>
          {children}
        </main>
        {!isPhone && (
          <Suspense fallback={null}>
            <AppWorkTabs />
          </Suspense>
        )}
        {isPhone ? <AppTabBar /> : <AppDock />}
        <AppCommandPalette />
      </div>
    </HeaderSlotsProvider>
  );
}
