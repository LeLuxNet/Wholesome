import Page from "../../list/page";
import { FullSubreddit } from "../../objects/subreddit";

export default interface SelfEndpoint {
  subreddits(count: number): Promise<Page<FullSubreddit, any>>;
}
