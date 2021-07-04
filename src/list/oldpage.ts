import { AxiosRequestConfig } from "axios";
import { Identified } from "../interfaces/identified";
import Reddit from "../reddit";

/**
 * A page reddit returns from listings
 *
 * @example
 *
 * ```ts
 * const page = await r.subreddit("askreddit").hot({ count: 10 });
 * page.items.length; // 10
 *
 * const nextPage = await page.next(20);
 * nextPage.items.length; // 20
 * ```
 */
export class _Page<I extends Identified, T = any> {
  r: Reddit;

  private config: AxiosRequestConfig;
  private map: (d: T) => I;
  private before: string;
  private after: string;

  items: I[];

  /** @internal */
  constructor(
    r: Reddit,
    config: AxiosRequestConfig,
    map: (d: T) => I,
    items: I[],
    before: string,
    after: string
  ) {
    this.r = r;

    this.config = config;
    this.map = map;
    this.before = before;
    this.after = after;

    this.items = items;
  }

  /** Refetch the current page */
  fetch(): Promise<_Page<I, T>> {
    return fetchPage(
      this.r,
      this.config,
      this.map,
      undefined,
      this.before,
      this.after
    );
  }

  /**
   * Fetch next page after this
   *
   * @param limit The maximum count of items
   */
  next(limit: number): Promise<_Page<I, T>> {
    return fetchPage(
      this.r,
      this.config,
      this.map,
      limit,
      undefined,
      this.after
    );
  }

  /**
   * Fetch previous page before this
   *
   * @param limit The maximum count of items
   */
  prev(limit: number): Promise<_Page<I, T>> {
    return fetchPage(this.r, this.config, this.map, limit, this.before);
  }
}

/** @internal */
export async function fetchPage<I extends Identified, T>(
  r: Reddit,
  config: AxiosRequestConfig,
  map: (d: T) => I,
  count?: number,
  before?: string,
  after?: string
): Promise<_Page<I, T>> {
  const children: I[] = [];
  count = count || Infinity;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const limit = Math.min(count, 100);
    const res = await r._api.get<Api.ListingRes<T>>(config.url as string, {
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
      if (children.length === 0) {
        return new _Page(
          r,
          config,
          map,
          children,
          (before || after)!,
          (after || before)!
        );
      }

      return new _Page(
        r,
        config,
        map,
        children,
        children[0].fullId,
        children[children.length - 1].fullId
      );
    }

    if (before === undefined) {
      after = c[c.length - 1].fullId;
    } else {
      before = c[0].fullId;
    }
  }
}
