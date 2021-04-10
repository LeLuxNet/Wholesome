/// <reference path="../../index.d.ts" />
declare namespace Api {
  interface UserSubreddit {
    default_set: boolean;
    user_is_contributor: boolean;
    banner_img: "" | string;
    restrict_posting: boolean;
    user_is_banned: boolean;
    free_form_reports: boolean;
    community_icon: null;
    show_media: boolean;
    icon_color: "" | string;
    user_is_muted: boolean | null;
    display_name: string;
    header_img: null;
    title: "" | string;
    previous_names: [];
    over_18: boolean;
    icon_size: [number, number];
    primary_color: "" | string;
    icon_img: string;
    description: "" | string;
    submit_link_label: "";
    header_size: null;
    restrict_commenting: boolean;
    subscribers: boolean;
    submit_text_label: "";
    is_default_icon: boolean;
    link_flair_position: "";
    display_name_prefixed: string;
    key_color: "" | string;
    name: string;
    is_default_banner: boolean;
    url: string;
    quarantine: boolean;
    banner_size: [number, number] | null;
    user_is_moderator: boolean | null;
    public_description: "" | string;
    link_flair_enabled: boolean;
    disable_contributor_requests: boolean;
    subreddit_type: "user";
    user_is_subscriber: boolean | null;
  }
}
