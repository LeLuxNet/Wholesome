import { Deletable } from "../../interfaces/deletable";
import { Fetchable } from "../../interfaces/fetchable";
import { Content } from "../../media/content";
import { Image } from "../../media/image";
import Reddit from "../../reddit";
import { Subreddit } from "../subreddit";
import { Feed } from "../subreddit/feed";
import { User } from "../user";

export class Multi extends Feed implements Deletable, Fetchable<Multi> {
  name: string;
  description: Content | null;
  url: string;

  key: string;

  owner: User;
  created: Date;
  subscribers: number;

  nsfw: boolean;

  icon: Image;

  subreddits: Subreddit[];

  /** @internal */
  constructor(r: Reddit, data: Api.Multi) {
    super(r, data.subreddits.map((s) => s.name).join("+"));

    this.name = data.display_name;
    this.description =
      data.description_html === ""
        ? null
        : { markdown: data.description_md, html: data.description_html };
    this.url = `https://www.reddit.com${data.path}`;
    this.key = data.path;

    this.owner = r.user(data.owner);
    this.created = new Date(data.created_utc * 1000);
    this.subscribers = data.num_subscribers;

    this.nsfw = data.over_18;

    this.icon = {
      native: {
        url: data.icon_url,
        width: 1100,
        height: 1100,
      },
    };

    this.subreddits = data.subreddits.map((s) => r.subreddit(s.name));
  }

  async fetch(): Promise<Multi> {
    const { data } = await this.r.api.g<Api.MultiWrap>(`api/multi${this.key}`);
    return new Multi(this.r, data);
  }

  async copy(name: string): Promise<Multi> {
    this.r.needScopes("subscribe");
    const { data } = await this.r.api.p<Api.MultiWrap>("api/multi/copy", {
      display_name: name,
      from: this.key,
      to: `user/${encodeURIComponent(
        this.r.needUsername
      )}/m/${encodeURIComponent(name)}`,
    });
    return new Multi(this.r, data);
  }

  async delete(): Promise<void> {
    this.r.needScopes("subscribe");
    await this.r.api.json("delete", "api/multi/{name}", undefined, {
      name: this.name,
    });
  }

  async addSubreddit(sub: Subreddit): Promise<void> {
    this.r.needScopes("subscribe");
    await this.r.api.json("put", `api/multi${this.key}/r/{sub}`, undefined, {
      sub: sub.name,
    });
  }

  async removeSubreddit(sub: Subreddit): Promise<void> {
    this.r.needScopes("subscribe");
    await this.r.api.json("delete", `api/multi${this.key}/r/{sub}`, undefined, {
      sub: sub.name,
    });
  }
}
