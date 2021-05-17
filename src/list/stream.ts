import { AxiosRequestConfig } from "axios";
import Identified from "../interfaces/identified";
import Reddit from "../reddit";

export type StreamCallback<I extends Identified> = (
  data: I,
  end: () => void
) => void;

export interface StreamOptions {
  pullInterval?: number;
}

export async function stream<I extends Identified, T>(
  r: Reddit,
  config: AxiosRequestConfig,
  map: (d: T) => I,
  fn: StreamCallback<I>,
  options: StreamOptions | undefined
): Promise<void> {
  r.api
    .get<Api.ListingRes<T>>(config.url!, {
      ...config,
      params: { ...config.params, limit: 1 },
    })
    .then((res) => {
      const data = res.data instanceof Array ? res.data[1] : res.data;
      const first = map(data.data.children[0]);
      let before = first.fullId;

      const interval = setInterval(async () => {
        const res = await r.api.get<Api.ListingRes<T>>(config.url!, {
          ...config,
          params: { ...config.params, before, limit: 100 },
        });
        const data = res.data instanceof Array ? res.data[1] : res.data;

        const children = data.data.children.map(map);
        if (children.length > 0) {
          before = children[0].fullId;
        }

        children.forEach((d) => fn(d, () => clearInterval(interval)));
      }, options?.pullInterval || 2 * 1000);
    });
}
