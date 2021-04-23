import { BaseImage } from "../../media/image";

export interface Style {
  /** The icon of the subreddit */
  icon: BaseImage | null;

  /** The custom upvote button if it isn't pressed */
  upvoteInactive: BaseImage | null;
  /** The custom upvote button if it's pressed */
  upvoteActive: BaseImage | null;
  /** The custom downvote button if it isn't pressed */
  downvoteInactive: BaseImage | null;
  /** The custom downvote button if it's pressed */
  downvoteActive: BaseImage | null;
}
