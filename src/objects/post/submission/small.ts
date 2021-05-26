import Reddit from "../../..";
import Fetchable from "../../../interfaces/fetchable";
import CommentTree from "../comment/tree";
import Post, { PostConstructor } from "../small";
import FullSubmission from "./full";

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function _Submission<T extends PostConstructor>(base: T) {
  class _Submission extends base implements Fetchable<FullSubmission> {
    /** The short URL of this submission
     *
     * @example
     * ```ts
     * r.submission("mzrboj").shortURL // https://redd.it/mzrboj
     * ```
     */
    get shortUrl() {
      return `https://redd.it/${this.id}`;
    }

    async fetch() {
      const res = await this.r.api.get<Api.GetSubmission>(
        "comments/{id}.json",
        { fields: { id: this.id } }
      );
      return new FullSubmission(this.r, res.data[0].data.children[0].data);
    }

    async comments(): Promise<CommentTree> {
      const res = await this.r.api.get<Api.GetSubmission>(
        "comments/{id}.json",
        { fields: { id: this.id } }
      );
      return new CommentTree(this.r, this, this, res.data[1].data.children);
    }

    async follow() {
      this.r.needScopes("subscribe");
      await this.r.api.post("api/follow_post", {
        follow: true,
        fullname: this.fullId,
      });
    }

    async unfollow() {
      this.r.needScopes("subscribe");
      await this.r.api.post("api/follow_post", {
        follow: false,
        fullname: this.fullId,
      });
    }

    /** Mark this submission as OC
     *
     * This method can only be used by the submission author.
     *
     * @example
     * ```ts
     * // Mark OC
     * r.submission("i5nc5").setOc();
     *
     * // Unmark OC
     * r.submission("i5nc5").setOc(false);
     * ```
     * @param oc Whether this submission should be marked as OC.
     * @scope `modposts`
     */
    async setOc(oc = true) {
      this.r.needScopes("modposts");
      await this.r.api.post("api/set_original_content", {
        fullname: this.fullId,
        should_set_oc: oc,
      });
    }

    /** Mark this submission as NSFW
     *
     * This method can only be used by the submission author or a subreddit moderator.
     *
     * @example
     * ```ts
     * // Mark NSFW
     * r.submission("i5nc5").setNsfw();
     *
     * // Unmark NSFW
     * r.submission("i5nc5").setNsfw(false);
     * ```
     * @param nsfw Whether this submission should be marked as NSFW.
     * @scope `modposts`
     */
    async setNsfw(nsfw = true) {
      this.r.needScopes("modposts");
      await this.r.api.post(`api/${nsfw ? "" : "un"}marknsfw`, {
        id: this.fullId,
      });
    }

    async setSpoiler(spoiler = true) {
      this.r.needScopes("modposts");
      await this.r.api.post(`api/${spoiler ? "" : "un"}spoiler`, {
        id: this.fullId,
      });
    }

    /** Mark a submission as visited
     *
     * This feature requires reddit premium.
     *
     * @see {@link visited}
     */
    async setVisited() {
      this.r.needScopes("save");
      await this.r.api.post("api/store_visits", { links: this.fullId });
    }
  }
  return _Submission;
}

export default class Submission extends _Submission(Post) {
  constructor(r: Reddit, id: string) {
    super(r, id, `t3_${id}`);
  }
}
