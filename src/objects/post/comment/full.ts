import Action from "../../../media/actions";
import Reddit from "../../../reddit";
import { Subreddit } from "../../subreddit";
import { SubmissionUser } from "../../user";
import FullPost, { DistinguishKinds } from "../full";
import { VoteDirection } from "../small";
import { GivenAward } from "../submission/award";
import Submission from "../submission/small";
import Comment from "./small";

export default class FullComment extends Comment implements FullPost {
  author: SubmissionUser | null;
  subreddit: Subreddit;

  created: Date;
  edited: Date | null;

  url: string;

  score: number | null;
  scoreHidden: boolean;
  voted: VoteDirection;

  awardCount: number;
  awards: GivenAward[];

  saved: boolean;
  archived: boolean;
  locked: boolean;
  stickied: boolean;
  distinguished: DistinguishKinds;

  deleted: boolean;
  approved: Action | null;
  removed: Action | null;

  constructor(r: Reddit, submission: Submission, data: Api.Comment) {
    super(r, data.id, submission);

    this.author =
      data.author_fullname === undefined ? null : new SubmissionUser(r, data);
    this.subreddit = r.subreddit(data.subreddit);

    this.created = new Date(data.created_utc * 1000);
    this.edited = data.edited ? new Date(data.edited * 1000) : null;

    this.url = r.linkUrl + data.permalink;

    this.score = data.score_hidden ? null : data.score;
    this.scoreHidden = data.score_hidden;
    this.voted = data.likes === null ? 0 : data.likes ? 1 : -1;

    this.awardCount = data.total_awards_received;
    this.awards = data.all_awardings.map((a) => new GivenAward(a));

    this.saved = data.saved;
    this.archived = data.archived;
    this.locked = data.locked;
    this.stickied = data.stickied;
    this.distinguished =
      data.distinguished === "moderator" ? "mod" : data.distinguished;

    this.deleted = this.author === null;
    this.approved =
      data.approved_by === null
        ? null
        : {
            by: r.user(data.approved_by),
            at: new Date(data.approved_at_utc! * 1000),
          };
    this.removed =
      data.banned_by === null
        ? null
        : {
            by: r.user(data.banned_by),
            at: new Date(data.banned_at_utc! * 1000),
          };
  }
}
