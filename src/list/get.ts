import { AxiosRequestConfig } from "axios";
import { Identified } from "../interfaces/identified";
import Reddit from "../reddit";
import { Page } from "./page";

export interface GetOptions {
  limit?: number;
}

export async function get<I extends Identified, T>(
  r: Reddit,
  config: AxiosRequestConfig,
  map: (d: T) => I,
  options: GetOptions | undefined
): Promise<Page<I, T>> {
  const children: I[] = [];
  let after: string | undefined;
  let limit = options?.limit || 25;

  while (limit > 0) {
    const res = await r._api.get<Api.ListingRes<T>>(config.url!, {
      ...config,
      params: {
        ...config.params,
        limit: Math.min(limit, 100),
        after,
      },
    });
    const data = res.data instanceof Array ? res.data[1] : res.data;
    children.push(...data.data.children.map(map));
    after = children[children.length - 1].fullId;

    limit -= 100;
  }

  return new Page(
    r,
    config,
    map,
    children,
    children[0].fullId,
    children[children.length - 1].fullId
  );
}
