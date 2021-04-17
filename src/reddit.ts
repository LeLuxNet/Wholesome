import axios, { AxiosInstance, AxiosRequestConfig } from "axios";
import { Auth, AuthData } from "./auth";
import { Scope } from "./auth/scopes";
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
    const config: AxiosRequestConfig = { skipAuth: true };
    var username: string | undefined;

    if ("client" in data) {
      config.auth = {
        username: data.client.id,
        password: data.client.secret,
      };

      if (data.auth === undefined) {
        config.data = {
          grant_type: "client_credentials",
        };
      } else {
        username = data.auth.username;
        config.data = {
          grant_type: "password",
          username: data.auth.username,
          password: data.auth.twoFA
            ? `${data.auth.password}:${data.auth.twoFA}`
            : data.auth.password,
        };
      }
    } else if ("refreshToken" in data) {
      config.data = {
        grant_type: "refresh_token",
        refresh_token: data.refreshToken,
      };
    } else {
      config.data = {
        grant_type: "authorization_code",
        code: data.code,
        redirect_uri: data.redirectUri,
      };
    }

    const res = await this.api.post<Api.AccessToken>(
      "https://www.reddit.com/api/v1/access_token",
      config.data,
      config
    );

    this.auth = {
      username,
      accessToken: res.data.access_token,
    };
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

  authScope(...scopes: Scope[]) {}

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
