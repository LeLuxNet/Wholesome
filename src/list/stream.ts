import Identified from "../interfaces/identified";
import Reddit from "../reddit";

export type StreamCallback<I extends Identified> = (
  d: I,
  done: Function
) => void;

export interface StreamOptions {
  pullInterval?: number;
}

export async function stream<I extends Identified, T>(
  r: Reddit,
  url: string,
  map: (d: T) => I,
  fn: StreamCallback<I>,
  options: StreamOptions | undefined
) {
  r.api
    .get<Api.Listing<T>>(url, { params: { limit: 1 } })
    .then((res) => {
      const first = map(res.data.data.children[0]);
      var before = first.fullId;

      const interval = setInterval(async () => {
        const res = await r.api.get<Api.Listing<T>>(url, {
          params: { before, limit: 100 },
        });

        const children = res.data.data.children.map(map);
        if (children.length > 0) {
          before = children[0].fullId;
        }

        children.forEach((d) => fn(d, () => clearInterval(interval)));
      }, options?.pullInterval || 2 * 1000);
    });
}
