import { ApiClient } from "../../http/api";
import { aPage } from "../../list/apage";
import { Page, PageOptions } from "../../list/page";
import { stream, StreamOptions } from "../../list/stream";
import Reddit from "../../reddit";
import { FullSubmission } from "../post";

const nameSymbol = Symbol();

function feedSorting(
  feed: Feed,
  sort: string,
  options: PageOptions | undefined
): Promise<Page<FullSubmission>> {
  return aPage<FullSubmission, Api.SubmissionWrap>(
    {
      r: feed.r,
      req: ApiClient.g(`r/{name}/${sort}`, { name: feed[nameSymbol] }),
      mapItem: (d) => new FullSubmission(feed.r, d.data),
    },
    options
  );
}

export class Feed {
  r: Reddit;

  [nameSymbol]: string;

  constructor(r: Reddit, name: string) {
    this.r = r;
    this[nameSymbol] = name;
  }

  hot(options?: PageOptions): Promise<Page<FullSubmission>> {
    // TODO: 'g' param
    return feedSorting(this, "hot", options);
  }

  new(options?: PageOptions): Promise<Page<FullSubmission>> {
    return feedSorting(this, "new", options);
  }

  top(options?: TimeOptions): Promise<Page<FullSubmission>> {
    return aPage<FullSubmission, Api.SubmissionWrap>(
      {
        r: this.r,
        req: ApiClient.g(
          "r/{name}/top",
          { name: this[nameSymbol] },
          { t: options?.time }
        ),
        mapItem: (d) => new FullSubmission(this.r, d.data),
      },
      options
    );
  }

  rising(options?: PageOptions): Promise<Page<FullSubmission>> {
    return feedSorting(this, "rising", options);
  }

  controversial(options?: TimeOptions): Promise<Page<FullSubmission>> {
    return aPage<FullSubmission, Api.SubmissionWrap>(
      {
        r: this.r,
        req: ApiClient.g(
          "r/{name}/controversial",
          { name: this[nameSymbol] },
          { t: options?.time }
        ),
        mapItem: (d) => new FullSubmission(this.r, d.data),
      },
      options
    );
  }

  submissionsStream(options?: StreamOptions): AsyncIterable<FullSubmission> {
    return stream<FullSubmission, Api.SubmissionWrap>(
      this.r,
      ApiClient.g("r/{name}/new", { name: this[nameSymbol] }),
      (d) => new FullSubmission(this.r, d.data),
      options
    );
  }
}

export type Times = "hour" | "day" | "week" | "month" | "year" | "all";

export interface TimeOptions extends PageOptions {
  time?: Times;
}
