import { List } from "../list/list";
import { FullSubreddit } from "./subreddit";
import { User } from "./user";

export default class Self extends User {
  subreddits() {
    this.r.authScope("mysubreddits");
    return new List<FullSubreddit, Api.SubredditWrap>(
      this.r,
      "subreddits/mine/subscriber",
      (d) => new FullSubreddit(this.r, d.data)
    );
  }
}
