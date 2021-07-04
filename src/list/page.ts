import Reddit from "../reddit";

const pageLimit = 25;

export interface PageOptions {
  limit?: number;
}

export interface Page<T> {
  items: T[];

  options: PageOptions;

  next: (limit?: number) => Promise<Page<T>>;
  prev: (limit?: number) => Promise<Page<T>>;
}

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
  id: string;
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

  const res = await data.r.api.gql<Response>(data.id, {
    [data.firstKey]: first || options?.limit || pageLimit,
    [data.afterKey]: after === undefined ? undefined : btoa(after.toString()),
  });
  const listing = data.mapRes(res);

  const children = listing.edges.map((n) => data.mapItem(n.node));

  return new GPage<Thing>(children, options, data, first || 0);
}
