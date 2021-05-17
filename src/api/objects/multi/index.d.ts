/// <reference path="../../index.d.ts" />
declare namespace Api {
  export interface MultiWrap {
    kind: "LabeledMulti";
    data: Multi;
  }

  export interface Multi extends Created {
    can_edit: boolean;
    display_name: string;
    name: string;
    description_html: "" | string;
    num_subscribers: number;
    copied_from: null;
    icon_url: string;
    subreddits: MultiSubreddit[];
    visibility: "public" | "private";
    over_18: boolean;
    path: string;
    owner: string;
    key_color: null;
    is_subscriber: boolean;
    owner_id: string;
    description_md: "" | string;
    is_favorited: boolean;
  }

  interface MultiSubreddit {
    name: string;
  }
}
