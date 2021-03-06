import { Action } from "../../media/actions";
import Reddit from "../../reddit";
import { GivenAward } from "../award";
import { Subreddit } from "../subreddit";
import { PostUser, User } from "../user";
import { Post, VoteDirection } from "./small";

export type DistinguishKinds = "mod" | "admin" | "special" | null;

export class FullPost extends Post {
  /** The user who posted this or null if he's 'u/[deleted]' */
  author: PostUser | null;

  /** The subreddit it was posted on or a user if it was posted directly on it's profile */
  subreddit: Subreddit | User;

  /** The date this thing was created. */
  created: Date;
  /** The date the body was edited or `null` if it wasn't. */
  edited: Date | null;

  url: string;

  /** The *fuzzed* score it has or `null` if it's {@link scoreHidden|hidden}. */
  score: number | null;
  /** Whether the score is hidden. */
  scoreHidden: boolean;
  /** The vote the user casted on this. Use {@link vote} to change it. */
  voted: VoteDirection;

  awardCount: number;
  awards: GivenAward[];

  saved: boolean;
  archived: boolean;
  locked: boolean;
  sticky: boolean;
  distinguished: DistinguishKinds;

  deleted: boolean;
  approved: Action | null;
  removed: Action | null;

  /** @internal */
  constructor(
    r: Reddit,
    data: Api.Submission | Api.Comment,
    scoreHidden: boolean
  ) {
    super(r, data.id, data.name);

    this.author =
      data.author_fullname === undefined ? null : new PostUser(r, data);
    this.subreddit =
      data.subreddit_type === "user"
        ? r.user(data.subreddit.slice(2))
        : r.subreddit(data.subreddit);

    this.created = new Date(data.created_utc * 1000);
    this.edited = data.edited ? new Date(data.edited * 1000) : null;

    this.url = r.linkUrl + data.permalink;

    this.scoreHidden = scoreHidden;
    this.score = this.scoreHidden ? null : data.score;
    this.voted = data.likes === null ? 0 : data.likes ? 1 : -1;

    this.awardCount = data.total_awards_received;
    this.awards = data.all_awardings.map((a) => new GivenAward(a));

    this.saved = data.saved;
    this.archived = data.archived;
    this.locked = data.locked;
    this.sticky = data.stickied;
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
