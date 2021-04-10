import { AxiosRequestConfig } from "axios";
import { stringify } from "querystring";

export default function bodyInterceptor(config: AxiosRequestConfig) {
  if (config.method !== "get") {
    config.data.api_type = "json";
    config.data = stringify(config.data);
  }

  return config;
}
