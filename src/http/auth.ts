import { AxiosRequestConfig } from "axios";
import Reddit from "../reddit";

declare module "axios" {
  export interface AxiosRequestConfig {
    skipAuth?: boolean;
  }
}

export default function authInterceptor(r: Reddit) {
  return async (config: AxiosRequestConfig) => {
    if (!config.skipAuth && r.auth) {
      config.baseURL = "https://oauth.reddit.com";
      config.headers.authorization = `Bearer ${await r.auth.accessToken}`;
    }

    return config;
  };
}
