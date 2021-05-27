import { Stream } from "stream";
import { FullSubreddit } from ".";
import { UnrealSubreddit } from "../../error";
import { upload } from "../../helper/upload";
import Fetchable from "../../interfaces/fetchable";
import { get, GetOptions } from "../../list/get";
import Page from "../../list/page";
import { BaseImage } from "../../media/image";
import Reddit from "../../reddit";
import { FullSubmission, Submission } from "../post";
import { User } from "../user";
import Feed from "./feed";
import { ModPermission, ModRelation } from "./moderator";
import { Requirements } from "./requirement";
import { parseRule, Rule } from "./rule";
import { Style } from "./style";
import { Traffics } from "./traffic";
import { parseWidgets, Widgets } from "./widget";

export interface BanOptions {
  message?: string;

  reason?: string;

  /** A note only visible to other moderators */
  modNote?: string;

  /** Duration of the ban in days */
  duration?: number;
}

export default class Subreddit
  extends Feed
  implements Fetchable<FullSubreddit>
{
  name: string;
  get key(): string {
    return this.name;
  }

  /** @internal */
  constructor(r: Reddit, name: string) {
    super(r, name);

    this.name = name;
  }

  get url(): string {
    return `${this.r.linkUrl}/r/${encodeURIComponent(this.name)}`;
  }

  isReal(): boolean {
    return (
      !this.name.includes("+") &&
      !["all", "popular", "friends", "mod"].includes(this.name.toLowerCase())
    );
  }

  private _checkReal(): void {
    if (this.isReal()) return;
    throw new UnrealSubreddit();
  }

  async fetch(): Promise<FullSubreddit> {
    const res = await this.r.api.get<Api.SubredditWrap>("r/{name}/about.json", {
      fields: { name: this.name },
    });
    return new FullSubreddit(this.r, res.data.data);
  }

  async stylesheet(): Promise<string> {
    this._checkReal();
    const res = await this.r.api.get<string>("/r/{name}/stylesheet.json", {
      fields: { name: this.name },
    });
    return res.data;
  }

  async widgets(): Promise<Widgets> {
    this._checkReal();
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
    this._checkReal();
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
    this._checkReal();
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
    this._checkReal();
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
  }

  async setModeratorPermissions(
    user: User,
    permissions: ModPermission[]
  ): Promise<void> {
    this._checkReal();
    this.r.needScopes("modothers");
    await this.r.api.post(
      "r/{name}/api/setpermissions",
      { name: user.name, permissions: permissions?.join(",") },
      { fields: { name: this.name } }
    );
  }

  async removeModeratorInvite(user: User): Promise<void> {
    this._checkReal();
    this.r.needScopes("modothers");
    await this.r.api.post(
      "r/{name}/api/unfriend",
      { type: "moderator_invite", name: user.name },
      { fields: { name: this.name } }
    );
  }

  async removeModerator(user: User): Promise<void> {
    this._checkReal();
    this.r.needScopes("modothers");
    await this.r.api.post(
      "r/{name}/api/unfriend",
      { type: "moderator", name: user.name },
      { fields: { name: this.name } }
    );
  }

  async mute(user: User): Promise<void> {
    this._checkReal();
    this.r.needScopes("modcontributors");
    await this.r.api.post(
      "r/{name}/api/friend",
      { type: "muted", name: user.name },
      { fields: { name: this.name } }
    );
  }

  async unmute(user: User): Promise<void> {
    this._checkReal();
    this.r.needScopes("modcontributors");
    await this.r.api.post(
      "r/{name}/api/unfriend",
      { type: "muted", name: user.name },
      { fields: { name: this.name } }
    );
  }

  async ban(user: User, options: BanOptions = {}): Promise<void> {
    this._checkReal();
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
  }

  async unban(user: User): Promise<void> {
    this._checkReal();
    this.r.needScopes("modothers");
    await this.r.api.post(
      "r/{name}/api/unfriend",
      { type: "banned", name: user.name },
      { fields: { name: this.name } }
    );
  }

  /** Join the subreddit
   *
   * @example
   * ```ts
   * r.subreddit("announcements").join();
   * ```
   * @scope `subscribe`
   * @see {@link leave}
   */
  async join(): Promise<void> {
    this._checkReal();
    this.r.needScopes("subscribe");
    await this.r.api.post("api/subscribe", {
      action: "sub",
      skip_initial_defaults: true,
      sr_name: this.name,
    });
  }

  /** Leave the subreddit
   *
   * @example
   * ```ts
   * r.subreddit("memes").leave();
   * ```
   * @scope `subscribe`
   * @see {@link join}
   */
  async leave(): Promise<void> {
    this._checkReal();
    this.r.needScopes("subscribe");
    await this.r.api.post("api/subscribe", {
      action: "unsub",
      sr_name: this.name,
    });
  }

  async rules(): Promise<Rule[]> {
    this._checkReal();
    const res = await this.r.api.get<Api.SubredditRules>(
      "r/{name}/about/rules.json",
      { fields: { name: this.name } }
    );
    return res.data.rules.map(parseRule);
  }

  async requirements(): Promise<Requirements> {
    this._checkReal();
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
    this._checkReal();
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

  /** Allows to view a quarantined subreddit
   *
   * @example
   * ```ts
   * const sub = r.subreddit("QUESTIONABLE");
   *
   * await sub.top(); // Throws error
   *
   * await sub.viewQuarantined();
   * await sub.top(); // Works
   *
   * await sub.viewQuarantined(false);
   * await sub.top(); // Throws error again
   * ```
   * @param view Whether the user should be able to access the quarantined subreddit
   */
  async viewQuarantined(view = true): Promise<void> {
    await this.r.api.post(`api/quarantine_opt${view ? "in" : "out"}`, {
      sr_name: this.name,
    });
  }

  /** Submit a link to this subreddit
   *
   * @example
   * ```ts
   * await r
   *   .subreddit("test")
   *   .submitLink("A example page", "https://www.example.com", {
   *     nsfw: true,
   *   });
   * ```
   * @param title The title the submission has
   * @param url The URL to submit
   * @param options Options containing additional information about the submission
   */
  submitLink(
    title: string,
    url: string,
    options?: NewSubmissionOptions
  ): Promise<Submission> {
    this._checkReal();
    return submit(this, title, { kind: "link", url }, options);
  }

  /** Submit text to this subreddit
   *
   * @example
   * ```ts
   * await r
   *   .subreddit("test")
   *   .submitText("An important message", "Lorem ipsum dolor sit amet, ...", {
   *     spoiler: true,
   *   });
   * ```
   * @param title The title the submission has
   * @param body The text in markdown format
   * @param options Options containing additional information about the submission
   */
  submitText(
    title: string,
    body?: string,
    options?: NewSubmissionOptions
  ): Promise<Submission> {
    this._checkReal();
    return submit(this, title, { kind: "self", text: body }, options);
  }

  /** Submit a image or video to this subreddit.
   *
   * @example
   * ```ts
   * import { createReadStream } from "fs";
   *
   * await r
   *   .subreddit("test")
   *   .submitMedia(
   *     "A beautiful painting",
   *     createReadStream("painting.png"),
   *     "image/png",
   *     { oc: true }
   *   );
   * ```
   * @param title The title the submission has
   * @param file The file as a stream
   * @param mimetype The mime type the file has. This could be something like `image/png` or `video/mp4`.
   * @param options Options containing additional information about the submission
   */
  async submitMedia(
    title: string,
    file: Stream,
    mimetype: string,
    options?: NewSubmissionOptions
  ): Promise<Submission> {
    this._checkReal();
    const url = await upload(this.r, file, mimetype);
    return this.submitLink(title, url, options);
  }

  /** Submit a submission containing a poll to this subreddit
   *
   * @example
   * ```ts
   * await r
   *   .subreddit("test")
   *   .submitPoll(
   *     "Favorite color",
   *     "What's your favorite color?",
   *     ["red", "green", "blue", "yellow"],
   *     3
   *   );
   * ```
   * @param title The title the submission has
   * @param body The text in markdown format
   * @param items The available options people can vote for in the poll
   * @param duration The number of days the poll will accept votes for. The accepted values range from 1 to 7, included.
   * @param options Options containing additional information about the submission
   */
  submitPoll(
    title: string,
    body: string | undefined,
    items: string[],
    duration: number,
    options?: NewSubmissionOptions
  ): Promise<Submission> {
    this._checkReal();
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
    this._checkReal();
    return submit(
      this,
      title,
      { kind: "crosspost", crosspost_fullname: submission.fullId },
      options
    );
  }
}

export interface NewSubmissionOptions {
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

      nsfw: options?.nsfw,
      spoiler: options?.spoiler,

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
    await submission.setOc();
  }

  return submission;
}

function createStyleImage(url: string | null): BaseImage | null {
  return url ? { native: { url } } : null;
}

export interface SubmissionSearchOptions extends GetOptions {
  sort?: "relevance" | "hot" | "top" | "new" | "comments";
}
