import { Stream } from "stream";
import { FullSubreddit } from ".";
import { upload } from "../../helper/upload";
import Fetchable from "../../interfaces/fetchable";
import { get, GetOptions } from "../../list/get";
import { stream, StreamCallback, StreamOptions } from "../../list/stream";
import { BaseImage } from "../../media/image";
import Reddit from "../../reddit";
import { FullSubmission, Submission } from "../post";
import { parseRule, Rule } from "./rule";
import { Style } from "./style";
import { Traffics } from "./traffic";
import { parseWidgets } from "./widget";

export type Times = "hour" | "day" | "week" | "month" | "year" | "all";

export type TimeOptions = GetOptions & { time?: Times };

export default class Subreddit implements Fetchable<FullSubreddit> {
  r: Reddit;

  name: string;
  get key() {
    return this.name;
  }

  /** @internal */
  constructor(r: Reddit, name: string) {
    this.r = r;

    this.name = name;
  }

  get url() {
    return `${this.r.linkUrl}/r/${encodeURIComponent(this.name)}`;
  }

  get stylesheet() {
    return `${this.url}/stylesheet.json`;
  }

  async fetch() {
    const res = await this.r.api.get<Api.SubredditWrap>("r/{name}/about.json", {
      fields: { name: this.name },
    });
    return new FullSubreddit(this.r, res.data.data);
  }

  async widgets() {
    if (
      this.r.auth &&
      (this.r.auth.scopes === "*" || this.r.auth.scopes.has("structuredstyles"))
    ) {
      this.r.needScopes("structuredstyles");
      const res = await this.r.api.get<Api.SubredditWidgets>(
        "r/{name}/api/widgets",
        { fields: { name: this.name } }
      );

      return parseWidgets(this.r, res.data);
    } else {
      const res = await this.r.api.get<Api.Style>(
        "api/v1/structured_styles/{name}.json",
        { fields: { name: this.name } }
      );

      return parseWidgets(this.r, res.data.data.content.widgets);
    }
  }

  /** Get structured subreddit styles */
  async style(): Promise<Style> {
    const res = await this.r.api.get<Api.Style>(
      "api/v1/structured_styles/{name}.json",
      { fields: { name: this.name } }
    );
    const s = res.data.data.style;

    return {
      widgets: parseWidgets(this.r, res.data.data.content.widgets),

      icon: createStyleImage(s.communityIcon),

      upvoteInactive: createStyleImage(s.postUpvoteIconInactive),
      upvoteActive: createStyleImage(s.postUpvoteIconActive),
      upvoteColor: s.postUpvoteCountColor,

      downvoteInactive: createStyleImage(s.postDownvoteIconInactive),
      downvoteActive: createStyleImage(s.postDownvoteIconActive),
      downvoteColor: s.postDownvoteCountColor,

      backgroundColor: s.backgroundColor,
    };
  }

  async moderators() {
    const res = await this.r.api.get<Api.SubredditModerators>(
      "r/{name}/about/moderators",
      { fields: { name: this.name } }
    );
    return res.data.data.children.map((m) => {
      return {
        user: this.r.user(m.name),
        date: new Date(m.date),
      };
    });
  }

  async join(join: boolean = true) {
    this.r.needScopes("subscribe");
    await this.r.api.post("api/subscribe", {
      action: join ? "sub" : "unsub",
      skip_initial_defaults: join ? true : undefined,
      sr_name: this.name,
    });
  }

  async rules(): Promise<Rule[]> {
    const res = await this.r.api.get<Api.SubredditRules>(
      "r/{name}/about/rules.json",
      { fields: { name: this.name } }
    );
    return res.data.rules.map(parseRule);
  }

  async traffic(): Promise<Traffics> {
    this.r.needScopes("modconfig");
    const res = await this.r.api.get<Api.SubredditTraffic>(
      "r/{name}/about/traffic.json",
      { fields: { name: this.name } }
    );
    return {
      hour: res.data.hour.map((d) => {
        return {
          time: new Date(d[0] * 1000),
          views: d[1],
          uniqueViews: d[2],
        };
      }),
      day: res.data.day.map((d) => {
        return {
          time: new Date(d[0] * 1000),
          views: d[1],
          uniqueViews: d[2],
          joined: d[3],
        };
      }),
      month: res.data.month.map((d) => {
        return {
          time: new Date(d[0] * 1000),
          views: d[1],
          uniqueViews: d[2],
        };
      }),
    };
  }

  async sticky(num: 1 | 2 = 1) {
    const res = await this.r.api.get<Api.GetSubmission>(
      "r/{name}/about/sticky.json",
      { fields: { name: this.name }, params: { num } }
    );
    return new FullSubmission(this.r, res.data[0].data.children[0].data);
  }

