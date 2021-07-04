import { get, GetOptions } from "../../list/get";
import { _Page } from "../../list/oldpage";
import { stream, StreamOptions } from "../../list/stream";
import Reddit from "../../reddit";
import { FullSubmission } from "../post";

const nameSymbol = Symbol();

export class Feed {
  r: Reddit;

  [nameSymbol]: string;

  constructor(r: Reddit, name: string) {
    this.r = r;
    this[nameSymbol] = name;
  }

  hot(options?: GetOptions): Promise<_Page<FullSubmission>> {
    // TODO: 'g' param
    return get<FullSubmission, Api.SubmissionWrap>(
      this.r,
      { url: "r/{name}/hot.json", fields: { name: this[nameSymbol] } },
      (d) => new FullSubmission(this.r, d.data),
      options
    );
  }

  new(options?: GetOptions): Promise<_Page<FullSubmission>> {
    return get<FullSubmission, Api.SubmissionWrap>(
      this.r,
      { url: "r/{name}/new.json", fields: { name: this[nameSymbol] } },
      (d) => new FullSubmission(this.r, d.data),
      options
    );
  }

  top(options?: TimeOptions): Promise<_Page<FullSubmission>> {
    return get<FullSubmission, Api.SubmissionWrap>(
      this.r,
      {
        url: "r/{name}/top.json",
        fields: { name: this[nameSymbol] },
        params: { t: options?.time },
      },
      (d) => new FullSubmission(this.r, d.data),
      options
    );
  }

  rising(options?: GetOptions): Promise<_Page<FullSubmission>> {
    return get<FullSubmission, Api.SubmissionWrap>(
      this.r,
      { url: "r/{name}/rising.json", fields: { name: this[nameSymbol] } },
      (d) => new FullSubmission(this.r, d.data),
      options
    );
  }

  controversial(options?: TimeOptions): Promise<_Page<FullSubmission>> {
    return get<FullSubmission, Api.SubmissionWrap>(
      this.r,
      {
        url: "r/{name}/controversial.json",
        fields: { name: this[nameSymbol] },
        params: { t: options?.time },
      },
      (d) => new FullSubmission(this.r, d.data),
      options
    );
  }

  submissionsStream(options?: StreamOptions): AsyncIterable<FullSubmission> {
    return stream<FullSubmission, Api.SubmissionWrap>(
      this.r,
      { url: "r/{name}/new.json", fields: { name: this[nameSymbol] } },
      (d) => new FullSubmission(this.r, d.data),
      options
    );
  }
}

export type Times = "hour" | "day" | "week" | "month" | "year" | "all";

export interface TimeOptions extends GetOptions {
  time?: Times;
}
