import Identified from "../interfaces/identified";
import Reddit from "../reddit";

export default class Page<I extends Identified, T> {
  r: Reddit;
  url: string;
  map: (d: T) => I;

  items: I[];

  constructor(r: Reddit, url: string, map: (d: T) => I, items: I[]) {
    this.r = r;
    this.url = url;
    this.map = map;

    this.items = items;
  }

  fetch() {
    return fetchPage(
      this.r,
      this.url,
      this.map,
      undefined,
      this.items[0].fullId,
      this.items[this.items.length - 1].fullId
    );
  }

  next(count: number) {
    return fetchPage(this.r, this.url, this.map, count, this.items[0].fullId);
  }

  prev(count: number) {
    return fetchPage(
      this.r,
      this.url,
      this.map,
      count,
      undefined,
      this.items[this.items.length - 1].fullId
    );
  }
}

export async function fetchPage<I extends Identified, T>(
  r: Reddit,
  url: string,
  map: (d: T) => I,
  count?: number,
  before?: string,
  after?: string
) {
  const children: I[] = [];
  count = count || Number.MAX_VALUE;

  while (true) {
    const limit = Math.min(count, 100);
    const res = await r.api.get<Api.Listing<T>>(url, {
      params: {
        limit,
        before,
        after: before === undefined ? after : undefined,
      },
    });

    const c = res.data.data.children.map(map);
    children.push(...c);
    count -= c.length;
    if (c.length !== limit || count <= 0) {
      return new Page(r, url, map, children);
    }

    if (before === undefined) {
      after = c[c.length - 1].fullId;
    } else {
      before = c[0].fullId;
    }
  }
}
