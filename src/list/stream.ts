import { AxiosRequestConfig } from "axios";
import { Identified } from "../interfaces/identified";
import Reddit from "../reddit";
import { sleep } from "../utils/sleep";

export interface StreamOptions {
  pullDelay?: number;
}

export async function* stream<I extends Identified, T>(
  r: Reddit,
  config: AxiosRequestConfig,
  map: (d: T) => I,
  options: StreamOptions | undefined
): AsyncIterable<I> {
  const res = await r.api.get<Api.ListingRes<T>>(config.url!, {
    ...config,
    params: { ...config.params, limit: 1 },
  });

  const data = res.data instanceof Array ? res.data[1] : res.data;
  const first = map(data.data.children[0]);
  let before = first.fullId;

  while (true) {
    const time = Date.now();

    const res = await r.api.get<Api.ListingRes<T>>(config.url!, {
      ...config,
      params: { ...config.params, before, limit: 100 },
    });
    const data = res.data instanceof Array ? res.data[1] : res.data;

    const children = data.data.children.map(map);
    if (children.length > 0) {
      before = children[0].fullId;
    }

    yield* children;

    const wait = (options?.pullDelay ?? 2000) - (Date.now() - time);
    if (wait > 0) {
      await sleep(wait);
    }
  }
}
