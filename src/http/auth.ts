import { AxiosRequestConfig } from "axios";
import Reddit from "../reddit";

declare module "axios" {
  export interface AxiosRequestConfig {
    skipAuth?: boolean;
  }
}

export default function authInterceptor(r: Reddit) {
  return (config: AxiosRequestConfig): AxiosRequestConfig => {
    if (r.auth && !config.skipAuth) {
      config.baseURL = "https://oauth.reddit.com";
      config.headers.authorization = `Bearer ${r.auth.accessToken}`;
    }

    return config;
  };
}
