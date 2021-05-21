import { Content } from "../../..";
import Reddit from "../../../reddit";
import FullPost from "../full";
import Submission from "../submission/small";
import Comment, { _Comment } from "./small";
import CommentTree from "./tree";

export default class FullComment extends _Comment(FullPost) implements Comment {
  comments: CommentTree;

  /** The comment body */
  body: Content;

  /** @internal */
  constructor(r: Reddit, data: Api.Comment, submission?: Submission) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    super(r, data, data.score_hidden, submission || r.submission(data.link_id));

    this.comments = new CommentTree(
      r,
      this.submission,
      this,
      data.replies ? data.replies.data.children : []
    );

    this.body = {
      markdown: data.body,
      html: data.body_html,
    };
  }
}
