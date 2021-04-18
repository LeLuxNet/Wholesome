import axios, { AxiosInstance, AxiosRequestConfig } from "axios";
import { Auth, AuthData } from "./auth";
import { Scope } from "./auth/scopes";
import authInterceptor from "./http/auth";
import bodyInterceptor from "./http/body";
import debugInterceptor from "./http/debug";
import errorInterceptor from "./http/error";
import fieldInterceptor from "./http/fields";
import { Submission } from "./objects/post";
import Self from "./objects/self";
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

  linkUrl: string = "https://www.reddit.com";

  constructor(data: RedditConstructor) {
    this.api = axios.create({
      baseURL: "https://www.reddit.com",
      headers: data.browser ? undefined : { "User-Agent": data.userAgent },
      params: { raw_json: 1 },
    });

    if (data.debug) {
      this.api.interceptors.request.use(debugInterceptor);
    }

    this.api.interceptors.request.use(fieldInterceptor);
    this.api.interceptors.request.use(bodyInterceptor);
    this.api.interceptors.request.use(authInterceptor(this));

    this.api.interceptors.response.use(errorInterceptor);
  }

  async login(data: AuthData) {
    var body: any;
    const config: AxiosRequestConfig = { skipAuth: true };
    var username: string | undefined;

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
      setTimeout(() => (this.auth = undefined)).unref();
    }

    this.auth = {
      username,
      accessToken: res.data.access_token,
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
  ) {
    return `https://www.reddit.com/api/v1/authorize?client_id=${encodeURIComponent(
      clientId
    )}&response_type=code&state=+&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&duration=${temporary ? "temporary" : "permanent"}&scope=${scopes.join(
      "+"
    )}`;
  }

  needScopes(...scopes: Scope[]) {
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

  get needAuth() {
    if (!this.auth) throw "You need to be authenticated to use this function";
    return this.auth;
  }

  get needUsername() {
    if (!this.auth || !this.auth.username)
      throw "You need to be authenticated with a user";
    return this.auth.username;
  }

  submission(id: string) {
    if (id.startsWith("t3_")) id = id.slice(3);
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

  get self() {
    if (!this.auth) return null;
    return new Self(this, this.auth.username);
  }

  async trendingSubreddits() {
    // This endpoint only exists on www.reddit.com not on oauth.reddit.com
    const res = await this.api.get<Api.TrendingSubreddits>(
      "https://www.reddit.com/api/trending_subreddits.json"
    );
    return res.data.subreddit_names.map((n) => this.subreddit(n));
  }
}
