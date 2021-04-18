import { AxiosRequestConfig } from "axios";
import Identified from "../interfaces/identified";
import Reddit from "../reddit";
import Page from "./page";

export interface GetOptions {
  count?: number;
}

export async function get<I extends Identified, T>(
  r: Reddit,
  config: AxiosRequestConfig,
  map: (d: T) => I,
  options: GetOptions | undefined
) {
  const children: I[] = [];
  var after: string | undefined;
  var count = options?.count || 25;

  while (true) {
    if (count <= 0) {
      return new Page(r, config, map, children);
    }

    const res = await r.api.get<Api.ListingRes<T>>(config.url!, {
      ...config,
      params: {
        ...config.params,
        limit: Math.min(count, 100),
        after,
      },
    });
    const data = res.data instanceof Array ? res.data[1] : res.data;
    children.push(...data.data.children.map(map));
    after = data.data.after!;

    count -= 100;
  }
}
