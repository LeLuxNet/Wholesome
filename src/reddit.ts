import axios, { AxiosInstance } from "axios";
import Auth from "./auth";
import { Scope } from "./auth/scopes";
import SelfEndpoint from "./endpoint/self/interface";
import authInterceptor from "./http/auth";
import bodyInterceptor from "./http/body";
import debugInterceptor from "./http/debug";
import errorInterceptor from "./http/error";
import fieldInterceptor from "./http/fields";
import { Submission } from "./objects/post";
import { Subreddit } from "./objects/subreddit";
import { User } from "./objects/user";

interface RedditConstructor {
  userAgent: string;

  browser?: boolean;
  debug?: boolean;
}

export default class Reddit {
  api: AxiosInstance;

  auth?: Auth;

  selfEndpoint?: SelfEndpoint;

  constructor(data: RedditConstructor) {
    this.api = axios.create({
      baseURL: "https://www.reddit.com",
      headers: data.browser ? undefined : { "User-Agent": data.userAgent },
      params: { raw_json: 1 },
    });

    this.api.interceptors.request.use(fieldInterceptor);
    this.api.interceptors.request.use(bodyInterceptor);
    this.api.interceptors.request.use(authInterceptor(this));

    if (data.debug) {
      this.api.interceptors.response.use(debugInterceptor);
    }
    this.api.interceptors.response.use(errorInterceptor);
  }

  authScope(...scopes: Scope[]) {}

  authUsername() {
    if (this.auth === undefined) throw "Not authenticated";
    if (this.auth.username === undefined)
      throw "Not authenticated with a username";
    return this.auth.username;
  }

  submission(id: string) {
    return new Submission(this, id);
  }

  subreddit(name: string) {
    return new Subreddit(this, name);
  }

  get all() {
    return this.subreddit("all");
  }

  user(name: string) {
    return new User(this, name);
  }
}
