import { ApiReq } from "../http/api";
import { Identified } from "../interfaces/identified";
import Reddit from "../reddit";
import { Page, pageLimit, PageOptions } from "./page";

export class APage<T extends Identified> implements Page<T> {
  items: T[];

  options: PageOptions;

  private data: AData<T>;
  private before: string;
  private after: string;

  /** @internal */
  constructor(
    items: T[],
    options: PageOptions,
    data: AData<T>,
    before: string,
    after: string
  ) {
    this.items = items;
    this.options = options;
    this.data = data;
    this.before = before;
    this.after = after;
  }

  next(limit?: number): Promise<Page<T>> {
    return aPage(this.data, this.options, undefined, this.after, limit);
  }

  prev(limit?: number): Promise<Page<T>> {
    return aPage(this.data, this.options, this.before, undefined, limit);
  }
}

export interface AData<T, I = any> {
  r: Reddit;
  req: ApiReq;
  mapItem: (i: I) => T;
}

export async function aPage<T extends Identified, I>(
  data: AData<T, I>,
  options: PageOptions | undefined,
  before?: string,
  after?: string,
  limit?: number
): Promise<Page<T>> {
  options ||= {};

  const children: T[] = [];
  limit = limit || options.limit || pageLimit;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const reqLimit = Math.min(limit, 100);
    const res = await data.r.api.exec<Api.ListingRes<I>>({
      ...data.req,
      params: {
        ...data.req.params,
        limit: reqLimit,
        before,
        after: before ? undefined : after,
      },
    });
    const d = res instanceof Array ? res[1] : res;

    const c = d.data.children.map(data.mapItem);
    children.push(...c);
    limit -= c.length;
    if (c.length !== length || limit <= 0) {
      if (children.length === 0) {
        return new APage(
          children,
          options,
          data,
          (before || after)!,
          (after || before)!
        );
      } else {
        return new APage(
          children,
          options,
          data,
          children[0].fullId,
          children[children.length - 1].fullId
        );
      }
    }

    if (before) {
      before = c[0].fullId;
    } else {
      after = c[c.length - 1].fullId;
    }
  }
}
