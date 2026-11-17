/// <reference types="vite/client" />

/** Biến `VITE_*` thô. Đọc giá trị đã kiểm qua `appConfig` (`@/core/config`), không đọc trực tiếp. */
interface ImportMetaEnv {
  readonly VITE_APP_NAME?: string;
  readonly VITE_APP_MODE?: string;
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_API_TIMEOUT?: string;
  readonly VITE_ENABLE_ERROR_TOAST?: string;
  readonly VITE_ENABLE_API_LOGGING?: string;
  readonly VITE_AUTH_ENABLED?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
