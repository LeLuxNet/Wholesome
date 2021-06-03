import axios, { AxiosInstance, AxiosRequestConfig } from "axios";
import { Auth, AuthData } from "./auth";
import { Scope } from "./auth/scopes";
import authInterceptor from "./http/auth";
import bodyInterceptor from "./http/body";
import debugInterceptor from "./http/debug";
import errorInterceptor from "./http/error";
import fieldInterceptor from "./http/fields";
import { get, GetOptions } from "./list/get";
import Page from "./list/page";
import { Award } from "./objects/award";
import { awardMap } from "./objects/award/data";
import { Collection } from "./objects/collection";
import { FullSubmission, Submission } from "./objects/post";
import { FullSubreddit, Subreddit } from "./objects/subreddit";
import { SubmissionSearchOptions } from "./objects/subreddit/small";
import { FullUser, Self, User } from "./objects/user";

export interface UserAgent {
  /**
   * The platform your script runs on. When building a reddit client this could
   * be something like `web`, `android` or `windows`. Bots might want to use
   * something like `nodejs` or `linux` when running on a linux server.
   */
  platform: string;

  /**
   * A string identifying your app. This could be an your android package name
   * or the bots username
   *
   * @example `com.example.myapp` `someredditbot`
   */
  identifier: string;

  /**
   * The apps version number.
   *
   * @example `1.2.3` `v2.0-beta`
   */
  version: string;

  /**
   * Your reddit username used as a contact information
   *
   * @example `yourusername` `someuser`
   */
  author: string;
}

function generateUserAgent(ua: UserAgent) {
  `${ua.platform}:${ua.identifier}:${
    ua.version[0] === "v" ? ua.version : "v" + ua.version
  } (by /u/${ua.author})`;
}

export interface RedditConstructor {
  /**
   * The User agent sent to reddits API. We recommend passing it in as an
   * {@link UserAgent} object instead of an raw string.
   */
  userAgent: UserAgent | string;

  /** Log debug information such as API calls to the console */
  debug?: boolean;
}

declare const window: unknown;

export default class Reddit {
  /** @internal */
  api: AxiosInstance;

  auth?: Auth;

  linkUrl = "https://www.reddit.com";

  /** Create a `Reddit` instance */
  constructor(data: RedditConstructor) {
    this.api = axios.create({
      baseURL: "https://www.reddit.com",
      headers:
        typeof window === "undefined"
          ? {
              "User-Agent":
                typeof data.userAgent === "string"
                  ? data.userAgent
                  : generateUserAgent(data.userAgent),
            }
          : undefined,
      params: { raw_json: 1 },
    });

    if (data.debug) {
      this.api.interceptors.request.use(debugInterceptor);
    }

    this.api.interceptors.request.use(fieldInterceptor);
    this.api.interceptors.request.use(bodyInterceptor);
    this.api.interceptors.request.use(authInterceptor(this));

    errorInterceptor(this.api);
  }

  async login(data: AuthData): Promise<void> {
    let body: object;
    const config: AxiosRequestConfig = { skipAuth: true };
    let username: string | undefined;

    if ("code" in data) {
      config.auth = {
        username: data.client.id,
        password: data.client.secret || "",
      };

      body = {
        grant_type: "authorization_code",
        code: data.code,
        redirect_uri: data.redirectUri,
      };
    } else if ("client" in data) {
      config.auth = {
        username: data.client.id,
        password: data.client.secret,
      };

      if (data.auth === undefined) {
        body = {
          grant_type: "client_credentials",
        };
      } else {
        username = data.auth.username;
        body = {
          grant_type: "password",
          username: data.auth.username,
          password: data.auth.twoFA
            ? `${data.auth.password}:${data.auth.twoFA}`
            : data.auth.password,
        };
      }
    } else {
      body = {
        grant_type: "refresh_token",
        refresh_token: data.refreshToken,
      };
    }

    const res = await this.api.post<Api.AccessToken>(
      "https://www.reddit.com/api/v1/access_token",
      body,
      config
    );
    if ("error" in res.data) {
      throw (res.data as any).error;
    }

    const scopes =
      res.data.scope === "*"
        ? "*"
        : new Set(res.data.scope.split(" ") as Scope[]);

    if (res.data.refresh_token) {
      const refresh = (data: Api.AccessToken) => {
        const timeout = setTimeout(async () => {
          const res = await this.api.post<Api.AccessToken>(
            "https://www.reddit.com/api/v1/access_token",
            {
              grant_type: "refresh_token",
              refresh_token: data.refresh_token,
            },
            { skipAuth: true }
          );

          if (this.auth === undefined) return;
          this.auth.accessToken = res.data.access_token;

          refresh(res.data);
        }, (data.expires_in - 30) * 1000);
        timeout.unref();
      };

      refresh(res.data);
    } else {
      setTimeout(
        () => (this.auth = undefined),
        res.data.expires_in * 1000
      ).unref();
    }

    this.auth = {
      username,

      accessToken: res.data.access_token,
      refreshToken: res.data.refresh_token,

      scopes,
    };

    if ("code" in data && (scopes === "*" || scopes.has("identity"))) {
      const res2 = await this.api.get("api/v1/me");
      this.auth.username = res2.data.name;
    }
  }

