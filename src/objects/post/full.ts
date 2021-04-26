import Action from "../../media/actions";
import { Subreddit } from "../subreddit";
import { SubmissionUser } from "../user";
import { VoteDirection } from "./small";
import { GivenAward } from "./submission/award";

export type DistinguishKinds = "mod" | "admin" | "special" | null;

export default interface FullPost {
  /** The user who posted this or null if he's 'u/[deleted]' */
  author: SubmissionUser | null;
  /** The subreddit it was posted on. */
  subreddit: Subreddit;

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
  stickied: boolean;
  distinguished: DistinguishKinds;

  deleted: boolean;
  approved: Action | null;
  removed: Action | null;
}
