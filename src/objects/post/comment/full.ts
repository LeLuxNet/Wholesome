import Reddit from "../../../reddit";
import { Subreddit } from "../../subreddit";
import FullPost, { DistinguishKinds } from "../full";
import Submission from "../submission/small";
import Comment from "./small";

export default class FullComment extends Comment implements FullPost {
  subreddit: Subreddit;

  score: number | null;

  saved: boolean;
  archived: boolean;
  locked: boolean;
  stickied: boolean;
  distinguished: DistinguishKinds;

  constructor(r: Reddit, submission: Submission, data: Api.Comment) {
    super(r, data.id, submission);

    this.subreddit = r.subreddit(data.subreddit);

    this.score = data.score_hidden ? null : data.score;

    this.saved = data.saved;
    this.archived = data.archived;
    this.locked = data.locked;
    this.stickied = data.stickied;
    this.distinguished =
      data.distinguished === "moderator" ? "mod" : data.distinguished;
  }
}
