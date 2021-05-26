import Deletable from "../../interfaces/deletable";
import Identified from "../../interfaces/identified";
import Reddit from "../../reddit";
import { Award } from "../award";
import { DistinguishKinds } from "./full";

export type VoteDirection = 1 | 0 | -1;

export type PostConstructor = new (...args: any[]) => Post;

export default class Post implements Deletable, Identified {
  r: Reddit;

  id: string;
  fullId: string;

  get key(): string {
    return this.fullId;
  }

  /** @internal */
  constructor(r: Reddit, id: string, fullId: string) {
    this.r = r;

    this.id = id;
    this.fullId = fullId;
  }

  /** Delete this thing */
  async delete(): Promise<void> {
    this.r.needScopes("edit");
    await this.r.api.post("api/del", { id: this.fullId });
  }

  /**
   * Casting a vote on a submission or comment
   *
   * :::note votes must be cast by humans.
   *
   * That is, API clients proxying a human's action one-for-one are OK, but bots deciding how to vote on content or amplifying a human's vote are not.
   * See {@link https://www.reddit.com/rules|the reddit rules} for more details on what constitutes vote cheating.
   *
   * :::
   *
   * @example Upvoting a submission
   * ```ts
   * r.submission("n0b6jn").vote(1);
   * ```
   * @param dir The direction of the vote<br/>
   * <br/>
   * 1 = upvote<br/>
   * 0 = unvote<br/>
   * -1 = downvote
   */
  async vote(dir: VoteDirection): Promise<void> {
    this.r.needScopes("vote");
    await this.r.api.post("api/vote", { dir, id: this.fullId });
  }

  async award(award: Award, anonymous: boolean): Promise<void> {
    this.r.needScopes("creddits");
    await this.r.api.post("api/v2/gold/gild", {
      thing_id: this.fullId,
      gild_type: award.id,
      is_anonymous: anonymous,
    });
  }

  /** Edit the body of a submission or comment
   *
   * @param body The new body in markdown
   * @see {@link FullSubmission.body} {@link FullSubmission.edited}
   */
  async edit(body: string): Promise<void> {
    this.r.needScopes("edit");
    await this.r.api.post("api/editusertext", {
      thing_id: this.fullId,
      text: body,
    });
  }

  async save(): Promise<void> {
    this.r.needScopes("save");
    await this.r.api.post("api/save", { id: this.fullId });
  }

  async unsave(): Promise<void> {
    this.r.needScopes("save");
    await this.r.api.post("api/unsave", { id: this.fullId });
  }

  async hide(): Promise<void> {
    this.r.needScopes("report");
    await this.r.api.post("api/hide", { id: this.fullId });
  }

  async unhide(): Promise<void> {
    this.r.needScopes("report");
    await this.r.api.post("api/unhide", { id: this.fullId });
  }

  async lock(): Promise<void> {
    this.r.needScopes("modposts");
    await this.r.api.post("api/lock", { id: this.fullId });
  }

  async unlock(): Promise<void> {
    this.r.needScopes("modposts");
    await this.r.api.post("api/unlock", { id: this.fullId });
  }

  async distinguish(kind: DistinguishKinds = "mod"): Promise<void> {
    this.r.needScopes("modposts");
    await this.r.api.post("api/distinguish", {
      id: this.fullId,
      how: kind === null ? "no" : kind === "mod" ? "yes" : kind,
    });
  }

  async approve(): Promise<void> {
    this.r.needScopes("modposts");
    await this.r.api.post("api/approve", { id: this.fullId });
  }

  async comment(body: string): Promise<void> {
    this.r.needScopes("submit");
    await this.r.api.post("api/comment", { thing_id: this.fullId, text: body });
  }
}
