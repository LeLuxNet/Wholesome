import { AxiosResponse } from "axios";
import { ApiError } from "../error/api";

export default function errorInterceptor(res: AxiosResponse) {
  if (typeof res.data !== "object") return res;

  const errors: Api.Error[] | undefined = res.data.json?.errors;
  if (errors === undefined || errors.length === 0) return res;

  throw new ApiError(errors[0]);
}
