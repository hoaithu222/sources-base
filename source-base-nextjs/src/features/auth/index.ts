/**
 * Public API của feature `auth`.
 *
 * Dùng:   `src/app/[locale]/(workspace)/(auth)/<trang>/page.tsx` import view: `import { LoginView } from '@/features/auth';`
 * Lưu ý:  view là Client Component (form, mutation) — `page.tsx` là Server Component mỏng bọc `generateMetadata` + view.
 */

export { default as ForgotPasswordView } from './views/ForgotPasswordView';
export { default as LoginView } from './views/LoginView';
export { default as RegisterView } from './views/RegisterView';
export { default as ResetPasswordView } from './views/ResetPasswordView';
export * from './schemas/auth.schema';
export { useAuthSchemas } from './schemas/useAuthSchemas';
export * from './service/auth.queries';
export type {
  ForgotPasswordRequest,
  LoginRequest,
  RegisterRequest,
  ResetPasswordRequest,
} from './api/auth.types';
