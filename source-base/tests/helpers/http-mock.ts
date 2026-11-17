/**
 * Thay tầng mạng của `apiClient` bằng một hàm giả — interceptor THẬT vẫn chạy.
 *
 * Mock cả module `@/core/http` thì không kiểm được gì: thứ cần kiểm chính là
 * interceptor (gắn token, refresh 401, chuẩn hoá lỗi). Axios cho thay riêng
 * `adapter` — lớp thấp nhất, nơi request thật sự rời khỏi trình duyệt.
 */
import { AxiosError } from 'axios';
import type { AxiosAdapter, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

import { apiClient } from '@/core/http';

export interface MockReply {
  status: number;
  data?: unknown;
}

export type MockHandler = (
  config: InternalAxiosRequestConfig,
) => MockReply | 'network-error' | Promise<MockReply | 'network-error'>;

/** Token mà request mang theo (đã bỏ tiền tố `Bearer `). */
export function bearerOf(config: InternalAxiosRequestConfig): string | null {
  const header = config.headers.get('Authorization');
  return typeof header === 'string' ? header.replace(/^Bearer\s+/i, '') : null;
}

/**
 * Cài handler giả. Trả về hàm khôi phục adapter gốc — gọi trong `afterEach`.
 * Handler trả status ngoài 2xx thì adapter ném `AxiosError` y như axios thật.
 */
export function mockHttp(handler: MockHandler): () => void {
  const original = apiClient.defaults.adapter;

  const adapter: AxiosAdapter = async (config) => {
    if (config.signal?.aborted) {
      throw new AxiosError('canceled', AxiosError.ERR_CANCELED, config);
    }

    const reply = await handler(config);
    if (reply === 'network-error') {
      throw new AxiosError('Network Error', AxiosError.ERR_NETWORK, config);
    }

    const response: AxiosResponse = {
      status: reply.status,
      statusText: String(reply.status),
      data: reply.data,
      headers: {},
      config,
    };
    if (reply.status >= 200 && reply.status < 300) return response;

    throw new AxiosError(
      `Request failed with status code ${reply.status}`,
      reply.status >= 500 ? AxiosError.ERR_BAD_RESPONSE : AxiosError.ERR_BAD_REQUEST,
      config,
      null,
      response,
    );
  };

  apiClient.defaults.adapter = adapter;
  return () => {
    apiClient.defaults.adapter = original;
  };
}
