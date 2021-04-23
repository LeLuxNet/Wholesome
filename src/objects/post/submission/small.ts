import Fetchable from "../../../interfaces/fetchable";
import Reddit from "../../../reddit";
import CommentTree from "../comment/tree";
import Post from "../small";
import FullSubmission from "./full";

export default class Submission
  extends Post
  implements Fetchable<FullSubmission> {
  /** @internal */
  constructor(r: Reddit, id: string) {
    super(r, id, `t3_${id}`);
  }

  get shortUrl() {
    return `https://redd.it/${this.id}`;
  }

  async fetch() {
    const res = await this.r.api.get<Api.GetSubmission>("comments/{id}.json", {
      fields: { id: this.id },
    });
    return new FullSubmission(this.r, res.data[0].data.children[0].data);
  }

  async comments() {
    const res = await this.r.api.get<Api.GetSubmission>("comments/{id}.json", {
      fields: { id: this.id },
    });
    return new CommentTree(this.r, this, this, res.data[1].data.children);
  }

  async follow(follow: boolean = true) {
    this.r.needScopes("subscribe");
    await this.r.api.post("api/follow_post", {
      follow,
      fullname: this.fullId,
    });
  }

  async markOc(oc: boolean = true) {
    this.r.needScopes("modposts");
    await this.r.api.post("api/set_original_content", {
      fullname: this.fullId,
      should_set_oc: oc,
    });
  }

  async markNsfw(nsfw: boolean = true) {
    this.r.needScopes("modposts");
    await this.r.api.post(`api/${nsfw ? "" : "un"}marknsfw`, {
      id: this.fullId,
    });
  }

  async markSpoiler(spoiler: boolean = true) {
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
