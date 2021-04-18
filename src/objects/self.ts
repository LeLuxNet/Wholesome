import { get, GetOptions } from "../list/get";
import { stream, StreamCallback, StreamOptions } from "../list/stream";
import Reddit from "../reddit";
import { FullSubreddit } from "./subreddit";
import { User } from "./user";

export default class Self extends User {
  constructor(r: Reddit, name: string | undefined) {
    super(r, name || "");

    if (!name) {
      Object.defineProperty(this, "name", {
        get: () => {
          throw "Your self doesn't have a username";
        },
      });
    }
  }

  subreddits(options?: GetOptions) {
    this.r.needScopes("mysubreddits");
    return get<FullSubreddit, Api.SubredditWrap>(
      this.r,
      { url: "subreddits/mine/subscriber" },
      (d) => new FullSubreddit(this.r, d.data),
      options
    );
  }

  subredditsStream(fn: StreamCallback<FullSubreddit>, options?: StreamOptions) {
    this.r.needScopes("mysubreddits");
    return stream<FullSubreddit, Api.SubredditWrap>(
      this.r,
      { url: "subreddits/mine/subscriber" },
      (d) => new FullSubreddit(this.r, d.data),
      fn,
      options
    );
  }

  /* messageInbox() {
    this.r.needScopes("privatemessages");
    return new List<Message, Api.MessageWrap>(
      this.r,
      "message/inbox",
      (d) => new Message(this.r, d.data)
    );
  } */
}
