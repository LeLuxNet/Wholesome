import { AxiosRequestConfig } from "axios";
import Reddit from "../reddit";

type AuthConstructor = RTAuth | ClientAuth;

interface RTAuth {
  refreshToken: string;
}

interface ClientAuth {
  auth?: {
    username: string;
    password: string;
  };

  client: {
    id: string;
    secret: string;
  };
}

export default class Auth {
  accessToken: Promise<string>;
  username?: string;

  constructor(r: Reddit, data: AuthConstructor) {
    const config: AxiosRequestConfig = {
      skipAuth: true,
    };

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
        this.username = data.auth.username;
        config.data = {
          grant_type: "password",
          username: data.auth.username,
          password: data.auth.password,
        };
      }
    } else {
      config.data = {
        grant_type: "refresh_token",
        refresh_token: data.refreshToken,
      };
    }

    this.accessToken = r.api
      .post<Api.AccessToken>(
        "https://www.reddit.com/api/v1/access_token",
        config.data,
        config
      )
      .then((res) => {
        return res.data.access_token;
      });
  }
}
