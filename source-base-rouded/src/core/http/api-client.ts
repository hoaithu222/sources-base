import axios from 'axios';
import type { AxiosResponse, InternalAxiosRequestConfig } from 'axios';

import { appConfig } from '@/core/config';

import { AppError } from './errors/app-error';
import { CANCELED_MESSAGE } from './errors/error-messages.constants';
import { appErrorFromResponse, toAppError } from './errors/to-app-error';
import { redactSecrets } from './redact-secrets';

/**
 * Axios client dùng chung. Mọi lỗi đi ra là `AppError`; client không tự hiện thông báo.
 *
 * Nối với phần còn lại của app một lần ở `app/bootstrap.ts`:
 *   configureHttp({ auth: { getAccessToken, refreshAccessToken } });
 *
 * Interceptor lo sẵn: gắn token, 401 → làm mới token → phát lại request (một lần),
 * phát hiện lỗi nghiệp vụ trả kèm HTTP 2xx. Chỗ gọi không tự gắn header.
 *
 * Lý do thiết kế: `docs/notes/code/core.md`.
 */

export interface HttpAuthAdapter {
  /** Access token hiện tại; `null` khi chưa đăng nhập. */
  getAccessToken: () => string | null;
  /**
   * Làm mới phiên, trả token mới hoặc `null`; sau đó `getAccessToken()` phải trả đúng token đó.
   * PHẢI single-flight: gọi khi lượt trước chưa xong thì trả lại CHÍNH promise đang chạy.
   */
  refreshAccessToken: () => Promise<string | null>;
}

interface HttpConfiguration {
  auth?: HttpAuthAdapter;
  /**
   * Quan sát lỗi HTTP ở TỪNG lượt gọi (trừ request bị huỷ) để log / telemetry.
   * Không dùng để báo người dùng — việc đó của `createQueryClient({ notifyUser })`.
   */
  observeError?: (error: AppError) => void;
}

let configuration: HttpConfiguration = {};

/** Gọi lại sẽ thay toàn bộ cấu hình cũ. */
export function configureHttp(next: HttpConfiguration): void {
  configuration = next;
}

/** Mảng thành `key=v1&key=v2` (lặp key) — dạng model binder của .NET nhận. */
const paramsSerializer = (params: Record<string, unknown>): string => {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    if (Array.isArray(value)) {
      value.forEach((v) => searchParams.append(key, String(v)));
    } else {
      searchParams.append(key, String(value));
    }
  });
  return searchParams.toString();
};

export const apiClient = axios.create({
  baseURL: appConfig.apiBaseUrl,
  timeout: appConfig.apiTimeout,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  withCredentials: true,
  paramsSerializer,
});

const log = (...args: unknown[]): void => {
  // eslint-disable-next-line no-console -- log API chủ động, chỉ bật khi enableApiLogging
  if (appConfig.enableApiLogging) console.log(...args);
};

function logAndObserve(error: AppError): AppError {
  if (error.kind === 'canceled') return error;
  if (appConfig.enableApiLogging) {
    console.error('❌ Lỗi API:', {
      kind: error.kind,
      status: error.status,
      code: error.code,
      message: error.message,
      details: redactSecrets(error.details),
    });
  }
  configuration.observeError?.(error);
  return error;
}

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = configuration.auth?.getAccessToken();
  if (token) config.headers.set('Authorization', `Bearer ${token}`);

  if (config.data instanceof FormData) config.headers.delete('Content-Type');

  log(`🌐 ${config.method?.toUpperCase()} ${config.url}`, redactSecrets(config.data));
  if (config.params) log('📋 Params:', redactSecrets(config.params));

  return config;
});

const bearerOf = (config: InternalAxiosRequestConfig): string | null => {
  const header = config.headers.get('Authorization');
  return typeof header === 'string' ? header.replace(/^Bearer\s+/i, '') : null;
};

/** Phát lại request vừa ăn 401 bằng token mới; `null` khi không lấy được token. */
async function replayWithFreshToken(
  request: InternalAxiosRequestConfig,
  auth: HttpAuthAdapter,
): Promise<AxiosResponse | null> {
  const current = auth.getAccessToken();
  const refreshedMeanwhile = current !== null && current !== bearerOf(request);
  const token = refreshedMeanwhile ? current : await auth.refreshAccessToken().catch(() => null);
  if (!token) return null;

  if (request.signal?.aborted) throw new AppError('canceled', CANCELED_MESSAGE);

  return apiClient({ ...request, skipAuthRefresh: true });
}

function isBusinessError(response: AxiosResponse): boolean {
  if (response.config.skipBusinessErrorHandling) return false;
  const body = response.data as { status?: unknown; success?: unknown } | null | undefined;
  return (
    body !== null && typeof body === 'object' && (body.status === false || body.success === false)
  );
}

apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    log(`✅ Response ${response.config.url}:`, redactSecrets(response.data));

    if (isBusinessError(response)) {
      throw logAndObserve(appErrorFromResponse(response.status, response.data, { business: true }));
    }
    return response;
  },

  async (rawError: unknown) => {
    const error = toAppError(rawError);
    if (error.kind === 'canceled') throw error;

    const request = axios.isAxiosError(rawError) ? rawError.config : undefined;
    const { auth } = configuration;
    if (error.kind === 'unauthorized' && auth && request && !request.skipAuthRefresh) {
      const replayed = await replayWithFreshToken(request, auth);
      if (replayed) return replayed;
    }

    throw logAndObserve(error);
  },
);