  async randomSubmission() {
    const res = await this.r.api.get<Api.GetSubmission>(
      "r/{name}/random.json",
      { fields: { name: this.name } }
    );
    return new FullSubmission(this.r, res.data[0].data.children[0].data);
  }

  hot(options?: GetOptions) {
    // TODO: 'g' param
    return get<FullSubmission, Api.SubmissionWrap>(
      this.r,
      { url: "r/{sub}/hot.json", fields: { sub: this.name } },
      (d) => new FullSubmission(this.r, d.data),
      options
    );
  }

  new(options?: GetOptions) {
    return get<FullSubmission, Api.SubmissionWrap>(
      this.r,
      { url: "r/{sub}/new.json", fields: { sub: this.name } },
      (d) => new FullSubmission(this.r, d.data),
      options
    );
  }

  top(options?: TimeOptions) {
    return get<FullSubmission, Api.SubmissionWrap>(
      this.r,
      {
        url: "r/{sub}/top.json",
        fields: { sub: this.name },
        params: { t: options?.time },
      },
      (d) => new FullSubmission(this.r, d.data),
      options
    );
  }

  rising(options?: GetOptions) {
    return get<FullSubmission, Api.SubmissionWrap>(
      this.r,
      { url: "r/{sub}/rising.json", fields: { sub: this.name } },
      (d) => new FullSubmission(this.r, d.data),
      options
    );
  }

  controversial(options?: TimeOptions) {
    return get<FullSubmission, Api.SubmissionWrap>(
      this.r,
      {
        url: "r/{sub}/controversial.json",
        fields: { sub: this.name },
        params: { t: options?.time },
      },
      (d) => new FullSubmission(this.r, d.data),
      options
    );
  }

  submissionsStream(
    fn: StreamCallback<FullSubmission>,
    options?: StreamOptions
  ) {
    return stream<FullSubmission, Api.SubmissionWrap>(
      this.r,
      { url: "r/{sub}/new.json", fields: { sub: this.name } },
      (d) => new FullSubmission(this.r, d.data),
      fn,
      options
    );
  }

  async searchSubmission(query: string, options?: SubmissionSearchOptions) {
    return get<FullSubmission, Api.SubmissionWrap>(
      this.r,
      {
        url: "r/{name}/search.json",
        fields: { name: this.name },
        params: { q: query, sort: options?.sort },
      },
      (d) => new FullSubmission(this.r, d.data),
      options
    );
  }

  submitLink(title: string, url: string, options?: NewSubmissionOptions) {
    return submit(this, title, { kind: "link", url }, options);
  }

  submitText(title: string, body?: string, options?: NewSubmissionOptions) {
    return submit(this, title, { kind: "self", text: body }, options);
  }

  async submitMedia(
    title: string,
    file: Stream,
    name: string,
    mimetype: string,
    options?: NewSubmissionOptions
  ) {
    const url = await upload(this.r, file, name, mimetype);
    this.submitLink(title, url, options);
  }

  submitPoll(
    title: string,
    body: string | undefined,
    items: string[],
    duration: number,
    options?: NewSubmissionOptions
  ) {
    return submit(
      this,
      title,
      { text: body, options: items, duration },
      options,
      "api/submit_poll_post"
    );
  }

  submitCrosspost(
    title: string,
    submission: Submission,
    options?: NewSubmissionOptions
  ) {
    return submit(
      this,
      title,
      { kind: "crosspost", crosspost_fullname: submission.fullId },
      options
    );
  }
}

interface NewSubmissionOptions {
  oc?: boolean;
  nsfw?: boolean;
  spoiler?: boolean;
}
async function submit(
  subreddit: Subreddit,
  title: string,
  data: any,
  options?: NewSubmissionOptions,
  url?: string
) {
  subreddit.r.needScopes("submit");
  const res = await subreddit.r.api.post(
    url || "api/submit",
    {
      sr: subreddit.name,
      title,

      spoiler: options?.spoiler,
      nsfw: options?.nsfw,

      ...data,
    },
    {
      headers: {
        "Content-Type": url === undefined ? undefined : "application/json",
      },
    }
  );
  const submission = subreddit.r.submission(res.data.json.data.id);

  if (options?.oc) {
    await submission.markOc();
  }

  return submission;
}

function createStyleImage(url: string | null): BaseImage | null {
  return url ? { native: { url } } : null;
}

export interface SubmissionSearchOptions extends GetOptions {
  sort?: "relevance" | "hot" | "top" | "new" | "comments";
}
