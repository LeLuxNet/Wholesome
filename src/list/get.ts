import Identified from "../interfaces/identified";
import Reddit from "../reddit";
import Page from "./page";

export interface GetOptions {
  count?: number;
  time?: "hour" | "day" | "week" | "month" | "year" | "all";
}

export async function get<I extends Identified, T>(
  r: Reddit,
  url: string,
  map: (d: T) => I,
  options: GetOptions | undefined
) {
  const children: I[] = [];
  var after: string | undefined;
  var count = options?.count || 25;

  while (true) {
    if (count <= 0) {
      return new Page(r, url, map, children);
    }

    const res = await r.api.get<Api.Listing<T>>(url, {
      params: {
        limit: Math.min(count, 100),
        t: options?.time,
        after,
      },
    });
    children.push(...res.data.data.children.map(map));
    after = res.data.data.after!;

    count -= 100;
  }
}
