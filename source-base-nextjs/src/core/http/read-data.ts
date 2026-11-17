import type { AxiosResponse } from 'axios';
import type { z } from 'zod';

import { AppError } from './errors/app-error';
import { errorMessages } from './errors/error-messages';
import type { ApiResponse } from './http.types';

/**
 * Bóc `data` khỏi vỏ `ApiResponse` và xác nhận nó có thật; sai → `AppError('contract')`.
 *
 *   // Payload thường: chỉ cần chắc có `data`.
 *   readData(await apiClient.get<ApiResponse<User[]>>('/users', { signal }));
 *
 *   // Payload quan trọng (phiên, quyền, tiền…): kiểm cả hình dạng bằng Zod.
 *   readData(await apiClient.post('/auth/login', body), sessionPayloadSchema);
 */

export function readData<T>(response: AxiosResponse<ApiResponse<T>>): T;
export function readData<S extends z.ZodType>(response: AxiosResponse, schema: S): z.output<S>;
export function readData(response: AxiosResponse, schema?: z.ZodType): unknown {
  const body: unknown = response.data;
  if (body === null || typeof body !== 'object' || !('data' in body)) {
    throw new AppError('contract', errorMessages().contract, {
      status: response.status,
      details: 'Phản hồi thiếu trường `data`',
    });
  }

  const { data } = body as { data: unknown };
  if (!schema) return data;

  const parsed = schema.safeParse(data);
  if (!parsed.success) {
    throw new AppError('contract', errorMessages().contract, {
      status: response.status,
      details: parsed.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`),
    });
  }
  return parsed.data;
}
