import { AxiosRequestConfig } from "axios";
import buildURL from "axios/lib/helpers/buildURL";
import combineURLs from "axios/lib/helpers/combineURLs";
import isAbsoluteURL from "axios/lib/helpers/isAbsoluteURL";

export default function debugInterceptor(
  config: AxiosRequestConfig
): AxiosRequestConfig {
  let url = config.url || "";
  if (config.baseURL && !isAbsoluteURL(url)) {
    url = combineURLs(config.baseURL, url);
  }
  url = buildURL(url, config.params, config.paramsSerializer);

  console.log(config.method, url);

  return config;
}
