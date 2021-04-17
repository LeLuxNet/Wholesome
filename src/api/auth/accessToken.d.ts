/// <reference path="../index.d.ts" />

declare namespace Api {
  export interface AccessToken {
    access_token: string;
    token_type: "bearer";
    expires_in: number;
    refresh_token?: string;
    scope: string;
  }
}
