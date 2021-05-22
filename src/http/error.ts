import { AxiosError, AxiosInstance, AxiosResponse } from "axios";
import { ApiError } from "../error/api";

export function errorSuccessInterceptor(res: AxiosResponse): AxiosResponse {
  if (typeof res.data !== "object") return res;

  const errors: Api.Error[] | undefined = res.data.json?.errors;
  if (!errors || !errors.length) return res;

  const err = errors[0];
  throw new ApiError(err[0], err[1]);
}

export function errorRejectionInterceptor(
  err: AxiosError
): Promise<AxiosError> {
  const res = err.response;
  if (!res) return Promise.reject(err);

  if (typeof res.data !== "object") return Promise.reject(err);

  if (!("reason" in res.data)) return Promise.reject(err);
  const e = res.data as Api.Error2;

  throw new ApiError(
    e.reason.toUpperCase(),
    e.message,
    res.status,
    e.explanation
  );
}

export default function errorInterceptor(api: AxiosInstance): void {
  api.interceptors.response.use(
    errorSuccessInterceptor,
    errorRejectionInterceptor
  );
}
