import { Subreddit } from "../subreddit";

export type DistinguishKinds = "mod" | "admin" | "special" | null;

export default interface FullPost {
  subreddit: Subreddit;

  saved: boolean;
  archived: boolean;
  locked: boolean;
  stickied: boolean;
  distinguished: DistinguishKinds;
}
