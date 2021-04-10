import Deletable from "../../interfaces/deletable";
import Identified from "../../interfaces/identified";
import Replyable from "../../mixins/replyable";
import Reddit from "../../reddit";
import { DistinguishKinds } from "./full";

export type VoteDirection = 1 | 0 | -1;

class _Post implements Deletable, Identified {
  r: Reddit;

  id: string;
  fullId: string;

  constructor(r: Reddit, id: string, fullId: string) {
    this.r = r;

    this.id = id;
    this.fullId = fullId;
  }

  async delete() {
    this.r.authScope("edit");
    await this.r.api.post("api/del", { id: this.fullId });
  }

  async vote(dir: VoteDirection) {
    this.r.authScope("vote");
    await this.r.api.post("api/vote", { dir, id: this.fullId });
  }

  async hide(save: boolean = true) {
    this.r.authScope("report");
    await this.r.api.post(`api/${save ? "hide" : "unhide"}`, {
      id: this.fullId,
    });
  }

  async save(save: boolean = true) {
    this.r.authScope("save");
    await this.r.api.post(`api/${save ? "save" : "unsave"}`, {
      id: this.fullId,
    });
  }

  async distinguish(kind: DistinguishKinds = "mod") {
    this.r.authScope("modposts");
    await this.r.api.post("api/distinguish", {
      id: this.fullId,
      how: kind === null ? "no" : kind === "mod" ? "yes" : kind,
    });
  }

  async lock(lock: boolean = true) {
    this.r.authScope("modposts");
    await this.r.api.post(`api/${lock ? "lock" : "unlock"}`, {
      id: this.fullId,
    });
  }

  async approve() {
    this.r.authScope("modposts");
    await this.r.api.post("api/approve", { id: this.fullId });
  }
}

export default class Post extends Replyable(_Post) {}
