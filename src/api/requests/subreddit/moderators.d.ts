/// <reference path="../../index.d.ts" />
declare namespace Api {
  export interface SubredditModerators {
    kind: "UserList";
    data: {
      children: Moderator[];
    };
  }
}
