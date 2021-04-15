import Reddit from "../../../reddit";
import FullPost, { DistinguishKinds } from "../full";
import Submission from "../submission/small";
import Comment from "./small";

export default class FullComment extends Comment implements FullPost {
  saved: boolean;
  archived: boolean;
  locked: boolean;
  stickied: boolean;
  distinguished: DistinguishKinds;

  constructor(r: Reddit, submission: Submission, data: Api.Comment) {
    super(r, data.id, submission);

    this.saved = data.saved;
    this.archived = data.archived;
    this.locked = data.locked;
    this.stickied = data.stickied;
    this.distinguished =
      data.distinguished === "moderator" ? "mod" : data.distinguished;
  }
}
