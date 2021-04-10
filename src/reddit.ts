import axios, { AxiosInstance } from "axios";
import SelfEndpoint from "./endpoint/self/interface";
import bodyInterceptor from "./http/body";
import debugInterceptor from "./http/debug";
import fieldInterceptor from "./http/fields";
import { Submission } from "./objects/post/submission";
import Subreddit from "./objects/subreddit/small";

interface RedditConstructor {
  userAgent: string;

  debug?: boolean;
}

export default class Reddit {
  api: AxiosInstance;

  selfEndpoint?: SelfEndpoint;

  constructor(data: RedditConstructor) {
    this.api = axios.create({
      baseURL: "https://www.reddit.com",
      headers: {
        "User-Agent": data.userAgent,
      },
      params: {
        raw_json: 1,
      },
    });

    this.api.interceptors.request.use(fieldInterceptor);
    this.api.interceptors.request.use(bodyInterceptor);

    if (data.debug) {
      this.api.interceptors.response.use(debugInterceptor);
    }
  }

  authScope(...scopes: string[]) {}

  submission(id: string) {
    return new Submission(this, id);
  }

  subreddit(name: string) {
    return new Subreddit(name);
  }
}
