import Action from "../../media/actions";
import { GivenAward } from "../award";
import { Subreddit } from "../subreddit";
import { SubmissionUser } from "../user";
import { VoteDirection } from "./small";

export type DistinguishKinds = "mod" | "admin" | "special" | null;

export default interface FullPost {
  author: SubmissionUser | null;
  subreddit: Subreddit;

  created: Date;
  edited: Date | null;

  url: string;

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
