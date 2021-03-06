import { AxiosRequestConfig } from "axios";
import Reddit from "../reddit";

declare module "axios" {
  export interface AxiosRequestConfig {
    skipAuth?: boolean;
  }
}

/** @internal */
export function authInterceptor(r: Reddit) {
  return (config: AxiosRequestConfig): AxiosRequestConfig => {
    if (r.auth && !config.skipAuth) {
      if (config.url?.startsWith("https://old.reddit.com")) {
        if (r.auth.session) {
          config.headers.Cookie = `reddit_session=${r.auth.session}`;
        }
      } else {
        config.baseURL = "https://oauth.reddit.com";
        config.headers.Authorization = `Bearer ${r.auth.accessToken}`;
      }
    }

    return config;
  };
}
