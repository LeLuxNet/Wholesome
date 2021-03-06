import { ApiReq } from "../http/api";
import Reddit from "../reddit";
import { Page, pageLimit, PageOptions } from "./page";

export class GPage<T> implements Page<T> {
  items: T[];

  options: PageOptions;

  private data: GData<T>;
  private first: number;

  /** @internal */
  constructor(items: T[], options: PageOptions, data: GData<T>, first: number) {
    this.items = items;
    this.options = options;
    this.data = data;
    this.first = first;
  }

  next(limit?: number): Promise<Page<T>> {
    return gPage(
      this.data,
      this.options,
      limit,
      this.first + this.items.length
    );
  }

  prev(limit?: number): Promise<Page<T>> {
    const l = limit || this.options.limit || pageLimit;
    const after = Math.max(0, this.first - l);
    return gPage(this.data, this.options, this.first - after, after);
  }
}

export interface GData<Thing, Response = any, ResponseNode = any> {
  r: Reddit;
  req: ApiReq;
  firstKey: string;
  afterKey: string;
  mapRes: (res: Response) => Api.GListing<ResponseNode>;
  mapItem: (i: ResponseNode) => Thing;
}

export async function gPage<Thing, Response, ResponseNode>(
  data: GData<Thing, Response, ResponseNode>,
  options: PageOptions | undefined,
  first?: number,
  after?: number
): Promise<Page<Thing>> {
  options ||= {};

  const req2 = {
    ...data.req,
    data: {
      ...data.req.data,
      [data.firstKey]: first || options?.limit || pageLimit,
      [data.afterKey]: after ? btoa(after.toString()) : undefined,
    },
  };

  const res = await data.r.api.exec<Response>(req2);
  const listing = data.mapRes(res);

  const children = listing.edges.map((n) => data.mapItem(n.node));

  return new GPage<Thing>(children, options, data, first || 0);
}
