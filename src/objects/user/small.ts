import Fetchable from "../../interfaces/fetchable";
import Reddit from "../../reddit";
import FullUser from "./full";

export default class User implements Fetchable<FullUser> {
  r: Reddit;

  name: string;

  constructor(r: Reddit, name: string) {
    this.r = r;
    this.name = name;
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

  async sendMessage(subject: string, body: string) {
    this.r.authScope("privatemessages");
    await this.r.api.post("api/compose", {
      subject,
      text: body,
      to: this.name,
    });
  }
}
