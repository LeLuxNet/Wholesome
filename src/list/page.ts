import { AxiosRequestConfig } from "axios";
import Identified from "../interfaces/identified";
import Reddit from "../reddit";

export default class Page<I extends Identified, T> {
  r: Reddit;
  config: AxiosRequestConfig;
  map: (d: T) => I;

  items: I[];

  constructor(
    r: Reddit,
    config: AxiosRequestConfig,
    map: (d: T) => I,
    items: I[]
  ) {
    this.r = r;
    this.config = config;
    this.map = map;

    this.items = items;
  }

  fetch() {
    return fetchPage(
      this.r,
      this.config,
      this.map,
      undefined,
      this.items[0].fullId,
      this.items[this.items.length - 1].fullId
    );
  }

  next(count: number) {
    return fetchPage(
      this.r,
      this.config,
      this.map,
      count,
      undefined,
      this.items[this.items.length - 1].fullId
    );
  }

  prev(count: number) {
    return fetchPage(
      this.r,
      this.config,
      this.map,
      count,
      this.items[0].fullId
    );
  }
}

export async function fetchPage<I extends Identified, T>(
  r: Reddit,
  config: AxiosRequestConfig,
  map: (d: T) => I,
  count?: number,
  before?: string,
  after?: string
) {
  const children: I[] = [];
  count = count || Number.MAX_VALUE;

  while (true) {
    const limit = Math.min(count, 100);
    const res = await r.api.get<Api.ListingRes<T>>(config.url!, {
      ...config,
      params: {
        ...config.params,
        limit,
        before,
        after: before === undefined ? after : undefined,
      },
    });
    const data = res.data instanceof Array ? res.data[1] : res.data;

    const c = data.data.children.map(map);
    children.push(...c);
    count -= c.length;
    if (c.length !== limit || count <= 0) {
      return new Page(r, config, map, children);
    }

    if (before === undefined) {
      after = c[c.length - 1].fullId;
    } else {
      before = c[0].fullId;
    }
  }
}
