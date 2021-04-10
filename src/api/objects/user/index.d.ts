/// <reference path="../../index.d.ts" />
declare namespace Api {
  export interface UserWrap {
    kind: "t2";
    data: User;
  }

  export interface User extends Created {
    id: string;
    is_employee: boolean;
    is_friend: boolean;
    subreddit: UserSubreddit;
    snoovatar_size: [number, number] | null;
    awardee_karma: number;
    verified: boolean;
    is_gold: boolean;
    is_mod: boolean;
    awarder_karma: number;
    has_verified_email: boolean;
    icon_img: string;
    hide_from_robots: boolean;
    link_karma: number;
    pref_show_snoovatar: boolean;
    total_karma: number;
    name: string;
    snoovatar_img: "" | string;
    comment_karma: number;
    has_subscribed: boolean;
  }
}
