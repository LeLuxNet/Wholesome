import { AxiosResponse } from "axios";
import { ApiError } from "../../error/api";
import Fetchable from "../../interfaces/fetchable";
import { get, GetOptions } from "../../list/get";
import { stream, StreamCallback, StreamOptions } from "../../list/stream";
import Reddit from "../../reddit";
import { Multi } from "../multi";
import { FullComment, FullSubmission } from "../post";
import { FullUser } from "./full";
import { Trophy } from "./trophy";

export class User implements Fetchable<FullUser> {
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

  is(u: User) {
    return this.name.toLowerCase() === u.name.toLowerCase();
  }

  get url() {
    return `${this.r.linkUrl}/user/${encodeURIComponent(this.name)}`;
  }

  async fetch() {
    const res = await this.r.api.get<Api.UserWrap>("user/{name}/about.json", {
      fields: { name: this.name },
    });
    return new FullUser(this.r, res.data.data);
  }

  async nameAvailable() {
    const res = await this.r.api.get<boolean>("api/username_available.json", {
      params: { user: this.name },
    });
    return res.data;
  }

  async givePremium(months: number) {
    this.r.needScopes("creddits");
    await this.r.api.post(
      "/api/v1/gold/give/{name}",
      { months },
      { fields: { name: this.name } }
    );
  }

  async friend(friend: boolean = true, note?: string): Promise<void> {
    this.r.needScopes("subscribe");

    var req: Promise<AxiosResponse>;
    if (friend) {
      req = this.r.api.put(
        "api/v1/me/friends/{name}",
        { note },
        {
          fields: { name: this.name },
          headers: { "Content-Type": "application/json" },
        }
      );
    } else {
      req = this.r.api.delete("api/v1/me/friends/{name}", {
        fields: { name: this.name },
      });
    }

    await req.catch((err) => {
      if (err instanceof ApiError && err.code === "NOT_FRIEND") return;
      throw err;
    });
  }

  async trophies() {
    const res = await this.r.api.get<Api.TrophyList>(
      "user/{name}/trophies.json",
      { fields: { name: this.name } }
    );
    return res.data.data.trophies.map((d) => new Trophy(d.data));
  }

  async multis() {
    const res = await this.r.api.get<Api.MultiWrap[]>("api/multi/user/{name}", {
      fields: { name: this.name },
    });
    return res.data.map((d) => new Multi(this.r, d.data));
  }

  submissions(options?: GetOptions) {
    return get<FullSubmission, Api.SubmissionWrap>(
      this.r,
      { url: "user/{name}/submitted.json", fields: { name: this.name } },
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
      { url: "user/{name}/submitted.json", fields: { name: this.name } },
      (d) => new FullSubmission(this.r, d.data),
      fn,
      options
    );
  }

  comments(options?: GetOptions) {
    return get<FullComment, Api.CommentWrap>(
      this.r,
      { url: "user/{name}/comments.json", fields: { name: this.name } },
      (d) => new FullComment(this.r, d.data),
      options
    );
  }

  commentsStream(fn: StreamCallback<FullComment>, options?: StreamOptions) {
    return stream<FullComment, Api.CommentWrap>(
      this.r,
      { url: "user/{name}/comments.json", fields: { name: this.name } },
      (d) => new FullComment(this.r, d.data),
      fn,
      options
    );
  }

  async sendMessage(subject: string, body: string) {
    this.r.needScopes("privatemessages");
    await this.r.api.post("api/compose", {
      subject,
      text: body,
      to: this.name,
    });
  }
}
