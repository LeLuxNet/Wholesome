import Identified from "../../interfaces/identified";
import Content from "../../media/content";
import Reddit from "../../reddit";
import { User } from "../user";

export class Message implements Identified {
  r: Reddit;

  id: string;
  fullId: string;

  subject: string;
  author: User;

  created: Date;

  body: Content;

  /** @internal */
  constructor(r: Reddit, data: Api.Message) {
    this.r = r;

    this.id = data.id;
    this.fullId = data.name;

    this.subject = data.subject;
    this.author = this.r.user(data.author);

    this.created = new Date(data.created_utc * 1000);

    this.body = {
      markdown: data.body,
      html: data.body_html,
    };
  }

  async reply(body: string) {
    this.r.needScopes("privatemessages");
    await this.r.api.post("api/comment", { thing_id: this.fullId, text: body });
  }
}
