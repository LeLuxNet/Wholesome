import { AxiosResponse } from "axios";
import { ApiError } from "../../error/api";
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
    const res = await this.r._api.get<Api.UserWrap>("user/{name}/about.json", {
      fields: { name: this.name },
    });
    return new FullUser(this.r, res.data.data);
  }

  async nameAvailable(): Promise<boolean> {
    const res = await this.r._api.get<boolean>("api/username_available.json", {
      params: { user: this.name },
    });
    return res.data;
  }

  async givePremium(months: number): Promise<void> {
    this.r.needScopes("creddits");
    await this.r._api.post(
      "/api/v1/gold/give/{name}",
      { months },
      { fields: { name: this.name } }
    );
  }

  async friend(friend = true, note?: string): Promise<void> {
    this.r.needScopes("subscribe");

    let req: Promise<AxiosResponse>;
    if (friend) {
      req = this.r._api.put(
        "api/v1/me/friends/{name}",
        { note },
        {
          fields: { name: this.name },
          headers: { "Content-Type": "application/json" },
        }
      );
    } else {
      req = this.r._api.delete("api/v1/me/friends/{name}", {
        fields: { name: this.name },
      });
    }

    await req.catch((err) => {
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
    const res = await this.r._api.get<Api.TrophyList>(
      "user/{name}/trophies.json",
      { fields: { name: this.name } }
    );
    return res.data.data.trophies.map((d) => new Trophy(this.r, d.data));
  }

  async multis(): Promise<Multi[]> {
    const res = await this.r._api.get<Api.MultiWrap[]>(
      "api/multi/user/{name}",
      {
        fields: { name: this.name },
      }
    );
    return res.data.map((d) => new Multi(this.r, d.data));
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
      { url: "user/{name}/submitted.json", fields: { name: this.name } },
      (d) => new FullSubmission(this.r, d.data),
      options
    );
  }

  comments(options?: GetOptions): Promise<_Page<FullComment>> {
    return get<FullComment, Api.CommentWrap>(
      this.r,
      { url: "user/{name}/comments.json", fields: { name: this.name } },
      (d) => new FullComment(this.r, d.data),
      options
    );
  }

  commentsStream(options?: StreamOptions): AsyncIterable<FullComment> {
    return stream<FullComment, Api.CommentWrap>(
      this.r,
      { url: "user/{name}/comments.json", fields: { name: this.name } },
      (d) => new FullComment(this.r, d.data),
      options
    );
  }

  async sendMessage(subject: string, body: string): Promise<void> {
    this.r.needScopes("privatemessages");
    await this.r._api.post("api/compose", {
      subject,
      text: body,
      to: this.name,
    });
  }
}
