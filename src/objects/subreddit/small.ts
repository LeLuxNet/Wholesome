import { Stream } from "stream";
import { FullSubreddit } from ".";
import { upload } from "../../helper/upload";
import Fetchable from "../../interfaces/fetchable";
import { get, GetOptions } from "../../list/get";
import Page from "../../list/page";
import { stream, StreamCallback, StreamOptions } from "../../list/stream";
import { BaseImage } from "../../media/image";
import Reddit from "../../reddit";
import { FullSubmission, Submission } from "../post";
import { User } from "../user";
import { ModPermission, ModRelation } from "./moderator";
import { Requirements } from "./requirement";
import { parseRule, Rule } from "./rule";
import { Style } from "./style";
import { Traffics } from "./traffic";
import { parseWidgets, Widgets } from "./widget";

export type Times = "hour" | "day" | "week" | "month" | "year" | "all";

export type TimeOptions = GetOptions & { time?: Times };

export interface BanOptions {
  message?: string;

  reason?: string;

  /** A note only visible to other moderators */
  modNote?: string;

  /** Duration of the ban in days */
  duration?: number;
}

export default class Subreddit implements Fetchable<FullSubreddit> {
  r: Reddit;

  name: string;
  get key(): string {
    return this.name;
  }

  /** @internal */
  constructor(r: Reddit, name: string) {
    this.r = r;

    this.name = name;
  }

  get url(): string {
    return `${this.r.linkUrl}/r/${encodeURIComponent(this.name)}`;
  }

  async stylesheet(): Promise<string> {
    const res = await this.r.api.get<string>("/r/{name}/stylesheet.json", {
      fields: { name: this.name },
    });
    return res.data;
  }

  get stylesheetURL(): string {
    return `${this.url}/stylesheet.json`;
  }

  async fetch(): Promise<FullSubreddit> {
    const res = await this.r.api.get<Api.SubredditWrap>("r/{name}/about.json", {
      fields: { name: this.name },
    });
    return new FullSubreddit(this.r, res.data.data);
  }

