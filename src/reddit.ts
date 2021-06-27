import axios, { AxiosInstance, AxiosRequestConfig } from "axios";
import { readFile } from "fs/promises";
import { Auth, AuthData, AuthSession } from "./auth";
import { Scope } from "./auth/scopes";
import { ApiClient } from "./http/api";
import { authInterceptor } from "./http/auth";
import { bodyInterceptor } from "./http/body";
import { debugInterceptor } from "./http/debug";
import { errorInterceptor } from "./http/error";
import { fieldInterceptor } from "./http/fields";
import { get, GetOptions } from "./list/get";
import { Page } from "./list/page";
import { Award } from "./objects/award";
import { awardMap } from "./objects/award/data";
import { Collection } from "./objects/collection";
import { FullSubmission, Submission } from "./objects/post";
import { FullSubreddit, Subreddit } from "./objects/subreddit";
import { SubmissionSearchOptions } from "./objects/subreddit/small";
import { FullUser, Self, User } from "./objects/user";
import { jsonVariable } from "./utils/html";
import { unrefTimeout } from "./utils/time";

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
   * The User agent sent to reddits API. It's recommended to pass in a
   * {@link UserAgent} object instead of a raw string.
   */
  userAgent: UserAgent | string;

  /** Log debug information such as API calls to the console */
  debug?: boolean;
}

export default class Reddit {
  /** @internal */
  api: ApiClient;
  /** @internal */
  _api: AxiosInstance;

  /** @internal */
  auth?: Auth;

  linkUrl = "https://www.reddit.com";

  /** Create a `Reddit` instance */
  constructor(data: RedditConstructor) {
    this.api = new ApiClient(this);

    const headers: any = {
      "Accept-Encoding": "gzip, deflate, br",
    };

    if (typeof window === "undefined") {
      headers["User-Agent"] =
        typeof data.userAgent === "string"
          ? data.userAgent
          : generateUserAgent(data.userAgent);
    }

    this._api = axios.create({
      baseURL: "https://www.reddit.com",
      headers,
      params: { raw_json: 1 },
    });

    if (data.debug) {
      this._api.interceptors.request.use(debugInterceptor);
    }

    this._api.interceptors.request.use(fieldInterceptor);
    this._api.interceptors.request.use(bodyInterceptor);
    this._api.interceptors.request.use(authInterceptor(this));

    errorInterceptor(this._api);
  }

  async login(data?: AuthData | string): Promise<void> {
    if (typeof data !== "object") {
      if (typeof window !== "undefined") {
        throw new Error(
          "The file system can't be accessed from the browser. Please provide your login information directly."
        );
      }

      const conf = await readFile(data || "wholesome.json", "utf-8");
      data = JSON.parse(conf) as AuthData;
    }

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
    } else if ("refreshToken" in data) {
      body = {
        grant_type: "refresh_token",
        refresh_token: data.refreshToken,
      };
    } else {
      throw new Error(
        "Missing login information. Please provide 'client', 'code' or 'refreshToken'."
      );
    }

    const res = await this._api.post<Api.AccessToken>(
      "api/v1/access_token",
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
        unrefTimeout(async () => {
          const res = await this._api.post<Api.AccessToken>(
            "api/v1/access_token",
            {
              grant_type: "refresh_token",
              refresh_token: data.refresh_token,
            },
            { skipAuth: true }
          );

          if (this.auth === undefined) return;
          this.auth.accessToken = res.data.access_token;

          refresh(res.data);
        }, (data.expires_in - 30) * 1000) as any;
      };

      refresh(res.data);
    } else {
      unrefTimeout(
        () => (this.auth = undefined),
        res.data.expires_in * 1000
      ) as any;
    }

    let session: AuthSession | undefined;
    if ("auth" in data && data.auth) {
      const res = await this._api.post<Api.FormWrap<Api.FormLogin>>(
        "api/login",
        {
          op: "login",
          user: data.auth.username,
          passwd: data.auth.twoFA
            ? `${data.auth.password}:${data.auth.twoFA}`
            : data.auth.password,
          rem: "yes",
        },
        { skipAuth: true }
      );

      const { cookie } = res.data.json.data;

      const res2 = await this._api.get<string>("chat/minimize", {
        headers: {
          Cookie: `reddit_session=${cookie}`,
        },
        skipAuth: true,
      });
      const data2 = jsonVariable("___r", res2.data);

      session = {
        cookie,
        accessToken: data2.user.session.accessToken,
      };
    }

    this.auth = {
      username,

      accessToken: res.data.access_token,
      refreshToken: res.data.refresh_token,

      session,

      scopes,
    };

    if ("code" in data && (scopes === "*" || scopes.has("identity"))) {
      const res2 = await this._api.get("api/v1/me");
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
      throw new Error(
        `You are missing the ${needed.join(", ")} scope${
          needed.length === 1 ? "" : "s"
        }`
      );
  }

  /** @internal */
  get needAuth(): Auth {
    if (!this.auth)
      throw new Error("You need to be authenticated to use this function");
    return this.auth;
  }

  /** @internal */
  get needUsername(): string {
    if (!this.auth || !this.auth.username)
      throw new Error("You need to be authenticated with a user");
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
    const res = await this._api.get<Api.Listing<Api.SubmissionWrap>>(
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
    const res = await this._api.get<Api.Collection>(
      "api/v1/collections/collection.json",
      { params: { collection_id: id, include_links: 0 } }
    );
    return new Collection(this, res.data);
  }

  async award(id: string): Promise<Award | null> {
    const sid = awardMap[id];
    if (!sid) return null;

    const res = await this._api.get<Api.Listing<Api.SubmissionWrap>>(
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
    const res = await this._api.get<Api.TrendingSubreddits>(
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

  /**
   * Detects whether the browser is logged in on
   * [reddit.com](https://www.reddit.com). This works cross-origin.
   *
   * :::note
   *
   * This is a browser-only function can not be used in an Node.js environment.
   *
   * :::
   *
   * @example
   *
   * ```ts
   * // The browser is logged in on reddit.com
   * await Reddit.loggedIn(); // true
   *
   * // The browser isn't logged in on reddit.com or the check failed
   * await Reddit.loggedIn(); // false
   * ```
   */
  static loggedIn(): Promise<boolean> {
    if (typeof window === "undefined") {
      throw new Error(
        "This is a browser-only function can not be used in an Node.js environment."
      );
    }

    const image = new Image();

    const p = new Promise<boolean>((resolve) => {
      image.onload = () => resolve(true);
      image.onerror = () => resolve(false);
    });

    const redirect = "/favicon.ico";

    image.src = `https://old.reddit.com/login?dest=${encodeURIComponent(
      redirect
    )}`;

    return p;
  }
}

export interface SearchOptions extends GetOptions {
  sort?: "relevance" | "activity";
}
