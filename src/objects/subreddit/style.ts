import { BaseImage } from "../../media/image";
import { Widgets } from "./widget";

export interface Style {
  /** The subreddit widgets accessible using {@link Subreddit.widgets} */
  widgets: Widgets;

  /** The icon of the subreddit */
  icon: BaseImage | null;

  /** The custom upvote button if it isn't pressed */
  upvoteInactive: BaseImage | null;
  /** The custom upvote button if it's pressed */
  upvoteActive: BaseImage | null;
  /** The color of the vote count after upvoting */
  upvoteColor: string | null;

  /** The custom downvote button if it isn't pressed */
  downvoteInactive: BaseImage | null;
  /** The custom downvote button if it's pressed */
  downvoteActive: BaseImage | null;
  /** The color of the vote count after downvoting */
  downvoteColor: string | null;

  /** The background color of the page */
  backgroundColor: string | null;
}
