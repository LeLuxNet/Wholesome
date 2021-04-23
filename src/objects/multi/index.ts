import Deletable from "../../interfaces/deletable";
import Fetchable from "../../interfaces/fetchable";
import Content from "../../media/content";
import { Image } from "../../media/image";
import Reddit from "../../reddit";
import { Subreddit } from "../subreddit";
import { User } from "../user";

export class Multi implements Deletable, Fetchable<Multi> {
  r: Reddit;

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
    this.r = r;

    this.name = data.display_name;
    this.description =
      data.description_html === ""
        ? null
        : {
            markdown: data.description_md,
            html: data.description_html,
          };
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

  async fetch() {
    const res = await this.r.api.get<Api.MultiWrap>(`api/multi${this.key}`);
    return new Multi(this.r, res.data.data);
  }

  async copy(name: string) {
    this.r.needScopes("subscribe");
    const res = await this.r.api.post("api/multi/copy", {
      display_name: name,
      from: this.key,
      to: `user/${encodeURIComponent(
        this.r.needUsername
      )}/m/${encodeURIComponent(name)}`,
    });
    console.log(res.data);
  }

  async delete() {
    this.r.needScopes("subscribe");
    await this.r.api.delete("api/multi/{name}", {
      fields: { name: this.name },
    });
  }

  async addSubreddit(sub: Subreddit) {
    this.r.needScopes("subscribe");
    await this.r.api.put(`api/multi${this.key}/r/{sub}`, undefined, {
      fields: { sub: sub.name },
    });
  }

  async removeSubreddit(sub: Subreddit) {
    this.r.needScopes("subscribe");
    await this.r.api.delete(`api/multi${this.key}/r/{sub}`, {
      fields: { sub: sub.name },
    });
  }
}
