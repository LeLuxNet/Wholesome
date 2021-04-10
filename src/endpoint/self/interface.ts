import Page from "../../list/page";
import FullSubreddit from "../../objects/subreddit/full";

export default interface SelfEndpoint {
  subreddits(): Page<FullSubreddit>;
}
