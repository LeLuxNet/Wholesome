import { AxiosRequestConfig } from "axios";
import { stringify } from "querystring";

/** @internal */
export function bodyInterceptor(
  config: AxiosRequestConfig
): AxiosRequestConfig {
  if (
    config.method?.toLowerCase() === "get" ||
    (config.headers && config.headers["Content-Type"] !== undefined) ||
    config.data === undefined
  ) {
    return config;
  }

  config.data.api_type = "json";
  config.data = stringify(config.data);

  return config;
}
