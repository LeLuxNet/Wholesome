import { ApiError } from "../../error/api";
import { ApiClient } from "../../http/api";
import { Fetchable } from "../../interfaces/fetchable";
import { get, GetOptions } from "../../list/get";
import { _Page } from "../../list/oldpage";
import { stream, StreamOptions } from "../../list/stream";
import Reddit from "../../reddit";
import { jsonFunction } from "../../utils/html";
import { Multi } from "../multi";
import { FullComment, FullSubmission } from "../post";
import { FullUser } from "./full";
import { mapOldAvatar, OldAvatar } from "./snoo";
import { Trophy } from "./trophy";

export class User implements Fetchable<FullUser> {
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

  is(u: User): boolean {
    return this.name.toLowerCase() === u.name.toLowerCase();
  }

  get url(): string {
    return `${this.r.linkUrl}/user/${encodeURIComponent(this.name)}`;
  }

  async fetch(): Promise<FullUser> {
    const { data } = await this.r.api.g<Api.UserWrap>("user/{name}/about", {
      name: this.name,
    });
    return new FullUser(this.r, data);
  }

  nameAvailable(): Promise<boolean> {
    return this.r.api.g<boolean>(
      "api/username_available",
      {},
      { user: this.name }
    );
  }

  async givePremium(months: number): Promise<void> {
    this.r.needScopes("creddits");
    await this.r.api.p(
      "/api/v1/gold/give/{name}",
      { months },
      { name: this.name }
    );
  }

  async friend(friend = true, note?: string): Promise<void> {
    this.r.needScopes("subscribe");

    let res: Promise<void>;
    if (friend) {
      res = this.r.api.json(
        "put",
        "api/v1/me/friends/{name}",
        { note },
        { name: this.name }
      );
    } else {
      res = this.r.api.json("delete", "api/v1/me/friends/{name}", undefined, {
        name: this.name,
      });
    }

    await res.catch((err) => {
      if (err instanceof ApiError && err.code === "NOT_FRIEND") return;
      throw err;
    });
  }

  /**
   * Get the items a users old avatar consists of.
   *
   * ::warning
   *
   * This function doesn't work in browsers.
   *
   * :::
   */
  async oldAvatar(): Promise<OldAvatar | null> {
    const res = await this.r._api.get<string>(
      "https://old.reddit.com/user/{name}/snoo",
      {
        fields: { name: this.name },
        validateStatus: (s) => s === 200 || s === 404,
      }
    );

    if (res.status === 404) return null;

    const data: Api.Snoo = jsonFunction("initSnoovatar", res.data);

    return mapOldAvatar(data);
  }

  async trophies(): Promise<Trophy[]> {
    const { data } = await this.r.api.g<Api.TrophyList>(
      "user/{name}/trophies",
      { name: this.name }
    );
    return data.trophies.map((d) => new Trophy(this.r, d.data));
  }

  async multis(): Promise<Multi[]> {
    const data = await this.r.api.g<Api.MultiWrap[]>("api/multi/user/{name}", {
      name: this.name,
    });
    return data.map((d) => new Multi(this.r, d.data));
  }

  submissions(options?: GetOptions): Promise<_Page<FullSubmission>> {
    return get<FullSubmission, Api.SubmissionWrap>(
      this.r,
      { url: "user/{name}/submitted.json", fields: { name: this.name } },
      (d) => new FullSubmission(this.r, d.data),
      options
    );
  }

  submissionsStream(options?: StreamOptions): AsyncIterable<FullSubmission> {
    return stream<FullSubmission, Api.SubmissionWrap>(
      this.r,
      ApiClient.g("user/{name}/submitted", { name: this.name }),
      (d) => new FullSubmission(this.r, d.data),
      options
    );
  }

  comments(options?: GetOptions): Promise<_Page<FullComment>> {
    return get<FullComment, Api.CommentWrap>(
      this.r,
      { url: "user/{name}/comments", fields: { name: this.name } },
      (d) => new FullComment(this.r, d.data),
      options
    );
  }

  commentsStream(options?: StreamOptions): AsyncIterable<FullComment> {
    return stream<FullComment, Api.CommentWrap>(
      this.r,
      ApiClient.g("user/{name}/comments", { name: this.name }),
      (d) => new FullComment(this.r, d.data),
      options
    );
  }

  async sendMessage(subject: string, body: string): Promise<void> {
    this.r.needScopes("privatemessages");
    await this.r.api.p("api/compose", {
      subject,
      text: body,
      to: this.name,
    });
  }
}
