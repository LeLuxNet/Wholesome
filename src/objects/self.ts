import { get, GetOptions } from "../list/get";
import { stream, StreamCallback, StreamOptions } from "../list/stream";
import Reddit from "../reddit";
import { Message } from "./message";
import { FullSubmission } from "./post";
import { FullSubreddit } from "./subreddit";
import { User } from "./user";

export default class Self extends User {
  /** @internal */
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

  messagesStream(fn: StreamCallback<Message>, options?: StreamOptions) {
    this.r.needScopes("privatemessages");
    return stream<Message, Api.MessageWrap>(
      this.r,
      { url: "message/inbox" },
      (d) => new Message(this.r, d.data),
      fn,
      options
    );
  }

  voted(dir: 1 | -1, options?: GetOptions) {
    return get<FullSubmission, Api.Submission>(
      this.r,
      {
        url: `user/{name}/${dir === -1 ? "down" : "up"}voted`,
        fields: { name: this.name },
      },
      (d) => new FullSubmission(this.r, d),
      options
    );
  }

  votedStream(
    dir: 1 | -1,
    fn: StreamCallback<FullSubmission>,
    options?: StreamOptions
  ) {
    return stream<FullSubmission, Api.Submission>(
      this.r,
      {
        url: `user/{name}/${dir === -1 ? "down" : "up"}voted`,
        fields: { name: this.name },
      },
      (d) => new FullSubmission(this.r, d),
      fn,
      options
    );
  }

  saved(options?: GetOptions) {
    return get<FullSubmission, Api.Submission>(
      this.r,
      { url: "user/{name}/saved", fields: { name: this.name } },
      (d) => new FullSubmission(this.r, d),
      options
    );
  }

  savedStream(fn: StreamCallback<FullSubmission>, options?: StreamOptions) {
    return stream<FullSubmission, Api.Submission>(
      this.r,
      { url: "user/{name}/saved", fields: { name: this.name } },
      (d) => new FullSubmission(this.r, d),
      fn,
      options
    );
  }

  hidden(options?: GetOptions) {
    return get<FullSubmission, Api.Submission>(
      this.r,
      { url: "user/{name}/hidden", fields: { name: this.name } },
      (d) => new FullSubmission(this.r, d),
      options
    );
  }

  hiddenStream(fn: StreamCallback<FullSubmission>, options?: StreamOptions) {
    return stream<FullSubmission, Api.Submission>(
      this.r,
      { url: "user/{name}/hidden", fields: { name: this.name } },
      (d) => new FullSubmission(this.r, d),
      fn,
      options
    );
  }
}
