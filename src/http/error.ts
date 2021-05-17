import { AxiosError, AxiosInstance } from "axios";
import { ApiError } from "../error/api";

export default function errorInterceptor(api: AxiosInstance): void {
  api.interceptors.response.use(
    (res) => {
      if (typeof res.data !== "object") return res;

      const errors: Api.Error[] | undefined = res.data.json?.errors;
      if (errors === undefined || errors.length === 0) return res;

      const err = errors[0];
      throw new ApiError(err[0], err[1]);
    },
    (err: AxiosError) => {
      const res = err.response;
      if (!res) throw err;

      if (typeof res.data !== "object") throw err;

      if (!("reason" in res.data)) throw err;
      const e = res.data as Api.Error2;

      throw new ApiError(
        e.reason.toUpperCase(),
        e.message,
        res.status,
        e.explanation
      );
    }
  );
}
