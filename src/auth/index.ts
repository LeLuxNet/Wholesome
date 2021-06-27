import { Scope } from "./scopes";

export type AuthData = RTAuth | ClientAuth | OAuthAuth;

interface RTAuth {
  refreshToken: string;
}

interface ClientAuth {
  auth?: {
    username: string;
    password: string;
    twoFA?: string;
  };

  client: {
    id: string;
    secret: string;
  };
}

interface OAuthAuth {
  code: string;
  redirectUri: string;

  client: {
    id: string;
    secret?: string;
  };
}

export interface Auth {
  username?: string;

  accessToken: string;
  refreshToken?: string;

  session?: AuthSession;

  scopes: "*" | Set<Scope>;
}

export interface AuthSession {
  cookie: string;
  accessToken: string;
}