  async widgets(): Promise<Widgets> {
    if (
      this.r.auth &&
      (this.r.auth.scopes === "*" || this.r.auth.scopes.has("structuredstyles"))
    ) {
      this.r.needScopes("structuredstyles");
      const res = await this.r.api.get<Api.SubredditWidgets>(
        "r/{name}/api/widgets",
        { fields: { name: this.name } }
      );

      return parseWidgets(this, res.data);
    } else {
      const res = await this.r.api.get<Api.Style>(
        "api/v1/structured_styles/{name}.json",
        { fields: { name: this.name } }
      );

      return parseWidgets(this, res.data.data.content.widgets);
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
      widgets: parseWidgets(this, res.data.data.content.widgets),

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

  async moderators(): Promise<ModRelation[]> {
    const res = await this.r.api.get<Api.SubredditModerators>(
      "r/{name}/about/moderators",
      { fields: { name: this.name } }
    );

    return res.data.data.children.map((r) => ({
      id: r.rel_id.slice(3),
      fullId: r.rel_id,

      user: this.r.user(r.name),
      since: new Date(r.date * 1000),

      permissions: r.mod_permissions,
    }));
  }

  async inviteModerator(
    user: User,
    permissions?: ModPermission[]
  ): Promise<void> {
    this.r.needScopes("modothers");
    await this.r.api.post(
      "r/{name}/api/friend",
      {
        type: "moderator_invite",
        name: user.name,
        permissions: permissions?.join(","),
      },
      { fields: { name: this.name } }
    );
    return;
  }

  async setModeratorPermissions(
    user: User,
    permissions: ModPermission[]
  ): Promise<void> {
    this.r.needScopes("modothers");
    await this.r.api.post(
      "r/{name}/api/setpermissions",
      { name: user.name, permissions: permissions?.join(",") },
      { fields: { name: this.name } }
    );
    return;
  }

  async removeModeratorInvite(user: User): Promise<void> {
    this.r.needScopes("modothers");
    await this.r.api.post(
      "r/{name}/api/unfriend",
      { type: "moderator_invite", name: user.name },
      { fields: { name: this.name } }
    );
    return;
  }

  async removeModerator(user: User): Promise<void> {
    this.r.needScopes("modothers");
    await this.r.api.post(
      "r/{name}/api/unfriend",
      { type: "moderator", name: user.name },
      { fields: { name: this.name } }
    );
    return;
  }

  async mute(user: User): Promise<void> {
    this.r.needScopes("modcontributors");
    await this.r.api.post(
      "r/{name}/api/friend",
      { type: "muted", name: user.name },
      { fields: { name: this.name } }
    );
    return;
  }

  async unmute(user: User): Promise<void> {
    this.r.needScopes("modcontributors");
    await this.r.api.post(
      "r/{name}/api/unfriend",
      { type: "muted", name: user.name },
      { fields: { name: this.name } }
    );
    return;
  }

  async ban(user: User, options: BanOptions = {}): Promise<void> {
    this.r.needScopes("modcontributors");
    await this.r.api.post(
      "r/{name}/api/friend",
      {
        type: "banned",
        name: user.name,
        ban_message: options.message,
        ban_reason: options.reason,
        note: options.modNote,
        duration: options.duration,
      },
      { fields: { name: this.name } }
    );
    return;
  }

  async unban(user: User): Promise<void> {
    this.r.needScopes("modothers");
    await this.r.api.post(
      "r/{name}/api/unfriend",
      { type: "banned", name: user.name },
      { fields: { name: this.name } }
    );
    return;
  }

  async join(join = true): Promise<void> {
    this.r.needScopes("subscribe");
    await this.r.api.post("api/subscribe", {
      action: join ? "sub" : "unsub",
      skip_initial_defaults: join ? true : undefined,
      sr_name: this.name,
    });
    return;
  }

  async rules(): Promise<Rule[]> {
    const res = await this.r.api.get<Api.SubredditRules>(
      "r/{name}/about/rules.json",
      { fields: { name: this.name } }
    );
    return res.data.rules.map(parseRule);
  }

  async requirements(): Promise<Requirements> {
    const res = await this.r.api.get<Api.SubredditRequirements>(
      "https://www.reddit.com/api/v1/{name}/post_requirements.json",
      { fields: { name: this.name } }
    );

    return {
      guideline: res.data.guidelines_text,

      titleLengthMin: res.data.title_text_min_length,
      titleLengthMax: res.data.title_text_max_length,
      titleRequired: res.data.title_required_strings,
      titleBlacklist: res.data.title_blacklisted_strings,
      titleRegexes: res.data.title_regexes,

      bodyLengthMin: res.data.body_text_min_length,
      bodyLengthMax: res.data.body_text_max_length,
      bodyRequired: res.data.body_required_strings,
      bodyBlacklist: res.data.body_blacklisted_strings,
      bodyRegexes: res.data.body_regexes,

      domainBlacklist:
        res.data.link_restriction_policy === "blacklist"
          ? res.data.domain_blacklist
          : null,
      domainWhitelist:
        res.data.link_restriction_policy === "whitelist"
          ? res.data.domain_whitelist
          : null,
    };
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

  async sticky(num: 1 | 2 = 1): Promise<FullSubmission> {
    const res = await this.r.api.get<Api.GetSubmission>(
      "r/{name}/about/sticky.json",
      { fields: { name: this.name }, params: { num } }
    );
    return new FullSubmission(this.r, res.data[0].data.children[0].data);
  }

  async randomSubmission(): Promise<FullSubmission> {
    const res = await this.r.api.get<Api.GetSubmission>(
      "r/{name}/random.json",
      { fields: { name: this.name } }
    );
    return new FullSubmission(this.r, res.data[0].data.children[0].data);
  }

  hot(options?: GetOptions): Promise<Page<FullSubmission>> {
    // TODO: 'g' param
    return get<FullSubmission, Api.SubmissionWrap>(
      this.r,
      { url: "r/{sub}/hot.json", fields: { sub: this.name } },
      (d) => new FullSubmission(this.r, d.data),
      options
    );
  }

  new(options?: GetOptions): Promise<Page<FullSubmission>> {
    return get<FullSubmission, Api.SubmissionWrap>(
      this.r,
      { url: "r/{sub}/new.json", fields: { sub: this.name } },
      (d) => new FullSubmission(this.r, d.data),
      options
    );
  }

  top(options?: TimeOptions): Promise<Page<FullSubmission>> {
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

  rising(options?: GetOptions): Promise<Page<FullSubmission>> {
    return get<FullSubmission, Api.SubmissionWrap>(
      this.r,
      { url: "r/{sub}/rising.json", fields: { sub: this.name } },
      (d) => new FullSubmission(this.r, d.data),
      options
    );
  }

  controversial(options?: TimeOptions): Promise<Page<FullSubmission>> {
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
  ): Promise<void> {
    return stream<FullSubmission, Api.SubmissionWrap>(
      this.r,
      { url: "r/{sub}/new.json", fields: { sub: this.name } },
      (d) => new FullSubmission(this.r, d.data),
      fn,
      options
    );
  }

  async searchSubmission(
    query: string,
    options?: SubmissionSearchOptions
  ): Promise<Page<FullSubmission>> {
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

  submitLink(
    title: string,
    url: string,
    options?: NewSubmissionOptions
  ): Promise<Submission> {
    return submit(this, title, { kind: "link", url }, options);
  }

  submitText(
    title: string,
    body?: string,
    options?: NewSubmissionOptions
  ): Promise<Submission> {
    return submit(this, title, { kind: "self", text: body }, options);
  }

  async submitMedia(
    title: string,
    file: Stream,
    name: string,
    mimetype: string,
    options?: NewSubmissionOptions
  ): Promise<Submission> {
    const url = await upload(this.r, file, name, mimetype);
    return this.submitLink(title, url, options);
  }

  submitPoll(
    title: string,
    body: string | undefined,
    items: string[],
    duration: number,
    options?: NewSubmissionOptions
  ): Promise<Submission> {
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
  ): Promise<Submission> {
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
