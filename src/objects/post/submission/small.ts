import Reddit from "../../..";
import { Fetchable } from "../../../interfaces/fetchable";
import { CommentTree } from "../comment/tree";
import { Post, PostConstructor } from "../small";
import { FullSubmission } from "./full";

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function _Submission<T extends PostConstructor>(base: T) {
  class _Submission extends base implements Fetchable<FullSubmission> {
    /**
     * The short URL of this submission
     *
     * @example
     *
     * ```ts
     * r.submission("mzrboj").shortURL; // https://redd.it/mzrboj
     * ```
     */
    get shortUrl() {
      return `https://redd.it/${this.id}`;
    }

    async fetch() {
      const [data] = await this.r.api.g<Api.GetSubmission>("comments/{id}", {
        id: this.id,
      });
      return new FullSubmission(this.r, data.data.children[0].data);
    }

    async comments(): Promise<CommentTree> {
      const data = await this.r.api.g<Api.GetSubmission>("comments/{id}", {
        id: this.id,
      });
      return new CommentTree(this.r, this, this, data[1].data.children);
    }

    async follow() {
      this.r.needScopes("subscribe");
      await this.r.api.p("api/follow_post", {
        follow: true,
        fullname: this.fullId,
      });
    }

    async unfollow() {
      this.r.needScopes("subscribe");
      await this.r.api.p("api/follow_post", {
        follow: false,
        fullname: this.fullId,
      });
    }

    /**
     * Mark this submission as OC
     *
     * This method can only be used by the submission author.
     *
     * @example
     *
     * ```ts
     * // Mark as OC
     * r.submission("i5nc5").setOc();
     *
     * // Unmark as OC
     * r.submission("i5nc5").setOc(false);
     * ```
     *
     * @param oc Whether this submission should be marked as OC.
     * @scope `modposts`
     */
    async setOc(oc = true) {
      this.r.needScopes("modposts");
      await this.r.api.p("api/set_original_content", {
        fullname: this.fullId,
        should_set_oc: oc,
      });
    }

    /**
     * Mark this submission as NSFW
     *
     * This method can only be used by the submission author or a subreddit moderator.
     *
     * @example
     *
     * ```ts
     * // Mark as NSFW
     * r.submission("i5nc5").setNsfw();
     *
     * // Unmark as NSFW
     * r.submission("i5nc5").setNsfw(false);
     * ```
     *
     * @param nsfw Whether this submission should be marked as NSFW.
     * @scope `modposts`
     */
    async setNsfw(nsfw = true) {
      this.r.needScopes("modposts");
      await this.r.api.p(`api/${nsfw ? "" : "un"}marknsfw`, {
        id: this.fullId,
      });
    }

    /**
     * Mark this submission as a spoiler
     *
     * This method can only be used by the submission author.
     *
     * @example
     *
     * ```ts
     * // Mark as a spoiler
     * r.submission("i5nc5").setSpoiler();
     *
     * // Unmark OC
     * r.submission("i5nc5").setSpoiler(false);
     * ```
     *
     * @param spoiler Whether this submission should be marked as a spoiler.
     * @scope `modposts`
     */
    async setSpoiler(spoiler = true) {
      this.r.needScopes("modposts");
      await this.r.api.p(`api/${spoiler ? "" : "un"}spoiler`, {
        id: this.fullId,
      });
    }

    /**
     * Mark a submission as visited
     *
     * This feature requires reddit premium.
     *
     * @see {@link visited}
     */
    async setVisited() {
      this.r.needScopes("save");
      await this.r.api.p("api/store_visits", { links: this.fullId });
    }
  }
  return _Submission;
}

export class Submission extends _Submission(Post) {
  constructor(r: Reddit, id: string) {
    super(r, id, `t3_${id}`);
  }
}
