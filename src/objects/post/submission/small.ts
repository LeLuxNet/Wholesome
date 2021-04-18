import Fetchable from "../../../interfaces/fetchable";
import Reddit from "../../../reddit";
import Post from "../small";
import FullSubmission from "./full";

export default class Submission
  extends Post
  implements Fetchable<FullSubmission> {
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
    return new FullSubmission(this.r, res.data);
  }

  async follow(follow: boolean = true) {
    this.r.needScopes("subscribe");
    await this.r.api.post("api/follow_post", {
      follow,
      fullname: this.fullId,
    });
  }

  async markOc(oc: boolean = true) {
    await this.r.api.post("api/set_original_content", {
      fullname: this.fullId,
      should_set_oc: oc,
    });
  }

  async markNsfw(nsfw: boolean = true) {
    await this.r.api.post(`api/${nsfw ? "" : "un"}marknsfw`, {
      id: this.fullId,
    });
  }

  async markSpoiler(spoiler: boolean = true) {
    await this.r.api.post(`api/${spoiler ? "" : "un"}spoiler`, {
      id: this.fullId,
    });
  }
}