  oauth(
    clientId: string,
    redirectUri: string,
    scopes: Scope[],
    temporary?: boolean
  ): string {
    return `https://www.reddit.com/api/v1/authorize?client_id=${encodeURIComponent(
      clientId
    )}&response_type=code&state=+&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&duration=${temporary ? "temporary" : "permanent"}&scope=${scopes.join(
      "+"
    )}`;
  }

  /** @internal */
  needScopes(...scopes: Scope[]): void {
    const auth = this.needAuth;
    if (auth.scopes === "*") return;

    const needed: string[] = [];
    for (const s of scopes) {
      if (!auth.scopes.has(s)) needed.push(s);
    }

    if (needed.length !== 0)
      throw `You are missing the ${needed.join(", ")} scope${
        needed.length === 1 ? "" : "s"
      }`;
  }

  /** @internal */
  get needAuth(): Auth {
    if (!this.auth) throw "You need to be authenticated to use this function";
    return this.auth;
  }

  /** @internal */
  get needUsername(): string {
    if (!this.auth || !this.auth.username)
      throw "You need to be authenticated with a user";
    return this.auth.username;
  }

  /**
   * Get a submission
   *
   * @example Get the title of a submission
   *
   * ```ts
   * const s = await r.submission("87").fetch();
   * s.title; // The Downing Street Memo
   * ```
   *
   * @param id The id with or without a prefix
   */
  submission(id: string): Submission {
    if (id.startsWith("t3_")) id = id.slice(3);
    return new Submission(this, id);
  }

  /**
   * Get multiple submissions at once
   *
   * @example Get the titles of multiple submission at once
   *
   * ```ts
   * const s = await r.submissions("87", "88");
   * s[0].author?.name; // kn0thing
   * s[1].author?.name; // spez
   * ```
   *
   * @param ids The ids with or without a prefix
   */
  async submissions(...ids: string[]): Promise<FullSubmission[]> {
    ids = ids.map((i) => (i.startsWith("t3_") ? i : "t3_" + i));
    const res = await this.api.get<Api.Listing<Api.SubmissionWrap>>(
      "api/info.json",
      { params: { id: ids.join(",") } }
    );
    return res.data.data.children.map((d) => new FullSubmission(this, d.data));
  }

  subreddit(...names: string[]): Subreddit {
    return new Subreddit(this, names.join("+"));
  }

  /** The r/all *pseudo* subreddit */
  get all(): Subreddit {
    return this.subreddit("all");
  }

  user(name: string): User {
    return new User(this, name);
  }

  get self(): Self | null {
    if (!this.auth) return null;
    return new Self(this, this.auth.username);
  }

  async collection(id: string): Promise<Collection> {
    const res = await this.api.get<Api.Collection>(
      "api/v1/collections/collection.json",
      { params: { collection_id: id, include_links: 0 } }
    );
    return new Collection(this, res.data);
  }

  async award(id: string): Promise<Award | null> {
    const sid = awardMap[id];
    if (!sid) return null;

    const res = await this.api.get<Api.Listing<Api.SubmissionWrap>>(
      "api/info.json",
      { params: { id: "t3_" + sid } }
    );
    for (const a of res.data.data.children[0].data.all_awardings) {
      if (a.id === id) {
        return new Award(a);
      }
    }
    return null;
  }

  async trendingSubreddits(): Promise<Subreddit[]> {
    // This endpoint only exists on www.reddit.com not on oauth.reddit.com
    const res = await this.api.get<Api.TrendingSubreddits>(
      "https://www.reddit.com/api/trending_subreddits.json"
    );
    return res.data.subreddit_names.map((n) => this.subreddit(n));
  }

  async searchSubmission(
    query: string,
    options?: SubmissionSearchOptions
  ): Promise<Page<FullSubmission>> {
    return get<FullSubmission, Api.SubmissionWrap>(
      this,
      {
        url: "search.json",
        params: { q: query, sort: options?.sort },
      },
      (d) => new FullSubmission(this, d.data),
      options
    );
  }

  /**
   * Search subreddits by title and description
   *
   * @param query The query to search the subreddit by
   * @param options Search options
   */
  async searchSubreddit(
    query: string,
    options?: SearchOptions
  ): Promise<Page<FullSubreddit>> {
    return get<FullSubreddit, Api.SubredditWrap>(
      this,
      {
        url: "subreddits/search.json",
        params: { q: query, sort: options?.sort },
      },
      (d) => new FullSubreddit(this, d.data),
      options
    );
  }

  async searchUser(
    query: string,
    options?: SearchOptions
  ): Promise<Page<FullUser>> {
    return get<FullUser, Api.UserWrap>(
      this,
      {
        url: "users/search.json",
        params: { q: query, sort: options?.sort },
      },
      (d) => new FullUser(this, d.data),
      options
    );
  }
}

export interface SearchOptions extends GetOptions {
  sort?: "relevance" | "activity";
}
