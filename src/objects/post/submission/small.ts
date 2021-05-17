import Reddit from "../../..";
import Fetchable from "../../../interfaces/fetchable";
import CommentTree from "../comment/tree";
import Post, { PostConstructor } from "../small";
import FullSubmission from "./full";

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function _Submission<T extends PostConstructor>(base: T) {
  class _Submission extends base implements Fetchable<FullSubmission> {
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

    async follow(follow = true) {
      this.r.needScopes("subscribe");
      await this.r.api.post("api/follow_post", {
        follow,
        fullname: this.fullId,
      });
    }

    async markOc(oc = true) {
      this.r.needScopes("modposts");
      await this.r.api.post("api/set_original_content", {
        fullname: this.fullId,
        should_set_oc: oc,
      });
    }

    async markNsfw(nsfw = true) {
      this.r.needScopes("modposts");
      await this.r.api.post(`api/${nsfw ? "" : "un"}marknsfw`, {
        id: this.fullId,
      });
    }

    async markSpoiler(spoiler = true) {
      this.r.needScopes("modposts");
      await this.r.api.post(`api/${spoiler ? "" : "un"}spoiler`, {
        id: this.fullId,
      });
    }

    async markVisited() {
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
