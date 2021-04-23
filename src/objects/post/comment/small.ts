import Fetchable from "../../../interfaces/fetchable";
import Reddit from "../../../reddit";
import Post from "../small";
import Submission from "../submission/small";
import FullComment from "./full";

export default class Comment
  extends Post
  implements Fetchable<FullComment | null> {
  submission: Submission;

  /** @internal */
  constructor(r: Reddit, id: string, submission: Submission) {
    super(r, id, `t1_${id}`);

    this.submission = submission;
  }

  async fetch() {
    const res = await this.r.api.get<Api.GetSubmission>(
      "comments/{submission}//{id}.json",
      { fields: { submission: this.submission.id, id: this.id } }
    );
    const children = res.data[1].data.children;

    if (children.length === 0) return null;
    return new FullComment(
      this.r,
      children[0].data as Api.Comment,
      this.submission
    );
  }
}
