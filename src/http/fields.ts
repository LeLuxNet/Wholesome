import { AxiosRequestConfig } from "axios";

declare module "axios" {
  export interface AxiosRequestConfig {
    fields?: { [key: string]: string };
  }
}

export function fieldInterceptor(
  config: AxiosRequestConfig
): AxiosRequestConfig {
  config.url = config.url!.replace(/{([^}]+)}/g, (_, p) => {
    if (config.fields === undefined) {
      throw new Error("Fields needed if using template in URL");
    }
    if (config.fields[p] === undefined) {
      throw new Error(`Field '${p}' needed`);
    }

    return encodeURIComponent(config.fields[p]);
  });

  return config;
}
