import { AxiosRequestConfig } from "axios";

declare module "axios" {
  export interface AxiosRequestConfig {
    fields?: { [key: string]: string };
  }
}

export default function fieldInterceptor(config: AxiosRequestConfig) {
  config.url = config.url?.replace(/{([^}]+)}/g, (match, p) => {
    if (config.fields === undefined) {
      throw "Fields needed if using template in URL";
    }

    return encodeURIComponent(config.fields[p]);
  });

  return config;
}
