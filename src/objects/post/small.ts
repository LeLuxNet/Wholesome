import Deletable from "../../interfaces/deletable";
import Identified from "../../interfaces/identified";
import Replyable from "../../mixins/replyable";
import Reddit from "../../reddit";
import { DistinguishKinds } from "./full";
import { Award } from "./submission/award";

export type VoteDirection = 1 | 0 | -1;

class _Post implements Deletable, Identified {
  r: Reddit;

  id: string;
  fullId: string;

  get key() {
    return this.fullId;
  }

  constructor(r: Reddit, id: string, fullId: string) {
    this.r = r;

    this.id = id;
    this.fullId = fullId;
  }

  async delete() {
    this.r.needScopes("edit");
    await this.r.api.post("api/del", { id: this.fullId });
  }

  async vote(dir: VoteDirection) {
    this.r.needScopes("vote");
    await this.r.api.post("api/vote", { dir, id: this.fullId });
  }

  async award(award: Award, anonymous: boolean) {
    this.r.needScopes("creddits");
    await this.r.api.post("api/v2/gold/gild", {
      thing_id: this.fullId,
      gild_type: award.id,
      is_anonymous: anonymous,
    });
  }

  async edit(text: string) {
    this.r.needScopes("edit");
    await this.r.api.post("api/editusertext", {
      thing_id: this.fullId,
      text,
    });
  }

  async save(save: boolean = true) {
    this.r.needScopes("save");
    await this.r.api.post(`api/${save ? "save" : "unsave"}`, {
      id: this.fullId,
    });
  }

  async hide(save: boolean = true) {
    this.r.needScopes("report");
    await this.r.api.post(`api/${save ? "hide" : "unhide"}`, {
      id: this.fullId,
    });
  }

  async lock(lock: boolean = true) {
    this.r.needScopes("modposts");
    await this.r.api.post(`api/${lock ? "lock" : "unlock"}`, {
      id: this.fullId,
    });
  }

  async distinguish(kind: DistinguishKinds = "mod") {
    this.r.needScopes("modposts");
    await this.r.api.post("api/distinguish", {
      id: this.fullId,
      how: kind === null ? "no" : kind === "mod" ? "yes" : kind,
    });
  }

  async approve() {
    this.r.needScopes("modposts");
    await this.r.api.post("api/approve", { id: this.fullId });
  }
}

export default class Post extends Replyable(_Post) {}
