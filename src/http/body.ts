import { AxiosRequestConfig } from "axios";
import { stringify } from "querystring";

export default function bodyInterceptor(config: AxiosRequestConfig) {
  if (config.method === "get") return config;
  if (config.headers["Content-Type"] !== undefined) return config;

  config.data.api_type = "json";
  config.data = stringify(config.data);

  return config;
}
