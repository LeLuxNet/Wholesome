import Fetchable from "../../../interfaces/fetchable";
import Reddit from "../../../reddit";
import Post, { PostConstructor } from "../small";
import Submission from "../submission/small";
import FullComment from "./full";

export function _Comment<T extends PostConstructor>(base: T) {
  class _Comment extends base implements Fetchable<FullComment | null> {
    submission: Submission;

    /** @internal */
    constructor(...args: any[]) {
      super(args[0], args[1], args[2]);

      this.submission = args[3];
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
  return _Comment;
}

export default class Comment extends _Comment(Post) {
  constructor(r: Reddit, id: string, submission: Submission) {
    // @ts-ignore
    super(r, id, `t1_${id}`, submission);
  }
}
