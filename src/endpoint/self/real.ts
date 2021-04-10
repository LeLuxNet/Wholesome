import { get, GetOptions } from "../../list/get";
import FullSubreddit from "../../objects/subreddit/full";
import Reddit from "../../reddit";
import SelfEndpoint from "./interface";

export default class RealSelfEndpoint implements SelfEndpoint {
  r: Reddit;
  name: string;

  constructor(r: Reddit, name: string) {
    this.r = r;
    this.name = name;
  }

  async subreddits(options?: GetOptions) {
    this.r.authScope("mysubreddits");
    return await get<FullSubreddit, Api.SubredditWrap>(
      this.r,
      "subreddits/mine/subscriber",
      (d) => new FullSubreddit(this.r, d.data),
      options
    );
  }
}
