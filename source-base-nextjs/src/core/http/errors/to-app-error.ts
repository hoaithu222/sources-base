import { isAxiosError, isCancel } from 'axios';

import { AppError, isAppError } from './app-error';
import type { AppErrorKind } from './app-error';
import { errorMessages, messageOfCode, messageOfStatus } from './error-messages';

/**
 * Dựng `AppError` từ dữ liệu thô: phản hồi lỗi của BE, lỗi axios, lỗi bất kỳ.
 * Lỗi không phải của tầng HTTP (`Error`, chuỗi…) mang câu dự phòng; câu thô chỉ nằm ở `cause`.
 *
 * `resolveErrorMessage` nhận mọi định dạng BE đang dùng, theo thứ tự ưu tiên:
 *   1. `{ error: { code, message } }`
 *   2. `{ Message }` / `{ message }`
 *   3. `{ status: false, errorCode, parameters }` (.NET gateway)
 *   4. `{ errors: { field: [msg] } }` (ASP.NET ProblemDetails)
 *   5. `{ title }`
 *   6. câu theo HTTP status
 */

type Body = Record<string, unknown>;

const asBody = (value: unknown): Body | undefined =>
  value !== null && typeof value === 'object' && !Array.isArray(value)
    ? (value as Body)
    : undefined;

const asText = (value: unknown): string | undefined => {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed === '' ? undefined : trimmed;
};

/** Chuỗi dạng `PROJECT_ALREADY_EXISTS` — mã lỗi, không phải câu cho người dùng. */
const looksLikeCode = (text: string): boolean => /^[A-Z0-9]+(?:_[A-Z0-9]+)+$/.test(text);

function extractErrorCode(data: unknown): string | undefined {
  const body = asBody(data);
  if (!body) return undefined;
  return (
    asText(asBody(body.error)?.code) ??
    asText(body.errorCode) ??
    asText(body.ErrorCode) ??
    asText(body.code)
  );
}

function extractFieldErrors(data: unknown): Record<string, string[]> | undefined {
  const errors = asBody(asBody(data)?.errors);
  if (!errors) return undefined;

  const out: Record<string, string[]> = {};
  for (const [field, raw] of Object.entries(errors)) {
    const messages = (Array.isArray(raw) ? raw : [raw])
      .map(asText)
      .filter((m): m is string => m !== undefined);
    if (messages.length > 0) out[field] = messages;
  }
  return Object.keys(out).length > 0 ? out : undefined;
}

function wrappedErrorMessage(body: Body | undefined): string | undefined {
  const wrapped = asBody(body?.error);
  const code = asText(wrapped?.code);
  const fromCode = code ? messageOfCode(code) : undefined;
  if (fromCode) return fromCode;
  const message = asText(wrapped?.message);
  return message ? (messageOfCode(message) ?? message) : undefined;
}

function flatErrorMessage(body: Body | undefined): string | undefined {
  const flat = asText(body?.Message) ?? asText(body?.message);
  if (!flat) return undefined;
  const fromFlat = messageOfCode(flat);
  if (fromFlat) return fromFlat;
  return looksLikeCode(flat) ? undefined : flat;
}

function gatewayErrorMessage(body: Body | undefined): string | undefined {
  const errorCode = asText(body?.errorCode) ?? asText(body?.ErrorCode);
  if (!errorCode) return undefined;
  const fromGateway = messageOfCode(errorCode);
  if (fromGateway) return fromGateway;
  const parameters = asText(body?.parameters) ?? asText(body?.Parameters);
  if (parameters?.includes(' ')) return parameters;
  return looksLikeCode(errorCode) ? undefined : errorCode;
}

function problemTitle(body: Body | undefined): string | undefined {
  const title = asText(body?.title) ?? asText(body?.Title);
  return title && !/validation error/i.test(title) ? title : undefined;
}

export function resolveErrorMessage(status: number | undefined, data: unknown): string {
  const body = asBody(data);
  const fromBody =
    wrappedErrorMessage(body) ??
    flatErrorMessage(body) ??
    gatewayErrorMessage(body) ??
    Object.values(extractFieldErrors(body) ?? {})[0]?.[0] ??
    problemTitle(body);
  if (fromBody) return fromBody;

  if (status === undefined) return errorMessages().network;
  return messageOfStatus(status) ?? errorMessages().fallback;
}

function kindOfStatus(status: number, hasFieldErrors: boolean): AppErrorKind {
  if (status === 401) return 'unauthorized';
  if (status === 403) return 'forbidden';
  if (status === 404) return 'not_found';
  if (status === 408) return 'timeout';
  if (status >= 500) return 'server';
  if (hasFieldErrors) return 'validation';
  return 'business';
}

/** `AppError` từ một phản hồi của máy chủ; `business: true` cho lỗi trả kèm HTTP 2xx. */
export function appErrorFromResponse(
  status: number,
  data: unknown,
  options: { business?: boolean; cause?: unknown } = {},
): AppError {
  const fieldErrors = extractFieldErrors(data);
  const body = asBody(data);
  return new AppError(
    options.business ? 'business' : kindOfStatus(status, fieldErrors !== undefined),
    resolveErrorMessage(status, data),
    {
      status,
      code: extractErrorCode(data),
      fieldErrors,
      details: asBody(body?.error)?.details ?? body?.parameters,
      cause: options.cause,
    },
  );
}

/** Đổi lỗi bất kỳ về `AppError`; lỗi không phải của tầng HTTP mang `fallback`, gốc ở `cause`. */
export function toAppError(error: unknown, fallback = errorMessages().fallback): AppError {
  if (isAppError(error)) return error;

  const isAbort = error instanceof DOMException && error.name === 'AbortError';
  if (isCancel(error) || isAbort) {
    return new AppError('canceled', errorMessages().canceled, { cause: error });
  }

  if (isAxiosError(error)) {
    if (error.response) {
      return appErrorFromResponse(error.response.status, error.response.data, { cause: error });
    }
    const timedOut = error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT';
    return timedOut
      ? new AppError('timeout', errorMessages().timeout, { cause: error })
      : new AppError('network', errorMessages().network, { cause: error });
  }

  return new AppError('unknown', fallback, { cause: error });
}
