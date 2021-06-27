import { Deletable } from "../../interfaces/deletable";
import { Identified } from "../../interfaces/identified";
import { Content } from "../../media/content";
import Reddit from "../../reddit";
import { User } from "../user";

export class Message implements Identified, Deletable {
  r: Reddit;

  id: string;
  fullId: string;

  /** Wether this message is a notification showing up in the notification tab */
  get isNotification(): boolean {
    return this.fullId.startsWith("t1_");
  }

  title: string;
  author: User;

  created: Date;

  body: Content;

  /** @internal */
  constructor(r: Reddit, data: Api.Message) {
    this.r = r;

    this.id = data.id;
    this.fullId = data.name;

    this.title = data.subject;
    this.author = this.r.user(data.author);

    this.created = new Date(data.created_utc * 1000);

    this.body = {
      markdown: data.body,
      html: data.body_html,
    };
  }

  async reply(body: string): Promise<void> {
    this.r.needScopes("privatemessages");
    await this.r._api.post("api/comment", {
      thing_id: this.fullId,
      text: body,
    });
  }

  async delete(): Promise<void> {
    this.r.needScopes("privatemessages");
    await this.r._api.post("api/del_msg", { id: this.fullId });
  }

  /** Mark the message as read or unread */
  async setRead(read = true): Promise<void> {
    this.r.needScopes("privatemessages");
    await this.r._api.post(`api/${read ? "" : "un"}read_message`, {
      id: this.fullId,
    });
  }

  /** Collapse or uncollapse the message */
  async setCollapsed(collapsed = true): Promise<void> {
    this.r.needScopes("privatemessages");
    await this.r._api.post(`api/${collapsed ? "" : "un"}collapse_message`, {
      id: this.fullId,
    });
  }
}
