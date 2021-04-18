import Fetchable from "../../interfaces/fetchable";
import Reddit from "../../reddit";
import { Multi } from "../multi";
import { FullUser } from "./full";
import { Trophy } from "./trophy";

export class User implements Fetchable<FullUser> {
  r: Reddit;

  name: string;
  get key() {
    return this.name;
  }

  constructor(r: Reddit, name: string) {
    this.r = r;
    this.name = name;
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

  async sendMessage(subject: string, body: string) {
    this.r.needScopes("privatemessages");
    await this.r.api.post("api/compose", {
      subject,
      text: body,
      to: this.name,
    });
  }
}
