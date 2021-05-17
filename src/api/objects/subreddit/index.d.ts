/// <reference path="../../index.d.ts" />
declare namespace Api {
  export type SubredditType =
    | "gold_restricted"
    | "archived"
    | "restricted"
    | "private"
    | "employees_only"
    | "gold_only"
    | "public";

  export interface SubredditWrap {
    kind: "t5";
    data: Subreddit;
  }

  export interface Subreddit extends Thing, Created {
    user_flair_background_color: null;
    submit_text_html: string;
    restrict_posting: boolean;
    content_reviewed: boolean;
    user_is_banned: null;
    free_form_reports: boolean;
    wiki_enabled: boolean;
    user_is_muted: null;
    user_can_flair_in_sr: null;
    display_name: string;
    header_img: null;
    title: string;
    allow_galleries: boolean;
    icon_size: [number, number] | null;
    primary_color: "" | string;
    active_user_count: number;
    icon_img: "" | string;
    display_name_prefixed: string;
    accounts_active: number;
    public_traffic: boolean;
    subscribers: number;
    user_flair_richtext: [];
    videostream_links_count?: number;
    quarantine: boolean;
    hide_ads: boolean;
    prediction_leaderboard_entry_type: "IN_FEED";
    emojis_enabled: boolean;
    advertiser_category: "" | string;
    public_description: "" | string;
    comment_score_hide_mins: number;
    allow_predictions: boolean;
    user_has_favorited: boolean | null;
    user_flair_template_id: null;
    community_icon: "" | string;
    banner_background_image: string;
    original_content_tag_enabled: boolean;
    submit_text: "" | string;
    description_html: string;
    spoilers_enabled: boolean;
    header_title: "" | null;
    header_size: null;
    user_flair_position: "right";
    all_original_content: boolean;
    has_menu_widget: boolean;
    is_enrolled_in_new_modmail: null;
    key_color: "" | string;
    event_posts_enabled?: boolean;
    can_assign_user_flair: boolean;
    wls: 6;
    show_media_preview: boolean;
    submission_type: "any" | "link";
    user_is_subscriber: null;
    disable_contributor_requests: boolean;
    allow_videogifs: boolean;
    user_flair_type: "text";
    allow_polls: boolean;
    collapse_deleted_comments: boolean;
    emojis_custom_size: null;
    public_description_html: string;
    allow_videos: boolean;
    is_crosspostable_subreddit: boolean;
    notification_level: null;
    can_assign_link_flair: boolean;
    accounts_active_is_fuzzed: boolean;
    submit_text_label: "" | string | null;
    link_flair_position: "left";
    user_sr_flair_enabled: null;
    user_flair_enabled_in_sr: boolean;
    allow_chat_post_creation?: boolean;
    allow_discovery: boolean;
    user_sr_theme_enabled: boolean;
    link_flair_enabled: boolean;
    subreddit_type: SubredditType;
    suggested_comment_sort: null;
    banner_img: "";
    user_flair_text: null;
    banner_background_color: "";
    show_media: boolean;
    user_is_moderator: null;
    over18: boolean;
    description: string;
    is_chat_post_feature_enabled?: boolean;
    submit_link_label: string | null;
    user_flair_text_color: null;
    restrict_commenting: boolean;
    user_flair_css_class: null;
    allow_images: boolean;
    lang: string;
    whitelist_status: WhitelistStatus;
    url: string;
    banner_size: null;
    mobile_banner_image: "" | string;
    user_is_contributor: null;
    allow_predictions_tournament: boolean;
  }
}
