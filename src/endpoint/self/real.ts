import { fetchPage } from "../../list/page";
import { FullSubreddit } from "../../objects/subreddit";
import Reddit from "../../reddit";
import SelfEndpoint from "./interface";

export default class RealSelfEndpoint implements SelfEndpoint {
  r: Reddit;
  name: string;

  constructor(r: Reddit, name: string) {
    this.r = r;
    this.name = name;
  }

  async subreddits(count: number) {
    this.r.authScope("mysubreddits");
    return await fetchPage<FullSubreddit, Api.SubredditWrap>(
      this.r,
      "subreddits/mine/subscriber",
      (d) => new FullSubreddit(this.r, d.data),
      count
    );
  }
}
