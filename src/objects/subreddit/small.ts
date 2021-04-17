import { Stream } from "stream";
import { upload } from "../../helper/upload";
import Fetchable from "../../interfaces/fetchable";
import { List } from "../../list/list";
import Reddit from "../../reddit";
import { FullSubmission, Submission } from "../post";
import FullSubreddit from "./full";
import { parseRule, Rule } from "./rule";
import { Traffics } from "./traffic";

export default class Subreddit implements Fetchable<FullSubreddit> {
  r: Reddit;
  name: string;

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

  async join(join: boolean = true) {
    this.r.authScope("subscribe");
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
    this.r.authScope("modconfig");
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
    return new FullSubmission(this.r, res.data);
  }

  async randomSubmission() {
    const res = await this.r.api.get<Api.GetSubmission>(
      "r/{name}/random.json",
      { fields: { name: this.name } }
    );
    return new FullSubmission(this.r, res.data);
  }

  feed(kind: "hot" | "new" | "top" | "best" | "rising" | "controversial") {
    return new List<FullSubmission, Api.SubmissionWrap>(
      this.r,
      `r/${encodeURIComponent(this.name)}/${kind}.json`,
      (d) => new FullSubmission(this.r, d.data)
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
  subreddit.r.authScope("submit");
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
