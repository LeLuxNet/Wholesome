import { Comment, FullComment, Submission } from "..";
import Reddit from "../../../reddit";

export default class CommentTree<T = Submission | FullComment> {
  r: Reddit;

  /** The submission this comment was posted under */
  submission: Submission;

  /** The comment above this or the submission in case of a top comment */
  parent: T;

  /** Already loaded comments */
  loadedComments: FullComment[] = [];

  /** Already loaded and comment that can be loaded later as single objects */
  allComments: (FullComment | Comment)[] = [];

  /** @internal */
  constructor(
    r: Reddit,
    submission: Submission,
    parent: T,
    data: Api.CommentMoreWrap[]
  ) {
    this.r = r;
    this.submission = submission;
    this.parent = parent;

    for (const d of data) {
      if (d.kind === "t1") {
        const c = new FullComment(r, d.data, submission);
        this.loadedComments.push(c);
        this.allComments.push(c);
      } else {
        this.allComments.push(
          ...d.data.children.map((c) => new Comment(r, c, submission))
        );
      }
    }
  }

  /**
   * Fetch all not fetched comments and return them together with the {@link loadedComments} comments
   *
   * @returns the comment or `null` if it has been deleted
   */
  fetchAll(): Promise<(FullComment | null)[]> {
    return Promise.all(
      this.allComments.map((c) => {
        if (c instanceof FullComment) {
          return Promise.resolve(c);
        } else {
          return c.fetch();
        }
      })
    );
  }

  /**
   * Fetch all not fetched comments
   *
   * @returns the comment or `null` if it has been deleted
   */
  fetchMissing() {
    const res: Promise<FullComment | null>[] = [];
    this.allComments.forEach((c) => {
      if (!(c instanceof FullComment)) {
        res.push(c.fetch());
      }
    });
    return Promise.all(res);
  }
}
