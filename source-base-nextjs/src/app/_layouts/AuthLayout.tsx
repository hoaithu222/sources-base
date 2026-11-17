import type { ReactNode } from 'react';

import { cn } from '@/shared/utils/style/cn';

import AuthBackdrop from './auth/AuthBackdrop';
import AuthBrandPanel from './auth/AuthBrandPanel';

import './app-shell-layout.css';
import './auth-layout.css';

const AUTH_LAYOUT_SLOT_CLASSES = {
  root: cn(
    'app-background relative flex min-h-dvh items-center justify-center overflow-hidden bg-bg-page px-4 py-10 lg:py-14',
    'phone:items-start phone:pt-[calc(1rem+var(--safe-t,0px))] phone:pb-[calc(1rem+var(--safe-b,0px))]',
    'phone:pr-[max(1rem,var(--safe-r,0px))] phone:pl-[max(1rem,var(--safe-l,0px))]',
  ),
  card: cn(
    'auth-card squircle relative z-10 flex w-full max-w-[1070px] flex-col overflow-hidden rounded-2xl phone:rounded-xl',
    'lg:h-[var(--auth-card-h)] lg:flex-row',
  ),
  seam: 'auth-seam h-px w-full shrink-0 [--auth-seam-dir:90deg] lg:h-auto lg:w-px lg:[--auth-seam-dir:180deg]',
  formPane: 'relative flex w-full shrink-0 flex-col overflow-hidden lg:w-[492px]',
  formScroll: 'relative z-10 flex min-h-0 flex-1 flex-col overflow-y-auto p-8 phone:p-5 lg:p-10',
};

interface AuthLayoutProps {
  children: ReactNode;
}

/**
 * AuthLayout — thẻ hai khoang (thương hiệu | form) cho các trang khách; form tự cuộn trong chiều cao
 * cố định.
 *
 * Dùng ở `src/app/[locale]/(workspace)/(auth)/layout.tsx`: `<GuestGate><AuthLayout>{children}</AuthLayout></GuestGate>` — trang con là `children`.
 * Sửa giao diện: nền, viền, bóng → `auth-layout.css` (`.auth-*`) · bo góc + class bố cục →
 * `AUTH_LAYOUT_SLOT_CLASSES`.
 * Lưu ý: từ `lg` lề khoang form `p-10` phải khớp khoang thương hiệu (`AuthBrandPanel`). Khoang form là
 * landmark `<main>` (khoang thương hiệu là `<section>` bên ngoài). Thẻ bo `2xl` + `squircle` (điện thoại `xl`) và
 * `overflow-hidden` để hai khoang ăn theo góc bo. Điện thoại (`phone:`): một cột, khoang thương hiệu thu còn
 * logo + tên app để form lên đầu, thẻ neo ĐỈNH (bàn phím ảo không đẩy ô nhập khuất), đệm cộng vùng an toàn.
 *
 * @param props.children - Trang khách (đăng nhập, đăng ký…), đặt trong khoang form.
 */
export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className={AUTH_LAYOUT_SLOT_CLASSES.root}>
      <AuthBackdrop />
      <div className={AUTH_LAYOUT_SLOT_CLASSES.card}>
        <AuthBrandPanel />
        <span aria-hidden className={AUTH_LAYOUT_SLOT_CLASSES.seam} />
        <div className={AUTH_LAYOUT_SLOT_CLASSES.formPane}>
          <main className={AUTH_LAYOUT_SLOT_CLASSES.formScroll}>
            <div className="my-auto w-full">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}
