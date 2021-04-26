import Deletable from "../../interfaces/deletable";
import Identified from "../../interfaces/identified";
import Reddit from "../../reddit";
import { DistinguishKinds } from "./full";
import { Award } from "./submission/award";

export type VoteDirection = 1 | 0 | -1;

export type PostConstructor = new (...args: any[]) => Post;

export default class Post implements Deletable, Identified {
  r: Reddit;

  id: string;
  fullId: string;

  get key() {
    return this.fullId;
  }

  /** @internal */
  constructor(r: Reddit, id: string, fullId: string) {
    this.r = r;

    this.id = id;
    this.fullId = fullId;
  }

  /** Delete this thing */
  async delete() {
    this.r.needScopes("edit");
    await this.r.api.post("api/del", { id: this.fullId });
  }

  /**
   * Casting a vote on a submission or comment
   *
   * **Note: votes must be cast by humans.**
   * That is, API clients proxying a human's action one-for-one are OK, but bots deciding how to vote on content or amplifying a human's vote are not.
   * See {@link https://www.reddit.com/rules|the reddit rules} for more details on what constitutes vote cheating.
   *
   * @param dir The direction of the vote
   *
   *  1 = upvote \
   *  0 = unvote \
   * -1 = downvote
   */
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

  /**
   * Edit the body of a submission or comment
   * @param body The new body in markdown
   */
  async edit(body: string) {
    this.r.needScopes("edit");
    await this.r.api.post("api/editusertext", {
      thing_id: this.fullId,
      text: body,
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

  async comment(body: string) {
    this.r.needScopes("submit");
    await this.r.api.post("api/comment", { thing_id: this.fullId, text: body });
  }
}
